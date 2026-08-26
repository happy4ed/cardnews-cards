import type { HomeAssistant } from './types.js';

/**
 * Minimal HA-style Jinja2 template evaluator.
 *
 * Supports:
 *   {{ states('entity_id') }}                        → entity state string
 *   {{ state_attr('entity','attr') }}                → attribute value
 *   {{ count_on(['ent1','ent2', ...]) }}             → number of entities in 'on' state
 *   {{ is_state('entity','value') }}                 → boolean
 *   {{ expr | round }} / {{ expr | round(1) }}       → round numeric filter
 *   {{ expr | int }}                                 → int filter
 *   {% if <cond> %}A{% else %}B{% endif %}           → simple if/else (no elif nesting)
 *
 *   <cond> supports:
 *     is_state('e','v')
 *     count_on([...]) > N   (also <, >=, <=, ==, !=)
 *     states('e') == 'v'
 *
 * This is NOT a full Jinja2 implementation — just enough for card titles/subtitles.
 * Missing entities yield "" (state) or 0 (count_on) so templates degrade quietly.
 */

const ON_STATES = new Set(['on', 'home', 'open', 'playing', 'cleaning', 'active']);

function safeState(hass: HomeAssistant | undefined, entityId: string): string {
  if (!hass) return '';
  const e = hass.states?.[entityId];
  return e ? String(e.state) : '';
}

function safeAttr(hass: HomeAssistant | undefined, entityId: string, attr: string): string {
  if (!hass) return '';
  const e = hass.states?.[entityId];
  if (!e) return '';
  const v = (e.attributes as Record<string, unknown>)[attr];
  return v === undefined || v === null ? '' : String(v);
}

function countOn(hass: HomeAssistant | undefined, ids: string[]): number {
  if (!hass) return 0;
  let n = 0;
  for (const id of ids) {
    const e = hass.states?.[id];
    if (e && ON_STATES.has(String(e.state))) n++;
  }
  return n;
}

function isState(hass: HomeAssistant | undefined, entityId: string, val: string): boolean {
  return safeState(hass, entityId) === val;
}

/** Parse `['a','b','c']` (or `["a","b"]`) into a string[]. */
function parseIdList(raw: string): string[] {
  const trimmed = raw.trim().replace(/^\[|\]$/g, '');
  if (!trimmed) return [];
  return trimmed
    .split(',')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
}

function stripQuotes(s: string): string {
  return s.trim().replace(/^['"]|['"]$/g, '');
}

/** Evaluate a single "value expression" (right side of `{{ ... }}` or in cond). */
function evalValue(hass: HomeAssistant | undefined, raw: string, vars: Record<string, string | number | boolean> = {}): string | number | boolean {
  const src = raw.trim();

  // Logical: A or B  (short-circuit, jinja-style: return first truthy)
  {
    const orIdx = findTopLevelOp(src, ' or ');
    if (orIdx >= 0) {
      const left = evalValue(hass, src.slice(0, orIdx).trim(), vars);
      const s = String(left);
      const truthy = left !== '' && left !== false && left !== 0 && s !== '' && s !== 'None' && s !== 'null' && s !== 'undefined' && s !== 'unknown' && s !== 'unavailable';
      if (truthy) return left;
      return evalValue(hass, src.slice(orIdx + 4).trim(), vars);
    }
  }
  // Logical: A and B (return first falsy, else last)
  {
    const andIdx = findTopLevelOp(src, ' and ');
    if (andIdx >= 0) {
      const left = evalValue(hass, src.slice(0, andIdx).trim(), vars);
      const s = String(left);
      const truthy = left !== '' && left !== false && left !== 0 && s !== '' && s !== 'None' && s !== 'null' && s !== 'undefined' && s !== 'unknown' && s !== 'unavailable';
      if (!truthy) return left;
      return evalValue(hass, src.slice(andIdx + 5).trim(), vars);
    }
  }

  // Filters: expr | round(1) | int
  const pipeIdx = findTopLevelPipe(src);
  if (pipeIdx >= 0) {
    const base = src.slice(0, pipeIdx).trim();
    const rest = src.slice(pipeIdx + 1).trim();
    const val = evalValue(hass, base, vars);
    return applyFilter(val, rest, hass, vars);
  }

  // states('x')
  let m = src.match(/^states\(\s*['"]([^'"]+)['"]\s*\)$/);
  if (m) return safeState(hass, m[1]);

  // state_attr('x','y')
  m = src.match(/^state_attr\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)$/);
  if (m) return safeAttr(hass, m[1], m[2]);

  // count_on([...])
  m = src.match(/^count_on\(\s*(\[[^\]]*\])\s*\)$/);
  if (m) return countOn(hass, parseIdList(m[1]));

  // is_state('x','y')
  m = src.match(/^is_state\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)$/);
  if (m) return isState(hass, m[1], m[2]);

  // Bare string literal
  if (/^['"].*['"]$/.test(src)) return stripQuotes(src);


  // Variable reference from {% set %} scope
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(src) && Object.prototype.hasOwnProperty.call(vars, src)) {
    return vars[src];
  }
  // Bare number
  const num = Number(src);
  if (!Number.isNaN(num) && src !== '') return num;

  // Fallback: literal
  return src;
}

