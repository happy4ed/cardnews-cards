function t(t,e,i,n){var s,a=arguments.length,o=a<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,n);else for(var r=t.length-1;r>=0;r--)(s=t[r])&&(o=(a<3?s(o):a>3?s(e,i,o):s(e,i))||o);return a>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),s=new WeakMap;let a=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const o=t=>new a("string"==typeof t?t:t+"",void 0,n),r=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[n+1],t[0]);return new a(i,t,n)},c=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return o(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:h,getOwnPropertyNames:p,getOwnPropertySymbols:m,getPrototypeOf:u}=Object,g=globalThis,_=g.trustedTypes,b=_?_.emptyScript:"",f=g.reactiveElementPolyfillSupport,v=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?b:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),w={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(t,i,e);void 0!==n&&d(this.prototype,t,n)}}static getPropertyDescriptor(t,e,i){const{get:n,set:s}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:n,set(e){const a=n?.call(this);s?.call(this,e),this.requestUpdate(t,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...p(t),...m(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(c(t))}else void 0!==t&&e.push(c(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,n)=>{if(i)t.adoptedStyleSheets=n.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of n){const n=document.createElement("style"),s=e.litNonce;void 0!==s&&n.setAttribute("nonce",s),n.textContent=i.cssText,t.appendChild(n)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,i);if(void 0!==n&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(n):this.setAttribute(n,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,n=i._$Eh.get(t);if(void 0!==n&&this._$Em!==n){const t=i.getPropertyOptions(n),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=n;const a=s.fromAttribute(e,t.type);this[n]=a??this._$Ej?.get(n)??a,this._$Em=null}}requestUpdate(t,e,i,n=!1,s){if(void 0!==t){const a=this.constructor;if(!1===n&&(s=this[t]),i??=a.getPropertyOptions(t),!((i.hasChanged??x)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:n,wrapped:s},a){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??e??this[t]),!0!==s||void 0!==a)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===n&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,n=this[e];!0!==t||this._$AL.has(e)||void 0===n||this.C(e,void 0,i,n)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[v("elementProperties")]=new Map,$[v("finalized")]=new Map,f?.({ReactiveElement:$}),(g.reactiveElementVersions??=[]).push("2.1.2");const k=globalThis,S=t=>t,C=k.trustedTypes,E=C?C.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,L="?"+M,N=`<${L}>`,T=document,z=()=>T.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,I=Array.isArray,H="[ \t\n\f\r]",j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,R=/>/g,O=RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,B=/"/g,U=/^(?:script|style|textarea|title)$/i,V=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),K=V(1),W=V(2),q=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),Y=new WeakMap,Z=T.createTreeWalker(T,129);function X(t,e){if(!I(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,n=[];let s,a=2===e?"<svg>":3===e?"<math>":"",o=j;for(let e=0;e<i;e++){const i=t[e];let r,c,l=-1,d=0;for(;d<i.length&&(o.lastIndex=d,c=o.exec(i),null!==c);)d=o.lastIndex,o===j?"!--"===c[1]?o=D:void 0!==c[1]?o=R:void 0!==c[2]?(U.test(c[2])&&(s=RegExp("</"+c[2],"g")),o=O):void 0!==c[3]&&(o=O):o===O?">"===c[0]?(o=s??j,l=-1):void 0===c[1]?l=-2:(l=o.lastIndex-c[2].length,r=c[1],o=void 0===c[3]?O:'"'===c[3]?B:F):o===B||o===F?o=O:o===D||o===R?o=j:(o=O,s=void 0);const h=o===O&&t[e+1].startsWith("/>")?" ":"";a+=o===j?i+N:l>=0?(n.push(r),i.slice(0,l)+A+i.slice(l)+M+h):i+M+(-2===l?e:h)}return[X(t,a+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),n]};class Q{constructor({strings:t,_$litType$:e},i){let n;this.parts=[];let s=0,a=0;const o=t.length-1,r=this.parts,[c,l]=J(t,e);if(this.el=Q.createElement(c,i),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(n=Z.nextNode())&&r.length<o;){if(1===n.nodeType){if(n.hasAttributes())for(const t of n.getAttributeNames())if(t.endsWith(A)){const e=l[a++],i=n.getAttribute(t).split(M),o=/([.?@])?(.*)/.exec(e);r.push({type:1,index:s,name:o[2],strings:i,ctor:"."===o[1]?st:"?"===o[1]?at:"@"===o[1]?ot:nt}),n.removeAttribute(t)}else t.startsWith(M)&&(r.push({type:6,index:s}),n.removeAttribute(t));if(U.test(n.tagName)){const t=n.textContent.split(M),e=t.length-1;if(e>0){n.textContent=C?C.emptyScript:"";for(let i=0;i<e;i++)n.append(t[i],z()),Z.nextNode(),r.push({type:2,index:++s});n.append(t[e],z())}}}else if(8===n.nodeType)if(n.data===L)r.push({type:2,index:s});else{let t=-1;for(;-1!==(t=n.data.indexOf(M,t+1));)r.push({type:7,index:s}),t+=M.length-1}s++}}static createElement(t,e){const i=T.createElement("template");return i.innerHTML=t,i}}function tt(t,e,i=t,n){if(e===q)return e;let s=void 0!==n?i._$Co?.[n]:i._$Cl;const a=P(e)?void 0:e._$litDirective$;return s?.constructor!==a&&(s?._$AO?.(!1),void 0===a?s=void 0:(s=new a(t),s._$AT(t,i,n)),void 0!==n?(i._$Co??=[])[n]=s:i._$Cl=s),void 0!==s&&(e=tt(t,s._$AS(t,e.values),s,n)),e}class et{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,n=(t?.creationScope??T).importNode(e,!0);Z.currentNode=n;let s=Z.nextNode(),a=0,o=0,r=i[0];for(;void 0!==r;){if(a===r.index){let e;2===r.type?e=new it(s,s.nextSibling,this,t):1===r.type?e=new r.ctor(s,r.name,r.strings,this,t):6===r.type&&(e=new rt(s,this,t)),this._$AV.push(e),r=i[++o]}a!==r?.index&&(s=Z.nextNode(),a++)}return Z.currentNode=T,n}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class it{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,n){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=tt(this,t,e),P(t)?t===G||null==t||""===t?(this._$AH!==G&&this._$AR(),this._$AH=G):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>I(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==G&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(T.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,n="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Q.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(e);else{const t=new et(n,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=Y.get(t.strings);return void 0===e&&Y.set(t.strings,e=new Q(t)),e}k(t){I(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,n=0;for(const s of t)n===e.length?e.push(i=new it(this.O(z()),this.O(z()),this,this.options)):i=e[n],i._$AI(s),n++;n<e.length&&(this._$AR(i&&i._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=S(t).nextSibling;S(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class nt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,n,s){this.type=1,this._$AH=G,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(t,e=this,i,n){const s=this.strings;let a=!1;if(void 0===s)t=tt(this,t,e,0),a=!P(t)||t!==this._$AH&&t!==q,a&&(this._$AH=t);else{const n=t;let o,r;for(t=s[0],o=0;o<s.length-1;o++)r=tt(this,n[i+o],e,o),r===q&&(r=this._$AH[o]),a||=!P(r)||r!==this._$AH[o],r===G?t=G:t!==G&&(t+=(r??"")+s[o+1]),this._$AH[o]=r}a&&!n&&this.j(t)}j(t){t===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends nt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===G?void 0:t}}class at extends nt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==G)}}class ot extends nt{constructor(t,e,i,n,s){super(t,e,i,n,s),this.type=5}_$AI(t,e=this){if((t=tt(this,t,e,0)??G)===q)return;const i=this._$AH,n=t===G&&i!==G||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==G&&(i===G||n);n&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){tt(this,t)}}const ct=k.litHtmlPolyfillSupport;ct?.(Q,it),(k.litHtmlVersions??=[]).push("3.3.3");const lt=globalThis;let dt=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const n=i?.renderBefore??e;let s=n._$litPart$;if(void 0===s){const t=i?.renderBefore??null;n._$litPart$=s=new it(e.insertBefore(z(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}};dt._$litElement$=!0,dt.finalized=!0,lt.litElementHydrateSupport?.({LitElement:dt});const ht=lt.litElementPolyfillSupport;ht?.({LitElement:dt}),(lt.litElementVersions??=[]).push("4.2.2");const pt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},mt={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:x},ut=(t=mt,e,i)=>{const{kind:n,metadata:s}=i;let a=globalThis.litPropertyMetadata.get(s);if(void 0===a&&globalThis.litPropertyMetadata.set(s,a=new Map),"setter"===n&&((t=Object.create(t)).wrapped=!0),a.set(i.name,t),"accessor"===n){const{name:n}=i;return{set(i){const s=e.get.call(this);e.set.call(this,i),this.requestUpdate(n,s,t,!0,i)},init(e){return void 0!==e&&this.C(n,void 0,t,e),e}}}if("setter"===n){const{name:n}=i;return function(i){const s=this[n];e.call(this,i),this.requestUpdate(n,s,t,!0,i)}}throw Error("Unsupported decorator location: "+n)};function gt(t){return(e,i)=>"object"==typeof i?ut(t,e,i):((t,e,i)=>{const n=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),n?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function _t(t){return gt({...t,state:!0,attribute:!1})}const bt=t=>(...e)=>({_$litDirective$:t,values:e});let ft=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const vt=bt(class extends ft{constructor(t){if(super(t),1!==t.type||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t)));for(const t in e)e[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(e)}const i=t.element.classList;for(const t of this.st)t in e||(i.remove(t),this.st.delete(t));for(const t in e){const n=!!e[t];n===this.st.has(t)||this.nt?.has(t)||(n?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)))}return q}}),yt="important",xt=" !"+yt,wt=bt(class extends ft{constructor(t){if(super(t),1!==t.type||"style"!==t.name||t.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,i)=>{const n=t[i];return null==n?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${n};`},"")}update(t,[e]){const{style:i}=t.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(e)),this.render(e);for(const t of this.ft)null==e[t]&&(this.ft.delete(t),t.includes("-")?i.removeProperty(t):i[t]=null);for(const t in e){const n=e[t];if(null!=n){this.ft.add(t);const e="string"==typeof n&&n.endsWith(xt);t.includes("-")||e?i.setProperty(t,e?n.slice(0,-11):n,e?yt:""):i[t]=n}}return q}}),$t=new Set(["on","home","open","playing","cleaning","active"]);function kt(t,e){if(!t)return"";const i=t.states?.[e];return i?String(i.state):""}function St(t){return t.trim().replace(/^['"]|['"]$/g,"")}function Ct(t,e,i={}){const n=e.trim();{const e=Lt(n," or ");if(e>=0){const s=Ct(t,n.slice(0,e).trim(),i),a=String(s);return""!==s&&!1!==s&&0!==s&&""!==a&&"None"!==a&&"null"!==a&&"undefined"!==a&&"unknown"!==a&&"unavailable"!==a?s:Ct(t,n.slice(e+4).trim(),i)}}{const e=Lt(n," and ");if(e>=0){const s=Ct(t,n.slice(0,e).trim(),i),a=String(s);return""!==s&&!1!==s&&0!==s&&""!==a&&"None"!==a&&"null"!==a&&"undefined"!==a&&"unknown"!==a&&"unavailable"!==a?Ct(t,n.slice(e+5).trim(),i):s}}const s=Et(n);if(s>=0){const e=n.slice(0,s).trim(),a=n.slice(s+1).trim();return At(Ct(t,e,i),a,t,i)}let a=n.match(/^states\(\s*['"]([^'"]+)['"]\s*\)$/);if(a)return kt(t,a[1]);if(a=n.match(/^state_attr\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)$/),a)return function(t,e,i){if(!t)return"";const n=t.states?.[e];if(!n)return"";const s=n.attributes[i];return null==s?"":String(s)}(t,a[1],a[2]);if(a=n.match(/^count_on\(\s*(\[[^\]]*\])\s*\)$/),a)return function(t,e){if(!t)return 0;let i=0;for(const n of e){const e=t.states?.[n];e&&$t.has(String(e.state))&&i++}return i}(t,function(t){const e=t.trim().replace(/^\[|\]$/g,"");return e?e.split(",").map(t=>t.trim().replace(/^['"]|['"]$/g,"")).filter(Boolean):[]}(a[1]));if(a=n.match(/^is_state\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)$/),a)return function(t,e,i){return kt(t,e)===i}(t,a[1],a[2]);if(/^['"].*['"]$/.test(n))return St(n);if(/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(n)&&Object.prototype.hasOwnProperty.call(i,n))return i[n];const o=Number(n);return Number.isNaN(o)||""===n?n:o}function Et(t){let e=0,i=null;for(let n=0;n<t.length;n++){const s=t[n];if(i)s===i&&(i=null);else if('"'!==s&&"'"!==s){if("("===s||"["===s)e++;else if(")"===s||"]"===s)e--;else if("|"===s&&0===e)return n}else i=s}return-1}function At(t,e,i,n={}){const s=Et(e);let a=e,o="";s>=0&&(a=e.slice(0,s).trim(),o=e.slice(s+1).trim());const r=a.match(/^([a-zA-Z_][a-zA-Z0-9_]*)(?:\((.*)\))?$/);if(!r)return String(t);const c=r[1],l=r[2]?.trim(),d=Number(t);let h=String(t);if("round"===c){const t=l?parseInt(l,10):0;if(Number.isFinite(d)){const e=Math.pow(10,t);h=Math.round(d*e)/e}else h=0}else if("int"===c)h=Number.isFinite(d)?Math.trunc(d):0;else if("float"===c)h=Number.isFinite(d)?d:0;else if("minutes_until"===c){const e=Date.parse(String(t));if(Number.isFinite(e)){const t=Math.round((e-Date.now())/6e4);h=t<=0?"곧":t+"분"}else h="-"}else"comma"===c?h=Number.isFinite(d)?Math.trunc(d).toLocaleString("en-US"):String(t):"secs_min"===c?h=!Number.isFinite(d)||d<=0?"-":d<60?"곧":Math.round(d/60)+"분":"default"===c&&(""!==t&&null!=t||(h=l?St(l):""));return o?At(h,o,i,n):h}function Mt(t,e,i={}){const n=e.trim(),s=[">=","<=","==","!=",">","<"];for(const e of s){const s=Lt(n,e);if(s>=0){const a=Ct(t,n.slice(0,s).trim(),i),o=Ct(t,n.slice(s+e.length).trim(),i),r=Number(a),c=Number(o),l=Number.isFinite(r)&&Number.isFinite(c);switch(e){case">":return l?r>c:String(a)>String(o);case"<":return l?r<c:String(a)<String(o);case">=":return l?r>=c:String(a)>=String(o);case"<=":return l?r<=c:String(a)<=String(o);case"==":return l?r===c:String(a)===String(o);case"!=":return l?r!==c:String(a)!==String(o)}}}const a=Ct(t,n,i);if("boolean"==typeof a)return a;if("number"==typeof a)return 0!==a;const o=String(a).toLowerCase();return!!o&&"false"!==o&&"0"!==o&&"off"!==o&&"unknown"!==o&&"unavailable"!==o}function Lt(t,e){let i=0,n=null;for(let s=0;s<=t.length-e.length;s++){const a=t[s];if(n)a===n&&(n=null);else if('"'!==a&&"'"!==a){if("("===a||"["===a)i++;else if(")"===a||"]"===a)i--;else if(0===i&&t.substr(s,e.length)===e)return s}else n=a}return-1}function Nt(t,e){if(!t)return"";const{src:i,vars:n}=function(t,e){const i={};return{src:t.replace(/\{%\s*set\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^%]+?)\s*%\}/g,(t,n,s)=>{try{i[n]=Ct(e,s,i)}catch{i[n]=""}return""}),vars:i}}(t,e);let s=function(t){const e=/\{%\s*(if|elif|else|endif)\b([^%]*)%\}/g,i=[];let n;for(;null!==(n=e.exec(t));)i.push({kind:n[1],args:n[2].trim(),start:n.index,end:n.index+n[0].length});if(0===i.length)return t;const s=[],a=[];for(let t=0;t<i.length;t++){const e=i[t];if("if"===e.kind)s.push({tokenIdx:t,segments:[{kind:"if",args:e.args,bodyStart:e.end,bodyEnd:-1}]});else if("elif"===e.kind||"else"===e.kind){if(0===s.length)continue;const t=s[s.length-1];t.segments[t.segments.length-1].bodyEnd=e.start,t.segments.push({kind:e.kind,args:e.args,bodyStart:e.end,bodyEnd:-1})}else if("endif"===e.kind){if(0===s.length)continue;const t=s.pop();t.segments[t.segments.length-1].bodyEnd=e.start;const n=i[t.tokenIdx];a.push({start:n.start,end:e.end,segments:t.segments,hasElif:t.segments.some(t=>"elif"===t.kind)})}}const o=a.filter(t=>t.hasElif).sort((t,e)=>e.start-t.start);for(const e of o){let i="",n=0;for(let s=0;s<e.segments.length;s++){const a=e.segments[s],o=t.slice(a.bodyStart,a.bodyEnd);"if"===a.kind?i+=`{% if ${a.args.trim()} %}`+o:"elif"===a.kind?(i+=`{% else %}{% if ${a.args.trim()} %}`+o,n++):"else"===a.kind&&(i+="{% else %}"+o)}i+="{% endif %}";for(let t=0;t<n;t++)i+="{% endif %}";t=t.slice(0,e.start)+i+t.slice(e.end)}return t}(i);const a=/\{%\s*if\s+([^%]+?)\s*%\}((?:(?!\{%\s*if\s)[\s\S])*?)(?:\{%\s*else\s*%\}((?:(?!\{%\s*if\s)[\s\S])*?))?\{%\s*endif\s*%\}/;let o=0;for(;a.test(s)&&o++<128;)s=s.replace(a,(t,i,s,a)=>Mt(e,i,n)?s:a??"");return s=s.replace(/\{\{\s*([\s\S]+?)\s*\}\}/g,(t,i)=>{try{const t=Ct(e,i,n);return String(t)}catch{return""}}),s}const Tt=o("@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');");let zt=class extends dt{constructor(){super(...arguments),this.kind="ac",this.entity="",this.deviceName="",this._closing=!1,this._dragValue=null,this._dragging=!1,this._activeSliderId=null,this._pendingAcTemp=null,this._pendingAcTempTimer=null,this._timerLocal={},this._fanLocalPct=null,this._keydownHandler=t=>{"Escape"===t.key&&this._close()}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._keydownHandler),document.body.style.overflow="hidden"}disconnectedCallback(){document.removeEventListener("keydown",this._keydownHandler),document.body.style.overflow="",super.disconnectedCallback()}_close(){this._closing||(this._closing=!0,setTimeout(()=>{this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0})),this.parentElement&&this.parentElement.removeChild(this)},180))}_onBackdrop(t){t.target.classList.contains("cn-modal__backdrop")&&this._close()}_ent(){return this.hass?.states[this.entity]}_call(t,e,i){this.hass&&this.hass.callService(t,e,i)}_sliderPointerDown(t,e,i,n,s){t.preventDefault();const a=t.currentTarget;a.setPointerCapture(t.pointerId),this._dragging=!0;const o=t=>{const s=a.getBoundingClientRect(),o=Math.max(0,Math.min(1,(t-s.left)/s.width)),r=e+o*(i-e),c=Math.round(r/n)*n;return Math.max(e,Math.min(i,c))},r=t=>{this._dragValue=o(t.clientX)},c=e=>{const i=o(e.clientX);this._dragValue=null,this._dragging=!1,a.releasePointerCapture(t.pointerId),a.removeEventListener("pointermove",r),a.removeEventListener("pointerup",c),a.removeEventListener("pointercancel",c),s(i)};a.addEventListener("pointermove",r),a.addEventListener("pointerup",c),a.addEventListener("pointercancel",c),this._dragValue=o(t.clientX)}_sliderPointerDownWithId(t,e,i,n,s,a){this._activeSliderId=t,this._sliderPointerDown(e,i,n,s,t=>{this._activeSliderId=null,a(t)})}_renderSlider(t){const e=t.id??"default",i=this._activeSliderId===e,n=i&&null!==this._dragValue?this._dragValue:t.value,s=(Math.max(t.min,Math.min(t.max,n))-t.min)/(t.max-t.min)*100;return K`
      <div class="cn-slider ${t.disabled?"cn-slider--disabled":""} ${i&&this._dragging?"cn-slider--drag":""}"
           style="--accent:${t.accent};--pct:${s}%">
        <div class="cn-slider__track"
             @pointerdown=${i=>!t.disabled&&this._sliderPointerDownWithId(e,i,t.min,t.max,t.step,t.onCommit)}>
          <div class="cn-slider__fill"></div>
          <div class="cn-slider__sheen"></div>
        </div>
      </div>
    `}_acIsOn(){const t=this._ent();return!!t&&"off"!==t.state&&"unavailable"!==t.state}_acPower(t){const e=this._ent(),i=t?e?.attributes.hvac_modes?.find(t=>"cool"===t)??"cool":"off";this._call("climate","set_hvac_mode",{entity_id:this.entity,hvac_mode:i})}_acSetMode(t){this._call("climate","set_hvac_mode",{entity_id:this.entity,hvac_mode:t})}_acSetTemp(t){this._pendingAcTemp=t,this._pendingAcTempTimer&&window.clearTimeout(this._pendingAcTempTimer),this._pendingAcTempTimer=window.setTimeout(()=>{this._pendingAcTemp=null},4e3),this._call("climate","set_temperature",{entity_id:this.entity,temperature:t})}_acBumpTemp(t){const e=this._ent();if(!e)return;const i=this._pendingAcTemp??(Number(e.attributes.temperature)||24),n=Number(e.attributes.min_temp)||18,s=Number(e.attributes.max_temp)||30,a=Math.max(n,Math.min(s,i+t));this._acSetTemp(a)}_acSetFan(t){this._call("climate","set_fan_mode",{entity_id:this.entity,fan_mode:t})}_acRoomPrefix(){const t=(this.entity.split(".")[1]??"").match(/^(.*?_lg)_/);return t?t[1]:null}_acExtraSwitches(){const t=this._acRoomPrefix();return t&&this.hass?[{suffix:"supsogbaram",label:"숲속바람",icon:"mdi:pine-tree"},{suffix:"kulpaweo",label:"쿨파워",icon:"mdi:snowflake-variant"},{suffix:"jwaubaram",label:"좌우바람",icon:"mdi:arrow-left-right"},{suffix:"sanghabaram",label:"상하바람",icon:"mdi:arrow-up-down"},{suffix:"gonggiceongjeong",label:"공기청정",icon:"mdi:air-purifier"},{suffix:"jadonggeonjo",label:"자동건조",icon:"mdi:hair-dryer"},{suffix:"jeoljeon",label:"절전",icon:"mdi:leaf"}].map(e=>({entity:`switch.${t}_${e.suffix}`,label:e.label,icon:e.icon})).filter(t=>!!this.hass.states[t.entity]):[]}_numAttrs(t){const e=t?this.hass?.states[t]:void 0,i=e?.attributes??{};return{min:Number(i.min??0),max:Number(i.max??12),step:Number(i.step??.5),value:Number(e?.state??0)}}_acTimerEntities(){const t=this._acRoomPrefix();if(!t||!this.hass)return{};const e=this.hass.states,i=`number.${t}_kyeojim_yeyag_sigan`,n=`number.${t}_ggeojim_yeyag_sigan`,s=`button.${t}_kyeojim_yeyag_balsa`,a=`button.${t}_ggeojim_yeyag_balsa`,o=`button.${t}_yeyaghaeje`,r=`number.${t}_yeoldaeya_sigan`,c=`button.${t}_yeoldaeya_balsa`;return{on:e[i]?i:void 0,off:e[n]?n:void 0,onBtn:e[s]?s:void 0,offBtn:e[a]?a:void 0,cancelBtn:e[o]?o:void 0,trop:e[r]?r:void 0,tropBtn:e[c]?c:void 0}}_timerLsKey(t){return`cardnews.timerLocal.${t}`}_setTimerLocal(t,e){this._timerLocal={...this._timerLocal,[t]:e};try{localStorage.setItem(this._timerLsKey(t),String(e))}catch{}}_readTimerLocal(t){if(t in this._timerLocal)return this._timerLocal[t];try{const e=localStorage.getItem(this._timerLsKey(t));if(null!==e&&""!==e)return Number(e)}catch{}return null}_timerDisplayValue(t){const e=this._readTimerLocal(t);return null!==e?e:Number(this.hass?.states[t]?.state??0)}_timerHasChange(t){const e=this._readTimerLocal(t);return null!==e&&e!==Number(this.hass?.states[t]?.state??0)}_applyTimer(t,e){const i=this._timerDisplayValue(t);this._call("number","set_value",{entity_id:t,value:i}),e&&window.setTimeout(()=>this._call("button","press",{entity_id:e}),300);try{localStorage.removeItem(this._timerLsKey(t))}catch{}const{[t]:n,...s}=this._timerLocal;this._timerLocal=s}_boilerEntities(){const t=this.entity.split(".")[1]??"",e=this.hass?.states??{},i=t=>e[t]?t:void 0;return{mode:i(`select.${t}_operation_mode`),room:i(`number.${t}_room_temp`),onsu:i(`number.${t}_hot_water_temp`),away:i(`switch.${t}_away_mode`)}}_numState(t,e,i=0,n=100){const s=t?this.hass?.states[t]:void 0,a=!!s&&"unavailable"!==s.state&&"unknown"!==s.state,o=s?.attributes?.mode_on,r=a?Number(s?.state):e??null;return{value:Number.isFinite(r)?r:null,usable:a&&!1!==o,min:Number(s?.attributes.min??i),max:Number(s?.attributes.max??n)}}_boilerPower(t){this.hass?.callService("climate","set_hvac_mode",{entity_id:this.entity,hvac_mode:t?"auto":"off"})}_boilerSetMode(t,e){this.hass?.callService("select","select_option",{entity_id:t,option:e})}_boilerBump(t,e){const{value:i,usable:n,min:s,max:a}=this._numState(t);if(!n||null===i)return;const o=Math.min(a,Math.max(s,i+e));o!==i&&this.hass?.callService("number","set_value",{entity_id:t,value:o})}_boilerToggleSwitch(t,e){this.hass?.callService("switch",e?"turn_on":"turn_off",{entity_id:t})}_boilerSetSchedule(t){this.hass?.callService("climate","set_hvac_mode",{entity_id:this.entity,hvac_mode:t?"heat":"auto"})}_renderBoiler(){const t=this._ent(),e=!!t&&"off"!==t.state&&"unavailable"!==t.state,i=this._boilerEntities(),n=i.mode?this.hass?.states[i.mode]:void 0,s=n?.attributes.options??[],a=n?.state??"",o=this._numState(i.room,Number(t?.attributes.temperature),10,40),r=this._numState(i.onsu,void 0,35,60),c=i.away?this.hass?.states[i.away]:void 0,l=c?"on"===c.state:"fan_only"===t?.state,d="heat"===t?.state,h=t?.attributes.current_temperature,p={"실내":"mdi:home-thermometer","온수":"mdi:water-boiler","실내+온수":"mdi:home-plus"};return K`
      <div class="cn-remote cn-remote--boiler">
        <!-- 전원 + 실내 설정온도 -->
        <div class="cn-row cn-row--power">
          <button
            class="cn-btn cn-btn--power ${e?"cn-btn--active":""}"
            @click=${()=>this._boilerPower(!e)}
            title="전원"
          >
            <ha-icon .icon=${"mdi:power"} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <div class="cn-tempctl">
            <button
              class="cn-btn cn-btn--step"
              ?disabled=${!i.room||!o.usable}
              @click=${()=>i.room&&this._boilerBump(i.room,-1)}
            >−</button>
            <div class="cn-tempctl__val ${o.usable?"":"cn-tempctl__val--dim"}">
              ${o.value??"—"}<sup class="cn-tempctl__unit">°C</sup>
            </div>
            <button
              class="cn-btn cn-btn--step"
              ?disabled=${!i.room||!o.usable}
              @click=${()=>i.room&&this._boilerBump(i.room,1)}
            >+</button>
          </div>
        </div>

        <!-- 운전 모드 -->
        ${i.mode&&s.length?K`
              <div class="cn-section">
                <div class="cn-section__label"><span>운전 모드</span></div>
                <div class="cn-seg">
                  ${s.map(t=>K`
                      <button
                        class="cn-btn cn-btn--seg ${a===t?"cn-btn--active":""}"
                        ?disabled=${!e}
                        @click=${()=>this._boilerSetMode(i.mode,t)}
                      >
                        <ha-icon
                          .icon=${p[t]??"mdi:circle-small"}
                          style="--mdc-icon-size:16px;width:16px;height:16px"
                        ></ha-icon>
                        <span>${t}</span>
                      </button>
                    `)}
                </div>
              </div>
            `:G}

        <!-- 온수 설정온도 -->
        ${i.onsu?K`
              <div class="cn-section">
                <!-- 온수는 실측 센서가 없다(항상 0). 설정온도만 보여준다. -->
                <div class="cn-section__label"><span>온수 온도</span></div>
                <div class="cn-tempctl cn-tempctl--wide">
                  <button
                    class="cn-btn cn-btn--step"
                    ?disabled=${!r.usable}
                    @click=${()=>i.onsu&&this._boilerBump(i.onsu,-1)}
                  >−</button>
                  <div class="cn-tempctl__val ${r.usable?"":"cn-tempctl__val--dim"}">
                    ${r.value??"—"}<sup class="cn-tempctl__unit">°C</sup>
                  </div>
                  <button
                    class="cn-btn cn-btn--step"
                    ?disabled=${!r.usable}
                    @click=${()=>i.onsu&&this._boilerBump(i.onsu,1)}
                  >+</button>
                </div>
              </div>
            `:G}

        <!-- 재실/외출 · 수동/예약 -->
        <div class="cn-section">
          <div class="cn-section__label">
            <span>재실 상태</span>
            ${void 0!==h?K`<span class="cn-section__hint">실내 ${h}°C</span>`:G}
          </div>
          <div class="cn-seg">
            <button
              class="cn-btn cn-btn--seg ${l?"":"cn-btn--active"}"
              ?disabled=${!e}
              @click=${()=>i.away?this._boilerToggleSwitch(i.away,!1):this.hass?.callService("climate","set_hvac_mode",{entity_id:this.entity,hvac_mode:"auto"})}
            >
              <ha-icon .icon=${"mdi:home"} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              <span>재실</span>
            </button>
            <button
              class="cn-btn cn-btn--seg ${l?"cn-btn--active":""}"
              ?disabled=${!e}
              @click=${()=>i.away?this._boilerToggleSwitch(i.away,!0):this.hass?.callService("climate","set_hvac_mode",{entity_id:this.entity,hvac_mode:"fan_only"})}
            >
              <ha-icon .icon=${"mdi:walk"} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              <span>외출</span>
            </button>
          </div>
        </div>

        <div class="cn-section">
          <div class="cn-section__label"><span>운전 방식</span></div>
          <div class="cn-seg">
            <button
              class="cn-btn cn-btn--seg ${d?"":"cn-btn--active"}"
              ?disabled=${!e}
              @click=${()=>this._boilerSetSchedule(!1)}
            >
              <ha-icon .icon=${"mdi:pencil"} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              <span>수동</span>
            </button>
            <button
              class="cn-btn cn-btn--seg ${d?"cn-btn--active":""}"
              ?disabled=${!e}
              @click=${()=>this._boilerSetSchedule(!0)}
            >
              <ha-icon .icon=${"mdi:clock-outline"} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              <span>예약</span>
            </button>
          </div>
        </div>
      </div>
    `}_renderAc(){const t=this._ent(),e=!!t&&"off"!==t.state&&"unavailable"!==t.state,i=(t?.attributes.hvac_modes??["off","cool","dry","fan_only","auto"]).filter(t=>"off"!==t),n=t?.attributes.fan_modes??["low","mid","high","auto"],s=t?.state??"off",a="off"===s?t?.attributes.hvac_modes?.find(t=>"off"!==t)??"cool":s,o=t?.attributes.fan_mode??"",r=this._pendingAcTemp??(Number(t?.attributes.temperature)||24),c=Number(t?.attributes.min_temp)||18,l=Number(t?.attributes.max_temp)||30,d={cool:"냉방",dry:"제습",fan_only:"송풍",auto:"자동",heat:"난방"},h={cool:"mdi:snowflake",dry:"mdi:water-percent",fan_only:"mdi:fan",auto:"mdi:refresh-auto",heat:"mdi:fire"},p={low:"약",mid:"중",high:"강",auto:"자동"};return K`
      <div class="cn-remote cn-remote--ac">
        <!-- Power + temp -->
        <div class="cn-row cn-row--power">
          <button
            class="cn-btn cn-btn--power ${e?"cn-btn--active":""}"
            @click=${()=>this._acPower(!e)}
            title="전원"
          >
            <ha-icon .icon=${"mdi:power"} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <div class="cn-tempctl">
            <button class="cn-btn cn-btn--step" @click=${()=>this._acBumpTemp(-1)} ?disabled=${!e||r<=c}>−</button>
            <div class="cn-tempctl__val">${r}<sup class="cn-tempctl__unit">°C</sup></div>
            <button class="cn-btn cn-btn--step" @click=${()=>this._acBumpTemp(1)} ?disabled=${!e||r>=l}>+</button>
          </div>
        </div>

        <!-- Mode segmented -->
        <div class="cn-section">
          <div class="cn-section__label"><span>운전 모드</span></div>
          <div class="cn-seg">
            ${i.map(t=>K`
              <button
                class="cn-btn cn-btn--seg ${a===t?"cn-btn--active":""}"
                ?disabled=${!e}
                @click=${()=>this._acSetMode(t)}
              >
                <ha-icon .icon=${h[t]??"mdi:circle-small"} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
                <span>${d[t]??t}</span>
              </button>
            `)}
          </div>
        </div>

        <!-- Fan speed segmented -->
        <div class="cn-section">
          <div class="cn-section__label"><span>바람 세기</span></div>
          <div class="cn-seg">
            ${n.map(t=>K`
              <button
                class="cn-btn cn-btn--seg ${o===t?"cn-btn--active":""}"
                @click=${()=>this._acSetFan(t)}
                ?disabled=${!e}
              >
                <span>${p[t]??t}</span>
              </button>
            `)}
          </div>
        </div>

        ${this._renderAcExtras()}
        ${this._renderAcTimer()}
      </div>
    `}_renderAcExtras(){const t=this._acExtraSwitches();return t.length?K`
      <div class="cn-section">
        <div class="cn-section__label"><span>부가 기능</span></div>
        <div class="cn-extras">
          ${t.map(t=>{const e=this.hass?.states[t.entity],i="on"===e?.state;return K`
              <button
                class="cn-btn cn-btn--extra ${i?"cn-btn--active":""}"
                ?disabled=${!this._acIsOn()}
                @click=${()=>this._call("switch","toggle",{entity_id:t.entity})}
                title=${t.label}
              >
                <ha-icon .icon=${t.icon} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
                <span class="cn-extra__label">${t.label}</span>
                <span class="cn-extra__pill ${i?"cn-extra__pill--on":""}">
                  <span class="cn-extra__dot"></span>
                </span>
              </button>
            `})}
        </div>
      </div>
    `:G}_renderAcTimer(){const t=this._acTimerEntities();if(!t.on&&!t.off&&!t.cancelBtn)return G;const e=(t,e,i,n,s,a,o,r)=>{const c=this._numAttrs(e),l=this._timerDisplayValue(e),d=this._activeSliderId===t&&null!==this._dragValue?this._dragValue:l,h=o??(t=>t),p=r??(t=>t<=0?"해제":`${t}h`),m=this._timerHasChange(e);return K`
        <div class="cn-timer-row">
          <div class="cn-timer-row__head">
            <span class="cn-timer-row__label">
              <span>${n}</span>
              <span class="cn-timer-row__label-sep">·</span>
              <span class="cn-timer-row__label-val" style="--vc:${s}">${p(h(d))}</span>
            </span>
          </div>
          <div class="cn-timer-row__body">
            ${this._renderSlider({id:t,value:l,min:c.min,max:c.max,step:a,accent:s,onCommit:t=>this._setTimerLocal(e,h(t))})}
            <button
              class="cn-btn cn-btn--chip cn-btn--apply ${m?"cn-btn--active":""}"
              @click=${()=>this._applyTimer(e,i)}
              title="설정 전송"
              style="--cn-accent:${s}"
            >설정</button>
          </div>
        </div>
      `};return K`
      <div class="cn-section">
        <div class="cn-section__label">
          <span>예약 타이머</span>
          <span class="cn-section__right">
            ${t.cancelBtn?K`
              <button
                class="cn-btn cn-btn--chip cn-btn--chip-danger"
                @click=${()=>this._call("button","press",{entity_id:t.cancelBtn})}
                title="모든 예약 취소"
              >
                <ha-icon .icon=${"mdi:close-circle-outline"} style="--mdc-icon-size:14px;width:14px;height:14px"></ha-icon>
                <span>예약 취소</span>
              </button>
            `:G}
          </span>
        </div>
        ${t.on?e("timer-on",t.on,t.onBtn,"켜짐 예약","#22d3ee",1):G}
        ${t.off?e("timer-off",t.off,t.offBtn,"꺼짐 예약","#f59e0b",1):G}
        ${t.trop?e("timer-trop",t.trop,t.tropBtn,"열대야 모드","#a855f7",.5,t=>t<=0?0:t<.75?.5:Math.round(t),t=>t<=0?"해제":t<1?"30분":`${t}h`):G}
      </div>
    `}_fanEnt(){return this.hass?.states[this.entity]}_fanIsButton(){return this.entity.startsWith("button.")}_fanPowerToggle(){const[t]=this.entity.split(".");"button"===t?this._call("button","press",{entity_id:this.entity}):"fan"===t?this._call("fan","toggle",{entity_id:this.entity}):"switch"===t&&this._call("switch","toggle",{entity_id:this.entity})}_fanIrButtons(){if(!this.entity.startsWith("button.")||!this.hass)return[];const t=this.entity.match(/^button\.(.+)_seonpunggi_(?:jeonweon)$/);if(!t)return[];const e=t[1],i=this.hass.states;return[{key:`button.${e}_seonpunggi_pungsog`,label:"풍속+",icon:"mdi:arrow-up-bold"},{key:`button.${e}_seonpunggi_pungsog_2`,label:"풍속−",icon:"mdi:arrow-down-bold"},{key:`button.${e}_seonpunggi_gagdo`,label:"각도",icon:"mdi:angle-acute"},{key:`button.${e}_seonpunggi_modeu`,label:"모드",icon:"mdi:sync"},{key:`button.${e}_seonpunggi_hoejeon`,label:"회전",icon:"mdi:rotate-3d-variant"},{key:`button.${e}_seonpunggi_cwicim`,label:"취침",icon:"mdi:power-sleep"},{key:`button.${e}_seonpunggi_taimeo`,label:"타이머",icon:"mdi:timer-outline"}].filter(t=>!!i[t.key])}_fanPressIr(t){this._call("button","press",{entity_id:t})}_fanSetPct(t){this._call("fan","set_percentage",{entity_id:this.entity,percentage:t}),this._fanLocalPct=null}_fanSetPreset(t){this._call("fan","set_preset_mode",{entity_id:this.entity,preset_mode:t})}_fanOscillate(t){this._call("fan","oscillate",{entity_id:this.entity,oscillating:t})}_fanSetProperty(t,e){this._call("xiaomi_miot","set_property",{entity_id:this.entity,field:t,value:e})}_renderFan(){const t=this._fanEnt(),e=this.entity.startsWith("fan."),i=!!t&&"on"===t.state,n=Number(t?.attributes.percentage)||0,s=this._fanLocalPct??n,a="fan-pct"===this._activeSliderId&&null!==this._dragValue?Math.round(this._dragValue):s;null!==this._fanLocalPct&&this._fanLocalPct;const o=!!t?.attributes.oscillating,r=t?.attributes.preset_modes??[],c=t?.attributes.preset_mode??"",l={"Straight Wind":"직바람","Natural Wind":"자연풍",Smart:"스마트",Sleep:"수면"};return K`
      <div class="cn-remote cn-remote--fan">
        ${e?K`
          <div class="cn-row cn-row--power">
            <button
              class="cn-btn cn-btn--power ${i?"cn-btn--active":""}"
              @click=${()=>this._fanPowerToggle()}
              title="전원"
            >
              <ha-icon .icon=${"mdi:power"} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
            </button>
            <div class="cn-tempctl">
              <button class="cn-btn cn-btn--step" @click=${()=>this._fanSetPct(Math.max(10,a-5))} ?disabled=${!i}>−</button>
              <div class="cn-tempctl__val">${a}<sup class="cn-tempctl__unit">%</sup></div>
              <button class="cn-btn cn-btn--step" @click=${()=>this._fanSetPct(Math.min(100,a+5))} ?disabled=${!i}>+</button>
            </div>
          </div>
        `:G}

        ${e?K`
          <div class="cn-section">
            <div class="cn-section__label">
              <span>세기 조절</span>
              <span class="cn-section__right">
                <span class="cn-section__hint" style="--vc:#a78bfa">${a}%</span>
              </span>
            </div>
            ${this._renderSlider({id:"fan-pct",value:n,min:10,max:100,step:5,disabled:!i,accent:"#a78bfa",onCommit:t=>this._fanSetPct(t)})}
          </div>

          ${r.length?K`
            <div class="cn-section">
              <div class="cn-section__label"><span>모드</span></div>
              <div class="cn-seg">
                ${r.map(t=>K`
                  <button
                    class="cn-btn cn-btn--seg ${c===t?"cn-btn--active":""}"
                    @click=${()=>this._fanSetPreset(t)}
                    ?disabled=${!i}
                  >${l[t]??t}</button>
                `)}
              </div>
            </div>
          `:G}

          <div class="cn-section">
            <div class="cn-section__label"><span>좌우 회전</span></div>
            <div class="cn-seg">
              <button class="cn-btn cn-btn--seg ${o?"cn-btn--active":""}" @click=${()=>this._fanOscillate(!0)} ?disabled=${!i}>ON</button>
              <button class="cn-btn cn-btn--seg ${o?"":"cn-btn--active"}" @click=${()=>this._fanOscillate(!1)} ?disabled=${!i}>OFF</button>
            </div>
          </div>

          ${void 0!==t?.attributes["fan.vertical_swing"]?(()=>{const e=!!t.attributes["fan.vertical_swing"];return K`
              <div class="cn-section">
                <div class="cn-section__label"><span>상하 회전</span></div>
                <div class="cn-seg">
                  <button class="cn-btn cn-btn--seg ${e?"cn-btn--active":""}" @click=${()=>this._fanSetProperty("fan.vertical_swing",!0)} ?disabled=${!i}>ON</button>
                  <button class="cn-btn cn-btn--seg ${e?"":"cn-btn--active"}" @click=${()=>this._fanSetProperty("fan.vertical_swing",!1)} ?disabled=${!i}>OFF</button>
                </div>
              </div>
            `})():G}
        `:G}
        ${e?G:(()=>{const t=Object.fromEntries(this._fanIrButtons().map(t=>[t.key.split("_").pop()??t.key,t])),e=t.modeu,i=t.pungsog,n=t[2],s=t.gagdo,a=t.hoejeon,o=t.cwicim,r=t.taimeo,c=t=>t?K`
            <button
              class="cn-btn cn-btn--seg"
              @click=${()=>this._fanPressIr(t.key)}
              title=${t.label}
            >
              <ha-icon .icon=${t.icon} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              <span>${t.label}</span>
            </button>
          `:G;return K`
            <!-- Row 1: power + mode (matches AC's 전원+온도 row height) -->
            <div class="cn-row cn-row--power cn-row--ir-power">
              <button
                class="cn-btn cn-btn--power cn-btn--ir-power-flex"
                @click=${()=>this._fanPowerToggle()}
                title="전원"
              >
                <ha-icon .icon=${"mdi:power"} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
                <span class="cn-btn--ir-power-flex__lbl">전원</span>
              </button>
              ${e?K`
                <button
                  class="cn-btn cn-btn--power cn-btn--ir-mode-flex"
                  @click=${()=>this._fanPressIr(e.key)}
                  title=${e.label}
                >
                  <ha-icon .icon=${e.icon} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
                  <span class="cn-btn--ir-mode-flex__lbl">${e.label}</span>
                </button>
              `:G}
            </div>

            ${i||n?K`
              <div class="cn-section">
                <div class="cn-section__label"><span>풍속 조절</span></div>
                <div class="cn-seg">${c(i)}${c(n)}</div>
              </div>
            `:G}

            ${a||s?K`
              <div class="cn-section">
                <div class="cn-section__label"><span>방향 조절</span></div>
                <div class="cn-seg">${c(a)}${c(s)}</div>
              </div>
            `:G}

            ${o||r?K`
              <div class="cn-section">
                <div class="cn-section__label"><span>예약</span></div>
                <div class="cn-seg">${c(o)}${c(r)}</div>
              </div>
            `:G}
          `})()}
      </div>
    `}render(){const t=this.deviceName||{ac:"에어컨",fan:"선풍기",boiler:"보일러"}[this.kind]||"리모컨";return K`
      <div class="cn-modal__backdrop ${this._closing?"cn-modal__backdrop--closing":""}" @click=${this._onBackdrop}>
        <div class="cn-modal ${this._closing?"cn-modal--closing":""}" role="dialog" aria-modal="true" aria-label=${t}>
          <div class="cn-modal__head">
            <div class="cn-modal__title">
              <ha-icon
                .icon=${{ac:"mdi:air-conditioner",fan:"mdi:fan",boiler:"mdi:water-boiler"}[this.kind]??"mdi:remote"}
                style="--mdc-icon-size:18px;width:18px;height:18px"
              ></ha-icon>
              <span>${t}</span>
            </div>
            <button class="cn-modal__close" @click=${()=>this._close()} aria-label="닫기">
              <ha-icon .icon=${"mdi:close"} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
            </button>
          </div>
          <div class="cn-modal__body">
            ${"boiler"===this.kind?this._renderBoiler():"ac"===this.kind?this._renderAc():this._renderFan()}
          </div>
        </div>
      </div>
    `}};zt.styles=r`
    ${Tt}
    :host {
      position: fixed;
      inset: 0;
      z-index: 999999;
      font-family: ${o("'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif")};
      -webkit-font-smoothing: antialiased;
      --cn-accent: #22d3ee;
      --cn-surface-1: rgba(255, 255, 255, 0.06);
      --cn-surface-2: rgba(255, 255, 255, 0.10);
      --cn-surface-hover: rgba(255, 255, 255, 0.14);
      --cn-border: rgba(255, 255, 255, 0.10);
      --cn-border-strong: rgba(255, 255, 255, 0.18);
      --cn-text: #f4f6fb;
      --cn-text-dim: rgba(244, 246, 251, 0.62);
      --cn-text-muted: rgba(244, 246, 251, 0.42);
    }
    @keyframes cn-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cn-fade-out { from { opacity: 1; } to { opacity: 0; } }
    @keyframes cn-scale-in {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes cn-scale-out {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(8px) scale(0.98); }
    }

    .cn-modal__backdrop {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: radial-gradient(80% 60% at 50% 40%, rgba(20,22,28,0.55), rgba(0,0,0,0.75));
      backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
      animation: cn-fade-in 180ms ease;
    }
    .cn-modal__backdrop--closing { animation: cn-fade-out 180ms ease forwards; }

    /* ---- Modal shell ---- */
    .cn-modal {
      position: relative;
      width: min(380px, 100%);
      max-height: min(88vh, 760px);
      overflow: hidden;
      border-radius: 24px;
      color: var(--cn-text);
      background:
        linear-gradient(180deg, rgba(30, 32, 40, 0.92) 0%, rgba(18, 20, 26, 0.94) 100%);
      border: 1px solid var(--cn-border-strong);
      box-shadow:
        0 40px 100px rgba(0,0,0,0.55),
        0 6px 20px rgba(0,0,0,0.35),
        inset 0 1px 0 rgba(255,255,255,0.08);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      animation: cn-scale-in 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
    }
    .cn-modal--closing { animation: cn-scale-out 180ms ease forwards; }

    .cn-modal__head {
      position: relative;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 10px;
      color: var(--cn-text);
      border-bottom: 1px solid var(--cn-border);
    }
    .cn-modal__title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--cn-text);
    }
    .cn-modal__title ha-icon { color: var(--cn-text-dim); }
    .cn-modal__close {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      border: 1px solid var(--cn-border);
      background: var(--cn-surface-1);
      color: var(--cn-text-dim);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s, transform 0.1s;
    }
    .cn-modal__close:hover { background: var(--cn-surface-hover); color: var(--cn-text); }
    .cn-modal__close:active { transform: scale(0.94); }

    .cn-modal__body {
      position: relative;
      z-index: 3;
      padding: 16px 18px 22px;
      overflow-y: auto;
    }

    ha-icon { display: inline-flex; align-items: center; justify-content: center; color: inherit; }

    .cn-remote { display: flex; flex-direction: column; gap: 18px; }

    /* ==================================================================
       UNIFIED GLASS BUTTON — modeled 1:1 on HeroCardBase .cn-hero-action.
       Border-box gradient border (very subtle 1px), padding-box glass
       gradient background, backdrop blur, subtle inset white top hairline,
       subtle outer shadow, ::before specular sheen. NO thick rings, NO
       solid fills, NO neon outlines.
       ================================================================== */
    .cn-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: 12px;
      border: 1px solid transparent;
      background:
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(255, 255, 255, 0.02) 45%,
          rgba(255, 255, 255, 0.00) 100%
        ) padding-box,
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.35) 0%,
          rgba(255, 255, 255, 0.08) 40%,
          rgba(255, 255, 255, 0.03) 60%,
          rgba(255, 255, 255, 0.18) 100%
        ) border-box;
      backdrop-filter: blur(3px) saturate(140%);
      -webkit-backdrop-filter: blur(3px) saturate(140%);
      color: rgba(244,246,251,0.78);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
      isolation: isolate;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.32),
        0 2px 4px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
      transition:
        transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1),
        color 0.15s ease,
        box-shadow 0.18s ease;
    }
    /* Specular sheen — same as hero-action */
    .cn-btn::before {
      content: '';
      position: absolute;
      inset: 2px 2px auto 2px;
      height: 45%;
      border-radius: 10px 10px 40% 40% / 10px 10px 100% 100%;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.10) 0%,
        rgba(255, 255, 255, 0) 100%
      );
      pointer-events: none;
      z-index: 1;
    }
    .cn-btn > * { position: relative; z-index: 2; }
    .cn-btn:hover:not(:disabled) {
      color: var(--cn-text);
      transform: translateY(-1px);
    }
    .cn-btn:active:not(:disabled) { transform: scale(0.97); }
    .cn-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .cn-btn:focus-visible { outline: 2px solid var(--cn-accent); outline-offset: 2px; }

    /* ---- Active state ----
       Same glass base. Only difference: an accent-tinted BOTTOM BAND
       overlay (bottom 50%), rendered via ::after so the border/background
       machinery stays untouched. No ring, no full-fill, no thick outline. */
    .cn-btn--active {
      color: var(--cn-accent);
      background:
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.10) 0%,
          rgba(255, 255, 255, 0.04) 45%,
          rgba(255, 255, 255, 0.02) 100%
        ) padding-box,
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.5) 0%,
          rgba(255, 255, 255, 0.12) 40%,
          rgba(255, 255, 255, 0.05) 60%,
          rgba(255, 255, 255, 0.25) 100%
        ) border-box;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.35),
        0 0 0 1px color-mix(in srgb, var(--cn-accent) 55%, transparent),
        0 0 6px color-mix(in srgb, var(--cn-accent) 35%, transparent),
        inset 0 1px 0 rgba(255, 255, 255, 0.28),
        inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    }
    .cn-btn--active ha-icon {
      color: var(--cn-accent);
    }

    .cn-row--ir-power {
      display: flex;
      gap: 10px;
      align-items: stretch;
    }
    .cn-btn--ir-power-flex {
      flex: 3;
      width: auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .cn-btn--ir-power-flex__lbl {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .cn-btn--ir-mode-flex {
      flex: 1;
      width: auto;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }
    .cn-btn--ir-mode-flex__lbl {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .cn-btn--mode-square {
      width: 64px;
      flex-shrink: 0;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }
    .cn-btn--mode-square__lbl {
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    /* Power + temp row */
    .cn-row--power {
      display: flex;
      align-items: stretch;
      gap: 10px;
    }
    .cn-btn--power {
      width: 64px;
      flex-shrink: 0;
      border-radius: 16px;
      height: 64px;
    }
    .cn-btn--power.cn-btn--active {
      --cn-accent: #34d399;
    }

    /* One-shot buttons never highlight as "active" */
    .cn-btn--chip.cn-btn--active,
    .cn-btn--apply.cn-btn--active {
      background:
        linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.00) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.18) 100%) border-box;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.32),
        0 2px 4px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
    }
    .cn-btn--chip.cn-btn--active,
    .cn-btn--apply.cn-btn--active {
      color: var(--cn-text);
    }
    .cn-btn--chip.cn-btn--active ha-icon,
    .cn-btn--apply.cn-btn--active ha-icon {
      color: inherit;
    }


    .cn-tempctl {
      flex: 1;
      display: grid;
      grid-template-columns: 52px 1fr 52px;
      align-items: center;
      gap: 6px;
      background:
        linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.14) 100%) border-box;
      border: 1px solid transparent;
      border-radius: 16px;
      padding: 6px;
      box-shadow:
        0 6px 16px rgba(0,0,0,0.24),
        inset 0 1px 0 rgba(255,255,255,0.18);
    }


    .cn-tempctl--wide { width: 100%; justify-content: center; }
    .cn-tempctl--hint {
      grid-template-columns: 1fr;
      padding: 14px;
      font-size: 13px;
      color: var(--cn-text-dim);
      text-align: center;
      font-weight: 600;
    }
    .cn-btn--step {
      height: 48px;
      font-size: 22px;
      font-weight: 700;
      color: var(--cn-text);
    }
    .cn-tempctl__val {
      text-align: center;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
      color: var(--cn-text);
    }
    .cn-tempctl__val--dim { opacity: 0.35; }
    .cn-tempctl__val small { font-size: 13px; color: var(--cn-text-dim); margin-left: 2px; font-weight: 600; }
    .cn-tempctl__unit {
      font-size: 14px;
      color: var(--cn-text-dim);
      margin-left: 3px;
      font-weight: 600;
      vertical-align: super;
      line-height: 0;
    }

    /* ---- Sections ---- */
    .cn-section { display: flex; flex-direction: column; gap: 10px; }
    .cn-section__label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.10em;
      text-transform: uppercase;
      color: var(--cn-text-dim);
      padding: 0 2px;
      gap: 8px;
    }
    .cn-section__right {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      text-transform: none;
      letter-spacing: 0;
    }
    .cn-section__hint {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.01em;
      text-transform: none;
      color: var(--vc, var(--cn-text-muted));
      font-variant-numeric: tabular-nums;
    }

    /* ---- Segmented control ---- */
    .cn-seg {
      display: flex;
      gap: 6px;
      border-radius: 14px;
    }
    .cn-btn--seg {
      flex: 1;
      min-height: 40px;
      border-radius: 10px;
      font-size: 13px;
    }

    /* ---- Extras grid ---- */
    .cn-extras {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .cn-btn--extra {
      justify-content: flex-start;
      gap: 8px;
      min-height: 44px;
      padding: 0 12px;
      border-radius: 12px;
      font-size: 13px;
    }
    .cn-btn--extra ha-icon { color: var(--cn-text-dim); flex-shrink: 0; }
    .cn-btn--extra.cn-btn--active ha-icon { color: var(--cn-accent); }
    .cn-extra__label { flex: 1; text-align: left; letter-spacing: -0.01em; }
    .cn-extra__pill {
      width: 24px; height: 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.10);
      position: relative;
      transition: background 0.18s;
      flex-shrink: 0;
    }
    .cn-extra__dot {
      position: absolute;
      top: 2px; left: 2px;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: rgba(255,255,255,0.55);
      transition: transform 0.18s, background 0.18s;
    }
    .cn-btn--extra.cn-btn--active .cn-extra__pill {
      background: color-mix(in srgb, var(--cn-accent) 45%, transparent);
    }
    .cn-btn--extra.cn-btn--active .cn-extra__dot {
      transform: translateX(10px);
      background: #fff;
    }

    /* ---- Slider — 44px pill. Accent fill + glass sheen. NO center label. */
    .cn-slider {
      padding: 6px 0;
      touch-action: none;
      box-sizing: border-box;
      width: 100%;
    }
    .cn-slider--disabled { opacity: 0.4; pointer-events: none; }
    .cn-slider__track {
      position: relative;
      height: 44px;
      border-radius: 22px;
      /* Glass base — same padding-box/border-box trick as .cn-btn */
      background:
        linear-gradient(180deg, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.20) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 55%, rgba(255,255,255,0.14) 100%) border-box;
      border: 1px solid transparent;
      box-shadow:
        inset 0 2px 4px rgba(0,0,0,0.34),
        inset 0 -1px 0 rgba(255,255,255,0.04),
        0 2px 6px rgba(0,0,0,0.20);
      cursor: pointer;
      overflow: hidden;
      transition: box-shadow 0.2s ease;
    }
    .cn-slider--drag .cn-slider__track {
      box-shadow:
        inset 0 2px 4px rgba(0,0,0,0.40),
        inset 0 0 0 1px color-mix(in srgb, var(--accent) 32%, transparent),
        0 2px 8px rgba(0,0,0,0.28);
    }
    .cn-slider__fill {
      position: absolute;
      inset: 0 auto 0 0;
      width: var(--pct, 0%);
      min-width: 0;
      border-radius: 22px 0 0 22px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--accent) 62%, rgba(0,0,0,0.15)) 0%,
        color-mix(in srgb, var(--accent) 72%, rgba(255,255,255,0.05)) 60%,
        color-mix(in srgb, var(--accent) 68%, rgba(255,255,255,0.15)) 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.15),
        inset 0 -1px 0 rgba(0,0,0,0.12);
      transition: width 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .cn-slider--drag .cn-slider__fill { transition: none; }
    /* Glass sheen — 145deg white gradient overlaid across whole pill so the
       accent still reads under it but gains a glossy shine. Sits ABOVE the
       fill but BELOW any pointer targets. */
    .cn-slider__sheen {
      position: absolute;
      inset: 0;
      border-radius: 22px;
      pointer-events: none;
      background: linear-gradient(
        180deg,
        rgba(255,255,255,0.32) 0%,
        rgba(255,255,255,0.10) 45%,
        rgba(255,255,255,0.00) 55%,
        rgba(0,0,0,0.15) 100%
      );
    }
    /* Top rim specular reflection */
    .cn-slider__sheen::before {
      content: '';
      position: absolute;
      inset: 2px 8px auto 8px;
      height: 40%;
      border-radius: 22px 22px 40% 40% / 22px 22px 100% 100%;
      background: linear-gradient(
        to bottom,
        rgba(255,255,255,0.28) 0%,
        rgba(255,255,255,0.00) 100%
      );
      pointer-events: none;
    }

    /* ---- Timer rows ---- */
    .cn-timer-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cn-timer-row__head {
      display: flex;
      justify-content: flex-start;
      align-items: baseline;
      padding: 0 4px;
    }
    .cn-timer-row__label {
      display: inline-flex;
      align-items: baseline;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--cn-text-dim);
      letter-spacing: -0.01em;
    }
    .cn-timer-row__label-sep {
      color: var(--cn-text-muted);
      font-weight: 500;
    }
    .cn-timer-row__label-val {
      font-weight: 700;
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      color: var(--vc, var(--cn-accent));
      letter-spacing: -0.01em;
    }

    /* Timer row body = slider + 설정 chip button */
    .cn-timer-row__body {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
    }
    .cn-timer-row__body .cn-slider { flex: 1 1 auto; min-width: 0; }
    .cn-timer-row__body .cn-btn--apply {
      flex: 0 0 auto;
      min-width: 56px;
      margin-right: 0;
    }
    /* Neutralize outer shadow overflow so chip's visual right edge sits flush
       with the segmented-button rows above. */
    .cn-timer-row__body .cn-btn--apply {
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
    }

    /* ---- Chip buttons (설정, 예약 취소) — inherit glass from .cn-btn ---- */
    .cn-btn--chip {
      height: 32px;
      padding: 0 12px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.01em;
      gap: 4px;
      flex-shrink: 0;
    }
    .cn-btn--apply {
      align-self: center;
      min-width: 56px;
    }
    /* Danger-tinted chip (예약 취소) — still same glass, only text/accent
       is tinted red-ish. Border/background/sheen inherited unchanged. */
    .cn-btn--chip-danger {
      color: #fca5a5;
      --cn-accent: #f87171;
    }
    .cn-btn--chip-danger:hover:not(:disabled) { color: #fecaca; }
    .cn-btn--chip-danger ha-icon { color: currentColor; }

    @media (max-width: 480px) {
      .cn-modal { border-radius: 22px; max-height: 92vh; }
    }
  `,t([gt({attribute:!1})],zt.prototype,"hass",void 0),t([gt({type:String})],zt.prototype,"kind",void 0),t([gt({type:String})],zt.prototype,"entity",void 0),t([gt({type:String})],zt.prototype,"deviceName",void 0),t([_t()],zt.prototype,"_closing",void 0),t([_t()],zt.prototype,"_dragValue",void 0),t([_t()],zt.prototype,"_dragging",void 0),t([_t()],zt.prototype,"_activeSliderId",void 0),t([_t()],zt.prototype,"_pendingAcTemp",void 0),t([_t()],zt.prototype,"_timerLocal",void 0),t([_t()],zt.prototype,"_fanLocalPct",void 0),zt=t([pt("cardnews-remote-modal")],zt);const Pt=o("@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');");let It=class extends dt{constructor(){super(...arguments),this.remote="",this.tvEntity="",this.volumeEntity="",this.deviceName="",this.apps=[],this.sourceAppsEntity="",this.hdmiSelect="",this.hdmiPower="",this.hdmiPrev="",this.hdmiNext="",this._closing=!1,this._keydownHandler=t=>{"Escape"===t.key&&this._close()}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._keydownHandler),document.body.style.overflow="hidden"}disconnectedCallback(){document.removeEventListener("keydown",this._keydownHandler),document.body.style.overflow="",super.disconnectedCallback()}_close(){this._closing||(this._closing=!0,setTimeout(()=>{this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0})),this.parentElement&&this.parentElement.removeChild(this)},180))}_onBackdrop(t){t.target.classList.contains("cn-modal__backdrop")&&this._close()}_ent(t){if(t&&this.hass)return this.hass.states[t]}_call(t,e,i){this.hass&&this.hass.callService(t,e,i)}_sendCmd(t){this.remote&&this._call("remote","send_command",{entity_id:this.remote,command:t})}_powerToggle(){const t=this._ent(this.tvEntity),e=this._ent(this.remote),i=t&&"off"!==t.state&&"unavailable"!==t.state&&"unknown"!==t.state||e&&"on"===e.state;this.remote?this._call("remote",i?"turn_off":"turn_on",{entity_id:this.remote}):this.tvEntity&&this._call("media_player.toggle".split(".")[0],"toggle",{entity_id:this.tvEntity})}_selectSource(t){this.tvEntity&&this._call("media_player","select_source",{entity_id:this.tvEntity,source:t})}_volTarget(){return this.volumeEntity||this.tvEntity||void 0}_volUp(){const t=this._volTarget();t&&this._call("media_player","volume_up",{entity_id:t})}_volDown(){const t=this._volTarget();t&&this._call("media_player","volume_down",{entity_id:t})}_volMute(){const t=this._volTarget();if(!t)return;const e=this._ent(t),i=!!e?.attributes.is_volume_muted;this._call("media_player","volume_mute",{entity_id:t,is_volume_muted:!i})}_launchApp(t){if(!this.remote)return;const e=t.url??t.package;e&&this._call("remote","turn_on",{entity_id:this.remote,activity:e})}_renderHeader(){const t=this.deviceName||"TV 리모컨",e=this._ent(this.tvEntity),i=this._ent(this.remote),n=e&&"off"!==e.state&&"unavailable"!==e.state&&"unknown"!==e.state||i&&"on"===i.state;return K`
      <div class="cn-modal__head">
        <div class="cn-modal__title">
          <ha-icon .icon=${"mdi:remote-tv"} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
          <span>${t}</span>
        </div>
        <div class="cn-head__right">
          <button
            class="cn-btn cn-btn--pwr-hdr ${n?"cn-btn--active":""}"
            @click=${()=>this._powerToggle()}
            title="전원"
          >
            <ha-icon .icon=${"mdi:power"} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
          </button>
          <button class="cn-modal__close" @click=${()=>this._close()} aria-label="닫기">
            <ha-icon .icon=${"mdi:close"} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
          </button>
        </div>
      </div>
    `}_renderSources(){const t=this._ent(this.tvEntity),e=t?.attributes.source_list??[];if(!e.length)return G;const i=e.length>12||e.filter(t=>t.includes(".")).length>.3*e.length;if(i)return G;const n=t?.attributes.source??"";return K`
      <div class="cn-section">
        <div class="cn-section__label"><span>소스</span></div>
        <div class="cn-seg">
          ${e.map(t=>K`
            <button
              class="cn-btn cn-btn--seg ${n===t?"cn-btn--active":""}"
              @click=${()=>this._selectSource(t)}
            >${t}</button>
          `)}
        </div>
      </div>
    `}_renderDpad(){return K`
      <div class="cn-section">
        <div class="cn-section__label"><span>방향키</span></div>
        <div class="cn-dpad">
          <div class="cn-dpad__slot cn-dpad__slot--tl"></div>
          <button class="cn-dpad__btn cn-dpad__btn--up" @click=${()=>this._sendCmd("DPAD_UP")} title="위">
            <ha-icon .icon=${"mdi:chevron-up"} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <div class="cn-dpad__slot cn-dpad__slot--tr"></div>
          <button class="cn-dpad__btn cn-dpad__btn--left" @click=${()=>this._sendCmd("DPAD_LEFT")} title="왼쪽">
            <ha-icon .icon=${"mdi:chevron-left"} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <button class="cn-dpad__btn cn-dpad__btn--ok" @click=${()=>this._sendCmd("DPAD_CENTER")} title="확인">
            <span>OK</span>
          </button>
          <button class="cn-dpad__btn cn-dpad__btn--right" @click=${()=>this._sendCmd("DPAD_RIGHT")} title="오른쪽">
            <ha-icon .icon=${"mdi:chevron-right"} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <div class="cn-dpad__slot cn-dpad__slot--bl"></div>
          <button class="cn-dpad__btn cn-dpad__btn--down" @click=${()=>this._sendCmd("DPAD_DOWN")} title="아래">
            <ha-icon .icon=${"mdi:chevron-down"} style="--mdc-icon-size:26px;width:26px;height:26px"></ha-icon>
          </button>
          <div class="cn-dpad__slot cn-dpad__slot--br"></div>
        </div>
        <div class="cn-nav-row">
          <button class="cn-btn cn-btn--nav" @click=${()=>this._sendCmd("BACK")} title="뒤로">
            <ha-icon .icon=${"mdi:keyboard-backspace"} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            <span>BACK</span>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${()=>this._sendCmd("HOME")} title="홈">
            <ha-icon .icon=${"mdi:home"} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            <span>HOME</span>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${()=>this._sendCmd("MENU")} title="메뉴">
            <ha-icon .icon=${"mdi:menu"} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            <span>MENU</span>
          </button>
        </div>
      </div>
    `}_renderVolume(){const t=this._volTarget();if(!t)return G;const e=this._ent(t),i=e?.attributes.volume_level,n=!!e?.attributes.is_volume_muted,s="number"==typeof i?Math.round(100*i):null;return K`
      <div class="cn-section">
        <div class="cn-section__label">
          <span>볼륨</span>
          <span class="cn-section__right">
            ${null!==s?K`<span class="cn-section__hint" style="--vc:#22d3ee">${s}%</span>`:G}
          </span>
        </div>
        <div class="cn-vol-row">
          <button class="cn-btn cn-btn--vol" @click=${()=>this._volDown()} title="볼륨 -">
            <ha-icon .icon=${"mdi:volume-minus"} style="--mdc-icon-size:22px;width:22px;height:22px"></ha-icon>
          </button>
          <button class="cn-btn cn-btn--vol" @click=${()=>this._volUp()} title="볼륨 +">
            <ha-icon .icon=${"mdi:volume-plus"} style="--mdc-icon-size:22px;width:22px;height:22px"></ha-icon>
          </button>
          <button class="cn-btn cn-btn--vol ${n?"cn-btn--active":""}" @click=${()=>this._volMute()} title="음소거">
            <ha-icon .icon=${n?"mdi:volume-off":"mdi:volume-high"} style="--mdc-icon-size:22px;width:22px;height:22px"></ha-icon>
          </button>
        </div>
      </div>
      <div class="cn-section">
        <div class="cn-section__label"><span>재생 컨트롤</span></div>
        <div class="cn-nav-row cn-media-row">
          <button class="cn-btn cn-btn--nav" @click=${()=>this._sendCmd("MEDIA_PREVIOUS")} title="이전 트랙">
            <ha-icon .icon=${"mdi:skip-previous"} style="--mdc-icon-size:22px;width:22px;height:22px"></ha-icon>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${()=>this._sendCmd("MEDIA_PLAY_PAUSE")} title="재생/일시정지">
            <ha-icon .icon=${"mdi:play-pause"} style="--mdc-icon-size:24px;width:24px;height:24px"></ha-icon>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${()=>this._sendCmd("MEDIA_NEXT")} title="다음 트랙">
            <ha-icon .icon=${"mdi:skip-next"} style="--mdc-icon-size:22px;width:22px;height:22px"></ha-icon>
          </button>
        </div>
        <div class="cn-nav-row cn-nav-row--2 cn-media-row">
          <button class="cn-btn cn-btn--nav" @click=${()=>this._sendCmd("MEDIA_REWIND")} title="빨리 감기 뒤로">
            <ha-icon .icon=${"mdi:rewind"} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${()=>this._sendCmd("MEDIA_FAST_FORWARD")} title="빨리 감기 앞으로">
            <ha-icon .icon=${"mdi:fast-forward"} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
          </button>
        </div>
      </div>
      <div class="cn-section">
        <div class="cn-nav-row cn-nav-row--2">
          <button class="cn-btn cn-btn--nav" @click=${()=>this._sendCmd("SEARCH")} title="검색">
            <ha-icon .icon=${"mdi:magnify"} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            <span>검색</span>
          </button>
          <button class="cn-btn cn-btn--nav" @click=${()=>this._sendCmd("SETTINGS")} title="설정">
            <ha-icon .icon=${"mdi:cog"} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            <span>설정</span>
          </button>
        </div>
      </div>
    `}_renderHdmi(){if(!(this.hdmiSelect||this.hdmiPower||this.hdmiPrev||this.hdmiNext))return G;const t=this.hdmiSelect?this._ent(this.hdmiSelect):void 0,e=t?.state??"",i=t?.attributes.options??[];return K`
      <div class="cn-section">
        <div class="cn-section__label">
          <span>HDMI 셀렉터</span>
          ${e?K`<span class="cn-section__hint" style="--vc:#22d3ee">포트 ${e}</span>`:G}
        </div>
        <div class="cn-nav-row">
          ${this.hdmiPower?K`
            <button class="cn-btn cn-btn--nav" @click=${()=>this._pressButton(this.hdmiPower)} title="전원">
              <ha-icon .icon=${"mdi:power"} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
              <span>전원</span>
            </button>
          `:G}
          ${this.hdmiPrev?K`
            <button class="cn-btn cn-btn--nav" @click=${()=>this._pressButton(this.hdmiPrev)} title="이전 포트">
              <ha-icon .icon=${"mdi:chevron-left"} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
              <span>이전</span>
            </button>
          `:G}
          ${this.hdmiNext?K`
            <button class="cn-btn cn-btn--nav" @click=${()=>this._pressButton(this.hdmiNext)} title="다음 포트">
              <span>다음</span>
              <ha-icon .icon=${"mdi:chevron-right"} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
            </button>
          `:G}
        </div>
        ${i.length?K`
          <div class="cn-apps">
            ${i.map(t=>K`
              <button class="cn-btn cn-btn--app ${t===e?"cn-btn--active":""}"
                      @click=${()=>this._selectOption(this.hdmiSelect,t)}>
                <span>${t}</span>
              </button>
            `)}
          </div>
        `:G}
      </div>
    `}_pressButton(t){t&&this.hass&&this.hass.callService("button","press",{entity_id:t})}_selectOption(t,e){t&&this.hass&&this.hass.callService("select","select_option",{entity_id:t,option:e})}_appLogoUrl(t){if(t.logo)return t.logo;const e=(t.label||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");return e?`https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/${e}.png`:null}_autoApps(){if(!this.sourceAppsEntity||!this.hass)return[];const t=this.hass.states[this.sourceAppsEntity];return(t?.attributes.source_list??[]).filter(t=>{const e=t.toLowerCase();return!t.includes(".")||!(e.startsWith("com.android")||e.startsWith("com.google.android.ext")||e.startsWith("com.google.android.gms")||e.startsWith("com.google.android.inputmethod")||e.startsWith("com.google.android.tv.remote")||e.includes(".systemui")||e.includes(".providers.")||e.includes(":coreservices"))}).slice(0,40).map(t=>({label:t.includes(".")?this._pkgToLabel(t):t,package:t.includes(".")?t:void 0}))}_pkgToLabel(t){const e={"com.netflix.ninja":"Netflix","com.google.android.youtube.tv":"YouTube","com.disney.disneyplus":"Disney+","com.apple.atve.androidtv.appletv":"Apple TV","net.cj.cjhv.gs.tving":"TVING","com.amazon.amazonvideo.livingroom":"Prime Video","kr.co.captv.pooqV2":"Wavve","com.frograms.wplay":"Watcha","com.coupang.mobile.play":"Coupang Play","com.hbo.hbonow":"HBO Max","tv.twitch.android.viewer":"Twitch","com.plexapp.android":"Plex","com.spotify.tv.android":"Spotify","com.google.android.apps.tv.launcherx":"Google TV"};if(e[t])return e[t];const i=t.split(".").pop()||t;return i.charAt(0).toUpperCase()+i.slice(1)}_effectiveApps(){const t=this.apps,e=this._autoApps();if(!e.length)return t;const i=new Set(t.map(t=>t.package).filter(Boolean)),n=[...t];for(const t of e)t.package&&i.has(t.package)||(n.push(t),t.package&&i.add(t.package));return n}_renderApps(){const t=this._effectiveApps();return t.length?K`
      <div class="cn-section">
        <div class="cn-section__label"><span>앱</span></div>
        <div class="cn-apps">
          ${t.map(t=>{const e=this._appLogoUrl(t);return K`
              <button
                class="cn-btn cn-btn--app"
                @click=${()=>this._launchApp(t)}
                title=${t.label}
              >
                ${e?K`<img class="cn-app-logo" src=${e} alt="" @error=${t=>{t.target.style.display="none"}} />`:t.icon?K`<ha-icon .icon=${t.icon} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>`:G}
                <span>${t.label}</span>
              </button>
            `})}
        </div>
      </div>
    `:G}render(){const t=this.deviceName||"TV 리모컨";return K`
      <div class="cn-modal__backdrop ${this._closing?"cn-modal__backdrop--closing":""}" @click=${this._onBackdrop}>
        <div class="cn-modal ${this._closing?"cn-modal--closing":""}" role="dialog" aria-modal="true" aria-label=${t}>
          ${this._renderHeader()}
          <div class="cn-modal__body">
            <div class="cn-remote">
              ${this._renderSources()}
              ${this._renderHdmi()}
              ${this._renderDpad()}
              ${this._renderVolume()}
              ${this._renderApps()}
            </div>
          </div>
        </div>
      </div>
    `}};It.styles=r`
    ${Pt}
    :host {
      position: fixed;
      inset: 0;
      z-index: 999999;
      font-family: ${o("'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif")};
      -webkit-font-smoothing: antialiased;
      --cn-accent: #22d3ee;
      --cn-surface-1: rgba(255, 255, 255, 0.06);
      --cn-surface-2: rgba(255, 255, 255, 0.10);
      --cn-surface-hover: rgba(255, 255, 255, 0.14);
      --cn-border: rgba(255, 255, 255, 0.10);
      --cn-border-strong: rgba(255, 255, 255, 0.18);
      --cn-text: #f4f6fb;
      --cn-text-dim: rgba(244, 246, 251, 0.62);
      --cn-text-muted: rgba(244, 246, 251, 0.42);
    }
    @keyframes cn-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cn-fade-out { from { opacity: 1; } to { opacity: 0; } }
    @keyframes cn-scale-in {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes cn-scale-out {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(8px) scale(0.98); }
    }

    .cn-modal__backdrop {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: radial-gradient(80% 60% at 50% 40%, rgba(20,22,28,0.55), rgba(0,0,0,0.75));
      backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
      animation: cn-fade-in 180ms ease;
    }
    .cn-modal__backdrop--closing { animation: cn-fade-out 180ms ease forwards; }

    .cn-modal {
      position: relative;
      width: min(380px, 100%);
      max-height: min(92vh, 820px);
      overflow: hidden;
      border-radius: 24px;
      color: var(--cn-text);
      background: linear-gradient(180deg, rgba(30, 32, 40, 0.92) 0%, rgba(18, 20, 26, 0.94) 100%);
      border: 1px solid var(--cn-border-strong);
      box-shadow:
        0 40px 100px rgba(0,0,0,0.55),
        0 6px 20px rgba(0,0,0,0.35),
        inset 0 1px 0 rgba(255,255,255,0.08);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      animation: cn-scale-in 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
    }
    .cn-modal--closing { animation: cn-scale-out 180ms ease forwards; }

    .cn-modal__head {
      position: relative;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 12px;
      border-bottom: 1px solid var(--cn-border);
    }
    .cn-modal__title {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--cn-text);
    }
    .cn-modal__title ha-icon { color: var(--cn-text-dim); }
    .cn-head__right { display: inline-flex; align-items: center; gap: 8px; }
    .cn-modal__close {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      border: 1px solid var(--cn-border);
      background: var(--cn-surface-1);
      color: var(--cn-text-dim);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s, transform 0.1s;
    }
    .cn-modal__close:hover { background: var(--cn-surface-hover); color: var(--cn-text); }
    .cn-modal__close:active { transform: scale(0.94); }

    .cn-modal__body {
      position: relative;
      z-index: 3;
      padding: 16px 18px 22px;
      overflow-y: auto;
    }

    ha-icon { display: inline-flex; align-items: center; justify-content: center; color: inherit; }

    .cn-remote { display: flex; flex-direction: column; gap: 18px; }

    /* Unified glass button — same look as remote-modal */
    .cn-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: 12px;
      border: 1px solid transparent;
      background:
        linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.00) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.18) 100%) border-box;
      backdrop-filter: blur(3px) saturate(140%);
      -webkit-backdrop-filter: blur(3px) saturate(140%);
      color: rgba(244,246,251,0.78);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
      isolation: isolate;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.32),
        0 2px 4px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
      transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.15s ease, box-shadow 0.18s ease;
    }
    .cn-btn::before {
      content: '';
      position: absolute;
      inset: 2px 2px auto 2px;
      height: 45%;
      border-radius: 10px 10px 40% 40% / 10px 10px 100% 100%;
      background: linear-gradient(to bottom, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
      z-index: 1;
    }
    .cn-btn > * { position: relative; z-index: 2; }
    .cn-btn:hover:not(:disabled) { color: var(--cn-text); transform: translateY(-1px); }
    .cn-btn:active:not(:disabled) { transform: scale(0.97); }
    .cn-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .cn-btn:focus-visible { outline: 2px solid var(--cn-accent); outline-offset: 2px; }

    .cn-btn--active {
      color: var(--cn-accent);
      background:
        linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.02) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.25) 100%) border-box;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.35),
        0 0 0 1px color-mix(in srgb, var(--cn-accent) 55%, transparent),
        0 0 6px color-mix(in srgb, var(--cn-accent) 35%, transparent),
        inset 0 1px 0 rgba(255, 255, 255, 0.28),
        inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    }
    .cn-btn--active ha-icon { color: var(--cn-accent); }

    /* Power in header */
    .cn-btn--pwr-hdr {
      width: 36px; height: 32px;
      border-radius: 10px;
      --cn-accent: #34d399;
    }

    /* Sections */
    .cn-section { display: flex; flex-direction: column; gap: 10px; }
    .cn-section__label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.10em;
      text-transform: uppercase;
      color: var(--cn-text-dim);
      padding: 0 2px;
      gap: 8px;
    }
    .cn-section__right { display: inline-flex; align-items: center; gap: 10px; text-transform: none; letter-spacing: 0; }
    .cn-section__hint {
      font-size: 13px; font-weight: 700; letter-spacing: -0.01em;
      text-transform: none; color: var(--vc, var(--cn-text-muted));
      font-variant-numeric: tabular-nums;
    }

    /* Segmented control */
    .cn-seg { display: flex; gap: 6px; border-radius: 14px; flex-wrap: wrap; }
    .cn-btn--seg { flex: 1; min-height: 40px; border-radius: 10px; font-size: 13px; min-width: 68px; }

    /* D-Pad — 3x3 grid, circular buttons */
    .cn-dpad {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
      gap: 8px;
      width: min(240px, 100%);
      aspect-ratio: 1 / 1;
      margin: 0 auto;
      padding: 10px;
      border-radius: 50%;
      background:
        radial-gradient(circle at 50% 45%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.00) 65%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.10) 100%) border-box;
      border: 1px solid transparent;
      box-shadow:
        inset 0 2px 6px rgba(0,0,0,0.30),
        inset 0 -1px 0 rgba(255,255,255,0.05),
        0 4px 14px rgba(0,0,0,0.28);
    }
    .cn-dpad__slot { pointer-events: none; }
    .cn-dpad__btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid transparent;
      background:
        linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0.20) 100%) border-box;
      color: rgba(244,246,251,0.86);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
      isolation: isolate;
      box-shadow:
        0 6px 14px rgba(0,0,0,0.28),
        inset 0 1px 0 rgba(255,255,255,0.28),
        inset 0 -1px 0 rgba(0,0,0,0.15);
      transition: transform 0.1s ease, color 0.15s ease;
    }
    .cn-dpad__btn::before {
      content: '';
      position: absolute;
      inset: 3px 3px auto 3px;
      height: 45%;
      border-radius: 50% 50% 40% 40% / 50% 50% 100% 100%;
      background: linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
    }
    .cn-dpad__btn > * { position: relative; z-index: 2; }
    .cn-dpad__btn:hover { color: #fff; }
    .cn-dpad__btn:active { transform: scale(0.92); }
    .cn-dpad__btn--ok {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.04em;
      color: var(--cn-text);
      background:
        linear-gradient(145deg, rgba(34,211,238,0.14) 0%, rgba(34,211,238,0.04) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.55) 0%, rgba(34,211,238,0.35) 55%, rgba(255,255,255,0.30) 100%) border-box;
      box-shadow:
        0 6px 18px rgba(0,0,0,0.34),
        0 0 12px rgba(34,211,238,0.18),
        inset 0 1px 0 rgba(255,255,255,0.35),
        inset 0 -1px 0 rgba(0,0,0,0.18);
    }

    .cn-nav-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
      margin-top: 4px;
    }
    .cn-nav-row--2 { grid-template-columns: 1fr 1fr; }
    .cn-btn--nav { min-height: 40px; border-radius: 12px; font-size: 12px; gap: 6px; }
    .cn-btn--nav ha-icon { color: var(--cn-text-dim); }

    /* Volume row */
    .cn-vol-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      align-items: center;
      gap: 8px;
    }
    .cn-btn--vol { height: 44px; border-radius: 12px; }
    .cn-vol-row__mid {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 44px;
      color: var(--cn-text-dim);
      background:
        linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.14) 100%) border-box;
      border: 1px solid transparent;
      border-radius: 12px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
    }

    /* Apps chips */
    .cn-app-logo {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .cn-apps {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .cn-btn--app {
      flex: 0 0 auto;
      min-height: 34px;
      padding: 0 12px;
      border-radius: 999px;
      font-size: 12px;
      gap: 5px;
    }
    .cn-btn--app ha-icon { color: var(--cn-text-dim); }

    @media (max-width: 480px) {
      .cn-modal { border-radius: 22px; max-height: 94vh; }
      .cn-dpad { width: min(220px, 100%); }
    }
  `,t([gt({attribute:!1})],It.prototype,"hass",void 0),t([gt({type:String})],It.prototype,"remote",void 0),t([gt({type:String})],It.prototype,"tvEntity",void 0),t([gt({type:String})],It.prototype,"volumeEntity",void 0),t([gt({type:String})],It.prototype,"deviceName",void 0),t([gt({attribute:!1})],It.prototype,"apps",void 0),t([gt({type:String})],It.prototype,"sourceAppsEntity",void 0),t([gt({type:String})],It.prototype,"hdmiSelect",void 0),t([gt({type:String})],It.prototype,"hdmiPower",void 0),t([gt({type:String})],It.prototype,"hdmiPrev",void 0),t([gt({type:String})],It.prototype,"hdmiNext",void 0),t([_t()],It.prototype,"_closing",void 0),It=t([pt("cardnews-tv-remote-modal")],It);const Ht=o("@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');");function jt(t,e,i){const n=i*e,s=t%360/60,a=n*(1-Math.abs(s%2-1));let o=0,r=0,c=0;s>=0&&s<1?(o=n,r=a):s<2?(o=a,r=n):s<3?(r=n,c=a):s<4?(r=a,c=n):s<5?(o=a,c=n):(o=n,c=a);const l=i-n;return[Math.round(255*(o+l)),Math.round(255*(r+l)),Math.round(255*(c+l))]}function Dt([t,e,i]){return`rgb(${t}, ${e}, ${i})`}function Rt(t){const e=Math.max(1e3,Math.min(4e4,t))/100;let i,n,s;e<=66?(i=255,n=99.4708025861*Math.log(e)-161.1195681661,s=e<=19?0:138.5177312231*Math.log(e-10)-305.0447927307):(i=329.698727446*Math.pow(e-60,-.1332047592),n=288.1221695283*Math.pow(e-60,-.0755148492),s=255);const a=t=>Math.round(Math.max(0,Math.min(255,t)));return[a(i),a(n),a(s)]}const Ot=[{label:"웜 화이트",kind:"temp",k:2700,brightness_pct:80},{label:"독서",kind:"temp",k:4e3,brightness_pct:90},{label:"영화",kind:"temp",k:2200,brightness_pct:20},{label:"파티",kind:"hs",hs:[320,80],brightness_pct:70}];let Ft=class extends dt{constructor(){super(...arguments),this.entity="",this.deviceName="",this._closing=!1,this._activeScope=-1,this._hue=0,this._sat=100,this._brightPct=100,this._kelvin=3500,this._dragging=!1,this._history=[],this._activeSlider=null,this._dragSliderValue=null,this._initialized=!1,this._lastControl="color",this._lastServiceCall=0,this._pendingColor=null,this._pendingColorTimer=null,this._keydownHandler=t=>{"Escape"===t.key&&this._close()},this._hassPollTimer=null}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._keydownHandler),document.body.style.overflow="hidden",this._loadHistory(),this._hassPollTimer=window.setInterval(()=>{const t=document.querySelector("home-assistant")?.hass;if(!t)return;const e=this.hass?.states[this.entity]?.state,i=t.states?.[this.entity]?.state;this.hass===t&&e===i||(this.hass=t)},400)}disconnectedCallback(){document.removeEventListener("keydown",this._keydownHandler),document.body.style.overflow="",this._hassPollTimer&&(window.clearInterval(this._hassPollTimer),this._hassPollTimer=null),super.disconnectedCallback()}updated(t){if(!this._initialized&&this.hass){const t=this._primaryEntity();if(t){const e=t.attributes,i=e.hs_color,n=Number(e.brightness);i&&Array.isArray(i)&&(this._hue=i[0],this._sat=i[1]),Number.isFinite(n)&&(this._brightPct=Math.round(n/255*100));const s=Number(e.color_temp_kelvin);Number.isFinite(s)&&(this._kelvin=s);const a=String(e.color_mode??"");this._lastControl="color_temp"===a?"temp":"hs"===a||"xy"===a||"rgb"===a||"rgbw"===a||"rgbww"===a||this._supportsColor()?"color":"temp",this._initialized=!0}}(t.has("_hue")||t.has("_sat")||t.has("hass")&&!this._wheelCanvas)&&Promise.resolve().then(()=>this._drawWheel())}firstUpdated(){this._drawWheel()}_allEntities(){return this.entities&&this.entities.length?this.entities:this.entity?[this.entity]:[]}_targetEntities(){const t=this._allEntities();return this._activeScope<0?t:this._activeScope>=0&&this._activeScope<t.length?[t[this._activeScope]]:t}_primaryEntity(){const t=this._allEntities();if(!t.length||!this.hass)return;const e=this._activeScope>=0&&this._activeScope<t.length?this._activeScope:0;return this.hass.states[t[e]]}_scopeLabel(t){if(this.labels&&this.labels[t])return this.labels[t];const e=this._allEntities()[t];if(!e)return`#${t+1}`;const i=this.hass?.states[e],n=i?.attributes?.friendly_name;return"string"==typeof n&&n?n:e.split(".")[1]??e}_syncFromPrimary(){const t=this._primaryEntity();if(!t)return;const e=t.attributes,i=e.hs_color,n=Number(e.brightness);i&&Array.isArray(i)&&(this._hue=i[0],this._sat=i[1]),Number.isFinite(n)&&(this._brightPct=Math.round(n/255*100));const s=Number(e.color_temp_kelvin);Number.isFinite(s)&&(this._kelvin=s);const a=String(e.color_mode??"");"color_temp"===a?this._lastControl="temp":"hs"!==a&&"xy"!==a&&"rgb"!==a&&"rgbw"!==a&&"rgbww"!==a||(this._lastControl="color")}_setScope(t){this._activeScope!==t&&(this._activeScope=t,this._syncFromPrimary())}_supportsColor(){const t=this._primaryEntity();return!t||(t.attributes.supported_color_modes??[]).some(t=>["hs","xy","rgb","rgbw","rgbww"].includes(t))}_supportsColorTemp(){const t=this._primaryEntity();return!t||(t.attributes.supported_color_modes??[]).includes("color_temp")}_minKelvin(){const t=this._primaryEntity();return Number(t?.attributes.min_color_temp_kelvin)||2e3}_maxKelvin(){const t=this._primaryEntity();return Number(t?.attributes.max_color_temp_kelvin)||6500}_clampKelvin(t){const e=this._minKelvin(),i=this._maxKelvin();return Number.isFinite(t)?Math.max(e,Math.min(i,t)):Math.round((e+i)/2)}_historyKey(){return`cardnews.lightHistory.v2.${this._targetEntities().join(",")}`}_loadHistory(){try{const t=localStorage.getItem(this._historyKey());if(t){const e=JSON.parse(t);Array.isArray(e)&&(this._history=e.filter(t=>t&&("hs"===t.type&&Number.isFinite(t.h)||"temp"===t.type&&Number.isFinite(t.k))).slice(0,10))}}catch{}}_pushHistoryHs(t,e){const i=Math.round(t),n=Math.round(e),s=this._history.filter(t=>!("hs"===t.type&&Math.round(t.h)===i&&Math.round(t.s)===n)),a={type:"hs",h:i,s:n};this._history=[a,...s].slice(0,10)}_pushHistoryTemp(t){const e=50*Math.round(t/50),i=this._history.filter(t=>!("temp"===t.type&&50*Math.round(t.k/50)===e)),n={type:"temp",k:e};this._history=[n,...i].slice(0,10)}_saveHistory(){try{localStorage.setItem(this._historyKey(),JSON.stringify(this._history))}catch{}}_callLight(t){if(!this.hass)return;const e=this._targetEntities();e.length&&this.hass.callService("light","turn_on",{entity_id:e,...t})}_applyColorDebounced(t,e){this._pendingColor={h:t,s:e},performance.now()-this._lastServiceCall>200?this._flushColor():this._pendingColorTimer||(this._pendingColorTimer=window.setTimeout(()=>this._flushColor(),200))}_flushColor(){if(!this._pendingColor)return;const{h:t,s:e}=this._pendingColor;this._pendingColor=null,this._pendingColorTimer&&(window.clearTimeout(this._pendingColorTimer),this._pendingColorTimer=null),this._lastServiceCall=performance.now(),this._callLight({hs_color:[t,e]})}_commitColor(t,e){this._hue=t,this._sat=e,this._lastControl="color",this._pendingColorTimer&&(window.clearTimeout(this._pendingColorTimer),this._pendingColorTimer=null),this._pendingColor=null,this._lastServiceCall=performance.now(),this._callLight({hs_color:[t,e]})}_commitTemp(t){const e=this._clampKelvin(t);this._kelvin=e,this._lastControl="temp",this._callLight({color_temp_kelvin:e})}_close(){this._closing||("color"===this._lastControl&&Number.isFinite(this._hue)&&Number.isFinite(this._sat)&&this._sat>5?this._pushHistoryHs(this._hue,this._sat):"temp"===this._lastControl&&Number.isFinite(this._kelvin)&&this._pushHistoryTemp(this._kelvin),this._saveHistory(),this._closing=!0,setTimeout(()=>{this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0})),this.parentElement&&this.parentElement.removeChild(this)},180))}_onBackdrop(t){t.target.classList.contains("cn-modal__backdrop")&&this._close()}_drawWheel(){const t=this._wheelCanvas;if(!t)return;const e=t.width,i=t.getContext("2d");if(!i)return;const n=e/2,s=e/2,a=e/2-2,o=i.createImageData(e,e),r=o.data;for(let t=0;t<e;t++)for(let i=0;i<e;i++){const o=i-n,c=t-s,l=Math.sqrt(o*o+c*c),d=4*(t*e+i);if(l>a){r[d+3]=0;continue}let h=180*Math.atan2(c,o)/Math.PI;h<0&&(h+=360);const p=Math.min(1,l/a),[m,u,g]=jt(h,p,1);r[d]=m,r[d+1]=u,r[d+2]=g;const _=a-l;r[d+3]=_<1?Math.round(255*_):255}i.putImageData(o,0,0)}_wheelPointerDown(t){t.preventDefault();const e=t.currentTarget;e.setPointerCapture(t.pointerId),this._dragging=!0;const i=t=>this._handleWheelEvent(t,e,!1),n=s=>{this._handleWheelEvent(s,e,!0),this._dragging=!1,e.releasePointerCapture(t.pointerId),e.removeEventListener("pointermove",i),e.removeEventListener("pointerup",n),e.removeEventListener("pointercancel",n)};e.addEventListener("pointermove",i),e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),this._handleWheelEvent(t,e,!1)}_handleWheelEvent(t,e,i){const n=e.getBoundingClientRect(),s=n.width/2,a=n.height/2,o=t.clientX-n.left-s,r=t.clientY-n.top-a,c=Math.sqrt(o*o+r*r),l=Math.min(n.width,n.height)/2-2;let d=180*Math.atan2(r,o)/Math.PI;d<0&&(d+=360);const h=100*Math.max(0,Math.min(1,c/l));this._hue=d,this._sat=h,this._lastControl="color",i?this._commitColor(d,h):this._applyColorDebounced(d,h)}_sliderPointerDown(t,e,i,n,s,a,o){e.preventDefault();const r=e.currentTarget;r.setPointerCapture(e.pointerId),this._activeSlider=t;const c=t=>{const e=r.getBoundingClientRect(),a=Math.max(0,Math.min(1,(t-e.left)/e.width)),o=i+a*(n-i),c=Math.round(o/s)*s;return Math.max(i,Math.min(n,c))},l=t=>{const e=c(t.clientX);this._dragSliderValue=e,a(e)},d=t=>{const i=c(t.clientX);this._dragSliderValue=null,this._activeSlider=null,r.releasePointerCapture(e.pointerId),r.removeEventListener("pointermove",l),r.removeEventListener("pointerup",d),r.removeEventListener("pointercancel",d),o(i)};r.addEventListener("pointermove",l),r.addEventListener("pointerup",d),r.addEventListener("pointercancel",d);const h=c(e.clientX);this._dragSliderValue=h,a(h)}_brightFillGradient(){if("temp"===this._lastControl){const[t,e,i]=Rt(this._kelvin);return`linear-gradient(90deg, rgb(${Math.round(.4*t)}, ${Math.round(.4*e)}, ${Math.round(.4*i)}) 0%, rgb(${t}, ${e}, ${i}) 100%)`}const t=Math.round(this._hue),e=Math.round(this._sat);return`linear-gradient(90deg, hsl(${t}, ${e}%, 22%) 0%, hsl(${t}, ${e}%, 55%) 100%)`}_renderBrightnessSlider(){const t="brightness"===this._activeSlider&&null!==this._dragSliderValue?this._dragSliderValue:this._brightPct,e=t,i=this._brightFillGradient();return K`
      <div class="cn-section">
        <div class="cn-section__label">
          <span>밝기</span>
          <span class="cn-section__hint">${Math.round(t)}%</span>
        </div>
        <div class="cn-slider cn-slider--bright" style="--pct:${e}%; --bright-grad:${i}">
          <div class="cn-slider__track cn-slider__track--bright"
               @pointerdown=${t=>this._sliderPointerDown("brightness",t,1,100,1,t=>{this._brightPct=t},t=>{this._brightPct=t,"temp"===this._lastControl?this._callLight({brightness_pct:t,color_temp_kelvin:this._clampKelvin(this._kelvin)}):this._callLight({brightness_pct:t,hs_color:[this._hue,this._sat]})})}>
          </div>
          <div class="cn-slider__thumb" style="left:calc((100% - 32px) * ${e} / 100 + 16px)"></div>
        </div>
      </div>
    `}_renderColorTempSlider(){if(!this._supportsColorTemp())return G;const t=this._minKelvin(),e=this._maxKelvin(),i="ct"===this._activeSlider&&null!==this._dragSliderValue?this._dragSliderValue:this._clampKelvin(this._kelvin),n=(i-t)/(e-t)*100;return K`
      <div class="cn-section">
        <div class="cn-section__label">
          <span>색온도</span>
          <span class="cn-section__hint">${Math.round(i)}K</span>
        </div>
        <div class="cn-slider cn-slider--ct" style="--pct:${n}%">
          <div class="cn-slider__track cn-slider__track--ct"
               @pointerdown=${i=>this._sliderPointerDown("ct",i,t,e,50,t=>{this._kelvin=t,this._lastControl="temp"},t=>{this._commitTemp(t)})}>
          </div>
          <div class="cn-slider__thumb" style="left:calc((100% - 32px) * ${n} / 100 + 16px)"></div>
        </div>
        ${this._renderPresetChips()}
      </div>
    `}_renderPresetChips(){return K`
      <div class="cn-presets-chips">
        ${Ot.map(t=>{let e;if("temp"===t.kind){const[i,n,s]=Rt(t.k);e=Dt([i,n,s])}else{const[i,n,s]=jt(t.hs[0],t.hs[1]/100,1);e=Dt([i,n,s])}return K`
            <button class="cn-chip" style="--pcol:${e}"
                    @click=${()=>this._applyPreset(t)}>
              <span class="cn-chip__dot"></span>
              <span class="cn-chip__lbl">${t.label}</span>
            </button>
          `})}
      </div>
    `}_applyPreset(t){if(this._brightPct=t.brightness_pct,"temp"===t.kind){const e=this._clampKelvin(t.k);this._kelvin=e,this._lastControl="temp",this._callLight({color_temp_kelvin:e,brightness_pct:t.brightness_pct}),this._pushHistoryTemp(e)}else this._hue=t.hs[0],this._sat=t.hs[1],this._lastControl="color",this._callLight({hs_color:t.hs,brightness_pct:t.brightness_pct}),this._pushHistoryHs(t.hs[0],t.hs[1])}_renderHistory(){return this._history.length?K`
      <div class="cn-section">
        <div class="cn-section__label"><span>최근 사용</span></div>
        <div class="cn-history">
          ${this._history.map(t=>{if("hs"===t.type){const[e,i,n]=jt(t.h,t.s/100,1);return K`
                <button class="cn-swatch cn-swatch--hs" style="background:${Dt([e,i,n])}"
                        title="H${Math.round(t.h)}° S${Math.round(t.s)}%"
                        @click=${()=>this._commitColor(t.h,t.s)}>
                </button>
              `}{const[e,i,n]=Rt(t.k);return K`
                <button class="cn-swatch cn-swatch--temp" style="background:${Dt([e,i,n])}"
                        title="${Math.round(t.k)}K"
                        @click=${()=>this._commitTemp(t.k)}>
                  <span class="cn-swatch__k">K</span>
                </button>
              `}})}
        </div>
      </div>
    `:G}_renderScopeSegment(){const t=this._allEntities();if(t.length<2)return G;const e=[{idx:-1,label:"전체"},...t.map((t,e)=>({idx:e,label:this._scopeLabel(e)}))];return K`
      <div class="cn-scope">
        ${e.map(t=>K`
          <button
            class="cn-scope__chip ${this._activeScope===t.idx?"cn-scope__chip--active":""}"
            @click=${()=>this._setScope(t.idx)}
          >${t.label}</button>
        `)}
      </div>
    `}render(){const t=this.deviceName||"조명",e=this._supportsColor(),i=this._supportsColorTemp(),n=this._primaryEntity(),s=!!n&&"on"===n.state,a="temp"===this._lastControl?Dt(Rt(this._kelvin)):Dt(jt(this._hue,this._sat/100,1)),o=s?a:"rgba(120,120,120,0.5)",r=!!n&&"unavailable"===n.state;return K`
      <div class="cn-modal__backdrop ${this._closing?"cn-modal__backdrop--closing":""}" @click=${this._onBackdrop}>
        <div class="cn-modal ${this._closing?"cn-modal--closing":""} ${s?"":"cn-modal--off"}" role="dialog" aria-modal="true" aria-label=${t}>
          <div class="cn-modal__head">
            <div class="cn-modal__title">
              <span class="cn-modal__preview" style="background:${o}"></span>
              <span>${t}</span>
              ${r?K`<span class="cn-modal__badge">unavailable</span>`:G}
            </div>
            <div class="cn-modal__head-right">
              <button class="cn-modal__power ${s?"cn-modal__power--on":""}"
                      @click=${()=>{if(s)this.hass?.callService("light","turn_off",{entity_id:this._targetEntities()});else{const t={};this._brightPct>0&&(t.brightness_pct=this._brightPct),"temp"===this._lastControl&&this._supportsColorTemp()?t.color_temp_kelvin=this._clampKelvin(this._kelvin):this._supportsColor()&&Number.isFinite(this._hue)&&Number.isFinite(this._sat)&&(t.hs_color=[this._hue,this._sat]),this._callLight(t)}}}
                      title="전원">
                <ha-icon .icon=${"mdi:power"} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
              </button>
              <button class="cn-modal__close" @click=${()=>this._close()} aria-label="닫기">
                <ha-icon .icon=${"mdi:close"} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
              </button>
            </div>
          </div>
          <div class="cn-modal__body">
            ${this._renderScopeSegment()}
            ${e?K`
              <div class="cn-section cn-section--wheel">
                <div class="cn-wheel-wrap">
                  <canvas class="cn-wheel__canvas" width="240" height="240"
                          @pointerdown=${t=>this._wheelPointerDown(t)}></canvas>
                  <div class="cn-wheel__pointer"
                       style="left:${50+Math.cos(this._hue*Math.PI/180)*(this._sat/2)}%;
                              top:${50+Math.sin(this._hue*Math.PI/180)*(this._sat/2)}%;
                              background:${Dt(jt(this._hue,this._sat/100,1))}"></div>
                </div>
              </div>
            `:G}
            ${i?this._renderColorTempSlider():G}
            ${this._renderBrightnessSlider()}
            ${this._renderHistory()}
          </div>
        </div>
      </div>
    `}};Ft.styles=r`
    ${Ht}
    :host {
      position: fixed;
      inset: 0;
      z-index: 999999;
      font-family: ${o("'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif")};
      -webkit-font-smoothing: antialiased;
      --cn-accent: #22d3ee;
      --cn-text: #f4f6fb;
      --cn-text-dim: rgba(244, 246, 251, 0.62);
      --cn-text-muted: rgba(244, 246, 251, 0.42);
      --cn-border: rgba(255, 255, 255, 0.10);
      --cn-border-strong: rgba(255, 255, 255, 0.18);
      --cn-surface-1: rgba(255, 255, 255, 0.06);
      --cn-surface-hover: rgba(255, 255, 255, 0.14);
    }
    @keyframes cn-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cn-fade-out { from { opacity: 1; } to { opacity: 0; } }
    @keyframes cn-scale-in {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes cn-scale-out {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(8px) scale(0.98); }
    }

    .cn-modal__backdrop {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: radial-gradient(80% 60% at 50% 40%, rgba(20,22,28,0.55), rgba(0,0,0,0.75));
      backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
      animation: cn-fade-in 180ms ease;
    }
    .cn-modal__backdrop--closing { animation: cn-fade-out 180ms ease forwards; }

    .cn-modal {
      position: relative;
      width: min(380px, 100%);
      max-height: min(90vh, 820px);
      overflow: hidden;
      border-radius: 24px;
      color: var(--cn-text);
      background: linear-gradient(180deg, rgba(30, 32, 40, 0.92) 0%, rgba(18, 20, 26, 0.94) 100%);
      border: 1px solid var(--cn-border-strong);
      box-shadow:
        0 40px 100px rgba(0,0,0,0.55),
        0 6px 20px rgba(0,0,0,0.35),
        inset 0 1px 0 rgba(255,255,255,0.08);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      animation: cn-scale-in 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
    }
    .cn-modal--closing { animation: cn-scale-out 180ms ease forwards; }

    .cn-modal__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 18px 12px;
      border-bottom: 1px solid var(--cn-border);
      gap: 10px;
    }
    .cn-modal__title {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .cn-modal--off .cn-modal__body { filter: grayscale(0.6) brightness(0.7); opacity: 0.75; transition: filter 0.2s ease, opacity 0.2s ease; }
    .cn-modal__body { transition: filter 0.2s ease, opacity 0.2s ease; }
    .cn-modal__preview {
      display: inline-block;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.35);
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.4);
    }
    .cn-modal__badge {
      font-size: 13px;
      padding: 2px 6px;
      border-radius: 6px;
      background: rgba(248,113,113,0.18);
      color: #fca5a5;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .cn-modal__head-right { display: inline-flex; gap: 6px; align-items: center; }
    .cn-modal__close, .cn-modal__power {
      width: 32px; height: 32px;
      border-radius: 10px;
      border: 1px solid var(--cn-border);
      background: var(--cn-surface-1);
      color: var(--cn-text-dim);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s, transform 0.1s;
    }
    .cn-modal__close:hover, .cn-modal__power:hover { background: var(--cn-surface-hover); color: var(--cn-text); }
    .cn-modal__power--on { color: #34d399; border-color: rgba(52, 211, 153, 0.5); }
    .cn-modal__body {
      padding: 16px 18px 22px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    ha-icon { display: inline-flex; align-items: center; justify-content: center; color: inherit; }

    .cn-section { display: flex; flex-direction: column; gap: 10px; }
    .cn-section__label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.10em;
      text-transform: uppercase;
      color: var(--cn-text-dim);
      padding: 0 2px;
    }
    .cn-section__hint {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.01em;
      text-transform: none;
      color: var(--cn-text);
      font-variant-numeric: tabular-nums;
    }

    /* ---- Color wheel ---- */
    .cn-section--wheel { align-items: center; }
    .cn-wheel-wrap {
      position: relative;
      width: 240px;
      height: 240px;
      touch-action: none;
      filter: drop-shadow(0 6px 18px rgba(0,0,0,0.45));
    }
    .cn-wheel__canvas {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      cursor: crosshair;
      display: block;
    }
    .cn-wheel__pointer {
      position: absolute;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      border: 3px solid rgba(255,255,255,0.95);
      box-shadow: 0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.5);
      pointer-events: none;
    }

    /* ---- Slider (brightness / color temp) ---- */
    /* IMPORTANT: thumb is a sibling of track (both inside .cn-slider), not inside track,
       so the track can safely keep overflow:hidden for its rounded pill fill without
       clipping the thumb at pct=0 or pct=100. Thumb position is computed as
       calc((100% - 32px) * pct/100 + 16px) so the thumb's 32px width always fits
       within the slider bounds without any translate hack pulling it outside. */
    .cn-slider {
      position: relative;
      outline: none; user-select: none; -webkit-tap-highlight-color: transparent;
      padding: 4px 0;
      touch-action: none;
      box-sizing: border-box;
      width: 100%;
    }
    .cn-slider__track {
      outline: none; user-select: none; -webkit-tap-highlight-color: transparent;
      position: relative;
      height: 44px;
      border-radius: 22px;
      background:
        linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.16) 100%);
      border: none;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      cursor: pointer;
      overflow: visible;
    }
    .cn-slider__track--bright {
      background: var(--bright-grad, linear-gradient(90deg, #333 0%, #eee 100%)) !important;
    }
    /* Color-temp track: full-width gradient across kelvin range */
    .cn-slider__track--ct {
      background:
        linear-gradient(90deg, #ff9a4b 0%, #ffdba0 25%, #ffffff 55%, #a8d5ff 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 55%, rgba(255,255,255,0.14) 100%) border-box;
    }
    .cn-slider__thumb {
      position: absolute;
      /* vertical center of the .cn-slider (which has 4px top/bottom padding + 44px track = 52px) */
      top: 50%;
      /* left is set inline via calc((100% - 32px) * pct/100 + 16px) — thumb width = 32px */
      width: 32px;
      height: 32px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background:
        radial-gradient(65% 65% at 32% 28%,
          rgba(255,255,255,0.98) 0%,
          rgba(255,255,255,0.75) 45%,
          rgba(255,255,255,0.5) 100%);
      border: 1px solid rgba(255,255,255,0.85);
      backdrop-filter: blur(10px) saturate(160%);
      -webkit-backdrop-filter: blur(10px) saturate(160%);
      box-shadow:
        0 4px 10px rgba(0,0,0,0.35),
        0 1px 2px rgba(0,0,0,0.18),
        inset 0 1.5px 0 rgba(255,255,255,0.95),
        inset 0 -1.5px 2px rgba(0,0,0,0.15);
      pointer-events: none;
      transition: left 120ms ease;
    }
    .cn-slider__thumb::before {
      content: '';
      position: absolute;
      top: 3px;
      left: 6px;
      right: 6px;
      height: 35%;
      border-radius: 50% 50% 40% 40% / 60% 60% 30% 30%;
      background: linear-gradient(to bottom,
        rgba(255,255,255,0.8) 0%,
        rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }

    /* ---- Preset chips (below color-temp slider) ---- */
    .cn-presets-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 2px 0 0;
    }
    .cn-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 30px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid var(--cn-border);
      background: var(--cn-surface-1);
      color: var(--cn-text);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
      cursor: pointer;
      transition: background 0.15s, transform 0.12s;
    }
    .cn-chip:hover { background: var(--cn-surface-hover); }
    .cn-chip:active { transform: scale(0.96); }
    .cn-chip__dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--pcol, #fff);
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.4);
      flex-shrink: 0;
    }
    .cn-chip__lbl { flex: 1; text-align: left; white-space: nowrap; }

    /* ---- History swatches ---- */
    .cn-history {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .cn-swatch {
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.14);
      cursor: pointer;
      padding: 0;
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.3), 0 2px 6px rgba(0,0,0,0.35);
      transition: transform 0.12s, border-color 0.15s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .cn-swatch:hover { transform: scale(1.08); border-color: rgba(255,255,255,0.4); }
    .cn-swatch:active { transform: scale(0.94); }
    .cn-swatch--temp {
      border-color: rgba(255,255,255,0.28);
    }
    .cn-swatch__k {
      font-family: inherit;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.02em;
      color: rgba(20,22,28,0.72);
      text-shadow: 0 1px 0 rgba(255,255,255,0.55);
      pointer-events: none;
    }

    /* ---- Scope segment (group vs individual light) ---- */
    .cn-scope {
      display: flex;
      gap: 6px;
      padding: 4px;
      background: rgba(0,0,0,0.24);
      border: 1px solid var(--cn-border);
      border-radius: 14px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .cn-scope::-webkit-scrollbar { display: none; }
    .cn-scope__chip {
      flex: 1 0 auto;
      min-height: 32px;
      padding: 0 14px;
      border: none;
      border-radius: 10px;
      background: transparent;
      color: var(--cn-text-dim);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: -0.01em;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .cn-scope__chip:hover { color: var(--cn-text); background: rgba(255,255,255,0.06); }
    .cn-scope__chip:active { transform: scale(0.96); }
    .cn-scope__chip--active {
      background: linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.08) 100%);
      color: var(--cn-text);
      box-shadow: 0 2px 6px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14);
    }

    @media (max-width: 480px) {
      .cn-modal { border-radius: 22px; max-height: 94vh; }
      .cn-wheel-wrap { width: 220px; height: 220px; }
      .cn-wheel__canvas { width: 220px; height: 220px; }
    }
  `,t([gt({attribute:!1})],Ft.prototype,"hass",void 0),t([gt({type:String})],Ft.prototype,"entity",void 0),t([gt({attribute:!1})],Ft.prototype,"entities",void 0),t([gt({attribute:!1})],Ft.prototype,"labels",void 0),t([gt({type:String})],Ft.prototype,"deviceName",void 0),t([_t()],Ft.prototype,"_closing",void 0),t([_t()],Ft.prototype,"_activeScope",void 0),t([_t()],Ft.prototype,"_hue",void 0),t([_t()],Ft.prototype,"_sat",void 0),t([_t()],Ft.prototype,"_brightPct",void 0),t([_t()],Ft.prototype,"_kelvin",void 0),t([_t()],Ft.prototype,"_dragging",void 0),t([_t()],Ft.prototype,"_history",void 0),t([_t()],Ft.prototype,"_activeSlider",void 0),t([_t()],Ft.prototype,"_dragSliderValue",void 0),t([_t()],Ft.prototype,"_initialized",void 0),t([_t()],Ft.prototype,"_lastControl",void 0),t([(t,e,i)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(t,e,{get(){return t=this,t.renderRoot?.querySelector(".cn-wheel__canvas")??null;var t}})],Ft.prototype,"_wheelCanvas",void 0),Ft=t([pt("cardnews-light-modal")],Ft);const Bt=o("@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');"),Ut=["일","월","화","수","목","금","토"],Vt=/(https?:\/\/[^\s<>"'`]+)/g;function Kt(t){return String(t).padStart(2,"0")}function Wt(t){return`${t.getFullYear()}.${Kt(t.getMonth()+1)}.${Kt(t.getDate())} (${Ut[t.getDay()]})`}function qt(t){return`${Kt(t.getHours())}:${Kt(t.getMinutes())}`}function Gt(t){const e=[];let i=0;const n=t.matchAll(Vt);for(const s of n){const n=s.index??0;n>i&&e.push(t.slice(i,n));const a=s[0];e.push(K`<a href=${a} target="_blank" rel="noopener noreferrer">${a}</a>`),i=n+a.length}return i<t.length&&e.push(t.slice(i)),K`${e}`}let Yt=class extends dt{constructor(){super(...arguments),this.entityId="",this.calendarName="",this._closing=!1,this._keydownHandler=t=>{"Escape"===t.key&&this._close()}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._keydownHandler),document.body.style.overflow="hidden"}disconnectedCallback(){document.removeEventListener("keydown",this._keydownHandler),document.body.style.overflow="",super.disconnectedCallback()}_close(){this._closing||(this._closing=!0,setTimeout(()=>{this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0})),this.parentElement&&this.parentElement.removeChild(this)},180))}_onBackdrop(t){t.target.classList.contains("cn-modal__backdrop")&&this._close()}render(){const t=this.event,e=t?.summary||"(제목 없음)",i=t?function(t,e,i){if(!t)return"";const n=new Date(t);if(isNaN(n.getTime()))return t;const s=Wt(n);if(i||!/T\d/.test(t)){if(!e)return`${s} · 하루종일`;const t=new Date(e),i=Wt(new Date(t.getTime()-1));return i===s?`${s} · 하루종일`:`${s} → ${i}`}const a=qt(n);if(!e)return`${s} · ${a}`;const o=new Date(e),r=Wt(o),c=qt(o);return r===s?`${s} · ${a} — ${c}`:`${s} ${a} → ${r} ${c}`}(t.start,t.end,!!t.allDay):"",n=(t?.description??"").trim(),s=(t?.location??"").trim();return K`
      <div class="cn-modal__backdrop ${this._closing?"cn-modal__backdrop--closing":""}" @click=${this._onBackdrop}>
        <div class="cn-modal ${this._closing?"cn-modal--closing":""}" role="dialog" aria-modal="true" aria-label=${e}>
          <div class="cn-modal__head">
            <div class="cn-modal__title">
              <span class="cn-modal__title-txt">${e}</span>
            </div>
            <button class="cn-modal__close" @click=${()=>this._close()} aria-label="닫기">
              <ha-icon .icon=${"mdi:close"} style="--mdc-icon-size:20px;width:20px;height:20px"></ha-icon>
            </button>
          </div>
          <div class="cn-modal__body">
            ${i?K`
              <div class="cn-ev-field">
                <div class="cn-ev-field__label">일시</div>
                <div class="cn-ev-field__value">${i}</div>
              </div>`:G}
            ${this.calendarName?K`
              <div class="cn-ev-field">
                <div class="cn-ev-field__label">캘린더</div>
                <div class="cn-ev-field__value">${this.calendarName}</div>
              </div>`:G}
            ${s?K`
              <div class="cn-ev-field">
                <div class="cn-ev-field__label">장소</div>
                <div class="cn-ev-field__value">${Gt(s)}</div>
              </div>`:G}
            ${n?K`
              <div class="cn-ev-field">
                <div class="cn-ev-field__label">상세</div>
                <div class="cn-ev-field__value cn-ev-field__value--desc">${Gt(n)}</div>
              </div>`:G}
            ${n||s?G:K`
              <div class="cn-ev-empty">추가 정보 없음</div>`}
          </div>
        </div>
      </div>
    `}};Yt.styles=r`
    ${Bt}
    :host {
      position: fixed;
      inset: 0;
      z-index: 999999;
      font-family: ${o("'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif")};
      -webkit-font-smoothing: antialiased;
      --cn-accent: #22d3ee;
      --cn-text: #f4f6fb;
      --cn-text-dim: rgba(244, 246, 251, 0.62);
      --cn-text-muted: rgba(244, 246, 251, 0.42);
      --cn-border: rgba(255, 255, 255, 0.10);
      --cn-border-strong: rgba(255, 255, 255, 0.18);
    }
    @keyframes cn-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cn-fade-out { from { opacity: 1; } to { opacity: 0; } }
    @keyframes cn-scale-in {
      from { opacity: 0; transform: translateY(12px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes cn-scale-out {
      from { opacity: 1; transform: translateY(0) scale(1); }
      to { opacity: 0; transform: translateY(8px) scale(0.98); }
    }
    .cn-modal__backdrop {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: radial-gradient(80% 60% at 50% 40%, rgba(20,22,28,0.55), rgba(0,0,0,0.75));
      backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
      animation: cn-fade-in 180ms ease;
    }
    .cn-modal__backdrop--closing { animation: cn-fade-out 180ms ease forwards; }
    .cn-modal {
      position: relative;
      width: min(440px, 100%);
      max-height: min(84vh, 720px);
      overflow: hidden;
      border-radius: 22px;
      color: var(--cn-text);
      background: linear-gradient(180deg, rgba(30, 32, 40, 0.92) 0%, rgba(18, 20, 26, 0.94) 100%);
      border: 1px solid var(--cn-border-strong);
      box-shadow:
        0 40px 100px rgba(0,0,0,0.55),
        0 6px 20px rgba(0,0,0,0.35),
        inset 0 1px 0 rgba(255,255,255,0.08);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      animation: cn-scale-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
      display: flex;
      flex-direction: column;
    }
    .cn-modal--closing { animation: cn-scale-out 180ms ease forwards; }
    .cn-modal__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 18px 14px;
      border-bottom: 1px solid var(--cn-border);
    }
    .cn-modal__title {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;
    }
    .cn-modal__title-txt {
      font-weight: 700;
      font-size: 17px;
      letter-spacing: -0.01em;
      line-height: 1.3;
      color: var(--cn-text);
      overflow-wrap: anywhere;
    }
    .cn-modal__close {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 999px;
      border: 1px solid var(--cn-border);
      background: rgba(255,255,255,0.05);
      color: var(--cn-text);
      cursor: pointer;
      transition: background 120ms ease;
    }
    .cn-modal__close:hover { background: rgba(255,255,255,0.12); }
    .cn-modal__body {
      padding: 14px 18px 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .cn-ev-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cn-ev-field__label {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--cn-text-muted);
    }
    .cn-ev-field__value {
      font-size: 13px;
      font-weight: 500;
      color: var(--cn-text);
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
    .cn-ev-field__value--desc {
      white-space: pre-wrap;
      font-weight: 400;
      color: var(--cn-text-dim);
    }
    .cn-ev-field__value a {
      color: var(--cn-accent);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .cn-ev-empty {
      font-size: 13px;
      color: var(--cn-text-muted);
      text-align: center;
      padding: 12px 0;
    }
  `,t([gt({attribute:!1})],Yt.prototype,"hass",void 0),t([gt({attribute:!1})],Yt.prototype,"event",void 0),t([gt({type:String})],Yt.prototype,"entityId",void 0),t([gt({type:String})],Yt.prototype,"calendarName",void 0),t([_t()],Yt.prototype,"_closing",void 0),Yt=t([pt("cardnews-event-modal")],Yt);const Zt="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";!function(){if("undefined"==typeof document)return;const t="cn-pretendard-font";if(document.getElementById(t))return;const e=document.createElement("link");e.id=t,e.rel="stylesheet",e.href=Zt,e.crossOrigin="anonymous",document.head.appendChild(e)}();const Xt=o(`@import url('${Zt}');`);function Jt(t,e=new Date){const i=e.getHours()+e.getMinutes()/60,n=t?.states?.["sun.sun"];if(n){const t=n.attributes,s=t.next_dawn?new Date(String(t.next_dawn)):void 0,a=t.next_dusk?new Date(String(t.next_dusk)):void 0,o="above_horizon"===n.state;if(s&&!o){const t=(s.getTime()-e.getTime())/6e4;if(t>=0&&t<=30)return"dawn"}if(a&&o){const t=(a.getTime()-e.getTime())/6e4;if(t>=0&&t<=60)return"evening"}return o?i<11?"morning":i<17?"afternoon":"evening":i>=5&&i<7?"dawn":"night"}return i>=5&&i<7?"dawn":i>=7&&i<11?"morning":i>=11&&i<17?"afternoon":i>=17&&i<20?"evening":"night"}const Qt="/local/cardnews/heroes",te=["#22d3ee","#f472b6","#fbbf24","#a3e635","#c084fc","#fb7185","#60a5fa","#f97316"];class ee extends dt{constructor(){super(...arguments),this._openSelects={},this._calendarEvents={},this._calendarLastFetch={},this._calendarInflight={},this._tmplCache=new Map,this._tmplUnsubs=new Map,this._tmplPending=new Set,this._openRemoteModals=new Map,this._openTvRemoteModals=new Map,this._openLightModals=new Map,this._openEventModals=new Map,this._calendarScrolled={},this._calendarRowHeight=62,this._heroActive="a"}_renderTemplate(t){if(!t)return"";const e=this._tmplCache.get(t),i=this.hass?.connection;return i&&"function"==typeof i.subscribeMessage?(this._tmplUnsubs.has(t)||this._tmplPending.has(t)||(this._tmplPending.add(t),i.subscribeMessage(e=>{const i=e?.result??"";i!==this._tmplCache.get(t)&&(this._tmplCache.set(t,i),this.requestUpdate())},{type:"render_template",template:t}).then(e=>{this._tmplPending.delete(t),this._tmplUnsubs.set(t,e)}).catch(()=>{this._tmplPending.delete(t)})),e??Nt(t,this.hass)):e??Nt(t,this.hass)}setConfig(t){this._configError=void 0}getCardSize(){return 6}connectedCallback(){super.connectedCallback(),"undefined"!=typeof window&&(this._todTimer=window.setInterval(()=>this.requestUpdate(),3e5))}disconnectedCallback(){this._todTimer&&(clearInterval(this._todTimer),this._todTimer=void 0);for(const t of this._tmplUnsubs.values())try{t()}catch{}this._tmplUnsubs.clear(),this._tmplCache.clear(),this._tmplPending.clear(),super.disconnectedCallback()}willUpdate(t){if(t.has("hass")&&this.hass){if(this._openRemoteModals.size)for(const[,t]of this._openRemoteModals)t.el.hass=this.hass;if(this._openLightModals.size)for(const[,t]of this._openLightModals)t.el.hass=this.hass;if(this._openTvRemoteModals.size)for(const[,t]of this._openTvRemoteModals)t.el.hass=this.hass}}_entity(t){if(t&&this.hass)return this.hass.states[t]}_entityState(t,e="—"){const i=this._entity(t);return i?i.state:e}_entityFriendly(t){const e=this._entity(t);return e?.attributes.friendly_name??t}_iconColor(t,e,i){const n="#9ca3af",s="#22d3ee";if(!t)return n;const[a,...o]=t.split("."),r=o.join("."),c=e??this._entityState(t,"");if("light"===a||"switch"===a||"fan"===a||"media_player"===a||"cover"===a||"lock"===a||"alarm_control_panel"===a||"input_boolean"===a||"automation"===a||"script"===a||"vacuum"===a||"climate"===a||"water_heater"===a||"humidifier"===a||"remote"===a)return"on"===c||"home"===c||"open"===c||"playing"===c||"unlocked"===c||"disarmed"===c||"cleaning"===c||"active"===c||"auto"===c||"climate"===a&&["cool","heat","fan_only","dry","heat_cool","auto"].includes(c)||"humidifier"===a&&"on"===c||"water_heater"===a&&!["off","idle"].includes(c)?s:n;if("person"===a||"device_tracker"===a)return"home"===c?s:n;if("sensor"===a||"number"===a||"input_number"===a||"binary_sensor"===a){const e=this._entity(t),i=e?.attributes.device_class,s=e?.attributes.unit_of_measurement??"",a=Number(c);return Number.isFinite(a)?"temperature"===i||"°C"===s||"C"===s||/temp|onDo/i.test(r)?a<18?"#3b82f6":a<22?"#60a5fa":a<26?"#22c55e":a<29?"#f59e0b":"#ef4444":"humidity"===i||"%"===s&&/humid|seubdo|seubD/i.test(r)?a<30?"#ef4444":a<40?"#f59e0b":a<60?"#22c55e":a<70?"#60a5fa":"#3b82f6":"carbon_dioxide"===i||/carbon_dioxide|co2/i.test(r)||"ppm"===s?a<700?"#22c55e":a<1e3?"#60a5fa":a<1400?"#f59e0b":"#ef4444":/pm2_5|pm25/i.test(r)||"µg/m³"===s||"ug/m³"===s||"µg/m3"===s?a<15?"#22c55e":a<35?"#f59e0b":"#ef4444":("power"===i||"energy"===i||/power|energy|watt|kwh/i.test(r),n):n}return n}_formatValue(t){if(t.value_template)return this._renderTemplate(t.value_template)+(t.unit??"");if(void 0!==t.value&&null!==t.value)return String(t.value)+(t.unit??"");if(t.entity){const e=this._entity(t.entity);if(!e)return"—";const i=t.unit??e.attributes.unit_of_measurement??"",n=Number(e.state);return Number.isNaN(n)?`${e.state}${i?" "+i:""}`:`${Math.round(10*n)/10}${i?" "+i:""}`}return"—"}_renderIcon(t,e=24,i){const n=`${e}px`;return K`<ha-icon .icon=${t} style=${i?`--mdc-icon-size:${n};width:${n};height:${n};color:${i}`:`--mdc-icon-size:${n};width:${n};height:${n}`}></ha-icon>`}_resolveHeroImage(t,e,i){if(t){if(t.startsWith("/")||t.startsWith("http"))return t;const i=Jt(e??this.hass);return`${Qt}/${t}-${i}.png`}if(i){const t=Jt(e??this.hass);return`${Qt}/hero-${i}-${t}.png`}}_resolveHeroBackground(t){if(t.hero_image_by_state){const{entity:e,map:i,default:n}=t.hero_image_by_state,s=this._entityState(e,""),a=s&&i[s]||n;if(a)return this._resolveHeroImage(a,this.hass)}if(t.hero_image)return this._resolveHeroImage(t.hero_image,this.hass);if(t.hero_image_entity){const e=this._entity(t.hero_image_entity),i=e?.attributes.entity_picture;if("string"==typeof i)return i}return t.room?this._resolveHeroImage(void 0,this.hass,t.room):void 0}_resolveStatus(t){let e=t.status_text;if(!e&&t.status_text_template){const i=this._renderTemplate(t.status_text_template).trim();i&&(e=i)}if(!e&&t.status_entity){const i=this._entity(t.status_entity);i&&(e=i.state)}let i=t.status_color??"gray";if(t.status_template){const e=this._renderTemplate(t.status_template).trim();"green"!==e&&"gray"!==e&&"blue"!==e&&"red"!==e&&"amber"!==e||(i=e)}return{text:e,color:i}}_glowActive(t){if(!t.glow_entities||0===t.glow_entities.length)return!1;for(const e of t.glow_entities)if("on"===this._entityState(e,"off"))return!0;return!1}renderHero(t){const e=this._resolveHeroBackground(t);e!==this._lastResolvedHero&&(void 0===this._lastResolvedHero?(this._heroImgA=e,this._heroActive="a"):"a"===this._heroActive?(this._heroImgB=e,this._heroActive="b"):(this._heroImgA=e,this._heroActive="a"),this._lastResolvedHero=e);const i=this._resolveStatus(t),n=t.hero_theme??"dark",s=t.title_template?this._renderTemplate(t.title_template):t.title??"",a=t.subtitle_template?this._renderTemplate(t.subtitle_template):t.subtitle??"",o={"cn-hero":!0,"cn-hero--lg":"lg"===t.size,"cn-hero--light":"light"===n,"cn-hero--dark":"light"!==n,"cn-hero--has-image":!!e},r="light"===n?"linear-gradient(135deg,#f4f4f6,#e5e7eb)":"linear-gradient(135deg,#3a3a3c,#1c1c1e)",c=this._heroImgA?{backgroundImage:`url("${this._heroImgA}")`,opacity:"a"===this._heroActive?"1":"0"}:{backgroundImage:r,opacity:"a"===this._heroActive?"1":"0"},l=this._heroImgB?{backgroundImage:`url("${this._heroImgB}")`,opacity:"b"===this._heroActive?"1":"0"}:{backgroundImage:r,opacity:"b"===this._heroActive?"1":"0"},d=this._glowActive(t),h={background:`radial-gradient(ellipse at ${t.glow_position??"50% 30%"}, ${t.glow_color??"rgba(255, 200, 100, 0.5)"} 0%, transparent 60%)`,opacity:d?"1":"0"},p=!(!t.glow_entities||!t.glow_entities.length);return K`
      <div class=${vt(o)}>
        <div class="cn-hero__image cn-hero__image--a" style=${wt(c)}></div>
        <div class="cn-hero__image cn-hero__image--b" style=${wt(l)}></div>
        ${p?K`<div class="cn-hero__glow" style=${wt(h)} aria-hidden="true"></div>`:G}
        ${e?K`<div class="cn-hero__overlay"></div>`:G}
        ${t.category?K`
              <div class="cn-category">
                ${t.category_icon?this._renderIcon(t.category_icon,14):G}
                <span>${t.category}</span>
              </div>
            `:G}
        ${i.text?K`
              <div class="cn-status cn-status--${i.color}">
                <span class="cn-status__dot"></span>
                <span class="cn-status__text">${i.text}</span>
              </div>
            `:G}
        ${t.hero_actions&&t.hero_actions.length?K`<div class="cn-hero__actions">
              ${t.hero_actions.map(t=>this._renderHeroAction(t))}
            </div>`:G}
        <div class="cn-hero__text">
          <div class="cn-hero__title">${s}</div>
          ${a?K`<div class="cn-hero__subtitle">${a}</div>`:G}
        </div>
      </div>
    `}_renderHeroAction(t){const e=t.action_type??"toggle",i=t.entity?this._entityState(t.entity,"off"):"off",[n]=(t.entity??"").split("."),s="climate"===n&&["cool","heat","fan_only","dry","auto","heat_cool"].includes(i),a="service"===e&&!!t.active_states&&t.active_states.includes(i),o="service"===e?a:"on"===i||"home"===i||"open"===i||"cleaning"===i||s,r=o?"#22d3ee":"rgba(255,255,255,0.6)";let c=o&&t.active_icon?t.active_icon:t.icon;c||(c="light"===n?"mdi:lightbulb":"fan"===n?"mdi:fan":"switch"===n?"mdi:power":"climate"===n?"mdi:air-conditioner":"vacuum"===n?"mdi:robot-vacuum":"mdi:circle");const l=()=>{"toggle"===e&&t.entity?this._callToggle(t.entity):"remote_modal"===e&&t.entity&&this.hass?this._openRemote(t):"light_modal"===e&&(t.entity||t.entities&&t.entities.length)&&this.hass?this._openLight(t):"tv_remote"===e&&this.hass?this._openTvRemote(t):"service"===e&&this.hass&&this._callHeroService(t,i)},d=t.label??this._entityFriendly(t.entity)??"";return K`
      <div class="cn-hero-action-wrap">
        <button
          class="cn-hero-action ${o?"cn-hero-action--on":"cn-hero-action--off"} ${o&&("fan"===n||"mdi:fan"===c||"remote_modal"===e&&"fan"===t.remote||"service"===e&&t.spin_when_active)?"cn-hero-action--spin":""}"
          role="button"
          aria-pressed=${o?"true":"false"}
          aria-label=${d||t.entity}
          title=${d||t.entity}
          @click=${t=>{t.stopPropagation(),l()}}
          @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),t.stopPropagation(),l())}}
        >
          ${this._renderIcon(c,18,r)}
        </button>
        ${d?K`<div class="cn-hero-action__label">${d}</div>`:G}
      </div>
    `}renderList(t){if(!t||0===t.length)return G;const e=t.filter(t=>!this._shouldHideRow(t));return 0===e.length?G:K`
      <div class="cn-list">
        ${e.map(t=>this._renderRow(t))}
      </div>
    `}_shouldHideRow(t){if(t.always_show)return!1;if("header"===t.type)return!1;const e=new Set(["","-","null","undefined","unavailable","unknown","none","None","NaN"]),i=t.type??"value";if("value"===i){const i=t;if(void 0!==i.value&&null!==i.value&&""!==String(i.value).trim())return!1;if(i.value_template){const t=this._renderTemplate(i.value_template).trim();return""===t||e.has(t)}if(!i.entity)return!0;const n=this._entity(i.entity);if(!n)return!0;const s=String(n.state??"").trim();return e.has(s)}if("bar"===i){const i=t;if(void 0!==i.value&&null!==i.value)return!1;if(!i.entity)return!0;const n=this._entity(i.entity);if(!n)return!0;const s=String(n.state??"").trim();return!!e.has(s)||!Number.isFinite(Number(s))}if("balls"===i){const i=t;if(!i.entity)return!0;const n=this._entity(i.entity);if(!n)return!0;const s=String(n.state??"").trim();if(e.has(s))return!0;const a=s.replace(/\+/g," ").split(/\s+/).filter(Boolean).map(Number).filter(t=>Number.isFinite(t));return a.length<6}if("calendar_events"===i)return!1;if("forecast"===i){const e=t;if(!e.entity)return!0;const i=this._entity(e.entity);if(!i)return!0;const n=i.attributes&&i.attributes.forecast;return!Array.isArray(n)||0===n.length}if("light"===i){const e=t;return!(e.entity||e.entities&&e.entities.length)}return!t.entity&&"select"!==i}_renderRow(t){const e=t.type??"value";return"switch"===e?this._renderSwitchRow(t):"slider"===e?this._renderSliderRow(t):"bar"===e?this._renderBarRow(t):"select"===e?this._renderSelectRow(t):"balls"===e?this._renderBallsRow(t):"forecast"===e?this._renderForecastRow(t):"calendar_events"===e?this._renderCalendarEventsRow(t):"light"===e?this._renderLightRow(t):"volume"===e?this._renderVolumeRow(t):"header"===e?this._renderHeaderRow(t):this._renderValueRow(t)}_rowIcon(t){if(!t.icon)return G;const e=t.entity?this._entityState(t.entity,""):void 0,i=this._iconColor(t.entity,e,t.icon_color);return this._renderIcon(t.icon,24,i)}_rowLabel(t){return t.label??(t.entity?this._entityFriendly(t.entity)??t.entity:"")}_renderValueRow(t){const e=this._rowLabel(t),[i]=(t.entity??"").split(".");if("button"===i&&t.entity&&!t.value_template&&void 0===t.value){const i=e=>{e.stopPropagation(),this.hass&&t.entity&&this.hass.callService("button","press",{entity_id:t.entity})};return K`
        <div class="cn-row cn-row--value">
          <span class="cn-row__icon-slot">${this._rowIcon(t)}</span>
          <div class="cn-row__label">${e}</div>
          <span class="cn-chip-btn-wrap">
            <button class="cn-chip-btn" @click=${i}>실행</button>
          </span>
        </div>
      `}const n=this._formatValue(t),s=!!t.entity,a=t.entity?this._entity(t.entity):void 0;let o="";if("W"===(t.unit??a?.attributes.unit_of_measurement??"")&&t.entity){const e=Number(this._entityState(t.entity,""));if(Number.isFinite(e)){const t=Math.max(0,e);let i="#9ca3af";t>=500?i="#ef4444":t>=200?i="#f59e0b":t>=50?i="#eab308":t>=5&&(i="#a3a3a3"),o=`color: ${i};`}}return K`
      <div
        class="cn-row cn-row--value ${s?"cn-row--clickable":""}"
        @click=${s?()=>this._fireMoreInfo(t.entity):void 0}
      >
        <span class="cn-row__icon-slot">${this._rowIcon(t)}</span>
        <div class="cn-row__label">${e}</div>
        <div class="cn-row__value" style="${o}">${n}</div>
      </div>
    `}_renderHeaderRow(t){const e=t.text??t.label??"";return K`<div class="cn-row cn-row--header"><span class="cn-row__header-text">${e}</span></div>`}_renderSwitchRow(t){const e=this._rowLabel(t),i="on"===(t.entity?this._entityState(t.entity,"off"):"off"),n=()=>{t.entity&&this._callToggle(t.entity)},s=!!(t.light_entity||t.light_entities&&t.light_entities.length);return K`
      <div
        class="cn-row cn-row--switch cn-row--clickable"
        role="button"
        tabindex="0"
        aria-pressed=${i?"true":"false"}
        @click=${n}
        @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),n())}}
      >
        <span class="cn-row__icon-slot">${this._rowIcon(t)}</span>
        <div class="cn-row__label">${e}</div>
        ${s?K`
          <button class="cn-color-chip" title="색상 조절" @click=${e=>{e.stopPropagation();const i=t.light_entities&&t.light_entities.length?t.light_entities:t.light_entity?[t.light_entity]:[];this.hass&&i.length&&this._openLight({entity:1===i.length?i[0]:void 0,entities:i.length>1?i:void 0,labels:t.light_labels,label:t.label})}}>
            <span class="cn-color-chip__ring"></span>
            <ha-icon .icon=${"mdi:palette"} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
          </button>
        `:G}
        <span class="cn-toggle-wrap">
          <span class="cn-toggle ${i?"cn-toggle--on":"cn-toggle--off"}" aria-hidden="true">
            <span class="cn-toggle__handle"></span>
          </span>
        </span>
      </div>
    `}_renderSliderRow(t){const e=this._rowLabel(t),i=t.entity?this._entity(t.entity):void 0,[n]=(t.entity??"").split("."),s=t.min??0,a=t.max??100,o=t.step??1;let r=0;if(i)if("light"===n){const t=Number(i.attributes.brightness);r=Number.isFinite(t)?Math.round(t/255*100):0}else if("media_player"===n){const t=Number(i.attributes.volume_level);r=Number.isFinite(t)?Math.round(100*t):0}else if("fan"===n){const t=Number(i.attributes.percentage);r=Number.isFinite(t)?Math.round(t):0}else{const t=Number(i.state);Number.isFinite(t)&&(r=t)}const c=t.unit??("light"===n||"media_player"===n||"fan"===n?"%":i?.attributes.unit_of_measurement??"");return K`
      <div class="cn-row cn-row--slider">
        <span class="cn-row__icon-slot">${this._rowIcon(t)}</span>
        <div class="cn-row__label">${e}</div>
        <input
          class="cn-slider"
          type="range"
          .min=${String(s)}
          .max=${String(a)}
          .step=${String(o)}
          .value=${String(r)}
          @change=${e=>{const i=Number(e.target.value);if(t.entity&&this.hass)if("input_number"===n)this.hass.callService("input_number","set_value",{entity_id:t.entity,value:i});else if("light"===n)this.hass.callService("light","turn_on",{entity_id:t.entity,brightness_pct:i});else if("media_player"===n)this.hass.callService("media_player","volume_set",{entity_id:t.entity,volume_level:i/100});else if("fan"===n)this.hass.callService("fan","set_percentage",{entity_id:t.entity,percentage:i});else if(t.service){const[e,n]=t.service.split(".");this.hass.callService(e,n,{entity_id:t.entity,value:i})}}}
        />
        <div class="cn-row__value">${r}${c}</div>
      </div>
    `}_renderBarRow(t){const e=this._rowLabel(t);let i=0;if(void 0!==t.value&&null!==t.value)i=Number(t.value);else if(t.entity){const e=this._entity(t.entity);if(e){const t=Number(e.state);Number.isFinite(t)&&(i=t)}}Number.isFinite(i)||(i=0);const n=t.max&&t.max>0?t.max:Math.max(i,1),s=Math.max(0,Math.min(100,i/n*100)),a=t.unit??(t.entity?this._entity(t.entity)?.attributes.unit_of_measurement??"":""),o=t.color??"#22d3ee",r=!!t.entity;return K`
      <div
        class="cn-row cn-row--bar ${r?"cn-row--clickable":""}"
        @click=${r?()=>this._fireMoreInfo(t.entity):void 0}
      >
        <span class="cn-row__icon-slot">${this._rowIcon(t)}</span>
        <div class="cn-row__bar-body">
          <div class="cn-row__bar-top">
            <span class="cn-row__label">${e}</span>
            <span class="cn-row__value">${Math.round(10*i)/10}${a?" "+a:""}</span>
          </div>
          <div class="cn-bar-track">
            <div class="cn-bar-fill" style=${wt({width:s+"%",background:o})}></div>
          </div>
        </div>
      </div>
    `}_renderSelectRow(t){const e=this._rowLabel(t),i=t.entity?this._entity(t.entity):void 0,n=i?String(i.state??""):"",s=i?.attributes?.options,a=Array.isArray(s)?s.map(String):[],o=t.entity??"",r=!!this._openSelects[o],c=t=>{t.stopPropagation(),this._openSelects={...this._openSelects,[o]:!r}},l=(e,i)=>{e.stopPropagation(),t.entity&&this.hass&&i&&this.hass.callService("input_select","select_option",{entity_id:t.entity,option:i}),this._openSelects={...this._openSelects,[o]:!1}};return K`
      <div class="cn-dropdown-anchor" data-open=${r}>
        <div class="cn-row cn-row--select cn-row--clickable ${r?"cn-row--select-open":""}" @click=${c}>
          <span class="cn-row__icon-slot">${this._rowIcon(t)}</span>
          <div class="cn-row__label">${e}</div>
          <span class="cn-dropdown__current">${n||"-"}</span>
          <span class="cn-dropdown__chevron ${r?"cn-dropdown__chevron--open":""}">
            ${this._renderIcon("mdi:chevron-down",20,"var(--cn-text-dim, rgba(0,0,0,0.55))")}
          </span>
        </div>
        ${r?K`
          <div class="cn-dropdown__backdrop" @click=${c}></div>
          <div class="cn-dropdown__popover" data-select-key=${o} @click=${t=>t.stopPropagation()}>
            ${a.map(t=>K`
              <div class="cn-dropdown__opt ${t===n?"cn-dropdown__opt--active":""}"
                   @click=${e=>l(e,t)}>
                ${t===n?K`<span class="cn-dropdown__check">${this._renderIcon("mdi:check",16,"var(--cn-accent, #22d3ee)")}</span>`:K`<span class="cn-dropdown__check"></span>`}
                <span class="cn-dropdown__opt-lbl">${t}</span>
              </div>
            `)}
          </div>
        `:G}
      </div>
    `}updated(t){if(t.has("hass")&&this._maybeFetchCalendarRows(),this._maybeScrollCalendarLists(),t.has("hass")&&this._openEventModals.size)for(const[,t]of this._openEventModals)t.el.hass=this.hass;if(t.has("_openSelects")){const t=this.renderRoot,e=t.querySelectorAll?.(".cn-dropdown__popover");e?.forEach(t=>{const e=t.parentElement,i=e?.querySelector(".cn-row--select");if(!i)return;const n=i.getBoundingClientRect(),s=t;s.style.position="fixed",s.style.top=`${n.top+4}px`,s.style.right=window.innerWidth-n.right+4+"px",s.style.zIndex="10000"})}}_lottoBallColor(t){return t>=1&&t<=10?"#fbc400":t>=11&&t<=20?"#69c8f2":t>=21&&t<=30?"#ff7272":t>=31&&t<=40?"#aaaaaa":t>=41&&t<=45?"#b0d840":"#9ca3af"}_renderBallsRow(t){const e=this._rowLabel(t),i=t.entity?this._entity(t.entity):void 0,n=String(i?.state??"").trim().split(/\s*\+\s*/),s=(n[0]??"").split(/\s+/).filter(Boolean).map(Number).filter(Number.isFinite),a=n.length>1?Number((n[1]??"").trim()):s.length>=7?s[6]:NaN,o=s.slice(0,6),r=t=>K`
      <span class="cn-ball" style=${wt({background:this._lottoBallColor(t)})}>${t}</span>
    `;return K`
      <div class="cn-row cn-row--balls">
        ${e?K`<div class="cn-row__label cn-row__label--balls">${e}</div>`:G}
        <div class="cn-balls">
          ${o.map(t=>r(t))}
          ${Number.isFinite(a)?K`<span class="cn-balls__plus">+</span>${r(a)}`:G}
        </div>
      </div>
    `}_renderForecastRow(t){const e=this._rowLabel(t),i=t.entity?this._entity(t.entity):void 0,n=(i?.attributes??{}).forecast,s=t.days??5,a=Array.isArray(n)?n.slice(0,s):[],o=["일","월","화","수","목","금","토"],r=a.map((t,e)=>{const i=t.datetime?new Date(String(t.datetime)):void 0,n=i&&!isNaN(i.getTime())?0===e?"오늘":o[i.getDay()]:`+${e}`,s=String(t.condition??""),a=t.temperature,r=t.templow??t.temperature_low,c=null!=a?Math.round(Number(a)):null,l=null!=r?Math.round(Number(r)):null;return K`
        <div class="cn-forecast__day">
          <div class="cn-forecast__dow">${n}</div>
          ${this._renderIcon((t=>{const e=String(t??"").toLowerCase();return e.includes("clear-night")?"mdi:weather-night":e.includes("sunny")||"clear"===e?"mdi:weather-sunny":e.includes("partlycloudy")||e.includes("partly")?"mdi:weather-partly-cloudy":e.includes("cloud")?"mdi:weather-cloudy":e.includes("pouring")?"mdi:weather-pouring":e.includes("rain")?"mdi:weather-rainy":e.includes("snow")?"mdi:weather-snowy":e.includes("fog")?"mdi:weather-fog":e.includes("lightning")||e.includes("thunder")?"mdi:weather-lightning":e.includes("wind")?"mdi:weather-windy":e.includes("hail")?"mdi:weather-hail":"mdi:weather-partly-cloudy"})(s),22)}
          <div class="cn-forecast__temps">
            ${null!==c?K`<span class="cn-forecast__hi">${c}°</span>`:G}
            ${null!==l?K`<span class="cn-forecast__lo">${l}°</span>`:G}
          </div>
        </div>
      `});return K`
      <div class="cn-row cn-row--forecast">
        ${e?K`<div class="cn-row__label cn-row__label--forecast">${e}</div>`:G}
        <div class="cn-forecast">${r}</div>
      </div>
    `}_maybeFetchCalendarRows(){if(!this.hass)return;const t=this._config,e=t?.list;if(Array.isArray(e))for(const t of e)t&&"calendar_events"===t.type&&this._fetchCalendarRow(t)}_calendarKey(t){return`${[...t.entities??[]].sort().join(",")}|b=${t.days_before??3}|a=${t.days_after??3}`}async _fetchCalendarRow(t){if(!this.hass||!this.hass.callWS)return;const e=(t.entities??[]).filter(Boolean);if(!e.length)return;const i=this._calendarKey(t),n=Date.now(),s=this._calendarLastFetch[i]??0;if(!(this._calendarInflight[i]||n-s<3e5&&this._calendarEvents[i])){this._calendarInflight[i]=!0;try{const n=t.days_before??3,s=t.days_after??3,a=new Date;a.setHours(0,0,0,0),a.setDate(a.getDate()-n);const o=new Date;o.setHours(0,0,0,0),o.setDate(o.getDate()+s+1);const r=t=>{const e=t=>String(t).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())} ${e(t.getHours())}:${e(t.getMinutes())}:${e(t.getSeconds())}`},c=[];try{const t=(await this.hass.callWS({type:"call_service",domain:"calendar",service:"get_events",service_data:{entity_id:e,start_date_time:r(a),end_date_time:r(o)},return_response:!0})).response??{};for(const e of Object.keys(t)){const i=t[e];let n=[];if(Array.isArray(i))n=i;else if(i&&"object"==typeof i){const t=i;Array.isArray(t.events)&&(n=t.events)}for(const t of n){const i=t,n=i.start,s=i.end,a=t=>{if("string"==typeof t)return t;if(t&&"object"==typeof t){const e=t;if("string"==typeof e.dateTime)return e.dateTime;if("string"==typeof e.date)return e.date}return""},o=a(n),r=a(s);o&&c.push({entity_id:e,summary:"string"==typeof i.summary?i.summary:"",description:"string"==typeof i.description?i.description:void 0,location:"string"==typeof i.location?i.location:void 0,start:o,end:r||void 0,allDay:!/T\d/.test(o)})}}}catch{}this._calendarLastFetch[i]=Date.now(),this._calendarScrolled[i]=!1,this._calendarEvents={...this._calendarEvents,[i]:c}}finally{this._calendarInflight[i]=!1}}}_calendarDotColor(t,e){const i=e.indexOf(t);return te[(i>=0?i:0)%te.length]}_fmtCalendarDate(t,e){const i=new Date(t),n=new Date;n.setHours(0,0,0,0);const s=new Date(i.getFullYear(),i.getMonth(),i.getDate()),a=Math.round((s.getTime()-n.getTime())/864e5);let o;o=0===a?"오늘":1===a?"내일":`${i.getMonth()+1}.${String(i.getDate()).padStart(2,"0")} (${["일","월","화","수","목","금","토"][i.getDay()]})`;let r="";return e||(r=`${String(i.getHours()).padStart(2,"0")}:${String(i.getMinutes()).padStart(2,"0")}`),{day:o,time:r,date:i}}_calendarEntityName(t){const e=this.hass?.states?.[t],i=e?.attributes?.friendly_name;return i||t}_openEventDetail(t){if(!this.hass)return;const e=this._calendarEntityName(t.entity_id),i=`${t.entity_id}|${t.start}|${t.summary??""}`;if(this._openEventModals.get(i))return;const n=function(t){const e=document.createElement("cardnews-event-modal");return e.hass=t.hass,e.event=t.event,e.entityId=t.entityId,e.calendarName=t.calendarName??"",document.body.appendChild(e),{el:e,close:()=>{e.parentElement&&e.parentElement.removeChild(e)}}}({hass:this.hass,event:t,entityId:t.entity_id,calendarName:e});n.el.addEventListener("close",()=>{this._openEventModals.delete(i)}),this._openEventModals.set(i,n)}_todayAnchorIndex(t){const e=new Date;e.setHours(0,0,0,0);const i=e.getTime();let n=-1;for(let e=0;e<t.length;e++){const s=t[e];if(!s)continue;const a=new Date(s.start),o=new Date(a.getFullYear(),a.getMonth(),a.getDate()).getTime();if(o===i)return e;o>i&&n<0&&(n=e)}return n>=0?n:Math.max(0,t.length-1)}_renderCalendarEventsRow(t){const e=this._calendarKey(t),i=this._calendarEvents[e]??[],n=!1!==t.group_by_day,s=!1!==t.show_description,a=t.max??40,o=t.entities??[],r=Math.max(1,t.visible_rows??4)*this._calendarRowHeight+"px";if(!i.length){const t=!this._calendarLastFetch[e];return K`
        <div class="cn-row cn-row--calendar-empty">
          <div class="cn-cal-empty">${t?"일정 불러오는 중...":"예정된 일정 없음"}</div>
        </div>
      `}const c=[...i].sort((t,e)=>t.start.localeCompare(e.start)).slice(0,a),l=this._todayAnchorIndex(c),d=(t,i)=>{const{day:n,time:a}=this._fmtCalendarDate(t.start,!!t.allDay),r=this._calendarDotColor(t.entity_id,o);return K`
        <div class="cn-row cn-row--calendar"
             data-cal-key=${e}
             data-cal-anchor=${i===l?"1":"0"}
             role="button"
             tabindex="0"
             @click=${()=>this._openEventDetail(t)}
             @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._openEventDetail(t))}}>
          <span class="cn-row--calendar__dot" style=${wt({background:r})}></span>
          <div class="cn-row--calendar__main">
            <div class="cn-row--calendar__head">
              <span class="cn-row--calendar__date">${n}${a?K` · ${a}`:G}</span>
              <span class="cn-row--calendar__title">${t.summary||"(제목 없음)"}</span>
            </div>
            ${s&&t.description?K`<div class="cn-row--calendar__desc">${t.description}</div>`:G}
          </div>
        </div>
      `};if(!n)return K`
        <div class="cn-cal-list cn-cal-list--scroll"
             data-cal-key=${e}
             style=${wt({maxHeight:r})}>
          ${c.map((t,e)=>d(t,e))}
        </div>
      `;const h=new Map,p=[];return c.forEach((t,e)=>{const{day:i}=this._fmtCalendarDate(t.start,!!t.allDay);h.has(i)||(h.set(i,[]),p.push(i)),h.get(i).push({ev:t,gi:e})}),K`
      <div class="cn-cal-list cn-cal-list--scroll"
           data-cal-key=${e}
           style=${wt({maxHeight:r})}>
        ${p.map(t=>K`
          <div class="cn-cal-group">
            <div class="cn-cal-group__hdr">${t}</div>
            ${(h.get(t)??[]).map(({ev:t,gi:e})=>d(t,e))}
          </div>
        `)}
      </div>
    `}_maybeScrollCalendarLists(){const t=this.renderRoot;t&&t.querySelectorAll&&t.querySelectorAll(".cn-cal-list--scroll").forEach(t=>{const e=t.getAttribute("data-cal-key")||"";if(!e||this._calendarScrolled[e])return;const i=t.querySelector('[data-cal-anchor="1"]');if(!i)return;const n=t.getBoundingClientRect(),s=i.getBoundingClientRect().top-n.top+t.scrollTop;t.scrollTop=Math.max(0,s-4),this._calendarScrolled[e]=!0})}renderCard(t,e,i=G){return this._configError?K`<ha-card class="cn-card cn-card--error">
        <div class="cn-error">${this._configError}</div>
      </ha-card>`:K`
      <ha-card class="cn-card">
        ${t}
        <div class="cn-body">
          ${e}
          ${i}
        </div>
      </ha-card>
    `}_renderVolumeRow(t){const e=this._rowLabel(t),i=t.entity?this._entity(t.entity):void 0,[n]=(t.entity??"").split(".");let s=0,a=!1;if(i)if("media_player"===n){const t=Number(i.attributes.volume_level);s=Number.isFinite(t)?Math.round(100*t):0,a=!!i.attributes.is_volume_muted}else{const t=Number(i.state);s=Number.isFinite(t)?Math.round(t):0}const o=(e,i={})=>{t.entity&&this.hass&&"media_player"===n&&this.hass.callService("media_player",e,{entity_id:t.entity,...i})},r=!1!==t.mute;return K`
      <div class="cn-row cn-row--volume">
        <span class="cn-row__icon-slot">${this._rowIcon(t)}</span>
        <div class="cn-row__label">${e}</div>
        <span class="cn-volstep">
          <button class="cn-volstep__btn" @click=${()=>o("volume_down")} title="볼륨 -">−</button>
          <span class="cn-volstep__val">${s}%</span>
          <button class="cn-volstep__btn" @click=${()=>o("volume_up")} title="볼륨 +">+</button>
          ${r?K`
            <button class="cn-volstep__btn cn-volstep__btn--mute ${a?"cn-volstep__btn--active":""}"
                    @click=${()=>o("volume_mute",{is_volume_muted:!a})} title="음소거">
              <ha-icon .icon=${a?"mdi:volume-off":"mdi:volume-high"} style="--mdc-icon-size:18px;width:18px;height:18px"></ha-icon>
            </button>
          `:G}
        </span>
      </div>
    `}_renderLightRow(t){const e=this._rowLabel(t),i=t.entities&&t.entities.length?t.entities:t.entity?[t.entity]:[],n=i[0]?this._entity(i[0]):void 0,s=i.some(t=>"on"===this._entityState(t,"off")),a=n?.attributes.supported_color_modes??[],o=t.force_color_button||a.some(t=>["hs","xy","rgb","rgbw","rgbww","color_temp"].includes(t)),r=t=>{if(t.stopPropagation(),!this.hass||!i.length)return;const e=s?"turn_off":"turn_on";this.hass.callService("light",e,{entity_id:i})};return K`
      <div
        class="cn-row cn-row--switch cn-row--clickable"
        role="button"
        tabindex="0"
        aria-pressed=${s?"true":"false"}
        @click=${r}
        @keydown=${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),r(t))}}
      >
        <span class="cn-row__icon-slot">${this._rowIcon(t)}</span>
        <div class="cn-row__label">${e}</div>
        ${o?K`
          <button class="cn-color-chip" title="색상 조절" @click=${e=>{e.stopPropagation(),this.hass&&i.length&&this._openLight({entity:1===i.length?i[0]:void 0,entities:i.length>1?i:void 0,labels:t.labels,label:t.label})}}>
            <span class="cn-color-chip__ring"></span>
            <ha-icon .icon=${"mdi:palette"} style="--mdc-icon-size:16px;width:16px;height:16px"></ha-icon>
          </button>
        `:G}
        <span class="cn-toggle-wrap">
          <span class="cn-toggle ${s?"cn-toggle--on":"cn-toggle--off"}" aria-hidden="true">
            <span class="cn-toggle__handle"></span>
          </span>
        </span>
      </div>
    `}_openLight(t){if(!this.hass)return;const e=t.entities&&t.entities.length?t.entities:t.entity?[t.entity]:[];if(!e.length)return;const i=`light:${e.join(",")}`,n=this._openLightModals.get(i);if(n)return n.close(),void this._openLightModals.delete(i);const s=function(t){const e=document.createElement("cardnews-light-modal");return e.hass=t.hass,t.entity&&(e.entity=t.entity),t.entities&&(e.entities=t.entities),t.labels&&(e.labels=t.labels),e.deviceName=t.deviceName??"",document.body.appendChild(e),{close:()=>{e.parentElement&&e.parentElement.removeChild(e)}}}({hass:this.hass,entity:1===e.length?e[0]:void 0,entities:e.length>1?e:void 0,labels:t.labels,deviceName:t.label??this._entityFriendly(e[0])??void 0}),a=document.body.lastElementChild;if(a&&"cardnews-light-modal"===a.tagName?.toLowerCase()){const t=()=>{this._openLightModals.delete(i)};a.addEventListener("close",t,{once:!0}),this._openLightModals.set(i,{el:a,close:()=>{s.close(),t()}})}}_fireMoreInfo(t){const e=new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t}});this.dispatchEvent(e)}_openRemote(t){if(!this.hass||!t.entity)return;const e=t.remote??"ac",i=`${e}:${t.entity}`,n=this._openRemoteModals.get(i);if(n)return n.close(),void this._openRemoteModals.delete(i);const s=function(t){const e=document.createElement("cardnews-remote-modal");return e.hass=t.hass,e.kind=t.kind,e.entity=t.entity,e.deviceName=t.deviceName??"",document.body.appendChild(e),{close:()=>{e.parentElement&&e.parentElement.removeChild(e)}}}({hass:this.hass,kind:e,entity:t.entity,deviceName:t.label??this._entityFriendly(t.entity)??void 0}),a=document.body.lastElementChild;if(a&&"cardnews-remote-modal"===a.tagName?.toLowerCase()){const t=()=>{this._openRemoteModals.delete(i)};a.addEventListener("close",t,{once:!0}),this._openRemoteModals.set(i,{el:a,close:()=>{s.close(),t()}})}}_openTvRemote(t){if(!this.hass)return;const e=t.remote||"",i=t.tv_entity||"",n=`tv:${e||i||t.entity||""}`,s=this._openTvRemoteModals.get(n);if(s)return s.close(),void this._openTvRemoteModals.delete(n);const a=function(t){const e=document.createElement("cardnews-tv-remote-modal");return e.hass=t.hass,e.remote=t.action.remote??"",e.tvEntity=t.action.tv_entity??"",e.volumeEntity=t.action.volume_entity??"",e.apps=t.action.apps??[],e.sourceAppsEntity=t.action.source_apps_entity??"",e.hdmiSelect=t.action.hdmi_select??"",e.hdmiPower=t.action.hdmi_power??"",e.hdmiPrev=t.action.hdmi_prev??"",e.hdmiNext=t.action.hdmi_next??"",e.deviceName=t.deviceName??"",document.body.appendChild(e),{close:()=>{e.parentElement&&e.parentElement.removeChild(e)}}}({hass:this.hass,action:t,deviceName:t.label??this._entityFriendly(i||t.entity)??void 0}),o=document.body.lastElementChild;if(o&&"cardnews-tv-remote-modal"===o.tagName?.toLowerCase()){const t=()=>{this._openTvRemoteModals.delete(n)};o.addEventListener("close",t,{once:!0}),this._openTvRemoteModals.set(n,{el:o,close:()=>{a.close(),t()}})}}_callHeroService(t,e){if(!this.hass)return;let i=t.service,n=t.service_data;if(t.toggle_service&&t.active_states&&t.active_states.includes(e)&&(i=t.toggle_service,n=t.toggle_service_data??t.service_data),!i)return;const[s,a]=i.split(".");if(!s||!a)return;const o={...n??{}};t.entity&&!("entity_id"in o)&&(o.entity_id=t.entity),this.hass.callService(s,a,o)}_callToggle(t){if(!this.hass)return;const[e]=t.split(".");e&&this.hass.callService("homeassistant","toggle",{entity_id:t})}}ee.styles=r`
    ${Xt}

    :host {
      display: block;
      /* margin removed in v0.9 — parent grid handles spacing */
      --cn-radius: 20px;
      --cn-radius-inner: 12px;
      --cn-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      --cn-bg-card: var(--card-background-color, #ffffff);
      --cn-text-primary: var(--primary-text-color, #1a1a1a);
      --cn-text-secondary: var(--secondary-text-color, #6b7280);
      --cn-text-hero: #ffffff;

      --cn-chip-dark-bg: rgba(255, 255, 255, 0.15);
      --cn-chip-dark-fg: #ffffff;
      --cn-chip-light-bg: rgba(0, 0, 0, 0.06);
      --cn-chip-light-fg: var(--cn-text-primary);

      --cn-status-ok-dot: #34d399;
      --cn-status-warn-dot: #fbbf24;
      --cn-status-error-dot: #f87171;
      --cn-status-info-dot: #60a5fa;
      --cn-status-gray-dot: #9ca3af;

      --cn-toggle-track: #1f2937;
      --cn-toggle-handle-off: #9ca3af;
      --cn-toggle-handle-on: #22d3ee;

      --cn-divider: rgba(0, 0, 0, 0.06);

      --cn-hero-height: 260px;
      --cn-hero-height-lg: 340px;

      --cn-touch-min: 44px;
      --cn-row-height: 40px;

      --cn-font-family: ${o("'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif")};
      --cn-font-row: 15px;
      --cn-font-category: 13px;
      --cn-font-status: 13px;
      --cn-font-hero-subtitle: 13px;
      --cn-font-hero-title: 26px;
      --cn-font-hero-title-lg: 30px;
      --cn-line-tight: 1.2;
      --cn-line-normal: 1.45;
      --cn-letter-tight: -0.01em;
      --cn-letter-hero: -0.02em;
      --cn-letter-category: 0.06em;

      display: block;
      font-family: var(--cn-font-family);
      color: var(--cn-text-primary);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --cn-divider: rgba(255, 255, 255, 0.08);
      }
    }

    .cn-card {
      border-radius: var(--cn-radius);
      overflow: hidden;
      box-shadow: var(--cn-shadow);
      background: var(--cn-bg-card);
      color: var(--cn-text-primary);
      font-family: var(--cn-font-family);
    }

    /* --- hero --- */
    .cn-hero {
      position: relative;
      width: 100%;
      height: var(--cn-hero-height);
      isolation: isolate;
      overflow: hidden;
    }
    .cn-hero__image {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      transition: opacity 800ms ease;
      will-change: opacity;
      z-index: 0;
    }
    /* v0.8 — light glow overlay */
    .cn-hero__glow {
      position: absolute;
      inset: 0;
      pointer-events: none;
      mix-blend-mode: screen;
      transition: opacity 600ms ease;
      z-index: 1;
    }
    .cn-hero--dark { color: var(--cn-text-hero); }
    .cn-hero--light { color: var(--cn-text-primary); }
    .cn-hero--lg { height: var(--cn-hero-height-lg); }
    .cn-hero--lg .cn-hero__title { font-size: var(--cn-font-hero-title-lg); }
    .cn-hero__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.15) 0%,
        transparent 35%,
        rgba(0, 0, 0, 0.6) 100%
      );
      z-index: 2;
    }
    .cn-hero--light .cn-hero__overlay {
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.05) 0%,
        transparent 35%,
        rgba(255, 255, 255, 0.4) 100%
      );
    }

    /* --- category chip --- */
    .cn-category {
      position: absolute;
      top: 14px;
      left: 16px;
      z-index: 3;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 999px;
      background: var(--cn-chip-dark-bg);
      color: var(--cn-chip-dark-fg);
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: var(--cn-font-category);
      line-height: 1;
      letter-spacing: var(--cn-letter-category);
      text-transform: uppercase;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    .cn-hero--light .cn-category {
      background: var(--cn-chip-light-bg);
      color: var(--cn-chip-light-fg);
    }

    /* --- status pill --- */
    .cn-status {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 3;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--cn-chip-dark-bg);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 999px;
      color: var(--cn-chip-dark-fg);
      font-family: var(--cn-font-family);
      font-weight: 500;
      font-size: var(--cn-font-status);
      line-height: 1;
    }
    .cn-hero--light .cn-status {
      background: var(--cn-chip-light-bg);
      color: var(--cn-chip-light-fg);
    }
    .cn-status__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--cn-status-ok-dot);
    }
    .cn-status--green .cn-status__dot { background: var(--cn-status-ok-dot); }
    .cn-status--gray .cn-status__dot { background: var(--cn-status-gray-dot); }
    .cn-status--blue .cn-status__dot { background: var(--cn-status-info-dot); }
    .cn-status--red .cn-status__dot { background: var(--cn-status-error-dot); }
    .cn-status--amber .cn-status__dot { background: var(--cn-status-warn-dot); }


    /* v0.10 — hero top-right action chip stack */
    .cn-hero__actions {
      position: absolute;
      bottom: 14px;
      right: 14px;
      z-index: 5;
      display: inline-flex;
      align-items: flex-end;
      gap: 10px;
      pointer-events: none;
    }
    .cn-hero-action-wrap {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    }
    .cn-hero-action__label {
      pointer-events: none;
      font-family: var(--cn-font-family);
      font-size: 13px;
      font-weight: 600;
      line-height: 1.1;
      color: #ffffff;
      letter-spacing: -0.02em;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.65), 0 0 6px rgba(0, 0, 0, 0.4);
      white-space: nowrap;
      max-width: 90px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cn-hero-action {
      pointer-events: auto;
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      border: 1px solid transparent;
      background:
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.04) 0%,
          rgba(255, 255, 255, 0.02) 45%,
          rgba(255, 255, 255, 0.00) 100%
        ) padding-box,
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.35) 0%,
          rgba(255, 255, 255, 0.08) 40%,
          rgba(255, 255, 255, 0.03) 60%,
          rgba(255, 255, 255, 0.18) 100%
        ) border-box;
      backdrop-filter: blur(3px) saturate(140%);
      -webkit-backdrop-filter: blur(3px) saturate(140%);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: transform 0.12s ease, border-color 0.18s ease, box-shadow 0.18s ease;
      padding: 0;
      overflow: hidden;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.32),
        0 2px 4px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
    }
    /* specular highlight (glass sheen) */
    .cn-hero-action::before {
      content: '';
      position: absolute;
      inset: 2px 2px auto 2px;
      height: 45%;
      border-radius: 12px 12px 40% 40% / 12px 12px 100% 100%;
      background: linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.08) 0%,
        rgba(255, 255, 255, 0) 100%
      );
      pointer-events: none;
    }
    .cn-hero-action--on {
      background:
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.10) 0%,
          rgba(255, 255, 255, 0.04) 45%,
          rgba(255, 255, 255, 0.02) 100%
        ) padding-box,
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.5) 0%,
          rgba(255, 255, 255, 0.12) 40%,
          rgba(255, 255, 255, 0.05) 60%,
          rgba(255, 255, 255, 0.25) 100%
        ) border-box;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(52, 211, 153, 0.4),
        0 0 6px rgba(52, 211, 153, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.28),
        inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    }
    .cn-hero-action:hover {
      transform: translateY(-1px);
    }
    .cn-hero-action:active { transform: scale(0.94); }
    .cn-hero-action:focus-visible {
      outline: 2px solid #22d3ee;
      outline-offset: 2px;
    }

    @keyframes cn-hero-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .cn-hero-action--spin ha-icon,
    .cn-hero-action--spin svg {
      animation: cn-hero-spin 2.5s linear infinite;
      transform-origin: center;
    }
    .cn-hero-action--spin.cn-hero-action--on ha-icon,
    .cn-hero-action--spin.cn-hero-action--on svg {
      animation-duration: 1.4s;
    }



        .cn-hero__text {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 14px;
      z-index: 3;
      pointer-events: none;
    }
    .cn-hero--dark .cn-hero__title {
      color: #ffffff;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    }
    .cn-hero__title {
      font-family: var(--cn-font-family);
      font-weight: 700;
      font-size: var(--cn-font-hero-title);
      line-height: var(--cn-line-tight);
      letter-spacing: var(--cn-letter-hero);
    }
    .cn-hero--dark .cn-hero__subtitle {
      color: rgba(255, 255, 255, 0.85);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    }
    .cn-hero__subtitle {
      margin-top: 4px;
      font-family: var(--cn-font-family);
      font-weight: 500;
      font-size: var(--cn-font-hero-subtitle);
      line-height: 1.3;
      color: var(--cn-text-secondary);
    }

    /* --- ha-icon reset --- */
    ha-icon {
      --mdc-icon-size: 24px;
      width: var(--mdc-icon-size);
      height: var(--mdc-icon-size);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: inherit;
    }

    /* --- body / list --- */
    .cn-body {
      padding: 4px 0 8px;
      font-family: var(--cn-font-family);
    }
    .cn-list {
      display: flex;
      flex-direction: column;
    }
    .cn-row {
      min-height: 40px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 20px;
      transition: background 120ms ease;
      color: var(--cn-text-primary);
    }
    .cn-row + .cn-row {
      border-top: 1px solid var(--cn-divider);
    }
    .cn-row--header {
      min-height: 26px;
      padding: 10px 20px 4px;
      color: var(--cn-text-secondary, #9ca3af);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .cn-row--header + .cn-row {
      border-top: none;
    }
    .cn-row + .cn-row--header {
      border-top: 1px solid var(--cn-divider);
      margin-top: 4px;
    }
    .cn-row__header-text { display: inline-block; }
    .cn-row--clickable {
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .cn-row--clickable:hover {
      background: rgba(0, 0, 0, 0.03);
    }
    @media (prefers-color-scheme: dark) {
      .cn-row--clickable:hover {
        background: rgba(255, 255, 255, 0.04);
      }
    }
    .cn-row--clickable:focus-visible {
      outline: 2px solid #22d3ee;
      outline-offset: -2px;
    }
    .cn-row__icon-slot {
      flex-shrink: 0;
      width: 32px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }
    .cn-row__label {
      flex: 1;
      min-width: 0;
      font-family: var(--cn-font-family);
      font-weight: 500;
      font-size: var(--cn-font-row);
      line-height: var(--cn-line-normal);
      color: var(--cn-text-secondary);
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cn-row__value {
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: var(--cn-font-row);
      line-height: var(--cn-line-normal);
      letter-spacing: var(--cn-letter-tight);
      color: var(--cn-text-primary);
      text-align: right;
      font-variant-numeric: tabular-nums;
    }


    /* --- Light row color chip --- */
    .cn-color-chip {
      position: relative;
      width: 32px;
      height: 32px;
      margin-right: 4px;
      border-radius: 50%;
      border: none;
      background: conic-gradient(from 0deg,
        #ef4444, #f59e0b, #fde047, #4ade80, #22d3ee, #6366f1, #a855f7, #ec4899, #ef4444);
      cursor: pointer;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: rgba(255,255,255,0.95);
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 6px rgba(0,0,0,0.28);
      transition: transform 0.12s, box-shadow 0.15s;
      flex-shrink: 0;
    }
    .cn-color-chip:hover { transform: scale(1.08); }
    .cn-color-chip:active { transform: scale(0.94); }
    .cn-color-chip__ring {
      position: absolute;
      inset: 4px;
      border-radius: 50%;
      background: rgba(0,0,0,0.35);
      backdrop-filter: blur(2px);
    }
    .cn-color-chip ha-icon { position: relative; z-index: 1; }

    /* --- iOS-style toggle --- */
    .cn-toggle-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      margin: -10px -8px -10px 0;
    }
    /* --- v0.16 iOS 26 liquid-glass toggle --- */
    .cn-toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 26px;
      border-radius: 13px;
      /* Track: neutral glass (off state) — semi-transparent dark on white cards, gets accent tint on-state */
      background:
        linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.05) 100%) padding-box,
        linear-gradient(145deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.04) 55%, rgba(0,0,0,0.10) 100%) border-box;
      border: 1px solid transparent;
      box-shadow:
        inset 0 1.5px 3px rgba(0,0,0,0.18),
        inset 0 -1px 0 rgba(255,255,255,0.3);
      transition: background 0.25s ease, box-shadow 0.25s ease;
      flex-shrink: 0;
      overflow: hidden;
    }
    .cn-toggle--on {
      background:
        linear-gradient(180deg,
          color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 62%, rgba(255,255,255,0.15)) 0%,
          color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 78%, transparent) 100%) padding-box,
        linear-gradient(145deg,
          color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 80%, rgba(255,255,255,0.4)) 0%,
          color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 40%, rgba(255,255,255,0.1)) 55%,
          color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 60%, rgba(0,0,0,0.15)) 100%) border-box;
      box-shadow:
        inset 0 1.5px 3px color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 40%, rgba(0,0,0,0.15)),
        inset 0 -1px 0 rgba(255,255,255,0.35),
        0 0 10px color-mix(in srgb, var(--cn-toggle-handle-on, #22d3ee) 35%, transparent);
    }
    .cn-toggle__handle {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      /* Liquid glass ball */
      background:
        radial-gradient(65% 65% at 32% 28%,
          rgba(255,255,255,0.98) 0%,
          rgba(255,255,255,0.75) 45%,
          rgba(255,255,255,0.55) 100%);
      box-shadow:
        0 2px 4px rgba(0,0,0,0.28),
        0 1px 1px rgba(0,0,0,0.14),
        inset 0 1px 0 rgba(255,255,255,0.9),
        inset 0 -1px 2px rgba(0,0,0,0.12);
      transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    /* Specular highlight on top of the ball */
    .cn-toggle__handle::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 4px;
      right: 4px;
      height: 40%;
      border-radius: 50% 50% 40% 40% / 60% 60% 30% 30%;
      background: linear-gradient(to bottom,
        rgba(255,255,255,0.85) 0%,
        rgba(255,255,255,0.05) 100%);
      pointer-events: none;
    }
    .cn-toggle--on .cn-toggle__handle {
      transform: translateX(18px);
    }

    /* --- slider --- */
    .cn-slider {
      flex: 1;
      min-width: 100px;
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      border-radius: 2px;
      background: var(--cn-divider);
      outline: none;
      cursor: pointer;
    }
    .cn-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #22d3ee;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      cursor: pointer;
    }
    .cn-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #22d3ee;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      cursor: pointer;
    }


    /* --- bar row (v0.9) --- */
    .cn-row--bar {
      align-items: center;
      padding-top: 8px;
      padding-bottom: 8px;
    }
    .cn-row__bar-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .cn-row__bar-top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }
    .cn-row--bar .cn-row__label {
      flex: 0 1 auto;
    }
    .cn-bar-track {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: var(--cn-divider);
      overflow: hidden;
    }
    .cn-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 300ms ease;
    }
    /* --- chip button (button.* domain) ---
       Sized to match .cn-toggle (40x24) so button.* rows visually align with
       switch.* rows in the same list. Wrapped in the same 44x44 tap target. */
    .cn-chip-btn-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      margin: -10px -8px -10px 0;
    }
    .cn-chip-btn {
      border: none;
      background: var(--cn-toggle-track);
      color: #fff;
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: 13px;
      line-height: 1;
      padding: 0;
      width: 40px;
      height: 24px;
      border-radius: 12px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: opacity 0.15s;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .cn-chip-btn:hover { opacity: 0.85; }
    .cn-chip-btn:active { opacity: 0.6; }
    /* --- volume row (media_player -/+/mute stepper) --- */
    .cn-row--volume { align-items: center; }
    .cn-volstep {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: -2px -8px -2px 0;
    }
    .cn-volstep__val {
      min-width: 42px;
      text-align: center;
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: 13px;
      color: var(--cn-text-primary);
      font-variant-numeric: tabular-nums;
    }
    .cn-volstep__btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 12px;
      border: 1px solid transparent;
      background:
        linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.00) 100%) padding-box,
        linear-gradient(145deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.03) 60%, rgba(255,255,255,0.18) 100%) border-box;
      backdrop-filter: blur(3px) saturate(140%);
      -webkit-backdrop-filter: blur(3px) saturate(140%);
      color: var(--cn-text-primary);
      font-family: var(--cn-font-family);
      font-weight: 700;
      font-size: 16px;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
      isolation: isolate;
      padding: 0;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.32),
        0 2px 4px rgba(0, 0, 0, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        inset 0 -1px 0 rgba(0, 0, 0, 0.12);
      transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease;
    }
    .cn-volstep__btn::before {
      content: '';
      position: absolute;
      inset: 2px 2px auto 2px;
      height: 45%;
      border-radius: 10px 10px 40% 40% / 10px 10px 100% 100%;
      background: linear-gradient(to bottom, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 100%);
      pointer-events: none;
      z-index: 1;
    }
    .cn-volstep__btn > * { position: relative; z-index: 2; }
    .cn-volstep__btn:hover { transform: translateY(-1px); }
    .cn-volstep__btn:active { transform: scale(0.97); }
    .cn-volstep__btn--active { color: var(--cn-accent, #22d3ee); }
    .cn-volstep__btn--mute { margin-left: 8px; }

        /* --- v0.15 inline accordion dropdown (replaces native <select>) --- */
    .cn-row--select { align-items: center; }
    .cn-dropdown__current {
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: var(--cn-font-row);
      line-height: var(--cn-line-normal);
      letter-spacing: var(--cn-letter-tight);
      color: var(--cn-text-primary);
      text-align: right;
      font-variant-numeric: tabular-nums;
      margin-right: 2px;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .cn-dropdown__chevron {
      margin-left: 2px;
      margin-right: -4px;
    }
    .cn-dropdown__chevron {
      display: inline-flex;
      align-items: center;
      transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .cn-dropdown__chevron--open { transform: rotate(180deg); }
    .cn-dropdown-anchor { position: relative; }
    .cn-dropdown__backdrop {
      position: fixed;
      inset: 0;
      background: transparent;
      z-index: 9999;
    }
    .cn-dropdown__popover {
      position: absolute;
      top: calc(-6px);
      right: 4px;
      z-index: 20;
      min-width: 160px;
      max-width: 260px;
      background: var(--cn-bg-card, #ffffff);
      color: var(--cn-text-primary, #1a1a1a);
      border: 1px solid rgba(0,0,0,0.10);
      border-radius: 14px;
      box-shadow:
        0 12px 32px rgba(0,0,0,0.18),
        0 2px 6px rgba(0,0,0,0.10);
      padding: 6px;
      overflow: hidden;
      animation: cn-dropdown-in 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes cn-dropdown-in {
      from { opacity: 0; transform: translateY(-4px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .cn-dropdown__opt {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 9px 10px;
      border-radius: 8px;
      font-family: var(--cn-font-family);
      font-size: 13px;
      font-weight: 500;
      color: var(--cn-text-primary);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: background 0.12s ease;
    }
    .cn-dropdown__opt-lbl { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cn-dropdown__opt:hover { background: rgba(0,0,0,0.05); }
    .cn-dropdown__opt:active { background: rgba(0,0,0,0.08); }
    .cn-dropdown__opt--active { color: var(--cn-accent, #22d3ee); font-weight: 700; }
    .cn-dropdown__check {
      width: 18px; height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* --- v0.14 balls row (Korean 6/45 lotto) --- */
    .cn-row--balls {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding-top: 10px;
      padding-bottom: 10px;
    }
    .cn-row__label--balls { width: 100%; }
    .cn-balls {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
      width: 100%;
    }
    .cn-ball {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      color: #fff;
      font-family: var(--cn-font-family);
      font-weight: 800;
      font-size: 14px;
      letter-spacing: -0.02em;
      box-shadow:
        inset 0 -3px 4px rgba(0, 0, 0, 0.25),
        inset 0 2px 2px rgba(255, 255, 255, 0.35),
        0 2px 4px rgba(0, 0, 0, 0.18);
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
    }
    .cn-balls__plus {
      font-family: var(--cn-font-family);
      font-weight: 700;
      font-size: 16px;
      color: var(--cn-text-secondary);
      margin: 0 2px;
    }

    /* --- v0.14 forecast row --- */
    .cn-row--forecast {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
      padding-top: 10px;
      padding-bottom: 10px;
    }
    .cn-forecast {
      display: flex;
      justify-content: space-between;
      gap: 6px;
      width: 100%;
    }
    .cn-forecast__day {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
    .cn-forecast__dow {
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: 13px;
      color: var(--cn-text-secondary);
      letter-spacing: -0.01em;
    }
    .cn-forecast__temps {
      display: inline-flex;
      align-items: baseline;
      gap: 4px;
      font-family: var(--cn-font-family);
      font-variant-numeric: tabular-nums;
    }
    .cn-forecast__hi {
      font-weight: 700;
      font-size: 13px;
      color: var(--cn-text-primary);
    }
    .cn-forecast__lo {
      font-weight: 500;
      font-size: 13px;
      color: var(--cn-text-secondary);
    }

    /* --- calendar_events row --- */
    .cn-cal-list--scroll {
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: rgba(148,163,184,0.35) transparent;
      padding-right: 4px;
    }
    .cn-cal-list--scroll::-webkit-scrollbar {
      width: 6px;
    }
    .cn-cal-list--scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .cn-cal-list--scroll::-webkit-scrollbar-thumb {
      background: rgba(148,163,184,0.28);
      border-radius: 999px;
    }
    .cn-cal-list--scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(148,163,184,0.5);
    }
    .cn-row--calendar {
      cursor: pointer;
      border-radius: 8px;
      transition: background 120ms ease;
    }
    .cn-row--calendar:hover {
      background: rgba(255,255,255,0.04);
    }
    .cn-row--calendar:focus-visible {
      outline: 1px solid rgba(34,211,238,0.5);
      outline-offset: 1px;
    }
    .cn-cal-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 4px 0;
    }
    .cn-cal-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .cn-cal-group__hdr {
      font-family: var(--cn-font-family);
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.01em;
      color: var(--cn-text-secondary);
      padding: 6px 4px 2px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      margin-bottom: 2px;
    }
    .cn-row--calendar {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 4px;
      min-height: 0;
    }
    .cn-row--calendar__dot {
      display: inline-block;
      flex: 0 0 auto;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 8px;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.05);
    }
    .cn-row--calendar__main {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
    }
    .cn-row--calendar__head {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex-wrap: wrap;
    }
    .cn-row--calendar__date {
      font-family: var(--cn-font-family);
      font-variant-numeric: tabular-nums;
      font-weight: 500;
      font-size: 13px;
      color: var(--cn-text-secondary);
      letter-spacing: -0.01em;
    }
    .cn-row--calendar__title {
      font-family: var(--cn-font-family);
      font-weight: 600;
      font-size: 15px;
      color: var(--cn-text-primary);
      letter-spacing: -0.01em;
      line-height: 1.3;
    }
    .cn-row--calendar__desc {
      font-family: var(--cn-font-family);
      font-weight: 400;
      font-size: 13px;
      color: var(--cn-text-secondary);
      line-height: 1.35;
      opacity: 0.85;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .cn-row--calendar-empty {
      display: flex;
      justify-content: center;
      padding: 16px 8px;
    }
    .cn-cal-empty {
      font-family: var(--cn-font-family);
      font-weight: 500;
      font-size: 14px;
      color: var(--cn-text-secondary);
      opacity: 0.7;
    }

        .cn-error {
      padding: 16px;
      color: var(--cn-status-error-dot, #f87171);
      font-family: var(--cn-font-family);
      font-weight: 500;
      font-size: 13px;
      line-height: 1.4;
    }
  `,t([_t()],ee.prototype,"_openSelects",void 0),t([_t()],ee.prototype,"_calendarEvents",void 0),t([gt({attribute:!1})],ee.prototype,"hass",void 0),t([_t()],ee.prototype,"_configError",void 0),t([_t()],ee.prototype,"_heroImgA",void 0),t([_t()],ee.prototype,"_heroImgB",void 0),t([_t()],ee.prototype,"_heroActive",void 0);class ie extends ee{constructor(){super(...arguments),this._hasConfig=!1}setConfig(t){super.setConfig(t);const e=t;e&&"object"==typeof e?e.title||e.title_template?(this._config={type:"custom:cardnews-hero-info",...e},this._hasConfig=!0):this._configError="cardnews-hero-info: `title` or `title_template` is required":this._configError="Invalid config"}static async getConfigElement(){return await Promise.resolve().then(function(){return ze}),document.createElement("cardnews-hero-info-editor")}static getStubConfig(){return{category:"LIVING · CLIMATE",category_icon:"mdi:home",title:"거실",subtitle:"25.2° · 48%",status_text:"AC ON",status_color:"green",list:[{icon:"mdi:thermometer",label:"현재 온도",entity:"sensor.living_temp"},{type:"switch",icon:"mdi:lightbulb-outline",label:"천장 조명",entity:"light.ceiling"},{type:"slider",icon:"mdi:brightness-6",label:"밝기",entity:"light.ceiling"}]}}render(){if(!this._hasConfig||!this._config)return G;const t=this._config,e=this.renderHero(t),i=this.renderList(t.list);return this.renderCard(e,i)}}t([_t()],ie.prototype,"_hasConfig",void 0),customElements.get("cardnews-hero-info")||customElements.define("cardnews-hero-info",ie);class ne extends ee{constructor(){super(...arguments),this._hasConfig=!1}setConfig(t){super.setConfig(t);const e=t;e&&"object"==typeof e?e.name?(this._config={type:"custom:cardnews-room",...e},this._hasConfig=!0):this._configError="cardnews-room: `name` is required":this._configError="Invalid config"}static async getConfigElement(){return await Promise.resolve().then(function(){return Re}),document.createElement("cardnews-room-editor")}static getStubConfig(){return{name:"거실",category:"LIVING ROOM",category_icon:"mdi:sofa",switches:[]}}render(){if(!this._hasConfig||!this._config)return G;const t=this._config,e=t.temp_entity?this._entityState(t.temp_entity,""):"",i=t.humidity_entity?this._entityState(t.humidity_entity,""):"",n=[];e&&n.push(Math.round(10*Number(e))/10+"°"),i&&n.push(`${Math.round(Number(i))}%`);const s={category:t.category,category_icon:t.category_icon,title:t.name,subtitle:n.join(" · ")||void 0,hero_image:t.hero_image,hero_image_entity:t.hero_image_entity,room:t.room,hero_theme:t.hero_theme,status_entity:t.status_entity,status_text:t.status_text,status_color:t.status_color,glow_entities:t.glow_entities,glow_position:t.glow_position,glow_color:t.glow_color},a=[];if(t.temp_entity&&a.push({type:"value",icon:"mdi:thermometer",label:"온도",entity:t.temp_entity,unit:"°C"}),t.humidity_entity&&a.push({type:"value",icon:"mdi:water-percent",label:"습도",entity:t.humidity_entity,unit:"%"}),t.list&&t.list.length&&a.push(...t.list),t.switches&&t.switches.length)for(const e of t.switches)a.push({type:"switch",entity:e.entity,label:e.label,icon:e.icon??this._defaultIconFor(e.entity),light_entity:e.light_entity,light_entities:e.light_entities,light_labels:e.light_labels});const o=this.renderHero(s),r=this.renderList(a);return this.renderCard(o,r)}_defaultIconFor(t){const[e]=t.split(".");return"light"===e?"mdi:lightbulb-outline":"switch"===e?"mdi:toggle-switch-outline":"fan"===e?"mdi:fan":"mdi:power"}}t([_t()],ne.prototype,"_hasConfig",void 0),customElements.get("cardnews-room")||customElements.define("cardnews-room",ne);let se=class extends dt{setConfig(t){this._cfg={icon:"mdi:refresh",...t}}render(){if(!this._cfg)return K``;const t=this._cfg.label;return K`
      <ha-card
        class=${t?"with-label":"icon-only"}
        @click=${()=>window.location.reload()}
      >
        <ha-icon icon=${this._cfg.icon||"mdi:refresh"}></ha-icon>
        ${t?K`<span class="label">${t}</span>`:""}
      </ha-card>
    `}getCardSize(){return 1}static async getConfigElement(){return await Promise.resolve().then(function(){return ci}),document.createElement("cardnews-reload-btn-editor")}static getStubConfig(){return{}}};se.styles=r`
    :host { display: block; height: 100%; }
    ha-card {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      height: 100% !important;
      min-height: 36px;
      border-radius: 999px !important;
      padding: 0 !important;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition: opacity 0.15s;
      gap: 6px;
    }
    ha-card.with-label {
      padding: 6px 14px 6px 10px !important;
    }
    ha-card.icon-only {
      width: 44px;
      padding: 0 !important;
    }
    ha-card:active { opacity: 0.6; }
    ha-icon {
      --mdc-icon-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--secondary-text-color);
    }
    .label {
      font-size: 13px;
      font-weight: 600;
      color: var(--primary-text-color);
      line-height: 1;
      font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif;
    }
  `,t([gt({attribute:!1})],se.prototype,"hass",void 0),t([_t()],se.prototype,"_cfg",void 0),se=t([pt("cardnews-reload-btn")],se);const ae="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";!function(){if("undefined"==typeof document)return;const t="cn-pretendard-font";if(document.getElementById(t))return;const e=document.createElement("link");e.id=t,e.rel="stylesheet",e.href=ae,e.crossOrigin="anonymous",document.head.appendChild(e)}();const oe=o(`@import url('${ae}');`);let re=0;const ce=new Set(["INPUT","TEXTAREA","SELECT","HA-SLIDER","HA-CONTROL-SLIDER","HA-CONTROL-CIRCULAR-SLIDER","HA-MORE-INFO-DIALOG","HA-DIALOG","SWIPER-CONTAINER","HUI-VIEW-BADGES"]);class le extends dt{constructor(){super(...arguments),this._currentPath="",this._swipeArmed=!1}setConfig(t){const e=t;if(!e||"object"!=typeof e)throw new Error("cardnews-nav-tabs: invalid config");if(!Array.isArray(e.tabs)||0===e.tabs.length)throw new Error("cardnews-nav-tabs: `tabs` must be a non-empty array");for(const t of e.tabs)if(!t||"object"!=typeof t||!t.icon||!t.path)throw new Error("cardnews-nav-tabs: each tab requires `icon` and `path`");this._config={type:"custom:cardnews-nav-tabs",...e}}getCardSize(){return 1}static async getConfigElement(){return await Promise.resolve().then(function(){return si}),document.createElement("cardnews-nav-tabs-editor")}static getStubConfig(){return{tabs:[{icon:"mdi:view-dashboard",label:"Summary",path:"/cardnews-lab/summary"},{icon:"mdi:flash",label:"에너지",path:"/cardnews-lab/energy"}]}}connectedCallback(){super.connectedCallback(),"undefined"!=typeof window&&(this._currentPath=window.location.pathname,this._locListener=()=>{this._currentPath=window.location.pathname},window.addEventListener("location-changed",this._locListener),window.addEventListener("popstate",this._locListener),this._attachSwipe())}disconnectedCallback(){super.disconnectedCallback(),"undefined"!=typeof window&&this._locListener&&(window.removeEventListener("location-changed",this._locListener),window.removeEventListener("popstate",this._locListener)),this._detachSwipe()}_attachSwipe(){this._onTouchStart||(this._onTouchStart=t=>this._handleTouchStart(t),this._onTouchEnd=t=>this._handleTouchEnd(t),this._onTouchCancel=()=>{this._touchStart=void 0,this._swipeArmed=!1},window.addEventListener("touchstart",this._onTouchStart,{passive:!0}),window.addEventListener("touchend",this._onTouchEnd,{passive:!0}),window.addEventListener("touchcancel",this._onTouchCancel,{passive:!0}))}_detachSwipe(){"undefined"!=typeof window&&(this._onTouchStart&&window.removeEventListener("touchstart",this._onTouchStart),this._onTouchEnd&&window.removeEventListener("touchend",this._onTouchEnd),this._onTouchCancel&&window.removeEventListener("touchcancel",this._onTouchCancel),this._onTouchStart=void 0,this._onTouchEnd=void 0,this._onTouchCancel=void 0,this._touchStart=void 0,this._swipeArmed=!1)}get _swipeEnabled(){return!1!==this._config?.swipe}_isVisible(){const t=this.getBoundingClientRect();return t.width>0&&t.height>0}_startsInBlockedArea(t){if(document.querySelector("cardnews-light-modal, cardnews-remote-modal, cardnews-tv-remote-modal, cardnews-event-modal, ha-dialog, dialog[open]"))return!0;const e=t.composedPath?.()??[];for(const t of e)if(t instanceof HTMLElement){if(ce.has(t.tagName))return!0;if(t.hasAttribute("data-no-swipe"))return!0;if(t.scrollWidth-t.clientWidth>2){const e=getComputedStyle(t).overflowX;if("auto"===e||"scroll"===e)return!0}}return!1}_handleTouchStart(t){if(this._touchStart=void 0,this._swipeArmed=!1,!this._swipeEnabled||!this._config)return;if(1!==t.touches.length)return;if(!this._isVisible())return;if(this._startsInBlockedArea(t))return;const e=t.touches[0];this._touchStart={x:e.clientX,y:e.clientY,t:Date.now()},this._swipeArmed=!0}_handleTouchEnd(t){const e=this._touchStart,i=this._swipeArmed;if(this._touchStart=void 0,this._swipeArmed=!1,!i||!e||!this._config)return;if(t.touches.length>0)return;const n=t.changedTouches[0];if(!n)return;const s=n.clientX-e.x,a=n.clientY-e.y,o=Date.now()-e.t,r=Math.max(20,this._config.swipe_threshold??60);if(o>800)return;if(Math.abs(s)<r)return;if(Math.abs(s)<1.8*Math.abs(a))return;const c=Date.now();if(c-re<400)return;const l=this._neighbourTab(s<0?1:-1);l&&(re=c,this._navigate(l.path))}_neighbourTab(t){const e=this._config?.tabs??[];if(e.length<2)return;const i=e.findIndex(t=>this._isActive(t));if(i<0)return;let n=i+t;if(n<0||n>=e.length){if(!this._config?.swipe_wrap)return;n=(n+e.length)%e.length}return e[n]}_isActive(t){if(!this._config)return!1;const e=this._config.active;if(e){if(t.id&&t.id===e)return!0;const i=t.path.split("/").filter(Boolean).pop();return!(!i||i!==e)}const i=this._currentPath||"",n=this._config.tabs;let s,a=-1;for(const t of n)(i===t.path||i.startsWith(t.path+"/")||i.startsWith(t.path))&&t.path.length>a&&(s=t,a=t.path.length);return s===t}_navigate(t){if("undefined"==typeof window)return;try{window.history.pushState(null,"",t)}catch{return void window.location.assign(t)}const e=new CustomEvent("location-changed",{bubbles:!0,composed:!0,detail:{replace:!1}});this.dispatchEvent(e),window.dispatchEvent(new Event("location-changed")),this._currentPath=window.location.pathname}render(){return this._config?K`
      <ha-card class="cn-nav-card">
        <div class="cn-nav-scroll">
          <div class="cn-nav-row" role="tablist">
            ${this._config.tabs.map(t=>{const e=this._isActive(t);return K`
                <button
                  class=${vt({"cn-nav-tab":!0,"is-active":e})}
                  role="tab"
                  aria-selected=${e?"true":"false"}
                  aria-label=${t.label??t.path}
                  title=${t.label??""}
                  @click=${()=>this._navigate(t.path)}
                >
                  <ha-icon .icon=${t.icon}></ha-icon>
                  <span class="cn-nav-underline" aria-hidden="true"></span>
                </button>
              `})}
          </div>
        </div>
      </ha-card>
    `:K``}}le.styles=r`
    ${oe}

    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1;
      font-family: ${o("'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', system-ui, sans-serif")};
      --cn-nav-active: var(--primary-text-color, #1a1a1a);
      --cn-nav-inactive: var(--secondary-text-color, #6b7280);
    }
    .cn-nav-card {
      border-radius: 20px;
      overflow: hidden;
      background: var(--card-background-color, #ffffff);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    }
    .cn-nav-scroll {
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .cn-nav-scroll::-webkit-scrollbar {
      display: none;
    }
    .cn-nav-row {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 0;
      padding: 0 4px;
      min-width: 100%;
    }
    .cn-nav-tab {
      position: relative;
      flex: 1 0 auto;
      min-width: 44px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 12px 10px;
      background: transparent;
      border: 0;
      cursor: pointer;
      color: var(--cn-nav-inactive);
      -webkit-tap-highlight-color: transparent;
      transition: background 120ms ease, color 120ms ease;
      font-family: inherit;
    }
    .cn-nav-tab:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    @media (prefers-color-scheme: dark) {
      .cn-nav-tab:hover {
        background: rgba(255, 255, 255, 0.06);
      }
    }
    .cn-nav-tab:focus-visible {
      outline: 2px solid #22d3ee;
      outline-offset: -2px;
    }
    .cn-nav-tab.is-active {
      color: var(--cn-nav-active);
    }
    .cn-nav-tab ha-icon {
      --mdc-icon-size: 24px;
      width: 24px;
      height: 24px;
      color: inherit;
    }
    .cn-nav-underline {
      position: absolute;
      left: 20%;
      right: 20%;
      bottom: 4px;
      height: 2px;
      border-radius: 2px;
      background: transparent;
      transition: background 150ms ease;
    }
    .cn-nav-tab.is-active .cn-nav-underline {
      background: var(--cn-nav-active);
    }
  `,t([gt({attribute:!1})],le.prototype,"hass",void 0),t([_t()],le.prototype,"_config",void 0),t([_t()],le.prototype,"_currentPath",void 0),customElements.get("cardnews-nav-tabs")||customElements.define("cardnews-nav-tabs",le);class de extends ee{constructor(){super(...arguments),this._hasConfig=!1,this._pollTick=0,this._imgFailed=!1}setConfig(t){super.setConfig(t);const e=t;e&&"object"==typeof e?e.title?e.camera_entity&&"string"==typeof e.camera_entity?(this._config={type:"custom:cardnews-camera-hero",poll_interval:2e3,...e},this._hasConfig=!0):this._configError="cardnews-camera-hero: `camera_entity` is required":this._configError="cardnews-camera-hero: `title` is required":this._configError="Invalid config"}static async getConfigElement(){return await Promise.resolve().then(function(){return Ue}),document.createElement("cardnews-camera-hero-editor")}static getStubConfig(){return{category:"BEACON NETWORK",title:"주방캠",subtitle:"실시간 모니터링 중",camera_entity:"camera.kitchen",status_color:"green"}}connectedCallback(){super.connectedCallback(),this._startPolling()}disconnectedCallback(){super.disconnectedCallback(),this._stopPolling()}_startPolling(){this._stopPolling();const t=this._config?.poll_interval??2e3;this._pollTimer=setInterval(()=>{this._pollTick=(this._pollTick+1)%1e5},t)}_stopPolling(){this._pollTimer&&(clearInterval(this._pollTimer),this._pollTimer=void 0)}_preloadAndSwap(t){if(this._displayedSrc===t)return;if(this._preloadingSrc===t)return;this._preloadingSrc=t;const e=new Image;e.onload=()=>{this._preloadingSrc===t&&(this._displayedSrc=t,this._preloadingSrc=void 0,this._imgFailed=!1)},e.onerror=()=>{this._preloadingSrc===t&&(this._preloadingSrc=void 0,this._imgFailed=!0)},e.src=t}_renderCameraMedia(){const t=this._config,e=this._entity(t.camera_entity);if(!e||"unavailable"===e.state)return K`
        <div class="cn-cam-fallback">
          <ha-icon icon="mdi:camera-off"></ha-icon>
          <span>카메라 연결 없음</span>
        </div>
      `;const[i]=t.camera_entity.split(".");if("image"===i){const i=e.attributes.entity_picture;if(!i)return K`
          <div class="cn-cam-fallback">
            <ha-icon icon="mdi:image-off"></ha-icon>
            <span>이미지 없음</span>
          </div>
        `;const n=e.attributes.image_last_updated??e.state??"",s=n?encodeURIComponent(n):String(this._pollTick),a=i.includes("?")?"&":"?",o=`${i}${a}_t=${s}`;this._preloadAndSwap(o);const r=`background-image:url("${this._displayedSrc??o}")`;return K`
        <div
          class="cn-cam-img cn-cam-img--contain cn-cam-bg"
          role="img"
          aria-label=${t.title}
          style=${r}
        ></div>
        ${this._imgFailed&&!this._displayedSrc?K`
              <div class="cn-cam-fallback cn-cam-fallback--overlay">
                <ha-icon icon="mdi:image-broken-variant"></ha-icon>
                <span>지도 로딩 실패</span>
              </div>
            `:G}
      `}if("undefined"!=typeof customElements&&customElements.get("ha-camera-stream"))return K`
        <ha-camera-stream
          class="cn-cam-stream"
          .hass=${this.hass}
          .stateObj=${e}
          controls=${!1}
          muted
          allow-exoplayer
        ></ha-camera-stream>
      `;const n=e.attributes.entity_picture;if(!n)return K`
        <div class="cn-cam-fallback">
          <ha-icon icon="mdi:camera-off"></ha-icon>
          <span>스트림 없음</span>
        </div>
      `;const s=n.includes("?")?"&":"?",a=`${n}${s}_t=${this._pollTick}`;return K`<img class="cn-cam-img" src=${a} alt=${t.title} loading="lazy" />`}_resolveStatusOverride(){const t=this._config;let e=t.status_text;if(!e&&t.status_entity){const i=this._entity(t.status_entity);i&&(e=i.state)}return{text:e,color:t.status_color??"gray"}}_renderHero(){const t=this._config,e=this._resolveStatusOverride(),i=t.hero_theme??"dark",n={"cn-hero":!0,"cn-hero--lg":"lg"===t.size,"cn-hero--light":"light"===i,"cn-hero--dark":"light"!==i,"cn-cam-hero":!0},s=t.hero_height?`height:${t.hero_height};min-height:${t.hero_height};aspect-ratio:auto;`:"";return K`
      <div class=${vt(n)} style=${s}>
        <div class="cn-cam-media">${this._renderCameraMedia()}</div>
        <div class="cn-hero__overlay"></div>
        ${t.category?K`
              <div class="cn-category">
                ${t.category_icon?this._renderIcon(t.category_icon,14):G}
                <span>${t.category}</span>
              </div>
            `:G}
        ${e.text?K`
              <div class="cn-status cn-status--${e.color}">
                <span class="cn-status__dot"></span>
                <span class="cn-status__text">${e.text}</span>
              </div>
            `:G}
        ${t.hero_actions&&t.hero_actions.length?K`<div class="cn-hero__actions">
              ${t.hero_actions.map(t=>this._renderHeroAction(t))}
            </div>`:G}
        <div class="cn-hero__text">
          <div class="cn-hero__title">${t.title}</div>
          ${t.subtitle?K`<div class="cn-hero__subtitle">${t.subtitle}</div>`:G}
        </div>
      </div>
    `}render(){if(!this._hasConfig||!this._config)return G;const t=this._renderHero(),e=this.renderList(this._config.list);return this.renderCard(t,e)}}de.styles=[ee.styles,r`
      .cn-cam-hero {
        aspect-ratio: 16 / 9;
        height: auto;
        min-height: var(--cn-hero-height);
        background: #1c1c1e;
        overflow: hidden;
      }
      .cn-cam-media {
        position: absolute;
        inset: 0;
        z-index: 0;
        display: block;
      }
      .cn-cam-media > * {
        width: 100%;
        height: 100%;
      }
      .cn-cam-img,
      .cn-cam-stream {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .cn-cam-img--contain {
        object-fit: contain;
        background: #0a0a0a;
      }
      .cn-cam-bg {
        width: 100%;
        height: 100%;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        background-color: #0a0a0a;
        image-rendering: -webkit-optimize-contrast;
      }
      .cn-cam-img--probe {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
      }
      .cn-cam-fallback--overlay {
        position: absolute;
        inset: 0;
        background: rgba(10, 10, 10, 0.85);
      }
      .cn-cam-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #9ca3af;
        background: linear-gradient(135deg, #3a3a3c, #1c1c1e);
      }
      .cn-cam-fallback ha-icon {
        --mdc-icon-size: 48px;
        width: 48px;
        height: 48px;
      }
      .cn-cam-fallback span {
        font-size: 13px;
        font-weight: 500;
      }
    `],t([_t()],de.prototype,"_hasConfig",void 0),t([_t()],de.prototype,"_pollTick",void 0),t([_t()],de.prototype,"_imgFailed",void 0),t([_t()],de.prototype,"_displayedSrc",void 0),customElements.get("cardnews-camera-hero")||customElements.define("cardnews-camera-hero",de);class he extends ee{constructor(){super(...arguments),this._hasConfig=!1,this._history=[],this._historySeries={},this._historyState="idle"}_chartEntities(){const t=this._config;return t?t.chart_entities&&t.chart_entities.length>0?t.chart_entities:t.chart_entity?[{entity:t.chart_entity,color:t.chart_color}]:[]:[]}setConfig(t){super.setConfig(t);const e=t;e&&"object"==typeof e?e.title||e.title_template?(this._config={type:"custom:cardnews-sensor-panel",chart_hours:24,...e},this._hasConfig=!0):this._configError="cardnews-sensor-panel: `title` or `title_template` is required":this._configError="Invalid config"}static async getConfigElement(){return await Promise.resolve().then(function(){return Qe}),document.createElement("cardnews-sensor-panel-editor")}static getStubConfig(){return{category:"AIR QUALITY · LIVING ROOM",title:"거실 공기질",subtitle:"지금 매우 좋음",hero_image:"hero-airquality",metrics:[{label:"PM2.5",entity:"sensor.pm25",unit:"µg/m³"},{label:"CO2",entity:"sensor.co2",unit:"ppm"}],chart_entity:"sensor.pm25",chart_hours:24}}connectedCallback(){super.connectedCallback(),this._maybeFetch(),this._refreshTimer=setInterval(()=>this._fetchHistory(!0),3e5)}disconnectedCallback(){this._refreshTimer&&(clearInterval(this._refreshTimer),this._refreshTimer=void 0),super.disconnectedCallback()}updated(t){super.updated?.(t),(t.has("hass")||t.has("_hasConfig"))&&this._maybeFetch()}_maybeFetch(){if(!this._hasConfig||!this.hass)return;const t=this._chartEntities();if(0===t.length)return;const e=t.map(t=>t.entity).join(",")+"|"+(this._config?.chart_hours??24);e!==this._lastFetchKey&&(this._lastFetchKey=e,this._fetchHistory())}async _fetchHistory(t=!1){const e=this._chartEntities();if(0===e.length||!this.hass)return;const i=e.map(t=>t.entity),n=i[0],s=this._config?.chart_hours??24,a=new Date,o=new Date(a.getTime()-3600*s*1e3);this._historyState="loading";try{const t=this.hass;let e;e="function"==typeof t.callWS?await t.callWS({type:"history/history_during_period",start_time:o.toISOString(),end_time:a.toISOString(),entity_ids:i,minimal_response:!0,no_attributes:!0}):null;const s={};for(const t of i){const i=this._parseHistory(e,t);s[t]=this._downsample(i,100)}this._historySeries=s,this._history=s[n]??[];const r=Object.values(s).some(t=>t.length>0);this._historyState=r?"ok":"error"}catch(e){console.warn("cardnews-sensor-panel: history fetch failed",e),this._historyState="error",t&&(this._history=[],this._historySeries={})}}_parseHistory(t,e){if(!t)return[];let i=[];if(Array.isArray(t))i=Array.isArray(t[0])?t[0]:t;else if("object"==typeof t&&null!==t){const n=t[e];Array.isArray(n)&&(i=n)}const n=[];for(const t of i){if(!t||"object"!=typeof t)continue;const e=t,i=e.s??e.state,s=e.lu??e.last_updated??e.last_changed;if(void 0===i)continue;const a=Number(i);if(!Number.isFinite(a))continue;let o;if("number"==typeof s)o=1e3*s;else{if("string"!=typeof s)continue;o=new Date(s).getTime()}Number.isFinite(o)&&n.push({t:o,v:a})}return n.sort((t,e)=>t.t-e.t),n}_downsample(t,e){if(t.length<=e)return t;const i=t.length/e,n=[];for(let s=0;s<e;s++){const e=Math.floor(s*i),a=Math.floor((s+1)*i);let o=0,r=0,c=0;for(let i=e;i<a&&i<t.length;i++)o+=t[i].v,c+=t[i].t,r++;r>0&&n.push({t:c/r,v:o/r})}return n}_entityNumber(t){const e=this._entity(t);if(!e)return;const i=Number(e.state);return Number.isFinite(i)?i:void 0}_renderMetric(t){const e=this._entityNumber(t.entity),i=void 0===e?"—":Math.round(10*e)/10,n=t.unit??this._entity(t.entity)?.attributes.unit_of_measurement??"",s=this._trendFor(t.entity,e),a=!!t.entity;return K`
      <div
        class="cn-metric ${a?"cn-metric--clickable":""}"
        @click=${a?()=>this._fireMoreInfo(t.entity):void 0}
      >
        <div class="cn-metric__label">
          ${t.accent?K`<span class="cn-metric__accent" style="background:${t.accent}"></span>`:G}
          ${t.label}
        </div>
        <div class="cn-metric__row">
          <span class="cn-metric__value">${i}</span>
          ${n?K`<span class="cn-metric__unit">${n}</span>`:G}
          ${s?K`<span class="cn-metric__trend cn-metric__trend--${s.dir}">
                ${s.symbol}
              </span>`:G}
        </div>
      </div>
    `}_trendFor(t,e){if(void 0===e)return;if(t!==this._config?.chart_entity)return;if(this._history.length<2)return;const i=this._history[this._history.length-1].t-36e5;let n;for(let t=this._history.length-1;t>=0;t--)if(this._history[t].t<=i){n=this._history[t];break}n||(n=this._history[0]);const s=e-n.v;return(0!==n.v?Math.abs(s/n.v):Math.abs(s))<.05?{dir:"flat",symbol:"⟶"}:s>0?{dir:"up",symbol:"↑"}:{dir:"down",symbol:"↓"}}renderMetricGrid(){const t=this._config?.metrics??[];return 0===t.length?G:K`
      <div class="cn-metrics">
        ${t.map(t=>this._renderMetric(t))}
      </div>
    `}_seriesColor(t,e){if(t.reactive_thresholds){const i=this._entityNumber(t.entity),n=t.reactive_colors??{},s=n.low??"#60a5fa",a=n.mid??"#f59e0b",o=n.high??"#ef4444";return void 0===i?t.color??e:i<t.reactive_thresholds.low?s:i>t.reactive_thresholds.high?o:a}return t.color??e}renderChart(){const t=this._chartEntities();if(0===t.length)return G;const e=t.map(t=>({cfg:t,pts:this._historySeries[t.entity]??[]})).filter(t=>t.pts.length>=2);if("loading"===this._historyState&&0===e.length)return K`<div class="cn-chart cn-chart--empty">차트 불러오는 중…</div>`;if(0===e.length)return K`<div class="cn-chart cn-chart--empty">데이터 없음</div>`;const i=["var(--cn-accent, #6ea8fe)","#f59e0b","#10b981","#ef4444"],n=this._config?.chart_hours??24;let s=-1/0;for(const t of e)for(const e of t.pts)e.t>s&&(s=e.t);const a=Date.now(),o=Math.max(s,a),r=o-3600*n*1e3,c=o-r||1,l=e.map(t=>{let e=1/0,i=-1/0;for(const n of t.pts)n.v<e&&(e=n.v),n.v>i&&(i=n.v);const n=(s=i-e)<=4?1:s<=10?2:s<=25?5:s<=60?10:20;var s;const a=Math.floor(e/n)*n,o=Math.ceil(i/n)*n;return{mn:a,mx:o===a?a+n:o,rawMn:e,rawMx:i,step:n}}),d=420,h=e.length>1?32:8,p=d-h,m=p-32,u=t=>32+(t-r)/c*m,g=(t,e)=>{const{mn:i,mx:n}=l[e];return 100-(t-i)/(n-i||1)*76},_=t=>Math.abs(t)>=100?Math.round(t).toString():(Math.round(10*t)/10).toString(),b=[];for(let t=1;t<=4;t++){const e=r+c*t/4,i=new Date(e).getHours(),n=`${0===i?24:i}시`;b.push({x:u(e),label:n})}const f=t=>{const{mn:e,mx:i}=t;let n=t.step,s=Math.floor((i-e)/n)+1;for(;s>6;)n*=2,s=Math.floor((i-e)/n)+1;const a=[];for(let t=e;t<=i+1e-9;t+=n)a.push(Math.round(100*t)/100);return a},v=t=>{const i=e[t].cfg;if(i.label)return i.label;const n=this._entity(i.entity),s=n?.attributes?.friendly_name;return"string"==typeof s&&s.length>0?s:i.entity},y=l[0],x=this._seriesColor(e[0].cfg,i[0]),w=f(y),$=v(0);let k,S="",C=[],E="";e.length>1&&(k=l[1],S=this._seriesColor(e[1].cfg,i[1]),C=f(k),E=v(1));const A=W`
      <defs>
        ${e.map((t,e)=>W`
            <linearGradient id="cn-area-${e}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color=${this._seriesColor(t.cfg,i[e%i.length])} stop-opacity="0.22" />
              <stop offset="100%" stop-color=${this._seriesColor(t.cfg,i[e%i.length])} stop-opacity="0" />
            </linearGradient>
          `)}
      </defs>
      ${[62].map(t=>W`
          <line x1=${32} x2=${p} y1=${t} y2=${t} stroke="currentColor" stroke-opacity="0.08" stroke-width="1" />
        `)}
      ${b.map(t=>W`
          <line x1=${t.x.toFixed(1)} x2=${t.x.toFixed(1)} y1=${100} y2=${103} stroke="currentColor" stroke-opacity="0.25" stroke-width="1" />
        `)}
      <text x=${28} y=${14} fill=${x} fill-opacity="0.9" font-size="12" font-weight="500" text-anchor="end" font-family="inherit">${$}</text>
      ${w.map(t=>{const e=g(t,0);return W`<text x=${28} y=${e.toFixed(1)} fill=${x} fill-opacity="0.85" font-size="10" text-anchor="end" dominant-baseline="central" font-family="inherit" style="font-variant-numeric: tabular-nums;">${_(t)}</text>`})}
      ${k?W`<text x=${d-h+4} y=${14} fill=${S} fill-opacity="0.9" font-size="12" font-weight="500" text-anchor="start" font-family="inherit">${E}</text>`:G}
      ${k?C.map(t=>{const e=g(t,1);return W`<text x=${d-h+4} y=${e.toFixed(1)} fill=${S} fill-opacity="0.85" font-size="10" text-anchor="start" dominant-baseline="central" font-family="inherit" style="font-variant-numeric: tabular-nums;">${_(t)}</text>`}):G}
      ${e.map((t,e)=>{const n=this._seriesColor(t.cfg,i[e%i.length]),s=t.pts.map(t=>[u(t.t),g(t.v,e)]),a=s.map(([t,e],i)=>`${0===i?"M":"L"} ${t.toFixed(1)} ${e.toFixed(1)}`).join(" "),o=s[0],r=`${a} L ${s[s.length-1][0].toFixed(1)} 100 L ${o[0].toFixed(1)} 100 Z`;let c=0,l=0;for(let e=1;e<t.pts.length;e++)t.pts[e].v>t.pts[c].v&&(c=e),t.pts[e].v<t.pts[l].v&&(l=e);const[d,h]=s[c],[p,m]=s[l];return W`
          <path d=${r} fill="url(#cn-area-${e})" opacity="0.7" />
          <path d=${a} fill="none" stroke=${n} stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
          <circle cx=${d.toFixed(1)} cy=${h.toFixed(1)} r="2" fill=${n} />
          <text x=${d.toFixed(1)} y=${(h-4).toFixed(1)} fill=${n} font-size="9" text-anchor="middle" font-family="inherit">${_(t.pts[c].v)}</text>
          <circle cx=${p.toFixed(1)} cy=${m.toFixed(1)} r="2" fill=${n} />
          <text x=${p.toFixed(1)} y=${(m+9).toFixed(1)} fill=${n} font-size="9" text-anchor="middle" font-family="inherit">${_(t.pts[l].v)}</text>
        `})}
      ${b.map(t=>W`
          <text x=${t.x.toFixed(1)} y=${114} fill="currentColor" fill-opacity="0.9" font-size="10" text-anchor="middle" font-weight="500" font-family="inherit">${t.label}</text>
        `)}
    `;return K`
      <div class="cn-chart">
        <svg viewBox="0 0 ${d} ${140}" preserveAspectRatio="none" role="img" aria-label="chart">
          ${A}
        </svg>
      </div>
    `}render(){if(!this._hasConfig||!this._config)return G;let t=this._config;if(t.discomfort_index_from&&2===t.discomfort_index_from.length){const e=this._computeDiscomfortIndex(t.discomfort_index_from[0],t.discomfort_index_from[1]);if(void 0!==e){const i=e<68?"쾌적":e<75?"보통":e<80?"약간 불쾌":"불쾌",n=e<68?"green":e<75?"blue":e<80?"amber":"red";t={...t,status_text:`${i} · 불쾌지수 ${e}`,status_color:n,status_text_template:void 0,status_template:void 0}}}const e=this.renderHero(t),i=K`
      ${this.renderMetricGrid()}
      ${this.renderChart()}
      ${this.renderList(t.list)}
    `;return this.renderCard(e,i)}_computeDiscomfortIndex(t,e){const i=this._entityNumber(t),n=this._entityNumber(e);if(void 0===i||void 0===n)return;const s=1.8*i-.55*(1-n/100)*(1.8*i-26)+32;return Math.round(s)}}he.styles=[ee.styles,r`
      .cn-metrics {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1px;
        background: rgba(0, 0, 0, 0.06);
        margin: 0 0 0 0;
      }
      @media (prefers-color-scheme: dark) {
        .cn-metrics {
          background: rgba(255, 255, 255, 0.08);
        }
      }
      .cn-metric {
        background: var(--cn-bg-card);
        padding: 14px 18px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cn-metric--clickable {
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .cn-metric--clickable:hover {
        background: rgba(0, 0, 0, 0.03);
      }
      @media (prefers-color-scheme: dark) {
        .cn-metric--clickable:hover {
          background: rgba(255, 255, 255, 0.04);
        }
      }
      .cn-metric__label {
        font-size: 14px;
        font-weight: 500;
        color: var(--cn-text-secondary);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .cn-metric__accent {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 2px;
      }
      .cn-metric__row {
        display: flex;
        align-items: baseline;
        gap: 2px;
      }
      .cn-metric__value {
        font-size: 22px;
        font-weight: 700;
        color: var(--cn-text-primary);
        font-variant-numeric: tabular-nums;
        line-height: 1.15;
      }
      .cn-metric__unit {
        font-size: 13px;
        font-weight: 500;
        color: var(--cn-text-secondary);
        margin-left: 4px;
      }
      .cn-metric__trend {
        display: inline-flex;
        align-items: center;
        font-size: 13px;
        color: var(--cn-text-secondary);
        margin-left: 6px;
      }
      .cn-metric__trend--up {
        color: #f87171;
      }
      .cn-metric__trend--down {
        color: #34d399;
      }
      .cn-metric__trend--flat {
        color: var(--cn-text-secondary);
      }
      .cn-chart {
        width: 100%;
        height: 170px;
        padding: 12px 12px 6px;
        box-sizing: border-box;
        color: var(--cn-text-primary);
        font-family: inherit;
      }
      .cn-chart svg {
        width: 100%;
        height: 100%;
        display: block;
        font-family: inherit;
      }
      .cn-chart svg text {
        font-family: inherit;
      }
      .cn-chart--empty {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cn-text-secondary);
        font-size: 13px;
        font-weight: 500;
      }
      .cn-chart-legend {
        display: flex;
        gap: 12px;
        justify-content: center;
        font-size: 13px;
        color: var(--cn-text-secondary);
        margin-top: 2px;
      }
      .cn-chart-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .cn-chart-legend-swatch {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 2px;
      }
    `],t([_t()],he.prototype,"_hasConfig",void 0),t([_t()],he.prototype,"_history",void 0),t([_t()],he.prototype,"_historySeries",void 0),t([_t()],he.prototype,"_historyState",void 0),customElements.get("cardnews-sensor-panel")||customElements.define("cardnews-sensor-panel",he);const pe={select:{mode:"dropdown",options:["green","gray","blue","red","amber"].map(t=>({value:t,label:t}))}},me={title:"제목",subtitle:"부제",name:"이름",title_template:"제목 (템플릿)",subtitle_template:"부제 (템플릿)",status_text_template:"상태 텍스트 (템플릿)",status_template:"상태 색 (템플릿)",category:"카테고리 배지 텍스트",category_icon:"카테고리 아이콘",status_text:"상태 칩 텍스트",status_entity:"상태 판정 entity",status_color:"상태 색",hero_image:"Hero 이미지 경로 (예: /local/cardnews/heroes/… 또는 base name)",hero_image_entity:"Hero 이미지 entity (image.* / camera.*)",hero_theme:"Hero 테마",room:"Room 키 (자동 hero 해상용, 예: livingroom)",glow_entities:"Glow 대상 조명",glow_position:"Glow 위치 (예: 50% 60%)",glow_color:"Glow 색 (hex)"},ue={type:"expandable",name:"",title:"템플릿 (Jinja2)",icon:"mdi:code-json",schema:[{name:"title_template",selector:{template:{}}},{name:"subtitle_template",selector:{template:{}}},{name:"status_text_template",selector:{template:{}}},{name:"status_template",selector:{template:{}}}]},ge={type:"expandable",name:"",title:"상단 배지 / 상태 칩",icon:"mdi:label-outline",schema:[{type:"grid",schema:[{name:"category",selector:{text:{}}},{name:"category_icon",selector:{icon:{}}}]},{type:"grid",schema:[{name:"status_text",selector:{text:{}}},{name:"status_color",selector:pe}]},{name:"status_entity",selector:{entity:{}}}]},_e={type:"expandable",name:"",title:"Hero 이미지",icon:"mdi:image-outline",schema:[{name:"hero_image",selector:{text:{}}},{name:"hero_image_entity",selector:{entity:{}}},{type:"grid",schema:[{name:"room",selector:{text:{}}},{name:"hero_theme",selector:{select:{mode:"dropdown",options:[{value:"dark",label:"dark"},{value:"light",label:"light"}]}}}]}]},be={type:"expandable",name:"",title:"Glow 오버레이 (조명 켜짐 표시)",icon:"mdi:lightbulb-on-outline",schema:[{name:"glow_entities",selector:{entity:{multiple:!0,filter:[{domain:"light"},{domain:"switch"}]}}},{type:"grid",schema:[{name:"glow_position",selector:{text:{}}},{name:"glow_color",selector:{text:{}}}]}]};class fe extends dt{constructor(){super(...arguments),this._computeLabel=t=>t.title?t.title:this.labels[t.name]??me[t.name]??t.name,this._formChanged=t=>{if(!this._config)return;t.stopPropagation();const e=t.detail.value,i={...this._config};for(const[t,n]of Object.entries(e))""===n||null==n?delete i[t]:i[t]=n;this._emitConfig(i)}}setConfig(t){this._config=t}_formData(t){const e={};if(!this._config)return e;const i=this._config;for(const n of t)void 0!==i[n]&&(e[n]=i[n]);return e}get labels(){return{}}_patch(t,e){if(!this._config)return;const i={...this._config};""===e||null==e?delete i[t]:i[t]=e,this._emitConfig(i)}_emitConfig(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}}fe.styles=r`
    :host {
      display: block;
    }
    .root {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 4px 4px;
    }
    .section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      border-radius: 10px;
      background: var(--card-background-color, transparent);
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 14px;
      color: var(--primary-text-color);
    }
    .section-title ha-icon {
      --mdc-icon-size: 20px;
      color: var(--primary-color, #22d3ee);
    }
    .section-hint,
    .hint {
      font-size: 12px;
      color: var(--secondary-text-color);
      line-height: 1.5;
    }
    .hint {
      padding: 4px 4px 0;
    }
    ha-form {
      display: block;
    }
  `,t([gt({attribute:!1})],fe.prototype,"hass",void 0),t([_t()],fe.prototype,"_config",void 0);const ve=[{name:"entity",selector:{entity:{}},required:!0},{type:"grid",schema:[{name:"icon",selector:{icon:{}}},{name:"active_icon",selector:{icon:{}}}]},{type:"grid",schema:[{name:"label",selector:{text:{}}},{name:"action_type",selector:{select:{mode:"dropdown",options:[{value:"toggle",label:"toggle (켜기/끄기)"},{value:"service",label:"service (서비스 호출)"},{value:"light_modal",label:"light_modal (조명 모달)"},{value:"remote_modal",label:"remote_modal (에어컨/선풍기/보일러 리모컨)"},{value:"tv_remote",label:"tv_remote (TV 리모컨)"}]}}}]},{type:"expandable",name:"",title:"service / remote 옵션",icon:"mdi:tune",schema:[{name:"service",selector:{text:{}}},{name:"toggle_service",selector:{text:{}}},{name:"remote",selector:{text:{}}},{name:"tv_entity",selector:{entity:{filter:[{domain:"media_player"}]}}},{name:"volume_entity",selector:{entity:{filter:[{domain:"media_player"}]}}},{name:"spin_when_active",selector:{boolean:{}}}]}],ye={entity:"Entity",icon:"아이콘",active_icon:"켜짐 아이콘",label:"라벨",action_type:"동작 방식",service:"서비스 (예: vacuum.start)",toggle_service:"반대 동작 서비스",remote:"리모컨 종류 ('ac' / 'fan' / 'boiler' / remote.* entity)",tv_entity:"TV media_player",volume_entity:"볼륨 media_player",spin_when_active:"동작 중 아이콘 강조"},xe=[{value:"value",label:"값 (value)"},{value:"switch",label:"스위치 (switch)"},{value:"slider",label:"슬라이더 (slider)"},{value:"bar",label:"막대 그래프 (bar)"},{value:"select",label:"드롭다운 (select)"},{value:"light",label:"조명 (light)"},{value:"volume",label:"볼륨 (volume)"},{value:"forecast",label:"날씨 예보 (forecast)"},{value:"balls",label:"로또 번호 (balls)"},{value:"calendar_events",label:"캘린더 일정 (calendar_events)"},{value:"header",label:"구분 헤더 (header)"}],we=[{type:"grid",schema:[{name:"label",selector:{text:{}}},{name:"icon",selector:{icon:{}}}]}];function $e(t){switch(t){case"switch":return[{name:"entity",selector:{entity:{filter:[{domain:"switch"},{domain:"light"},{domain:"fan"},{domain:"input_boolean"}]}},required:!0},{name:"light_entities",selector:{entity:{multiple:!0,filter:[{domain:"light"}]}}}];case"slider":return[{name:"entity",selector:{entity:{}},required:!0},{type:"grid",schema:[{name:"min",selector:{number:{mode:"box",step:"any"}}},{name:"max",selector:{number:{mode:"box",step:"any"}}},{name:"step",selector:{number:{mode:"box",step:"any"}}},{name:"unit",selector:{text:{}}}]},{name:"service",selector:{text:{}}}];case"bar":return[{name:"entity",selector:{entity:{}}},{type:"grid",schema:[{name:"max",selector:{number:{mode:"box",step:"any"}}},{name:"unit",selector:{text:{}}},{name:"color",selector:{text:{}}}]}];case"select":return[{name:"entity",selector:{entity:{filter:[{domain:"input_select"},{domain:"select"}]}},required:!0}];case"light":return[{name:"entity",selector:{entity:{filter:[{domain:"light"}]}}},{name:"entities",selector:{entity:{multiple:!0,filter:[{domain:"light"}]}}},{name:"force_color_button",selector:{boolean:{}}}];case"volume":return[{name:"entity",selector:{entity:{filter:[{domain:"media_player"}]}},required:!0},{name:"mute",selector:{boolean:{}}}];case"forecast":return[{name:"entity",selector:{entity:{filter:[{domain:"weather"}]}},required:!0},{name:"days",selector:{number:{mode:"box",min:1,max:10}}}];case"balls":return[{name:"entity",selector:{entity:{filter:[{domain:"sensor"}]}},required:!0}];case"calendar_events":return[{name:"entities",selector:{entity:{multiple:!0,filter:[{domain:"calendar"}]}},required:!0},{type:"grid",schema:[{name:"days_before",selector:{number:{mode:"box",min:0,max:60}}},{name:"days_after",selector:{number:{mode:"box",min:0,max:60}}},{name:"visible_rows",selector:{number:{mode:"box",min:1,max:20}}},{name:"max",selector:{number:{mode:"box",min:1,max:200}}}]},{type:"grid",schema:[{name:"group_by_day",selector:{boolean:{}}},{name:"show_description",selector:{boolean:{}}}]}];case"header":return[{name:"text",selector:{text:{}}}];default:return[{name:"entity",selector:{entity:{}}},{type:"grid",schema:[{name:"unit",selector:{text:{}}},{name:"value",selector:{text:{}}}]}]}}const ke={type:"expandable",name:"",title:"고급",icon:"mdi:tune",schema:[{type:"grid",schema:[{name:"icon_color",selector:{text:{}}},{name:"always_show",selector:{boolean:{}}}]}]},Se={label:"라벨",icon:"아이콘",entity:"Entity",entities:"Entity 목록",unit:"단위",value:"고정 값",min:"최소",max:"최대",step:"증감폭",service:"서비스 (선택)",color:"색 (hex)",days:"표시 일수",days_before:"이전 며칠",days_after:"이후 며칠",visible_rows:"보이는 줄 수",group_by_day:"날짜별 묶기",show_description:"설명 표시",text:"헤더 텍스트",mute:"음소거 버튼",light_entities:"연결 조명 (선택)",force_color_button:"색상 버튼 강제 표시",icon_color:"아이콘 색 (hex 또는 auto)",always_show:"값이 없어도 항상 표시"};class Ce extends dt{constructor(){super(...arguments),this.rows=[],this._open={},this._computeLabel=t=>t.title?t.title:Se[t.name]??t.name,this._addRow=t=>{t.stopPropagation();const e=t.detail.value;if(!e)return;const i=[...this.rows??[]],n={type:e};"calendar_events"===e&&(n.entities=[]),i.push(n),this._open={...this._open,[i.length-1]:!0},this._emit(i)}}get _types(){if(!this.allowedTypes)return xe;const t=new Set(this.allowedTypes);return xe.filter(e=>t.has(e.value))}render(){if(!this.hass)return G;const t=this.rows??[];return K`
      <div class="rows">
        ${t.map((t,e)=>this._renderRow(t,e))}
        ${0===t.length?K`<div class="empty">행이 없습니다. 아래에서 추가하세요.</div>`:G}
      </div>
      <div class="add">
        <ha-selector
          .hass=${this.hass}
          .selector=${{select:{mode:"dropdown",options:this._types}}}
          .value=${""}
          @value-changed=${this._addRow}
        ></ha-selector>
        <div class="section-hint">추가할 행 종류를 고르면 목록 끝에 붙습니다.</div>
      </div>
    `}_renderRow(t,e){const i=t.type??"value",n=xe.find(t=>t.value===i)?.label??i,s=t.label||t.entity||n,a=this._open[e]??!1,o=[...we,...$e(i),ke],r={};for(const e of function(t){const e=(t,i)=>{for(const n of t)"schema"in n&&Array.isArray(n.schema)?e(n.schema,i):"name"in n&&n.name&&i.push(n.name);return i};return["label","icon","icon_color","always_show",...e($e(t),[])]}(i))void 0!==t[e]&&(r[e]=t[e]);return K`
      <div class="row">
        <div class="row-head">
          <ha-icon-button
            .path=${a?"M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z":"M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"}
            .label=${a?"접기":"펼치기"}
            @click=${()=>this._toggle(e)}
          ></ha-icon-button>
          <div class="row-title" @click=${()=>this._toggle(e)}>
            <span class="row-name">${s}</span>
            <span class="row-type">${n}</span>
          </div>
          <ha-icon-button
            .path=${"M15,20H9V8H15M15.5,4H14L13,3H11L10,4H8.5V6H15.5V4Z M7,6V20A2,2 0 0,0 9,22H15A2,2 0 0,0 17,20V6H7Z"}
            .label=${"삭제"}
            @click=${()=>this._remove(e)}
          ></ha-icon-button>
          <ha-icon-button
            .path=${"M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"}
            .label=${"위로"}
            .disabled=${0===e}
            @click=${()=>this._move(e,-1)}
          ></ha-icon-button>
          <ha-icon-button
            .path=${"M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"}
            .label=${"아래로"}
            .disabled=${e===(this.rows?.length??0)-1}
            @click=${()=>this._move(e,1)}
          ></ha-icon-button>
        </div>
        ${a?K`
              <div class="row-body">
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{select:{mode:"dropdown",options:this._types}}}
                  .value=${i}
                  .label=${"행 종류"}
                  @value-changed=${t=>this._changeType(e,t)}
                ></ha-selector>
                <ha-form
                  .hass=${this.hass}
                  .data=${r}
                  .schema=${o}
                  .computeLabel=${this._computeLabel}
                  @value-changed=${t=>this._rowChanged(e,t)}
                ></ha-form>
              </div>
            `:G}
      </div>
    `}_toggle(t){this._open={...this._open,[t]:!this._open[t]}}_rowChanged(t,e){e.stopPropagation();const i=[...this.rows??[]],n={...i[t]};for(const[t,i]of Object.entries(e.detail.value))""===i||null==i?delete n[t]:n[t]=i;i[t]=n,this._emit(i)}_changeType(t,e){e.stopPropagation();const i=e.detail.value;if(!i)return;const n=[...this.rows??[]],s={...n[t]};s.type!==i&&(s.type=i,n[t]=s,this._emit(n))}_remove(t){const e=[...this.rows??[]];e.splice(t,1),this._emit(e)}_move(t,e){const i=[...this.rows??[]],n=t+e;if(n<0||n>=i.length)return;const[s]=i.splice(t,1);i.splice(n,0,s),this._emit(i)}_emit(t){this.rows=t,this.dispatchEvent(new CustomEvent("rows-changed",{detail:{value:t},bubbles:!0,composed:!0}))}}Ce.styles=r`
    :host {
      display: block;
    }
    .rows {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .row {
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      overflow: hidden;
    }
    .row-head {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 2px 4px;
      background: var(--secondary-background-color, rgba(255, 255, 255, 0.04));
    }
    .row-title {
      flex: 1;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      min-width: 0;
      padding: 4px 0;
    }
    .row-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .row-type {
      font-size: 11px;
      color: var(--secondary-text-color);
    }
    .row-body {
      padding: 10px 12px 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .empty,
    .section-hint {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .empty {
      padding: 8px 4px;
    }
    .add {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    ha-icon-button {
      --mdc-icon-button-size: 34px;
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color);
    }
  `,t([gt({attribute:!1})],Ce.prototype,"hass",void 0),t([gt({attribute:!1})],Ce.prototype,"rows",void 0),t([gt({attribute:!1})],Ce.prototype,"allowedTypes",void 0),t([_t()],Ce.prototype,"_open",void 0),customElements.get("cardnews-list-editor")||customElements.define("cardnews-list-editor",Ce);const Ee="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",Ae="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z";class Me extends dt{constructor(){super(...arguments),this.items=[],this.schema=[],this.labels={},this.titleKeys=["label","name","entity"],this.defaults={},this.addLabel="항목 추가",this.emptyLabel="항목이 없습니다.",this._open={},this._computeLabel=t=>t.title?t.title:this.labels[t.name]??t.name,this._add=()=>{const t=[...this.items??[],{...this.defaults}];this._open={...this._open,[t.length-1]:!0},this._emit(t)}}render(){if(!this.hass)return G;const t=this.items??[];return K`
      <div class="items">
        ${t.map((t,e)=>this._renderItem(t,e))}
        ${0===t.length?K`<div class="empty">${this.emptyLabel}</div>`:G}
      </div>
      <ha-button @click=${this._add} class="add-btn">${this.addLabel}</ha-button>
    `}_renderItem(t,e){const i=this._open[e]??!1;let n="";for(const e of this.titleKeys){const i=t[e];if("string"==typeof i&&i){n=i;break}}return n||(n=`#${e+1}`),K`
      <div class="item">
        <div class="item-head">
          <ha-icon-button
            .path=${i?Ee:Ae}
            .label=${i?"접기":"펼치기"}
            @click=${()=>this._toggle(e)}
          ></ha-icon-button>
          <div class="item-title" @click=${()=>this._toggle(e)}>${n}</div>
          <ha-icon-button .path=${"M15,20H9V8H15M15.5,4H14L13,3H11L10,4H8.5V6H15.5V4Z M7,6V20A2,2 0 0,0 9,22H15A2,2 0 0,0 17,20V6H7Z"} .label=${"삭제"} @click=${()=>this._remove(e)}></ha-icon-button>
          <ha-icon-button
            .path=${Ee}
            .label=${"위로"}
            .disabled=${0===e}
            @click=${()=>this._move(e,-1)}
          ></ha-icon-button>
          <ha-icon-button
            .path=${Ae}
            .label=${"아래로"}
            .disabled=${e===(this.items?.length??0)-1}
            @click=${()=>this._move(e,1)}
          ></ha-icon-button>
        </div>
        ${i?K`
              <div class="item-body">
                <ha-form
                  .hass=${this.hass}
                  .data=${t}
                  .schema=${this.schema}
                  .computeLabel=${this._computeLabel}
                  @value-changed=${t=>this._itemChanged(e,t)}
                ></ha-form>
              </div>
            `:G}
      </div>
    `}_toggle(t){this._open={...this._open,[t]:!this._open[t]}}_itemChanged(t,e){e.stopPropagation();const i=[...this.items??[]],n={...i[t]};for(const[t,i]of Object.entries(e.detail.value))""===i||null==i?delete n[t]:n[t]=i;i[t]=n,this._emit(i)}_remove(t){const e=[...this.items??[]];e.splice(t,1),this._emit(e)}_move(t,e){const i=[...this.items??[]],n=t+e;if(n<0||n>=i.length)return;const[s]=i.splice(t,1);i.splice(n,0,s),this._emit(i)}_emit(t){this.items=t,this.dispatchEvent(new CustomEvent("items-changed",{detail:{value:t},bubbles:!0,composed:!0}))}}Me.styles=r`
    :host {
      display: block;
    }
    .items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .item {
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
      border-radius: 8px;
      overflow: hidden;
    }
    .item-head {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 2px 4px;
      background: var(--secondary-background-color, rgba(255, 255, 255, 0.04));
    }
    .item-title {
      flex: 1;
      cursor: pointer;
      font-size: 14px;
      color: var(--primary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 8px 0;
    }
    .item-body {
      padding: 10px 12px 12px;
    }
    .empty {
      font-size: 12px;
      color: var(--secondary-text-color);
      padding: 8px 4px;
    }
    .add-btn {
      margin-top: 10px;
    }
    ha-icon-button {
      --mdc-icon-button-size: 34px;
      --mdc-icon-size: 18px;
      color: var(--secondary-text-color);
    }
  `,t([gt({attribute:!1})],Me.prototype,"hass",void 0),t([gt({attribute:!1})],Me.prototype,"items",void 0),t([gt({attribute:!1})],Me.prototype,"schema",void 0),t([gt({attribute:!1})],Me.prototype,"labels",void 0),t([gt({attribute:!1})],Me.prototype,"titleKeys",void 0),t([gt({attribute:!1})],Me.prototype,"defaults",void 0),t([gt()],Me.prototype,"addLabel",void 0),t([gt()],Me.prototype,"emptyLabel",void 0),t([_t()],Me.prototype,"_open",void 0),customElements.get("cardnews-objects-editor")||customElements.define("cardnews-objects-editor",Me);const Le=[{type:"grid",schema:[{name:"title",selector:{text:{}}},{name:"subtitle",selector:{text:{}}}]},ue,ge,_e,be],Ne=["title","subtitle","title_template","subtitle_template","status_text_template","status_template","category","category_icon","status_text","status_color","status_entity","hero_image","hero_image_entity","room","hero_theme","glow_entities","glow_position","glow_color"];class Te extends fe{constructor(){super(...arguments),this._listChanged=t=>{t.stopPropagation();const e=t.detail.value;this._patch("list",e.length?e:void 0)},this._actionsChanged=t=>{t.stopPropagation();const e=t.detail.value;this._patch("hero_actions",e.length?e:void 0)}}render(){if(!this.hass||!this._config)return G;const t=this._config;return K`
      <div class="root">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData(Ne)}
          .schema=${Le}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._formChanged}
        ></ha-form>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
            <span>리스트 행</span>
          </div>
          <cardnews-list-editor
            .hass=${this.hass}
            .rows=${t.list??[]}
            @rows-changed=${this._listChanged}
          ></cardnews-list-editor>
          <div class="section-hint">
            캘린더 일정도 여기서 <b>calendar_events</b> 행으로 편집합니다 — 표시할 캘린더,
            앞뒤 며칠, 보이는 줄 수까지 전부.
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            <span>Hero 액션 칩</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${t.hero_actions??[]}
            .schema=${ve}
            .labels=${ye}
            .titleKeys=${["label","entity"]}
            .addLabel=${"액션 추가"}
            .emptyLabel=${"액션 칩이 없습니다."}
            @items-changed=${this._actionsChanged}
          ></cardnews-objects-editor>
          <div class="section-hint">Hero 이미지 우측 상단에 뜨는 버튼입니다.</div>
        </div>

        <div class="hint">
          ${t.hero_image_by_state?K`이 카드는 <b>hero_image_by_state</b> (상태별 이미지 맵)를 쓰고 있습니다. 그 항목은
                <b>⋮ → Edit in YAML</b> 에서만 수정하세요 — 여기서 편집해도 지워지지 않습니다.<br />`:G}
          여기 없는 옵션은 YAML로 수정해도 안전합니다. 이 편집기는 알 수 없는 필드를 건드리지 않습니다.
        </div>
      </div>
    `}}customElements.get("cardnews-hero-info-editor")||customElements.define("cardnews-hero-info-editor",Te);var ze=Object.freeze({__proto__:null,CardNewsHeroInfoEditor:Te});const Pe=[{name:"name",selector:{text:{}},required:!0},{type:"grid",schema:[{name:"temp_entity",selector:{entity:{filter:[{domain:"sensor"}]}}},{name:"humidity_entity",selector:{entity:{filter:[{domain:"sensor"}]}}}]},ge,_e,be],Ie=["name","temp_entity","humidity_entity","category","category_icon","status_text","status_color","status_entity","hero_image","hero_image_entity","room","hero_theme","glow_entities","glow_position","glow_color"],He=[{name:"entity",selector:{entity:{filter:[{domain:"switch"},{domain:"light"},{domain:"fan"},{domain:"input_boolean"}]}},required:!0},{type:"grid",schema:[{name:"label",selector:{text:{}}},{name:"icon",selector:{icon:{}}}]}],je={entity:"Entity",label:"라벨 (비우면 friendly name)",icon:"아이콘 (비우면 도메인 기본값)"};class De extends fe{constructor(){super(...arguments),this._switchesChanged=t=>{t.stopPropagation();const e=t.detail.value;this._patch("switches",e.length?e:void 0)},this._listChanged=t=>{t.stopPropagation();const e=t.detail.value;this._patch("list",e.length?e:void 0)}}get labels(){return{name:"방 이름 (필수)",temp_entity:"온도 센서",humidity_entity:"습도 센서"}}render(){if(!this.hass||!this._config)return G;const t=this._config.switches??[];return K`
      <div class="root">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData(Ie)}
          .schema=${Pe}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._formChanged}
        ></ha-form>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:toggle-switch-outline"></ha-icon>
            <span>스위치 행</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${t}
            .schema=${He}
            .labels=${je}
            .titleKeys=${["label","entity"]}
            .addLabel=${"스위치 추가"}
            .emptyLabel=${"스위치가 없습니다."}
            @items-changed=${this._switchesChanged}
          ></cardnews-objects-editor>
          <div class="section-hint">카드 하단에 켜기/끄기 행으로 표시됩니다.</div>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
            <span>추가 리스트 행</span>
          </div>
          <cardnews-list-editor
            .hass=${this.hass}
            .rows=${this._config.list??[]}
            @rows-changed=${this._listChanged}
          ></cardnews-list-editor>
          <div class="section-hint">스위치 행 다음에 붙는 자유 행입니다 (값·슬라이더·조명 등).</div>
        </div>

        <div class="hint">
          여기 없는 옵션은 <b>⋮ → Edit in YAML</b> 로 수정해도 안전합니다 — 이 편집기는 알 수
          없는 필드를 건드리지 않습니다.
        </div>
      </div>
    `}}customElements.get("cardnews-room-editor")||customElements.define("cardnews-room-editor",De);var Re=Object.freeze({__proto__:null,CardNewsRoomEditor:De});const Oe=[{name:"camera_entity",selector:{entity:{filter:[{domain:"camera"}]}},required:!0},{type:"grid",schema:[{name:"title",selector:{text:{}}},{name:"subtitle",selector:{text:{}}}]},ge,{type:"expandable",name:"",title:"표시 옵션",icon:"mdi:image-size-select-large",schema:[{type:"grid",schema:[{name:"hero_height",selector:{text:{}}},{name:"poll_interval",selector:{number:{mode:"box",min:250,max:6e4,step:250}}}]}]}],Fe=["camera_entity","title","subtitle","category","category_icon","status_text","status_color","status_entity","hero_height","poll_interval"];class Be extends fe{constructor(){super(...arguments),this._actionsChanged=t=>{t.stopPropagation();const e=t.detail.value;this._patch("hero_actions",e.length?e:void 0)},this._listChanged=t=>{t.stopPropagation();const e=t.detail.value;this._patch("list",e.length?e:void 0)}}get labels(){return{camera_entity:"카메라 entity (필수)",hero_height:"Hero 높이 (예: 360px)",poll_interval:"스냅샷 갱신 주기 (ms, 기본 2000)"}}render(){return this.hass&&this._config?K`
      <div class="root">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData(Fe)}
          .schema=${Oe}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._formChanged}
        ></ha-form>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            <span>Hero 액션 칩</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${this._config.hero_actions??[]}
            .schema=${ve}
            .labels=${ye}
            .titleKeys=${["label","entity"]}
            .addLabel=${"액션 추가"}
            .emptyLabel=${"액션 칩이 없습니다."}
            @items-changed=${this._actionsChanged}
          ></cardnews-objects-editor>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
            <span>리스트 행</span>
          </div>
          <cardnews-list-editor
            .hass=${this.hass}
            .rows=${this._config.list??[]}
            @rows-changed=${this._listChanged}
          ></cardnews-list-editor>
        </div>
      </div>
    `:G}}customElements.get("cardnews-camera-hero-editor")||customElements.define("cardnews-camera-hero-editor",Be);var Ue=Object.freeze({__proto__:null,CardNewsCameraHeroEditor:Be});const Ve=[{type:"grid",schema:[{name:"title",selector:{text:{}}},{name:"subtitle",selector:{text:{}}}]},{name:"chart_hours",selector:{number:{mode:"box",min:1,max:720}}},ue,ge,_e],Ke=["title","subtitle","chart_hours","title_template","subtitle_template","status_text_template","status_template","category","category_icon","status_text","status_color","status_entity","hero_image","hero_image_entity","room","hero_theme"],We=[{name:"entity",selector:{entity:{}},required:!0},{type:"grid",schema:[{name:"label",selector:{text:{}},required:!0},{name:"unit",selector:{text:{}}},{name:"accent",selector:{text:{}}}]}],qe={entity:"Entity",label:"이름 (필수)",unit:"단위 (비우면 entity 단위)",accent:"강조 색 (hex)"},Ge=[{name:"entity",selector:{entity:{}},required:!0},{type:"grid",schema:[{name:"label",selector:{text:{}}},{name:"color",selector:{text:{}}}]}],Ye={entity:"Entity",label:"범례 이름",color:"선 색 (hex)"},Ze=[{type:"grid",schema:[{name:"di_temp",selector:{entity:{filter:[{domain:"sensor"}]}}},{name:"di_humidity",selector:{entity:{filter:[{domain:"sensor"}]}}}]}],Xe={di_temp:"불쾌지수 — 온도 센서",di_humidity:"불쾌지수 — 습도 센서"};class Je extends fe{constructor(){super(...arguments),this._metricsChanged=t=>{t.stopPropagation();const e=t.detail.value;this._patch("metrics",e.length?e:void 0)},this._seriesChanged=t=>{t.stopPropagation();const e=t.detail.value;this._patch("chart_entities",e.length?e:void 0)},this._actionsChanged=t=>{t.stopPropagation();const e=t.detail.value;this._patch("hero_actions",e.length?e:void 0)},this._listChanged=t=>{t.stopPropagation();const e=t.detail.value;this._patch("list",e.length?e:void 0)},this._diChanged=t=>{t.stopPropagation();const e=t.detail.value,i="string"==typeof e.di_temp?e.di_temp:"",n="string"==typeof e.di_humidity?e.di_humidity:"";this._patch("discomfort_index_from",i&&n?[i,n]:void 0)}}get labels(){return{chart_hours:"차트 기간 (시간, 기본 24)",...Xe}}render(){if(!this.hass||!this._config)return G;const t=this._config.discomfort_index_from??[],e={di_temp:t[0]??"",di_humidity:t[1]??""};return K`
      <div class="root">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData(Ke)}
          .schema=${Ve}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._formChanged}
        ></ha-form>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:view-grid-outline"></ha-icon>
            <span>메트릭 (상단 숫자 타일)</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${this._config.metrics??[]}
            .schema=${We}
            .labels=${qe}
            .titleKeys=${["label","entity"]}
            .addLabel=${"메트릭 추가"}
            .emptyLabel=${"메트릭이 없습니다."}
            @items-changed=${this._metricsChanged}
          ></cardnews-objects-editor>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:chart-line"></ha-icon>
            <span>차트 계열</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${this._config.chart_entities??[]}
            .schema=${Ge}
            .labels=${Ye}
            .titleKeys=${["label","entity"]}
            .addLabel=${"계열 추가"}
            .emptyLabel=${"차트 계열이 없습니다."}
            @items-changed=${this._seriesChanged}
          ></cardnews-objects-editor>
          <div class="section-hint">
            계열이 2개면 좌/우 이중 축으로 그려집니다 (좌: 첫 계열, 우: 둘째 계열).
            임계값 반응 색(reactive_thresholds)은 YAML에서만 수정합니다 — 여기서 건드리지 않습니다.
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:thermometer-water"></ha-icon>
            <span>불쾌지수 부제</span>
          </div>
          <ha-form
            .hass=${this.hass}
            .data=${e}
            .schema=${Ze}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._diChanged}
          ></ha-form>
          <div class="section-hint">둘 다 지정하면 부제가 불쾌지수 문구로 자동 대체됩니다. 하나라도 비우면 해제됩니다.</div>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:gesture-tap-button"></ha-icon>
            <span>Hero 액션 칩</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${this._config.hero_actions??[]}
            .schema=${ve}
            .labels=${ye}
            .titleKeys=${["label","entity"]}
            .addLabel=${"액션 추가"}
            .emptyLabel=${"액션 칩이 없습니다."}
            @items-changed=${this._actionsChanged}
          ></cardnews-objects-editor>
        </div>

        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:format-list-bulleted"></ha-icon>
            <span>리스트 행</span>
          </div>
          <cardnews-list-editor
            .hass=${this.hass}
            .rows=${this._config.list??[]}
            @rows-changed=${this._listChanged}
          ></cardnews-list-editor>
        </div>
      </div>
    `}}customElements.get("cardnews-sensor-panel-editor")||customElements.define("cardnews-sensor-panel-editor",Je);var Qe=Object.freeze({__proto__:null,CardNewsSensorPanelEditor:Je});const ti=[{type:"grid",schema:[{name:"icon",selector:{icon:{}},required:!0},{name:"label",selector:{text:{}}}]},{name:"path",selector:{text:{}},required:!0},{name:"id",selector:{text:{}}}],ei={icon:"아이콘 (필수)",label:"탭 이름",path:"이동 경로 (필수, 예: /cardnews-lab/summary)",id:"고정 id (선택 — active 매칭용)"},ii=[{name:"active",selector:{text:{}}},{type:"grid",schema:[{name:"swipe",selector:{boolean:{}}},{name:"swipe_wrap",selector:{boolean:{}}}]},{name:"swipe_threshold",selector:{number:{min:20,max:200,step:5,mode:"box"}}}];class ni extends fe{constructor(){super(...arguments),this._tabsChanged=t=>{t.stopPropagation(),this._patch("tabs",t.detail.value)}}get labels(){return{active:"강제 활성 탭 (비우면 현재 URL로 자동 판정)",swipe:"좌우 스와이프로 탭 이동",swipe_wrap:"끝에서 처음으로 순환",swipe_threshold:"스와이프 인식 거리 (px, 기본 60)"}}render(){return this.hass&&this._config?K`
      <div class="root">
        <div class="section">
          <div class="section-title">
            <ha-icon icon="mdi:tab"></ha-icon>
            <span>탭 목록</span>
          </div>
          <cardnews-objects-editor
            .hass=${this.hass}
            .items=${this._config.tabs??[]}
            .schema=${ti}
            .labels=${ei}
            .titleKeys=${["label","path"]}
            .defaults=${{icon:"mdi:view-dashboard",path:"/"}}
            .addLabel=${"탭 추가"}
            .emptyLabel=${"탭이 없습니다. 최소 1개는 필요합니다."}
            @items-changed=${this._tabsChanged}
          ></cardnews-objects-editor>
          <div class="section-hint">아이콘과 경로는 필수입니다. 경로가 비면 카드가 설정 오류를 냅니다.</div>
        </div>

        <ha-form
          .hass=${this.hass}
          .data=${this._swipeFormData()}
          .schema=${ii}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._formChanged}
        ></ha-form>
      </div>
    `:G}_swipeFormData(){const t=this._formData(["active","swipe_wrap","swipe_threshold"]);return t.swipe=!1!==this._config?.swipe,t}}customElements.get("cardnews-nav-tabs-editor")||customElements.define("cardnews-nav-tabs-editor",ni);var si=Object.freeze({__proto__:null,CardNewsNavTabsEditor:ni});const ai=[{type:"grid",schema:[{name:"label",selector:{text:{}}},{name:"icon",selector:{icon:{}}}]}],oi=["label","icon"];class ri extends fe{get labels(){return{label:"버튼 텍스트",icon:"아이콘 (기본 mdi:refresh)"}}render(){return this.hass&&this._config?K`
      <div class="root">
        <ha-form
          .hass=${this.hass}
          .data=${this._formData(oi)}
          .schema=${ai}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._formChanged}
        ></ha-form>
        <div class="hint">누르면 캐시를 무시하고 대시보드를 새로고침합니다.</div>
      </div>
    `:G}}customElements.get("cardnews-reload-btn-editor")||customElements.define("cardnews-reload-btn-editor",ri);var ci=Object.freeze({__proto__:null,CardNewsReloadBtnEditor:ri});const li=window;function di(t){li.customCards&&(li.customCards.some(e=>e.type===t.type)||li.customCards.push(t))}li.customCards=li.customCards??[],di({type:"cardnews-hero-info",name:"CardNews: Hero Info",description:"Card-news style tile with hero image, category chip, status pill and info list",preview:!0}),di({type:"cardnews-room",name:"CardNews: Room",description:"Room card-news tile with temp, humidity, and switch rows",preview:!0}),di({type:"cardnews-reload-btn",name:"CardNews: Reload Button",description:"Refresh dashboard with cache-bust",preview:!0}),di({type:"cardnews-nav-tabs",name:"CardNews: Nav Tabs",description:"Icon-only top navigation tab bar with underline for active view",preview:!0}),di({type:"cardnews-camera-hero",name:"CardNews: Camera Hero",description:"Camera card with live stream as the hero + chips and info list",preview:!0}),di({type:"cardnews-sensor-panel",name:"CardNews: Sensor Panel",description:"Hero + 2x2 metric grid + 24h sparkline + list — for air quality / climate dashboards",preview:!0}),console.info("%c CARDNEWS %c v0.13.0 ","color:#fff;background:#1a1a1a;padding:2px 6px;border-radius:4px 0 0 4px;font-weight:600","color:#1a1a1a;background:#f5f5f5;padding:2px 6px;border-radius:0 4px 4px 0");
