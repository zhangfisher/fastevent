var FasteventViewer=(function(B){Object.defineProperty(B,Symbol.toStringTag,{value:"Module"});var Pe=Object.defineProperty,je=(r,e,t)=>e in r?Pe(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t,b=(r,e,t)=>je(r,typeof e!="symbol"?e+"":e,t),ht=Symbol.for("__FastEvent__"),pt=Symbol.for("__FastEventScope__"),P=class extends Error{constructor(r){super(r)}},gt=class extends P{},ft=class extends P{},Oe=class extends P{},ut=class extends P{},vt=class extends P{},Ue=(r=>(r[r.Transformed=1]="Transformed",r))(Ue||{});function De(r,e){let t=r.length,s=e.length;if(t!==s&&(s===0||e[s-1]!=="**"))return!1;if(s>0&&e[s-1]==="**"){for(let i=0;i<s-1;i++)if(e[i]!=="*"&&e[i]!==r[i])return!1;return!0}for(let i=0;i<t;i++)if(e[i]!=="*"&&e[i]!==r[i])return!1;return!0}var mt=Symbol.for("__expandable__"),bt=class{constructor(r,e,t={}){this.eventEmitter=r,this.eventName=e,b(this,"resolvers",[]),b(this,"errorResolvers",[]),b(this,"isStopped",!1),b(this,"options"),b(this,"currentSize"),b(this,"hasNewMessage",!1),b(this,"_listener"),b(this,"_ready",!1),b(this,"_listenOptions"),b(this,"_cleanups",[]),b(this,"error",null),b(this,"buffer",[]),this.options={size:t.size??20,maxExpandSize:t.maxExpandSize??100,expandOverflow:t.expandOverflow??"slide",overflow:t.overflow??"slide",lifetime:t.lifetime??0,onPush:t.onPush,onPop:t.onPop,onDrop:t.onDrop,onError:t.onError??(()=>!0),signal:t.signal},this.currentSize=this.options.size,this._listener=this.onMessage.bind(this)}get listener(){return this._listener}get ready(){return this._ready}create(r){if(!this._ready){this._listenOptions=r;try{let e=this.eventEmitter.on(this.eventName,this._listener,r);if(this._cleanups.push(()=>e.off()),this.options.signal&&!this.options.signal.aborted){let t=()=>{this.off(!0)};this.options.signal.addEventListener("abort",t),this._cleanups.push(()=>{this.options.signal.removeEventListener("abort",t)})}}finally{this._ready=!0}}}push(r){this.options.onPush?this.options.onPush(r,this.buffer):this.buffer.push(this.options.lifetime>0?[r,Date.now()]:[r,0])}handleOverflow(r){switch(this.buffer.length>=this.options.maxExpandSize&&this.options.overflow==="expand"?this.options.expandOverflow:this.options.overflow){case"drop":return this.options.onDrop&&this.options.onDrop(r),!1;case"expand":return this.currentSize=Math.min(this.currentSize+this.options.size,this.options.maxExpandSize),this.push(r),!0;case"slide":let e=this.buffer.shift();return this.options.onDrop&&e&&this.options.onDrop(e[0]),this.push(r),!0;case"throw":throw this.options.onDrop&&this.options.onDrop(r),new Error(`EventIterator queue overflow: buffer size (${this.currentSize}) exceeded`);default:return!1}}onMessage(r,e){if(this.isStopped)return;let t=r;if(this.resolvers.length>0){this.resolvers.shift()({value:t,done:!1});return}this.hasNewMessage=!0,this.buffer.length<this.currentSize?this.push(t):this.handleOverflow(t)}off(r){this._ready&&(this.isStopped||(this.isStopped=!0,this._cleanups.forEach(e=>e()),this._cleanups=[],this.buffer=[],this._ready=!1,r?(this.errorResolvers.forEach(e=>{e(new Oe)}),this.errorResolvers=[]):(this.resolvers.forEach(e=>{e({value:void 0,done:!0})}),this.resolvers=[]),this._ready=!1))}async next(){if(this.error)return Promise.reject(this.error);if(this.isStopped&&this.buffer.length===0)return{value:void 0,done:!0};if(this.buffer.length>0){let r,e;if(this.options.onPop){let t=this.options.onPop(this.buffer,this.hasNewMessage);t?[r,e]=t:[r,e]=this.buffer.shift()||[void 0,0]}else[r,e]=this.buffer.shift()||[void 0,0];if(this.hasNewMessage=!1,r!==void 0)return this.options.lifetime>0&&Date.now()-e>this.options.lifetime?(this.options.onDrop&&this.options.onDrop(r),this.next()):{value:r,done:!1}}return new Promise((r,e)=>{this.resolvers.push(r),this.errorResolvers.push(e)})}[Symbol.asyncIterator](){return this}async done(){return this.off(),{value:void 0,done:!0}}async throw(r){return this.error=r,this.off(),Promise.reject(r)}async return(){return this.off(),{value:void 0,done:!0}}[Symbol.dispose](){this.off()}on(){this.create(this._listenOptions),this.isStopped=!1}},q=globalThis,G=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ee=Symbol(),pe=new WeakMap,ge=class{constructor(r,e,t){if(this._$cssResult$=!0,t!==ee)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=r,this.t=e}get styleSheet(){let r=this.o;const e=this.t;if(G&&r===void 0){const t=e!==void 0&&e.length===1;t&&(r=pe.get(e)),r===void 0&&((this.o=r=new CSSStyleSheet).replaceSync(this.cssText),t&&pe.set(e,r))}return r}toString(){return this.cssText}},He=r=>new ge(typeof r=="string"?r:r+"",void 0,ee),W=(r,...e)=>new ge(r.length===1?r[0]:e.reduce((t,s,i)=>t+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[i+1],r[0]),r,ee),Ie=(r,e)=>{if(G)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),i=q.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=t.cssText,r.appendChild(s)}},fe=G?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return He(t)})(r):r,{is:Fe,defineProperty:Be,getOwnPropertyDescriptor:qe,getOwnPropertyNames:We,getOwnPropertySymbols:Je,getPrototypeOf:Ke}=Object,J=globalThis,ue=J.trustedTypes,Xe=ue?ue.emptyScript:"",Ze=J.reactiveElementPolyfillSupport,j=(r,e)=>r,K={toAttribute(r,e){switch(e){case Boolean:r=r?Xe:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},te=(r,e)=>!Fe(r,e),ve={attribute:!0,type:String,converter:K,reflect:!1,useDefault:!1,hasChanged:te};Symbol.metadata??=Symbol("metadata"),J.litPropertyMetadata??=new WeakMap;var N=class extends HTMLElement{static addInitializer(r){this._$Ei(),(this.l??=[]).push(r)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(r,e=ve){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(r)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(r,e),!e.noAccessor){const t=Symbol(),s=this.getPropertyDescriptor(r,t,e);s!==void 0&&Be(this.prototype,r,s)}}static getPropertyDescriptor(r,e,t){const{get:s,set:i}=qe(this.prototype,r)??{get(){return this[e]},set(o){this[e]=o}};return{get:s,set(o){const n=s?.call(this);i?.call(this,o),this.requestUpdate(r,n,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(r){return this.elementProperties.get(r)??ve}static _$Ei(){if(this.hasOwnProperty(j("elementProperties")))return;const r=Ke(this);r.finalize(),r.l!==void 0&&(this.l=[...r.l]),this.elementProperties=new Map(r.elementProperties)}static finalize(){if(this.hasOwnProperty(j("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(j("properties"))){const e=this.properties,t=[...We(e),...Je(e)];for(const s of t)this.createProperty(s,e[s])}const r=this[Symbol.metadata];if(r!==null){const e=litPropertyMetadata.get(r);if(e!==void 0)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const s=this._$Eu(e,t);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(r){const e=[];if(Array.isArray(r)){const t=new Set(r.flat(1/0).reverse());for(const s of t)e.unshift(fe(s))}else r!==void 0&&e.push(fe(r));return e}static _$Eu(r,e){const t=e.attribute;return t===!1?void 0:typeof t=="string"?t:typeof r=="string"?r.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(r=>this.enableUpdating=r),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(r=>r(this))}addController(r){(this._$EO??=new Set).add(r),this.renderRoot!==void 0&&this.isConnected&&r.hostConnected?.()}removeController(r){this._$EO?.delete(r)}_$E_(){const r=new Map,e=this.constructor.elementProperties;for(const t of e.keys())this.hasOwnProperty(t)&&(r.set(t,this[t]),delete this[t]);r.size>0&&(this._$Ep=r)}createRenderRoot(){const r=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ie(r,this.constructor.elementStyles),r}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(r=>r.hostConnected?.())}enableUpdating(r){}disconnectedCallback(){this._$EO?.forEach(r=>r.hostDisconnected?.())}attributeChangedCallback(r,e,t){this._$AK(r,t)}_$ET(r,e){const t=this.constructor.elementProperties.get(r),s=this.constructor._$Eu(r,t);if(s!==void 0&&t.reflect===!0){const i=(t.converter?.toAttribute!==void 0?t.converter:K).toAttribute(e,t.type);this._$Em=r,i==null?this.removeAttribute(s):this.setAttribute(s,i),this._$Em=null}}_$AK(r,e){const t=this.constructor,s=t._$Eh.get(r);if(s!==void 0&&this._$Em!==s){const i=t.getPropertyOptions(s),o=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:K;this._$Em=s;const n=o.fromAttribute(e,i.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(r,e,t,s=!1,i){if(r!==void 0){const o=this.constructor;if(s===!1&&(i=this[r]),t??=o.getPropertyOptions(r),!((t.hasChanged??te)(i,e)||t.useDefault&&t.reflect&&i===this._$Ej?.get(r)&&!this.hasAttribute(o._$Eu(r,t))))return;this.C(r,e,t)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(r,e,{useDefault:t,reflect:s,wrapped:i},o){t&&!(this._$Ej??=new Map).has(r)&&(this._$Ej.set(r,o??e??this[r]),i!==!0||o!==void 0)||(this._$AL.has(r)||(this.hasUpdated||t||(e=void 0),this._$AL.set(r,e)),s===!0&&this._$Em!==r&&(this._$Eq??=new Set).add(r))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const r=this.scheduleUpdate();return r!=null&&await r,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[s,i]of this._$Ep)this[s]=i;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:o}=i,n=this[s];o!==!0||this._$AL.has(s)||n===void 0||this.C(s,void 0,i,n)}}let r=!1;const e=this._$AL;try{r=this.shouldUpdate(e),r?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(t){throw r=!1,this._$EM(),t}r&&this._$AE(e)}willUpdate(r){}_$AE(r){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(r)),this.updated(r)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(r){return!0}update(r){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(r){}firstUpdated(r){}};N.elementStyles=[],N.shadowRootOptions={mode:"open"},N[j("elementProperties")]=new Map,N[j("finalized")]=new Map,Ze?.({ReactiveElement:N}),(J.reactiveElementVersions??=[]).push("2.1.2");var re=globalThis,me=r=>r,X=re.trustedTypes,be=X?X.createPolicy("lit-html",{createHTML:r=>r}):void 0,se="$lit$",_=`lit$${Math.random().toFixed(9).slice(2)}$`,ie="?"+_,Ye=`<${ie}>`,C=document,O=()=>C.createComment(""),U=r=>r===null||typeof r!="object"&&typeof r!="function",oe=Array.isArray,we=r=>oe(r)||typeof r?.[Symbol.iterator]=="function",ne=`[ 	
\f\r]`,D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,xe=/-->/g,_e=/>/g,A=RegExp(`>|${ne}(?:([^\\s"'>=/]+)(${ne}*=${ne}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ye=/'/g,$e=/"/g,ke=/^(?:script|style|textarea|title)$/i,ae=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),d=ae(1),wt=ae(2),xt=ae(3),T=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Ee=new WeakMap,V=C.createTreeWalker(C,129);function Le(r,e){if(!oe(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return be!==void 0?be.createHTML(e):e}var Se=(r,e)=>{const t=r.length-1,s=[];let i,o=e===2?"<svg>":e===3?"<math>":"",n=D;for(let a=0;a<t;a++){const c=r[a];let m,g,p=-1,$=0;for(;$<c.length&&(n.lastIndex=$,g=n.exec(c),g!==null);)$=n.lastIndex,n===D?g[1]==="!--"?n=xe:g[1]!==void 0?n=_e:g[2]!==void 0?(ke.test(g[2])&&(i=RegExp("</"+g[2],"g")),n=A):g[3]!==void 0&&(n=A):n===A?g[0]===">"?(n=i??D,p=-1):g[1]===void 0?p=-2:(p=n.lastIndex-g[2].length,m=g[1],n=g[3]===void 0?A:g[3]==='"'?$e:ye):n===$e||n===ye?n=A:n===xe||n===_e?n=D:(n=A,i=void 0);const S=n===A&&r[a+1].startsWith("/>")?" ":"";o+=n===D?c+Ye:p>=0?(s.push(m),c.slice(0,p)+se+c.slice(p)+_+S):c+_+(p===-2?a:S)}return[Le(r,o+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},le=class Te{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let o=0,n=0;const a=e.length-1,c=this.parts,[m,g]=Se(e,t);if(this.el=Te.createElement(m,s),V.currentNode=this.el.content,t===2||t===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=V.nextNode())!==null&&c.length<a;){if(i.nodeType===1){if(i.hasAttributes())for(const p of i.getAttributeNames())if(p.endsWith(se)){const $=g[n++],S=i.getAttribute(p).split(_),Q=/([.?@])?(.*)/.exec($);c.push({type:1,index:o,name:Q[2],strings:S,ctor:Q[1]==="."?Ae:Q[1]==="?"?Ve:Q[1]==="@"?Me:H}),i.removeAttribute(p)}else p.startsWith(_)&&(c.push({type:6,index:o}),i.removeAttribute(p));if(ke.test(i.tagName)){const p=i.textContent.split(_),$=p.length-1;if($>0){i.textContent=X?X.emptyScript:"";for(let S=0;S<$;S++)i.append(p[S],O()),V.nextNode(),c.push({type:2,index:++o});i.append(p[$],O())}}}else if(i.nodeType===8)if(i.data===ie)c.push({type:2,index:o});else{let p=-1;for(;(p=i.data.indexOf(_,p+1))!==-1;)c.push({type:7,index:o}),p+=_.length-1}o++}}static createElement(e,t){const s=C.createElement("template");return s.innerHTML=e,s}};function M(r,e,t=r,s){if(e===T)return e;let i=s!==void 0?t._$Co?.[s]:t._$Cl;const o=U(e)?void 0:e._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(r),i._$AT(r,t,s)),s!==void 0?(t._$Co??=[])[s]=i:t._$Cl=i),i!==void 0&&(e=M(r,i._$AS(r,e.values),i,s)),e}var Ce=class{constructor(r,e){this._$AV=[],this._$AN=void 0,this._$AD=r,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(r){const{el:{content:e},parts:t}=this._$AD,s=(r?.creationScope??C).importNode(e,!0);V.currentNode=s;let i=V.nextNode(),o=0,n=0,a=t[0];for(;a!==void 0;){if(o===a.index){let c;a.type===2?c=new Z(i,i.nextSibling,this,r):a.type===1?c=new a.ctor(i,a.name,a.strings,this,r):a.type===6&&(c=new ze(i,this,r)),this._$AV.push(c),a=t[++n]}o!==a?.index&&(i=V.nextNode(),o++)}return V.currentNode=C,s}p(r){let e=0;for(const t of this._$AV)t!==void 0&&(t.strings!==void 0?(t._$AI(r,t,e),e+=t.strings.length-2):t._$AI(r[e])),e++}},Z=class Re{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=M(this,e,t),U(e)?e===u||e==null||e===""?(this._$AH!==u&&this._$AR(),this._$AH=u):e!==this._$AH&&e!==T&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):we(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==u&&U(this._$AH)?this._$AA.nextSibling.data=e:this.T(C.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,i=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=le.createElement(Le(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{const o=new Ce(i,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=Ee.get(e.strings);return t===void 0&&Ee.set(e.strings,t=new le(e)),t}k(e){oe(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,i=0;for(const o of e)i===t.length?t.push(s=new Re(this.O(O()),this.O(O()),this,this.options)):s=t[i],s._$AI(o),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const s=me(e).nextSibling;me(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},H=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(r,e,t,s,i){this.type=1,this._$AH=u,this._$AN=void 0,this.element=r,this.name=e,this._$AM=s,this.options=i,t.length>2||t[0]!==""||t[1]!==""?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=u}_$AI(r,e=this,t,s){const i=this.strings;let o=!1;if(i===void 0)r=M(this,r,e,0),o=!U(r)||r!==this._$AH&&r!==T,o&&(this._$AH=r);else{const n=r;let a,c;for(r=i[0],a=0;a<i.length-1;a++)c=M(this,n[t+a],e,a),c===T&&(c=this._$AH[a]),o||=!U(c)||c!==this._$AH[a],c===u?r=u:r!==u&&(r+=(c??"")+i[a+1]),this._$AH[a]=c}o&&!s&&this.j(r)}j(r){r===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,r??"")}},Ae=class extends H{constructor(){super(...arguments),this.type=3}j(r){this.element[this.name]=r===u?void 0:r}},Ve=class extends H{constructor(){super(...arguments),this.type=4}j(r){this.element.toggleAttribute(this.name,!!r&&r!==u)}},Me=class extends H{constructor(r,e,t,s,i){super(r,e,t,s,i),this.type=5}_$AI(r,e=this){if((r=M(this,r,e,0)??u)===T)return;const t=this._$AH,s=r===u&&t!==u||r.capture!==t.capture||r.once!==t.once||r.passive!==t.passive,i=r!==u&&(t===u||s);s&&this.element.removeEventListener(this.name,this,t),i&&this.element.addEventListener(this.name,this,r),this._$AH=r}handleEvent(r){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,r):this._$AH.handleEvent(r)}},ze=class{constructor(r,e,t){this.element=r,this.type=6,this._$AN=void 0,this._$AM=e,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(r){M(this,r)}},_t={M:se,P:_,A:ie,C:1,L:Se,R:Ce,D:we,V:M,I:Z,H,N:Ve,U:Me,B:Ae,F:ze},Qe=re.litHtmlPolyfillSupport;Qe?.(le,Z),(re.litHtmlVersions??=[]).push("3.3.2");var Ge=(r,e,t)=>{const s=t?.renderBefore??e;let i=s._$litPart$;if(i===void 0){const o=t?.renderBefore??null;s._$litPart$=i=new Z(e.insertBefore(O(),o),o,void 0,t??{})}return i._$AI(r),i},de=globalThis,k=class extends N{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const r=super.createRenderRoot();return this.renderOptions.renderBefore??=r.firstChild,r}update(r){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(r),this._$Do=Ge(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};k._$litElement$=!0,k.finalized=!0,de.litElementHydrateSupport?.({LitElement:k});var et=de.litElementPolyfillSupport;et?.({LitElement:k}),(de.litElementVersions??=[]).push("4.2.2");var Y=r=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(r,e)}):customElements.define(r,e)},tt={attribute:!0,type:String,converter:K,reflect:!1,hasChanged:te},rt=(r=tt,e,t)=>{const{kind:s,metadata:i}=t;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),s==="setter"&&((r=Object.create(r)).wrapped=!0),o.set(t.name,r),s==="accessor"){const{name:n}=t;return{set(a){const c=e.get.call(this);e.set.call(this,a),this.requestUpdate(n,c,r,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,r,a),a}}}if(s==="setter"){const{name:n}=t;return function(a){const c=this[n];e.call(this,a),this.requestUpdate(n,c,r,!0,a)}}throw Error("Unsupported decorator location: "+s)};function f(r){return(e,t)=>typeof t=="object"?rt(r,e,t):((s,i,o)=>{const n=i.hasOwnProperty(o);return i.constructor.createProperty(o,s),n?Object.getOwnPropertyDescriptor(i,o):void 0})(r,e,t)}function x(r){return f({...r,state:!0,attribute:!1})}var Ne=W`
    :host,
    :root {
        --icon-size: 16px;
        --icon-tags: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/></svg>');
        --icon-yes: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"  stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>');
        --icon-file: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="currentColor" d="m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M160 51.31L188.69 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48z"/></svg>');
        --icon-loading: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="currentColor"><path opacity=".25" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4" /><path d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"><animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="0.8s" repeatCount="indefinite" /></path></svg>');
        --icon-arrow: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6" /></svg>');
        --icon-error: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>');
        --icon-success: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21.801 10A10 10 0 1 1 17 3.335" /><path d="m9 11 3 3L22 4" /></svg>');
        --icon-refresh: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>');
        --icon-clear: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>');
        --icon-copy: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" ><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>');
        --icon-listeners: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" ><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/></svg>');
        --icon-listener: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" ><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"/><path d="M9 11.2h5.7"/></svg>');
        --icon-count: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M16 8.9V7H8l4 5-4 5h8v-1.9"/></svg>');
        --icon-flags: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"/></svg>');
        --icon-transform: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 14 4 4-4 4"/><path d="M20 10a8 8 0 1 0-8 8h8"/></svg>');
        --icon-dark: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>');
        --icon-delete: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>');
        --icon-inspect: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>');
    }
    .icon {
        display: inline-block;
        background-color: currentColor !important;
        mask-size: cover;
        -webkit-mask-size: cover;
        vertical-align: text-bottom;
        position: relative;
        stroke-width: 1;
        width: var(--icon-size);
        height: var(--icon-size);
        box-sizing: border-box;
    }

    /** 图标 */
    .icon.close {
        mask-image: var(--icon-close);
    }
    .icon.tags {
        mask-image: var(--icon-tags);
    }

    .icon.yes {
        mask-image: var(--icon-yes);
    }

    .icon.file {
        mask-image: var(--icon-file);
    }

    .icon.loading {
        mask-image: var(--icon-loading);
    }

    .icon.arrow {
        mask-image: var(--icon-arrow);
    }

    .icon.error {
        mask-image: var(--icon-error);
    }

    .icon.refresh {
        mask-image: var(--icon-refresh);
    }

    .icon.clear {
        mask-image: var(--icon-clear);
    }

    .icon.copy {
        mask-image: var(--icon-copy);
    }
    .icon.listeners {
        mask-image: var(--icon-listeners);
    }
    .icon.listener {
        mask-image: var(--icon-listener);
    }
    .icon.count {
        mask-image: var(--icon-count);
    }
    .icon.flags {
        mask-image: var(--icon-flags);
    }
    .icon.transform {
        mask-image: var(--icon-transform);
    }
    .icon.dark {
        mask-image: var(--icon-dark);
    }
    .icon.delete {
        mask-image: var(--icon-delete);
    }
    .icon.inspect {
        mask-image: var(--icon-inspect);
    }
`,st=W`
    ${Ne}
    :host {
        display: flex;
        flex-direction: column;
        font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
            sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: var(--fe-color-text, #333);
        background: var(--fe-color-bg, #fff);
        border: 1px solid var(--fe-color-border, #e8e8e8);
        border-radius: 6px;
        overflow: hidden;
    }

    :host([dark]) {
        --fe-color-text: rgba(255, 255, 255, 0.85);
        --fe-color-bg: #1f1f1f;
        --fe-color-border: #303030;
        --fe-color-header-bg: #141414;
        --fe-color-hover: rgba(255, 255, 255, 0.08);
        --fe-color-text-secondary: rgba(255, 255, 255, 0.45);
        --fe-color-input-bg: rgba(255, 255, 255, 0.08);
        --fe-color-tag-bg: rgba(255, 255, 255, 0.08);
        --fe-color-tag-text: rgba(255, 255, 255, 0.85);
        --fe-color-listener-bg: rgba(255, 255, 255, 0.04);
        --fe-color-listener-border: rgba(255, 255, 255, 0.12);
        --fe-color-listener-hover: rgba(255, 255, 255, 0.08);
    }

    .header {
        display: flex;
        align-items: center;
        padding: 1em;
        background: var(--fe-color-header-bg, #fafafa);
        border-bottom: 1px solid var(--fe-color-border, #e8e8e8);
        gap: 8px;
    }

    .header-title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
        color: var(--fe-color-text, #333);
    }

    .toolbar {
        display: flex;
        align-items: center;
        padding: 0.75em 1em;
        border-bottom: 1px solid var(--fe-color-border, #e8e8e8);
        gap: 12px;
    }

    .filter-input {
        width: 20%;
        min-width: 150px;
        padding: 0.4em 0.8em;
        border: 1px solid var(--fe-color-border, #d9d9d9);
        border-radius: 6px;
        background: var(--fe-color-input-bg, #fff);
        color: var(--fe-color-text, #333);
        font-size: 13px;
        transition: all 0.3s;
    }

    .filter-input:focus {
        outline: none;
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    .filter-input::placeholder {
        color: var(--fe-color-text-secondary, #bfbfbf);
    }

    .toolbar-spacer {
        flex: 1;
        color: var(--fe-color-text-secondary, #999);
        font-size: 12px;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0.4em 0.8em;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--fe-color-text, #555);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;
    }

    .btn:hover {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.06);
    }

    .btn-pressed {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.1);
    }

    .btn-icon {
        padding: 0.2em;
        width: 24px;
        height: 24px;
    }

    .btn-pressed {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.1);
    }

    .logs {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0;
    }

    .log-item {
        display: flex;
        align-items: flex-start;
        padding: 0.5em;
        border-radius: 4px;
        transition: background 0.2s;
        border-bottom: 1px solid var(--fe-color-border, #fafafa);
    }

    .log-item:hover {
        background: var(--fe-color-hover, #fcfcfc);
    }

    .log-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .log-header {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        padding: 0;
    }

    .log-header .icon {
        --icon-size: 16px;
        color: #818181;
        flex-shrink: 0;
    }

    .log-type {
        flex: 1;
        font-weight: 500;
        color: var(--fe-color-text, #333);
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    }

    .log-time {
        font-size: 12px;
        color: var(--fe-color-text-secondary, #999);
    }

    .tag {
        display: inline-flex;
        align-items: center;
        padding: 0.1em 0.4em;
        border-radius: 5px;
        font-size: 11px;
        white-space: nowrap;
        background: var(--fe-color-tag-bg, #f0f0f0);
        color: var(--fe-color-tag-text, #666);
    }

    .tag-blue {
        background: #e6f7ff;
        color: #1890ff;
        border: 1px solid #91d5ff;
    }

    .tag-green {
        background: #f6ffed;
        color: #52c41a;
        border: 1px solid #b7eb8f;
    }

    .tag-orange {
        background: #fff7e6;
        color: #fa8c16;
        border: 1px solid #ffd591;
    }

    .tag-red {
        background: #fff1f0;
        color: #ff4d4f;
        border: 1px solid #ffa39e;
    }

    .tag-purple {
        background: #f9f0ff;
        color: #722ed1;
        border: 1px solid #d3adf7;
    }

    .tag-gray {
        background: #f5f5f5;
        color: #8c8c8c;
        border: 1px solid #d9d9d9;
    }

    /* 暗黑模式下的 tag 颜色样式 */
    :host([dark]) .tag-blue {
        background: rgba(24, 144, 255, 0.15);
        color: #40a9ff;
        border: 1px solid rgba(24, 144, 255, 0.3);
    }

    :host([dark]) .tag-green {
        background: rgba(82, 196, 26, 0.15);
        color: #73d13d;
        border: 1px solid rgba(82, 196, 26, 0.3);
    }

    :host([dark]) .tag-orange {
        background: rgba(250, 140, 22, 0.15);
        color: #ffa940;
        border: 1px solid rgba(250, 140, 22, 0.3);
    }

    :host([dark]) .tag-red {
        background: rgba(255, 77, 79, 0.15);
        color: #ff7875;
        border: 1px solid rgba(255, 77, 79, 0.3);
    }

    :host([dark]) .tag-purple {
        background: rgba(114, 46, 209, 0.15);
        color: #b37feb;
        border: 1px solid rgba(114, 46, 209, 0.3);
    }

    :host([dark]) .tag-gray {
        background: rgba(140, 140, 140, 0.15);
        color: #bfbfbf;
        border: 1px solid rgba(140, 140, 140, 0.3);
    }

    .log-payload {
        font-size: 12px;
        color: var(--fe-color-text-secondary, #999);
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.4;
        padding: 0em 20px;
        padding-top: 0px;
    }

    .log-listeners {
        padding: 0em 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .log-listeners-visible {
        display: flex;
    }

    .log-listeners-hidden {
        display: none;
    }

    .listener {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0.25em 0.5em;
        border-radius: 8px;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.03);
        border: 1px solid rgba(0, 0, 0, 0.06);
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        cursor: pointer;
    }

    .listener:hover {
        background: rgba(0, 0, 0, 0.05);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    /* 暗黑模式下的 listener 样式 */
    :host([dark]) .listener {
        background: var(--fe-color-listener-bg, rgba(255, 255, 255, 0.04));
        border: 1px solid var(--fe-color-listener-border, rgba(255, 255, 255, 0.12));
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    :host([dark]) .listener:hover {
        background: var(--fe-color-listener-hover, rgba(255, 255, 255, 0.08));
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }

    .listener-status {
        width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .listener-status .icon {
        --icon-size: 12px;
    }

    .listener-status.running .icon {
        color: #1890ff;
    }

    .listener-status.yes .icon {
        color: #52c41a;
    }

    .listener-status.error .icon {
        color: #ff4d4f;
    }

    .listener-name {
        font-weight: 500;
        color: var(--fe-color-text, #333);
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 11px;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2em;
        color: var(--fe-color-text-secondary, #999);
        text-align: center;
    }

    .empty-state .icon {
        --icon-size: 48px;
        opacity: 0.3;
    }

    /* Emitter 下拉容器 */
    .emitter-dropdown-container {
        position: relative;
        flex-shrink: 0;
    }

    /* Emitter 下拉占位符 */
    .emitter-dropdown-spacer {
        flex: 1;
    }

    /* 下拉触发按钮 */
    .emitter-dropdown-trigger {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: all 0.3s;
    }

    .emitter-dropdown-trigger:hover .header-title {
        color: #1890ff;
    }

    /* 下拉箭头 */
    .dropdown-arrow {
        display: inline-block;
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid var(--fe-color-text, #333);
        transition: transform 0.3s;
        opacity: 0.6;
    }

    .dropdown-arrow.open {
        transform: rotate(180deg);
    }

    /* 暗黑模式下的下拉箭头 */
    :host([dark]) .dropdown-arrow {
        border-top-color: rgba(255, 255, 255, 0.85);
    }

    /* 下拉菜单容器 */
    .emitter-dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 4px;
        min-width: 180px;
        background: #ffffff;
        border: 1px solid #e8e8e8;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        overflow: hidden;
        animation: dropdownFadeIn 0.2s ease-out;
    }

    @keyframes dropdownFadeIn {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* 菜单项 */
    .emitter-menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 14px;
        color: #333;
        text-align: left;
    }

    .emitter-menu-item:hover {
        background: #f5f5f5;
    }

    .emitter-menu-item.active {
        background: #e6f7ff;
        color: #1890ff;
        font-weight: 500;
    }

    /* 菜单项图标占位区域 */
    .menu-item-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .menu-item-icon .icon {
        --icon-size: 14px;
        color: #52c41a;
    }

    /* 菜单项标签 */
    .menu-item-label {
        flex: 1;
        text-align: left;
    }

    /* 通用下拉菜单样式（供 renderMenu 使用） */
    .dropdown-menu {
        padding: 4px 0;
        min-width: 150px;
        background: var(--fe-color-bg, #fff);
        border: 1px solid var(--fe-color-border, #e8e8e8);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .dropdown-menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 14px;
        color: var(--fe-color-text, #333);
    }

    .dropdown-menu-item:hover {
        background: var(--fe-color-hover, #f5f5f5);
    }

    .dropdown-menu-item.active {
        background: #e6f7ff;
        color: #1890ff;
    }

    :host([dark]) .emitter-dropdown-menu {
        background: #2a2a2a;
        border-color: #404040;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    :host([dark]) .emitter-menu-item {
        color: rgba(255, 255, 255, 0.85);
    }

    :host([dark]) .emitter-menu-item:hover {
        background: rgba(255, 255, 255, 0.06);
    }

    :host([dark]) .emitter-menu-item.active {
        background: rgba(24, 144, 255, 0.15);
        color: #40a9ff;
    }

    :host([dark]) .dropdown-menu {
        background: var(--fe-color-bg, #2a2a2a);
        border-color: var(--fe-color-border, #404040);
    }

    :host([dark]) .dropdown-menu-item.active {
        background: rgba(24, 144, 255, 0.15);
        color: #40a9ff;
    }
`,it=W`
    ${Ne}
    :host {
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: var(--fe-color-text, #333);
        background: var(--fe-color-bg, #fff);
        overflow: hidden;
        position: relative;
    }

    :host([dark]) {
        --fe-color-text: rgba(255, 255, 255, 0.85);
        --fe-color-bg: #1f1f1f;
        --fe-color-border: #303030;
        --fe-color-header-bg: #141414;
        --fe-color-hover: rgba(255, 255, 255, 0.08);
        --fe-color-text-secondary: rgba(255, 255, 255, 0.45);
        --fe-color-bg-secondary: rgba(255, 255, 255, 0.05);
        --fe-color-tag-bg: rgba(255, 255, 255, 0.08);
        --fe-color-tag-text: rgba(255, 255, 255, 0.85);
        --fe-left-width: 33.33%;
    }

    :host {
        --fe-left-width: 30%;
    }

    .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75em 1em;
        border-bottom: 1px solid var(--fe-color-border, #e8e8e8);
        background: var(--fe-color-header-bg, #fff);
    }

    .toolbar-title {
        font-size: 14px;
        /* font-weight: 600;
        color: var(--fe-color-text, #333); */
    }

    .main-container {
        display: flex;
        flex: 1;
        overflow: hidden;
        position: relative;
    }

    .tree-panel {
        flex: 0 0 var(--fe-left-width, 33.33%);
        overflow-y: auto;
        overflow-x: hidden;
        border-right: 1px solid var(--fe-color-border, #e8e8e8);
        padding: 8px;
    }

    .tree-panel::-webkit-scrollbar {
        width: 2px;
    }
    .tree-panel::-webkit-scrollbar-thumb {
        background: transparent;
    }
    .tree-panel:hover::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
    }

    .listeners-panel {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px;
        padding-left: 0px;
    }

    .listeners-panel::-webkit-scrollbar {
        width: 2px;
    }
    .listeners-panel::-webkit-scrollbar-thumb {
        background: transparent;
    }
    .listeners-panel:hover::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
    }

    .resizer {
        width: 8px;
        cursor: col-resize;
        background: transparent;
        position: relative;
        z-index: 10;
        flex-shrink: 0;
        user-select: none;
    }

    .resizer::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 4px;
        height: 40px;
        background: var(--fe-color-border, #e8e8e8);
        border-radius: 2px;
        opacity: 0;
        transition:
            opacity 0.2s,
            height 0.2s;
    }

    .resizer:hover::after {
        opacity: 1;
        background: #1890ff;
    }

    .resizer.dragging::after {
        opacity: 1;
        background: #1890ff;
        height: 60px;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3em;
        padding-left: 0;
        color: var(--fe-color-text-secondary, #999);
        text-align: center;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0.4em 0.8em;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--fe-color-text, #333);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;
    }

    .btn:hover {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.06);
    }

    .btn-icon {
        padding: 0.2em;
        width: 24px;
        height: 24px;
    }

    .tag {
        display: inline-flex;
        align-items: center;
        padding: 0.1em 0.4em;
        border-radius: 5px;
        font-size: 11px;
        white-space: nowrap;
        background: var(--fe-color-tag-bg, #f0f0f0);
        color: var(--fe-color-tag-text, #666);
    }

    .tree-node {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.2s;
        user-select: none;
    }

    .tree-node:hover {
        background: var(--fe-color-hover, #fafafa);
    }

    .tree-node.selected {
        background: rgba(24, 144, 255, 0.1);
    }

    .tree-node-toggle {
        width: 16px;
        height: 16px;
        margin-right: 4px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
    }

    .tree-node-toggle.expanded {
        transform: rotate(90deg);
    }

    .tree-node-toggle.hidden {
        visibility: hidden;
    }

    .tree-node-content {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1;
    }

    .tree-node-label {
        font-family: "SFMono-Regular", Consolas, monospace;
        font-size: 13px;
        flex-grow: 1;
    }

    .tree-node-badge {
        background: var(--fe-color-tag-bg, #f0f0f0);
        color: var(--fe-color-tag-text, #666);
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 11px;
    }

    .tree-children {
        padding-left: 16px;
    }

    .tag {
        display: inline-flex;
        align-items: center;
        padding: 0.1em 0.4em;
        border-radius: 5px;
        font-size: 11px;
        white-space: nowrap;
        background: var(--fe-color-tag-bg, #f0f0f0);
        color: var(--fe-color-tag-text, #666);
    }

    /* 保留消息卡片样式 */
    .retained-message-card {
        margin-bottom: 12px;
        border-radius: 6px;
        border: 1px solid #ffa39e;
        background: #fff1f0;
        overflow: hidden;
        transition: all 0.2s;
    }

    .retained-message-card:hover {
        box-shadow: 0 2px 8px rgba(255, 77, 79, 0.15);
    }

    .retained-message-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: rgba(255, 77, 79, 0.1);
        border-bottom: 1px solid #ffa39e;
    }

    .retained-message-title {
        flex: 1;
        font-size: 13px;
        font-weight: 500;
        color: #ff4d4f;
    }

    .retained-message-actions {
        display: flex;
        gap: 4px;
    }

    .retained-message-content {
        padding: 4px;
    }

    .retained-message-text {
        margin: 0;
        padding: 8px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 4px;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 12px;
        line-height: 1.5;
        color: #262626;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
    }

    /* 暗黑模式下的保留消息卡片 */
    .retained-message-card.dark,
    :host([dark]) .retained-message-card {
        border: 1px solid rgba(255, 77, 79, 0.4);
        background: rgba(255, 77, 79, 0.08);
    }

    .retained-message-card.dark:hover,
    :host([dark]) .retained-message-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .retained-message-card.dark .retained-message-header,
    :host([dark]) .retained-message-header {
        background: rgba(255, 77, 79, 0.15);
        border-bottom: 1px solid rgba(255, 77, 79, 0.3);
    }

    .retained-message-card.dark .retained-message-title,
    :host([dark]) .retained-message-title {
        color: #ff7875;
    }

    .retained-message-card.dark .retained-message-text,
    :host([dark]) .retained-message-text {
        background: rgba(0, 0, 0, 0.2);
        color: rgba(255, 255, 255, 0.85);
    }

    @media (max-width: 568px) {
        .main-container {
            flex-direction: column;
        }

        .tree-panel {
            flex: 0 0 40%;
            border-right: none;
            border-bottom: 1px solid var(--fe-color-border, #e8e8e8);
        }

        .resizer {
            display: none;
        }
    }
`,ot=W`
    :host {
        display: block;
    }

    :host([dark]) {
        --fe-color-card-bg: rgba(255, 255, 255, 0.04);
        --fe-color-card-border: rgba(255, 255, 255, 0.12);
        --fe-color-card-hover: rgba(255, 255, 255, 0.08);
    }

    .listener-card {
        display: table;
        width: 100%;
        padding: 0px;
        margin-bottom: 8px;
        border-radius: 6px;
        border: 1px solid var(--fe-color-border, #e8e8e8);
        transition: all 0.2s;
        box-sizing: border-box;
        background-color: #f9f9f9;
    }

    .listener-card:hover {
        /* border-color: #1890ff; */
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    :host([dark]) .listener-card {
        background-color: var(--fe-color-card-bg, rgba(255, 255, 255, 0.04));
        border: 1px solid var(--fe-color-card-border, rgba(255, 255, 255, 0.12));
    }

    :host([dark]) .listener-card:hover {
        background-color: var(--fe-color-card-hover, rgba(255, 255, 255, 0.08));
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .listener-row {
        display: table-row;
        border-bottom: 1px solid var(--fe-color-border, #e8e8e8);
    }

    .listener-row:last-child {
        border-bottom: none;
    }

    .listener-cell {
        display: table-cell;
        padding: 4px 8px;
        vertical-align: middle;
        border-right: 1px solid var(--fe-color-border, #e8e8e8);
    }

    .listener-cell:first-child {
        width: 80px;
        min-width: 80px;
    }

    .listener-cell:last-child {
        border-right: none;
    }

    .listener-label {
        color: var(--fe-color-text-secondary, #999);
        font-size: 12px;
        font-weight: 500;
    }

    .listener-value {
        color: var(--fe-color-text, #333);
        font-size: 13px;
    }

    .listener-function {
        font-family: "SFMono-Regular", Consolas, monospace;
        color: #1890ff;
        cursor: pointer;
        text-decoration: underline;
    }

    .listener-function:hover {
        color: #40a9ff;
    }

    :host([dark]) .listener-function {
        color: #40a9ff;
    }

    :host([dark]) .listener-function:hover {
        color: #69c0ff;
    }

    .tag {
        display: inline-flex;
        align-items: center;
        padding: 0.1em 0.4em;
        border-radius: 5px;
        font-size: 11px;
        white-space: nowrap;
        background: var(--fe-color-tag-bg, #f0f0f0);
        color: var(--fe-color-tag-text, #666);
    }

    .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1em;
        color: var(--fe-color-text-secondary, #999);
        text-align: center;
    }
`;function R(r,e){for(let t=r.length-1;t>=0;t--)r[t]===e&&r.splice(t,1)}var nt={bg:"#f0f0f0",color:"#666",border:"#d9d9d9"},at={blue:{bg:"#e6f7ff",color:"#1890ff",border:"#91d5ff"},green:{bg:"#f6ffed",color:"#52c41a",border:"#b7eb8f"},orange:{bg:"#fff7e6",color:"#fa8c16",border:"#ffd591"},red:{bg:"#fff1f0",color:"#ff4d4f",border:"#ffa39e"},purple:{bg:"#f9f0ff",color:"#722ed1",border:"#d3adf7"},gray:{bg:"#f5f5f5",color:"#8c8c8c",border:"#d9d9d9"}},lt={blue:{bg:"rgba(24, 144, 255, 0.15)",color:"#40a9ff",border:"rgba(24, 144, 255, 0.3)"},green:{bg:"rgba(82, 196, 26, 0.15)",color:"#73d13d",border:"rgba(82, 196, 26, 0.3)"},orange:{bg:"rgba(250, 140, 22, 0.15)",color:"#ffa940",border:"rgba(250, 140, 22, 0.3)"},red:{bg:"rgba(255, 77, 79, 0.15)",color:"#ff7875",border:"rgba(255, 77, 79, 0.3)"},purple:{bg:"rgba(114, 46, 209, 0.15)",color:"#b37feb",border:"rgba(114, 46, 209, 0.3)"},gray:{bg:"rgba(140, 140, 140, 0.15)",color:"#bfbfbf",border:"rgba(140, 140, 140, 0.3)"}};function dt(r){const e=["blue","green","orange","red","purple"];let t=0;for(let s=0;s<r.length;s++)t=r.charCodeAt(s)+((t<<5)-t);return e[Math.abs(t)%e.length]}function w(r,e,t,s,i){if(typeof e=="object"&&e!==null&&"styles"in e){const o=e;return d`<span
            class="${["tag",o.dark??i??!1?"dark":"",o.className].filter(Boolean).join(" ")}"
            title="${o.tooltip||r}"
            style="${o.styles}"
            @click="${o.onClick}"
        >
            ${r}
        </span>`}else{const o=e||dt(r),n=(i??!1?lt:at)[o]||nt;return d`<span
            class="${["tag",s].filter(Boolean).join(" ")}"
            title="${t||r}"
            style="display: inline-flex; align-items: center; padding: 0.1em 0.4em; border-radius: 5px; font-size: 11px; white-space: nowrap; background: ${n.bg}; color: ${n.color}; ${n.border?`border: 1px solid ${n.border};`:""}"
        >
            ${r}
        </span>`}}function E(r,e,t={}){const{icon:s,pressed:i,className:o="",title:n}=t,a=["btn",o];return i&&a.push("btn-pressed"),s&&a.push("btn-icon"),d`<button
        class="${a.join(" ")}"
        title="${n||""}"
        @click="${e}"
        style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0.4em 0.8em; border: none; border-radius: 4px; background: transparent; cursor: pointer; transition: all 0.3s; user-select: none; ${s?"padding: 0.2em; width: 24px; height: 24px;":""}"
    >
        ${s?d`<span class="icon ${s}"></span>`:""}
        ${r}
    </button>`}function I(r,e){return e?d`<span class="icon ${r}" title="${e}"></span>`:d`<span class="icon ${r}"></span>`}function ct(r){const{message:e,pathKey:t,dark:s=!1,onDelete:i,onPrint:o,onCopy:n}=r,a=JSON.stringify(e,null,2),c=a.split(`
`).length>15?a.split(`
`).slice(0,5).join(`
`)+`
...`:a;return d`
        <div class="retained-message-card${s?" dark":""}">
            <div class="retained-message-header">
                <span class="retained-message-title">保留消息</span>
                <div class="retained-message-actions">
                    ${E("",()=>i?.(t),{icon:"delete",className:"btn-icon",title:"删除保留消息"})}
                    ${E("",()=>o?.(e),{icon:"listeners",className:"btn-icon",title:"打印到控制台"})}
                    ${E("",()=>n?.(e),{icon:"copy",className:"btn-icon",title:"复制消息内容"})}
                </div>
            </div>
            <div class="retained-message-content">
                <pre class="retained-message-text">${c}</pre>
            </div>
        </div>
    `}var ce={cn:{"eventViewer.filterPlaceholder":"事件类型过滤","eventViewer.normalMode":"正常模式","eventViewer.darkMode":"暗黑模式","eventViewer.showEvent":"显示事件","eventViewer.showListeners":"显示注册的监听器","eventViewer.totalLogs":"共{0}条","eventViewer.hideListenerDetails":"隐藏监听器详情","eventViewer.showListenerDetails":"显示监听器详情","eventViewer.clear":"清空","eventViewer.extendedFlags":"扩展标识","eventViewer.transformed":"经过转换","eventViewer.serialNumber":"序号","eventViewer.totalListeners":"共{0}个监听器","eventViewer.retainLastEvent":"保留最后一次事件数据","eventViewer.rawEventType":"原始事件类型: {0}","eventViewer.executionTime":"执行耗时","eventViewer.copyMessage":"复制事件消息","eventViewer.triggerTime":"触发时间","eventViewer.eventType":"事件类型","eventViewer.listenerTag":"监听器标签: {0}","eventViewer.executionCount":"执行次数计数（当前/总数）","eventViewer.listenerFlags":"监听器标识flags","eventViewer.executing":"执行中...","eventViewer.error":"错误: {0}","eventViewer.noEventLogs":"暂无事件日志","eventViewer.listener":"监听器: {0}","eventViewer.executionResult":"执行结果：","eventViewer.switchEmitter":"切换 Emitter","eventViewer.inspect":"注册实例到控制台：{}","listenerViewer.registeredListeners":"已注册监听器","listenerViewer.refresh":"刷新","listenerViewer.noRegisteredListeners":"暂无注册的监听器","listenerViewer.nodeHasNoListeners":"该节点暂无监听器","listenerViewer.listener":"监听器: {0}","listenerViewer.executionCount":"执行次数: {0}/{1}","listenerViewer.tag":"标签: {0}","listenerViewer.flags":"标识: {0}","listenerViewer.retainedMessage":"保留消息","listenerCard.invalidData":"监听器数据无效","listenerCard.listenerFunction":"监听函数","listenerCard.executionCount":"执行次数","listenerCard.tag":"标签","listenerCard.flags":"标识","listenerCard.returnValue":"返回值","listenerCard.clickToConsole":"点击在控制台输出监听器信息","listenerCard.clickToConsoleResult":"单击显示在控制台","listenerCard.anonymous":"anonymous"},en:{"eventViewer.filterPlaceholder":"Filter by event type","eventViewer.normalMode":"Normal mode","eventViewer.darkMode":"Dark mode","eventViewer.showEvent":"Show events","eventViewer.showListeners":"Show registered listeners","eventViewer.totalLogs":"Total {0}","eventViewer.hideListenerDetails":"Hide listener details","eventViewer.showListenerDetails":"Show listener details","eventViewer.clear":"Clear","eventViewer.extendedFlags":"Extended flags","eventViewer.transformed":"Transformed","eventViewer.serialNumber":"Serial number","eventViewer.totalListeners":"{0} listeners","eventViewer.retainLastEvent":"Retain last event data","eventViewer.rawEventType":"Raw event type: {0}","eventViewer.executionTime":"Execution time","eventViewer.copyMessage":"Copy event message","eventViewer.triggerTime":"Trigger time","eventViewer.eventType":"Event type","eventViewer.listenerTag":"Listener tag: {0}","eventViewer.executionCount":"Execution count (current/total)","eventViewer.listenerFlags":"Listener flags","eventViewer.executing":"Executing...","eventViewer.error":"Error: {0}","eventViewer.noEventLogs":"No event logs","eventViewer.listener":"Listener: {0}","eventViewer.executionResult":"Execution result:","eventViewer.switchEmitter":"Switch Emitter","eventViewer.inspect":"Inject to console: {}","listenerViewer.registeredListeners":"Registered Listeners","listenerViewer.refresh":"Refresh","listenerViewer.noRegisteredListeners":"No registered listeners","listenerViewer.nodeHasNoListeners":"This node has no listeners","listenerViewer.listener":"Listener: {0}","listenerViewer.executionCount":"Execution count: {0}/{1}","listenerViewer.tag":"Tag: {0}","listenerViewer.flags":"Flags: {0}","listenerViewer.retainedMessage":"Retained Message","listenerCard.invalidData":"Invalid listener data","listenerCard.listenerFunction":"Listener function","listenerCard.executionCount":"Execution count","listenerCard.tag":"Tag","listenerCard.flags":"Flags","listenerCard.returnValue":"Return value","listenerCard.clickToConsole":"Click to output listener info to console","listenerCard.clickToConsoleResult":"Click to show in console","listenerCard.anonymous":"anonymous"}},he="cn";function F(r=he){r in ce&&(he=r)}function l(r,...e){const t=ce[he]||ce.cn,s=r in t?t[r]:r,i=/\{[^}]*\}/g;let o=0;return s.replace(i,()=>o<e.length?String(e[o++]):i.exec(s)?.[0]||"")}function h(r,e,t,s){var i=arguments.length,o=i<3?e:s===null?s=Object.getOwnPropertyDescriptor(e,t):s,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(r,e,t,s);else for(var a=r.length-1;a>=0;a--)(n=r[a])&&(o=(i<3?n(o):i>3?n(e,t,o):n(e,t))||o);return i>3&&o&&Object.defineProperty(e,t,o),o}var z=class extends k{constructor(...e){super(...e),this.dark=!1,this.lang="cn",this._onAfterExecuteListener=(t,s,i)=>{De(t.type.split("/"),this.type.split("/"))&&this.requestUpdate()}}static{this.styles=ot}connectedCallback(){super.connectedCallback(),this._addListenerHook(),F(this.lang)}disconnectedCallback(){super.disconnectedCallback(),this._removeListenerHook()}willUpdate(e){super.willUpdate(e),e.has("lang")&&F(this.lang)}_addListenerHook(){this.emitter&&this.emitter.hooks.AfterExecuteListener.push(this._onAfterExecuteListener)}_removeListenerHook(){this.emitter&&R(this.emitter.hooks.AfterExecuteListener,this._onAfterExecuteListener)}_formatListenerCount(e){const[,t,s]=e;return t===0?`${s}/∞`:`${s}/${t}`}getFunctionPosition(e){const t=e.toString(),s=new Error().stack;console.group("函数定位"),console.log("函数代码:",t.substring(0,200)),console.log("当前调用栈:",s),console.groupEnd(),console.log(e)}_printListenerToConsole(e){const[t]=e;if(typeof t!="function"){console.warn(l("listenerCard.invalidData")),console.log("元数据:",{executed:`${e[2]}/${e[1]}`,tag:e[3],flags:e[4]});return}console.group("FastEvent Listener"),console.log(l("listenerViewer.listener",t.name||l("listenerCard.anonymous"))),console.log(t),console.log(l("listenerViewer.executionCount",e[2],e[1])),console.log(l("listenerViewer.tag",e[3])),e[4]!==void 0&&console.log(l("listenerViewer.flags",e[4])),console.groupEnd()}_printListenerResultToConsole(e){if(e.length===6){console.group("FastEvent Listener returns");const t=e[5]instanceof WeakRef?e[5].deref():e[5];console.log(t),console.groupEnd()}}_renderReturns(e){if(e.length===6&&e[5]){const t=e[5]instanceof WeakRef?e[5].deref():e[5];return d`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">${l("listenerCard.returnValue")}</div>
                        <div class="listener-cell listener-value" title="${l("listenerCard.clickToConsoleResult")}" style="cursor:pointer"
                        @click="${()=>this._printListenerResultToConsole(this.listener)}"
>${t instanceof Error?t.stack:JSON.stringify(t)}</div>
                    </div>
                `}}render(){if(!this.listener)return d`
                <div class="empty-state">${l("listenerCard.invalidData")}</div>
            `;const[e,,,t,s]=this.listener,i=e.name||l("listenerCard.anonymous");return d`
            <div class="listener-card">
                <div class="listener-row">
                    <div class="listener-cell listener-label">${l("listenerCard.listenerFunction")}</div>
                    <div class="listener-cell">
                        <span
                            class="listener-function"
                            @click="${()=>this._printListenerToConsole(this.listener)}"
                            title="${l("listenerCard.clickToConsole")}"
                        >
                            ${i}
                        </span>
                    </div>
                </div>
                <div class="listener-row">
                    <div class="listener-cell listener-label">${l("listenerCard.executionCount")}</div>
                    <div class="listener-cell listener-value">${this._formatListenerCount(this.listener)}</div>
                </div>
                ${t?d`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">${l("listenerCard.tag")}</div>
                        <div class="listener-cell">${w(t)}</div>
                    </div>
                `:""}
                ${s!==void 0?d`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">${l("listenerCard.flags")}</div>
                        <div class="listener-cell listener-value">${s}</div>
                    </div>
                `:""}
                ${this._renderReturns(this.listener)}
            </div>
        `}};h([f({attribute:!1})],z.prototype,"emitter",void 0),h([f({attribute:!1})],z.prototype,"listener",void 0),h([f({type:Boolean,reflect:!0})],z.prototype,"dark",void 0),h([f({type:String})],z.prototype,"type",void 0),h([f({type:String,reflect:!0})],z.prototype,"lang",void 0),z=h([Y("fastevent-listener-card")],z);var y=class extends k{constructor(...e){super(...e),this.dark=!1,this._selectedPath=[],this._listeners=[],this._expandedNodes=new Set,this.lang="cn",this._leftWidth="30%",this._isResizing=!1,this._resizeStartX=0,this._resizeStartWidth=0,this._onAddAfterListener=(t,s)=>{this.requestUpdate()},this._onRemoveListener=(t,s,i)=>{this.requestUpdate()},this._onClearListeners=()=>{this._handleRefresh()},this._handleResizeMove=t=>{if(!this._isResizing)return;const s=t.clientX-this._resizeStartX,i=this.shadowRoot?.querySelector(".main-container")?.offsetWidth||0,o=(this._resizeStartWidth+s)/i*100;this._leftWidth=`${Math.max(20,Math.min(80,o))}%`,this.style.setProperty("--fe-left-width",this._leftWidth)},this._handleResizeEnd=()=>{this._isResizing=!1,document.removeEventListener("mousemove",this._handleResizeMove),document.removeEventListener("mouseup",this._handleResizeEnd),this.shadowRoot?.querySelector(".resizer")?.classList.remove("dragging")}}static{this.styles=it}_getListenerNode(e){if(!this.emitter?.listeners||e.length===0)return null;let t=this.emitter.listeners;for(const s of e)if(t[s])t=t[s];else return null;return t}_findFirstNodeWithListeners(){if(!this.emitter?.listeners)return null;const e=(t,s)=>{if(t.__listeners&&t.__listeners.length>0)return s;for(const i in t){if(i==="__listeners")continue;const o=e(t[i],[...s,i]);if(o)return o}return null};return e(this.emitter.listeners,[])}_initializeExpandedNodes(){if(!this.emitter?.listeners)return;this._expandedNodes=new Set;const e=(t,s)=>{this._expandedNodes.add(s.join("/"));for(const i in t)i!=="__listeners"&&e(t[i],[...s,i])};e(this.emitter.listeners,[])}_refreshData(){if(this.emitter&&this._expandedNodes.size===0){this._initializeExpandedNodes();const e=this._findFirstNodeWithListeners();e&&(this._selectedPath=e,this._listeners=this._getListenerNode(e)?.__listeners||[])}else this._selectedPath.length>0&&(this._listeners=this._getListenerNode(this._selectedPath)?.__listeners||[])}_handleNodeSelect(e){const t=e.currentTarget.dataset.path;if(!t)return;const s=t.split("/");this._selectedPath=s,this._listeners=this._getListenerNode(s)?.__listeners||[],this.requestUpdate()}_setupHooks(){this.emitter&&(this.emitter.hooks.AddAfterListener.push(this._onAddAfterListener),this.emitter.hooks.RemoveListener.push(this._onRemoveListener),this.emitter.hooks.ClearListeners.push(this._onClearListeners))}_clearHooks(){this.emitter&&(R(this.emitter.hooks.AddAfterListener,this._onAddAfterListener),R(this.emitter.hooks.RemoveListener,this._onRemoveListener),R(this.emitter.hooks.ClearListeners,this._onClearListeners))}_handleNodeToggle(e){const t=e.currentTarget.closest("[data-path]")?.dataset.path;if(!t)return;const s=t;this._expandedNodes.has(s)?this._expandedNodes.delete(s):this._expandedNodes.add(s),this.requestUpdate()}_handleRefresh(){this._refreshData(),this.requestUpdate()}_handleResizeStart(e){this._isResizing=!0,this._resizeStartX=e.clientX,this._resizeStartWidth=this.shadowRoot?.querySelector(".tree-panel")?.offsetWidth||0,document.addEventListener("mousemove",this._handleResizeMove),document.addEventListener("mouseup",this._handleResizeEnd),this.shadowRoot?.querySelector(".resizer")?.classList.add("dragging")}_handleKeyDown(e){const t=e.currentTarget.dataset.path;if(!t)return;const s=t;switch(e.key){case"Enter":case" ":e.preventDefault(),this._handleNodeSelect(e);break;case"ArrowRight":e.preventDefault(),this._expandedNodes.has(s)||this._handleNodeToggle(e);break;case"ArrowLeft":e.preventDefault(),this._expandedNodes.has(s)&&this._handleNodeToggle(e);break}}_isEmptyNode(e){return Object.keys(e).length===1&&e.__listeners&&e.__listeners.length===0}renderTreeNode(e,t,s){const i=t.join("/"),o=this._expandedNodes.has(i),n=JSON.stringify(this._selectedPath)===JSON.stringify(t),a=Object.keys(e).filter(g=>g!=="__listeners"),c=a.length>0,m=e.__listeners?.length||0;return d`
            <div>
                <div
                    class="tree-node ${n?"selected":""}"
                    style="padding-left: ${s*8+8}px"
                    role="treeitem"
                    data-path="${i}"
                    aria-expanded="${c?o:!1}"
                    aria-selected="${n}"
                    tabindex="${n?"0":"-1"}"
                    @keydown="${this._handleKeyDown}"
                >
                    <span
                        class="tree-node-toggle ${o?"expanded":""} ${c?"":"hidden"}"
                        data-path="${i}"
                        @click="${this._handleNodeToggle}"
                    >
                        <span class="icon arrow"></span>
                    </span>
                    <span class="tree-node-content" data-path="${i}" @click="${this._handleNodeSelect}">
                        <span class="icon listeners"></span>
                        <span class="tree-node-label">${t[t.length-1]}</span>
                        ${this.emitter?.retainedMessages.has(i)?w("retain","red",l("listenerViewer.retainedMessage")):""}
                        ${m>0?d`
                            <span class="tree-node-badge">${m}</span>
                        `:""}
                    </span>
                </div>
                ${c&&o?d`
                    <div class="tree-children">
                        ${a.map(g=>{const p=[...t,g];return this.renderTreeNode(e[g],p,s+1)})}
                    </div>
                `:""}
            </div>
        `}renderTree(){const e=this.emitter?.listeners;return!e||this._isEmptyNode(e)?d`
                <div class="empty-state">
                    <span class="icon listeners"></span>
                    <p>${l("listenerViewer.noRegisteredListeners")}</p>
                </div>
            `:d`
            <div>
                ${Object.keys(e).filter(t=>t!=="__listeners").map(t=>this.renderTreeNode(e[t],[t],0))}
            </div>
        `}renderListener(e,t){return d`<fastevent-listener-card .listener="${e}" .emitter="${this.emitter}" .type="${t}" .dark="${this.dark}" .lang="${this.lang}"></fastevent-listener-card>`}renderListeners(){const e=this._selectedPath.join("/"),t=this.emitter?.retainedMessages.get(e);return d`
            <div>
                ${t?ct({message:t,pathKey:e,dark:this.dark,onDelete:s=>{this.emitter?.retainedMessages.delete(s),this.requestUpdate()},onPrint:s=>{console.group(l("listenerViewer.retainedMessage")),console.log(s),console.groupEnd()},onCopy:s=>{const i=JSON.stringify(s,null,2);navigator.clipboard.writeText(i)}}):""}
                ${this._listeners.length===0?d`
                              <div class="empty-state">
                                  <span class="icon listeners" style="--icon-size: 3em"></span>
                                  <p>${l("listenerViewer.nodeHasNoListeners")}</p>
                              </div>
                          `:d`
                        <div class="listeners-list">
                            ${this._listeners.map(s=>this.renderListener(s,e))}
                        </div>
                    `}
            </div>
        `}willUpdate(e){super.willUpdate(e),e.has("emitter")&&(this.emitter?this._refreshData():(this._listeners=[],this._selectedPath=[],this._expandedNodes=new Set)),e.has("lang")&&F(this.lang)}connectedCallback(){super.connectedCallback(),this.emitter&&(this._refreshData(),this._setupHooks())}disconnectedCallback(){super.disconnectedCallback(),this._isResizing&&(document.removeEventListener("mousemove",this._handleResizeMove),document.removeEventListener("mouseup",this._handleResizeEnd)),this._clearHooks()}render(){return d`
            <div class="toolbar">
                <span class="toolbar-title">${l("listenerViewer.registeredListeners")}</span>
                <button class="btn btn-icon" title="${l("listenerViewer.refresh")}" @click="${this._handleRefresh}">
                    <span class="icon refresh"></span>
                </button>
            </div>
            <div class="main-container">
                <div class="tree-panel" role="tree">
                    ${this.renderTree()}
                </div>
                <div class="resizer" @mousedown="${this._handleResizeStart}"></div>
                <div class="listeners-panel">
                    ${this.renderListeners()}
                </div>
            </div>
        `}};h([f({type:Object})],y.prototype,"emitter",void 0),h([f({type:Boolean,reflect:!0})],y.prototype,"dark",void 0),h([x()],y.prototype,"_selectedPath",void 0),h([x()],y.prototype,"_listeners",void 0),h([x()],y.prototype,"_expandedNodes",void 0),h([f({type:String,reflect:!0})],y.prototype,"lang",void 0),y=h([Y("fastevent-listeners")],y);var L=class extends k{constructor(...e){super(...e),this.dark=!1,this.showListeners=!1,this._localShowListeners=!1}createRenderRoot(){return this}_toggleListeners(){this._localShowListeners=!this._localShowListeners}_formatTime(e){const t=new Date(e);return`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}:${t.getSeconds().toString().padStart(2,"0")}.${t.getMilliseconds().toString().padStart(3,"0")}`}_renderLogFlags(e){if(e&&(e.flags||0)>0){const t=e.flags||0;return t>1?w(`${e.flags}`,"orange",l("eventViewer.extendedFlags"),void 0,this.dark):d`${(t|1)==0?"":w("T","orange",l("eventViewer.transformed"),void 0,this.dark)}`}}_formatResult(e){if(e===void 0)return l("eventViewer.executing");if(e===null)return"null";if(e instanceof Error)return l("eventViewer.error",e.message);if(typeof e=="object")try{const t=JSON.stringify(e);return t.length>100?t.substring(0,100)+"...":t}catch{return e.toString()}return String(e)}_renderListener(e){const t=e.status==="ok"?"yes":e.status,s=this._formatResult(e.result);return d`
            <div class="listener">
                ${I("listener",l("eventViewer.listener"))}
                <span class="listener-name" title="${l("eventViewer.listener")}" @click="${()=>this.onPrintListener?.(e)}">${e.name}</span>
                ${e.tag?w(e.tag,void 0,l("eventViewer.listenerTag",e.tag),void 0,this.dark):""}
                ${w(e.count,void 0,l("eventViewer.executionCount"),void 0,this.dark)}
                ${e.flags!==void 0?w(`${e.flags}`,"orange",l("eventViewer.listenerFlags"),void 0,this.dark):""}
                <span class="listener-status ${t}" title="${s}">
                    ${I(e.status==="running"?"loading":e.status==="ok"?"yes":e.status)}
                </span>
            </div>
        `}_renderListeners(e){return d`${e.map(t=>this._renderListener(t))}`}render(){const e=this.log.message.deref(),t=this.log.args.deref();if(!e)return d``;const s=JSON.stringify(e.payload??""),i=this._formatTime(this.log.triggerTime);return d`
            <div class="log-item">
                <div class="log-content">
                    <div class="log-header">
                        ${this.log.done?"✨":I("loading")}
                        <span class="log-type" title="${l("eventViewer.eventType")}">${e.type}</span>
                        <span class="log-time" title="${l("eventViewer.triggerTime")}">${i}</span>
                        ${w(`#${this.log.id}`,"gray",l("eventViewer.serialNumber"),void 0,this.dark)}
                        ${this.showListeners?"":d`<span
                                  class="tag-clickable"
                                  style="cursor: pointer;"
                                  @click="${()=>this._toggleListeners()}">${w(`ƒ(${this.log.listeners.length})`,"purple",l("eventViewer.totalListeners",this.log.listeners.length),void 0,this.dark)}</span>`}
                        ${t?.retain?w("retain","red",l("eventViewer.retainLastEvent"),void 0,this.dark):""}
                        ${this._renderLogFlags(t)}
                        ${t?.rawEventType&&t?.rawEventType!==e.type?w(t.rawEventType,"blue",l("eventViewer.rawEventType",t.rawEventType),void 0,this.dark):""}
                        ${this.log.duration[1]>0?w(`${Number((this.log.duration[1]-this.log.duration[0]).toFixed(3))}ms`,"green",l("eventViewer.executionTime"),void 0,this.dark):""}
                        ${E("",()=>{const o=JSON.stringify(e,null,2);navigator.clipboard.writeText(o)},{icon:"copy",className:"btn-icon",title:l("eventViewer.copyMessage")})}
                    </div>
                    ${s?d`<div class="log-payload">${s}</div>`:""}
                    ${this.log.listeners.length>0?d`
                        <div class="log-listeners ${this.showListeners||this._localShowListeners?"log-listeners-visible":"log-listeners-hidden"}">
                            ${this._renderListeners(this.log.listeners)}
                        </div>
                    `:""}
                </div>
            </div>
        `}};h([f({type:Object})],L.prototype,"log",void 0),h([f({type:Boolean})],L.prototype,"dark",void 0),h([f({type:Boolean})],L.prototype,"showListeners",void 0),h([f({type:Number,attribute:!1})],L.prototype,"updateVersion",void 0),h([f({attribute:!1})],L.prototype,"onPrintListener",void 0),h([x()],L.prototype,"_localShowListeners",void 0),L=h([Y("fastevent-event-log")],L);var v=class extends k{constructor(...e){super(...e),this._emitters=[],this._currentEmitterIndex=0,this._isDropdownOpen=!1,this._emitterLogs=new Map,this._emitterLogIndexes=new Map,this.dark=!1,this.enable=!0,this.maxSize=500,this.title="",this.lang="cn",this.showListeners=!0,this._filterText="",this._showListeners=!1,this._isShowListeners=!1,this.messages=[],this.logs=[],this._logIndexs=[],this._handleDocumentClick=t=>{const s=t.target,i=this.renderRoot?.querySelector(".emitter-dropdown-container");i&&!i.contains(s)&&(this._isDropdownOpen=!1,this.requestUpdate())},this._onBeforeExecuteListener=(t,s)=>{const i=this._getCurrentEmitter();if(!i||!this.enable)return;const o=(i.getListeners(t.type)||[]).map(a=>this._getListenerMeta(a,"running")),n={message:new WeakRef(t),done:!1,args:new WeakRef(s),triggerTime:Date.now(),duration:[performance.now(),0],listeners:o,updateVersion:0};n.id=this.logs.length+1,t.__index=n.id-1,this.logs.push(n),this._logIndexs.unshift(this.logs.length-1),this.maxSize>0&&this.logs.length>this.maxSize&&(this.logs.shift(),this._updateFilteredLogs()),this.requestUpdate()},this._onAfterExecuteListener=(t,s,i)=>{if(!this.enable)return;const o=t.__index;if(typeof o=="number"){const n=this.logs[o];n&&(n.done=!0,n.duration[1]=performance.now());const a=i.reduce((m,g)=>(g.__listeners.forEach(p=>{m.push(this._getListenerMeta(p))}),m),[]),c=o;c!==-1&&(this.logs[c].listeners=a,this.logs[c].updateVersion++,s.map((m,g)=>{const p=this.logs[c].listeners[g];if(p){try{p.result=structuredClone(m)}catch{p.result=m}m instanceof Error?p.status="error":p.status="ok"}})),delete t.__index}this.requestUpdate()}}static{this.styles=st}get emitter(){return this._emitters.length===1?this._emitters[0]:this._emitters}set emitter(e){const t=Array.isArray(e)?e:e?[e]:[],s=this._emitters;this._emitters=t,this._currentEmitterIndex>=this._emitters.length&&(this._currentEmitterIndex=0),(s.length!==t.length||s.some((i,o)=>i!==t[o]))&&this._reattach(),this.requestUpdate("emitter",s.length===1?s[0]:s)}connectedCallback(){super.connectedCallback(),F(this.lang),this._attach(),document.addEventListener("click",this._handleDocumentClick)}disconnectedCallback(){this._detach(),document.removeEventListener("click",this._handleDocumentClick)}willUpdate(e){e.has("_filterText")&&this._updateFilteredLogs(),e.has("showListenersInLog")&&(this._isShowListeners=this.showListeners),e.has("lang")&&F(this.lang)}_getCurrentEmitter(){return this._emitters[this._currentEmitterIndex]}_switchEmitter(e){e!==this._currentEmitterIndex&&(this._emitterLogs.set(this._currentEmitterIndex,[...this.logs]),this._emitterLogIndexes.set(this._currentEmitterIndex,[...this._logIndexs]),this._currentEmitterIndex=e,this.logs=this._emitterLogs.get(e)||[],this._logIndexs=this._emitterLogIndexes.get(e)||[],this._reattach(),this._isDropdownOpen=!1,this.requestUpdate())}_reattach(){this._detach(),this.clear(),this._attach()}_updateFilteredLogs(){const e=this._filterText.toLowerCase().trim();if(!e){this._logIndexs=this.logs.map((t,s)=>s).reverse();return}this._logIndexs=this.logs.map((t,s)=>({log:t,index:s})).filter(({log:t})=>{const s=t.message.deref();return s?s.type.toLowerCase().includes(e):!1}).map(({index:t})=>t).reverse()}_getListenerMeta(e,t){if(t===void 0)if(e.length===6){let s;const i=e[5];i instanceof WeakRef?s=i.deref():s=i,s instanceof Error?t="error":t="ok"}else t="ok";return{status:t,fn:new WeakRef(e[0]),name:e[0].name||"anonymous",count:`${e[2]}/${e[1]===0?"∞":e[1]}`,tag:e[3],flags:e[4],result:e[5]}}_attach(){const e=this._getCurrentEmitter();if(e){const t=e.options;e.hooks.BeforeExecuteListener.push(this._onBeforeExecuteListener),e.hooks.AfterExecuteListener.push(this._onAfterExecuteListener),t.debug=!0}}_detach(){const e=this._getCurrentEmitter();if(e){R(e.hooks.BeforeExecuteListener,this._onBeforeExecuteListener),R(e.hooks.AfterExecuteListener,this._onAfterExecuteListener);const t=e.options;t.debug=!1}}clear(){this.logs=[],this._logIndexs=[],this.messages=[],this.requestUpdate()}_printListenerInfo(e){const t=e.fn.deref();typeof t=="function"&&(console.group("FastEvent Listener"),console.log(l("eventViewer.listener",t.name||"anonymous")),console.log(t),console.log(l("eventViewer.executionResult"),e.result),console.groupEnd())}renderFilter(){return d`<input
            type="text"
            class="filter-input"
            placeholder="${l("eventViewer.filterPlaceholder")}"
            .value="${this._filterText}"
            @input="${e=>{this._filterText=e.target.value}}"
        />`}_renderEmitterMenu(){return d`
            <div class="emitter-dropdown-menu">
                ${this._emitters.map((e,t)=>{const s=t===this._currentEmitterIndex,i=this.title.length>0?this.title:e?.title||`Emitter ${t+1}`;return d`
                        <div
                            class="emitter-menu-item ${s?"active":""}"
                            @click="${()=>this._switchEmitter(t)}"
                        >
                            <span class="menu-item-icon">${s?I("yes"):""}</span>
                            <span class="menu-item-label">${i}</span>
                        </div>
                    `})}
            </div>
        `}_getEmitterVarName(){return"$emitter"}_injectEmitterToConsole(){const e=this._getEmitterVarName(),t=this._getCurrentEmitter();t&&(window[e]=t,console.log("FastEvent instance: ",`${e}=`,t))}renderHeader(){const e=this._emitters.length>1,t=this._getCurrentEmitter(),s=this.title.length>0?this.title:t?.title||"";return d`
            <div class="header">
                ${e?d`
                        <div class="emitter-dropdown-container">
                            <button
                                class="emitter-dropdown-trigger"
                                @click="${i=>{this._isDropdownOpen=!this._isDropdownOpen,i.stopPropagation(),this.requestUpdate()}}"
                                title="${l("eventViewer.switchEmitter")}"
                            >
                                <span class="header-title">${s}                                    
                                </span>
                                <span class="dropdown-arrow ${this._isDropdownOpen?"open":""}"></span>
                            </button>
                            ${this._isDropdownOpen?this._renderEmitterMenu():""}
                        </div>
                        <span class="emitter-dropdown-spacer"></span>
                      `:d`<span class="header-title">${s}</span>`}
                ${E("",()=>this._injectEmitterToConsole(),{icon:"inspect",className:"btn-icon",title:l("eventViewer.inspect",this._getEmitterVarName())})}
                ${E("",()=>{this.dark=!this.dark},{icon:"dark",className:"btn-icon"+(this._showListeners?" btn-pressed":""),title:this.dark?l("eventViewer.normalMode"):l("eventViewer.darkMode")})}
                ${E("",()=>{this._showListeners=!this._showListeners},{icon:"listeners",className:"btn-icon"+(this._showListeners?" btn-pressed":""),title:this._showListeners?l("eventViewer.showEvent"):l("eventViewer.showListeners")})}
            </div>
        `}renderToolbar(){return d`
            <div class="toolbar">
                ${this.renderFilter()}
                <span class="toolbar-spacer">${l("eventViewer.totalLogs",this._logIndexs.length)}</span>
                ${E("",()=>{this._isShowListeners=!this._isShowListeners,this.requestUpdate()},{icon:"listener",className:"btn-icon"+(this._isShowListeners?" btn-pressed":""),title:this._isShowListeners?l("eventViewer.hideListenerDetails"):l("eventViewer.showListenerDetails")})}
                <button class="btn btn-icon" title="${l("eventViewer.clear")}" @click="${()=>this.clear()}">
                    <span class="icon clear"></span>
                </button>
            </div>
        `}renderLogs(){return this._logIndexs.length===0?d`
                <div class="empty-state">
                    ${I("file")}
                    <p>${l("eventViewer.noEventLogs")}</p>
                </div>
            `:d`
            <div class="logs">
                ${this._logIndexs.map(e=>{const t=this.logs[e];return d`
                        <fastevent-event-log
                            .log="${t}"
                            .dark="${this.dark}"
                            .showListeners="${this._isShowListeners}"
                            .updateVersion="${t.updateVersion}"
                            .onPrintListener="${this._printListenerInfo}">
                        </fastevent-event-log>
                    `})}
            </div>
        `}render(){return d`
            ${this.renderHeader()}
            ${this._showListeners?d`<fastevent-listeners
                        .emitter="${this._getCurrentEmitter()}"
                        .dark="${this.dark}"
                        .lang="${this.lang}"
                        style="flex-grow:1">
                    </fastevent-listeners>`:d`${this.renderToolbar()}${this.renderLogs()}`}
        `}};return h([x()],v.prototype,"_emitters",void 0),h([x()],v.prototype,"_currentEmitterIndex",void 0),h([x()],v.prototype,"_isDropdownOpen",void 0),h([f({type:Object})],v.prototype,"emitter",null),h([f({type:Boolean,reflect:!0})],v.prototype,"dark",void 0),h([f({type:Boolean,reflect:!0})],v.prototype,"enable",void 0),h([f({type:Number})],v.prototype,"maxSize",void 0),h([f({type:String})],v.prototype,"title",void 0),h([f({type:String,reflect:!0})],v.prototype,"lang",void 0),h([f({type:Boolean})],v.prototype,"showListeners",void 0),h([x()],v.prototype,"_filterText",void 0),h([x()],v.prototype,"_showListeners",void 0),h([x()],v.prototype,"_isShowListeners",void 0),v=h([Y("fastevent-viewer")],v),Object.defineProperty(B,"FastEventListeners",{enumerable:!0,get:function(){return y}}),Object.defineProperty(B,"FastEventViewer",{enumerable:!0,get:function(){return v}}),B})({});

//# sourceMappingURL=index.js.map