function findTopLevelPipe(src: string): number {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === '|' && depth === 0) return i;
  }
  return -1;
}

function applyFilter(val: string | number | boolean, filterExpr: string, hass?: HomeAssistant, vars: Record<string, string | number | boolean> = {}): string | number {
  // Support chained filters:  round | int
  const pipeIdx = findTopLevelPipe(filterExpr);
  let first = filterExpr;
  let rest = '';
  if (pipeIdx >= 0) {
    first = filterExpr.slice(0, pipeIdx).trim();
    rest = filterExpr.slice(pipeIdx + 1).trim();
  }
  const m = first.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?:\((.*)\))?$/);
  if (!m) return String(val);
  const name = m[1];
  const arg = m[2]?.trim();
  const num = Number(val);
  let out: string | number = String(val);
  if (name === 'round') {
    const digits = arg ? parseInt(arg, 10) : 0;
    if (!Number.isFinite(num)) out = 0;
    else {
      const p = Math.pow(10, digits);
      out = Math.round(num * p) / p;
    }
  } else if (name === 'int') {
    out = Number.isFinite(num) ? Math.trunc(num) : 0;
  } else if (name === 'float') {
    out = Number.isFinite(num) ? num : 0;
  } else if (name === 'minutes_until') {
    // Parse ISO datetime string; return minutes from now (rounded).
    // Returns '-' if unparseable, '곧' if <1, 'N분' otherwise.
    const t = Date.parse(String(val));
    if (!Number.isFinite(t)) out = '-';
    else {
      const mins = Math.round((t - Date.now()) / 60000);
      if (mins <= 0) out = '곧';
      else out = mins + '분';
    }
  } else if (name === 'comma') {
    // Format integer with thousand separators. Non-numeric → passthrough.
    if (!Number.isFinite(num)) out = String(val);
    else out = Math.trunc(num).toLocaleString('en-US');
  } else if (name === 'secs_min') {
    // Seconds → Korean minute label. 0/negative → '-', <60 → '곧', else → 'N분'.
    if (!Number.isFinite(num) || num <= 0) out = '-';
    else if (num < 60) out = '곧';
    else out = Math.round(num / 60) + '분';
  } else if (name === 'default') {
    if (val === '' || val === undefined || val === null) {
      out = arg ? stripQuotes(arg) : '';
    }
  }
  if (rest) return applyFilter(out, rest, hass, vars);
  return out;
}

/** Evaluate a conditional expression → boolean. */
function evalCond(hass: HomeAssistant | undefined, raw: string, vars: Record<string, string | number | boolean> = {}): boolean {
  const src = raw.trim();
  // Comparison operators (order matters — longest first)
  const ops = ['>=', '<=', '==', '!=', '>', '<'];
  for (const op of ops) {
    const idx = findTopLevelOp(src, op);
    if (idx >= 0) {
      const left = evalValue(hass, src.slice(0, idx).trim(), vars);
      const right = evalValue(hass, src.slice(idx + op.length).trim(), vars);
      const ln = Number(left);
      const rn = Number(right);
      const bothNum = Number.isFinite(ln) && Number.isFinite(rn);
      switch (op) {
        case '>': return bothNum ? ln > rn : String(left) > String(right);
        case '<': return bothNum ? ln < rn : String(left) < String(right);
        case '>=': return bothNum ? ln >= rn : String(left) >= String(right);
        case '<=': return bothNum ? ln <= rn : String(left) <= String(right);
        case '==': return bothNum ? ln === rn : String(left) === String(right);
        case '!=': return bothNum ? ln !== rn : String(left) !== String(right);
      }
    }
  }
  // Bare expression - truthy if non-empty and not "false" / "0"
  const v = evalValue(hass, src, vars);
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v).toLowerCase();
  return !!s && s !== 'false' && s !== '0' && s !== 'off' && s !== 'unknown' && s !== 'unavailable';
}

function findTopLevelOp(src: string, op: string): number {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = 0; i <= src.length - op.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (depth === 0 && src.substr(i, op.length) === op) {
      // Avoid matching '>' inside '>=' or '<=' etc — checked because we try longest first
      return i;
    }
  }
  return -1;
}


/** Convert `{% set var = expr %}` blocks into a local scope map, and inline
 *  substitute `{{ var }}` / `{{ var | filter }}` occurrences before evaluation. */
