var FasteventViewer=(function(I){Object.defineProperty(I,Symbol.toStringTag,{value:"Module"});var ve=Object.defineProperty,dt=(s,e,t)=>e in s?ve(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,h=(s,e)=>ve(s,"name",{value:e,configurable:!0}),f=(s,e,t)=>dt(s,typeof e!="symbol"?e+"":e,t),Wt=Symbol.for("__FastEvent__"),qt=Symbol.for("__FastEventScope__"),_e=class extends Error{constructor(e){super(e)}};h(_e,"FastEventError");var O=_e,be=class extends O{};h(be,"TimeoutError");var Vt=be,xe=class extends O{};h(xe,"UnboundError");var ht=xe,ye=class extends O{};h(ye,"AbortError");var te=ye,$e=class extends O{};h($e,"CancelError");var we=$e,ct=class extends O{};h(ct,"QueueOverflowError");var W=(function(s){return s[s.Transformed=1]="Transformed",s})({});function se(s,e,t,r){let i,o={},n={};return typeof s[0]=="object"?(Object.assign(n,s[0]),o=typeof s[1]=="boolean"?{retain:s[1]}:s[1]||{},i=s[0].meta):(n.type=s[0],n.payload=s[1],o=typeof s[2]=="boolean"?{retain:s[2]}:s[2]||{}),i=Object.assign({},e,t,o.meta,i),Object.keys(i).length===0?(i=void 0,delete n.meta):n.meta=i,o.executor===void 0&&(o.executor=r),[n,o]}h(se,"parseEmitArgs");function ke(s){return s?typeof s=="object"&&"__FastEventScope__"in s:!1}h(ke,"isFastEventScope");function re(s,e,t){let r=s[0],i=ke(s[1])?s[1]:void 0,o=(i?s[2]:s[1])||{};return o.meta=Object.assign({},e,o?.meta),o.context=o.context!==void 0?o.context:t,[r,i,o]}h(re,"parseScopeArgs");function q(s,e){return Object.defineProperty(s,"name",{value:e||"anonymous",configurable:!0}),s}h(q,"renameFn");function b(s){return s&&typeof s=="function"}h(b,"isFunction");var Ee=class nt{constructor(e){f(this,"__FastEventScope__",!0),f(this,"__events__"),f(this,"__meta__"),f(this,"__context__"),f(this,"_options",{}),f(this,"prefix",""),f(this,"emitter"),this._options=Object.assign({},this._initOptions(e))}get context(){return this.options.context||this}get options(){return this._options}get listeners(){return this.emitter.getListeners(this.prefix)}bind(e,t,r){this.emitter=e,this._options=Object.assign(this._options,{scope:t},r),t.length>0&&!t.endsWith(e.options.delimiter)&&(this.prefix=t+e.options.delimiter)}_initOptions(e){return e}_getScopeListener(e){let t=this.prefix;if(t.length===0)return e;if(!e)throw new Error;let r=this;return q(function(i,o){let n=o.rawEventType||i.type;if(n.startsWith(t)){let a=((o.flags||0)&W.Transformed)>0?i:Object.assign({},i,{type:n.substring(t.length)});return e.call(r.context,a,o)}},e.name)}_getScopeType(e){return e===void 0?void 0:this.prefix+e}_fixScopeType(e){return e.startsWith(this.prefix)?e.substring(this.prefix.length):e}on(){if(!this.emitter)throw new ht;let e=[...arguments];return e[0]=this._getScopeType(e[0]),e[1]=this._getScopeListener(e[1]),this.emitter.on(...e)}once(){return this.on(arguments[0],arguments[1],Object.assign({},arguments[2],{count:1}))}onAny(){return this.on("**",...arguments)}off(){let e=arguments;typeof e[0]=="string"&&(e[0]=this._getScopeType(e[0])),this.emitter.off(...e)}offAll(){this.emitter.offAll(this.prefix.substring(0,this.prefix.length-1))}clear(){this.emitter.clear(this.prefix.substring(0,this.prefix.length-1))}emit(){let[e,t]=se(arguments,this.emitter.options.meta,this.options.meta,this.options.executor);return this._transformMessage(e,t),e.type=this._getScopeType(e.type),this.emitter.emit(e,t)}_transformMessage(e,t){b(this._options.transform)&&(t.rawEventType=this._getScopeType(e.type),t.flags=(t.flags||0)|W.Transformed,e.payload=this._options.transform.call(this,e))}async emitAsync(){return(await Promise.allSettled(this.emit.apply(this,arguments))).map(e=>e.status==="fulfilled"?e.value:e.reason)}async waitFor(){let e=arguments[0],t=arguments[1],r=await this.emitter.waitFor(this._getScopeType(e),t);return Object.assign({},r,{type:this._fixScopeType(r.type)})}scope(){let[e,t,r]=re(arguments,this.options.meta,this.options.context),i;return t?i=t:i=new nt,i.bind(this.emitter,this.prefix+e,r),i}};h(Ee,"FastEventScope");var pt=Ee;function V(s,e){let t=s.length,r=e.length;if(t!==r&&(r===0||e[r-1]!=="**"))return!1;if(r>0&&e[r-1]==="**"){for(let i=0;i<r-1;i++)if(e[i]!=="*"&&e[i]!==s[i])return!1;return!0}for(let i=0;i<t;i++)if(e[i]!=="*"&&e[i]!==s[i])return!1;return!0}h(V,"isPathMatched");function Ae(s,e){let t=[];for(let r=s.length-1;r>=0;r--)e(s[r])&&(t.push(r),s.splice(r,1));return t.reverse()}h(Ae,"removeItem");function ft(s){return s?typeof s=="object"&&"type"in s:!1}h(ft,"isFastEventMessage");function ut(s){return s&&typeof s=="string"}h(ut,"isString");var Se=Symbol.for("__expandable__");function gt(s){return s[Se]=!0,s}h(gt,"expandable");function Le(s){return s&&s[Se]}h(Le,"isExpandable");function Ce(s){return s&&typeof s=="object"&&"off"in s&&"listener"in s}h(Ce,"isSubsctiber");function mt(s){return typeof s=="function"&&(s.toString().startsWith("class ")||s.prototype?.constructor===s)}h(mt,"isClass");function vt(s){return s?typeof s=="object"&&"__FastEvent__"in s:!1}h(vt,"isFastEvent");function Me(s){if(s===null||typeof s!="object")return!1;let e=s;return typeof e[Symbol.asyncIterator]=="function"||typeof e["@@asyncIterator"]=="function"}h(Me,"isAsyncIterable");var _t=h(()=>(s,e,t,r)=>s.map((i,o)=>r.call(s[o],i,e,t,!0)),"parallel");function Pe(s){for(let e=0;e<s.length;e++){let t=s[e];Array.isArray(t)&&Le(t)&&(s.splice(e,1,...t),e+=t.length-1)}return s}h(Pe,"expandEmitResults");function ze(s,e){return s.catch(t=>(e&&e(t),Promise.resolve(t)))}h(ze,"tryReturnError");var Te=class{constructor(e,t,r={}){f(this,"eventEmitter"),f(this,"eventName"),f(this,"buffer",[]),f(this,"resolvers",[]),f(this,"errorResolvers",[]),f(this,"isStopped",!1),f(this,"error",null),f(this,"options"),f(this,"currentSize"),f(this,"hasNewMessage",!1),f(this,"_listener"),f(this,"_ready",!1),f(this,"_listenOptions"),f(this,"_cleanups",[]),this.eventEmitter=e,this.eventName=t,this.options={size:r.size??20,maxExpandSize:r.maxExpandSize??100,expandOverflow:r.expandOverflow??"slide",overflow:r.overflow??"slide",lifetime:r.lifetime??0,onPush:r.onPush,onPop:r.onPop,onDrop:r.onDrop,onError:r.onError??(()=>!0),signal:r.signal},this.currentSize=this.options.size,this._listener=this.onMessage.bind(this)}get listener(){return this._listener}get ready(){return this._ready}create(e){if(!this._ready){this._listenOptions=e;try{let t=this.eventEmitter.on(this.eventName,this._listener,e);if(this._cleanups.push(()=>t.off()),this.options.signal&&!this.options.signal.aborted){let r=h(()=>{this.off(!0)},"offFn");this.options.signal.addEventListener("abort",r),this._cleanups.push(()=>{this.options.signal.removeEventListener("abort",r)})}}finally{this._ready=!0}}}push(e){this.options.onPush?this.options.onPush(e,this.buffer):this.buffer.push(this.options.lifetime>0?[e,Date.now()]:[e,0])}handleOverflow(e){switch(this.buffer.length>=this.options.maxExpandSize&&this.options.overflow==="expand"?this.options.expandOverflow:this.options.overflow){case"drop":return this.options.onDrop&&this.options.onDrop(e),!1;case"expand":return this.currentSize=Math.min(this.currentSize+this.options.size,this.options.maxExpandSize),this.push(e),!0;case"slide":let t=this.buffer.shift();return this.options.onDrop&&t&&this.options.onDrop(t[0]),this.push(e),!0;case"throw":throw this.options.onDrop&&this.options.onDrop(e),new Error(`EventIterator queue overflow: buffer size (${this.currentSize}) exceeded`);default:return!1}}onMessage(e,t){if(this.isStopped)return;let r=e;if(this.resolvers.length>0){this.resolvers.shift()({value:r,done:!1});return}this.hasNewMessage=!0,this.buffer.length<this.currentSize?this.push(r):this.handleOverflow(r)}off(e){this._ready&&(this.isStopped||(this.isStopped=!0,this._cleanups.forEach(t=>t()),this._cleanups=[],this.buffer=[],this._ready=!1,e?(this.errorResolvers.forEach(t=>{t(new te)}),this.errorResolvers=[]):(this.resolvers.forEach(t=>{t({value:void 0,done:!0})}),this.resolvers=[]),this._ready=!1))}async next(){if(this.error)return Promise.reject(this.error);if(this.isStopped&&this.buffer.length===0)return{value:void 0,done:!0};if(this.buffer.length>0){let e,t;if(this.options.onPop){let r=this.options.onPop(this.buffer,this.hasNewMessage);r?[e,t]=r:[e,t]=this.buffer.shift()||[void 0,0]}else[e,t]=this.buffer.shift()||[void 0,0];if(this.hasNewMessage=!1,e!==void 0)return this.options.lifetime>0&&Date.now()-t>this.options.lifetime?(this.options.onDrop&&this.options.onDrop(e),this.next()):{value:e,done:!1}}return new Promise((e,t)=>{this.resolvers.push(e),this.errorResolvers.push(t)})}[Symbol.asyncIterator](){return this}async done(){return this.off(),{value:void 0,done:!0}}async throw(e){return this.error=e,this.off(),Promise.reject(e)}async return(){return this.off(),{value:void 0,done:!0}}[Symbol.dispose](){this.off()}on(){this.create(this._listenOptions),this.isStopped=!1}};h(Te,"FastEventIterator");var bt=Te;function Re(s,e,t={}){return new bt(s,e,t)}h(Re,"createAsyncEventIterator");function Ne(s,e){return Array.isArray(e)&&e.forEach(t=>{s=q(t(s),s.name)}),s}h(Ne,"wrapPipeListener");function J(s){return s!==null&&(typeof s=="object"||typeof s=="function")?new WeakRef(s):s}h(J,"getWeakRef");function ie(s){return s.map(e=>e.status==="fulfilled"?e.value:e.reason)}h(ie,"getPromiseResults");function je(s){if(s==null)return!1;let e=typeof s;return e!=="object"&&e!=="function"?!1:typeof s.then=="function"}h(je,"isPromise");async function Oe(s){try{return s instanceof Promise?await s:s}catch(e){return e instanceof Error?e:new Error(String(e))}}h(Oe,"resolveValue");var xt=class{constructor(e){f(this,"__FastEvent__",!0),f(this,"listeners",{__listeners:[]}),f(this,"_options"),f(this,"_delimiter","/"),f(this,"_context"),f(this,"_hooks"),f(this,"retainedMessages",new Map),f(this,"listenerCount",0),f(this,"types",null),this._options=Object.assign({debug:!1,id:Math.random().toString(36).substring(2),delimiter:"/",context:null,ignoreErrors:!0,meta:void 0,expandEmitResults:!0,executor:_t()},this._initOptions(e)),this._delimiter=this._options.delimiter,this._context=this._options.context}get options(){return this._options}get context(){return this.options.context||this}get meta(){return this.options.meta}get id(){return this._options.id}get title(){return this._options.title||this.id||"FastEvent"}get hooks(){return this._hooks||(this._hooks={AddBeforeListener:[],AddAfterListener:[],RemoveListener:[],ClearListeners:[],ListenerError:[],BeforeExecuteListener:[],AfterExecuteListener:[]}),this._hooks}_execAfterExecuteListener(e,t){Promise.allSettled(t[1]).then(r=>{t[1]=ie(r),e.apply(this,t)})}_executeHooks(e,t,r=!1){if(setTimeout(()=>{if(!this._hooks)return;let i=this.hooks[e];Array.isArray(i)&&i.length>0&&Promise.allSettled(i.map(o=>{if(e==="AfterExecuteListener")this._execAfterExecuteListener(o,t);else return o.apply(this,t)}))}),!r){let i=this.options[`on${e}`];if(b(i))if(e==="AfterExecuteListener")this._execAfterExecuteListener(i,t);else return i.apply(this,t)}}_initOptions(e){return e}_addListener(e,t,r){let{count:i,prepend:o}=r,n=0;return[this._forEachNodes(e,a=>{let l=[t,i,0,r.tag,r.flags];o?(a.__listeners.splice(0,0,l),n=0):(a.__listeners.push(l),n=a.__listeners.length-1),this.listenerCount++}),n]}_forEachNodes(e,t){if(e.length===0)return;let r=this.listeners;for(let i=0;i<e.length;i++){let o=e[i];if(o in r||(r[o]={__listeners:[]}),i===e.length-1){let n=r[o];return t(n,r),n}else r=r[o]}}_removeListener(e,t,r){r&&Ae(e.__listeners,i=>{i=Array.isArray(i)?i[0]:i;let o=i===r;return o&&(this.listenerCount--,this._executeHooks("RemoveListener",[t.join(this._delimiter),r,e])),o})}on(){let e=arguments[0],t=null,r,i=!b(arguments[1]);i?r=arguments[1]||{}:(t=arguments[1],r=arguments[2]||{});let o=Object.assign({count:0,flags:0,prepend:!1},r);if(e.length===0)throw new Error("event type cannot be empty");if(i||t===null){let d=Object.assign({overflow:"expand",size:10,maxExpandSize:100},o.iterable),_=Re(this,e,d);_.create(o);let v=this._executeHooks("AddBeforeListener",[e,_.listener,o]);if(v===!1)throw new we;return Me(v)?v:_}let n=this._executeHooks("AddBeforeListener",[e,t,o]);if(n===!1)throw new we;if(Ce(n))return n;let a=e.split(this._delimiter);if(o.pipes&&o.pipes.length>0&&(t=Ne(t,o.pipes)),b(o.filter)||b(o.off)){let d=t,_=h(()=>l&&this._removeListener(l,a,t),"off");t=q(function(v,k){if(b(o.off)&&o.off.call(this,v,k)){_();return}if(b(o.filter)){if(o.filter.call(this,v,k))return d.call(this,v,k)}else return d.call(this,v,k)},t.name)}let[l,u]=this._addListener(a,t,o),p=h(()=>l&&this._removeListener(l,a,t),"off");return this._executeHooks("AddAfterListener",[e,l]),this._emitRetainMessage(e,l,u),{off:p,listener:t,[Symbol.dispose](){p()}}}once(){return b(arguments[1])?this.on(arguments[0],arguments[1],Object.assign({},arguments[2],{count:1})):this.on(arguments[0],Object.assign({},arguments[2],{count:1}))}onAny(){return this.on("**",...arguments)}off(){let e=arguments,t=b(e[0])?void 0:e[0],r=b(e[0])?e[0]:e[1],i=t?t.split(this._delimiter):[],o=t?t.includes("*"):!1;if(t&&!o)this._traverseToPath(this.listeners,i,n=>{r?this._removeListener(n,i,r):t&&(n.__listeners=[])});else{let n=o?[]:i;this._traverseListeners(this.listeners,n,(a,l)=>{(r!==void 0||o&&V(a,i))&&(r?this._removeListener(l,i,r):l.__listeners=[])})}}offAll(e){if(e){let t=e.split(this._delimiter),r=0;this._traverseListeners(this.listeners,t,(i,o)=>{r+=o.__listeners.length;try{o.__listeners.forEach(n=>{this._executeHooks("RemoveListener",[i.join(this.options.delimiter),n[0],o])})}finally{o.__listeners=[]}}),this.listenerCount-=r,this._removeRetainedEvents(e)}else try{let t=0;this._traverseListeners(this.listeners,[],(r,i)=>{t+=i.__listeners.length}),this.listenerCount-=t,this.retainedMessages.clear(),this.listeners={__listeners:[]}}finally{this._executeHooks("ClearListeners",[])}}_removeRetainedEvents(e){e||this.retainedMessages.clear(),e?.endsWith(this._delimiter)&&(e+=this._delimiter),this.retainedMessages.delete(e);for(let t of this.retainedMessages.keys())t.startsWith(e)&&this.retainedMessages.delete(t)}clear(e){this.offAll(e),this._removeRetainedEvents(e)}_emitRetainMessage(e,t,r){let i=[];if(e.includes("*")){let o=e.split(this._delimiter);this.retainedMessages.forEach((n,a)=>{V(a.split(this._delimiter),o)&&i.push(n)})}else this.retainedMessages.has(e)&&i.push(this.retainedMessages.get(e));t&&i.forEach(o=>{this._executeListeners([t],o,{},n=>n[0]===t.__listeners[r][0])})}_traverseToPath(e,t,r,i=0,o){if(i>=t.length){r(e);return}let n=t[i];if(o===!0){this._traverseToPath(e,t,r,i+1,!0);return}"*"in e&&this._traverseToPath(e["*"],t,r,i+1),"**"in e&&this._traverseToPath(e["**"],t,r,i+1,!0),n in e&&this._traverseToPath(e[n],t,r,i+1)}_traverseListeners(e,t,r){let i=e;t&&t.length>0&&this._traverseToPath(e,t,n=>{i=n});let o=h((n,a,l)=>{a(l,n);for(let[u,p]of Object.entries(n))u.startsWith("__")||p&&o(p,a,[...l,u])},"traverseNodes");o(i,r,[])}_onListenerError(e,t,r,i){if(i instanceof Error&&(i._emitter=`${e.name||"anonymous"}:${t.type}`),this._executeHooks("ListenerError",[i,e,t,r]),this._options.ignoreErrors)return i;throw i}_executeListener(e,t,r,i=!1){let o=e[0];try{if(this.options.debug&&(e.length=5),r&&r.abortSignal&&r.abortSignal.aborted)return this._onListenerError(o,t,r,new te(e[0].name));let n=((r?.flags||0)&W.Transformed)>0,a=o.call(this.context,n?t.payload:t,r);return i&&a&&a instanceof Promise&&(a=ze(a,l=>this._onListenerError(o,t,r,l))),this.options.debug&&(Promise.resolve(a),je(a)?Oe(a).then(l=>{e[5]=J(l)}):e[5]=J(a)),a}catch(n){let a=this._onListenerError(o,t,r,n);return a instanceof Error&&(e[5]=J(a)),a}}_getListenerExecutor(e){if(!e)return;let t=e.executor||this._options.executor;if(b(t))return t}_executeListeners(e,t,r,i){if(!e||e.length===0)return[];let o=[];for(let a of e){let l=0;for(let u of a.__listeners)(!i||i(u,a))&&o.push([u,l++,a.__listeners])}this._decListenerExecCount(o);let n=this._getListenerExecutor(r);if(n){let a=n(o.map(l=>l[0]),t,r,this._executeListener.bind(this));return Array.isArray(a)?a:[a]}else return o.map(a=>this._executeListener(a[0],t,r,!0))}_decListenerExecCount(e){for(let t=e.length-1;t>=0;t--){let r=e[t][0];r[2]++,r[1]>0&&r[1]<=r[2]&&e[t][2].splice(t,1)}}getListeners(e){let t=[],r=e.split(this._delimiter);this._traverseToPath(this.listeners,r,o=>{t.push(o)});let i=[];return t.map(o=>{i.push(...o.__listeners)}),i}clearRetainMessages(e){e?this.retainedMessages.delete(e):this.retainedMessages.clear()}emit(){let[e,t]=se(arguments,this.options.meta);b(t.parseArgs)&&t.parseArgs(e,t);let r=e.type.split(this._delimiter);t.retain&&this.retainedMessages.set(e.type,e);let i=[],o=[];this._traverseToPath(this.listeners,r,a=>{o.push(a)});let n=this._executeHooks("BeforeExecuteListener",[e,t]);if(Array.isArray(n))return n;if(n===!1)throw new te(e.type);if(b(this._options.transform)){let a=this._options.transform.call(this,e);a!==e&&(e.payload=a,t.rawEventType=e.type,t.flags=(t.flags||0)|W.Transformed)}return i.push(...this._executeListeners(o,e,t)),this._options.expandEmitResults&&Pe(i),this._executeHooks("AfterExecuteListener",[e,i,o]),i}async emitAsync(){return ie(await Promise.allSettled(this.emit.apply(this,arguments)))}waitFor(){let e=arguments[0],t=arguments[1];return new Promise((r,i)=>{let o,n,a=h(l=>{clearTimeout(o),n?.off(),r(l)},"listener");t&&t>0&&(o=setTimeout(()=>{n?.off(),i(new Error("wait for event<"+e+"> is timeout"))},t)),n=this.on(e,a)})}scope(){let[e,t,r]=re(arguments,this.options.meta,this.options.context),i;return t?i=t:i=new pt,i.bind(this,e,r),i}};h(xt,"FastEvent");var K=globalThis,oe=K.ShadowRoot&&(K.ShadyCSS===void 0||K.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ne=Symbol(),He=new WeakMap,Ue=class{constructor(s,e,t){if(this._$cssResult$=!0,t!==ne)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=s,this.t=e}get styleSheet(){let s=this.o;const e=this.t;if(oe&&s===void 0){const t=e!==void 0&&e.length===1;t&&(s=He.get(e)),s===void 0&&((this.o=s=new CSSStyleSheet).replaceSync(this.cssText),t&&He.set(e,s))}return s}toString(){return this.cssText}},yt=s=>new Ue(typeof s=="string"?s:s+"",void 0,ne),X=(s,...e)=>new Ue(s.length===1?s[0]:e.reduce((t,r,i)=>t+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+s[i+1],s[0]),s,ne),$t=(s,e)=>{if(oe)s.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const r=document.createElement("style"),i=K.litNonce;i!==void 0&&r.setAttribute("nonce",i),r.textContent=t.cssText,s.appendChild(r)}},Fe=oe?s=>s:s=>s instanceof CSSStyleSheet?(e=>{let t="";for(const r of e.cssRules)t+=r.cssText;return yt(t)})(s):s,{is:wt,defineProperty:kt,getOwnPropertyDescriptor:Et,getOwnPropertyNames:At,getOwnPropertySymbols:St,getPrototypeOf:Lt}=Object,Z=globalThis,Be=Z.trustedTypes,Ct=Be?Be.emptyScript:"",Mt=Z.reactiveElementPolyfillSupport,H=(s,e)=>s,Q={toAttribute(s,e){switch(e){case Boolean:s=s?Ct:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,e){let t=s;switch(e){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},ae=(s,e)=>!wt(s,e),De={attribute:!0,type:String,converter:Q,reflect:!1,useDefault:!1,hasChanged:ae};Symbol.metadata??=Symbol("metadata"),Z.litPropertyMetadata??=new WeakMap;var z=class extends HTMLElement{static addInitializer(s){this._$Ei(),(this.l??=[]).push(s)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(s,e=De){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(s)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(s,e),!e.noAccessor){const t=Symbol(),r=this.getPropertyDescriptor(s,t,e);r!==void 0&&kt(this.prototype,s,r)}}static getPropertyDescriptor(s,e,t){const{get:r,set:i}=Et(this.prototype,s)??{get(){return this[e]},set(o){this[e]=o}};return{get:r,set(o){const n=r?.call(this);i?.call(this,o),this.requestUpdate(s,n,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(s){return this.elementProperties.get(s)??De}static _$Ei(){if(this.hasOwnProperty(H("elementProperties")))return;const s=Lt(this);s.finalize(),s.l!==void 0&&(this.l=[...s.l]),this.elementProperties=new Map(s.elementProperties)}static finalize(){if(this.hasOwnProperty(H("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(H("properties"))){const e=this.properties,t=[...At(e),...St(e)];for(const r of t)this.createProperty(r,e[r])}const s=this[Symbol.metadata];if(s!==null){const e=litPropertyMetadata.get(s);if(e!==void 0)for(const[t,r]of e)this.elementProperties.set(t,r)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const r=this._$Eu(e,t);r!==void 0&&this._$Eh.set(r,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(s){const e=[];if(Array.isArray(s)){const t=new Set(s.flat(1/0).reverse());for(const r of t)e.unshift(Fe(r))}else s!==void 0&&e.push(Fe(s));return e}static _$Eu(s,e){const t=e.attribute;return t===!1?void 0:typeof t=="string"?t:typeof s=="string"?s.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(s=>this.enableUpdating=s),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(s=>s(this))}addController(s){(this._$EO??=new Set).add(s),this.renderRoot!==void 0&&this.isConnected&&s.hostConnected?.()}removeController(s){this._$EO?.delete(s)}_$E_(){const s=new Map,e=this.constructor.elementProperties;for(const t of e.keys())this.hasOwnProperty(t)&&(s.set(t,this[t]),delete this[t]);s.size>0&&(this._$Ep=s)}createRenderRoot(){const s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return $t(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(s=>s.hostConnected?.())}enableUpdating(s){}disconnectedCallback(){this._$EO?.forEach(s=>s.hostDisconnected?.())}attributeChangedCallback(s,e,t){this._$AK(s,t)}_$ET(s,e){const t=this.constructor.elementProperties.get(s),r=this.constructor._$Eu(s,t);if(r!==void 0&&t.reflect===!0){const i=(t.converter?.toAttribute!==void 0?t.converter:Q).toAttribute(e,t.type);this._$Em=s,i==null?this.removeAttribute(r):this.setAttribute(r,i),this._$Em=null}}_$AK(s,e){const t=this.constructor,r=t._$Eh.get(s);if(r!==void 0&&this._$Em!==r){const i=t.getPropertyOptions(r),o=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:Q;this._$Em=r;const n=o.fromAttribute(e,i.type);this[r]=n??this._$Ej?.get(r)??n,this._$Em=null}}requestUpdate(s,e,t,r=!1,i){if(s!==void 0){const o=this.constructor;if(r===!1&&(i=this[s]),t??=o.getPropertyOptions(s),!((t.hasChanged??ae)(i,e)||t.useDefault&&t.reflect&&i===this._$Ej?.get(s)&&!this.hasAttribute(o._$Eu(s,t))))return;this.C(s,e,t)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(s,e,{useDefault:t,reflect:r,wrapped:i},o){t&&!(this._$Ej??=new Map).has(s)&&(this._$Ej.set(s,o??e??this[s]),i!==!0||o!==void 0)||(this._$AL.has(s)||(this.hasUpdated||t||(e=void 0),this._$AL.set(s,e)),r===!0&&this._$Em!==s&&(this._$Eq??=new Set).add(s))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const s=this.scheduleUpdate();return s!=null&&await s,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,i]of this._$Ep)this[r]=i;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[r,i]of t){const{wrapped:o}=i,n=this[r];o!==!0||this._$AL.has(r)||n===void 0||this.C(r,void 0,i,n)}}let s=!1;const e=this._$AL;try{s=this.shouldUpdate(e),s?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(t){throw s=!1,this._$EM(),t}s&&this._$AE(e)}willUpdate(s){}_$AE(s){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(s)),this.updated(s)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(s){return!0}update(s){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(s){}firstUpdated(s){}};z.elementStyles=[],z.shadowRootOptions={mode:"open"},z[H("elementProperties")]=new Map,z[H("finalized")]=new Map,Mt?.({ReactiveElement:z}),(Z.reactiveElementVersions??=[]).push("2.1.2");var le=globalThis,Ie=s=>s,G=le.trustedTypes,We=G?G.createPolicy("lit-html",{createHTML:s=>s}):void 0,de="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,he="?"+w,Pt=`<${he}>`,S=document,U=()=>S.createComment(""),F=s=>s===null||typeof s!="object"&&typeof s!="function",ce=Array.isArray,qe=s=>ce(s)||typeof s?.[Symbol.iterator]=="function",pe=`[ 	
\f\r]`,B=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ve=/-->/g,Je=/>/g,L=RegExp(`>|${pe}(?:([^\\s"'>=/]+)(${pe}*=${pe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ke=/'/g,Xe=/"/g,Ze=/^(?:script|style|textarea|title)$/i,fe=s=>(e,...t)=>({_$litType$:s,strings:e,values:t}),c=fe(1),Jt=fe(2),Kt=fe(3),T=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),Qe=new WeakMap,C=S.createTreeWalker(S,129);function Ge(s,e){if(!ce(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return We!==void 0?We.createHTML(e):e}var Ye=(s,e)=>{const t=s.length-1,r=[];let i,o=e===2?"<svg>":e===3?"<math>":"",n=B;for(let a=0;a<t;a++){const l=s[a];let u,p,d=-1,_=0;for(;_<l.length&&(n.lastIndex=_,p=n.exec(l),p!==null);)_=n.lastIndex,n===B?p[1]==="!--"?n=Ve:p[1]!==void 0?n=Je:p[2]!==void 0?(Ze.test(p[2])&&(i=RegExp("</"+p[2],"g")),n=L):p[3]!==void 0&&(n=L):n===L?p[0]===">"?(n=i??B,d=-1):p[1]===void 0?d=-2:(d=n.lastIndex-p[2].length,u=p[1],n=p[3]===void 0?L:p[3]==='"'?Xe:Ke):n===Xe||n===Ke?n=L:n===Ve||n===Je?n=B:(n=L,i=void 0);const v=n===L&&s[a+1].startsWith("/>")?" ":"";o+=n===B?l+Pt:d>=0?(r.push(u),l.slice(0,d)+de+l.slice(d)+w+v):l+w+(d===-2?a:v)}return[Ge(s,o+(s[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),r]},ue=class at{constructor({strings:e,_$litType$:t},r){let i;this.parts=[];let o=0,n=0;const a=e.length-1,l=this.parts,[u,p]=Ye(e,t);if(this.el=at.createElement(u,r),C.currentNode=this.el.content,t===2||t===3){const d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(i=C.nextNode())!==null&&l.length<a;){if(i.nodeType===1){if(i.hasAttributes())for(const d of i.getAttributeNames())if(d.endsWith(de)){const _=p[n++],v=i.getAttribute(d).split(w),k=/([.?@])?(.*)/.exec(_);l.push({type:1,index:o,name:k[2],strings:v,ctor:k[1]==="."?tt:k[1]==="?"?st:k[1]==="@"?rt:D}),i.removeAttribute(d)}else d.startsWith(w)&&(l.push({type:6,index:o}),i.removeAttribute(d));if(Ze.test(i.tagName)){const d=i.textContent.split(w),_=d.length-1;if(_>0){i.textContent=G?G.emptyScript:"";for(let v=0;v<_;v++)i.append(d[v],U()),C.nextNode(),l.push({type:2,index:++o});i.append(d[_],U())}}}else if(i.nodeType===8)if(i.data===he)l.push({type:2,index:o});else{let d=-1;for(;(d=i.data.indexOf(w,d+1))!==-1;)l.push({type:7,index:o}),d+=w.length-1}o++}}static createElement(e,t){const r=S.createElement("template");return r.innerHTML=e,r}};function M(s,e,t=s,r){if(e===T)return e;let i=r!==void 0?t._$Co?.[r]:t._$Cl;const o=F(e)?void 0:e._$litDirective$;return i?.constructor!==o&&(i?._$AO?.(!1),o===void 0?i=void 0:(i=new o(s),i._$AT(s,t,r)),r!==void 0?(t._$Co??=[])[r]=i:t._$Cl=i),i!==void 0&&(e=M(s,i._$AS(s,e.values),i,r)),e}var et=class{constructor(s,e){this._$AV=[],this._$AN=void 0,this._$AD=s,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(s){const{el:{content:e},parts:t}=this._$AD,r=(s?.creationScope??S).importNode(e,!0);C.currentNode=r;let i=C.nextNode(),o=0,n=0,a=t[0];for(;a!==void 0;){if(o===a.index){let l;a.type===2?l=new Y(i,i.nextSibling,this,s):a.type===1?l=new a.ctor(i,a.name,a.strings,this,s):a.type===6&&(l=new it(i,this,s)),this._$AV.push(l),a=t[++n]}o!==a?.index&&(i=C.nextNode(),o++)}return C.currentNode=S,r}p(s){let e=0;for(const t of this._$AV)t!==void 0&&(t.strings!==void 0?(t._$AI(s,t,e),e+=t.strings.length-2):t._$AI(s[e])),e++}},Y=class lt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,r,i){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=r,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=M(this,e,t),F(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==T&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):qe(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&F(this._$AH)?this._$AA.nextSibling.data=e:this.T(S.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:r}=e,i=typeof r=="number"?this._$AC(e):(r.el===void 0&&(r.el=ue.createElement(Ge(r.h,r.h[0]),this.options)),r);if(this._$AH?._$AD===i)this._$AH.p(t);else{const o=new et(i,this),n=o.u(this.options);o.p(t),this.T(n),this._$AH=o}}_$AC(e){let t=Qe.get(e.strings);return t===void 0&&Qe.set(e.strings,t=new ue(e)),t}k(e){ce(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let r,i=0;for(const o of e)i===t.length?t.push(r=new lt(this.O(U()),this.O(U()),this,this.options)):r=t[i],r._$AI(o),i++;i<t.length&&(this._$AR(r&&r._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const r=Ie(e).nextSibling;Ie(e).remove(),e=r}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},D=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(s,e,t,r,i){this.type=1,this._$AH=m,this._$AN=void 0,this.element=s,this.name=e,this._$AM=r,this.options=i,t.length>2||t[0]!==""||t[1]!==""?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=m}_$AI(s,e=this,t,r){const i=this.strings;let o=!1;if(i===void 0)s=M(this,s,e,0),o=!F(s)||s!==this._$AH&&s!==T,o&&(this._$AH=s);else{const n=s;let a,l;for(s=i[0],a=0;a<i.length-1;a++)l=M(this,n[t+a],e,a),l===T&&(l=this._$AH[a]),o||=!F(l)||l!==this._$AH[a],l===m?s=m:s!==m&&(s+=(l??"")+i[a+1]),this._$AH[a]=l}o&&!r&&this.j(s)}j(s){s===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,s??"")}},tt=class extends D{constructor(){super(...arguments),this.type=3}j(s){this.element[this.name]=s===m?void 0:s}},st=class extends D{constructor(){super(...arguments),this.type=4}j(s){this.element.toggleAttribute(this.name,!!s&&s!==m)}},rt=class extends D{constructor(s,e,t,r,i){super(s,e,t,r,i),this.type=5}_$AI(s,e=this){if((s=M(this,s,e,0)??m)===T)return;const t=this._$AH,r=s===m&&t!==m||s.capture!==t.capture||s.once!==t.once||s.passive!==t.passive,i=s!==m&&(t===m||r);r&&this.element.removeEventListener(this.name,this,t),i&&this.element.addEventListener(this.name,this,s),this._$AH=s}handleEvent(s){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,s):this._$AH.handleEvent(s)}},it=class{constructor(s,e,t){this.element=s,this.type=6,this._$AN=void 0,this._$AM=e,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(s){M(this,s)}},Xt={M:de,P:w,A:he,C:1,L:Ye,R:et,D:qe,V:M,I:Y,H:D,N:st,U:rt,B:tt,F:it},zt=le.litHtmlPolyfillSupport;zt?.(ue,Y),(le.litHtmlVersions??=[]).push("3.3.2");var Tt=(s,e,t)=>{const r=t?.renderBefore??e;let i=r._$litPart$;if(i===void 0){const o=t?.renderBefore??null;r._$litPart$=i=new Y(e.insertBefore(U(),o),o,void 0,t??{})}return i._$AI(s),i},ge=globalThis,P=class extends z{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const s=super.createRenderRoot();return this.renderOptions.renderBefore??=s.firstChild,s}update(s){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(s),this._$Do=Tt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return T}};P._$litElement$=!0,P.finalized=!0,ge.litElementHydrateSupport?.({LitElement:P});var Rt=ge.litElementPolyfillSupport;Rt?.({LitElement:P}),(ge.litElementVersions??=[]).push("4.2.2");var me=s=>(e,t)=>{t!==void 0?t.addInitializer(()=>{customElements.define(s,e)}):customElements.define(s,e)},Nt={attribute:!0,type:String,converter:Q,reflect:!1,hasChanged:ae},jt=(s=Nt,e,t)=>{const{kind:r,metadata:i}=t;let o=globalThis.litPropertyMetadata.get(i);if(o===void 0&&globalThis.litPropertyMetadata.set(i,o=new Map),r==="setter"&&((s=Object.create(s)).wrapped=!0),o.set(t.name,s),r==="accessor"){const{name:n}=t;return{set(a){const l=e.get.call(this);e.set.call(this,a),this.requestUpdate(n,l,s,!0,a)},init(a){return a!==void 0&&this.C(n,void 0,s,a),a}}}if(r==="setter"){const{name:n}=t;return function(a){const l=this[n];e.call(this,a),this.requestUpdate(n,l,s,!0,a)}}throw Error("Unsupported decorator location: "+r)};function x(s){return(e,t)=>typeof t=="object"?jt(s,e,t):((r,i,o)=>{const n=i.hasOwnProperty(o);return i.constructor.createProperty(o,r),n?Object.getOwnPropertyDescriptor(i,o):void 0})(s,e,t)}function R(s){return x({...s,state:!0,attribute:!1})}var ot=X`
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
`,Ot=X`
    ${ot}
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
        border-bottom: 1px solid var(--fe-color-border, #fcfcfc);
    }

    .log-item:hover {
        background: var(--fe-color-hover, #fdfdfd);
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
`,Ht=X`
    ${ot}
    :host {
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: var(--fe-color-text, #333);
        background: var(--fe-color-bg, #fff);
        overflow: hidden;
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
`,Ut=X`
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
`;function N(s,e){for(let t=s.length-1;t>=0;t--)s[t]===e&&s.splice(t,1)}var Ft={bg:"#f0f0f0",color:"#666",border:"#d9d9d9"},Bt={blue:{bg:"#e6f7ff",color:"#1890ff",border:"#91d5ff"},green:{bg:"#f6ffed",color:"#52c41a",border:"#b7eb8f"},orange:{bg:"#fff7e6",color:"#fa8c16",border:"#ffd591"},red:{bg:"#fff1f0",color:"#ff4d4f",border:"#ffa39e"},purple:{bg:"#f9f0ff",color:"#722ed1",border:"#d3adf7"},gray:{bg:"#f5f5f5",color:"#8c8c8c",border:"#d9d9d9"}};function Dt(s){const e=["blue","green","orange","red","purple"];let t=0;for(let r=0;r<s.length;r++)t=s.charCodeAt(r)+((t<<5)-t);return e[Math.abs(t)%e.length]}function y(s,e,t,r){if(typeof e=="object"&&e!==null&&"styles"in e){const i=e;return c`<span
            class="${["tag",i.className].filter(Boolean).join(" ")}"
            title="${i.tooltip||s}"
            style="${i.styles}"
            @click="${i.onClick}"
        >
            ${s}
        </span>`}else{const i=Bt[e||Dt(s)]||Ft;return c`<span
            class="${["tag",r].filter(Boolean).join(" ")}"
            title="${t||s}"
            style="display: inline-flex; align-items: center; padding: 0.1em 0.4em; border-radius: 5px; font-size: 11px; white-space: nowrap; background: ${i.bg}; color: ${i.color}; ${i.border?`border: 1px solid ${i.border};`:""}"
        >
            ${s}
        </span>`}}function E(s,e,t={}){const{icon:r,pressed:i,className:o="",title:n}=t,a=["btn",o];return i&&a.push("btn-pressed"),r&&a.push("btn-icon"),c`<button
        class="${a.join(" ")}"
        title="${n||""}"
        @click="${e}"
        style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0.4em 0.8em; border: none; border-radius: 4px; background: transparent; cursor: pointer; transition: all 0.3s; user-select: none; ${r?"padding: 0.2em; width: 24px; height: 24px;":""}"
    >
        ${r?c`<span class="icon ${r}"></span>`:""}
        ${s}
    </button>`}function ee(s,e){return e?c`<span class="icon ${s}" title="${e}"></span>`:c`<span class="icon ${s}"></span>`}function It(s){const{message:e,pathKey:t,dark:r=!1,onDelete:i,onPrint:o,onCopy:n}=s,a=JSON.stringify(e,null,2),l=a.split(`
`).length>15?a.split(`
`).slice(0,5).join(`
`)+`
...`:a;return c`
        <div class="retained-message-card${r?" dark":""}">
            <div class="retained-message-header">
                <span class="retained-message-title">保留消息</span>
                <div class="retained-message-actions">
                    ${E("",()=>i?.(t),{icon:"delete",className:"btn-icon",title:"删除保留消息"})}
                    ${E("",()=>o?.(e),{icon:"listeners",className:"btn-icon",title:"打印到控制台"})}
                    ${E("",()=>n?.(e),{icon:"copy",className:"btn-icon",title:"复制消息内容"})}
                </div>
            </div>
            <div class="retained-message-content">
                <pre class="retained-message-text">${l}</pre>
            </div>
        </div>
    `}function g(s,e,t,r){var i=arguments.length,o=i<3?e:r===null?r=Object.getOwnPropertyDescriptor(e,t):r,n;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")o=Reflect.decorate(s,e,t,r);else for(var a=s.length-1;a>=0;a--)(n=s[a])&&(o=(i<3?n(o):i>3?n(e,t,o):n(e,t))||o);return i>3&&o&&Object.defineProperty(e,t,o),o}var j=class extends P{constructor(...e){super(...e),this.dark=!1,this._onAfterExecuteListener=(t,r,i)=>{V(t.type.split("/"),this.type.split("/"))&&this.requestUpdate()}}static{this.styles=Ut}connectedCallback(){super.connectedCallback(),this._addListenerHook()}disconnectedCallback(){super.disconnectedCallback(),this._removeListenerHook()}_addListenerHook(){this.emitter&&this.emitter.hooks.AfterExecuteListener.push(this._onAfterExecuteListener)}_removeListenerHook(){this.emitter&&N(this.emitter.hooks.AfterExecuteListener,this._onAfterExecuteListener)}_formatListenerCount(e){const[,t,r]=e;return t===0?`${r}/∞`:`${r}/${t}`}getFunctionPosition(e){const t=e.toString(),r=new Error().stack;console.group("函数定位"),console.log("函数代码:",t.substring(0,200)),console.log("当前调用栈:",r),console.groupEnd(),console.log(e)}_printListenerToConsole(e){const[t]=e;if(typeof t!="function"){console.warn("监听器函数已被垃圾回收或无效"),console.log("元数据:",{executed:`${e[2]}/${e[1]}`,tag:e[3],flags:e[4]});return}console.group("FastEvent Listener"),console.log(`监听器: ${t.name||"anonymous"}`),console.log(t),console.log(`执行次数: ${e[2]}/${e[1]}`),console.log(`标签: ${e[3]}`),e[4]!==void 0&&console.log(`标识: ${e[4]}`),console.groupEnd()}_printListenerResultToConsole(e){if(e.length===6){console.group("FastEvent Listener returns");const t=e[5]instanceof WeakRef?e[5].deref():e[5];console.log(t),console.groupEnd()}}_renderReturns(e){if(e.length===6&&e[5]){const t=e[5]instanceof WeakRef?e[5].deref():e[5];return c`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">返回值</div>
                        <div class="listener-cell listener-value" title="单击显示在控制台" style="cursor:pointer"                         
                        @click="${()=>this._printListenerResultToConsole(this.listener)}"
>${t instanceof Error?t.stack:JSON.stringify(t)}</div>
                    </div>
                `}}render(){if(!this.listener)return c`
                <div class="empty-state">监听器数据无效</div>
            `;const[e,,,t,r]=this.listener;return c`
            <div class="listener-card">
                <div class="listener-row">
                    <div class="listener-cell listener-label">监听函数</div>
                    <div class="listener-cell">
                        <span
                            class="listener-function"
                            @click="${()=>this._printListenerToConsole(this.listener)}"
                            title="点击在控制台输出监听器信息"
                        >
                            ${e.name||"anonymous"}
                        </span>
                    </div>
                </div>
                <div class="listener-row">
                    <div class="listener-cell listener-label">执行次数</div>
                    <div class="listener-cell listener-value">${this._formatListenerCount(this.listener)}</div>
                </div>
                ${t?c`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">标签</div>
                        <div class="listener-cell">${y(t)}</div>
                    </div>
                `:""}
                ${r!==void 0?c`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">标识</div>
                        <div class="listener-cell listener-value">${r}</div>
                    </div>
                `:""}
                ${this._renderReturns(this.listener)}
            </div>
        `}};g([x({attribute:!1})],j.prototype,"emitter",void 0),g([x({attribute:!1})],j.prototype,"listener",void 0),g([x({type:Boolean,reflect:!0})],j.prototype,"dark",void 0),g([x({type:String})],j.prototype,"type",void 0),j=g([me("fastevent-listener-card")],j);var A=class extends P{constructor(...e){super(...e),this.dark=!1,this._selectedPath=[],this._listeners=[],this._expandedNodes=new Set,this._leftWidth="33.33%",this._isResizing=!1,this._resizeStartX=0,this._resizeStartWidth=0,this._onAddAfterListener=(t,r)=>{this.requestUpdate()},this._onRemoveListener=(t,r,i)=>{this.requestUpdate()},this._onClearListeners=()=>{this._handleRefresh()},this._handleResizeMove=t=>{if(!this._isResizing)return;const r=t.clientX-this._resizeStartX,i=this.shadowRoot?.querySelector(".main-container")?.offsetWidth||0,o=(this._resizeStartWidth+r)/i*100;this._leftWidth=`${Math.max(20,Math.min(80,o))}%`,this.style.setProperty("--fe-left-width",this._leftWidth)},this._handleResizeEnd=()=>{this._isResizing=!1,document.removeEventListener("mousemove",this._handleResizeMove),document.removeEventListener("mouseup",this._handleResizeEnd),this.shadowRoot?.querySelector(".resizer")?.classList.remove("dragging")}}static{this.styles=Ht}_getListenerNode(e){if(!this.emitter?.listeners||e.length===0)return null;let t=this.emitter.listeners;for(const r of e)if(t[r])t=t[r];else return null;return t}_findFirstNodeWithListeners(){if(!this.emitter?.listeners)return null;const e=(t,r)=>{if(t.__listeners&&t.__listeners.length>0)return r;for(const i in t){if(i==="__listeners")continue;const o=e(t[i],[...r,i]);if(o)return o}return null};return e(this.emitter.listeners,[])}_initializeExpandedNodes(){if(!this.emitter?.listeners)return;this._expandedNodes=new Set;const e=(t,r)=>{this._expandedNodes.add(r.join("/"));for(const i in t)i!=="__listeners"&&e(t[i],[...r,i])};e(this.emitter.listeners,[])}_refreshData(){if(this.emitter&&this._expandedNodes.size===0){this._initializeExpandedNodes();const e=this._findFirstNodeWithListeners();e&&(this._selectedPath=e,this._listeners=this._getListenerNode(e)?.__listeners||[])}else this._selectedPath.length>0&&(this._listeners=this._getListenerNode(this._selectedPath)?.__listeners||[])}_handleNodeSelect(e){const t=e.currentTarget.dataset.path;if(!t)return;const r=t.split("/");this._selectedPath=r,this._listeners=this._getListenerNode(r)?.__listeners||[],this.requestUpdate()}_setupHooks(){this.emitter&&(this.emitter.hooks.AddAfterListener.push(this._onAddAfterListener),this.emitter.hooks.RemoveListener.push(this._onRemoveListener),this.emitter.hooks.ClearListeners.push(this._onClearListeners))}_clearHooks(){this.emitter&&(N(this.emitter.hooks.AddAfterListener,this._onAddAfterListener),N(this.emitter.hooks.RemoveListener,this._onRemoveListener),N(this.emitter.hooks.ClearListeners,this._onClearListeners))}_handleNodeToggle(e){const t=e.currentTarget.closest("[data-path]")?.dataset.path;if(!t)return;const r=t;this._expandedNodes.has(r)?this._expandedNodes.delete(r):this._expandedNodes.add(r),this.requestUpdate()}_handleRefresh(){this._refreshData(),this.requestUpdate()}_handleResizeStart(e){this._isResizing=!0,this._resizeStartX=e.clientX,this._resizeStartWidth=this.shadowRoot?.querySelector(".tree-panel")?.offsetWidth||0,document.addEventListener("mousemove",this._handleResizeMove),document.addEventListener("mouseup",this._handleResizeEnd),this.shadowRoot?.querySelector(".resizer")?.classList.add("dragging")}_handleKeyDown(e){const t=e.currentTarget.dataset.path;if(!t)return;const r=t;switch(e.key){case"Enter":case" ":e.preventDefault(),this._handleNodeSelect(e);break;case"ArrowRight":e.preventDefault(),this._expandedNodes.has(r)||this._handleNodeToggle(e);break;case"ArrowLeft":e.preventDefault(),this._expandedNodes.has(r)&&this._handleNodeToggle(e);break}}_isEmptyNode(e){return Object.keys(e).length===1&&e.__listeners&&e.__listeners.length===0}renderTreeNode(e,t,r){const i=t.join("/"),o=this._expandedNodes.has(i),n=JSON.stringify(this._selectedPath)===JSON.stringify(t),a=Object.keys(e).filter(p=>p!=="__listeners"),l=a.length>0,u=e.__listeners?.length||0;return c`
            <div>
                <div
                    class="tree-node ${n?"selected":""}"
                    style="padding-left: ${r*8+8}px"
                    role="treeitem"
                    data-path="${i}"
                    aria-expanded="${l?o:!1}"
                    aria-selected="${n}"
                    tabindex="${n?"0":"-1"}"
                    @keydown="${this._handleKeyDown}"
                >
                    <span
                        class="tree-node-toggle ${o?"expanded":""} ${l?"":"hidden"}"
                        data-path="${i}"
                        @click="${this._handleNodeToggle}"
                    >
                        <span class="icon arrow"></span>
                    </span>
                    <span class="tree-node-content" data-path="${i}" @click="${this._handleNodeSelect}">
                        <span class="icon listeners"></span>
                        <span class="tree-node-label">${t[t.length-1]}</span>
                        ${this.emitter?.retainedMessages.has(i)?y("retain","red","保留消息"):""}
                        ${u>0?c`
                            <span class="tree-node-badge">${u}</span>
                        `:""}
                    </span>
                </div>
                ${l&&o?c`
                    <div class="tree-children">
                        ${a.map(p=>{const d=[...t,p];return this.renderTreeNode(e[p],d,r+1)})}
                    </div>
                `:""}
            </div>
        `}renderTree(){const e=this.emitter?.listeners;return!e||this._isEmptyNode(e)?c`
                <div class="empty-state">
                    <span class="icon listeners"></span>
                    <p>暂无注册的监听器</p>
                </div>
            `:c`
            <div>
                ${Object.keys(e).filter(t=>t!=="__listeners").map(t=>this.renderTreeNode(e[t],[t],0))}
            </div>
        `}renderListener(e,t){return c`<fastevent-listener-card .listener="${e}" .emitter="${this.emitter}" .type="${t}" .dark="${this.dark}"></fastevent-listener-card>`}renderListeners(){const e=this._selectedPath.join("/"),t=this.emitter?.retainedMessages.get(e);return c`
            <div>
                ${t?It({message:t,pathKey:e,dark:this.dark,onDelete:r=>{this.emitter?.retainedMessages.delete(r),this.requestUpdate()},onPrint:r=>{console.group("FastEvent 保留消息"),console.log("消息内容:",r),console.groupEnd()},onCopy:r=>{const i=JSON.stringify(r,null,2);navigator.clipboard.writeText(i)}}):""}
                ${this._listeners.length===0?c`
                        <div class="empty-state">
                            <span class="icon listeners" style="--icon-size: 3em"></span>
                            <p>该节点暂无监听器</p>
                        </div>
                    `:c`
                        <div class="listeners-list">
                            ${this._listeners.map(r=>this.renderListener(r,e))}
                        </div>
                    `}
            </div>
        `}willUpdate(e){super.willUpdate(e),e.has("emitter")&&(this.emitter?this._refreshData():(this._listeners=[],this._selectedPath=[],this._expandedNodes=new Set))}connectedCallback(){super.connectedCallback(),this.emitter&&(this._refreshData(),this._setupHooks())}disconnectedCallback(){super.disconnectedCallback(),this._isResizing&&(document.removeEventListener("mousemove",this._handleResizeMove),document.removeEventListener("mouseup",this._handleResizeEnd)),this._clearHooks()}render(){return c`
            <div class="toolbar">
                <span class="toolbar-title">已注册监听器</span>
                <button class="btn btn-icon" title="刷新" @click="${this._handleRefresh}">
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
        `}};g([x({type:Object})],A.prototype,"emitter",void 0),g([x({type:Boolean,reflect:!0})],A.prototype,"dark",void 0),g([R()],A.prototype,"_selectedPath",void 0),g([R()],A.prototype,"_listeners",void 0),g([R()],A.prototype,"_expandedNodes",void 0),A=g([me("fastevent-listeners")],A);var $=class extends P{constructor(...e){super(...e),this.dark=!1,this.enable=!0,this.maxSize=500,this.title="",this.showListeners=!0,this._filterText="",this._showListeners=!1,this._isShowListeners=!1,this.messages=[],this.logs=[],this._logIndexs=[],this._onBeforeExecuteListener=(t,r)=>{if(!this.enable)return;const i=(this.emitter.getListeners(t.type)||[]).map(n=>this._getListenerMeta(n,"running")),o={message:new WeakRef(t),done:!1,args:new WeakRef(r),triggerTime:Date.now(),duration:[performance.now(),0],listeners:i};o.id=this.logs.length+1,t.__index=o.id-1,this.logs.push(o),this._logIndexs.unshift(this.logs.length-1),this.maxSize>0&&this.logs.length>this.maxSize&&(this.logs.shift(),this._updateFilteredLogs()),this.requestUpdate()},this._onAfterExecuteListener=(t,r,i)=>{if(!this.enable)return;const o=t.__index;if(typeof o=="number"){const n=this.logs[o];n&&(n.done=!0,n.duration[1]=performance.now());const a=i.reduce((u,p)=>(p.__listeners.forEach(d=>{u.push(this._getListenerMeta(d))}),u),[]),l=o;l!==-1&&(this.logs[l].listeners=a,r.map((u,p)=>{const d=this.logs[l].listeners[p];if(d){try{d.result=structuredClone(u)}catch{d.result=u}u instanceof Error?d.status="error":d.status="ok"}})),delete t.__index}this.requestUpdate()}}static{this.styles=Ot}connectedCallback(){super.connectedCallback(),this._attach()}disconnectedCallback(){this._detach()}willUpdate(e){e.has("emitter")&&this._reattach(),e.has("_filterText")&&this._updateFilteredLogs(),e.has("showListenersInLog")&&(this._isShowListeners=this.showListeners)}_reattach(){this._detach(),this.clear(),this._attach()}_updateFilteredLogs(){const e=this._filterText.toLowerCase().trim();if(!e){this._logIndexs=this.logs.map((t,r)=>r).reverse();return}this._logIndexs=this.logs.map((t,r)=>({log:t,index:r})).filter(({log:t})=>{const r=t.message.deref();return r?r.type.toLowerCase().includes(e):!1}).map(({index:t})=>t).reverse()}_getListenerMeta(e,t){if(t===void 0)if(e.length===6){let r;const i=e[5];i instanceof WeakRef?r=i.deref():r=i,r instanceof Error?t="error":t="ok"}else t="ok";return{status:t,fn:new WeakRef(e[0]),name:e[0].name||"anonymous",count:`${e[2]}/${e[1]===0?"∞":e[1]}`,tag:e[3],flags:e[4],result:e[5]}}_attach(){if(this.emitter){const e=this.emitter.options;this.emitter.hooks.BeforeExecuteListener.push(this._onBeforeExecuteListener),this.emitter.hooks.AfterExecuteListener.push(this._onAfterExecuteListener),e.debug=!0}}_detach(){if(this.emitter){N(this.emitter.hooks.BeforeExecuteListener,this._onBeforeExecuteListener),N(this.emitter.hooks.AfterExecuteListener,this._onAfterExecuteListener);const e=this.emitter.options;e.debug=!1}}clear(){this.logs=[],this._logIndexs=[],this.messages=[],this.requestUpdate()}_formatTime(e){const t=new Date(e);return`${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}:${t.getSeconds().toString().padStart(2,"0")}.${t.getMilliseconds().toString().padStart(3,"0")}`}_printListenerInfo(e){const t=e.fn.deref();typeof t=="function"&&(console.group("FastEvent Listener"),console.log(`监听器: ${t.name||"anonymous"}`),console.log(t),console.log("执行结果：",e.result),console.groupEnd())}renderFilter(){return c`<input
            type="text"
            class="filter-input"
            placeholder="事件类型过滤"
            .value="${this._filterText}"
            @input="${e=>{this._filterText=e.target.value}}"
        />`}renderHeader(){return c`
            <div class="header">
                <span class="header-title">${this.title.length>0?this.title:this.emitter?.title}</span>
                <!-- ${E("",()=>{this.enable=!this.enable,this.requestUpdate()},{icon:this.enable?"success":"cancel",pressed:this.enable,className:"btn-icon"})} -->
                ${E("",()=>{this.dark=!this.dark},{icon:"dark",className:"btn-icon"+(this._showListeners?" btn-pressed":""),title:this.dark?"正常模式":"暗黑模式"})}
                ${E("",()=>{this._showListeners=!this._showListeners},{icon:"listeners",className:"btn-icon"+(this._showListeners?" btn-pressed":""),title:this._showListeners?"显示事件":"显示注册的监听器"})}
            </div>
        `}renderToolbar(){return c`
            <div class="toolbar">
                ${this.renderFilter()}
                <span class="toolbar-spacer">共${this._logIndexs.length}条</span>
                ${E("",()=>{this._isShowListeners=!this._isShowListeners,this.requestUpdate()},{icon:"listener",className:"btn-icon"+(this._isShowListeners?" btn-pressed":""),title:this._isShowListeners?"隐藏监听器详情":"显示监听器详情"})}
                <button class="btn btn-icon" title="清空" @click="${()=>this.clear()}">
                    <span class="icon clear"></span>
                </button>
            </div>
        `}renderLogFlags(e){if(e&&(e.flags||0)>0){const t=e.flags||0;return t>1?y(`${e.flags}`,"orange","扩展标识"):c`${(t|1)==0?"":y("T","orange","经过转换")}`}}renderLog(e){const t=e.message.deref(),r=e.args.deref();if(!t)return c``;const i=JSON.stringify(t.payload??""),o=this._formatTime(e.triggerTime);return c`
            <div class="log-item">
                <div class="log-content">
                    <div class="log-header">
                        ${e.done?"✨":ee("loading")}
                        <span class="log-type" title="事件类型">${t.type}</span>
                        <span class="log-time" title="触发时间">${o}</span>
                        ${y(`#${e.id}`,"gray","序号")}
                        ${this._isShowListeners?"":y(`ƒ(${e.listeners.length})`,"purple",`共${e.listeners.length}个监听器`)}
                        ${r?.retain?y("retain","red","保留最后一次事件数据"):""}
                        ${this.renderLogFlags(r)}
                        ${r?.rawEventType&&r?.rawEventType!==t.type?y(r.rawEventType,"blue",`原始事件类型: ${r.rawEventType}`):""}
                        ${e.duration[1]>0?y(`${Number((e.duration[1]-e.duration[0]).toFixed(3))}ms`,"green","执行耗时"):""}
                        ${E("",()=>{const n=JSON.stringify(t,null,2);navigator.clipboard.writeText(n)},{icon:"copy",className:"btn-icon",title:"复制完整消息"})}
                    </div>
                    ${i?c`<div class="log-payload">${i}</div>`:""}
                    ${e.listeners.length>0?c`
                        <div class="log-listeners ${this._isShowListeners?"log-listeners-visible":"log-listeners-hidden"}">
                            ${this.renderListeners(e.listeners)}
                        </div>
                    `:""}
                </div>
            </div>
        `}renderListeners(e){return c`${e.map(t=>this.renderListener(t))}`}renderListener(e){const t=e.status==="ok"?"yes":e.status,r=this._formatResult(e.result);return c`
            <div class="listener" >
                ${ee("listener","监听器")}
                <span class="listener-name" title="点击的控制台输出监听器信息" @click="${()=>this._printListenerInfo(e)}">${e.name}</span>
                ${e.tag?y(e.tag,void 0,`监听器标签: ${e.tag}`):""}
                ${y(e.count,void 0,"执行次数计数（当前/总数）")}
                ${e.flags!==void 0?y(`${e.flags}`,"orange","监听器标识flags"):""}
                <span class="listener-status ${t}" title="${r}">
                    ${ee(e.status==="running"?"loading":e.status==="ok"?"yes":e.status)}
                </span>         
            </div>
        `}_formatResult(e){if(e===void 0)return"执行中...";if(e===null)return"null";if(e instanceof Error)return`错误: ${e.message}`;if(typeof e=="object")try{const t=JSON.stringify(e);return t.length>100?t.substring(0,100)+"...":t}catch{return e.toString()}return String(e)}renderLogs(){return this._logIndexs.length===0?c`
                <div class="empty-state">
                    ${ee("file")}
                    <p>暂无事件日志</p>
                </div>
            `:c`
            <div class="logs">
                ${this._logIndexs.map(e=>this.renderLog(this.logs[e]))}
            </div>
        `}render(){return c`
            ${this.renderHeader()}
            ${this._showListeners?c`<fastevent-listeners
                        .emitter="${this.emitter}"
                        .dark="${this.dark}">
                    </fastevent-listeners>`:c`${this.renderToolbar()}${this.renderLogs()}`}
        `}};return g([x({type:Object})],$.prototype,"emitter",void 0),g([x({type:Boolean,reflect:!0})],$.prototype,"dark",void 0),g([x({type:Boolean,reflect:!0})],$.prototype,"enable",void 0),g([x({type:Number})],$.prototype,"maxSize",void 0),g([x({type:String})],$.prototype,"title",void 0),g([x({type:Boolean})],$.prototype,"showListeners",void 0),g([R()],$.prototype,"_filterText",void 0),g([R()],$.prototype,"_showListeners",void 0),g([R()],$.prototype,"_isShowListeners",void 0),$=g([me("fastevent-viewer")],$),Object.defineProperty(I,"FastEventListeners",{enumerable:!0,get:function(){return A}}),Object.defineProperty(I,"FastEventViewer",{enumerable:!0,get:function(){return $}}),I})({});

//# sourceMappingURL=fastevent.viewer.js.map