function extractSets(src: string, hass: HomeAssistant | undefined): { src: string; vars: Record<string, string | number | boolean> } {
  const vars: Record<string, string | number | boolean> = {};
  const setRe = /\{%\s*set\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^%]+?)\s*%\}/g;
  const stripped = src.replace(setRe, (_m, name: string, expr: string) => {
    try { vars[name] = evalValue(hass, expr, vars); } catch { vars[name] = ''; }
    return '';
  });
  return { src: stripped, vars };
}

/** Expand elif chains into nested if/else — preserves elif-free ifs untouched. */
function expandElifChains(src: string): string {
  const tagRe = /\{%\s*(if|elif|else|endif)\b([^%]*)%\}/g;
  const tokens: Array<{ kind: string; args: string; start: number; end: number }> = [];
  let tm: RegExpExecArray | null;
  while ((tm = tagRe.exec(src)) !== null) {
    tokens.push({ kind: tm[1], args: tm[2].trim(), start: tm.index, end: tm.index + tm[0].length });
  }
  if (tokens.length === 0) return src;

  // Walk tokens; for each top-level if containing elif, rewrite.
  // Use a recursive descent by index.
  interface IfBlock { start: number; end: number; segments: Array<{ kind: string; args: string; bodyStart: number; bodyEnd: number }>; hasElif: boolean; }
  const stack: Array<{ tokenIdx: number; segments: IfBlock['segments'] }> = [];
  const blocks: IfBlock[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind === 'if') {
      stack.push({ tokenIdx: i, segments: [{ kind: 'if', args: t.args, bodyStart: t.end, bodyEnd: -1 }] });
    } else if (t.kind === 'elif' || t.kind === 'else') {
      if (stack.length === 0) continue;
      const top = stack[stack.length - 1];
      top.segments[top.segments.length - 1].bodyEnd = t.start;
      top.segments.push({ kind: t.kind, args: t.args, bodyStart: t.end, bodyEnd: -1 });
    } else if (t.kind === 'endif') {
      if (stack.length === 0) continue;
      const top = stack.pop()!;
      top.segments[top.segments.length - 1].bodyEnd = t.start;
      const openTok = tokens[top.tokenIdx];
      blocks.push({
        start: openTok.start,
        end: t.end,
        segments: top.segments,
        hasElif: top.segments.some((s) => s.kind === 'elif'),
      });
    }
  }
  // Rewrite blocks that have elif; process in reverse order to preserve indices.
  const targets = blocks.filter((b) => b.hasElif).sort((a, b) => b.start - a.start);
  for (const b of targets) {
    let rewritten = '';
    let closes = 0;
    for (let s = 0; s < b.segments.length; s++) {
      const seg = b.segments[s];
      const body = src.slice(seg.bodyStart, seg.bodyEnd);
      if (seg.kind === 'if') rewritten += `{% if ${seg.args.trim()} %}` + body;
      else if (seg.kind === 'elif') {
        rewritten += `{% else %}{% if ${seg.args.trim()} %}` + body;
        closes++;
      } else if (seg.kind === 'else') {
        rewritten += `{% else %}` + body;
      }
    }
    rewritten += '{% endif %}';
    for (let c = 0; c < closes; c++) rewritten += '{% endif %}';
    src = src.slice(0, b.start) + rewritten + src.slice(b.end);
  }
  return src;
}

/**
 * Main entrypoint. Evaluate a template string against hass state.
 * Returns the rendered string. Undefined template → "".
 */
export function evaluateTemplate(template: string | undefined, hass?: HomeAssistant): string {
  if (!template) return '';
  // 0) Extract {% set var = expr %} into scope
  const { src: afterSets, vars } = extractSets(template, hass);
  // 1) Expand {% elif %} chains into nested if/else so the simple regex below works.
  let src = expandElifChains(afterSets);

  // 2) Handle {% if COND %}A{% else %}B{% endif %} — simple, non-nested (inner first).
  const IF_RE = /\{%\s*if\s+([^%]+?)\s*%\}((?:(?!\{%\s*if\s)[\s\S])*?)(?:\{%\s*else\s*%\}((?:(?!\{%\s*if\s)[\s\S])*?))?\{%\s*endif\s*%\}/;
  let guard = 0;
  while (IF_RE.test(src) && guard++ < 128) {
    src = src.replace(IF_RE, (_m, cond: string, ifBody: string, elseBody?: string) => {
      const b = evalCond(hass, cond, vars);
      return b ? ifBody : (elseBody ?? '');
    });
  }

  // 3) Replace all {{ expr }} occurrences.
  src = src.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g, (_m, expr: string) => {
    try {
      const v = evalValue(hass, expr, vars);
      return String(v);
    } catch {
      return '';
    }
  });

  return src;
}
