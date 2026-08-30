(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function e(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(s){if(s.ep)return;s.ep=!0;const a=e(s);fetch(s.href,a)}})();const Pf="modulepreload",Rf=function(i,t){return new URL(i,t).href},hh={},Cf=function(t,e,n){let s=Promise.resolve();if(e&&e.length>0){let h=function(f){return Promise.all(f.map(u=>Promise.resolve(u).then(c=>({status:"fulfilled",value:c}),c=>({status:"rejected",reason:c}))))};const r=document.getElementsByTagName("link"),o=document.querySelector("meta[property=csp-nonce]"),l=o?.nonce||o?.getAttribute("nonce");s=h(e.map(f=>{if(f=Rf(f,n),f in hh)return;hh[f]=!0;const u=f.endsWith(".css"),c=u?'[rel="stylesheet"]':"";if(n)for(let _=r.length-1;_>=0;_--){const M=r[_];if(M.href===f&&(!u||M.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${f}"]${c}`))return;const d=document.createElement("link");if(d.rel=u?"stylesheet":Pf,u||(d.as="script"),d.crossOrigin="",d.href=f,l&&d.setAttribute("nonce",l),document.head.appendChild(d),u)return new Promise((_,M)=>{d.addEventListener("load",_),d.addEventListener("error",()=>M(new Error(`Unable to preload CSS for ${f}`)))})}))}function a(r){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=r,window.dispatchEvent(o),!o.defaultPrevented)throw r}return s.then(r=>{for(const o of r||[])o.status==="rejected"&&a(o.reason);return t().catch(a)})};const Ml="185",hs={ROTATE:0,DOLLY:1,PAN:2},is={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},If=0,ch=1,Lf=2,Ga=1,Nf=2,Ns=3,un=0,Je=1,bi=2,zi=0,cs=1,uh=2,fh=3,dh=4,Df=5,Tn=100,Uf=101,Ff=102,Of=103,Gf=104,Bf=200,zf=201,kf=202,Hf=203,mo=204,_o=205,Vf=206,Wf=207,Xf=208,qf=209,Yf=210,$f=211,Kf=212,Zf=213,Jf=214,go=0,vo=1,Mo=2,_s=3,xo=4,So=5,yo=6,Eo=7,qc=0,Qf=1,jf=2,Pi=0,Yc=1,$c=2,Kc=3,Zc=4,Jc=5,Qc=6,jc=7,tu=300,Rn=301,gs=302,Pr=303,Rr=304,_r=306,bo=1e3,Bi=1001,To=1002,Ne=1003,td=1004,ra=1005,Ge=1006,Cr=1007,An=1008,ni=1009,eu=1010,iu=1011,Ws=1012,xl=1013,Ii=1014,wi=1015,Xi=1016,Sl=1017,yl=1018,Xs=1020,nu=35902,su=35899,au=1021,ru=1022,mi=1023,qi=1026,Pn=1027,ou=1028,El=1029,Cn=1030,bl=1031,Tl=1033,Ba=33776,za=33777,ka=33778,Ha=33779,wo=35840,Ao=35841,Po=35842,Ro=35843,Co=36196,Io=37492,Lo=37496,No=37488,Do=37489,Ja=37490,Uo=37491,Fo=37808,Oo=37809,Go=37810,Bo=37811,zo=37812,ko=37813,Ho=37814,Vo=37815,Wo=37816,Xo=37817,qo=37818,Yo=37819,$o=37820,Ko=37821,Zo=36492,Jo=36494,Qo=36495,jo=36283,tl=36284,Qa=36285,el=36286,ed=3200,il=0,id=1,an="",ii="srgb",ja="srgb-linear",tr="linear",jt="srgb",On=7680,ph=519,nd=512,sd=513,ad=514,wl=515,rd=516,od=517,Al=518,ld=519,nl=35044,mh="300 es",Ai=2e3,qs=2001;function hd(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function er(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function cd(){const i=er("canvas");return i.style.display="block",i}const _h={};function ir(...i){const t="THREE."+i.shift();console.log(t,...i)}function lu(i){const t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){const e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Lt(...i){i=lu(i);const t="THREE."+i.shift();{const e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Vt(...i){i=lu(i);const t="THREE."+i.shift();{const e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function us(...i){const t=i.join(" ");t in _h||(_h[t]=!0,Lt(...i))}function ud(i,t,e){return new Promise(function(n,s){function a(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(a,e);break;default:n()}}setTimeout(a,e)})}const fd={[go]:vo,[Mo]:yo,[xo]:Eo,[_s]:So,[vo]:go,[yo]:Mo,[Eo]:xo,[So]:_s};class _n{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){const n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){const n=this._listeners;if(n===void 0)return;const s=n[t];if(s!==void 0){const a=s.indexOf(e);a!==-1&&s.splice(a,1)}}dispatchEvent(t){const e=this._listeners;if(e===void 0)return;const n=e[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let a=0,r=s.length;a<r;a++)s[a].call(this,t);t.target=null}}}const Ue=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Va=Math.PI/180,sl=180/Math.PI;function hn(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ue[i&255]+Ue[i>>8&255]+Ue[i>>16&255]+Ue[i>>24&255]+"-"+Ue[t&255]+Ue[t>>8&255]+"-"+Ue[t>>16&15|64]+Ue[t>>24&255]+"-"+Ue[e&63|128]+Ue[e>>8&255]+"-"+Ue[e>>16&255]+Ue[e>>24&255]+Ue[n&255]+Ue[n>>8&255]+Ue[n>>16&255]+Ue[n>>24&255]).toLowerCase()}function kt(i,t,e){return Math.max(t,Math.min(e,i))}function dd(i,t){return(i%t+t)%t}function Ir(i,t,e){return(1-e)*i+e*t}function Ti(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ee(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const pd={DEG2RAD:Va},Kl=class Kl{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=kt(this.x,t.x,e.x),this.y=kt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=kt(this.x,t,e),this.y=kt(this.y,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(kt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),a=this.x-t.x,r=this.y-t.y;return this.x=a*n-r*s+t.x,this.y=a*s+r*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Kl.prototype.isVector2=!0;let Rt=Kl;class fn{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,a,r,o){let l=n[s+0],h=n[s+1],f=n[s+2],u=n[s+3],c=a[r+0],d=a[r+1],_=a[r+2],M=a[r+3];if(u!==M||l!==c||h!==d||f!==_){let m=l*c+h*d+f*_+u*M;m<0&&(c=-c,d=-d,_=-_,M=-M,m=-m);let p=1-o;if(m<.9995){const b=Math.acos(m),A=Math.sin(b);p=Math.sin(p*b)/A,o=Math.sin(o*b)/A,l=l*p+c*o,h=h*p+d*o,f=f*p+_*o,u=u*p+M*o}else{l=l*p+c*o,h=h*p+d*o,f=f*p+_*o,u=u*p+M*o;const b=1/Math.sqrt(l*l+h*h+f*f+u*u);l*=b,h*=b,f*=b,u*=b}}t[e]=l,t[e+1]=h,t[e+2]=f,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,a,r){const o=n[s],l=n[s+1],h=n[s+2],f=n[s+3],u=a[r],c=a[r+1],d=a[r+2],_=a[r+3];return t[e]=o*_+f*u+l*d-h*c,t[e+1]=l*_+f*c+h*u-o*d,t[e+2]=h*_+f*d+o*c-l*u,t[e+3]=f*_-o*u-l*c-h*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,a=t._z,r=t._order,o=Math.cos,l=Math.sin,h=o(n/2),f=o(s/2),u=o(a/2),c=l(n/2),d=l(s/2),_=l(a/2);switch(r){case"XYZ":this._x=c*f*u+h*d*_,this._y=h*d*u-c*f*_,this._z=h*f*_+c*d*u,this._w=h*f*u-c*d*_;break;case"YXZ":this._x=c*f*u+h*d*_,this._y=h*d*u-c*f*_,this._z=h*f*_-c*d*u,this._w=h*f*u+c*d*_;break;case"ZXY":this._x=c*f*u-h*d*_,this._y=h*d*u+c*f*_,this._z=h*f*_+c*d*u,this._w=h*f*u-c*d*_;break;case"ZYX":this._x=c*f*u-h*d*_,this._y=h*d*u+c*f*_,this._z=h*f*_-c*d*u,this._w=h*f*u+c*d*_;break;case"YZX":this._x=c*f*u+h*d*_,this._y=h*d*u+c*f*_,this._z=h*f*_-c*d*u,this._w=h*f*u-c*d*_;break;case"XZY":this._x=c*f*u-h*d*_,this._y=h*d*u-c*f*_,this._z=h*f*_+c*d*u,this._w=h*f*u+c*d*_;break;default:Lt("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],a=e[8],r=e[1],o=e[5],l=e[9],h=e[2],f=e[6],u=e[10],c=n+o+u;if(c>0){const d=.5/Math.sqrt(c+1);this._w=.25/d,this._x=(f-l)*d,this._y=(a-h)*d,this._z=(r-s)*d}else if(n>o&&n>u){const d=2*Math.sqrt(1+n-o-u);this._w=(f-l)/d,this._x=.25*d,this._y=(s+r)/d,this._z=(a+h)/d}else if(o>u){const d=2*Math.sqrt(1+o-n-u);this._w=(a-h)/d,this._x=(s+r)/d,this._y=.25*d,this._z=(l+f)/d}else{const d=2*Math.sqrt(1+u-n-o);this._w=(r-s)/d,this._x=(a+h)/d,this._y=(l+f)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(kt(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,a=t._z,r=t._w,o=e._x,l=e._y,h=e._z,f=e._w;return this._x=n*f+r*o+s*h-a*l,this._y=s*f+r*l+a*o-n*h,this._z=a*f+r*h+n*l-s*o,this._w=r*f-n*o-s*l-a*h,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,a=t._z,r=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,a=-a,r=-r,o=-o);let l=1-e;if(o<.9995){const h=Math.acos(o),f=Math.sin(h);l=Math.sin(l*h)/f,e=Math.sin(e*h)/f,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+a*e,this._w=this._w*l+r*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+a*e,this._w=this._w*l+r*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),a=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),a*Math.sin(e),a*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Zl=class Zl{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(gh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(gh.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,a=t.elements;return this.x=a[0]*e+a[3]*n+a[6]*s,this.y=a[1]*e+a[4]*n+a[7]*s,this.z=a[2]*e+a[5]*n+a[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,a=t.elements,r=1/(a[3]*e+a[7]*n+a[11]*s+a[15]);return this.x=(a[0]*e+a[4]*n+a[8]*s+a[12])*r,this.y=(a[1]*e+a[5]*n+a[9]*s+a[13])*r,this.z=(a[2]*e+a[6]*n+a[10]*s+a[14])*r,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,a=t.x,r=t.y,o=t.z,l=t.w,h=2*(r*s-o*n),f=2*(o*e-a*s),u=2*(a*n-r*e);return this.x=e+l*h+r*u-o*f,this.y=n+l*f+o*h-a*u,this.z=s+l*u+a*f-r*h,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s,this.y=a[1]*e+a[5]*n+a[9]*s,this.z=a[2]*e+a[6]*n+a[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=kt(this.x,t.x,e.x),this.y=kt(this.y,t.y,e.y),this.z=kt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=kt(this.x,t,e),this.y=kt(this.y,t,e),this.z=kt(this.z,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,a=t.z,r=e.x,o=e.y,l=e.z;return this.x=s*l-a*o,this.y=a*r-n*l,this.z=n*o-s*r,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Lr.copy(this).projectOnVector(t),this.sub(Lr)}reflect(t){return this.sub(Lr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(kt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Zl.prototype.isVector3=!0;let U=Zl;const Lr=new U,gh=new fn,Jl=class Jl{constructor(t,e,n,s,a,r,o,l,h){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,a,r,o,l,h)}set(t,e,n,s,a,r,o,l,h){const f=this.elements;return f[0]=t,f[1]=s,f[2]=o,f[3]=e,f[4]=a,f[5]=l,f[6]=n,f[7]=r,f[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,a=this.elements,r=n[0],o=n[3],l=n[6],h=n[1],f=n[4],u=n[7],c=n[2],d=n[5],_=n[8],M=s[0],m=s[3],p=s[6],b=s[1],A=s[4],S=s[7],w=s[2],y=s[5],P=s[8];return a[0]=r*M+o*b+l*w,a[3]=r*m+o*A+l*y,a[6]=r*p+o*S+l*P,a[1]=h*M+f*b+u*w,a[4]=h*m+f*A+u*y,a[7]=h*p+f*S+u*P,a[2]=c*M+d*b+_*w,a[5]=c*m+d*A+_*y,a[8]=c*p+d*S+_*P,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],h=t[7],f=t[8];return e*r*f-e*o*h-n*a*f+n*o*l+s*a*h-s*r*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],h=t[7],f=t[8],u=f*r-o*h,c=o*l-f*a,d=h*a-r*l,_=e*u+n*c+s*d;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const M=1/_;return t[0]=u*M,t[1]=(s*h-f*n)*M,t[2]=(o*n-s*r)*M,t[3]=c*M,t[4]=(f*e-s*l)*M,t[5]=(s*a-o*e)*M,t[6]=d*M,t[7]=(n*l-h*e)*M,t[8]=(r*e-n*a)*M,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,a,r,o){const l=Math.cos(a),h=Math.sin(a);return this.set(n*l,n*h,-n*(l*r+h*o)+r+t,-s*h,s*l,-s*(-h*r+l*o)+o+e,0,0,1),this}scale(t,e){return us("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Nr.makeScale(t,e)),this}rotate(t){return us("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Nr.makeRotation(-t)),this}translate(t,e){return us("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Nr.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Jl.prototype.isMatrix3=!0;let Dt=Jl;const Nr=new Dt,vh=new Dt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Mh=new Dt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function md(){const i={enabled:!0,workingColorSpace:ja,spaces:{},convert:function(s,a,r){return this.enabled===!1||a===r||!a||!r||(this.spaces[a].transfer===jt&&(s.r=ki(s.r),s.g=ki(s.g),s.b=ki(s.b)),this.spaces[a].primaries!==this.spaces[r].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===jt&&(s.r=fs(s.r),s.g=fs(s.g),s.b=fs(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===an?tr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,r){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[r].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return us("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return us("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,a)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ja]:{primaries:t,whitePoint:n,transfer:tr,toXYZ:vh,fromXYZ:Mh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:ii},outputColorSpaceConfig:{drawingBufferColorSpace:ii}},[ii]:{primaries:t,whitePoint:n,transfer:jt,toXYZ:vh,fromXYZ:Mh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:ii}}}),i}const Wt=md();function ki(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function fs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Gn;class _d{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Gn===void 0&&(Gn=er("canvas")),Gn.width=t.width,Gn.height=t.height;const s=Gn.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=Gn}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=er("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),a=s.data;for(let r=0;r<a.length;r++)a[r]=ki(a[r]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ki(e[n]/255)*255):e[n]=ki(e[n]);return{data:e,width:t.width,height:t.height}}else return Lt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let gd=0;class Pl{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:gd++}),this.uuid=hn(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let r=0,o=s.length;r<o;r++)s[r].isDataTexture?a.push(Dr(s[r].image)):a.push(Dr(s[r]))}else a=Dr(s);n.url=a}return e||(t.images[this.uuid]=n),n}}function Dr(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?_d.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Lt("Texture: Unable to serialize Texture."),{})}let vd=0;const Ur=new U;class Be extends _n{constructor(t=Be.DEFAULT_IMAGE,e=Be.DEFAULT_MAPPING,n=Bi,s=Bi,a=Ge,r=An,o=mi,l=ni,h=Be.DEFAULT_ANISOTROPY,f=an){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:vd++}),this.uuid=hn(),this.name="",this.source=new Pl(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=a,this.minFilter=r,this.anisotropy=h,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Rt(0,0),this.repeat=new Rt(1,1),this.center=new Rt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Dt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ur).x}get height(){return this.source.getSize(Ur).y}get depth(){return this.source.getSize(Ur).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const e in t){const n=t[e];if(n===void 0){Lt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){Lt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==tu)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case bo:t.x=t.x-Math.floor(t.x);break;case Bi:t.x=t.x<0?0:1;break;case To:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case bo:t.y=t.y-Math.floor(t.y);break;case Bi:t.y=t.y<0?0:1;break;case To:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Be.DEFAULT_IMAGE=null;Be.DEFAULT_MAPPING=tu;Be.DEFAULT_ANISOTROPY=1;const Ql=class Ql{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,a=this.w,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s+r[12]*a,this.y=r[1]*e+r[5]*n+r[9]*s+r[13]*a,this.z=r[2]*e+r[6]*n+r[10]*s+r[14]*a,this.w=r[3]*e+r[7]*n+r[11]*s+r[15]*a,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,a;const l=t.elements,h=l[0],f=l[4],u=l[8],c=l[1],d=l[5],_=l[9],M=l[2],m=l[6],p=l[10];if(Math.abs(f-c)<.01&&Math.abs(u-M)<.01&&Math.abs(_-m)<.01){if(Math.abs(f+c)<.1&&Math.abs(u+M)<.1&&Math.abs(_+m)<.1&&Math.abs(h+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const A=(h+1)/2,S=(d+1)/2,w=(p+1)/2,y=(f+c)/4,P=(u+M)/4,v=(_+m)/4;return A>S&&A>w?A<.01?(n=0,s=.707106781,a=.707106781):(n=Math.sqrt(A),s=y/n,a=P/n):S>w?S<.01?(n=.707106781,s=0,a=.707106781):(s=Math.sqrt(S),n=y/s,a=v/s):w<.01?(n=.707106781,s=.707106781,a=0):(a=Math.sqrt(w),n=P/a,s=v/a),this.set(n,s,a,e),this}let b=Math.sqrt((m-_)*(m-_)+(u-M)*(u-M)+(c-f)*(c-f));return Math.abs(b)<.001&&(b=1),this.x=(m-_)/b,this.y=(u-M)/b,this.z=(c-f)/b,this.w=Math.acos((h+d+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=kt(this.x,t.x,e.x),this.y=kt(this.y,t.y,e.y),this.z=kt(this.z,t.z,e.z),this.w=kt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=kt(this.x,t,e),this.y=kt(this.y,t,e),this.z=kt(this.z,t,e),this.w=kt(this.w,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Ql.prototype.isVector4=!0;let ue=Ql;class Md extends _n{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ge,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new ue(0,0,t,e),this.scissorTest=!1,this.viewport=new ue(0,0,t,e),this.textures=[];const s={width:t,height:e,depth:n.depth},a=new Be(s),r=n.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){const e={minFilter:Ge,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;const s=Object.assign({},t.textures[e].image);this.textures[e].source=new Pl(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ri extends Md{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class hu extends Be{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ne,this.minFilter=Ne,this.wrapR=Bi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class xd extends Be{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ne,this.minFilter=Ne,this.wrapR=Bi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const mr=class mr{constructor(t,e,n,s,a,r,o,l,h,f,u,c,d,_,M,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,a,r,o,l,h,f,u,c,d,_,M,m)}set(t,e,n,s,a,r,o,l,h,f,u,c,d,_,M,m){const p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=a,p[5]=r,p[9]=o,p[13]=l,p[2]=h,p[6]=f,p[10]=u,p[14]=c,p[3]=d,p[7]=_,p[11]=M,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new mr().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const e=this.elements,n=t.elements,s=1/Bn.setFromMatrixColumn(t,0).length(),a=1/Bn.setFromMatrixColumn(t,1).length(),r=1/Bn.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*a,e[5]=n[5]*a,e[6]=n[6]*a,e[7]=0,e[8]=n[8]*r,e[9]=n[9]*r,e[10]=n[10]*r,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,a=t.z,r=Math.cos(n),o=Math.sin(n),l=Math.cos(s),h=Math.sin(s),f=Math.cos(a),u=Math.sin(a);if(t.order==="XYZ"){const c=r*f,d=r*u,_=o*f,M=o*u;e[0]=l*f,e[4]=-l*u,e[8]=h,e[1]=d+_*h,e[5]=c-M*h,e[9]=-o*l,e[2]=M-c*h,e[6]=_+d*h,e[10]=r*l}else if(t.order==="YXZ"){const c=l*f,d=l*u,_=h*f,M=h*u;e[0]=c+M*o,e[4]=_*o-d,e[8]=r*h,e[1]=r*u,e[5]=r*f,e[9]=-o,e[2]=d*o-_,e[6]=M+c*o,e[10]=r*l}else if(t.order==="ZXY"){const c=l*f,d=l*u,_=h*f,M=h*u;e[0]=c-M*o,e[4]=-r*u,e[8]=_+d*o,e[1]=d+_*o,e[5]=r*f,e[9]=M-c*o,e[2]=-r*h,e[6]=o,e[10]=r*l}else if(t.order==="ZYX"){const c=r*f,d=r*u,_=o*f,M=o*u;e[0]=l*f,e[4]=_*h-d,e[8]=c*h+M,e[1]=l*u,e[5]=M*h+c,e[9]=d*h-_,e[2]=-h,e[6]=o*l,e[10]=r*l}else if(t.order==="YZX"){const c=r*l,d=r*h,_=o*l,M=o*h;e[0]=l*f,e[4]=M-c*u,e[8]=_*u+d,e[1]=u,e[5]=r*f,e[9]=-o*f,e[2]=-h*f,e[6]=d*u+_,e[10]=c-M*u}else if(t.order==="XZY"){const c=r*l,d=r*h,_=o*l,M=o*h;e[0]=l*f,e[4]=-u,e[8]=h*f,e[1]=c*u+M,e[5]=r*f,e[9]=d*u-_,e[2]=_*u-d,e[6]=o*f,e[10]=M*u+c}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Sd,t,yd)}lookAt(t,e,n){const s=this.elements;return ti.subVectors(t,e),ti.lengthSq()===0&&(ti.z=1),ti.normalize(),Ji.crossVectors(n,ti),Ji.lengthSq()===0&&(Math.abs(n.z)===1?ti.x+=1e-4:ti.z+=1e-4,ti.normalize(),Ji.crossVectors(n,ti)),Ji.normalize(),oa.crossVectors(ti,Ji),s[0]=Ji.x,s[4]=oa.x,s[8]=ti.x,s[1]=Ji.y,s[5]=oa.y,s[9]=ti.y,s[2]=Ji.z,s[6]=oa.z,s[10]=ti.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,a=this.elements,r=n[0],o=n[4],l=n[8],h=n[12],f=n[1],u=n[5],c=n[9],d=n[13],_=n[2],M=n[6],m=n[10],p=n[14],b=n[3],A=n[7],S=n[11],w=n[15],y=s[0],P=s[4],v=s[8],E=s[12],C=s[1],R=s[5],D=s[9],H=s[13],q=s[2],B=s[6],X=s[10],V=s[14],J=s[3],tt=s[7],dt=s[11],gt=s[15];return a[0]=r*y+o*C+l*q+h*J,a[4]=r*P+o*R+l*B+h*tt,a[8]=r*v+o*D+l*X+h*dt,a[12]=r*E+o*H+l*V+h*gt,a[1]=f*y+u*C+c*q+d*J,a[5]=f*P+u*R+c*B+d*tt,a[9]=f*v+u*D+c*X+d*dt,a[13]=f*E+u*H+c*V+d*gt,a[2]=_*y+M*C+m*q+p*J,a[6]=_*P+M*R+m*B+p*tt,a[10]=_*v+M*D+m*X+p*dt,a[14]=_*E+M*H+m*V+p*gt,a[3]=b*y+A*C+S*q+w*J,a[7]=b*P+A*R+S*B+w*tt,a[11]=b*v+A*D+S*X+w*dt,a[15]=b*E+A*H+S*V+w*gt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],a=t[12],r=t[1],o=t[5],l=t[9],h=t[13],f=t[2],u=t[6],c=t[10],d=t[14],_=t[3],M=t[7],m=t[11],p=t[15],b=l*d-h*c,A=o*d-h*u,S=o*c-l*u,w=r*d-h*f,y=r*c-l*f,P=r*u-o*f;return e*(M*b-m*A+p*S)-n*(_*b-m*w+p*y)+s*(_*A-M*w+p*P)-a*(_*S-M*y+m*P)}determinantAffine(){const t=this.elements,e=t[0],n=t[4],s=t[8],a=t[1],r=t[5],o=t[9],l=t[2],h=t[6],f=t[10];return e*(r*f-o*h)-n*(a*f-o*l)+s*(a*h-r*l)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],h=t[7],f=t[8],u=t[9],c=t[10],d=t[11],_=t[12],M=t[13],m=t[14],p=t[15],b=e*o-n*r,A=e*l-s*r,S=e*h-a*r,w=n*l-s*o,y=n*h-a*o,P=s*h-a*l,v=f*M-u*_,E=f*m-c*_,C=f*p-d*_,R=u*m-c*M,D=u*p-d*M,H=c*p-d*m,q=b*H-A*D+S*R+w*C-y*E+P*v;if(q===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const B=1/q;return t[0]=(o*H-l*D+h*R)*B,t[1]=(s*D-n*H-a*R)*B,t[2]=(M*P-m*y+p*w)*B,t[3]=(c*y-u*P-d*w)*B,t[4]=(l*C-r*H-h*E)*B,t[5]=(e*H-s*C+a*E)*B,t[6]=(m*S-_*P-p*A)*B,t[7]=(f*P-c*S+d*A)*B,t[8]=(r*D-o*C+h*v)*B,t[9]=(n*C-e*D-a*v)*B,t[10]=(_*y-M*S+p*b)*B,t[11]=(u*S-f*y-d*b)*B,t[12]=(o*E-r*R-l*v)*B,t[13]=(e*R-n*E+s*v)*B,t[14]=(M*A-_*w-m*b)*B,t[15]=(f*w-u*A+c*b)*B,this}scale(t){const e=this.elements,n=t.x,s=t.y,a=t.z;return e[0]*=n,e[4]*=s,e[8]*=a,e[1]*=n,e[5]*=s,e[9]*=a,e[2]*=n,e[6]*=s,e[10]*=a,e[3]*=n,e[7]*=s,e[11]*=a,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),a=1-n,r=t.x,o=t.y,l=t.z,h=a*r,f=a*o;return this.set(h*r+n,h*o-s*l,h*l+s*o,0,h*o+s*l,f*o+n,f*l-s*r,0,h*l-s*o,f*l+s*r,a*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,a,r){return this.set(1,n,a,0,t,1,r,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,a=e._x,r=e._y,o=e._z,l=e._w,h=a+a,f=r+r,u=o+o,c=a*h,d=a*f,_=a*u,M=r*f,m=r*u,p=o*u,b=l*h,A=l*f,S=l*u,w=n.x,y=n.y,P=n.z;return s[0]=(1-(M+p))*w,s[1]=(d+S)*w,s[2]=(_-A)*w,s[3]=0,s[4]=(d-S)*y,s[5]=(1-(c+p))*y,s[6]=(m+b)*y,s[7]=0,s[8]=(_+A)*P,s[9]=(m-b)*P,s[10]=(1-(c+M))*P,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];const a=this.determinantAffine();if(a===0)return n.set(1,1,1),e.identity(),this;let r=Bn.set(s[0],s[1],s[2]).length();const o=Bn.set(s[4],s[5],s[6]).length(),l=Bn.set(s[8],s[9],s[10]).length();a<0&&(r=-r),fi.copy(this);const h=1/r,f=1/o,u=1/l;return fi.elements[0]*=h,fi.elements[1]*=h,fi.elements[2]*=h,fi.elements[4]*=f,fi.elements[5]*=f,fi.elements[6]*=f,fi.elements[8]*=u,fi.elements[9]*=u,fi.elements[10]*=u,e.setFromRotationMatrix(fi),n.x=r,n.y=o,n.z=l,this}makePerspective(t,e,n,s,a,r,o=Ai,l=!1){const h=this.elements,f=2*a/(e-t),u=2*a/(n-s),c=(e+t)/(e-t),d=(n+s)/(n-s);let _,M;if(l)_=a/(r-a),M=r*a/(r-a);else if(o===Ai)_=-(r+a)/(r-a),M=-2*r*a/(r-a);else if(o===qs)_=-r/(r-a),M=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return h[0]=f,h[4]=0,h[8]=c,h[12]=0,h[1]=0,h[5]=u,h[9]=d,h[13]=0,h[2]=0,h[6]=0,h[10]=_,h[14]=M,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(t,e,n,s,a,r,o=Ai,l=!1){const h=this.elements,f=2/(e-t),u=2/(n-s),c=-(e+t)/(e-t),d=-(n+s)/(n-s);let _,M;if(l)_=1/(r-a),M=r/(r-a);else if(o===Ai)_=-2/(r-a),M=-(r+a)/(r-a);else if(o===qs)_=-1/(r-a),M=-a/(r-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return h[0]=f,h[4]=0,h[8]=0,h[12]=c,h[1]=0,h[5]=u,h[9]=0,h[13]=d,h[2]=0,h[6]=0,h[10]=_,h[14]=M,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};mr.prototype.isMatrix4=!0;let le=mr;const Bn=new U,fi=new le,Sd=new U(0,0,0),yd=new U(1,1,1),Ji=new U,oa=new U,ti=new U,xh=new le,Sh=new fn;class dn{constructor(t=0,e=0,n=0,s=dn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,a=s[0],r=s[4],o=s[8],l=s[1],h=s[5],f=s[9],u=s[2],c=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(kt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-f,d),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(c,h),this._z=0);break;case"YXZ":this._x=Math.asin(-kt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,h)):(this._y=Math.atan2(-u,a),this._z=0);break;case"ZXY":this._x=Math.asin(kt(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-r,h)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-kt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(c,d),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,h));break;case"YZX":this._z=Math.asin(kt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,h),this._y=Math.atan2(-u,a)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-kt(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(c,h),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-f,d),this._y=0);break;default:Lt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return xh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(xh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Sh.setFromEuler(this),this.setFromQuaternion(Sh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}dn.DEFAULT_ORDER="XYZ";class Rl{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Ed=0;const yh=new U,zn=new fn,Di=new le,la=new U,Es=new U,bd=new U,Td=new fn,Eh=new U(1,0,0),bh=new U(0,1,0),Th=new U(0,0,1),wh={type:"added"},wd={type:"removed"},kn={type:"childadded",child:null},Fr={type:"childremoved",child:null};class we extends _n{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Ed++}),this.uuid=hn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=we.DEFAULT_UP.clone();const t=new U,e=new dn,n=new fn,s=new U(1,1,1);function a(){n.setFromEuler(e,!1)}function r(){e.setFromQuaternion(n,void 0,!1)}e._onChange(a),n._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new le},normalMatrix:{value:new Dt}}),this.matrix=new le,this.matrixWorld=new le,this.matrixAutoUpdate=we.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=we.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Rl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return zn.setFromAxisAngle(t,e),this.quaternion.multiply(zn),this}rotateOnWorldAxis(t,e){return zn.setFromAxisAngle(t,e),this.quaternion.premultiply(zn),this}rotateX(t){return this.rotateOnAxis(Eh,t)}rotateY(t){return this.rotateOnAxis(bh,t)}rotateZ(t){return this.rotateOnAxis(Th,t)}translateOnAxis(t,e){return yh.copy(t).applyQuaternion(this.quaternion),this.position.add(yh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Eh,t)}translateY(t){return this.translateOnAxis(bh,t)}translateZ(t){return this.translateOnAxis(Th,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Di.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?la.copy(t):la.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Es.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Di.lookAt(Es,la,this.up):Di.lookAt(la,Es,this.up),this.quaternion.setFromRotationMatrix(Di),s&&(Di.extractRotation(s.matrixWorld),zn.setFromRotationMatrix(Di),this.quaternion.premultiply(zn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Vt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(wh),kn.child=t,this.dispatchEvent(kn),kn.child=null):Vt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(wd),Fr.child=t,this.dispatchEvent(Fr),Fr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Di.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Di.multiply(t.parent.matrixWorld)),t.applyMatrix4(Di),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(wh),kn.child=t,this.dispatchEvent(kn),kn.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const r=this.children[n].getObjectByProperty(t,e);if(r!==void 0)return r}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let a=0,r=s.length;a<r;a++)s[a].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Es,t,bd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Es,Td,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const e=t.x,n=t.y,s=t.z,a=this.matrix.elements;a[12]+=e-a[0]*e-a[4]*n-a[8]*s,a[13]+=n-a[1]*e-a[5]*n-a[9]*s,a[14]+=s-a[2]*e-a[6]*n-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){const s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){const a=this.children;for(let r=0,o=a.length;r<o;r++)a[r].updateWorldMatrix(!1,!0,n)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let h=0,f=l.length;h<f;h++){const u=l[h];a(t.shapes,u)}else a(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,h=this.material.length;l<h;l++)o.push(a(t.materials,this.material[l]));s.material=o}else s.material=a(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];s.animations.push(a(t.animations,l))}}if(e){const o=r(t.geometries),l=r(t.materials),h=r(t.textures),f=r(t.images),u=r(t.shapes),c=r(t.skeletons),d=r(t.animations),_=r(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),h.length>0&&(n.textures=h),f.length>0&&(n.images=f),u.length>0&&(n.shapes=u),c.length>0&&(n.skeletons=c),d.length>0&&(n.animations=d),_.length>0&&(n.nodes=_)}return n.object=s,n;function r(o){const l=[];for(const h in o){const f=o[h];delete f.metadata,l.push(f)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}we.DEFAULT_UP=new U(0,1,0);we.DEFAULT_MATRIX_AUTO_UPDATE=!0;we.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class ns extends we{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Ad={type:"move"};class Or{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ns,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ns,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ns,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,a=null,r=null;const o=this._targetRay,l=this._grip,h=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(h&&t.hand){r=!0;for(const M of t.hand.values()){const m=e.getJointPose(M,n),p=this._getHandJoint(h,M);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const f=h.joints["index-finger-tip"],u=h.joints["thumb-tip"],c=f.position.distanceTo(u.position),d=.02,_=.005;h.inputState.pinching&&c>d+_?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!h.inputState.pinching&&c<=d-_&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(a=e.getPose(t.gripSpace,n),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&a!==null&&(s=a),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Ad)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=a!==null),h!==null&&(h.visible=r!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new ns;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const cu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Qi={h:0,s:0,l:0},ha={h:0,s:0,l:0};function Gr(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Et{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=ii){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Wt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=Wt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Wt.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=Wt.workingColorSpace){if(t=dd(t,1),e=kt(e,0,1),n=kt(n,0,1),e===0)this.r=this.g=this.b=n;else{const a=n<=.5?n*(1+e):n+e-n*e,r=2*n-a;this.r=Gr(r,a,t+1/3),this.g=Gr(r,a,t),this.b=Gr(r,a,t-1/3)}return Wt.colorSpaceToWorking(this,s),this}setStyle(t,e=ii){function n(a){a!==void 0&&parseFloat(a)<1&&Lt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let a;const r=s[1],o=s[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,e);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,e);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,e);break;default:Lt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const a=s[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,e);if(r===6)return this.setHex(parseInt(a,16),e);Lt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=ii){const n=cu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Lt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ki(t.r),this.g=ki(t.g),this.b=ki(t.b),this}copyLinearToSRGB(t){return this.r=fs(t.r),this.g=fs(t.g),this.b=fs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ii){return Wt.workingToColorSpace(Fe.copy(this),t),Math.round(kt(Fe.r*255,0,255))*65536+Math.round(kt(Fe.g*255,0,255))*256+Math.round(kt(Fe.b*255,0,255))}getHexString(t=ii){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Wt.workingColorSpace){Wt.workingToColorSpace(Fe.copy(this),e);const n=Fe.r,s=Fe.g,a=Fe.b,r=Math.max(n,s,a),o=Math.min(n,s,a);let l,h;const f=(o+r)/2;if(o===r)l=0,h=0;else{const u=r-o;switch(h=f<=.5?u/(r+o):u/(2-r-o),r){case n:l=(s-a)/u+(s<a?6:0);break;case s:l=(a-n)/u+2;break;case a:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=h,t.l=f,t}getRGB(t,e=Wt.workingColorSpace){return Wt.workingToColorSpace(Fe.copy(this),e),t.r=Fe.r,t.g=Fe.g,t.b=Fe.b,t}getStyle(t=ii){Wt.workingToColorSpace(Fe.copy(this),t);const e=Fe.r,n=Fe.g,s=Fe.b;return t!==ii?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Qi),this.setHSL(Qi.h+t,Qi.s+e,Qi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Qi),t.getHSL(ha);const n=Ir(Qi.h,ha.h,e),s=Ir(Qi.s,ha.s,e),a=Ir(Qi.l,ha.l,e);return this.setHSL(n,s,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,a=t.elements;return this.r=a[0]*e+a[3]*n+a[6]*s,this.g=a[1]*e+a[4]*n+a[7]*s,this.b=a[2]*e+a[5]*n+a[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Fe=new Et;Et.NAMES=cu;class gr{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Et(t),this.density=e}clone(){return new gr(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Pd extends we{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new dn,this.environmentIntensity=1,this.environmentRotation=new dn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}const di=new U,Ui=new U,Br=new U,Fi=new U,Hn=new U,Vn=new U,Ah=new U,zr=new U,kr=new U,Hr=new U,Vr=new ue,Wr=new ue,Xr=new ue;class hi{constructor(t=new U,e=new U,n=new U){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),di.subVectors(t,e),s.cross(di);const a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(t,e,n,s,a){di.subVectors(s,e),Ui.subVectors(n,e),Br.subVectors(t,e);const r=di.dot(di),o=di.dot(Ui),l=di.dot(Br),h=Ui.dot(Ui),f=Ui.dot(Br),u=r*h-o*o;if(u===0)return a.set(0,0,0),null;const c=1/u,d=(h*l-o*f)*c,_=(r*f-o*l)*c;return a.set(1-d-_,_,d)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Fi)===null?!1:Fi.x>=0&&Fi.y>=0&&Fi.x+Fi.y<=1}static getInterpolation(t,e,n,s,a,r,o,l){return this.getBarycoord(t,e,n,s,Fi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,Fi.x),l.addScaledVector(r,Fi.y),l.addScaledVector(o,Fi.z),l)}static getInterpolatedAttribute(t,e,n,s,a,r){return Vr.setScalar(0),Wr.setScalar(0),Xr.setScalar(0),Vr.fromBufferAttribute(t,e),Wr.fromBufferAttribute(t,n),Xr.fromBufferAttribute(t,s),r.setScalar(0),r.addScaledVector(Vr,a.x),r.addScaledVector(Wr,a.y),r.addScaledVector(Xr,a.z),r}static isFrontFacing(t,e,n,s){return di.subVectors(n,e),Ui.subVectors(t,e),di.cross(Ui).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return di.subVectors(this.c,this.b),Ui.subVectors(this.a,this.b),di.cross(Ui).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return hi.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return hi.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,a){return hi.getInterpolation(t,this.a,this.b,this.c,e,n,s,a)}containsPoint(t){return hi.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return hi.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,a=this.c;let r,o;Hn.subVectors(s,n),Vn.subVectors(a,n),zr.subVectors(t,n);const l=Hn.dot(zr),h=Vn.dot(zr);if(l<=0&&h<=0)return e.copy(n);kr.subVectors(t,s);const f=Hn.dot(kr),u=Vn.dot(kr);if(f>=0&&u<=f)return e.copy(s);const c=l*u-f*h;if(c<=0&&l>=0&&f<=0)return r=l/(l-f),e.copy(n).addScaledVector(Hn,r);Hr.subVectors(t,a);const d=Hn.dot(Hr),_=Vn.dot(Hr);if(_>=0&&d<=_)return e.copy(a);const M=d*h-l*_;if(M<=0&&h>=0&&_<=0)return o=h/(h-_),e.copy(n).addScaledVector(Vn,o);const m=f*_-d*u;if(m<=0&&u-f>=0&&d-_>=0)return Ah.subVectors(a,s),o=(u-f)/(u-f+(d-_)),e.copy(s).addScaledVector(Ah,o);const p=1/(m+M+c);return r=M*p,o=c*p,e.copy(n).addScaledVector(Hn,r).addScaledVector(Vn,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class Js{constructor(t=new U(1/0,1/0,1/0),e=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(pi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(pi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=pi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const a=n.getAttribute("position");if(e===!0&&a!==void 0&&t.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)t.isMesh===!0?t.getVertexPosition(r,pi):pi.fromBufferAttribute(a,r),pi.applyMatrix4(t.matrixWorld),this.expandByPoint(pi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ca.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ca.copy(n.boundingBox)),ca.applyMatrix4(t.matrixWorld),this.union(ca)}const s=t.children;for(let a=0,r=s.length;a<r;a++)this.expandByObject(s[a],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,pi),pi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(bs),ua.subVectors(this.max,bs),Wn.subVectors(t.a,bs),Xn.subVectors(t.b,bs),qn.subVectors(t.c,bs),ji.subVectors(Xn,Wn),tn.subVectors(qn,Xn),Mn.subVectors(Wn,qn);let e=[0,-ji.z,ji.y,0,-tn.z,tn.y,0,-Mn.z,Mn.y,ji.z,0,-ji.x,tn.z,0,-tn.x,Mn.z,0,-Mn.x,-ji.y,ji.x,0,-tn.y,tn.x,0,-Mn.y,Mn.x,0];return!qr(e,Wn,Xn,qn,ua)||(e=[1,0,0,0,1,0,0,0,1],!qr(e,Wn,Xn,qn,ua))?!1:(fa.crossVectors(ji,tn),e=[fa.x,fa.y,fa.z],qr(e,Wn,Xn,qn,ua))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,pi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(pi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Oi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Oi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Oi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Oi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Oi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Oi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Oi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Oi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Oi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const Oi=[new U,new U,new U,new U,new U,new U,new U,new U],pi=new U,ca=new Js,Wn=new U,Xn=new U,qn=new U,ji=new U,tn=new U,Mn=new U,bs=new U,ua=new U,fa=new U,xn=new U;function qr(i,t,e,n,s){for(let a=0,r=i.length-3;a<=r;a+=3){xn.fromArray(i,a);const o=s.x*Math.abs(xn.x)+s.y*Math.abs(xn.y)+s.z*Math.abs(xn.z),l=t.dot(xn),h=e.dot(xn),f=n.dot(xn);if(Math.max(-Math.max(l,h,f),Math.min(l,h,f))>o)return!1}return!0}const ye=new U,da=new Rt;let Rd=0;class He extends _n{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Rd++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=nl,this.updateRanges=[],this.gpuType=wi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)da.fromBufferAttribute(this,e),da.applyMatrix3(t),this.setXY(e,da.x,da.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)ye.fromBufferAttribute(this,e),ye.applyMatrix3(t),this.setXYZ(e,ye.x,ye.y,ye.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)ye.fromBufferAttribute(this,e),ye.applyMatrix4(t),this.setXYZ(e,ye.x,ye.y,ye.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ye.fromBufferAttribute(this,e),ye.applyNormalMatrix(t),this.setXYZ(e,ye.x,ye.y,ye.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ye.fromBufferAttribute(this,e),ye.transformDirection(t),this.setXYZ(e,ye.x,ye.y,ye.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Ti(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ee(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Ti(e,this.array)),e}setX(t,e){return this.normalized&&(e=ee(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Ti(e,this.array)),e}setY(t,e){return this.normalized&&(e=ee(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Ti(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ee(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Ti(e,this.array)),e}setW(t,e){return this.normalized&&(e=ee(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ee(e,this.array),n=ee(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=ee(e,this.array),n=ee(n,this.array),s=ee(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,a){return t*=this.itemSize,this.normalized&&(e=ee(e,this.array),n=ee(n,this.array),s=ee(s,this.array),a=ee(a,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==nl&&(t.usage=this.usage),t}dispose(){this.dispatchEvent({type:"dispose"})}}class uu extends He{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class fu extends He{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class We extends He{constructor(t,e,n){super(new Float32Array(t),e,n)}}const Cd=new Js,Ts=new U,Yr=new U;class vr{constructor(t=new U,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Cd.setFromPoints(t).getCenter(n);let s=0;for(let a=0,r=t.length;a<r;a++)s=Math.max(s,n.distanceToSquared(t[a]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ts.subVectors(t,this.center);const e=Ts.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Ts,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Yr.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ts.copy(t.center).add(Yr)),this.expandByPoint(Ts.copy(t.center).sub(Yr))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}let Id=0;const ai=new le,$r=new we,Yn=new U,ei=new Js,ws=new Js,Ce=new U;class Xe extends _n{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Id++}),this.uuid=hn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(hd(t)?fu:uu)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const a=new Dt().getNormalMatrix(t);n.applyNormalMatrix(a),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return ai.makeRotationFromQuaternion(t),this.applyMatrix4(ai),this}rotateX(t){return ai.makeRotationX(t),this.applyMatrix4(ai),this}rotateY(t){return ai.makeRotationY(t),this.applyMatrix4(ai),this}rotateZ(t){return ai.makeRotationZ(t),this.applyMatrix4(ai),this}translate(t,e,n){return ai.makeTranslation(t,e,n),this.applyMatrix4(ai),this}scale(t,e,n){return ai.makeScale(t,e,n),this.applyMatrix4(ai),this}lookAt(t){return $r.lookAt(t),$r.updateMatrix(),this.applyMatrix4($r.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Yn).negate(),this.translate(Yn.x,Yn.y,Yn.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,a=t.length;s<a;s++){const r=t[s];n.push(r.x,r.y,r.z||0)}this.setAttribute("position",new We(n,3))}else{const n=Math.min(t.length,e.count);for(let s=0;s<n;s++){const a=t[s];e.setXYZ(s,a.x,a.y,a.z||0)}t.length>e.count&&Lt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Js);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Vt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const a=e[n];ei.setFromBufferAttribute(a),this.morphTargetsRelative?(Ce.addVectors(this.boundingBox.min,ei.min),this.boundingBox.expandByPoint(Ce),Ce.addVectors(this.boundingBox.max,ei.max),this.boundingBox.expandByPoint(Ce)):(this.boundingBox.expandByPoint(ei.min),this.boundingBox.expandByPoint(ei.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Vt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vr);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Vt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(t){const n=this.boundingSphere.center;if(ei.setFromBufferAttribute(t),e)for(let a=0,r=e.length;a<r;a++){const o=e[a];ws.setFromBufferAttribute(o),this.morphTargetsRelative?(Ce.addVectors(ei.min,ws.min),ei.expandByPoint(Ce),Ce.addVectors(ei.max,ws.max),ei.expandByPoint(Ce)):(ei.expandByPoint(ws.min),ei.expandByPoint(ws.max))}ei.getCenter(n);let s=0;for(let a=0,r=t.count;a<r;a++)Ce.fromBufferAttribute(t,a),s=Math.max(s,n.distanceToSquared(Ce));if(e)for(let a=0,r=e.length;a<r;a++){const o=e[a],l=this.morphTargetsRelative;for(let h=0,f=o.count;h<f;h++)Ce.fromBufferAttribute(o,h),l&&(Yn.fromBufferAttribute(t,h),Ce.add(Yn)),s=Math.max(s,n.distanceToSquared(Ce))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Vt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Vt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,a=e.uv;let r=this.getAttribute("tangent");(r===void 0||r.count!==n.count)&&(r=new He(new Float32Array(4*n.count),4),this.setAttribute("tangent",r));const o=[],l=[];for(let v=0;v<n.count;v++)o[v]=new U,l[v]=new U;const h=new U,f=new U,u=new U,c=new Rt,d=new Rt,_=new Rt,M=new U,m=new U;function p(v,E,C){h.fromBufferAttribute(n,v),f.fromBufferAttribute(n,E),u.fromBufferAttribute(n,C),c.fromBufferAttribute(a,v),d.fromBufferAttribute(a,E),_.fromBufferAttribute(a,C),f.sub(h),u.sub(h),d.sub(c),_.sub(c);const R=1/(d.x*_.y-_.x*d.y);isFinite(R)&&(M.copy(f).multiplyScalar(_.y).addScaledVector(u,-d.y).multiplyScalar(R),m.copy(u).multiplyScalar(d.x).addScaledVector(f,-_.x).multiplyScalar(R),o[v].add(M),o[E].add(M),o[C].add(M),l[v].add(m),l[E].add(m),l[C].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let v=0,E=b.length;v<E;++v){const C=b[v],R=C.start,D=C.count;for(let H=R,q=R+D;H<q;H+=3)p(t.getX(H+0),t.getX(H+1),t.getX(H+2))}const A=new U,S=new U,w=new U,y=new U;function P(v){w.fromBufferAttribute(s,v),y.copy(w);const E=o[v];A.copy(E),A.sub(w.multiplyScalar(w.dot(E))).normalize(),S.crossVectors(y,E);const R=S.dot(l[v])<0?-1:1;r.setXYZW(v,A.x,A.y,A.z,R)}for(let v=0,E=b.length;v<E;++v){const C=b[v],R=C.start,D=C.count;for(let H=R,q=R+D;H<q;H+=3)P(t.getX(H+0)),P(t.getX(H+1)),P(t.getX(H+2))}this._transformed=!0}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new He(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let c=0,d=n.count;c<d;c++)n.setXYZ(c,0,0,0);const s=new U,a=new U,r=new U,o=new U,l=new U,h=new U,f=new U,u=new U;if(t)for(let c=0,d=t.count;c<d;c+=3){const _=t.getX(c+0),M=t.getX(c+1),m=t.getX(c+2);s.fromBufferAttribute(e,_),a.fromBufferAttribute(e,M),r.fromBufferAttribute(e,m),f.subVectors(r,a),u.subVectors(s,a),f.cross(u),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,M),h.fromBufferAttribute(n,m),o.add(f),l.add(f),h.add(f),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(M,l.x,l.y,l.z),n.setXYZ(m,h.x,h.y,h.z)}else for(let c=0,d=e.count;c<d;c+=3)s.fromBufferAttribute(e,c+0),a.fromBufferAttribute(e,c+1),r.fromBufferAttribute(e,c+2),f.subVectors(r,a),u.subVectors(s,a),f.cross(u),n.setXYZ(c+0,f.x,f.y,f.z),n.setXYZ(c+1,f.x,f.y,f.z),n.setXYZ(c+2,f.x,f.y,f.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ce.fromBufferAttribute(t,e),Ce.normalize(),t.setXYZ(e,Ce.x,Ce.y,Ce.z)}toNonIndexed(){function t(o,l){const h=o.array,f=o.itemSize,u=o.normalized,c=new h.constructor(l.length*f);let d=0,_=0;for(let M=0,m=l.length;M<m;M++){o.isInterleavedBufferAttribute?d=l[M]*o.data.stride+o.offset:d=l[M]*f;for(let p=0;p<f;p++)c[_++]=h[d++]}return new He(c,f,u)}if(this.index===null)return Lt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Xe,n=this.index.array,s=this.attributes;for(const o in s){const l=s[o],h=t(l,n);e.setAttribute(o,h)}const a=this.morphAttributes;for(const o in a){const l=[],h=a[o];for(let f=0,u=h.length;f<u;f++){const c=h[f],d=t(c,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const r=this.groups;for(let o=0,l=r.length;o<l;o++){const h=r[o];e.addGroup(h.start,h.count,h.materialIndex)}return e}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const l=this.parameters;for(const h in l)l[h]!==void 0&&(t[h]=l[h]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const h=n[l];t.data.attributes[l]=h.toJSON(t.data)}const s={};let a=!1;for(const l in this.morphAttributes){const h=this.morphAttributes[l],f=[];for(let u=0,c=h.length;u<c;u++){const d=h[u];f.push(d.toJSON(t.data))}f.length>0&&(s[l]=f,a=!0)}a&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const r=this.groups;r.length>0&&(t.data.groups=JSON.parse(JSON.stringify(r)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone());const s=t.attributes;for(const h in s){const f=s[h];this.setAttribute(h,f.clone(e))}const a=t.morphAttributes;for(const h in a){const f=[],u=a[h];for(let c=0,d=u.length;c<d;c++)f.push(u[c].clone(e));this.morphAttributes[h]=f}this.morphTargetsRelative=t.morphTargetsRelative;const r=t.groups;for(let h=0,f=r.length;h<f;h++){const u=r[h];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ld{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=nl,this.updateRanges=[],this.version=0,this.uuid=hn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,a=this.stride;s<a;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=hn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=hn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const ze=new U;class nr{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.applyMatrix4(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.applyNormalMatrix(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)ze.fromBufferAttribute(this,e),ze.transformDirection(t),this.setXYZ(e,ze.x,ze.y,ze.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Ti(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ee(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=ee(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ee(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ee(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ee(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Ti(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Ti(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Ti(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Ti(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=ee(e,this.array),n=ee(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=ee(e,this.array),n=ee(n,this.array),s=ee(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,a){return t=t*this.data.stride+this.offset,this.normalized&&(e=ee(e,this.array),n=ee(n,this.array),s=ee(s,this.array),a=ee(a,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=a,this}clone(t){if(t===void 0){ir("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)e.push(this.data.array[s+a])}return new He(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new nr(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){ir("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)e.push(this.data.array[s+a])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}let Nd=0;class Dn extends _n{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Nd++}),this.uuid=hn(),this.name="",this.type="Material",this.blending=cs,this.side=un,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=mo,this.blendDst=_o,this.blendEquation=Tn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Et(0,0,0),this.blendAlpha=0,this.depthFunc=_s,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ph,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=On,this.stencilZFail=On,this.stencilZPass=On,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){Lt(`Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){Lt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==cs&&(n.blending=this.blending),this.side!==un&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==mo&&(n.blendSrc=this.blendSrc),this.blendDst!==_o&&(n.blendDst=this.blendDst),this.blendEquation!==Tn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==_s&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ph&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==On&&(n.stencilFail=this.stencilFail),this.stencilZFail!==On&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==On&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(a){const r=[];for(const o in a){const l=a[o];delete l.metadata,r.push(l)}return r}if(e){const a=s(t.textures),r=s(t.images);a.length>0&&(n.textures=a),r.length>0&&(n.images=r)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Et().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Rt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Rt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let a=0;a!==s;++a)n[a]=e[a].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class du extends Dn{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Et(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let $n;const As=new U,Kn=new U,Zn=new U,Jn=new Rt,Ps=new Rt,pu=new le,pa=new U,Rs=new U,ma=new U,Ph=new Rt,Kr=new Rt,Rh=new Rt;class Dd extends we{constructor(t=new du){if(super(),this.isSprite=!0,this.type="Sprite",$n===void 0){$n=new Xe;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Ld(e,5);$n.setIndex([0,1,2,0,2,3]),$n.setAttribute("position",new nr(n,3,0,!1)),$n.setAttribute("uv",new nr(n,2,3,!1))}this.geometry=$n,this.material=t,this.center=new Rt(.5,.5),this.count=1}raycast(t,e){t.camera===null&&Vt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Kn.setFromMatrixScale(this.matrixWorld),pu.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Zn.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Kn.multiplyScalar(-Zn.z);const n=this.material.rotation;let s,a;n!==0&&(a=Math.cos(n),s=Math.sin(n));const r=this.center;_a(pa.set(-.5,-.5,0),Zn,r,Kn,s,a),_a(Rs.set(.5,-.5,0),Zn,r,Kn,s,a),_a(ma.set(.5,.5,0),Zn,r,Kn,s,a),Ph.set(0,0),Kr.set(1,0),Rh.set(1,1);let o=t.ray.intersectTriangle(pa,Rs,ma,!1,As);if(o===null&&(_a(Rs.set(-.5,.5,0),Zn,r,Kn,s,a),Kr.set(0,1),o=t.ray.intersectTriangle(pa,ma,Rs,!1,As),o===null))return;const l=t.ray.origin.distanceTo(As);l<t.near||l>t.far||e.push({distance:l,point:As.clone(),uv:hi.getInterpolation(As,pa,Rs,ma,Ph,Kr,Rh,new Rt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function _a(i,t,e,n,s,a){Jn.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(Ps.x=a*Jn.x-s*Jn.y,Ps.y=s*Jn.x+a*Jn.y):Ps.copy(Jn),i.copy(t),i.x+=Ps.x,i.y+=Ps.y,i.applyMatrix4(pu)}const Gi=new U,Zr=new U,ga=new U,en=new U,Jr=new U,va=new U,Qr=new U;class Mr{constructor(t=new U,e=new U(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Gi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Gi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Gi.copy(this.origin).addScaledVector(this.direction,e),Gi.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Zr.copy(t).add(e).multiplyScalar(.5),ga.copy(e).sub(t).normalize(),en.copy(this.origin).sub(Zr);const a=t.distanceTo(e)*.5,r=-this.direction.dot(ga),o=en.dot(this.direction),l=-en.dot(ga),h=en.lengthSq(),f=Math.abs(1-r*r);let u,c,d,_;if(f>0)if(u=r*l-o,c=r*o-l,_=a*f,u>=0)if(c>=-_)if(c<=_){const M=1/f;u*=M,c*=M,d=u*(u+r*c+2*o)+c*(r*u+c+2*l)+h}else c=a,u=Math.max(0,-(r*c+o)),d=-u*u+c*(c+2*l)+h;else c=-a,u=Math.max(0,-(r*c+o)),d=-u*u+c*(c+2*l)+h;else c<=-_?(u=Math.max(0,-(-r*a+o)),c=u>0?-a:Math.min(Math.max(-a,-l),a),d=-u*u+c*(c+2*l)+h):c<=_?(u=0,c=Math.min(Math.max(-a,-l),a),d=c*(c+2*l)+h):(u=Math.max(0,-(r*a+o)),c=u>0?a:Math.min(Math.max(-a,-l),a),d=-u*u+c*(c+2*l)+h);else c=r>0?-a:a,u=Math.max(0,-(r*c+o)),d=-u*u+c*(c+2*l)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Zr).addScaledVector(ga,c),d}intersectSphere(t,e){Gi.subVectors(t.center,this.origin);const n=Gi.dot(this.direction),s=Gi.dot(Gi)-n*n,a=t.radius*t.radius;if(s>a)return null;const r=Math.sqrt(a-s),o=n-r,l=n+r;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,a,r,o,l;const h=1/this.direction.x,f=1/this.direction.y,u=1/this.direction.z,c=this.origin;return h>=0?(n=(t.min.x-c.x)*h,s=(t.max.x-c.x)*h):(n=(t.max.x-c.x)*h,s=(t.min.x-c.x)*h),f>=0?(a=(t.min.y-c.y)*f,r=(t.max.y-c.y)*f):(a=(t.max.y-c.y)*f,r=(t.min.y-c.y)*f),n>r||a>s||((a>n||isNaN(n))&&(n=a),(r<s||isNaN(s))&&(s=r),u>=0?(o=(t.min.z-c.z)*u,l=(t.max.z-c.z)*u):(o=(t.max.z-c.z)*u,l=(t.min.z-c.z)*u),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Gi)!==null}intersectTriangle(t,e,n,s,a){Jr.subVectors(e,t),va.subVectors(n,t),Qr.crossVectors(Jr,va);let r=this.direction.dot(Qr),o;if(r>0){if(s)return null;o=1}else if(r<0)o=-1,r=-r;else return null;en.subVectors(this.origin,t);const l=o*this.direction.dot(va.crossVectors(en,va));if(l<0)return null;const h=o*this.direction.dot(Jr.cross(en));if(h<0||l+h>r)return null;const f=-o*en.dot(Qr);return f<0?null:this.at(f/r,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Cl extends Dn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Et(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new dn,this.combine=qc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Ch=new le,Sn=new Mr,Ma=new vr,Ih=new U,xa=new U,Sa=new U,ya=new U,jr=new U,Ea=new U,Lh=new U,ba=new U;class ui extends we{constructor(t=new Xe,e=new Cl){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){const o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,a=n.morphAttributes.position,r=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(a&&o){Ea.set(0,0,0);for(let l=0,h=a.length;l<h;l++){const f=o[l],u=a[l];f!==0&&(jr.fromBufferAttribute(u,t),r?Ea.addScaledVector(jr,f):Ea.addScaledVector(jr.sub(e),f))}e.add(Ea)}return e}raycast(t,e){const n=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ma.copy(n.boundingSphere),Ma.applyMatrix4(a),Sn.copy(t.ray).recast(t.near),!(Ma.containsPoint(Sn.origin)===!1&&(Sn.intersectSphere(Ma,Ih)===null||Sn.origin.distanceToSquared(Ih)>(t.far-t.near)**2))&&(Ch.copy(a).invert(),Sn.copy(t.ray).applyMatrix4(Ch),!(n.boundingBox!==null&&Sn.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Sn)))}_computeIntersections(t,e,n){let s;const a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,h=a.attributes.uv,f=a.attributes.uv1,u=a.attributes.normal,c=a.groups,d=a.drawRange;if(o!==null)if(Array.isArray(r))for(let _=0,M=c.length;_<M;_++){const m=c[_],p=r[m.materialIndex],b=Math.max(m.start,d.start),A=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let S=b,w=A;S<w;S+=3){const y=o.getX(S),P=o.getX(S+1),v=o.getX(S+2);s=Ta(this,p,t,n,h,f,u,y,P,v),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const _=Math.max(0,d.start),M=Math.min(o.count,d.start+d.count);for(let m=_,p=M;m<p;m+=3){const b=o.getX(m),A=o.getX(m+1),S=o.getX(m+2);s=Ta(this,r,t,n,h,f,u,b,A,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(r))for(let _=0,M=c.length;_<M;_++){const m=c[_],p=r[m.materialIndex],b=Math.max(m.start,d.start),A=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let S=b,w=A;S<w;S+=3){const y=S,P=S+1,v=S+2;s=Ta(this,p,t,n,h,f,u,y,P,v),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const _=Math.max(0,d.start),M=Math.min(l.count,d.start+d.count);for(let m=_,p=M;m<p;m+=3){const b=m,A=m+1,S=m+2;s=Ta(this,r,t,n,h,f,u,b,A,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function Ud(i,t,e,n,s,a,r,o){let l;if(t.side===Je?l=n.intersectTriangle(r,a,s,!0,o):l=n.intersectTriangle(s,a,r,t.side===un,o),l===null)return null;ba.copy(o),ba.applyMatrix4(i.matrixWorld);const h=e.ray.origin.distanceTo(ba);return h<e.near||h>e.far?null:{distance:h,point:ba.clone(),object:i}}function Ta(i,t,e,n,s,a,r,o,l,h){i.getVertexPosition(o,xa),i.getVertexPosition(l,Sa),i.getVertexPosition(h,ya);const f=Ud(i,t,e,n,xa,Sa,ya,Lh);if(f){const u=new U;hi.getBarycoord(Lh,xa,Sa,ya,u),s&&(f.uv=hi.getInterpolatedAttribute(s,o,l,h,u,new Rt)),a&&(f.uv1=hi.getInterpolatedAttribute(a,o,l,h,u,new Rt)),r&&(f.normal=hi.getInterpolatedAttribute(r,o,l,h,u,new U),f.normal.dot(n.direction)>0&&f.normal.multiplyScalar(-1));const c={a:o,b:l,c:h,normal:new U,materialIndex:0};hi.getNormal(xa,Sa,ya,c.normal),f.face=c,f.barycoord=u}return f}class Fd extends Be{constructor(t=null,e=1,n=1,s,a,r,o,l,h=Ne,f=Ne,u,c){super(null,r,o,l,h,f,s,a,u,c),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const to=new U,Od=new U,Gd=new Dt;class sn{constructor(t=new U(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=to.subVectors(n,e).cross(Od.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){const s=t.delta(to),a=this.normal.dot(s);if(a===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/a;return n===!0&&(r<0||r>1)?null:e.copy(t.start).addScaledVector(s,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||Gd.getNormalMatrix(t),s=this.coplanarPoint(to).applyMatrix4(t),a=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const yn=new vr,Bd=new Rt(.5,.5),wa=new U;class Il{constructor(t=new sn,e=new sn,n=new sn,s=new sn,a=new sn,r=new sn){this.planes=[t,e,n,s,a,r]}set(t,e,n,s,a,r){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(a),o[5].copy(r),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Ai,n=!1){const s=this.planes,a=t.elements,r=a[0],o=a[1],l=a[2],h=a[3],f=a[4],u=a[5],c=a[6],d=a[7],_=a[8],M=a[9],m=a[10],p=a[11],b=a[12],A=a[13],S=a[14],w=a[15];if(s[0].setComponents(h-r,d-f,p-_,w-b).normalize(),s[1].setComponents(h+r,d+f,p+_,w+b).normalize(),s[2].setComponents(h+o,d+u,p+M,w+A).normalize(),s[3].setComponents(h-o,d-u,p-M,w-A).normalize(),n)s[4].setComponents(l,c,m,S).normalize(),s[5].setComponents(h-l,d-c,p-m,w-S).normalize();else if(s[4].setComponents(h-l,d-c,p-m,w-S).normalize(),e===Ai)s[5].setComponents(h+l,d+c,p+m,w+S).normalize();else if(e===qs)s[5].setComponents(l,c,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),yn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),yn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(yn)}intersectsSprite(t){yn.center.set(0,0,0);const e=Bd.distanceTo(t.center);return yn.radius=.7071067811865476+e,yn.applyMatrix4(t.matrixWorld),this.intersectsSphere(yn)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let a=0;a<6;a++)if(e[a].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(wa.x=s.normal.x>0?t.max.x:t.min.x,wa.y=s.normal.y>0?t.max.y:t.min.y,wa.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(wa)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class mu extends Dn{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Et(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Nh=new le,al=new Mr,Aa=new vr,Pa=new U;class zd extends we{constructor(t=new Xe,e=new mu){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,a=t.params.Points.threshold,r=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Aa.copy(n.boundingSphere),Aa.applyMatrix4(s),Aa.radius+=a,t.ray.intersectsSphere(Aa)===!1)return;Nh.copy(s).invert(),al.copy(t.ray).applyMatrix4(Nh);const o=a/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,h=n.index,u=n.attributes.position;if(h!==null){const c=Math.max(0,r.start),d=Math.min(h.count,r.start+r.count);for(let _=c,M=d;_<M;_++){const m=h.getX(_);Pa.fromBufferAttribute(u,m),Dh(Pa,m,l,s,t,e,this)}}else{const c=Math.max(0,r.start),d=Math.min(u.count,r.start+r.count);for(let _=c,M=d;_<M;_++)Pa.fromBufferAttribute(u,_),Dh(Pa,_,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){const o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}}function Dh(i,t,e,n,s,a,r){const o=al.distanceSqToPoint(i);if(o<e){const l=new U;al.closestPointToPoint(i,l),l.applyMatrix4(n);const h=s.ray.origin.distanceTo(l);if(h<s.near||h>s.far)return;a.push({distance:h,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:r})}}class _u extends Be{constructor(t=[],e=Rn,n,s,a,r,o,l,h,f){super(t,e,n,s,a,r,o,l,h,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class kd extends Be{constructor(t,e,n,s,a,r,o,l,h){super(t,e,n,s,a,r,o,l,h),this.isCanvasTexture=!0,this.needsUpdate=!0}}class vs extends Be{constructor(t,e,n=Ii,s,a,r,o=Ne,l=Ne,h,f=qi,u=1){if(f!==qi&&f!==Pn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const c={width:t,height:e,depth:u};super(c,s,a,r,o,l,f,n,h),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Pl(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}class Hd extends vs{constructor(t,e=Ii,n=Rn,s,a,r=Ne,o=Ne,l,h=qi){const f={width:t,height:t,depth:1},u=[f,f,f,f,f,f];super(t,t,e,n,s,a,r,o,l,h),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class gu extends Be{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class Qs extends Xe{constructor(t=1,e=1,n=1,s=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:a,depthSegments:r};const o=this;s=Math.floor(s),a=Math.floor(a),r=Math.floor(r);const l=[],h=[],f=[],u=[];let c=0,d=0;_("z","y","x",-1,-1,n,e,t,r,a,0),_("z","y","x",1,-1,n,e,-t,r,a,1),_("x","z","y",1,1,t,n,e,s,r,2),_("x","z","y",1,-1,t,n,-e,s,r,3),_("x","y","z",1,-1,t,e,n,s,a,4),_("x","y","z",-1,-1,t,e,-n,s,a,5),this.setIndex(l),this.setAttribute("position",new We(h,3)),this.setAttribute("normal",new We(f,3)),this.setAttribute("uv",new We(u,2));function _(M,m,p,b,A,S,w,y,P,v,E){const C=S/P,R=w/v,D=S/2,H=w/2,q=y/2,B=P+1,X=v+1;let V=0,J=0;const tt=new U;for(let dt=0;dt<X;dt++){const gt=dt*R-H;for(let xt=0;xt<B;xt++){const Yt=xt*C-D;tt[M]=Yt*b,tt[m]=gt*A,tt[p]=q,h.push(tt.x,tt.y,tt.z),tt[M]=0,tt[m]=0,tt[p]=y>0?1:-1,f.push(tt.x,tt.y,tt.z),u.push(xt/P),u.push(1-dt/v),V+=1}}for(let dt=0;dt<v;dt++)for(let gt=0;gt<P;gt++){const xt=c+gt+B*dt,Yt=c+gt+B*(dt+1),fe=c+(gt+1)+B*(dt+1),$t=c+(gt+1)+B*dt;l.push(xt,Yt,$t),l.push(Yt,fe,$t),J+=6}o.addGroup(d,J,E),d+=J,c+=V}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Qs(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class Ll extends Xe{constructor(t=1,e=1,n=1,s=32,a=1,r=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:a,openEnded:r,thetaStart:o,thetaLength:l};const h=this;s=Math.floor(s),a=Math.floor(a);const f=[],u=[],c=[],d=[];let _=0;const M=[],m=n/2;let p=0;b(),r===!1&&(t>0&&A(!0),e>0&&A(!1)),this.setIndex(f),this.setAttribute("position",new We(u,3)),this.setAttribute("normal",new We(c,3)),this.setAttribute("uv",new We(d,2));function b(){const S=new U,w=new U;let y=0;const P=(e-t)/n;for(let v=0;v<=a;v++){const E=[],C=v/a,R=C*(e-t)+t;for(let D=0;D<=s;D++){const H=D/s,q=H*l+o,B=Math.sin(q),X=Math.cos(q);w.x=R*B,w.y=-C*n+m,w.z=R*X,u.push(w.x,w.y,w.z),S.set(B,P,X).normalize(),c.push(S.x,S.y,S.z),d.push(H,1-C),E.push(_++)}M.push(E)}for(let v=0;v<s;v++)for(let E=0;E<a;E++){const C=M[E][v],R=M[E+1][v],D=M[E+1][v+1],H=M[E][v+1];(t>0||E!==0)&&(f.push(C,R,H),y+=3),(e>0||E!==a-1)&&(f.push(R,D,H),y+=3)}h.addGroup(p,y,0),p+=y}function A(S){const w=_,y=new Rt,P=new U;let v=0;const E=S===!0?t:e,C=S===!0?1:-1;for(let D=1;D<=s;D++)u.push(0,m*C,0),c.push(0,C,0),d.push(.5,.5),_++;const R=_;for(let D=0;D<=s;D++){const q=D/s*l+o,B=Math.cos(q),X=Math.sin(q);P.x=E*X,P.y=m*C,P.z=E*B,u.push(P.x,P.y,P.z),c.push(0,C,0),y.x=B*.5+.5,y.y=X*.5*C+.5,d.push(y.x,y.y),_++}for(let D=0;D<s;D++){const H=w+D,q=R+D;S===!0?f.push(q,q+1,H):f.push(q+1,q,H),v+=3}h.addGroup(p,v,S===!0?1:2),p+=v}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ll(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class xr extends Xe{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const a=t/2,r=e/2,o=Math.floor(n),l=Math.floor(s),h=o+1,f=l+1,u=t/o,c=e/l,d=[],_=[],M=[],m=[];for(let p=0;p<f;p++){const b=p*c-r;for(let A=0;A<h;A++){const S=A*u-a;_.push(S,-b,0),M.push(0,0,1),m.push(A/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<o;b++){const A=b+h*p,S=b+h*(p+1),w=b+1+h*(p+1),y=b+1+h*p;d.push(A,S,y),d.push(S,w,y)}this.setIndex(d),this.setAttribute("position",new We(_,3)),this.setAttribute("normal",new We(M,3)),this.setAttribute("uv",new We(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new xr(t.width,t.height,t.widthSegments,t.heightSegments)}}class Nl extends Xe{constructor(t=1,e=32,n=16,s=0,a=Math.PI*2,r=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:a,thetaStart:r,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(r+o,Math.PI);let h=0;const f=[],u=new U,c=new U,d=[],_=[],M=[],m=[];for(let p=0;p<=n;p++){const b=[],A=p/n,S=r+A*o,w=t*Math.cos(S),y=Math.sqrt(t*t-w*w);let P=0;p===0&&r===0?P=.5/e:p===n&&l===Math.PI&&(P=-.5/e);for(let v=0;v<=e;v++){const E=v/e,C=s+E*a;u.x=-y*Math.cos(C),u.y=w,u.z=y*Math.sin(C),_.push(u.x,u.y,u.z),c.copy(u).normalize(),M.push(c.x,c.y,c.z),m.push(E+P,1-A),b.push(h++)}f.push(b)}for(let p=0;p<n;p++)for(let b=0;b<e;b++){const A=f[p][b+1],S=f[p][b],w=f[p+1][b],y=f[p+1][b+1];(p!==0||r>0)&&d.push(A,S,y),(p!==n-1||l<Math.PI)&&d.push(S,w,y)}this.setIndex(d),this.setAttribute("position",new We(_,3)),this.setAttribute("normal",new We(M,3)),this.setAttribute("uv",new We(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Nl(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}function Ms(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];if(Uh(s))s.isRenderTargetTexture?(Lt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(Uh(s[0])){const a=[];for(let r=0,o=s.length;r<o;r++)a[r]=s[r].clone();t[e][n]=a}else t[e][n]=s.slice();else t[e][n]=s}}return t}function ke(i){const t={};for(let e=0;e<i.length;e++){const n=Ms(i[e]);for(const s in n)t[s]=n[s]}return t}function Uh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Vd(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function vu(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Wt.workingColorSpace}const Wd={clone:Ms,merge:ke};var Xd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,qd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Li extends Dn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Xd,this.fragmentShader=qd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ms(t.uniforms),this.uniformsGroups=Vd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const r=this.uniforms[s].value;r&&r.isTexture?e.uniforms[s]={type:"t",value:r.toJSON(t).uuid}:r&&r.isColor?e.uniforms[s]={type:"c",value:r.getHex()}:r&&r.isVector2?e.uniforms[s]={type:"v2",value:r.toArray()}:r&&r.isVector3?e.uniforms[s]={type:"v3",value:r.toArray()}:r&&r.isVector4?e.uniforms[s]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?e.uniforms[s]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?e.uniforms[s]={type:"m4",value:r.toArray()}:e.uniforms[s]={value:r}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(const n in t.uniforms){const s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new Et().setHex(s.value);break;case"v2":this.uniforms[n].value=new Rt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new U().fromArray(s.value);break;case"v4":this.uniforms[n].value=new ue().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Dt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new le().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(const n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}}class Yd extends Li{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class $d extends Dn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Et(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Et(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=il,this.normalScale=new Rt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new dn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Kd extends Dn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ed,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Zd extends Dn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class Mu extends we{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Et(t),this.intensity=e}dispose(){this.dispatchEvent({type:"dispose"})}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}}class Jd extends Mu{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(we.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Et(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){const e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}}const eo=new le,Fh=new U,Oh=new U;class Qd{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Rt(512,512),this.mapType=ni,this.map=null,this.mapPass=null,this.matrix=new le,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Il,this._frameExtents=new Rt(1,1),this._viewportCount=1,this._viewports=[new ue(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;Fh.setFromMatrixPosition(t.matrixWorld),e.position.copy(Fh),Oh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Oh),e.updateMatrixWorld(),eo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(eo,e.coordinateSystem,e.reversedDepth),e.coordinateSystem===qs||e.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(eo)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Ra=new U,Ca=new fn,Si=new U;class xu extends we{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new le,this.projectionMatrix=new le,this.projectionMatrixInverse=new le,this.coordinateSystem=Ai,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Ra,Ca,Si),Si.x===1&&Si.y===1&&Si.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ra,Ca,Si.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Ra,Ca,Si),Si.x===1&&Si.y===1&&Si.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ra,Ca,Si.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const nn=new U,Gh=new Rt,Bh=new Rt;class li extends xu{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=sl*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Va*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return sl*2*Math.atan(Math.tan(Va*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){nn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(nn.x,nn.y).multiplyScalar(-t/nn.z),nn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(nn.x,nn.y).multiplyScalar(-t/nn.z)}getViewSize(t,e){return this.getViewBounds(t,Gh,Bh),e.subVectors(Bh,Gh)}setViewOffset(t,e,n,s,a,r){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Va*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,a=-.5*s;const r=this.view;if(this.view!==null&&this.view.enabled){const l=r.fullWidth,h=r.fullHeight;a+=r.offsetX*s/l,e-=r.offsetY*n/h,s*=r.width/l,n*=r.height/h}const o=this.filmOffset;o!==0&&(a+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}class Dl extends xu{constructor(t=-1,e=1,n=1,s=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let a=n-t,r=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const h=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=h*this.view.offsetX,r=a+h*this.view.width,o-=f*this.view.offsetY,l=o-f*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class jd extends Qd{constructor(){super(new Dl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class tp extends Mu{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(we.DEFAULT_UP),this.updateMatrix(),this.target=new we,this.shadow=new jd}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){const e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}}const Qn=-90,jn=1;class ep extends we{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new li(Qn,jn,t,e);s.layers=this.layers,this.add(s);const a=new li(Qn,jn,t,e);a.layers=this.layers,this.add(a);const r=new li(Qn,jn,t,e);r.layers=this.layers,this.add(r);const o=new li(Qn,jn,t,e);o.layers=this.layers,this.add(o);const l=new li(Qn,jn,t,e);l.layers=this.layers,this.add(l);const h=new li(Qn,jn,t,e);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,a,r,o,l]=e;for(const h of e)this.remove(h);if(t===Ai)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===qs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const h of e)this.add(h),h.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[a,r,o,l,h,f]=this.children,u=t.getRenderTarget(),c=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),_=t.xr.enabled;t.xr.enabled=!1;const M=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),n.texture.generateMipmaps=M,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,f),t.setRenderTarget(u,c,d),t.xr.enabled=_,n.texture.needsPMREMUpdate=!0}}class ip extends li{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}}const zh=new le;class np{constructor(t,e,n=0,s=1/0){this.ray=new Mr(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new Rl,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Vt("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return zh.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(zh),this}intersectObject(t,e=!0,n=[]){return rl(t,this,n,e),n.sort(kh),n}intersectObjects(t,e=!0,n=[]){for(let s=0,a=t.length;s<a;s++)rl(t[s],this,n,e);return n.sort(kh),n}}function kh(i,t){return i.distance-t.distance}function rl(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){const a=i.children;for(let r=0,o=a.length;r<o;r++)rl(a[r],t,e,!0)}}class Hh{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=kt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(kt(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const jl=class jl{constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){const a=this.elements;return a[0]=t,a[2]=e,a[1]=n,a[3]=s,this}};jl.prototype.isMatrix2=!0;let Vh=jl;class sp extends _n{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){if(t===void 0){Lt("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}}function Wh(i,t,e,n){const s=ap(n);switch(e){case au:return i*t;case ou:return i*t/s.components*s.byteLength;case El:return i*t/s.components*s.byteLength;case Cn:return i*t*2/s.components*s.byteLength;case bl:return i*t*2/s.components*s.byteLength;case ru:return i*t*3/s.components*s.byteLength;case mi:return i*t*4/s.components*s.byteLength;case Tl:return i*t*4/s.components*s.byteLength;case Ba:case za:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case ka:case Ha:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ao:case Ro:return Math.max(i,16)*Math.max(t,8)/4;case wo:case Po:return Math.max(i,8)*Math.max(t,8)/2;case Co:case Io:case No:case Do:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Lo:case Ja:case Uo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Fo:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Oo:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Go:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Bo:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case zo:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case ko:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Ho:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Vo:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Wo:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Xo:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case qo:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Yo:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case $o:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Ko:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Zo:case Jo:case Qo:return Math.ceil(i/4)*Math.ceil(t/4)*16;case jo:case tl:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Qa:case el:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function ap(i){switch(i){case ni:case eu:return{byteLength:1,components:1};case Ws:case iu:case Xi:return{byteLength:2,components:1};case Sl:case yl:return{byteLength:2,components:4};case Ii:case xl:case wi:return{byteLength:4,components:1};case nu:case su:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ml}}));typeof window<"u"&&(window.__THREE__?Lt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ml);function Su(){let i=null,t=!1,e=null,n=null;function s(a,r){e(a,r),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(a){e=a},setContext:function(a){i=a}}}function rp(i){const t=new WeakMap;function e(o,l){const h=o.array,f=o.usage,u=h.byteLength,c=i.createBuffer();i.bindBuffer(l,c),i.bufferData(l,h,f),o.onUploadCallback();let d;if(h instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&h instanceof Float16Array)d=i.HALF_FLOAT;else if(h instanceof Uint16Array)o.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)d=i.SHORT;else if(h instanceof Uint32Array)d=i.UNSIGNED_INT;else if(h instanceof Int32Array)d=i.INT;else if(h instanceof Int8Array)d=i.BYTE;else if(h instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:c,type:d,bytesPerElement:h.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,h){const f=l.array,u=l.updateRanges;if(i.bindBuffer(h,o),u.length===0)i.bufferSubData(h,0,f);else{u.sort((d,_)=>d.start-_.start);let c=0;for(let d=1;d<u.length;d++){const _=u[c],M=u[d];M.start<=_.start+_.count+1?_.count=Math.max(_.count,M.start+M.count-_.start):(++c,u[c]=M)}u.length=c+1;for(let d=0,_=u.length;d<_;d++){const M=u[d];i.bufferSubData(h,M.start*f.BYTES_PER_ELEMENT,f,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const f=t.get(o);(!f||f.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const h=t.get(o);if(h===void 0)t.set(o,e(o,l));else if(h.version<o.version){if(h.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(h.buffer,o,l),h.version=o.version}}return{get:s,remove:a,update:r}}var op=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,lp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,hp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,up=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,fp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,dp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT )
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN )
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,pp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,mp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,_p=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,gp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,vp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Mp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,xp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Sp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,yp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Ep=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,bp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Tp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,wp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Ap=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Pp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Rp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Cp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Ip=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Lp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Np=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Dp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Up=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Fp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Op="gl_FragColor = linearToOutputTexel( gl_FragColor );",Gp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Bp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,zp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,kp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Hp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Vp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Wp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Xp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,qp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Yp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,$p=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Kp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Zp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Jp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Qp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,jp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,t0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,e0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,i0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,n0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,s0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,a0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN

		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );

		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );

		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );

		irradiance *= sheenEnergyComp;

	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,r0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,o0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,l0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,h0=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,c0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,u0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,f0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,d0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,p0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,m0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,_0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,g0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,v0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,M0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,x0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,S0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,y0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,E0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,b0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,T0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,w0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,A0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,P0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,R0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,C0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,I0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,L0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,N0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,D0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,U0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,F0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER

		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {

	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,O0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,G0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,B0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,z0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,k0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,H0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,V0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif

				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,W0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,X0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,q0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Y0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,$0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,K0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Z0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,J0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Q0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,j0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,em=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,im=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,nm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,sm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,am=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,rm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const om=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,lm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,um=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,pm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,mm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,_m=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,gm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,vm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Mm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,xm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Sm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,ym=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Em=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,wm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Am=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Pm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Rm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Cm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Im=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Lm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN

		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;

	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Nm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Dm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Um=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Fm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Om=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Gm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Bm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,zm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Bt={alphahash_fragment:op,alphahash_pars_fragment:lp,alphamap_fragment:hp,alphamap_pars_fragment:cp,alphatest_fragment:up,alphatest_pars_fragment:fp,aomap_fragment:dp,aomap_pars_fragment:pp,batching_pars_vertex:mp,batching_vertex:_p,begin_vertex:gp,beginnormal_vertex:vp,bsdfs:Mp,iridescence_fragment:xp,bumpmap_pars_fragment:Sp,clipping_planes_fragment:yp,clipping_planes_pars_fragment:Ep,clipping_planes_pars_vertex:bp,clipping_planes_vertex:Tp,color_fragment:wp,color_pars_fragment:Ap,color_pars_vertex:Pp,color_vertex:Rp,common:Cp,cube_uv_reflection_fragment:Ip,defaultnormal_vertex:Lp,displacementmap_pars_vertex:Np,displacementmap_vertex:Dp,emissivemap_fragment:Up,emissivemap_pars_fragment:Fp,colorspace_fragment:Op,colorspace_pars_fragment:Gp,envmap_fragment:Bp,envmap_common_pars_fragment:zp,envmap_pars_fragment:kp,envmap_pars_vertex:Hp,envmap_physical_pars_fragment:jp,envmap_vertex:Vp,fog_vertex:Wp,fog_pars_vertex:Xp,fog_fragment:qp,fog_pars_fragment:Yp,gradientmap_pars_fragment:$p,lightmap_pars_fragment:Kp,lights_lambert_fragment:Zp,lights_lambert_pars_fragment:Jp,lights_pars_begin:Qp,lights_toon_fragment:t0,lights_toon_pars_fragment:e0,lights_phong_fragment:i0,lights_phong_pars_fragment:n0,lights_physical_fragment:s0,lights_physical_pars_fragment:a0,lights_fragment_begin:r0,lights_fragment_maps:o0,lights_fragment_end:l0,lightprobes_pars_fragment:h0,logdepthbuf_fragment:c0,logdepthbuf_pars_fragment:u0,logdepthbuf_pars_vertex:f0,logdepthbuf_vertex:d0,map_fragment:p0,map_pars_fragment:m0,map_particle_fragment:_0,map_particle_pars_fragment:g0,metalnessmap_fragment:v0,metalnessmap_pars_fragment:M0,morphinstance_vertex:x0,morphcolor_vertex:S0,morphnormal_vertex:y0,morphtarget_pars_vertex:E0,morphtarget_vertex:b0,normal_fragment_begin:T0,normal_fragment_maps:w0,normal_pars_fragment:A0,normal_pars_vertex:P0,normal_vertex:R0,normalmap_pars_fragment:C0,clearcoat_normal_fragment_begin:I0,clearcoat_normal_fragment_maps:L0,clearcoat_pars_fragment:N0,iridescence_pars_fragment:D0,opaque_fragment:U0,packing:F0,premultiplied_alpha_fragment:O0,project_vertex:G0,dithering_fragment:B0,dithering_pars_fragment:z0,roughnessmap_fragment:k0,roughnessmap_pars_fragment:H0,shadowmap_pars_fragment:V0,shadowmap_pars_vertex:W0,shadowmap_vertex:X0,shadowmask_pars_fragment:q0,skinbase_vertex:Y0,skinning_pars_vertex:$0,skinning_vertex:K0,skinnormal_vertex:Z0,specularmap_fragment:J0,specularmap_pars_fragment:Q0,tonemapping_fragment:j0,tonemapping_pars_fragment:tm,transmission_fragment:em,transmission_pars_fragment:im,uv_pars_fragment:nm,uv_pars_vertex:sm,uv_vertex:am,worldpos_vertex:rm,background_vert:om,background_frag:lm,backgroundCube_vert:hm,backgroundCube_frag:cm,cube_vert:um,cube_frag:fm,depth_vert:dm,depth_frag:pm,distance_vert:mm,distance_frag:_m,equirect_vert:gm,equirect_frag:vm,linedashed_vert:Mm,linedashed_frag:xm,meshbasic_vert:Sm,meshbasic_frag:ym,meshlambert_vert:Em,meshlambert_frag:bm,meshmatcap_vert:Tm,meshmatcap_frag:wm,meshnormal_vert:Am,meshnormal_frag:Pm,meshphong_vert:Rm,meshphong_frag:Cm,meshphysical_vert:Im,meshphysical_frag:Lm,meshtoon_vert:Nm,meshtoon_frag:Dm,points_vert:Um,points_frag:Fm,shadow_vert:Om,shadow_frag:Gm,sprite_vert:Bm,sprite_frag:zm},ft={common:{diffuse:{value:new Et(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Dt},alphaMap:{value:null},alphaMapTransform:{value:new Dt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Dt}},envmap:{envMap:{value:null},envMapRotation:{value:new Dt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Dt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Dt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Dt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Dt},normalScale:{value:new Rt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Dt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Dt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Dt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Dt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Et(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new U},probesMax:{value:new U},probesResolution:{value:new U}},points:{diffuse:{value:new Et(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Dt},alphaTest:{value:0},uvTransform:{value:new Dt}},sprite:{diffuse:{value:new Et(16777215)},opacity:{value:1},center:{value:new Rt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Dt},alphaMap:{value:null},alphaMapTransform:{value:new Dt},alphaTest:{value:0}}},Ei={basic:{uniforms:ke([ft.common,ft.specularmap,ft.envmap,ft.aomap,ft.lightmap,ft.fog]),vertexShader:Bt.meshbasic_vert,fragmentShader:Bt.meshbasic_frag},lambert:{uniforms:ke([ft.common,ft.specularmap,ft.envmap,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.fog,ft.lights,{emissive:{value:new Et(0)},envMapIntensity:{value:1}}]),vertexShader:Bt.meshlambert_vert,fragmentShader:Bt.meshlambert_frag},phong:{uniforms:ke([ft.common,ft.specularmap,ft.envmap,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.fog,ft.lights,{emissive:{value:new Et(0)},specular:{value:new Et(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Bt.meshphong_vert,fragmentShader:Bt.meshphong_frag},standard:{uniforms:ke([ft.common,ft.envmap,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.roughnessmap,ft.metalnessmap,ft.fog,ft.lights,{emissive:{value:new Et(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Bt.meshphysical_vert,fragmentShader:Bt.meshphysical_frag},toon:{uniforms:ke([ft.common,ft.aomap,ft.lightmap,ft.emissivemap,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.gradientmap,ft.fog,ft.lights,{emissive:{value:new Et(0)}}]),vertexShader:Bt.meshtoon_vert,fragmentShader:Bt.meshtoon_frag},matcap:{uniforms:ke([ft.common,ft.bumpmap,ft.normalmap,ft.displacementmap,ft.fog,{matcap:{value:null}}]),vertexShader:Bt.meshmatcap_vert,fragmentShader:Bt.meshmatcap_frag},points:{uniforms:ke([ft.points,ft.fog]),vertexShader:Bt.points_vert,fragmentShader:Bt.points_frag},dashed:{uniforms:ke([ft.common,ft.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Bt.linedashed_vert,fragmentShader:Bt.linedashed_frag},depth:{uniforms:ke([ft.common,ft.displacementmap]),vertexShader:Bt.depth_vert,fragmentShader:Bt.depth_frag},normal:{uniforms:ke([ft.common,ft.bumpmap,ft.normalmap,ft.displacementmap,{opacity:{value:1}}]),vertexShader:Bt.meshnormal_vert,fragmentShader:Bt.meshnormal_frag},sprite:{uniforms:ke([ft.sprite,ft.fog]),vertexShader:Bt.sprite_vert,fragmentShader:Bt.sprite_frag},background:{uniforms:{uvTransform:{value:new Dt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Bt.background_vert,fragmentShader:Bt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Dt}},vertexShader:Bt.backgroundCube_vert,fragmentShader:Bt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Bt.cube_vert,fragmentShader:Bt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Bt.equirect_vert,fragmentShader:Bt.equirect_frag},distance:{uniforms:ke([ft.common,ft.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Bt.distance_vert,fragmentShader:Bt.distance_frag},shadow:{uniforms:ke([ft.lights,ft.fog,{color:{value:new Et(0)},opacity:{value:1}}]),vertexShader:Bt.shadow_vert,fragmentShader:Bt.shadow_frag}};Ei.physical={uniforms:ke([Ei.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Dt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Dt},clearcoatNormalScale:{value:new Rt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Dt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Dt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Dt},sheen:{value:0},sheenColor:{value:new Et(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Dt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Dt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Dt},transmissionSamplerSize:{value:new Rt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Dt},attenuationDistance:{value:0},attenuationColor:{value:new Et(0)},specularColor:{value:new Et(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Dt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Dt},anisotropyVector:{value:new Rt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Dt}}]),vertexShader:Bt.meshphysical_vert,fragmentShader:Bt.meshphysical_frag};const Ia={r:0,b:0,g:0},km=new le,yu=new Dt;yu.set(-1,0,0,0,1,0,0,0,1);function Hm(i,t,e,n,s,a){const r=new Et(0);let o=s===!0?0:1,l,h,f=null,u=0,c=null;function d(b){let A=b.isScene===!0?b.background:null;if(A&&A.isTexture){const S=b.backgroundBlurriness>0;A=t.get(A,S)}return A}function _(b){let A=!1;const S=d(b);S===null?m(r,o):S&&S.isColor&&(m(S,1),A=!0);const w=i.xr.getEnvironmentBlendMode();w==="additive"?e.buffers.color.setClear(0,0,0,1,a):w==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,a),(i.autoClear||A)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function M(b,A){const S=d(A);S&&(S.isCubeTexture||S.mapping===_r)?(h===void 0&&(h=new ui(new Qs(1,1,1),new Li({name:"BackgroundCubeMaterial",uniforms:Ms(Ei.backgroundCube.uniforms),vertexShader:Ei.backgroundCube.vertexShader,fragmentShader:Ei.backgroundCube.fragmentShader,side:Je,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(w,y,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(h)),h.material.uniforms.envMap.value=S,h.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(km.makeRotationFromEuler(A.backgroundRotation)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&h.material.uniforms.backgroundRotation.value.premultiply(yu),h.material.toneMapped=Wt.getTransfer(S.colorSpace)!==jt,(f!==S||u!==S.version||c!==i.toneMapping)&&(h.material.needsUpdate=!0,f=S,u=S.version,c=i.toneMapping),h.layers.enableAll(),b.unshift(h,h.geometry,h.material,0,0,null)):S&&S.isTexture&&(l===void 0&&(l=new ui(new xr(2,2),new Li({name:"BackgroundMaterial",uniforms:Ms(Ei.background.uniforms),vertexShader:Ei.background.vertexShader,fragmentShader:Ei.background.fragmentShader,side:un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=S,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=Wt.getTransfer(S.colorSpace)!==jt,S.matrixAutoUpdate===!0&&S.updateMatrix(),l.material.uniforms.uvTransform.value.copy(S.matrix),(f!==S||u!==S.version||c!==i.toneMapping)&&(l.material.needsUpdate=!0,f=S,u=S.version,c=i.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function m(b,A){b.getRGB(Ia,vu(i)),e.buffers.color.setClear(Ia.r,Ia.g,Ia.b,A,a)}function p(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return r},setClearColor:function(b,A=1){r.set(b),o=A,m(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(b){o=b,m(r,o)},render:_,addToRenderList:M,dispose:p}}function Vm(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=c(null);let a=s,r=!1;function o(R,D,H,q,B){let X=!1;const V=u(R,q,H,D);a!==V&&(a=V,h(a.object)),X=d(R,q,H,B),X&&_(R,q,H,B),B!==null&&t.update(B,i.ELEMENT_ARRAY_BUFFER),(X||r)&&(r=!1,S(R,D,H,q),B!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(B).buffer))}function l(){return i.createVertexArray()}function h(R){return i.bindVertexArray(R)}function f(R){return i.deleteVertexArray(R)}function u(R,D,H,q){const B=q.wireframe===!0;let X=n[D.id];X===void 0&&(X={},n[D.id]=X);const V=R.isInstancedMesh===!0?R.id:0;let J=X[V];J===void 0&&(J={},X[V]=J);let tt=J[H.id];tt===void 0&&(tt={},J[H.id]=tt);let dt=tt[B];return dt===void 0&&(dt=c(l()),tt[B]=dt),dt}function c(R){const D=[],H=[],q=[];for(let B=0;B<e;B++)D[B]=0,H[B]=0,q[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:H,attributeDivisors:q,object:R,attributes:{},index:null}}function d(R,D,H,q){const B=a.attributes,X=D.attributes;let V=0;const J=H.getAttributes();for(const tt in J)if(J[tt].location>=0){const gt=B[tt];let xt=X[tt];if(xt===void 0&&(tt==="instanceMatrix"&&R.instanceMatrix&&(xt=R.instanceMatrix),tt==="instanceColor"&&R.instanceColor&&(xt=R.instanceColor)),gt===void 0||gt.attribute!==xt||xt&&gt.data!==xt.data)return!0;V++}return a.attributesNum!==V||a.index!==q}function _(R,D,H,q){const B={},X=D.attributes;let V=0;const J=H.getAttributes();for(const tt in J)if(J[tt].location>=0){let gt=X[tt];gt===void 0&&(tt==="instanceMatrix"&&R.instanceMatrix&&(gt=R.instanceMatrix),tt==="instanceColor"&&R.instanceColor&&(gt=R.instanceColor));const xt={};xt.attribute=gt,gt&&gt.data&&(xt.data=gt.data),B[tt]=xt,V++}a.attributes=B,a.attributesNum=V,a.index=q}function M(){const R=a.newAttributes;for(let D=0,H=R.length;D<H;D++)R[D]=0}function m(R){p(R,0)}function p(R,D){const H=a.newAttributes,q=a.enabledAttributes,B=a.attributeDivisors;H[R]=1,q[R]===0&&(i.enableVertexAttribArray(R),q[R]=1),B[R]!==D&&(i.vertexAttribDivisor(R,D),B[R]=D)}function b(){const R=a.newAttributes,D=a.enabledAttributes;for(let H=0,q=D.length;H<q;H++)D[H]!==R[H]&&(i.disableVertexAttribArray(H),D[H]=0)}function A(R,D,H,q,B,X,V){V===!0?i.vertexAttribIPointer(R,D,H,B,X):i.vertexAttribPointer(R,D,H,q,B,X)}function S(R,D,H,q){M();const B=q.attributes,X=H.getAttributes(),V=D.defaultAttributeValues;for(const J in X){const tt=X[J];if(tt.location>=0){let dt=B[J];if(dt===void 0&&(J==="instanceMatrix"&&R.instanceMatrix&&(dt=R.instanceMatrix),J==="instanceColor"&&R.instanceColor&&(dt=R.instanceColor)),dt!==void 0){const gt=dt.normalized,xt=dt.itemSize,Yt=t.get(dt);if(Yt===void 0)continue;const fe=Yt.buffer,$t=Yt.type,Z=Yt.bytesPerElement,rt=$t===i.INT||$t===i.UNSIGNED_INT||dt.gpuType===xl;if(dt.isInterleavedBufferAttribute){const et=dt.data,Nt=et.stride,Ut=dt.offset;if(et.isInstancedInterleavedBuffer){for(let Ct=0;Ct<tt.locationSize;Ct++)p(tt.location+Ct,et.meshPerAttribute);R.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=et.meshPerAttribute*et.count)}else for(let Ct=0;Ct<tt.locationSize;Ct++)m(tt.location+Ct);i.bindBuffer(i.ARRAY_BUFFER,fe);for(let Ct=0;Ct<tt.locationSize;Ct++)A(tt.location+Ct,xt/tt.locationSize,$t,gt,Nt*Z,(Ut+xt/tt.locationSize*Ct)*Z,rt)}else{if(dt.isInstancedBufferAttribute){for(let et=0;et<tt.locationSize;et++)p(tt.location+et,dt.meshPerAttribute);R.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=dt.meshPerAttribute*dt.count)}else for(let et=0;et<tt.locationSize;et++)m(tt.location+et);i.bindBuffer(i.ARRAY_BUFFER,fe);for(let et=0;et<tt.locationSize;et++)A(tt.location+et,xt/tt.locationSize,$t,gt,xt*Z,xt/tt.locationSize*et*Z,rt)}}else if(V!==void 0){const gt=V[J];if(gt!==void 0)switch(gt.length){case 2:i.vertexAttrib2fv(tt.location,gt);break;case 3:i.vertexAttrib3fv(tt.location,gt);break;case 4:i.vertexAttrib4fv(tt.location,gt);break;default:i.vertexAttrib1fv(tt.location,gt)}}}}b()}function w(){E();for(const R in n){const D=n[R];for(const H in D){const q=D[H];for(const B in q){const X=q[B];for(const V in X)f(X[V].object),delete X[V];delete q[B]}}delete n[R]}}function y(R){if(n[R.id]===void 0)return;const D=n[R.id];for(const H in D){const q=D[H];for(const B in q){const X=q[B];for(const V in X)f(X[V].object),delete X[V];delete q[B]}}delete n[R.id]}function P(R){for(const D in n){const H=n[D];for(const q in H){const B=H[q];if(B[R.id]===void 0)continue;const X=B[R.id];for(const V in X)f(X[V].object),delete X[V];delete B[R.id]}}}function v(R){for(const D in n){const H=n[D],q=R.isInstancedMesh===!0?R.id:0,B=H[q];if(B!==void 0){for(const X in B){const V=B[X];for(const J in V)f(V[J].object),delete V[J];delete B[X]}delete H[q],Object.keys(H).length===0&&delete n[D]}}}function E(){C(),r=!0,a!==s&&(a=s,h(a.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:E,resetDefaultState:C,dispose:w,releaseStatesOfGeometry:y,releaseStatesOfObject:v,releaseStatesOfProgram:P,initAttributes:M,enableAttribute:m,disableUnusedAttributes:b}}function Wm(i,t,e){let n;function s(l){n=l}function a(l,h){i.drawArrays(n,l,h),e.update(h,n,1)}function r(l,h,f){f!==0&&(i.drawArraysInstanced(n,l,h,f),e.update(h,n,f))}function o(l,h,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,f);let c=0;for(let d=0;d<f;d++)c+=h[d];e.update(c,n,1)}this.setMode=s,this.render=a,this.renderInstances=r,this.renderMultiDraw=o}function Xm(i,t,e,n){let s;function a(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const P=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function r(P){return!(P!==mi&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){const v=P===Xi&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(P!==ni&&n.convert(P)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&P!==wi&&!v)}function l(P){if(P==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=e.precision!==void 0?e.precision:"highp";const f=l(h);f!==h&&(Lt("WebGLRenderer:",h,"not supported, using",f,"instead."),h=f);const u=e.logarithmicDepthBuffer===!0,c=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&c===!1&&Lt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),A=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),w=i.getParameter(i.MAX_SAMPLES),y=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:h,logarithmicDepthBuffer:u,reversedDepthBuffer:c,maxTextures:d,maxVertexTextures:_,maxTextureSize:M,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:b,maxVaryings:A,maxFragmentUniforms:S,maxSamples:w,samples:y}}function qm(i){const t=this;let e=null,n=0,s=!1,a=!1;const r=new sn,o=new Dt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,c){const d=u.length!==0||c||n!==0||s;return s=c,n=u.length,d},this.beginShadows=function(){a=!0,f(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(u,c){e=f(u,c,0)},this.setState=function(u,c,d){const _=u.clippingPlanes,M=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||_===null||_.length===0||a&&!m)a?f(null):h();else{const b=a?0:n,A=b*4;let S=p.clippingState||null;l.value=S,S=f(_,c,A,d);for(let w=0;w!==A;++w)S[w]=e[w];p.clippingState=S,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=b}};function h(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function f(u,c,d,_){const M=u!==null?u.length:0;let m=null;if(M!==0){if(m=l.value,_!==!0||m===null){const p=d+M*4,b=c.matrixWorldInverse;o.getNormalMatrix(b),(m===null||m.length<p)&&(m=new Float32Array(p));for(let A=0,S=d;A!==M;++A,S+=4)r.copy(u[A]).applyMatrix4(b,o),r.normal.toArray(m,S),m[S+3]=r.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=M,t.numIntersection=0,m}}const rn=4,Xh=[.125,.215,.35,.446,.526,.582],wn=20,Ym=256,Cs=new Dl,qh=new Et;let io=null,no=0,so=0,ao=!1;const $m=new U;class Yh{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,a={}){const{size:r=256,position:o=$m}=a;io=this._renderer.getRenderTarget(),no=this._renderer.getActiveCubeFace(),so=this._renderer.getActiveMipmapLevel(),ao=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Zh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Kh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(io,no,so),this._renderer.xr.enabled=ao,t.scissorTest=!1,ts(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Rn||t.mapping===gs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),io=this._renderer.getRenderTarget(),no=this._renderer.getActiveCubeFace(),so=this._renderer.getActiveMipmapLevel(),ao=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Ge,minFilter:Ge,generateMipmaps:!1,type:Xi,format:mi,colorSpace:ja,depthBuffer:!1},s=$h(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=$h(t,e,n);const{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Km(a)),this._blurMaterial=Jm(a,t,e),this._ggxMaterial=Zm(a,t,e)}return s}_compileMaterial(t){const e=new ui(new Xe,t);this._renderer.compile(e,Cs)}_sceneToCubeUV(t,e,n,s,a){const l=new li(90,1,e,n),h=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],u=this._renderer,c=u.autoClear,d=u.toneMapping;u.getClearColor(qh),u.toneMapping=Pi,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ui(new Qs,new Cl({name:"PMREM.Background",side:Je,depthWrite:!1,depthTest:!1})));const M=this._backgroundBox,m=M.material;let p=!1;const b=t.background;b?b.isColor&&(m.color.copy(b),t.background=null,p=!0):(m.color.copy(qh),p=!0);for(let A=0;A<6;A++){const S=A%3;S===0?(l.up.set(0,h[A],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x+f[A],a.y,a.z)):S===1?(l.up.set(0,0,h[A]),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y+f[A],a.z)):(l.up.set(0,h[A],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y,a.z+f[A]));const w=this._cubeSize;ts(s,S*w,A>2?w:0,w,w),u.setRenderTarget(s),p&&u.render(M,l),u.render(t,l)}u.toneMapping=d,u.autoClear=c,t.background=b}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===Rn||t.mapping===gs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Zh()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Kh());const a=s?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=a;const o=a.uniforms;o.envMap.value=t;const l=this._cubeSize;ts(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(r,Cs)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodMeshes.length;for(let a=1;a<s;a++)this._applyGGXFilter(t,a-1,a);e.autoClear=n}_applyGGXFilter(t,e,n){const s=this._renderer,a=this._pingPongRenderTarget,r=this._ggxMaterial,o=this._lodMeshes[n];o.material=r;const l=r.uniforms,h=n/(this._lodMeshes.length-1),f=e/(this._lodMeshes.length-1),u=Math.sqrt(h*h-f*f),c=0+h*1.25,d=u*c,{_lodMax:_}=this,M=this._sizeLods[n],m=3*M*(n>_-rn?n-_+rn:0),p=4*(this._cubeSize-M);l.envMap.value=t.texture,l.roughness.value=d,l.mipInt.value=_-e,ts(a,m,p,3*M,2*M),s.setRenderTarget(a),s.render(o,Cs),l.envMap.value=a.texture,l.roughness.value=0,l.mipInt.value=_-n,ts(t,m,p,3*M,2*M),s.setRenderTarget(t),s.render(o,Cs)}_blur(t,e,n,s,a){const r=this._pingPongRenderTarget;this._halfBlur(t,r,e,n,s,"latitudinal",a),this._halfBlur(r,t,n,n,s,"longitudinal",a)}_halfBlur(t,e,n,s,a,r,o){const l=this._renderer,h=this._blurMaterial;r!=="latitudinal"&&r!=="longitudinal"&&Vt("blur direction must be either latitudinal or longitudinal!");const f=3,u=this._lodMeshes[s];u.material=h;const c=h.uniforms,d=this._sizeLods[n]-1,_=isFinite(a)?Math.PI/(2*d):2*Math.PI/(2*wn-1),M=a/_,m=isFinite(a)?1+Math.floor(f*M):wn;m>wn&&Lt(`sigmaRadians, ${a}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${wn}`);const p=[];let b=0;for(let P=0;P<wn;++P){const v=P/M,E=Math.exp(-v*v/2);p.push(E),P===0?b+=E:P<m&&(b+=2*E)}for(let P=0;P<p.length;P++)p[P]=p[P]/b;c.envMap.value=t.texture,c.samples.value=m,c.weights.value=p,c.latitudinal.value=r==="latitudinal",o&&(c.poleAxis.value=o);const{_lodMax:A}=this;c.dTheta.value=_,c.mipInt.value=A-n;const S=this._sizeLods[s],w=3*S*(s>A-rn?s-A+rn:0),y=4*(this._cubeSize-S);ts(e,w,y,3*S,2*S),l.setRenderTarget(e),l.render(u,Cs)}}function Km(i){const t=[],e=[],n=[];let s=i;const a=i-rn+1+Xh.length;for(let r=0;r<a;r++){const o=Math.pow(2,s);t.push(o);let l=1/o;r>i-rn?l=Xh[r-i+rn-1]:r===0&&(l=0),e.push(l);const h=1/(o-2),f=-h,u=1+h,c=[f,f,u,f,u,u,f,f,u,u,f,u],d=6,_=6,M=3,m=2,p=1,b=new Float32Array(M*_*d),A=new Float32Array(m*_*d),S=new Float32Array(p*_*d);for(let y=0;y<d;y++){const P=y%3*2/3-1,v=y>2?0:-1,E=[P,v,0,P+2/3,v,0,P+2/3,v+1,0,P,v,0,P+2/3,v+1,0,P,v+1,0];b.set(E,M*_*y),A.set(c,m*_*y);const C=[y,y,y,y,y,y];S.set(C,p*_*y)}const w=new Xe;w.setAttribute("position",new He(b,M)),w.setAttribute("uv",new He(A,m)),w.setAttribute("faceIndex",new He(S,p)),n.push(new ui(w,null)),s>rn&&s--}return{lodMeshes:n,sizeLods:t,sigmas:e}}function $h(i,t,e){const n=new Ri(i,t,e);return n.texture.mapping=_r,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ts(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Zm(i,t,e){return new Li({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Ym,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Sr(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:zi,depthTest:!1,depthWrite:!1})}function Jm(i,t,e){const n=new Float32Array(wn),s=new U(0,1,0);return new Li({name:"SphericalGaussianBlur",defines:{n:wn,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Sr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:zi,depthTest:!1,depthWrite:!1})}function Kh(){return new Li({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Sr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:zi,depthTest:!1,depthWrite:!1})}function Zh(){return new Li({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Sr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:zi,depthTest:!1,depthWrite:!1})}function Sr(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class Eu extends Ri{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new _u(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Qs(5,5,5),a=new Li({name:"CubemapFromEquirect",uniforms:Ms(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Je,blending:zi});a.uniforms.tEquirect.value=e;const r=new ui(s,a),o=e.minFilter;return e.minFilter===An&&(e.minFilter=Ge),new ep(1,10,this).update(t,r),e.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){const a=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(e,n,s);t.setRenderTarget(a)}}function Qm(i){let t=new WeakMap,e=new WeakMap,n=null;function s(c,d=!1){return c==null?null:d?r(c):a(c)}function a(c){if(c&&c.isTexture){const d=c.mapping;if(d===Pr||d===Rr)if(t.has(c)){const _=t.get(c).texture;return o(_,c.mapping)}else{const _=c.image;if(_&&_.height>0){const M=new Eu(_.height);return M.fromEquirectangularTexture(i,c),t.set(c,M),c.addEventListener("dispose",h),o(M.texture,c.mapping)}else return null}}return c}function r(c){if(c&&c.isTexture){const d=c.mapping,_=d===Pr||d===Rr,M=d===Rn||d===gs;if(_||M){let m=e.get(c);const p=m!==void 0?m.texture.pmremVersion:0;if(c.isRenderTargetTexture&&c.pmremVersion!==p)return n===null&&(n=new Yh(i)),m=_?n.fromEquirectangular(c,m):n.fromCubemap(c,m),m.texture.pmremVersion=c.pmremVersion,e.set(c,m),m.texture;if(m!==void 0)return m.texture;{const b=c.image;return _&&b&&b.height>0||M&&b&&l(b)?(n===null&&(n=new Yh(i)),m=_?n.fromEquirectangular(c):n.fromCubemap(c),m.texture.pmremVersion=c.pmremVersion,e.set(c,m),c.addEventListener("dispose",f),m.texture):null}}}return c}function o(c,d){return d===Pr?c.mapping=Rn:d===Rr&&(c.mapping=gs),c}function l(c){let d=0;const _=6;for(let M=0;M<_;M++)c[M]!==void 0&&d++;return d===_}function h(c){const d=c.target;d.removeEventListener("dispose",h);const _=t.get(d);_!==void 0&&(t.delete(d),_.dispose())}function f(c){const d=c.target;d.removeEventListener("dispose",f);const _=e.get(d);_!==void 0&&(e.delete(d),_.dispose())}function u(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function jm(i){const t={};function e(n){if(t[n]!==void 0)return t[n];const s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&us("WebGLRenderer: "+n+" extension not supported."),s}}}function t_(i,t,e,n){const s={},a=new WeakMap;function r(u){const c=u.target;c.index!==null&&t.remove(c.index);for(const _ in c.attributes)t.remove(c.attributes[_]);c.removeEventListener("dispose",r),delete s[c.id];const d=a.get(c);d&&(t.remove(d),a.delete(c)),n.releaseStatesOfGeometry(c),c.isInstancedBufferGeometry===!0&&delete c._maxInstanceCount,e.memory.geometries--}function o(u,c){return s[c.id]===!0||(c.addEventListener("dispose",r),s[c.id]=!0,e.memory.geometries++),c}function l(u){const c=u.attributes;for(const d in c)t.update(c[d],i.ARRAY_BUFFER)}function h(u){const c=[],d=u.index,_=u.attributes.position;let M=0;if(_===void 0)return;if(d!==null){const b=d.array;M=d.version;for(let A=0,S=b.length;A<S;A+=3){const w=b[A+0],y=b[A+1],P=b[A+2];c.push(w,y,y,P,P,w)}}else{const b=_.array;M=_.version;for(let A=0,S=b.length/3-1;A<S;A+=3){const w=A+0,y=A+1,P=A+2;c.push(w,y,y,P,P,w)}}const m=new(_.count>=65535?fu:uu)(c,1);m.version=M;const p=a.get(u);p&&t.remove(p),a.set(u,m)}function f(u){const c=a.get(u);if(c){const d=u.index;d!==null&&c.version<d.version&&h(u)}else h(u);return a.get(u)}return{get:o,update:l,getWireframeAttribute:f}}function e_(i,t,e){let n;function s(u){n=u}let a,r;function o(u){a=u.type,r=u.bytesPerElement}function l(u,c){i.drawElements(n,c,a,u*r),e.update(c,n,1)}function h(u,c,d){d!==0&&(i.drawElementsInstanced(n,c,a,u*r,d),e.update(c,n,d))}function f(u,c,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,c,0,a,u,0,d);let M=0;for(let m=0;m<d;m++)M+=c[m];e.update(M,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=h,this.renderMultiDraw=f}function i_(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(a,r,o){switch(e.calls++,r){case i.TRIANGLES:e.triangles+=o*(a/3);break;case i.LINES:e.lines+=o*(a/2);break;case i.LINE_STRIP:e.lines+=o*(a-1);break;case i.LINE_LOOP:e.lines+=o*a;break;case i.POINTS:e.points+=o*a;break;default:Vt("WebGLInfo: Unknown draw mode:",r);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function n_(i,t,e){const n=new WeakMap,s=new ue;function a(r,o,l){const h=r.morphTargetInfluences,f=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=f!==void 0?f.length:0;let c=n.get(o);if(c===void 0||c.count!==u){let E=function(){P.dispose(),n.delete(o),o.removeEventListener("dispose",E)};c!==void 0&&c.texture.dispose();const d=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,M=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],b=o.morphAttributes.color||[];let A=0;d===!0&&(A=1),_===!0&&(A=2),M===!0&&(A=3);let S=o.attributes.position.count*A,w=1;S>t.maxTextureSize&&(w=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);const y=new Float32Array(S*w*4*u),P=new hu(y,S,w,u);P.type=wi,P.needsUpdate=!0;const v=A*4;for(let C=0;C<u;C++){const R=m[C],D=p[C],H=b[C],q=S*w*4*C;for(let B=0;B<R.count;B++){const X=B*v;d===!0&&(s.fromBufferAttribute(R,B),y[q+X+0]=s.x,y[q+X+1]=s.y,y[q+X+2]=s.z,y[q+X+3]=0),_===!0&&(s.fromBufferAttribute(D,B),y[q+X+4]=s.x,y[q+X+5]=s.y,y[q+X+6]=s.z,y[q+X+7]=0),M===!0&&(s.fromBufferAttribute(H,B),y[q+X+8]=s.x,y[q+X+9]=s.y,y[q+X+10]=s.z,y[q+X+11]=H.itemSize===4?s.w:1)}}c={count:u,texture:P,size:new Rt(S,w)},n.set(o,c),o.addEventListener("dispose",E)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",r.morphTexture,e);else{let d=0;for(let M=0;M<h.length;M++)d+=h[M];const _=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",h)}l.getUniforms().setValue(i,"morphTargetsTexture",c.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",c.size)}return{update:a}}function s_(i,t,e,n,s){let a=new WeakMap;function r(h){const f=s.render.frame,u=h.geometry,c=t.get(h,u);if(a.get(c)!==f&&(t.update(c),a.set(c,f)),h.isInstancedMesh&&(h.hasEventListener("dispose",l)===!1&&h.addEventListener("dispose",l),a.get(h)!==f&&(e.update(h.instanceMatrix,i.ARRAY_BUFFER),h.instanceColor!==null&&e.update(h.instanceColor,i.ARRAY_BUFFER),a.set(h,f))),h.isSkinnedMesh){const d=h.skeleton;a.get(d)!==f&&(d.update(),a.set(d,f))}return c}function o(){a=new WeakMap}function l(h){const f=h.target;f.removeEventListener("dispose",l),n.releaseStatesOfObject(f),e.remove(f.instanceMatrix),f.instanceColor!==null&&e.remove(f.instanceColor)}return{update:r,dispose:o}}const a_={[Yc]:"LINEAR_TONE_MAPPING",[$c]:"REINHARD_TONE_MAPPING",[Kc]:"CINEON_TONE_MAPPING",[Zc]:"ACES_FILMIC_TONE_MAPPING",[Qc]:"AGX_TONE_MAPPING",[jc]:"NEUTRAL_TONE_MAPPING",[Jc]:"CUSTOM_TONE_MAPPING"};function r_(i,t,e,n,s,a){const r=new Ri(t,e,{type:i,depthBuffer:s,stencilBuffer:a,samples:n?4:0,depthTexture:s?new vs(t,e):void 0}),o=new Ri(t,e,{type:Xi,depthBuffer:!1,stencilBuffer:!1}),l=new Xe;l.setAttribute("position",new We([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new We([0,2,0,0,2,0],2));const h=new Yd({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),f=new ui(l,h),u=new Dl(-1,1,1,-1,0,1);let c=null,d=null,_=!1,M,m=null,p=[],b=!1;this.setSize=function(A,S){r.setSize(A,S),o.setSize(A,S);for(let w=0;w<p.length;w++){const y=p[w];y.setSize&&y.setSize(A,S)}},this.setEffects=function(A){p=A,b=p.length>0&&p[0].isRenderPass===!0;const S=r.width,w=r.height;for(let y=0;y<p.length;y++){const P=p[y];P.setSize&&P.setSize(S,w)}},this.begin=function(A,S){if(_||A.toneMapping===Pi&&p.length===0)return!1;if(m=S,S!==null){const w=S.width,y=S.height;(r.width!==w||r.height!==y)&&this.setSize(w,y)}return b===!1&&A.setRenderTarget(r),M=A.toneMapping,A.toneMapping=Pi,!0},this.hasRenderPass=function(){return b},this.end=function(A,S){A.toneMapping=M,_=!0;let w=r,y=o;for(let P=0;P<p.length;P++){const v=p[P];if(v.enabled!==!1&&(v.render(A,y,w,S),v.needsSwap!==!1)){const E=w;w=y,y=E}}if(c!==A.outputColorSpace||d!==A.toneMapping){c=A.outputColorSpace,d=A.toneMapping,h.defines={},Wt.getTransfer(c)===jt&&(h.defines.SRGB_TRANSFER="");const P=a_[d];P&&(h.defines[P]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=w.texture,A.setRenderTarget(m),A.render(f,u),m=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){r.depthTexture&&r.depthTexture.dispose(),r.dispose(),o.dispose(),l.dispose(),h.dispose()}}const bu=new Be,ol=new vs(1,1),Tu=new hu,wu=new xd,Au=new _u,Jh=[],Qh=[],jh=new Float32Array(16),tc=new Float32Array(9),ec=new Float32Array(4);function Ss(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let a=Jh[s];if(a===void 0&&(a=new Float32Array(s),Jh[s]=a),t!==0){n.toArray(a,0);for(let r=1,o=0;r!==t;++r)o+=e,i[r].toArray(a,o)}return a}function Ae(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Pe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function yr(i,t){let e=Qh[t];e===void 0&&(e=new Int32Array(t),Qh[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function o_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function l_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ae(e,t))return;i.uniform2fv(this.addr,t),Pe(e,t)}}function h_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ae(e,t))return;i.uniform3fv(this.addr,t),Pe(e,t)}}function c_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ae(e,t))return;i.uniform4fv(this.addr,t),Pe(e,t)}}function u_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ae(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Pe(e,t)}else{if(Ae(e,n))return;ec.set(n),i.uniformMatrix2fv(this.addr,!1,ec),Pe(e,n)}}function f_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ae(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Pe(e,t)}else{if(Ae(e,n))return;tc.set(n),i.uniformMatrix3fv(this.addr,!1,tc),Pe(e,n)}}function d_(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ae(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Pe(e,t)}else{if(Ae(e,n))return;jh.set(n),i.uniformMatrix4fv(this.addr,!1,jh),Pe(e,n)}}function p_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function m_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ae(e,t))return;i.uniform2iv(this.addr,t),Pe(e,t)}}function __(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ae(e,t))return;i.uniform3iv(this.addr,t),Pe(e,t)}}function g_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ae(e,t))return;i.uniform4iv(this.addr,t),Pe(e,t)}}function v_(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function M_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ae(e,t))return;i.uniform2uiv(this.addr,t),Pe(e,t)}}function x_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ae(e,t))return;i.uniform3uiv(this.addr,t),Pe(e,t)}}function S_(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ae(e,t))return;i.uniform4uiv(this.addr,t),Pe(e,t)}}function y_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let a;this.type===i.SAMPLER_2D_SHADOW?(ol.compareFunction=e.isReversedDepthBuffer()?Al:wl,a=ol):a=bu,e.setTexture2D(t||a,s)}function E_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||wu,s)}function b_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Au,s)}function T_(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Tu,s)}function w_(i){switch(i){case 5126:return o_;case 35664:return l_;case 35665:return h_;case 35666:return c_;case 35674:return u_;case 35675:return f_;case 35676:return d_;case 5124:case 35670:return p_;case 35667:case 35671:return m_;case 35668:case 35672:return __;case 35669:case 35673:return g_;case 5125:return v_;case 36294:return M_;case 36295:return x_;case 36296:return S_;case 35678:case 36198:case 36298:case 36306:case 35682:return y_;case 35679:case 36299:case 36307:return E_;case 35680:case 36300:case 36308:case 36293:return b_;case 36289:case 36303:case 36311:case 36292:return T_}}function A_(i,t){i.uniform1fv(this.addr,t)}function P_(i,t){const e=Ss(t,this.size,2);i.uniform2fv(this.addr,e)}function R_(i,t){const e=Ss(t,this.size,3);i.uniform3fv(this.addr,e)}function C_(i,t){const e=Ss(t,this.size,4);i.uniform4fv(this.addr,e)}function I_(i,t){const e=Ss(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function L_(i,t){const e=Ss(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function N_(i,t){const e=Ss(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function D_(i,t){i.uniform1iv(this.addr,t)}function U_(i,t){i.uniform2iv(this.addr,t)}function F_(i,t){i.uniform3iv(this.addr,t)}function O_(i,t){i.uniform4iv(this.addr,t)}function G_(i,t){i.uniform1uiv(this.addr,t)}function B_(i,t){i.uniform2uiv(this.addr,t)}function z_(i,t){i.uniform3uiv(this.addr,t)}function k_(i,t){i.uniform4uiv(this.addr,t)}function H_(i,t,e){const n=this.cache,s=t.length,a=yr(e,s);Ae(n,a)||(i.uniform1iv(this.addr,a),Pe(n,a));let r;this.type===i.SAMPLER_2D_SHADOW?r=ol:r=bu;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||r,a[o])}function V_(i,t,e){const n=this.cache,s=t.length,a=yr(e,s);Ae(n,a)||(i.uniform1iv(this.addr,a),Pe(n,a));for(let r=0;r!==s;++r)e.setTexture3D(t[r]||wu,a[r])}function W_(i,t,e){const n=this.cache,s=t.length,a=yr(e,s);Ae(n,a)||(i.uniform1iv(this.addr,a),Pe(n,a));for(let r=0;r!==s;++r)e.setTextureCube(t[r]||Au,a[r])}function X_(i,t,e){const n=this.cache,s=t.length,a=yr(e,s);Ae(n,a)||(i.uniform1iv(this.addr,a),Pe(n,a));for(let r=0;r!==s;++r)e.setTexture2DArray(t[r]||Tu,a[r])}function q_(i){switch(i){case 5126:return A_;case 35664:return P_;case 35665:return R_;case 35666:return C_;case 35674:return I_;case 35675:return L_;case 35676:return N_;case 5124:case 35670:return D_;case 35667:case 35671:return U_;case 35668:case 35672:return F_;case 35669:case 35673:return O_;case 5125:return G_;case 36294:return B_;case 36295:return z_;case 36296:return k_;case 35678:case 36198:case 36298:case 36306:case 35682:return H_;case 35679:case 36299:case 36307:return V_;case 35680:case 36300:case 36308:case 36293:return W_;case 36289:case 36303:case 36311:case 36292:return X_}}class Y_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=w_(e.type)}}class $_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=q_(e.type)}}class K_{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let a=0,r=s.length;a!==r;++a){const o=s[a];o.setValue(t,e[o.id],n)}}}const ro=/(\w+)(\])?(\[|\.)?/g;function ic(i,t){i.seq.push(t),i.map[t.id]=t}function Z_(i,t,e){const n=i.name,s=n.length;for(ro.lastIndex=0;;){const a=ro.exec(n),r=ro.lastIndex;let o=a[1];const l=a[2]==="]",h=a[3];if(l&&(o=o|0),h===void 0||h==="["&&r+2===s){ic(e,h===void 0?new Y_(o,i,t):new $_(o,i,t));break}else{let u=e.map[o];u===void 0&&(u=new K_(o),ic(e,u)),e=u}}}class Wa{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){const o=t.getActiveUniform(e,r),l=t.getUniformLocation(e,o.name);Z_(o,l,this)}const s=[],a=[];for(const r of this.seq)r.type===t.SAMPLER_2D_SHADOW||r.type===t.SAMPLER_CUBE_SHADOW||r.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(r):a.push(r);s.length>0&&(this.seq=s.concat(a))}setValue(t,e,n,s){const a=this.map[e];a!==void 0&&a.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let a=0,r=e.length;a!==r;++a){const o=e[a],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,a=t.length;s!==a;++s){const r=t[s];r.id in e&&n.push(r)}return n}}function nc(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const J_=37297;let Q_=0;function j_(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),a=Math.min(t+6,e.length);for(let r=s;r<a;r++){const o=r+1;n.push(`${o===t?">":" "} ${o}: ${e[r]}`)}return n.join(`
`)}const sc=new Dt;function tg(i){Wt._getMatrix(sc,Wt.workingColorSpace,i);const t=`mat3( ${sc.elements.map(e=>e.toFixed(4))} )`;switch(Wt.getTransfer(i)){case tr:return[t,"LinearTransferOETF"];case jt:return[t,"sRGBTransferOETF"];default:return Lt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function ac(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),a=(i.getShaderInfoLog(t)||"").trim();if(n&&a==="")return"";const r=/ERROR: 0:(\d+)/.exec(a);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+a+`

`+j_(i.getShaderSource(t),o)}else return a}function eg(i,t){const e=tg(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}const ig={[Yc]:"Linear",[$c]:"Reinhard",[Kc]:"Cineon",[Zc]:"ACESFilmic",[Qc]:"AgX",[jc]:"Neutral",[Jc]:"Custom"};function ng(i,t){const e=ig[t];return e===void 0?(Lt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const La=new U;function sg(){Wt.getLuminanceCoefficients(La);const i=La.x.toFixed(4),t=La.y.toFixed(4),e=La.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ag(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ds).join(`
`)}function rg(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function og(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const a=i.getActiveAttrib(t,s),r=a.name;let o=1;a.type===i.FLOAT_MAT2&&(o=2),a.type===i.FLOAT_MAT3&&(o=3),a.type===i.FLOAT_MAT4&&(o=4),e[r]={type:a.type,location:i.getAttribLocation(t,r),locationSize:o}}return e}function Ds(i){return i!==""}function rc(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function oc(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const lg=/^[ \t]*#include +<([\w\d./]+)>/gm;function ll(i){return i.replace(lg,cg)}const hg=new Map;function cg(i,t){let e=Bt[t];if(e===void 0){const n=hg.get(t);if(n!==void 0)e=Bt[n],Lt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return ll(e)}const ug=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function lc(i){return i.replace(ug,fg)}function fg(i,t,e,n){let s="";for(let a=parseInt(t);a<parseInt(e);a++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function hc(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}const dg={[Ga]:"SHADOWMAP_TYPE_PCF",[Ns]:"SHADOWMAP_TYPE_VSM"};function pg(i){return dg[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const mg={[Rn]:"ENVMAP_TYPE_CUBE",[gs]:"ENVMAP_TYPE_CUBE",[_r]:"ENVMAP_TYPE_CUBE_UV"};function _g(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":mg[i.envMapMode]||"ENVMAP_TYPE_CUBE"}const gg={[gs]:"ENVMAP_MODE_REFRACTION"};function vg(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":gg[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Mg={[qc]:"ENVMAP_BLENDING_MULTIPLY",[Qf]:"ENVMAP_BLENDING_MIX",[jf]:"ENVMAP_BLENDING_ADD"};function xg(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Mg[i.combine]||"ENVMAP_BLENDING_NONE"}function Sg(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function yg(i,t,e,n){const s=i.getContext(),a=e.defines;let r=e.vertexShader,o=e.fragmentShader;const l=pg(e),h=_g(e),f=vg(e),u=xg(e),c=Sg(e),d=ag(e),_=rg(a),M=s.createProgram();let m,p,b=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(Ds).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(Ds).join(`
`),p.length>0&&(p+=`
`)):(m=[hc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+f:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ds).join(`
`),p=[hc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.envMap?"#define "+f:"",e.envMap?"#define "+u:"",c?"#define CUBEUV_TEXEL_WIDTH "+c.texelWidth:"",c?"#define CUBEUV_TEXEL_HEIGHT "+c.texelHeight:"",c?"#define CUBEUV_MAX_MIP "+c.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Pi?"#define TONE_MAPPING":"",e.toneMapping!==Pi?Bt.tonemapping_pars_fragment:"",e.toneMapping!==Pi?ng("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Bt.colorspace_pars_fragment,eg("linearToOutputTexel",e.outputColorSpace),sg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Ds).join(`
`)),r=ll(r),r=rc(r,e),r=oc(r,e),o=ll(o),o=rc(o,e),o=oc(o,e),r=lc(r),o=lc(o),e.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===mh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===mh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const A=b+m+r,S=b+p+o,w=nc(s,s.VERTEX_SHADER,A),y=nc(s,s.FRAGMENT_SHADER,S);s.attachShader(M,w),s.attachShader(M,y),e.index0AttributeName!==void 0?s.bindAttribLocation(M,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(M,0,"position"),s.linkProgram(M);function P(R){if(i.debug.checkShaderErrors){const D=s.getProgramInfoLog(M)||"",H=s.getShaderInfoLog(w)||"",q=s.getShaderInfoLog(y)||"",B=D.trim(),X=H.trim(),V=q.trim();let J=!0,tt=!0;if(s.getProgramParameter(M,s.LINK_STATUS)===!1)if(J=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,M,w,y);else{const dt=ac(s,w,"vertex"),gt=ac(s,y,"fragment");Vt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(M,s.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+B+`
`+dt+`
`+gt)}else B!==""?Lt("WebGLProgram: Program Info Log:",B):(X===""||V==="")&&(tt=!1);tt&&(R.diagnostics={runnable:J,programLog:B,vertexShader:{log:X,prefix:m},fragmentShader:{log:V,prefix:p}})}s.deleteShader(w),s.deleteShader(y),v=new Wa(s,M),E=og(s,M)}let v;this.getUniforms=function(){return v===void 0&&P(this),v};let E;this.getAttributes=function(){return E===void 0&&P(this),E};let C=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(M,J_)),C},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(M),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Q_++,this.cacheKey=t,this.usedTimes=1,this.program=M,this.vertexShader=w,this.fragmentShader=y,this}let Eg=0;class bg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){const s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Tg(t),e.set(t,n)),n}}class Tg{constructor(t){this.id=Eg++,this.code=t,this.usedTimes=0}}function wg(i){return i===Cn||i===Ja||i===Qa}function Ag(i,t,e,n,s,a){const r=new Rl,o=new bg,l=new Set,h=[],f=new Map,u=n.logarithmicDepthBuffer;let c=n.precision;const d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(v){return l.add(v),v===0?"uv":`uv${v}`}function M(v,E,C,R,D,H){const q=R.fog,B=D.geometry,X=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?R.environment:null,V=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,J=t.get(v.envMap||X,V),tt=J&&J.mapping===_r?J.image.height:null,dt=d[v.type];v.precision!==null&&(c=n.getMaxPrecision(v.precision),c!==v.precision&&Lt("WebGLProgram.getParameters:",v.precision,"not supported, using",c,"instead."));const gt=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,xt=gt!==void 0?gt.length:0;let Yt=0;B.morphAttributes.position!==void 0&&(Yt=1),B.morphAttributes.normal!==void 0&&(Yt=2),B.morphAttributes.color!==void 0&&(Yt=3);let fe,$t,Z,rt;if(dt){const St=Ei[dt];fe=St.vertexShader,$t=St.fragmentShader}else{fe=v.vertexShader,$t=v.fragmentShader;const St=o.getVertexShaderStage(v),pe=o.getFragmentShaderStage(v);o.update(v,St,pe),Z=St.id,rt=pe.id}const et=i.getRenderTarget(),Nt=i.state.buffers.depth.getReversed(),Ut=D.isInstancedMesh===!0,Ct=D.isBatchedMesh===!0,_e=!!v.map,Ht=!!v.matcap,ne=!!J,Kt=!!v.aoMap,Xt=!!v.lightMap,xe=!!v.bumpMap&&v.wireframe===!1,be=!!v.normalMap,Re=!!v.displacementMap,Ie=!!v.emissiveMap,de=!!v.metalnessMap,Se=!!v.roughnessMap,L=v.anisotropy>0,qe=v.clearcoat>0,Qt=v.dispersion>0,T=v.iridescence>0,g=v.sheen>0,F=v.transmission>0,z=L&&!!v.anisotropyMap,W=qe&&!!v.clearcoatMap,it=qe&&!!v.clearcoatNormalMap,ot=qe&&!!v.clearcoatRoughnessMap,Y=T&&!!v.iridescenceMap,K=T&&!!v.iridescenceThicknessMap,lt=g&&!!v.sheenColorMap,Tt=g&&!!v.sheenRoughnessMap,ut=!!v.specularMap,ht=!!v.specularColorMap,Pt=!!v.specularIntensityMap,It=F&&!!v.transmissionMap,Ft=F&&!!v.thicknessMap,I=!!v.gradientMap,st=!!v.alphaMap,$=v.alphaTest>0,ct=!!v.alphaHash,_t=!!v.extensions;let Q=Pi;v.toneMapped&&(et===null||et.isXRRenderTarget===!0)&&(Q=i.toneMapping);const bt={shaderID:dt,shaderType:v.type,shaderName:v.name,vertexShader:fe,fragmentShader:$t,defines:v.defines,customVertexShaderID:Z,customFragmentShaderID:rt,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:c,batching:Ct,batchingColor:Ct&&D._colorsTexture!==null,instancing:Ut,instancingColor:Ut&&D.instanceColor!==null,instancingMorph:Ut&&D.morphTexture!==null,outputColorSpace:et===null?i.outputColorSpace:et.isXRRenderTarget===!0?et.texture.colorSpace:Wt.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:_e,matcap:Ht,envMap:ne,envMapMode:ne&&J.mapping,envMapCubeUVHeight:tt,aoMap:Kt,lightMap:Xt,bumpMap:xe,normalMap:be,displacementMap:Re,emissiveMap:Ie,normalMapObjectSpace:be&&v.normalMapType===id,normalMapTangentSpace:be&&v.normalMapType===il,packedNormalMap:be&&v.normalMapType===il&&wg(v.normalMap.format),metalnessMap:de,roughnessMap:Se,anisotropy:L,anisotropyMap:z,clearcoat:qe,clearcoatMap:W,clearcoatNormalMap:it,clearcoatRoughnessMap:ot,dispersion:Qt,iridescence:T,iridescenceMap:Y,iridescenceThicknessMap:K,sheen:g,sheenColorMap:lt,sheenRoughnessMap:Tt,specularMap:ut,specularColorMap:ht,specularIntensityMap:Pt,transmission:F,transmissionMap:It,thicknessMap:Ft,gradientMap:I,opaque:v.transparent===!1&&v.blending===cs&&v.alphaToCoverage===!1,alphaMap:st,alphaTest:$,alphaHash:ct,combine:v.combine,mapUv:_e&&_(v.map.channel),aoMapUv:Kt&&_(v.aoMap.channel),lightMapUv:Xt&&_(v.lightMap.channel),bumpMapUv:xe&&_(v.bumpMap.channel),normalMapUv:be&&_(v.normalMap.channel),displacementMapUv:Re&&_(v.displacementMap.channel),emissiveMapUv:Ie&&_(v.emissiveMap.channel),metalnessMapUv:de&&_(v.metalnessMap.channel),roughnessMapUv:Se&&_(v.roughnessMap.channel),anisotropyMapUv:z&&_(v.anisotropyMap.channel),clearcoatMapUv:W&&_(v.clearcoatMap.channel),clearcoatNormalMapUv:it&&_(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ot&&_(v.clearcoatRoughnessMap.channel),iridescenceMapUv:Y&&_(v.iridescenceMap.channel),iridescenceThicknessMapUv:K&&_(v.iridescenceThicknessMap.channel),sheenColorMapUv:lt&&_(v.sheenColorMap.channel),sheenRoughnessMapUv:Tt&&_(v.sheenRoughnessMap.channel),specularMapUv:ut&&_(v.specularMap.channel),specularColorMapUv:ht&&_(v.specularColorMap.channel),specularIntensityMapUv:Pt&&_(v.specularIntensityMap.channel),transmissionMapUv:It&&_(v.transmissionMap.channel),thicknessMapUv:Ft&&_(v.thicknessMap.channel),alphaMapUv:st&&_(v.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(be||L),vertexNormals:!!B.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!B.attributes.uv&&(_e||st),fog:!!q,useFog:v.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||B.attributes.normal===void 0&&be===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:Nt,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:xt,morphTextureStride:Yt,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:H.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:Q,decodeVideoTexture:_e&&v.map.isVideoTexture===!0&&Wt.getTransfer(v.map.colorSpace)===jt,decodeVideoTextureEmissive:Ie&&v.emissiveMap.isVideoTexture===!0&&Wt.getTransfer(v.emissiveMap.colorSpace)===jt,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===bi,flipSided:v.side===Je,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:_t&&v.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(_t&&v.extensions.multiDraw===!0||Ct)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return bt.vertexUv1s=l.has(1),bt.vertexUv2s=l.has(2),bt.vertexUv3s=l.has(3),l.clear(),bt}function m(v){const E=[];if(v.shaderID?E.push(v.shaderID):(E.push(v.customVertexShaderID),E.push(v.customFragmentShaderID)),v.defines!==void 0)for(const C in v.defines)E.push(C),E.push(v.defines[C]);return v.isRawShaderMaterial===!1&&(p(E,v),b(E,v),E.push(i.outputColorSpace)),E.push(v.customProgramCacheKey),E.join()}function p(v,E){v.push(E.precision),v.push(E.outputColorSpace),v.push(E.envMapMode),v.push(E.envMapCubeUVHeight),v.push(E.mapUv),v.push(E.alphaMapUv),v.push(E.lightMapUv),v.push(E.aoMapUv),v.push(E.bumpMapUv),v.push(E.normalMapUv),v.push(E.displacementMapUv),v.push(E.emissiveMapUv),v.push(E.metalnessMapUv),v.push(E.roughnessMapUv),v.push(E.anisotropyMapUv),v.push(E.clearcoatMapUv),v.push(E.clearcoatNormalMapUv),v.push(E.clearcoatRoughnessMapUv),v.push(E.iridescenceMapUv),v.push(E.iridescenceThicknessMapUv),v.push(E.sheenColorMapUv),v.push(E.sheenRoughnessMapUv),v.push(E.specularMapUv),v.push(E.specularColorMapUv),v.push(E.specularIntensityMapUv),v.push(E.transmissionMapUv),v.push(E.thicknessMapUv),v.push(E.combine),v.push(E.fogExp2),v.push(E.sizeAttenuation),v.push(E.morphTargetsCount),v.push(E.morphAttributeCount),v.push(E.numDirLights),v.push(E.numPointLights),v.push(E.numSpotLights),v.push(E.numSpotLightMaps),v.push(E.numHemiLights),v.push(E.numRectAreaLights),v.push(E.numDirLightShadows),v.push(E.numPointLightShadows),v.push(E.numSpotLightShadows),v.push(E.numSpotLightShadowsWithMaps),v.push(E.numLightProbes),v.push(E.shadowMapType),v.push(E.toneMapping),v.push(E.numClippingPlanes),v.push(E.numClipIntersection),v.push(E.depthPacking)}function b(v,E){r.disableAll(),E.instancing&&r.enable(0),E.instancingColor&&r.enable(1),E.instancingMorph&&r.enable(2),E.matcap&&r.enable(3),E.envMap&&r.enable(4),E.normalMapObjectSpace&&r.enable(5),E.normalMapTangentSpace&&r.enable(6),E.clearcoat&&r.enable(7),E.iridescence&&r.enable(8),E.alphaTest&&r.enable(9),E.vertexColors&&r.enable(10),E.vertexAlphas&&r.enable(11),E.vertexUv1s&&r.enable(12),E.vertexUv2s&&r.enable(13),E.vertexUv3s&&r.enable(14),E.vertexTangents&&r.enable(15),E.anisotropy&&r.enable(16),E.alphaHash&&r.enable(17),E.batching&&r.enable(18),E.dispersion&&r.enable(19),E.batchingColor&&r.enable(20),E.gradientMap&&r.enable(21),E.packedNormalMap&&r.enable(22),E.vertexNormals&&r.enable(23),v.push(r.mask),r.disableAll(),E.fog&&r.enable(0),E.useFog&&r.enable(1),E.flatShading&&r.enable(2),E.logarithmicDepthBuffer&&r.enable(3),E.reversedDepthBuffer&&r.enable(4),E.skinning&&r.enable(5),E.morphTargets&&r.enable(6),E.morphNormals&&r.enable(7),E.morphColors&&r.enable(8),E.premultipliedAlpha&&r.enable(9),E.shadowMapEnabled&&r.enable(10),E.doubleSided&&r.enable(11),E.flipSided&&r.enable(12),E.useDepthPacking&&r.enable(13),E.dithering&&r.enable(14),E.transmission&&r.enable(15),E.sheen&&r.enable(16),E.opaque&&r.enable(17),E.pointsUvs&&r.enable(18),E.decodeVideoTexture&&r.enable(19),E.decodeVideoTextureEmissive&&r.enable(20),E.alphaToCoverage&&r.enable(21),E.numLightProbeGrids>0&&r.enable(22),E.hasPositionAttribute&&r.enable(23),v.push(r.mask)}function A(v){const E=d[v.type];let C;if(E){const R=Ei[E];C=Wd.clone(R.uniforms)}else C=v.uniforms;return C}function S(v,E){let C=f.get(E);return C!==void 0?++C.usedTimes:(C=new yg(i,E,v,s),h.push(C),f.set(E,C)),C}function w(v){if(--v.usedTimes===0){const E=h.indexOf(v);h[E]=h[h.length-1],h.pop(),f.delete(v.cacheKey),v.destroy()}}function y(v){o.remove(v)}function P(){o.dispose()}return{getParameters:M,getProgramCacheKey:m,getUniforms:A,acquireProgram:S,releaseProgram:w,releaseShaderCache:y,programs:h,dispose:P}}function Pg(){let i=new WeakMap;function t(r){return i.has(r)}function e(r){let o=i.get(r);return o===void 0&&(o={},i.set(r,o)),o}function n(r){i.delete(r)}function s(r,o,l){i.get(r)[o]=l}function a(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:a}}function Rg(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function cc(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function uc(){const i=[];let t=0;const e=[],n=[],s=[];function a(){t=0,e.length=0,n.length=0,s.length=0}function r(c){let d=0;return c.isInstancedMesh&&(d+=2),c.isSkinnedMesh&&(d+=1),d}function o(c,d,_,M,m,p){let b=i[t];return b===void 0?(b={id:c.id,object:c,geometry:d,material:_,materialVariant:r(c),groupOrder:M,renderOrder:c.renderOrder,z:m,group:p},i[t]=b):(b.id=c.id,b.object=c,b.geometry=d,b.material=_,b.materialVariant=r(c),b.groupOrder=M,b.renderOrder=c.renderOrder,b.z=m,b.group=p),t++,b}function l(c,d,_,M,m,p){const b=o(c,d,_,M,m,p);_.transmission>0?n.push(b):_.transparent===!0?s.push(b):e.push(b)}function h(c,d,_,M,m,p){const b=o(c,d,_,M,m,p);_.transmission>0?n.unshift(b):_.transparent===!0?s.unshift(b):e.unshift(b)}function f(c,d,_){e.length>1&&e.sort(c||Rg),n.length>1&&n.sort(d||cc),s.length>1&&s.sort(d||cc),_&&(e.reverse(),n.reverse(),s.reverse())}function u(){for(let c=t,d=i.length;c<d;c++){const _=i[c];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:e,transmissive:n,transparent:s,init:a,push:l,unshift:h,finish:u,sort:f}}function Cg(){let i=new WeakMap;function t(n,s){const a=i.get(n);let r;return a===void 0?(r=new uc,i.set(n,[r])):s>=a.length?(r=new uc,a.push(r)):r=a[s],r}function e(){i=new WeakMap}return{get:t,dispose:e}}function Ig(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new U,color:new Et};break;case"SpotLight":e={position:new U,direction:new U,color:new Et,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new U,color:new Et,distance:0,decay:0};break;case"HemisphereLight":e={direction:new U,skyColor:new Et,groundColor:new Et};break;case"RectAreaLight":e={color:new Et,position:new U,halfWidth:new U,halfHeight:new U};break}return i[t.id]=e,e}}}function Lg(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Rt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Rt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Rt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let Ng=0;function Dg(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Ug(i){const t=new Ig,e=Lg(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)n.probe.push(new U);const s=new U,a=new le,r=new le;function o(h){let f=0,u=0,c=0;for(let E=0;E<9;E++)n.probe[E].set(0,0,0);let d=0,_=0,M=0,m=0,p=0,b=0,A=0,S=0,w=0,y=0,P=0;h.sort(Dg);for(let E=0,C=h.length;E<C;E++){const R=h[E],D=R.color,H=R.intensity,q=R.distance;let B=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===Cn?B=R.shadow.map.texture:B=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)f+=D.r*H,u+=D.g*H,c+=D.b*H;else if(R.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(R.sh.coefficients[X],H);P++}else if(R.isDirectionalLight){const X=t.get(R);if(X.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const V=R.shadow,J=e.get(R);J.shadowIntensity=V.intensity,J.shadowBias=V.bias,J.shadowNormalBias=V.normalBias,J.shadowRadius=V.radius,J.shadowMapSize=V.mapSize,n.directionalShadow[d]=J,n.directionalShadowMap[d]=B,n.directionalShadowMatrix[d]=R.shadow.matrix,b++}n.directional[d]=X,d++}else if(R.isSpotLight){const X=t.get(R);X.position.setFromMatrixPosition(R.matrixWorld),X.color.copy(D).multiplyScalar(H),X.distance=q,X.coneCos=Math.cos(R.angle),X.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),X.decay=R.decay,n.spot[M]=X;const V=R.shadow;if(R.map&&(n.spotLightMap[w]=R.map,w++,V.updateMatrices(R),R.castShadow&&y++),n.spotLightMatrix[M]=V.matrix,R.castShadow){const J=e.get(R);J.shadowIntensity=V.intensity,J.shadowBias=V.bias,J.shadowNormalBias=V.normalBias,J.shadowRadius=V.radius,J.shadowMapSize=V.mapSize,n.spotShadow[M]=J,n.spotShadowMap[M]=B,S++}M++}else if(R.isRectAreaLight){const X=t.get(R);X.color.copy(D).multiplyScalar(H),X.halfWidth.set(R.width*.5,0,0),X.halfHeight.set(0,R.height*.5,0),n.rectArea[m]=X,m++}else if(R.isPointLight){const X=t.get(R);if(X.color.copy(R.color).multiplyScalar(R.intensity),X.distance=R.distance,X.decay=R.decay,R.castShadow){const V=R.shadow,J=e.get(R);J.shadowIntensity=V.intensity,J.shadowBias=V.bias,J.shadowNormalBias=V.normalBias,J.shadowRadius=V.radius,J.shadowMapSize=V.mapSize,J.shadowCameraNear=V.camera.near,J.shadowCameraFar=V.camera.far,n.pointShadow[_]=J,n.pointShadowMap[_]=B,n.pointShadowMatrix[_]=R.shadow.matrix,A++}n.point[_]=X,_++}else if(R.isHemisphereLight){const X=t.get(R);X.skyColor.copy(R.color).multiplyScalar(H),X.groundColor.copy(R.groundColor).multiplyScalar(H),n.hemi[p]=X,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ft.LTC_FLOAT_1,n.rectAreaLTC2=ft.LTC_FLOAT_2):(n.rectAreaLTC1=ft.LTC_HALF_1,n.rectAreaLTC2=ft.LTC_HALF_2)),n.ambient[0]=f,n.ambient[1]=u,n.ambient[2]=c;const v=n.hash;(v.directionalLength!==d||v.pointLength!==_||v.spotLength!==M||v.rectAreaLength!==m||v.hemiLength!==p||v.numDirectionalShadows!==b||v.numPointShadows!==A||v.numSpotShadows!==S||v.numSpotMaps!==w||v.numLightProbes!==P)&&(n.directional.length=d,n.spot.length=M,n.rectArea.length=m,n.point.length=_,n.hemi.length=p,n.directionalShadow.length=b,n.directionalShadowMap.length=b,n.pointShadow.length=A,n.pointShadowMap.length=A,n.spotShadow.length=S,n.spotShadowMap.length=S,n.directionalShadowMatrix.length=b,n.pointShadowMatrix.length=A,n.spotLightMatrix.length=S+w-y,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=y,n.numLightProbes=P,v.directionalLength=d,v.pointLength=_,v.spotLength=M,v.rectAreaLength=m,v.hemiLength=p,v.numDirectionalShadows=b,v.numPointShadows=A,v.numSpotShadows=S,v.numSpotMaps=w,v.numLightProbes=P,n.version=Ng++)}function l(h,f){let u=0,c=0,d=0,_=0,M=0;const m=f.matrixWorldInverse;for(let p=0,b=h.length;p<b;p++){const A=h[p];if(A.isDirectionalLight){const S=n.directional[u];S.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),u++}else if(A.isSpotLight){const S=n.spot[d];S.position.setFromMatrixPosition(A.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),d++}else if(A.isRectAreaLight){const S=n.rectArea[_];S.position.setFromMatrixPosition(A.matrixWorld),S.position.applyMatrix4(m),r.identity(),a.copy(A.matrixWorld),a.premultiply(m),r.extractRotation(a),S.halfWidth.set(A.width*.5,0,0),S.halfHeight.set(0,A.height*.5,0),S.halfWidth.applyMatrix4(r),S.halfHeight.applyMatrix4(r),_++}else if(A.isPointLight){const S=n.point[c];S.position.setFromMatrixPosition(A.matrixWorld),S.position.applyMatrix4(m),c++}else if(A.isHemisphereLight){const S=n.hemi[M];S.direction.setFromMatrixPosition(A.matrixWorld),S.direction.transformDirection(m),M++}}}return{setup:o,setupView:l,state:n}}function fc(i){const t=new Ug(i),e=[],n=[],s=[];function a(c){u.camera=c,e.length=0,n.length=0,s.length=0}function r(c){e.push(c)}function o(c){n.push(c)}function l(c){s.push(c)}function h(){t.setup(e)}function f(c){t.setupView(e,c)}const u={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:h,setupLightsView:f,pushLight:r,pushShadow:o,pushLightProbeGrid:l}}function Fg(i){let t=new WeakMap;function e(s,a=0){const r=t.get(s);let o;return r===void 0?(o=new fc(i),t.set(s,[o])):a>=r.length?(o=new fc(i),r.push(o)):o=r[a],o}function n(){t=new WeakMap}return{get:e,dispose:n}}const Og=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Gg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Bg=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],zg=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],dc=new le,Is=new U,oo=new U;function kg(i,t,e){let n=new Il;const s=new Rt,a=new Rt,r=new ue,o=new Kd,l=new Zd,h={},f=e.maxTextureSize,u={[un]:Je,[Je]:un,[bi]:bi},c=new Li({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Rt},radius:{value:4}},vertexShader:Og,fragmentShader:Gg}),d=c.clone();d.defines.HORIZONTAL_PASS=1;const _=new Xe;_.setAttribute("position",new He(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const M=new ui(_,c),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ga;let p=this.type;this.render=function(y,P,v){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||y.length===0)return;this.type===Nf&&(Lt("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Ga);const E=i.getRenderTarget(),C=i.getActiveCubeFace(),R=i.getActiveMipmapLevel(),D=i.state;D.setBlending(zi),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);const H=p!==this.type;H&&P.traverse(function(q){q.material&&(Array.isArray(q.material)?q.material.forEach(B=>B.needsUpdate=!0):q.material.needsUpdate=!0)});for(let q=0,B=y.length;q<B;q++){const X=y[q],V=X.shadow;if(V===void 0){Lt("WebGLShadowMap:",X,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const J=V.getFrameExtents();s.multiply(J),a.copy(V.mapSize),(s.x>f||s.y>f)&&(s.x>f&&(a.x=Math.floor(f/J.x),s.x=a.x*J.x,V.mapSize.x=a.x),s.y>f&&(a.y=Math.floor(f/J.y),s.y=a.y*J.y,V.mapSize.y=a.y));const tt=i.state.buffers.depth.getReversed();if(V.camera._reversedDepth=tt,V.map===null||H===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Ns){if(X.isPointLight){Lt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new Ri(s.x,s.y,{format:Cn,type:Xi,minFilter:Ge,magFilter:Ge,generateMipmaps:!1}),V.map.texture.name=X.name+".shadowMap",V.map.depthTexture=new vs(s.x,s.y,wi),V.map.depthTexture.name=X.name+".shadowMapDepth",V.map.depthTexture.format=qi,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Ne,V.map.depthTexture.magFilter=Ne}else X.isPointLight?(V.map=new Eu(s.x),V.map.depthTexture=new Hd(s.x,Ii)):(V.map=new Ri(s.x,s.y),V.map.depthTexture=new vs(s.x,s.y,Ii)),V.map.depthTexture.name=X.name+".shadowMap",V.map.depthTexture.format=qi,this.type===Ga?(V.map.depthTexture.compareFunction=tt?Al:wl,V.map.depthTexture.minFilter=Ge,V.map.depthTexture.magFilter=Ge):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Ne,V.map.depthTexture.magFilter=Ne);V.camera.updateProjectionMatrix()}const dt=V.map.isWebGLCubeRenderTarget?6:1;for(let gt=0;gt<dt;gt++){if(V.map.isWebGLCubeRenderTarget)i.setRenderTarget(V.map,gt),i.clear();else{gt===0&&(i.setRenderTarget(V.map),i.clear());const xt=V.getViewport(gt);r.set(a.x*xt.x,a.y*xt.y,a.x*xt.z,a.y*xt.w),D.viewport(r)}if(X.isPointLight){const xt=V.camera,Yt=V.matrix,fe=X.distance||xt.far;fe!==xt.far&&(xt.far=fe,xt.updateProjectionMatrix()),Is.setFromMatrixPosition(X.matrixWorld),xt.position.copy(Is),oo.copy(xt.position),oo.add(Bg[gt]),xt.up.copy(zg[gt]),xt.lookAt(oo),xt.updateMatrixWorld(),Yt.makeTranslation(-Is.x,-Is.y,-Is.z),dc.multiplyMatrices(xt.projectionMatrix,xt.matrixWorldInverse),V._frustum.setFromProjectionMatrix(dc,xt.coordinateSystem,xt.reversedDepth)}else V.updateMatrices(X);n=V.getFrustum(),S(P,v,V.camera,X,this.type)}V.isPointLightShadow!==!0&&this.type===Ns&&b(V,v),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(E,C,R)};function b(y,P){const v=t.update(M);c.defines.VSM_SAMPLES!==y.blurSamples&&(c.defines.VSM_SAMPLES=y.blurSamples,d.defines.VSM_SAMPLES=y.blurSamples,c.needsUpdate=!0,d.needsUpdate=!0),y.mapPass===null&&(y.mapPass=new Ri(s.x,s.y,{format:Cn,type:Xi})),c.uniforms.shadow_pass.value=y.map.depthTexture,c.uniforms.resolution.value=y.mapSize,c.uniforms.radius.value=y.radius,i.setRenderTarget(y.mapPass),i.clear(),i.renderBufferDirect(P,null,v,c,M,null),d.uniforms.shadow_pass.value=y.mapPass.texture,d.uniforms.resolution.value=y.mapSize,d.uniforms.radius.value=y.radius,i.setRenderTarget(y.map),i.clear(),i.renderBufferDirect(P,null,v,d,M,null)}function A(y,P,v,E){let C=null;const R=v.isPointLight===!0?y.customDistanceMaterial:y.customDepthMaterial;if(R!==void 0)C=R;else if(C=v.isPointLight===!0?l:o,i.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){const D=C.uuid,H=P.uuid;let q=h[D];q===void 0&&(q={},h[D]=q);let B=q[H];B===void 0&&(B=C.clone(),q[H]=B,P.addEventListener("dispose",w)),C=B}if(C.visible=P.visible,C.wireframe=P.wireframe,E===Ns?C.side=P.shadowSide!==null?P.shadowSide:P.side:C.side=P.shadowSide!==null?P.shadowSide:u[P.side],C.alphaMap=P.alphaMap,C.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,C.map=P.map,C.clipShadows=P.clipShadows,C.clippingPlanes=P.clippingPlanes,C.clipIntersection=P.clipIntersection,C.displacementMap=P.displacementMap,C.displacementScale=P.displacementScale,C.displacementBias=P.displacementBias,C.wireframeLinewidth=P.wireframeLinewidth,C.linewidth=P.linewidth,v.isPointLight===!0&&C.isMeshDistanceMaterial===!0){const D=i.properties.get(C);D.light=v}return C}function S(y,P,v,E,C){if(y.visible===!1)return;if(y.layers.test(P.layers)&&(y.isMesh||y.isLine||y.isPoints)&&(y.castShadow||y.receiveShadow&&C===Ns)&&(!y.frustumCulled||n.intersectsObject(y))){y.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,y.matrixWorld);const H=t.update(y),q=y.material;if(Array.isArray(q)){const B=H.groups;for(let X=0,V=B.length;X<V;X++){const J=B[X],tt=q[J.materialIndex];if(tt&&tt.visible){const dt=A(y,tt,E,C);y.onBeforeShadow(i,y,P,v,H,dt,J),i.renderBufferDirect(v,null,H,dt,y,J),y.onAfterShadow(i,y,P,v,H,dt,J)}}}else if(q.visible){const B=A(y,q,E,C);y.onBeforeShadow(i,y,P,v,H,B,null),i.renderBufferDirect(v,null,H,B,y,null),y.onAfterShadow(i,y,P,v,H,B,null)}}const D=y.children;for(let H=0,q=D.length;H<q;H++)S(D[H],P,v,E,C)}function w(y){y.target.removeEventListener("dispose",w);for(const v in h){const E=h[v],C=y.target.uuid;C in E&&(E[C].dispose(),delete E[C])}}}function Hg(i,t){function e(){let I=!1;const st=new ue;let $=null;const ct=new ue(0,0,0,0);return{setMask:function(_t){$!==_t&&!I&&(i.colorMask(_t,_t,_t,_t),$=_t)},setLocked:function(_t){I=_t},setClear:function(_t,Q,bt,St,pe){pe===!0&&(_t*=St,Q*=St,bt*=St),st.set(_t,Q,bt,St),ct.equals(st)===!1&&(i.clearColor(_t,Q,bt,St),ct.copy(st))},reset:function(){I=!1,$=null,ct.set(-1,0,0,0)}}}function n(){let I=!1,st=!1,$=null,ct=null,_t=null;return{setReversed:function(Q){if(st!==Q){const bt=t.get("EXT_clip_control");Q?bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.ZERO_TO_ONE_EXT):bt.clipControlEXT(bt.LOWER_LEFT_EXT,bt.NEGATIVE_ONE_TO_ONE_EXT),st=Q;const St=_t;_t=null,this.setClear(St)}},getReversed:function(){return st},setTest:function(Q){Q?et(i.DEPTH_TEST):Nt(i.DEPTH_TEST)},setMask:function(Q){$!==Q&&!I&&(i.depthMask(Q),$=Q)},setFunc:function(Q){if(st&&(Q=fd[Q]),ct!==Q){switch(Q){case go:i.depthFunc(i.NEVER);break;case vo:i.depthFunc(i.ALWAYS);break;case Mo:i.depthFunc(i.LESS);break;case _s:i.depthFunc(i.LEQUAL);break;case xo:i.depthFunc(i.EQUAL);break;case So:i.depthFunc(i.GEQUAL);break;case yo:i.depthFunc(i.GREATER);break;case Eo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ct=Q}},setLocked:function(Q){I=Q},setClear:function(Q){_t!==Q&&(_t=Q,st&&(Q=1-Q),i.clearDepth(Q))},reset:function(){I=!1,$=null,ct=null,_t=null,st=!1}}}function s(){let I=!1,st=null,$=null,ct=null,_t=null,Q=null,bt=null,St=null,pe=null;return{setTest:function(re){I||(re?et(i.STENCIL_TEST):Nt(i.STENCIL_TEST))},setMask:function(re){st!==re&&!I&&(i.stencilMask(re),st=re)},setFunc:function(re,vi,Mi){($!==re||ct!==vi||_t!==Mi)&&(i.stencilFunc(re,vi,Mi),$=re,ct=vi,_t=Mi)},setOp:function(re,vi,Mi){(Q!==re||bt!==vi||St!==Mi)&&(i.stencilOp(re,vi,Mi),Q=re,bt=vi,St=Mi)},setLocked:function(re){I=re},setClear:function(re){pe!==re&&(i.clearStencil(re),pe=re)},reset:function(){I=!1,st=null,$=null,ct=null,_t=null,Q=null,bt=null,St=null,pe=null}}}const a=new e,r=new n,o=new s,l=new WeakMap,h=new WeakMap;let f={},u={},c={},d=new WeakMap,_=[],M=null,m=!1,p=null,b=null,A=null,S=null,w=null,y=null,P=null,v=new Et(0,0,0),E=0,C=!1,R=null,D=null,H=null,q=null,B=null;const X=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,J=0;const tt=i.getParameter(i.VERSION);tt.indexOf("WebGL")!==-1?(J=parseFloat(/^WebGL (\d)/.exec(tt)[1]),V=J>=1):tt.indexOf("OpenGL ES")!==-1&&(J=parseFloat(/^OpenGL ES (\d)/.exec(tt)[1]),V=J>=2);let dt=null,gt={};const xt=i.getParameter(i.SCISSOR_BOX),Yt=i.getParameter(i.VIEWPORT),fe=new ue().fromArray(xt),$t=new ue().fromArray(Yt);function Z(I,st,$,ct){const _t=new Uint8Array(4),Q=i.createTexture();i.bindTexture(I,Q),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let bt=0;bt<$;bt++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(st,0,i.RGBA,1,1,ct,0,i.RGBA,i.UNSIGNED_BYTE,_t):i.texImage2D(st+bt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,_t);return Q}const rt={};rt[i.TEXTURE_2D]=Z(i.TEXTURE_2D,i.TEXTURE_2D,1),rt[i.TEXTURE_CUBE_MAP]=Z(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),rt[i.TEXTURE_2D_ARRAY]=Z(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),rt[i.TEXTURE_3D]=Z(i.TEXTURE_3D,i.TEXTURE_3D,1,1),a.setClear(0,0,0,1),r.setClear(1),o.setClear(0),et(i.DEPTH_TEST),r.setFunc(_s),xe(!1),be(ch),et(i.CULL_FACE),Kt(zi);function et(I){f[I]!==!0&&(i.enable(I),f[I]=!0)}function Nt(I){f[I]!==!1&&(i.disable(I),f[I]=!1)}function Ut(I,st){return c[I]!==st?(i.bindFramebuffer(I,st),c[I]=st,I===i.DRAW_FRAMEBUFFER&&(c[i.FRAMEBUFFER]=st),I===i.FRAMEBUFFER&&(c[i.DRAW_FRAMEBUFFER]=st),!0):!1}function Ct(I,st){let $=_,ct=!1;if(I){$=d.get(st),$===void 0&&($=[],d.set(st,$));const _t=I.textures;if($.length!==_t.length||$[0]!==i.COLOR_ATTACHMENT0){for(let Q=0,bt=_t.length;Q<bt;Q++)$[Q]=i.COLOR_ATTACHMENT0+Q;$.length=_t.length,ct=!0}}else $[0]!==i.BACK&&($[0]=i.BACK,ct=!0);ct&&i.drawBuffers($)}function _e(I){return M!==I?(i.useProgram(I),M=I,!0):!1}const Ht={[Tn]:i.FUNC_ADD,[Uf]:i.FUNC_SUBTRACT,[Ff]:i.FUNC_REVERSE_SUBTRACT};Ht[Of]=i.MIN,Ht[Gf]=i.MAX;const ne={[Bf]:i.ZERO,[zf]:i.ONE,[kf]:i.SRC_COLOR,[mo]:i.SRC_ALPHA,[Yf]:i.SRC_ALPHA_SATURATE,[Xf]:i.DST_COLOR,[Vf]:i.DST_ALPHA,[Hf]:i.ONE_MINUS_SRC_COLOR,[_o]:i.ONE_MINUS_SRC_ALPHA,[qf]:i.ONE_MINUS_DST_COLOR,[Wf]:i.ONE_MINUS_DST_ALPHA,[$f]:i.CONSTANT_COLOR,[Kf]:i.ONE_MINUS_CONSTANT_COLOR,[Zf]:i.CONSTANT_ALPHA,[Jf]:i.ONE_MINUS_CONSTANT_ALPHA};function Kt(I,st,$,ct,_t,Q,bt,St,pe,re){if(I===zi){m===!0&&(Nt(i.BLEND),m=!1);return}if(m===!1&&(et(i.BLEND),m=!0),I!==Df){if(I!==p||re!==C){if((b!==Tn||w!==Tn)&&(i.blendEquation(i.FUNC_ADD),b=Tn,w=Tn),re)switch(I){case cs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case uh:i.blendFunc(i.ONE,i.ONE);break;case fh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case dh:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Vt("WebGLState: Invalid blending: ",I);break}else switch(I){case cs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case uh:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case fh:Vt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case dh:Vt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Vt("WebGLState: Invalid blending: ",I);break}A=null,S=null,y=null,P=null,v.set(0,0,0),E=0,p=I,C=re}return}_t=_t||st,Q=Q||$,bt=bt||ct,(st!==b||_t!==w)&&(i.blendEquationSeparate(Ht[st],Ht[_t]),b=st,w=_t),($!==A||ct!==S||Q!==y||bt!==P)&&(i.blendFuncSeparate(ne[$],ne[ct],ne[Q],ne[bt]),A=$,S=ct,y=Q,P=bt),(St.equals(v)===!1||pe!==E)&&(i.blendColor(St.r,St.g,St.b,pe),v.copy(St),E=pe),p=I,C=!1}function Xt(I,st){I.side===bi?Nt(i.CULL_FACE):et(i.CULL_FACE);let $=I.side===Je;st&&($=!$),xe($),I.blending===cs&&I.transparent===!1?Kt(zi):Kt(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),r.setFunc(I.depthFunc),r.setTest(I.depthTest),r.setMask(I.depthWrite),a.setMask(I.colorWrite);const ct=I.stencilWrite;o.setTest(ct),ct&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),Ie(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?et(i.SAMPLE_ALPHA_TO_COVERAGE):Nt(i.SAMPLE_ALPHA_TO_COVERAGE)}function xe(I){R!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),R=I)}function be(I){I!==If?(et(i.CULL_FACE),I!==D&&(I===ch?i.cullFace(i.BACK):I===Lf?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Nt(i.CULL_FACE),D=I}function Re(I){I!==H&&(V&&i.lineWidth(I),H=I)}function Ie(I,st,$){I?(et(i.POLYGON_OFFSET_FILL),(q!==st||B!==$)&&(q=st,B=$,r.getReversed()&&(st=-st),i.polygonOffset(st,$))):Nt(i.POLYGON_OFFSET_FILL)}function de(I){I?et(i.SCISSOR_TEST):Nt(i.SCISSOR_TEST)}function Se(I){I===void 0&&(I=i.TEXTURE0+X-1),dt!==I&&(i.activeTexture(I),dt=I)}function L(I,st,$){$===void 0&&(dt===null?$=i.TEXTURE0+X-1:$=dt);let ct=gt[$];ct===void 0&&(ct={type:void 0,texture:void 0},gt[$]=ct),(ct.type!==I||ct.texture!==st)&&(dt!==$&&(i.activeTexture($),dt=$),i.bindTexture(I,st||rt[I]),ct.type=I,ct.texture=st)}function qe(){const I=gt[dt];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function Qt(){try{i.compressedTexImage2D(...arguments)}catch(I){Vt("WebGLState:",I)}}function T(){try{i.compressedTexImage3D(...arguments)}catch(I){Vt("WebGLState:",I)}}function g(){try{i.texSubImage2D(...arguments)}catch(I){Vt("WebGLState:",I)}}function F(){try{i.texSubImage3D(...arguments)}catch(I){Vt("WebGLState:",I)}}function z(){try{i.compressedTexSubImage2D(...arguments)}catch(I){Vt("WebGLState:",I)}}function W(){try{i.compressedTexSubImage3D(...arguments)}catch(I){Vt("WebGLState:",I)}}function it(){try{i.texStorage2D(...arguments)}catch(I){Vt("WebGLState:",I)}}function ot(){try{i.texStorage3D(...arguments)}catch(I){Vt("WebGLState:",I)}}function Y(){try{i.texImage2D(...arguments)}catch(I){Vt("WebGLState:",I)}}function K(){try{i.texImage3D(...arguments)}catch(I){Vt("WebGLState:",I)}}function lt(I){return u[I]!==void 0?u[I]:i.getParameter(I)}function Tt(I,st){u[I]!==st&&(i.pixelStorei(I,st),u[I]=st)}function ut(I){fe.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),fe.copy(I))}function ht(I){$t.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),$t.copy(I))}function Pt(I,st){let $=h.get(st);$===void 0&&($=new WeakMap,h.set(st,$));let ct=$.get(I);ct===void 0&&(ct=i.getUniformBlockIndex(st,I.name),$.set(I,ct))}function It(I,st){const ct=h.get(st).get(I);l.get(st)!==ct&&(i.uniformBlockBinding(st,ct,I.__bindingPointIndex),l.set(st,ct))}function Ft(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),r.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),f={},u={},dt=null,gt={},c={},d=new WeakMap,_=[],M=null,m=!1,p=null,b=null,A=null,S=null,w=null,y=null,P=null,v=new Et(0,0,0),E=0,C=!1,R=null,D=null,H=null,q=null,B=null,fe.set(0,0,i.canvas.width,i.canvas.height),$t.set(0,0,i.canvas.width,i.canvas.height),a.reset(),r.reset(),o.reset()}return{buffers:{color:a,depth:r,stencil:o},enable:et,disable:Nt,bindFramebuffer:Ut,drawBuffers:Ct,useProgram:_e,setBlending:Kt,setMaterial:Xt,setFlipSided:xe,setCullFace:be,setLineWidth:Re,setPolygonOffset:Ie,setScissorTest:de,activeTexture:Se,bindTexture:L,unbindTexture:qe,compressedTexImage2D:Qt,compressedTexImage3D:T,texImage2D:Y,texImage3D:K,pixelStorei:Tt,getParameter:lt,updateUBOMapping:Pt,uniformBlockBinding:It,texStorage2D:it,texStorage3D:ot,texSubImage2D:g,texSubImage3D:F,compressedTexSubImage2D:z,compressedTexSubImage3D:W,scissor:ut,viewport:ht,reset:Ft}}function Vg(i,t,e,n,s,a,r){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new Rt,f=new WeakMap,u=new Set;let c;const d=new WeakMap;let _=!1;try{_=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(T,g){return _?new OffscreenCanvas(T,g):er("canvas")}function m(T,g,F){let z=1;const W=Qt(T);if((W.width>F||W.height>F)&&(z=F/Math.max(W.width,W.height)),z<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const it=Math.floor(z*W.width),ot=Math.floor(z*W.height);c===void 0&&(c=M(it,ot));const Y=g?M(it,ot):c;return Y.width=it,Y.height=ot,Y.getContext("2d").drawImage(T,0,0,it,ot),Lt("WebGLRenderer: Texture has been resized from ("+W.width+"x"+W.height+") to ("+it+"x"+ot+")."),Y}else return"data"in T&&Lt("WebGLRenderer: Image in DataTexture is too big ("+W.width+"x"+W.height+")."),T;return T}function p(T){return T.generateMipmaps}function b(T){i.generateMipmap(T)}function A(T){return T.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?i.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(T,g,F,z,W,it=!1){if(T!==null){if(i[T]!==void 0)return i[T];Lt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let ot;z&&(ot=t.get("EXT_texture_norm16"),ot||Lt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=g;if(g===i.RED&&(F===i.FLOAT&&(Y=i.R32F),F===i.HALF_FLOAT&&(Y=i.R16F),F===i.UNSIGNED_BYTE&&(Y=i.R8),F===i.UNSIGNED_SHORT&&ot&&(Y=ot.R16_EXT),F===i.SHORT&&ot&&(Y=ot.R16_SNORM_EXT)),g===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(Y=i.R8UI),F===i.UNSIGNED_SHORT&&(Y=i.R16UI),F===i.UNSIGNED_INT&&(Y=i.R32UI),F===i.BYTE&&(Y=i.R8I),F===i.SHORT&&(Y=i.R16I),F===i.INT&&(Y=i.R32I)),g===i.RG&&(F===i.FLOAT&&(Y=i.RG32F),F===i.HALF_FLOAT&&(Y=i.RG16F),F===i.UNSIGNED_BYTE&&(Y=i.RG8),F===i.UNSIGNED_SHORT&&ot&&(Y=ot.RG16_EXT),F===i.SHORT&&ot&&(Y=ot.RG16_SNORM_EXT)),g===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(Y=i.RG8UI),F===i.UNSIGNED_SHORT&&(Y=i.RG16UI),F===i.UNSIGNED_INT&&(Y=i.RG32UI),F===i.BYTE&&(Y=i.RG8I),F===i.SHORT&&(Y=i.RG16I),F===i.INT&&(Y=i.RG32I)),g===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(Y=i.RGB8UI),F===i.UNSIGNED_SHORT&&(Y=i.RGB16UI),F===i.UNSIGNED_INT&&(Y=i.RGB32UI),F===i.BYTE&&(Y=i.RGB8I),F===i.SHORT&&(Y=i.RGB16I),F===i.INT&&(Y=i.RGB32I)),g===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(Y=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(Y=i.RGBA16UI),F===i.UNSIGNED_INT&&(Y=i.RGBA32UI),F===i.BYTE&&(Y=i.RGBA8I),F===i.SHORT&&(Y=i.RGBA16I),F===i.INT&&(Y=i.RGBA32I)),g===i.RGB&&(F===i.UNSIGNED_SHORT&&ot&&(Y=ot.RGB16_EXT),F===i.SHORT&&ot&&(Y=ot.RGB16_SNORM_EXT),F===i.UNSIGNED_INT_5_9_9_9_REV&&(Y=i.RGB9_E5),F===i.UNSIGNED_INT_10F_11F_11F_REV&&(Y=i.R11F_G11F_B10F)),g===i.RGBA){const K=it?tr:Wt.getTransfer(W);F===i.FLOAT&&(Y=i.RGBA32F),F===i.HALF_FLOAT&&(Y=i.RGBA16F),F===i.UNSIGNED_BYTE&&(Y=K===jt?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT&&ot&&(Y=ot.RGBA16_EXT),F===i.SHORT&&ot&&(Y=ot.RGBA16_SNORM_EXT),F===i.UNSIGNED_SHORT_4_4_4_4&&(Y=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(Y=i.RGB5_A1)}return(Y===i.R16F||Y===i.R32F||Y===i.RG16F||Y===i.RG32F||Y===i.RGBA16F||Y===i.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function w(T,g){let F;return T?g===null||g===Ii||g===Xs?F=i.DEPTH24_STENCIL8:g===wi?F=i.DEPTH32F_STENCIL8:g===Ws&&(F=i.DEPTH24_STENCIL8,Lt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):g===null||g===Ii||g===Xs?F=i.DEPTH_COMPONENT24:g===wi?F=i.DEPTH_COMPONENT32F:g===Ws&&(F=i.DEPTH_COMPONENT16),F}function y(T,g){return p(T)===!0||T.isFramebufferTexture&&T.minFilter!==Ne&&T.minFilter!==Ge?Math.log2(Math.max(g.width,g.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?g.mipmaps.length:1}function P(T){const g=T.target;g.removeEventListener("dispose",P),E(g),g.isVideoTexture&&f.delete(g),g.isHTMLTexture&&u.delete(g)}function v(T){const g=T.target;g.removeEventListener("dispose",v),R(g)}function E(T){const g=n.get(T);if(g.__webglInit===void 0)return;const F=T.source,z=d.get(F);if(z){const W=z[g.__cacheKey];W.usedTimes--,W.usedTimes===0&&C(T),Object.keys(z).length===0&&d.delete(F)}n.remove(T)}function C(T){const g=n.get(T);i.deleteTexture(g.__webglTexture);const F=T.source,z=d.get(F);delete z[g.__cacheKey],r.memory.textures--}function R(T){const g=n.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),n.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let z=0;z<6;z++){if(Array.isArray(g.__webglFramebuffer[z]))for(let W=0;W<g.__webglFramebuffer[z].length;W++)i.deleteFramebuffer(g.__webglFramebuffer[z][W]);else i.deleteFramebuffer(g.__webglFramebuffer[z]);g.__webglDepthbuffer&&i.deleteRenderbuffer(g.__webglDepthbuffer[z])}else{if(Array.isArray(g.__webglFramebuffer))for(let z=0;z<g.__webglFramebuffer.length;z++)i.deleteFramebuffer(g.__webglFramebuffer[z]);else i.deleteFramebuffer(g.__webglFramebuffer);if(g.__webglDepthbuffer&&i.deleteRenderbuffer(g.__webglDepthbuffer),g.__webglMultisampledFramebuffer&&i.deleteFramebuffer(g.__webglMultisampledFramebuffer),g.__webglColorRenderbuffer)for(let z=0;z<g.__webglColorRenderbuffer.length;z++)g.__webglColorRenderbuffer[z]&&i.deleteRenderbuffer(g.__webglColorRenderbuffer[z]);g.__webglDepthRenderbuffer&&i.deleteRenderbuffer(g.__webglDepthRenderbuffer)}const F=T.textures;for(let z=0,W=F.length;z<W;z++){const it=n.get(F[z]);it.__webglTexture&&(i.deleteTexture(it.__webglTexture),r.memory.textures--),n.remove(F[z])}n.remove(T)}let D=0;function H(){D=0}function q(){return D}function B(T){D=T}function X(){const T=D;return T>=s.maxTextures&&Lt("WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),D+=1,T}function V(T){const g=[];return g.push(T.wrapS),g.push(T.wrapT),g.push(T.wrapR||0),g.push(T.magFilter),g.push(T.minFilter),g.push(T.anisotropy),g.push(T.internalFormat),g.push(T.format),g.push(T.type),g.push(T.generateMipmaps),g.push(T.premultiplyAlpha),g.push(T.flipY),g.push(T.unpackAlignment),g.push(T.colorSpace),g.join()}function J(T,g){const F=n.get(T);if(T.isVideoTexture&&L(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&F.__version!==T.version){const z=T.image;if(z===null)Lt("WebGLRenderer: Texture marked for update but no image data found.");else if(z.complete===!1)Lt("WebGLRenderer: Texture marked for update but image is incomplete");else{Nt(F,T,g);return}}else T.isExternalTexture&&(F.__webglTexture=T.sourceTexture?T.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+g)}function tt(T,g){const F=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&F.__version!==T.version){Nt(F,T,g);return}else T.isExternalTexture&&(F.__webglTexture=T.sourceTexture?T.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+g)}function dt(T,g){const F=n.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&F.__version!==T.version){Nt(F,T,g);return}e.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+g)}function gt(T,g){const F=n.get(T);if(T.isCubeDepthTexture!==!0&&T.version>0&&F.__version!==T.version){Ut(F,T,g);return}e.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+g)}const xt={[bo]:i.REPEAT,[Bi]:i.CLAMP_TO_EDGE,[To]:i.MIRRORED_REPEAT},Yt={[Ne]:i.NEAREST,[td]:i.NEAREST_MIPMAP_NEAREST,[ra]:i.NEAREST_MIPMAP_LINEAR,[Ge]:i.LINEAR,[Cr]:i.LINEAR_MIPMAP_NEAREST,[An]:i.LINEAR_MIPMAP_LINEAR},fe={[nd]:i.NEVER,[ld]:i.ALWAYS,[sd]:i.LESS,[wl]:i.LEQUAL,[ad]:i.EQUAL,[Al]:i.GEQUAL,[rd]:i.GREATER,[od]:i.NOTEQUAL};function $t(T,g){if(g.type===wi&&t.has("OES_texture_float_linear")===!1&&(g.magFilter===Ge||g.magFilter===Cr||g.magFilter===ra||g.magFilter===An||g.minFilter===Ge||g.minFilter===Cr||g.minFilter===ra||g.minFilter===An)&&Lt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(T,i.TEXTURE_WRAP_S,xt[g.wrapS]),i.texParameteri(T,i.TEXTURE_WRAP_T,xt[g.wrapT]),(T===i.TEXTURE_3D||T===i.TEXTURE_2D_ARRAY)&&i.texParameteri(T,i.TEXTURE_WRAP_R,xt[g.wrapR]),i.texParameteri(T,i.TEXTURE_MAG_FILTER,Yt[g.magFilter]),i.texParameteri(T,i.TEXTURE_MIN_FILTER,Yt[g.minFilter]),g.compareFunction&&(i.texParameteri(T,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(T,i.TEXTURE_COMPARE_FUNC,fe[g.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(g.magFilter===Ne||g.minFilter!==ra&&g.minFilter!==An||g.type===wi&&t.has("OES_texture_float_linear")===!1)return;if(g.anisotropy>1||n.get(g).__currentAnisotropy){const F=t.get("EXT_texture_filter_anisotropic");i.texParameterf(T,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(g.anisotropy,s.getMaxAnisotropy())),n.get(g).__currentAnisotropy=g.anisotropy}}}function Z(T,g){let F=!1;T.__webglInit===void 0&&(T.__webglInit=!0,g.addEventListener("dispose",P));const z=g.source;let W=d.get(z);W===void 0&&(W={},d.set(z,W));const it=V(g);if(it!==T.__cacheKey){W[it]===void 0&&(W[it]={texture:i.createTexture(),usedTimes:0},r.memory.textures++,F=!0),W[it].usedTimes++;const ot=W[T.__cacheKey];ot!==void 0&&(W[T.__cacheKey].usedTimes--,ot.usedTimes===0&&C(g)),T.__cacheKey=it,T.__webglTexture=W[it].texture}return F}function rt(T,g,F){return Math.floor(Math.floor(T/F)/g)}function et(T,g,F,z){const it=T.updateRanges;if(it.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,g.width,g.height,F,z,g.data);else{it.sort((Tt,ut)=>Tt.start-ut.start);let ot=0;for(let Tt=1;Tt<it.length;Tt++){const ut=it[ot],ht=it[Tt],Pt=ut.start+ut.count,It=rt(ht.start,g.width,4),Ft=rt(ut.start,g.width,4);ht.start<=Pt+1&&It===Ft&&rt(ht.start+ht.count-1,g.width,4)===It?ut.count=Math.max(ut.count,ht.start+ht.count-ut.start):(++ot,it[ot]=ht)}it.length=ot+1;const Y=e.getParameter(i.UNPACK_ROW_LENGTH),K=e.getParameter(i.UNPACK_SKIP_PIXELS),lt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,g.width);for(let Tt=0,ut=it.length;Tt<ut;Tt++){const ht=it[Tt],Pt=Math.floor(ht.start/4),It=Math.ceil(ht.count/4),Ft=Pt%g.width,I=Math.floor(Pt/g.width),st=It,$=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,Ft),e.pixelStorei(i.UNPACK_SKIP_ROWS,I),e.texSubImage2D(i.TEXTURE_2D,0,Ft,I,st,$,F,z,g.data)}T.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,Y),e.pixelStorei(i.UNPACK_SKIP_PIXELS,K),e.pixelStorei(i.UNPACK_SKIP_ROWS,lt)}}function Nt(T,g,F){let z=i.TEXTURE_2D;(g.isDataArrayTexture||g.isCompressedArrayTexture)&&(z=i.TEXTURE_2D_ARRAY),g.isData3DTexture&&(z=i.TEXTURE_3D);const W=Z(T,g),it=g.source;e.bindTexture(z,T.__webglTexture,i.TEXTURE0+F);const ot=n.get(it);if(it.version!==ot.__version||W===!0){if(e.activeTexture(i.TEXTURE0+F),(typeof ImageBitmap<"u"&&g.image instanceof ImageBitmap)===!1){const $=Wt.getPrimaries(Wt.workingColorSpace),ct=g.colorSpace===an?null:Wt.getPrimaries(g.colorSpace),_t=g.colorSpace===an||$===ct?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,g.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t)}e.pixelStorei(i.UNPACK_ALIGNMENT,g.unpackAlignment);let K=m(g.image,!1,s.maxTextureSize);K=qe(g,K);const lt=a.convert(g.format,g.colorSpace),Tt=a.convert(g.type);let ut=S(g.internalFormat,lt,Tt,g.normalized,g.colorSpace,g.isVideoTexture);$t(z,g);let ht;const Pt=g.mipmaps,It=g.isVideoTexture!==!0,Ft=ot.__version===void 0||W===!0,I=it.dataReady,st=y(g,K);if(g.isDepthTexture)ut=w(g.format===Pn,g.type),Ft&&(It?e.texStorage2D(i.TEXTURE_2D,1,ut,K.width,K.height):e.texImage2D(i.TEXTURE_2D,0,ut,K.width,K.height,0,lt,Tt,null));else if(g.isDataTexture)if(Pt.length>0){It&&Ft&&e.texStorage2D(i.TEXTURE_2D,st,ut,Pt[0].width,Pt[0].height);for(let $=0,ct=Pt.length;$<ct;$++)ht=Pt[$],It?I&&e.texSubImage2D(i.TEXTURE_2D,$,0,0,ht.width,ht.height,lt,Tt,ht.data):e.texImage2D(i.TEXTURE_2D,$,ut,ht.width,ht.height,0,lt,Tt,ht.data);g.generateMipmaps=!1}else It?(Ft&&e.texStorage2D(i.TEXTURE_2D,st,ut,K.width,K.height),I&&et(g,K,lt,Tt)):e.texImage2D(i.TEXTURE_2D,0,ut,K.width,K.height,0,lt,Tt,K.data);else if(g.isCompressedTexture)if(g.isCompressedArrayTexture){It&&Ft&&e.texStorage3D(i.TEXTURE_2D_ARRAY,st,ut,Pt[0].width,Pt[0].height,K.depth);for(let $=0,ct=Pt.length;$<ct;$++)if(ht=Pt[$],g.format!==mi)if(lt!==null)if(It){if(I)if(g.layerUpdates.size>0){const _t=Wh(ht.width,ht.height,g.format,g.type);for(const Q of g.layerUpdates){const bt=ht.data.subarray(Q*_t/ht.data.BYTES_PER_ELEMENT,(Q+1)*_t/ht.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,$,0,0,Q,ht.width,ht.height,1,lt,bt)}g.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,$,0,0,0,ht.width,ht.height,K.depth,lt,ht.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,$,ut,ht.width,ht.height,K.depth,0,ht.data,0,0);else Lt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else It?I&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,$,0,0,0,ht.width,ht.height,K.depth,lt,Tt,ht.data):e.texImage3D(i.TEXTURE_2D_ARRAY,$,ut,ht.width,ht.height,K.depth,0,lt,Tt,ht.data)}else{It&&Ft&&e.texStorage2D(i.TEXTURE_2D,st,ut,Pt[0].width,Pt[0].height);for(let $=0,ct=Pt.length;$<ct;$++)ht=Pt[$],g.format!==mi?lt!==null?It?I&&e.compressedTexSubImage2D(i.TEXTURE_2D,$,0,0,ht.width,ht.height,lt,ht.data):e.compressedTexImage2D(i.TEXTURE_2D,$,ut,ht.width,ht.height,0,ht.data):Lt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):It?I&&e.texSubImage2D(i.TEXTURE_2D,$,0,0,ht.width,ht.height,lt,Tt,ht.data):e.texImage2D(i.TEXTURE_2D,$,ut,ht.width,ht.height,0,lt,Tt,ht.data)}else if(g.isDataArrayTexture)if(It){if(Ft&&e.texStorage3D(i.TEXTURE_2D_ARRAY,st,ut,K.width,K.height,K.depth),I)if(g.layerUpdates.size>0){const $=Wh(K.width,K.height,g.format,g.type);for(const ct of g.layerUpdates){const _t=K.data.subarray(ct*$/K.data.BYTES_PER_ELEMENT,(ct+1)*$/K.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,ct,K.width,K.height,1,lt,Tt,_t)}g.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,lt,Tt,K.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,ut,K.width,K.height,K.depth,0,lt,Tt,K.data);else if(g.isData3DTexture)It?(Ft&&e.texStorage3D(i.TEXTURE_3D,st,ut,K.width,K.height,K.depth),I&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,lt,Tt,K.data)):e.texImage3D(i.TEXTURE_3D,0,ut,K.width,K.height,K.depth,0,lt,Tt,K.data);else if(g.isFramebufferTexture){if(Ft)if(It)e.texStorage2D(i.TEXTURE_2D,st,ut,K.width,K.height);else{let $=K.width,ct=K.height;for(let _t=0;_t<st;_t++)e.texImage2D(i.TEXTURE_2D,_t,ut,$,ct,0,lt,Tt,null),$>>=1,ct>>=1}}else if(g.isHTMLTexture){if("texElementImage2D"in i){const $=i.canvas;if($.hasAttribute("layoutsubtree")||$.setAttribute("layoutsubtree","true"),K.parentNode!==$){$.appendChild(K),u.add(g),$.onpaint=ct=>{const _t=ct.changedElements;for(const Q of u)_t.includes(Q.image)&&(Q.needsUpdate=!0)},$.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,K);else{const _t=i.RGBA,Q=i.RGBA,bt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,_t,Q,bt,K)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Pt.length>0){if(It&&Ft){const $=Qt(Pt[0]);e.texStorage2D(i.TEXTURE_2D,st,ut,$.width,$.height)}for(let $=0,ct=Pt.length;$<ct;$++)ht=Pt[$],It?I&&e.texSubImage2D(i.TEXTURE_2D,$,0,0,lt,Tt,ht):e.texImage2D(i.TEXTURE_2D,$,ut,lt,Tt,ht);g.generateMipmaps=!1}else if(It){if(Ft){const $=Qt(K);e.texStorage2D(i.TEXTURE_2D,st,ut,$.width,$.height)}I&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,lt,Tt,K)}else e.texImage2D(i.TEXTURE_2D,0,ut,lt,Tt,K);p(g)&&b(z),ot.__version=it.version,g.onUpdate&&g.onUpdate(g)}T.__version=g.version}function Ut(T,g,F){if(g.image.length!==6)return;const z=Z(T,g),W=g.source;e.bindTexture(i.TEXTURE_CUBE_MAP,T.__webglTexture,i.TEXTURE0+F);const it=n.get(W);if(W.version!==it.__version||z===!0){e.activeTexture(i.TEXTURE0+F);const ot=Wt.getPrimaries(Wt.workingColorSpace),Y=g.colorSpace===an?null:Wt.getPrimaries(g.colorSpace),K=g.colorSpace===an||ot===Y?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,g.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,g.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);const lt=g.isCompressedTexture||g.image[0].isCompressedTexture,Tt=g.image[0]&&g.image[0].isDataTexture,ut=[];for(let Q=0;Q<6;Q++)!lt&&!Tt?ut[Q]=m(g.image[Q],!0,s.maxCubemapSize):ut[Q]=Tt?g.image[Q].image:g.image[Q],ut[Q]=qe(g,ut[Q]);const ht=ut[0],Pt=a.convert(g.format,g.colorSpace),It=a.convert(g.type),Ft=S(g.internalFormat,Pt,It,g.normalized,g.colorSpace),I=g.isVideoTexture!==!0,st=it.__version===void 0||z===!0,$=W.dataReady;let ct=y(g,ht);$t(i.TEXTURE_CUBE_MAP,g);let _t;if(lt){I&&st&&e.texStorage2D(i.TEXTURE_CUBE_MAP,ct,Ft,ht.width,ht.height);for(let Q=0;Q<6;Q++){_t=ut[Q].mipmaps;for(let bt=0;bt<_t.length;bt++){const St=_t[bt];g.format!==mi?Pt!==null?I?$&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,bt,0,0,St.width,St.height,Pt,St.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,bt,Ft,St.width,St.height,0,St.data):Lt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?$&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,bt,0,0,St.width,St.height,Pt,It,St.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,bt,Ft,St.width,St.height,0,Pt,It,St.data)}}}else{if(_t=g.mipmaps,I&&st){_t.length>0&&ct++;const Q=Qt(ut[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,ct,Ft,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(Tt){I?$&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,ut[Q].width,ut[Q].height,Pt,It,ut[Q].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Ft,ut[Q].width,ut[Q].height,0,Pt,It,ut[Q].data);for(let bt=0;bt<_t.length;bt++){const pe=_t[bt].image[Q].image;I?$&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,bt+1,0,0,pe.width,pe.height,Pt,It,pe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,bt+1,Ft,pe.width,pe.height,0,Pt,It,pe.data)}}else{I?$&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Pt,It,ut[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,Ft,Pt,It,ut[Q]);for(let bt=0;bt<_t.length;bt++){const St=_t[bt];I?$&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,bt+1,0,0,Pt,It,St.image[Q]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Q,bt+1,Ft,Pt,It,St.image[Q])}}}p(g)&&b(i.TEXTURE_CUBE_MAP),it.__version=W.version,g.onUpdate&&g.onUpdate(g)}T.__version=g.version}function Ct(T,g,F,z,W,it){const ot=a.convert(F.format,F.colorSpace),Y=a.convert(F.type),K=S(F.internalFormat,ot,Y,F.normalized,F.colorSpace),lt=n.get(g),Tt=n.get(F);if(Tt.__renderTarget=g,!lt.__hasExternalTextures){const ut=Math.max(1,g.width>>it),ht=Math.max(1,g.height>>it);W===i.TEXTURE_3D||W===i.TEXTURE_2D_ARRAY?e.texImage3D(W,it,K,ut,ht,g.depth,0,ot,Y,null):e.texImage2D(W,it,K,ut,ht,0,ot,Y,null)}e.bindFramebuffer(i.FRAMEBUFFER,T),Se(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,z,W,Tt.__webglTexture,0,de(g)):(W===i.TEXTURE_2D||W>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&W<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,z,W,Tt.__webglTexture,it),e.bindFramebuffer(i.FRAMEBUFFER,null)}function _e(T,g,F){if(i.bindRenderbuffer(i.RENDERBUFFER,T),g.depthBuffer){const z=g.depthTexture,W=z&&z.isDepthTexture?z.type:null,it=w(g.stencilBuffer,W),ot=g.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Se(g)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,de(g),it,g.width,g.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,de(g),it,g.width,g.height):i.renderbufferStorage(i.RENDERBUFFER,it,g.width,g.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ot,i.RENDERBUFFER,T)}else{const z=g.textures;for(let W=0;W<z.length;W++){const it=z[W],ot=a.convert(it.format,it.colorSpace),Y=a.convert(it.type),K=S(it.internalFormat,ot,Y,it.normalized,it.colorSpace);Se(g)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,de(g),K,g.width,g.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,de(g),K,g.width,g.height):i.renderbufferStorage(i.RENDERBUFFER,K,g.width,g.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ht(T,g,F){const z=g.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,T),!(g.depthTexture&&g.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const W=n.get(g.depthTexture);if(W.__renderTarget=g,(!W.__webglTexture||g.depthTexture.image.width!==g.width||g.depthTexture.image.height!==g.height)&&(g.depthTexture.image.width=g.width,g.depthTexture.image.height=g.height,g.depthTexture.needsUpdate=!0),z){if(W.__webglInit===void 0&&(W.__webglInit=!0,g.depthTexture.addEventListener("dispose",P)),W.__webglTexture===void 0){W.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture),$t(i.TEXTURE_CUBE_MAP,g.depthTexture);const lt=a.convert(g.depthTexture.format),Tt=a.convert(g.depthTexture.type);let ut;g.depthTexture.format===qi?ut=i.DEPTH_COMPONENT24:g.depthTexture.format===Pn&&(ut=i.DEPTH24_STENCIL8);for(let ht=0;ht<6;ht++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0,ut,g.width,g.height,0,lt,Tt,null)}}else J(g.depthTexture,0);const it=W.__webglTexture,ot=de(g),Y=z?i.TEXTURE_CUBE_MAP_POSITIVE_X+F:i.TEXTURE_2D,K=g.depthTexture.format===Pn?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(g.depthTexture.format===qi)Se(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,Y,it,0,ot):i.framebufferTexture2D(i.FRAMEBUFFER,K,Y,it,0);else if(g.depthTexture.format===Pn)Se(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,Y,it,0,ot):i.framebufferTexture2D(i.FRAMEBUFFER,K,Y,it,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ne(T){const g=n.get(T),F=T.isWebGLCubeRenderTarget===!0;if(g.__boundDepthTexture!==T.depthTexture){const z=T.depthTexture;if(g.__depthDisposeCallback&&g.__depthDisposeCallback(),z){const W=()=>{delete g.__boundDepthTexture,delete g.__depthDisposeCallback,z.removeEventListener("dispose",W)};z.addEventListener("dispose",W),g.__depthDisposeCallback=W}g.__boundDepthTexture=z}if(T.depthTexture&&!g.__autoAllocateDepthBuffer)if(F)for(let z=0;z<6;z++)Ht(g.__webglFramebuffer[z],T,z);else{const z=T.texture.mipmaps;z&&z.length>0?Ht(g.__webglFramebuffer[0],T,0):Ht(g.__webglFramebuffer,T,0)}else if(F){g.__webglDepthbuffer=[];for(let z=0;z<6;z++)if(e.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer[z]),g.__webglDepthbuffer[z]===void 0)g.__webglDepthbuffer[z]=i.createRenderbuffer(),_e(g.__webglDepthbuffer[z],T,!1);else{const W=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,it=g.__webglDepthbuffer[z];i.bindRenderbuffer(i.RENDERBUFFER,it),i.framebufferRenderbuffer(i.FRAMEBUFFER,W,i.RENDERBUFFER,it)}}else{const z=T.texture.mipmaps;if(z&&z.length>0?e.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer),g.__webglDepthbuffer===void 0)g.__webglDepthbuffer=i.createRenderbuffer(),_e(g.__webglDepthbuffer,T,!1);else{const W=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,it=g.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,it),i.framebufferRenderbuffer(i.FRAMEBUFFER,W,i.RENDERBUFFER,it)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Kt(T,g,F){const z=n.get(T);g!==void 0&&Ct(z.__webglFramebuffer,T,T.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&ne(T)}function Xt(T){const g=T.texture,F=n.get(T),z=n.get(g);T.addEventListener("dispose",v);const W=T.textures,it=T.isWebGLCubeRenderTarget===!0,ot=W.length>1;if(ot||(z.__webglTexture===void 0&&(z.__webglTexture=i.createTexture()),z.__version=g.version,r.memory.textures++),it){F.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(g.mipmaps&&g.mipmaps.length>0){F.__webglFramebuffer[Y]=[];for(let K=0;K<g.mipmaps.length;K++)F.__webglFramebuffer[Y][K]=i.createFramebuffer()}else F.__webglFramebuffer[Y]=i.createFramebuffer()}else{if(g.mipmaps&&g.mipmaps.length>0){F.__webglFramebuffer=[];for(let Y=0;Y<g.mipmaps.length;Y++)F.__webglFramebuffer[Y]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(ot)for(let Y=0,K=W.length;Y<K;Y++){const lt=n.get(W[Y]);lt.__webglTexture===void 0&&(lt.__webglTexture=i.createTexture(),r.memory.textures++)}if(T.samples>0&&Se(T)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let Y=0;Y<W.length;Y++){const K=W[Y];F.__webglColorRenderbuffer[Y]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[Y]);const lt=a.convert(K.format,K.colorSpace),Tt=a.convert(K.type),ut=S(K.internalFormat,lt,Tt,K.normalized,K.colorSpace,T.isXRRenderTarget===!0),ht=de(T);i.renderbufferStorageMultisample(i.RENDERBUFFER,ht,ut,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Y,i.RENDERBUFFER,F.__webglColorRenderbuffer[Y])}i.bindRenderbuffer(i.RENDERBUFFER,null),T.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),_e(F.__webglDepthRenderbuffer,T,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(it){e.bindTexture(i.TEXTURE_CUBE_MAP,z.__webglTexture),$t(i.TEXTURE_CUBE_MAP,g);for(let Y=0;Y<6;Y++)if(g.mipmaps&&g.mipmaps.length>0)for(let K=0;K<g.mipmaps.length;K++)Ct(F.__webglFramebuffer[Y][K],T,g,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,K);else Ct(F.__webglFramebuffer[Y],T,g,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);p(g)&&b(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ot){for(let Y=0,K=W.length;Y<K;Y++){const lt=W[Y],Tt=n.get(lt);let ut=i.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ut=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ut,Tt.__webglTexture),$t(ut,lt),Ct(F.__webglFramebuffer,T,lt,i.COLOR_ATTACHMENT0+Y,ut,0),p(lt)&&b(ut)}e.unbindTexture()}else{let Y=i.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(Y=T.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Y,z.__webglTexture),$t(Y,g),g.mipmaps&&g.mipmaps.length>0)for(let K=0;K<g.mipmaps.length;K++)Ct(F.__webglFramebuffer[K],T,g,i.COLOR_ATTACHMENT0,Y,K);else Ct(F.__webglFramebuffer,T,g,i.COLOR_ATTACHMENT0,Y,0);p(g)&&b(Y),e.unbindTexture()}T.depthBuffer&&ne(T)}function xe(T){const g=T.textures;for(let F=0,z=g.length;F<z;F++){const W=g[F];if(p(W)){const it=A(T),ot=n.get(W).__webglTexture;e.bindTexture(it,ot),b(it),e.unbindTexture()}}}const be=[],Re=[];function Ie(T){if(T.samples>0){if(Se(T)===!1){const g=T.textures,F=T.width,z=T.height;let W=i.COLOR_BUFFER_BIT;const it=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ot=n.get(T),Y=g.length>1;if(Y)for(let lt=0;lt<g.length;lt++)e.bindFramebuffer(i.FRAMEBUFFER,ot.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,ot.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,ot.__webglMultisampledFramebuffer);const K=T.texture.mipmaps;K&&K.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ot.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ot.__webglFramebuffer);for(let lt=0;lt<g.length;lt++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(W|=i.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(W|=i.STENCIL_BUFFER_BIT)),Y){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ot.__webglColorRenderbuffer[lt]);const Tt=n.get(g[lt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Tt,0)}i.blitFramebuffer(0,0,F,z,0,0,F,z,W,i.NEAREST),l===!0&&(be.length=0,Re.length=0,be.push(i.COLOR_ATTACHMENT0+lt),T.depthBuffer&&T.resolveDepthBuffer===!1&&(be.push(it),Re.push(it),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Re)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,be))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),Y)for(let lt=0;lt<g.length;lt++){e.bindFramebuffer(i.FRAMEBUFFER,ot.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.RENDERBUFFER,ot.__webglColorRenderbuffer[lt]);const Tt=n.get(g[lt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,ot.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.TEXTURE_2D,Tt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ot.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&l){const g=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[g])}}}function de(T){return Math.min(s.maxSamples,T.samples)}function Se(T){const g=n.get(T);return T.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&g.__useRenderToTexture!==!1}function L(T){const g=r.render.frame;f.get(T)!==g&&(f.set(T,g),T.update())}function qe(T,g){const F=T.colorSpace,z=T.format,W=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||F!==ja&&F!==an&&(Wt.getTransfer(F)===jt?(z!==mi||W!==ni)&&Lt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Vt("WebGLTextures: Unsupported texture color space:",F)),g}function Qt(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(h.width=T.naturalWidth||T.width,h.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(h.width=T.displayWidth,h.height=T.displayHeight):(h.width=T.width,h.height=T.height),h}this.allocateTextureUnit=X,this.resetTextureUnits=H,this.getTextureUnits=q,this.setTextureUnits=B,this.setTexture2D=J,this.setTexture2DArray=tt,this.setTexture3D=dt,this.setTextureCube=gt,this.rebindTextures=Kt,this.setupRenderTarget=Xt,this.updateRenderTargetMipmap=xe,this.updateMultisampleRenderTarget=Ie,this.setupDepthRenderbuffer=ne,this.setupFrameBufferTexture=Ct,this.useMultisampledRTT=Se,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Wg(i,t){function e(n,s=an){let a;const r=Wt.getTransfer(s);if(n===ni)return i.UNSIGNED_BYTE;if(n===Sl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===yl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===nu)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===su)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===eu)return i.BYTE;if(n===iu)return i.SHORT;if(n===Ws)return i.UNSIGNED_SHORT;if(n===xl)return i.INT;if(n===Ii)return i.UNSIGNED_INT;if(n===wi)return i.FLOAT;if(n===Xi)return i.HALF_FLOAT;if(n===au)return i.ALPHA;if(n===ru)return i.RGB;if(n===mi)return i.RGBA;if(n===qi)return i.DEPTH_COMPONENT;if(n===Pn)return i.DEPTH_STENCIL;if(n===ou)return i.RED;if(n===El)return i.RED_INTEGER;if(n===Cn)return i.RG;if(n===bl)return i.RG_INTEGER;if(n===Tl)return i.RGBA_INTEGER;if(n===Ba||n===za||n===ka||n===Ha)if(r===jt)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(n===Ba)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===za)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===ka)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ha)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(n===Ba)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===za)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===ka)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ha)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===wo||n===Ao||n===Po||n===Ro)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(n===wo)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ao)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Po)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ro)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Co||n===Io||n===Lo||n===No||n===Do||n===Ja||n===Uo)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(n===Co||n===Io)return r===jt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(n===Lo)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(n===No)return a.COMPRESSED_R11_EAC;if(n===Do)return a.COMPRESSED_SIGNED_R11_EAC;if(n===Ja)return a.COMPRESSED_RG11_EAC;if(n===Uo)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Fo||n===Oo||n===Go||n===Bo||n===zo||n===ko||n===Ho||n===Vo||n===Wo||n===Xo||n===qo||n===Yo||n===$o||n===Ko)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(n===Fo)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Oo)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Go)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Bo)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===zo)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ko)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ho)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Vo)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Wo)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Xo)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===qo)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Yo)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===$o)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ko)return r===jt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Zo||n===Jo||n===Qo)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(n===Zo)return r===jt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Jo)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Qo)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===jo||n===tl||n===Qa||n===el)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(n===jo)return a.COMPRESSED_RED_RGTC1_EXT;if(n===tl)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Qa)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===el)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Xs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}const Xg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,qg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Yg{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){const n=new gu(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Li({vertexShader:Xg,fragmentShader:qg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ui(new xr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class $g extends _n{constructor(t,e){super();const n=this;let s=null,a=1,r=null,o="local-floor",l=1,h=null,f=null,u=null,c=null,d=null,_=null;const M=typeof XRWebGLBinding<"u",m=new Yg,p={},b=e.getContextAttributes();let A=null,S=null;const w=[],y=[],P=new Rt;let v=null;const E=new li;E.viewport=new ue;const C=new li;C.viewport=new ue;const R=[E,C],D=new ip;let H=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let rt=w[Z];return rt===void 0&&(rt=new Or,w[Z]=rt),rt.getTargetRaySpace()},this.getControllerGrip=function(Z){let rt=w[Z];return rt===void 0&&(rt=new Or,w[Z]=rt),rt.getGripSpace()},this.getHand=function(Z){let rt=w[Z];return rt===void 0&&(rt=new Or,w[Z]=rt),rt.getHandSpace()};function B(Z){const rt=y.indexOf(Z.inputSource);if(rt===-1)return;const et=w[rt];et!==void 0&&(et.update(Z.inputSource,Z.frame,h||r),et.dispatchEvent({type:Z.type,data:Z.inputSource}))}function X(){s.removeEventListener("select",B),s.removeEventListener("selectstart",B),s.removeEventListener("selectend",B),s.removeEventListener("squeeze",B),s.removeEventListener("squeezestart",B),s.removeEventListener("squeezeend",B),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",V);for(let Z=0;Z<w.length;Z++){const rt=y[Z];rt!==null&&(y[Z]=null,w[Z].disconnect(rt))}H=null,q=null,m.reset();for(const Z in p)delete p[Z];t.setRenderTarget(A),d=null,c=null,u=null,s=null,S=null,$t.stop(),n.isPresenting=!1,t.setPixelRatio(v),t.setSize(P.width,P.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){a=Z,n.isPresenting===!0&&Lt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,n.isPresenting===!0&&Lt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||r},this.setReferenceSpace=function(Z){h=Z},this.getBaseLayer=function(){return c!==null?c:d},this.getBinding=function(){return u===null&&M&&(u=new XRWebGLBinding(s,e)),u},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(A=t.getRenderTarget(),s.addEventListener("select",B),s.addEventListener("selectstart",B),s.addEventListener("selectend",B),s.addEventListener("squeeze",B),s.addEventListener("squeezestart",B),s.addEventListener("squeezeend",B),s.addEventListener("end",X),s.addEventListener("inputsourceschange",V),b.xrCompatible!==!0&&await e.makeXRCompatible(),v=t.getPixelRatio(),t.getSize(P),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let et=null,Nt=null,Ut=null;b.depth&&(Ut=b.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,et=b.stencil?Pn:qi,Nt=b.stencil?Xs:Ii);const Ct={colorFormat:e.RGBA8,depthFormat:Ut,scaleFactor:a};u=this.getBinding(),c=u.createProjectionLayer(Ct),s.updateRenderState({layers:[c]}),t.setPixelRatio(1),t.setSize(c.textureWidth,c.textureHeight,!1),S=new Ri(c.textureWidth,c.textureHeight,{format:mi,type:ni,depthTexture:new vs(c.textureWidth,c.textureHeight,Nt,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:b.stencil,colorSpace:t.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:c.ignoreDepthValues===!1,resolveStencilBuffer:c.ignoreDepthValues===!1})}else{const et={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:a};d=new XRWebGLLayer(s,e,et),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),S=new Ri(d.framebufferWidth,d.framebufferHeight,{format:mi,type:ni,colorSpace:t.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),h=null,r=await s.requestReferenceSpace(o),$t.setContext(s),$t.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function V(Z){for(let rt=0;rt<Z.removed.length;rt++){const et=Z.removed[rt],Nt=y.indexOf(et);Nt>=0&&(y[Nt]=null,w[Nt].disconnect(et))}for(let rt=0;rt<Z.added.length;rt++){const et=Z.added[rt];let Nt=y.indexOf(et);if(Nt===-1){for(let Ct=0;Ct<w.length;Ct++)if(Ct>=y.length){y.push(et),Nt=Ct;break}else if(y[Ct]===null){y[Ct]=et,Nt=Ct;break}if(Nt===-1)break}const Ut=w[Nt];Ut&&Ut.connect(et)}}const J=new U,tt=new U;function dt(Z,rt,et){J.setFromMatrixPosition(rt.matrixWorld),tt.setFromMatrixPosition(et.matrixWorld);const Nt=J.distanceTo(tt),Ut=rt.projectionMatrix.elements,Ct=et.projectionMatrix.elements,_e=Ut[14]/(Ut[10]-1),Ht=Ut[14]/(Ut[10]+1),ne=(Ut[9]+1)/Ut[5],Kt=(Ut[9]-1)/Ut[5],Xt=(Ut[8]-1)/Ut[0],xe=(Ct[8]+1)/Ct[0],be=_e*Xt,Re=_e*xe,Ie=Nt/(-Xt+xe),de=Ie*-Xt;if(rt.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(de),Z.translateZ(Ie),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),Ut[10]===-1)Z.projectionMatrix.copy(rt.projectionMatrix),Z.projectionMatrixInverse.copy(rt.projectionMatrixInverse);else{const Se=_e+Ie,L=Ht+Ie,qe=be-de,Qt=Re+(Nt-de),T=ne*Ht/L*Se,g=Kt*Ht/L*Se;Z.projectionMatrix.makePerspective(qe,Qt,T,g,Se,L),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function gt(Z,rt){rt===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(rt.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let rt=Z.near,et=Z.far;m.texture!==null&&(m.depthNear>0&&(rt=m.depthNear),m.depthFar>0&&(et=m.depthFar)),D.near=C.near=E.near=rt,D.far=C.far=E.far=et,(H!==D.near||q!==D.far)&&(s.updateRenderState({depthNear:D.near,depthFar:D.far}),H=D.near,q=D.far),D.layers.mask=Z.layers.mask|6,E.layers.mask=D.layers.mask&-5,C.layers.mask=D.layers.mask&-3;const Nt=Z.parent,Ut=D.cameras;gt(D,Nt);for(let Ct=0;Ct<Ut.length;Ct++)gt(Ut[Ct],Nt);Ut.length===2?dt(D,E,C):D.projectionMatrix.copy(E.projectionMatrix),xt(Z,D,Nt)};function xt(Z,rt,et){et===null?Z.matrix.copy(rt.matrixWorld):(Z.matrix.copy(et.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(rt.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(rt.projectionMatrix),Z.projectionMatrixInverse.copy(rt.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=sl*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(!(c===null&&d===null))return l},this.setFoveation=function(Z){l=Z,c!==null&&(c.fixedFoveation=Z),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(D)},this.getCameraTexture=function(Z){return p[Z]};let Yt=null;function fe(Z,rt){if(f=rt.getViewerPose(h||r),_=rt,f!==null){const et=f.views;d!==null&&(t.setRenderTargetFramebuffer(S,d.framebuffer),t.setRenderTarget(S));let Nt=!1;et.length!==D.cameras.length&&(D.cameras.length=0,Nt=!0);for(let Ht=0;Ht<et.length;Ht++){const ne=et[Ht];let Kt=null;if(d!==null)Kt=d.getViewport(ne);else{const xe=u.getViewSubImage(c,ne);Kt=xe.viewport,Ht===0&&(t.setRenderTargetTextures(S,xe.colorTexture,xe.depthStencilTexture),t.setRenderTarget(S))}let Xt=R[Ht];Xt===void 0&&(Xt=new li,Xt.layers.enable(Ht),Xt.viewport=new ue,R[Ht]=Xt),Xt.matrix.fromArray(ne.transform.matrix),Xt.matrix.decompose(Xt.position,Xt.quaternion,Xt.scale),Xt.projectionMatrix.fromArray(ne.projectionMatrix),Xt.projectionMatrixInverse.copy(Xt.projectionMatrix).invert(),Xt.viewport.set(Kt.x,Kt.y,Kt.width,Kt.height),Ht===0&&(D.matrix.copy(Xt.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),Nt===!0&&D.cameras.push(Xt)}const Ut=s.enabledFeatures;if(Ut&&Ut.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&M){u=n.getBinding();const Ht=u.getDepthInformation(et[0]);Ht&&Ht.isValid&&Ht.texture&&m.init(Ht,s.renderState)}if(Ut&&Ut.includes("camera-access")&&M){t.state.unbindTexture(),u=n.getBinding();for(let Ht=0;Ht<et.length;Ht++){const ne=et[Ht].camera;if(ne){let Kt=p[ne];Kt||(Kt=new gu,p[ne]=Kt);const Xt=u.getCameraImage(ne);Kt.sourceTexture=Xt}}}}for(let et=0;et<w.length;et++){const Nt=y[et],Ut=w[et];Nt!==null&&Ut!==void 0&&Ut.update(Nt,rt,h||r)}Yt&&Yt(Z,rt),rt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:rt}),_=null}const $t=new Su;$t.setAnimationLoop(fe),this.setAnimationLoop=function(Z){Yt=Z},this.dispose=function(){}}}const Kg=new le,Pu=new Dt;Pu.set(-1,0,0,0,1,0,0,0,1);function Zg(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,vu(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,b,A,S){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?a(m,p):p.isMeshLambertMaterial?(a(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(a(m,p),u(m,p)):p.isMeshPhongMaterial?(a(m,p),f(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(a(m,p),c(m,p),p.isMeshPhysicalMaterial&&d(m,p,S)):p.isMeshMatcapMaterial?(a(m,p),_(m,p)):p.isMeshDepthMaterial?a(m,p):p.isMeshDistanceMaterial?(a(m,p),M(m,p)):p.isMeshNormalMaterial?a(m,p):p.isLineBasicMaterial?(r(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,b,A):p.isSpriteMaterial?h(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function a(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Je&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Je&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const b=t.get(p),A=b.envMap,S=b.envMapRotation;A&&(m.envMap.value=A,m.envMapRotation.value.setFromMatrix4(Kg.makeRotationFromEuler(S)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Pu),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function r(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,b,A){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*b,m.scale.value=A*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function f(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function c(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,b){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Je&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,p){p.matcap&&(m.matcap.value=p.matcap)}function M(m,p){const b=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Jg(i,t,e,n){let s={},a={},r=[];const o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(S,w){const y=w.program;n.uniformBlockBinding(S,y)}function h(S,w){let y=s[S.id];y===void 0&&(m(S),y=f(S),s[S.id]=y,S.addEventListener("dispose",b));const P=w.program;n.updateUBOMapping(S,P);const v=t.render.frame;a[S.id]!==v&&(c(S),a[S.id]=v)}function f(S){const w=u();S.__bindingPointIndex=w;const y=i.createBuffer(),P=S.__size,v=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,P,v),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,w,y),y}function u(){for(let S=0;S<o;S++)if(r.indexOf(S)===-1)return r.push(S),S;return Vt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function c(S){const w=s[S.id],y=S.uniforms,P=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,w);for(let v=0,E=y.length;v<E;v++){const C=y[v];if(Array.isArray(C))for(let R=0,D=C.length;R<D;R++)d(C[R],v,R,P);else d(C,v,0,P)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(S,w,y,P){if(M(S,w,y,P)===!0){const v=S.__offset,E=S.value;if(Array.isArray(E)){let C=0;for(let R=0;R<E.length;R++){const D=E[R],H=p(D);_(D,S.__data,C),typeof D!="number"&&typeof D!="boolean"&&!D.isMatrix3&&!ArrayBuffer.isView(D)&&(C+=H.storage/Float32Array.BYTES_PER_ELEMENT)}}else _(E,S.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,v,S.__data)}}function _(S,w,y){typeof S=="number"||typeof S=="boolean"?w[0]=S:S.isMatrix3?(w[0]=S.elements[0],w[1]=S.elements[1],w[2]=S.elements[2],w[3]=0,w[4]=S.elements[3],w[5]=S.elements[4],w[6]=S.elements[5],w[7]=0,w[8]=S.elements[6],w[9]=S.elements[7],w[10]=S.elements[8],w[11]=0):ArrayBuffer.isView(S)?w.set(new S.constructor(S.buffer,S.byteOffset,w.length)):S.toArray(w,y)}function M(S,w,y,P){const v=S.value,E=w+"_"+y;if(P[E]===void 0)return typeof v=="number"||typeof v=="boolean"?P[E]=v:ArrayBuffer.isView(v)?P[E]=v.slice():P[E]=v.clone(),!0;{const C=P[E];if(typeof v=="number"||typeof v=="boolean"){if(C!==v)return P[E]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(C.equals(v)===!1)return C.copy(v),!0}}return!1}function m(S){const w=S.uniforms;let y=0;const P=16;for(let E=0,C=w.length;E<C;E++){const R=Array.isArray(w[E])?w[E]:[w[E]];for(let D=0,H=R.length;D<H;D++){const q=R[D],B=Array.isArray(q.value)?q.value:[q.value];for(let X=0,V=B.length;X<V;X++){const J=B[X],tt=p(J),dt=y%P,gt=dt%tt.boundary,xt=dt+gt;y+=gt,xt!==0&&P-xt<tt.storage&&(y+=P-xt),q.__data=new Float32Array(tt.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=y,y+=tt.storage}}}const v=y%P;return v>0&&(y+=P-v),S.__size=y,S.__cache={},this}function p(S){const w={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(w.boundary=4,w.storage=4):S.isVector2?(w.boundary=8,w.storage=8):S.isVector3||S.isColor?(w.boundary=16,w.storage=12):S.isVector4?(w.boundary=16,w.storage=16):S.isMatrix3?(w.boundary=48,w.storage=48):S.isMatrix4?(w.boundary=64,w.storage=64):S.isTexture?Lt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(w.boundary=16,w.storage=S.byteLength):Lt("WebGLRenderer: Unsupported uniform value type.",S),w}function b(S){const w=S.target;w.removeEventListener("dispose",b);const y=r.indexOf(w.__bindingPointIndex);r.splice(y,1),i.deleteBuffer(s[w.id]),delete s[w.id],delete a[w.id]}function A(){for(const S in s)i.deleteBuffer(s[S]);r=[],s={},a={}}return{bind:l,update:h,dispose:A}}const Qg=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let yi=null;function jg(){return yi===null&&(yi=new Fd(Qg,16,16,Cn,Xi),yi.name="DFG_LUT",yi.minFilter=Ge,yi.magFilter=Ge,yi.wrapS=Bi,yi.wrapT=Bi,yi.generateMipmaps=!1,yi.needsUpdate=!0),yi}class tv{constructor(t={}){const{canvas:e=cd(),context:n=null,depth:s=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:h=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:c=!1,outputBufferType:d=ni}=t;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=n.getContextAttributes().alpha}else _=r;const M=d,m=new Set([Tl,bl,El]),p=new Set([ni,Ii,Ws,Xs,Sl,yl]),b=new Uint32Array(4),A=new Int32Array(4),S=new U;let w=null,y=null;const P=[],v=[];let E=null;this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Pi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const C=this;let R=!1,D=null,H=null,q=null,B=null;this._outputColorSpace=ii;let X=0,V=0,J=null,tt=-1,dt=null;const gt=new ue,xt=new ue;let Yt=null;const fe=new Et(0);let $t=0,Z=e.width,rt=e.height,et=1,Nt=null,Ut=null;const Ct=new ue(0,0,Z,rt),_e=new ue(0,0,Z,rt);let Ht=!1;const ne=new Il;let Kt=!1,Xt=!1;const xe=new le,be=new U,Re=new ue,Ie={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let de=!1;function Se(){return J===null?et:1}let L=n;function qe(x,N){return e.getContext(x,N)}try{const x={alpha:!0,depth:s,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:h,powerPreference:f,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Ml}`),e.addEventListener("webglcontextlost",pe,!1),e.addEventListener("webglcontextrestored",re,!1),e.addEventListener("webglcontextcreationerror",vi,!1),L===null){const N="webgl2";if(L=qe(N,x),L===null)throw qe(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(x){throw Vt("WebGLRenderer: "+x.message),x}let Qt,T,g,F,z,W,it,ot,Y,K,lt,Tt,ut,ht,Pt,It,Ft,I,st,$,ct,_t,Q;function bt(){Qt=new jm(L),Qt.init(),ct=new Wg(L,Qt),T=new Xm(L,Qt,t,ct),g=new Hg(L,Qt),T.reversedDepthBuffer&&c&&g.buffers.depth.setReversed(!0),H=L.createFramebuffer(),q=L.createFramebuffer(),B=L.createFramebuffer(),F=new i_(L),z=new Pg,W=new Vg(L,Qt,g,z,T,ct,F),it=new Qm(C),ot=new rp(L),_t=new Vm(L,ot),Y=new t_(L,ot,F,_t),K=new s_(L,Y,ot,_t,F),I=new n_(L,T,W),Pt=new qm(z),lt=new Ag(C,it,Qt,T,_t,Pt),Tt=new Zg(C,z),ut=new Cg,ht=new Fg(Qt),Ft=new Hm(C,it,g,K,_,l),It=new kg(C,K,T),Q=new Jg(L,F,T,g),st=new Wm(L,Qt,F),$=new e_(L,Qt,F),F.programs=lt.programs,C.capabilities=T,C.extensions=Qt,C.properties=z,C.renderLists=ut,C.shadowMap=It,C.state=g,C.info=F}bt(),M!==ni&&(E=new r_(M,e.width,e.height,o,s,a));const St=new $g(C,L);this.xr=St,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const x=Qt.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){const x=Qt.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return et},this.setPixelRatio=function(x){x!==void 0&&(et=x,this.setSize(Z,rt,!1))},this.getSize=function(x){return x.set(Z,rt)},this.setSize=function(x,N,k=!0){if(St.isPresenting){Lt("WebGLRenderer: Can't change size while VR device is presenting.");return}Z=x,rt=N,e.width=Math.floor(x*et),e.height=Math.floor(N*et),k===!0&&(e.style.width=x+"px",e.style.height=N+"px"),E!==null&&E.setSize(e.width,e.height),this.setViewport(0,0,x,N)},this.getDrawingBufferSize=function(x){return x.set(Z*et,rt*et).floor()},this.setDrawingBufferSize=function(x,N,k){Z=x,rt=N,et=k,e.width=Math.floor(x*k),e.height=Math.floor(N*k),this.setViewport(0,0,x,N)},this.setEffects=function(x){if(M===ni){Vt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(x){for(let N=0;N<x.length;N++)if(x[N].isOutputPass===!0){Lt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(x||[])},this.getCurrentViewport=function(x){return x.copy(gt)},this.getViewport=function(x){return x.copy(Ct)},this.setViewport=function(x,N,k,O){x.isVector4?Ct.set(x.x,x.y,x.z,x.w):Ct.set(x,N,k,O),g.viewport(gt.copy(Ct).multiplyScalar(et).round())},this.getScissor=function(x){return x.copy(_e)},this.setScissor=function(x,N,k,O){x.isVector4?_e.set(x.x,x.y,x.z,x.w):_e.set(x,N,k,O),g.scissor(xt.copy(_e).multiplyScalar(et).round())},this.getScissorTest=function(){return Ht},this.setScissorTest=function(x){g.setScissorTest(Ht=x)},this.setOpaqueSort=function(x){Nt=x},this.setTransparentSort=function(x){Ut=x},this.getClearColor=function(x){return x.copy(Ft.getClearColor())},this.setClearColor=function(){Ft.setClearColor(...arguments)},this.getClearAlpha=function(){return Ft.getClearAlpha()},this.setClearAlpha=function(){Ft.setClearAlpha(...arguments)},this.clear=function(x=!0,N=!0,k=!0){let O=0;if(x){let G=!1;if(J!==null){const mt=J.texture.format;G=m.has(mt)}if(G){const mt=J.texture.type,Mt=p.has(mt),pt=Ft.getClearColor(),yt=Ft.getClearAlpha(),wt=pt.r,Ot=pt.g,zt=pt.b;Mt?(b[0]=wt,b[1]=Ot,b[2]=zt,b[3]=yt,L.clearBufferuiv(L.COLOR,0,b)):(A[0]=wt,A[1]=Ot,A[2]=zt,A[3]=yt,L.clearBufferiv(L.COLOR,0,A))}else O|=L.COLOR_BUFFER_BIT}N&&(O|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),k&&(O|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O!==0&&L.clear(O)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(x){x.setRenderer(this),D=x},this.dispose=function(){e.removeEventListener("webglcontextlost",pe,!1),e.removeEventListener("webglcontextrestored",re,!1),e.removeEventListener("webglcontextcreationerror",vi,!1),Ft.dispose(),ut.dispose(),ht.dispose(),z.dispose(),it.dispose(),K.dispose(),_t.dispose(),Q.dispose(),lt.dispose(),St.dispose(),St.removeEventListener("sessionstart",eh),St.removeEventListener("sessionend",ih),vn.stop()};function pe(x){x.preventDefault(),ir("WebGLRenderer: Context Lost."),R=!0}function re(){ir("WebGLRenderer: Context Restored."),R=!1;const x=F.autoReset,N=It.enabled,k=It.autoUpdate,O=It.needsUpdate,G=It.type;bt(),F.autoReset=x,It.enabled=N,It.autoUpdate=k,It.needsUpdate=O,It.type=G}function vi(x){Vt("WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}function Mi(x){const N=x.target;N.removeEventListener("dispose",Mi),Sf(N)}function Sf(x){yf(x),z.remove(x)}function yf(x){const N=z.get(x).programs;N!==void 0&&(N.forEach(function(k){lt.releaseProgram(k)}),x.isShaderMaterial&&lt.releaseShaderCache(x))}this.renderBufferDirect=function(x,N,k,O,G,mt){N===null&&(N=Ie);const Mt=G.isMesh&&G.matrixWorld.determinantAffine()<0,pt=Tf(x,N,k,O,G);g.setMaterial(O,Mt);let yt=k.index,wt=1;if(O.wireframe===!0){if(yt=Y.getWireframeAttribute(k),yt===void 0)return;wt=2}const Ot=k.drawRange,zt=k.attributes.position;let At=Ot.start*wt,te=(Ot.start+Ot.count)*wt;mt!==null&&(At=Math.max(At,mt.start*wt),te=Math.min(te,(mt.start+mt.count)*wt)),yt!==null?(At=Math.max(At,0),te=Math.min(te,yt.count)):zt!=null&&(At=Math.max(At,0),te=Math.min(te,zt.count));const ge=te-At;if(ge<0||ge===1/0)return;_t.setup(G,O,pt,k,yt);let me,se=st;if(yt!==null&&(me=ot.get(yt),se=$,se.setIndex(me)),G.isMesh)O.wireframe===!0?(g.setLineWidth(O.wireframeLinewidth*Se()),se.setMode(L.LINES)):se.setMode(L.TRIANGLES);else if(G.isLine){let De=O.linewidth;De===void 0&&(De=1),g.setLineWidth(De*Se()),G.isLineSegments?se.setMode(L.LINES):G.isLineLoop?se.setMode(L.LINE_LOOP):se.setMode(L.LINE_STRIP)}else G.isPoints?se.setMode(L.POINTS):G.isSprite&&se.setMode(L.TRIANGLES);if(G.isBatchedMesh)if(Qt.get("WEBGL_multi_draw"))se.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{const De=G._multiDrawStarts,vt=G._multiDrawCounts,je=G._multiDrawCount,qt=yt?ot.get(yt).bytesPerElement:1,si=z.get(O).currentProgram.getUniforms();for(let xi=0;xi<je;xi++)si.setValue(L,"_gl_DrawID",xi),se.render(De[xi]/qt,vt[xi])}else if(G.isInstancedMesh)se.renderInstances(At,ge,G.count);else if(k.isInstancedBufferGeometry){const De=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,vt=Math.min(k.instanceCount,De);se.renderInstances(At,ge,vt)}else se.render(At,ge)};function th(x,N,k){x.transparent===!0&&x.side===bi&&x.forceSinglePass===!1?(x.side=Je,x.needsUpdate=!0,aa(x,N,k),x.side=un,x.needsUpdate=!0,aa(x,N,k),x.side=bi):aa(x,N,k)}this.compile=function(x,N,k=null){k===null&&(k=x),y=ht.get(k),y.init(N),v.push(y),k.traverseVisible(function(G){G.isLight&&G.layers.test(N.layers)&&(y.pushLight(G),G.castShadow&&y.pushShadow(G))}),x!==k&&x.traverseVisible(function(G){G.isLight&&G.layers.test(N.layers)&&(y.pushLight(G),G.castShadow&&y.pushShadow(G))}),y.setupLights();const O=new Set;return x.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;const mt=G.material;if(mt)if(Array.isArray(mt))for(let Mt=0;Mt<mt.length;Mt++){const pt=mt[Mt];th(pt,k,G),O.add(pt)}else th(mt,k,G),O.add(mt)}),y=v.pop(),O},this.compileAsync=function(x,N,k=null){const O=this.compile(x,N,k);return new Promise(G=>{function mt(){if(O.forEach(function(Mt){z.get(Mt).currentProgram.isReady()&&O.delete(Mt)}),O.size===0){G(x);return}setTimeout(mt,10)}Qt.get("KHR_parallel_shader_compile")!==null?mt():setTimeout(mt,10)})};let wr=null;function Ef(x){wr&&wr(x)}function eh(){vn.stop()}function ih(){vn.start()}const vn=new Su;vn.setAnimationLoop(Ef),typeof self<"u"&&vn.setContext(self),this.setAnimationLoop=function(x){wr=x,St.setAnimationLoop(x),x===null?vn.stop():vn.start()},St.addEventListener("sessionstart",eh),St.addEventListener("sessionend",ih),this.render=function(x,N){if(N!==void 0&&N.isCamera!==!0){Vt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;D!==null&&D.renderStart(x,N);const k=St.enabled===!0&&St.isPresenting===!0,O=E!==null&&(J===null||k)&&E.begin(C,J);if(x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),St.enabled===!0&&St.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(St.cameraAutoUpdate===!0&&St.updateCamera(N),N=St.getCamera()),x.isScene===!0&&x.onBeforeRender(C,x,N,J),y=ht.get(x,v.length),y.init(N),y.state.textureUnits=W.getTextureUnits(),v.push(y),xe.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),ne.setFromProjectionMatrix(xe,Ai,N.reversedDepth),Xt=this.localClippingEnabled,Kt=Pt.init(this.clippingPlanes,Xt),w=ut.get(x,P.length),w.init(),P.push(w),St.enabled===!0&&St.isPresenting===!0){const Mt=C.xr.getDepthSensingMesh();Mt!==null&&Ar(Mt,N,-1/0,C.sortObjects)}Ar(x,N,0,C.sortObjects),w.finish(),C.sortObjects===!0&&w.sort(Nt,Ut,N.reversedDepth),de=St.enabled===!1||St.isPresenting===!1||St.hasDepthSensing()===!1,de&&Ft.addToRenderList(w,x),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Kt===!0&&Pt.beginShadows();const G=y.state.shadowsArray;if(It.render(G,x,N),Kt===!0&&Pt.endShadows(),(O&&E.hasRenderPass())===!1){const Mt=w.opaque,pt=w.transmissive;if(y.setupLights(),N.isArrayCamera){const yt=N.cameras;if(pt.length>0)for(let wt=0,Ot=yt.length;wt<Ot;wt++){const zt=yt[wt];sh(Mt,pt,x,zt)}de&&Ft.render(x);for(let wt=0,Ot=yt.length;wt<Ot;wt++){const zt=yt[wt];nh(w,x,zt,zt.viewport)}}else pt.length>0&&sh(Mt,pt,x,N),de&&Ft.render(x),nh(w,x,N)}J!==null&&V===0&&(W.updateMultisampleRenderTarget(J),W.updateRenderTargetMipmap(J)),O&&E.end(C),x.isScene===!0&&x.onAfterRender(C,x,N),_t.resetDefaultState(),tt=-1,dt=null,v.pop(),v.length>0?(y=v[v.length-1],W.setTextureUnits(y.state.textureUnits),Kt===!0&&Pt.setGlobalState(C.clippingPlanes,y.state.camera)):y=null,P.pop(),P.length>0?w=P[P.length-1]:w=null,D!==null&&D.renderEnd()};function Ar(x,N,k,O){if(x.visible===!1)return;if(x.layers.test(N.layers)){if(x.isGroup)k=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(N);else if(x.isLightProbeGrid)y.pushLightProbeGrid(x);else if(x.isLight)y.pushLight(x),x.castShadow&&y.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||ne.intersectsSprite(x)){O&&Re.setFromMatrixPosition(x.matrixWorld).applyMatrix4(xe);const Mt=K.update(x),pt=x.material;pt.visible&&w.push(x,Mt,pt,k,Re.z,null)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||ne.intersectsObject(x))){const Mt=K.update(x),pt=x.material;if(O&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),Re.copy(x.boundingSphere.center)):(Mt.boundingSphere===null&&Mt.computeBoundingSphere(),Re.copy(Mt.boundingSphere.center)),Re.applyMatrix4(x.matrixWorld).applyMatrix4(xe)),Array.isArray(pt)){const yt=Mt.groups;for(let wt=0,Ot=yt.length;wt<Ot;wt++){const zt=yt[wt],At=pt[zt.materialIndex];At&&At.visible&&w.push(x,Mt,At,k,Re.z,zt)}}else pt.visible&&w.push(x,Mt,pt,k,Re.z,null)}}const mt=x.children;for(let Mt=0,pt=mt.length;Mt<pt;Mt++)Ar(mt[Mt],N,k,O)}function nh(x,N,k,O){const{opaque:G,transmissive:mt,transparent:Mt}=x;y.setupLightsView(k),Kt===!0&&Pt.setGlobalState(C.clippingPlanes,k),O&&g.viewport(gt.copy(O)),G.length>0&&sa(G,N,k),mt.length>0&&sa(mt,N,k),Mt.length>0&&sa(Mt,N,k),g.buffers.depth.setTest(!0),g.buffers.depth.setMask(!0),g.buffers.color.setMask(!0),g.setPolygonOffset(!1)}function sh(x,N,k,O){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;if(y.state.transmissionRenderTarget[O.id]===void 0){const At=Qt.has("EXT_color_buffer_half_float")||Qt.has("EXT_color_buffer_float");y.state.transmissionRenderTarget[O.id]=new Ri(1,1,{generateMipmaps:!0,type:At?Xi:ni,minFilter:An,samples:Math.max(4,T.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Wt.workingColorSpace})}const mt=y.state.transmissionRenderTarget[O.id],Mt=O.viewport||gt;mt.setSize(Mt.z*C.transmissionResolutionScale,Mt.w*C.transmissionResolutionScale);const pt=C.getRenderTarget(),yt=C.getActiveCubeFace(),wt=C.getActiveMipmapLevel();C.setRenderTarget(mt),C.getClearColor(fe),$t=C.getClearAlpha(),$t<1&&C.setClearColor(16777215,.5),C.clear(),de&&Ft.render(k);const Ot=C.toneMapping;C.toneMapping=Pi;const zt=O.viewport;if(O.viewport!==void 0&&(O.viewport=void 0),y.setupLightsView(O),Kt===!0&&Pt.setGlobalState(C.clippingPlanes,O),sa(x,k,O),W.updateMultisampleRenderTarget(mt),W.updateRenderTargetMipmap(mt),Qt.has("WEBGL_multisampled_render_to_texture")===!1){let At=!1;for(let te=0,ge=N.length;te<ge;te++){const me=N[te],{object:se,geometry:De,material:vt,group:je}=me;if(vt.side===bi&&se.layers.test(O.layers)){const qt=vt.side;vt.side=Je,vt.needsUpdate=!0,ah(se,k,O,De,vt,je),vt.side=qt,vt.needsUpdate=!0,At=!0}}At===!0&&(W.updateMultisampleRenderTarget(mt),W.updateRenderTargetMipmap(mt))}C.setRenderTarget(pt,yt,wt),C.setClearColor(fe,$t),zt!==void 0&&(O.viewport=zt),C.toneMapping=Ot}function sa(x,N,k){const O=N.isScene===!0?N.overrideMaterial:null;for(let G=0,mt=x.length;G<mt;G++){const Mt=x[G],{object:pt,geometry:yt,group:wt}=Mt;let Ot=Mt.material;Ot.allowOverride===!0&&O!==null&&(Ot=O),pt.layers.test(k.layers)&&ah(pt,N,k,yt,Ot,wt)}}function ah(x,N,k,O,G,mt){x.onBeforeRender(C,N,k,O,G,mt),x.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),G.onBeforeRender(C,N,k,O,x,mt),G.transparent===!0&&G.side===bi&&G.forceSinglePass===!1?(G.side=Je,G.needsUpdate=!0,C.renderBufferDirect(k,N,O,G,x,mt),G.side=un,G.needsUpdate=!0,C.renderBufferDirect(k,N,O,G,x,mt),G.side=bi):C.renderBufferDirect(k,N,O,G,x,mt),x.onAfterRender(C,N,k,O,G,mt)}function aa(x,N,k){N.isScene!==!0&&(N=Ie);const O=z.get(x),G=y.state.lights,mt=y.state.shadowsArray,Mt=G.state.version,pt=lt.getParameters(x,G.state,mt,N,k,y.state.lightProbeGridArray),yt=lt.getProgramCacheKey(pt);let wt=O.programs;O.environment=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?N.environment:null,O.fog=N.fog;const Ot=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap;O.envMap=it.get(x.envMap||O.environment,Ot),O.envMapRotation=O.environment!==null&&x.envMap===null?N.environmentRotation:x.envMapRotation,wt===void 0&&(x.addEventListener("dispose",Mi),wt=new Map,O.programs=wt);let zt=wt.get(yt);if(zt!==void 0){if(O.currentProgram===zt&&O.lightsStateVersion===Mt)return oh(x,pt),zt}else pt.uniforms=lt.getUniforms(x),D!==null&&x.isNodeMaterial&&D.build(x,k,pt),x.onBeforeCompile(pt,C),zt=lt.acquireProgram(pt,yt),wt.set(yt,zt),O.uniforms=pt.uniforms;const At=O.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(At.clippingPlanes=Pt.uniform),oh(x,pt),O.needsLights=Af(x),O.lightsStateVersion=Mt,O.needsLights&&(At.ambientLightColor.value=G.state.ambient,At.lightProbe.value=G.state.probe,At.directionalLights.value=G.state.directional,At.directionalLightShadows.value=G.state.directionalShadow,At.spotLights.value=G.state.spot,At.spotLightShadows.value=G.state.spotShadow,At.rectAreaLights.value=G.state.rectArea,At.ltc_1.value=G.state.rectAreaLTC1,At.ltc_2.value=G.state.rectAreaLTC2,At.pointLights.value=G.state.point,At.pointLightShadows.value=G.state.pointShadow,At.hemisphereLights.value=G.state.hemi,At.directionalShadowMatrix.value=G.state.directionalShadowMatrix,At.spotLightMatrix.value=G.state.spotLightMatrix,At.spotLightMap.value=G.state.spotLightMap,At.pointShadowMatrix.value=G.state.pointShadowMatrix),O.lightProbeGrid=y.state.lightProbeGridArray.length>0,O.currentProgram=zt,O.uniformsList=null,zt}function rh(x){if(x.uniformsList===null){const N=x.currentProgram.getUniforms();x.uniformsList=Wa.seqWithValue(N.seq,x.uniforms)}return x.uniformsList}function oh(x,N){const k=z.get(x);k.outputColorSpace=N.outputColorSpace,k.batching=N.batching,k.batchingColor=N.batchingColor,k.instancing=N.instancing,k.instancingColor=N.instancingColor,k.instancingMorph=N.instancingMorph,k.skinning=N.skinning,k.morphTargets=N.morphTargets,k.morphNormals=N.morphNormals,k.morphColors=N.morphColors,k.morphTargetsCount=N.morphTargetsCount,k.numClippingPlanes=N.numClippingPlanes,k.numIntersection=N.numClipIntersection,k.vertexAlphas=N.vertexAlphas,k.vertexTangents=N.vertexTangents,k.toneMapping=N.toneMapping}function bf(x,N){if(x.length===0)return null;if(x.length===1)return x[0].texture!==null?x[0]:null;S.setFromMatrixPosition(N.matrixWorld);for(let k=0,O=x.length;k<O;k++){const G=x[k];if(G.texture!==null&&G.boundingBox.containsPoint(S))return G}return null}function Tf(x,N,k,O,G){N.isScene!==!0&&(N=Ie),W.resetTextureUnits();const mt=N.fog,Mt=O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial?N.environment:null,pt=J===null?C.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:Wt.workingColorSpace,yt=O.isMeshStandardMaterial||O.isMeshLambertMaterial&&!O.envMap||O.isMeshPhongMaterial&&!O.envMap,wt=it.get(O.envMap||Mt,yt),Ot=O.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,zt=!!k.attributes.tangent&&(!!O.normalMap||O.anisotropy>0),At=!!k.morphAttributes.position,te=!!k.morphAttributes.normal,ge=!!k.morphAttributes.color;let me=Pi;O.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(me=C.toneMapping);const se=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,De=se!==void 0?se.length:0,vt=z.get(O),je=y.state.lights;if(Kt===!0&&(Xt===!0||x!==dt)){const oe=x===dt&&O.id===tt;Pt.setState(O,x,oe)}let qt=!1;O.version===vt.__version?(vt.needsLights&&vt.lightsStateVersion!==je.state.version||vt.outputColorSpace!==pt||G.isBatchedMesh&&vt.batching===!1||!G.isBatchedMesh&&vt.batching===!0||G.isBatchedMesh&&vt.batchingColor===!0&&G.colorTexture===null||G.isBatchedMesh&&vt.batchingColor===!1&&G.colorTexture!==null||G.isInstancedMesh&&vt.instancing===!1||!G.isInstancedMesh&&vt.instancing===!0||G.isSkinnedMesh&&vt.skinning===!1||!G.isSkinnedMesh&&vt.skinning===!0||G.isInstancedMesh&&vt.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&vt.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&vt.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&vt.instancingMorph===!1&&G.morphTexture!==null||vt.envMap!==wt||O.fog===!0&&vt.fog!==mt||vt.numClippingPlanes!==void 0&&(vt.numClippingPlanes!==Pt.numPlanes||vt.numIntersection!==Pt.numIntersection)||vt.vertexAlphas!==Ot||vt.vertexTangents!==zt||vt.morphTargets!==At||vt.morphNormals!==te||vt.morphColors!==ge||vt.toneMapping!==me||vt.morphTargetsCount!==De||!!vt.lightProbeGrid!=y.state.lightProbeGridArray.length>0)&&(qt=!0):(qt=!0,vt.__version=O.version);let si=vt.currentProgram;qt===!0&&(si=aa(O,N,G),D&&O.isNodeMaterial&&D.onUpdateProgram(O,si,vt));let xi=!1,$i=!1,Un=!1;const ae=si.getUniforms(),ve=vt.uniforms;if(g.useProgram(si.program)&&(xi=!0,$i=!0,Un=!0),O.id!==tt&&(tt=O.id,$i=!0),vt.needsLights){const oe=bf(y.state.lightProbeGridArray,G);vt.lightProbeGrid!==oe&&(vt.lightProbeGrid=oe,$i=!0)}if(xi||dt!==x){g.buffers.depth.getReversed()&&x.reversedDepth!==!0&&(x._reversedDepth=!0,x.updateProjectionMatrix()),ae.setValue(L,"projectionMatrix",x.projectionMatrix),ae.setValue(L,"viewMatrix",x.matrixWorldInverse);const Zi=ae.map.cameraPosition;Zi!==void 0&&Zi.setValue(L,be.setFromMatrixPosition(x.matrixWorld)),T.logarithmicDepthBuffer&&ae.setValue(L,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(O.isMeshPhongMaterial||O.isMeshToonMaterial||O.isMeshLambertMaterial||O.isMeshBasicMaterial||O.isMeshStandardMaterial||O.isShaderMaterial)&&ae.setValue(L,"isOrthographic",x.isOrthographicCamera===!0),dt!==x&&(dt=x,$i=!0,Un=!0)}if(vt.needsLights&&(je.state.directionalShadowMap.length>0&&ae.setValue(L,"directionalShadowMap",je.state.directionalShadowMap,W),je.state.spotShadowMap.length>0&&ae.setValue(L,"spotShadowMap",je.state.spotShadowMap,W),je.state.pointShadowMap.length>0&&ae.setValue(L,"pointShadowMap",je.state.pointShadowMap,W)),G.isSkinnedMesh){ae.setOptional(L,G,"bindMatrix"),ae.setOptional(L,G,"bindMatrixInverse");const oe=G.skeleton;oe&&(oe.boneTexture===null&&oe.computeBoneTexture(),ae.setValue(L,"boneTexture",oe.boneTexture,W))}G.isBatchedMesh&&(ae.setOptional(L,G,"batchingTexture"),ae.setValue(L,"batchingTexture",G._matricesTexture,W),ae.setOptional(L,G,"batchingIdTexture"),ae.setValue(L,"batchingIdTexture",G._indirectTexture,W),ae.setOptional(L,G,"batchingColorTexture"),G._colorsTexture!==null&&ae.setValue(L,"batchingColorTexture",G._colorsTexture,W));const Ki=k.morphAttributes;if((Ki.position!==void 0||Ki.normal!==void 0||Ki.color!==void 0)&&I.update(G,k,si),($i||vt.receiveShadow!==G.receiveShadow)&&(vt.receiveShadow=G.receiveShadow,ae.setValue(L,"receiveShadow",G.receiveShadow)),(O.isMeshStandardMaterial||O.isMeshLambertMaterial||O.isMeshPhongMaterial)&&O.envMap===null&&N.environment!==null&&(ve.envMapIntensity.value=N.environmentIntensity),ve.dfgLUT!==void 0&&(ve.dfgLUT.value=jg()),$i){if(ae.setValue(L,"toneMappingExposure",C.toneMappingExposure),vt.needsLights&&wf(ve,Un),mt&&O.fog===!0&&Tt.refreshFogUniforms(ve,mt),Tt.refreshMaterialUniforms(ve,O,et,rt,y.state.transmissionRenderTarget[x.id]),vt.needsLights&&vt.lightProbeGrid){const oe=vt.lightProbeGrid;ve.probesSH.value=oe.texture,ve.probesMin.value.copy(oe.boundingBox.min),ve.probesMax.value.copy(oe.boundingBox.max),ve.probesResolution.value.copy(oe.resolution)}Wa.upload(L,rh(vt),ve,W)}if(O.isShaderMaterial&&O.uniformsNeedUpdate===!0&&(Wa.upload(L,rh(vt),ve,W),O.uniformsNeedUpdate=!1),O.isSpriteMaterial&&ae.setValue(L,"center",G.center),ae.setValue(L,"modelViewMatrix",G.modelViewMatrix),ae.setValue(L,"normalMatrix",G.normalMatrix),ae.setValue(L,"modelMatrix",G.matrixWorld),O.uniformsGroups!==void 0){const oe=O.uniformsGroups;for(let Zi=0,Fn=oe.length;Zi<Fn;Zi++){const lh=oe[Zi];Q.update(lh,si),Q.bind(lh,si)}}return si}function wf(x,N){x.ambientLightColor.needsUpdate=N,x.lightProbe.needsUpdate=N,x.directionalLights.needsUpdate=N,x.directionalLightShadows.needsUpdate=N,x.pointLights.needsUpdate=N,x.pointLightShadows.needsUpdate=N,x.spotLights.needsUpdate=N,x.spotLightShadows.needsUpdate=N,x.rectAreaLights.needsUpdate=N,x.hemisphereLights.needsUpdate=N}function Af(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return J},this.setRenderTargetTextures=function(x,N,k){const O=z.get(x);O.__autoAllocateDepthBuffer=x.resolveDepthBuffer===!1,O.__autoAllocateDepthBuffer===!1&&(O.__useRenderToTexture=!1),z.get(x.texture).__webglTexture=N,z.get(x.depthTexture).__webglTexture=O.__autoAllocateDepthBuffer?void 0:k,O.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(x,N){const k=z.get(x);k.__webglFramebuffer=N,k.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(x,N=0,k=0){J=x,X=N,V=k;let O=null,G=!1,mt=!1;if(x){const pt=z.get(x);if(pt.__useDefaultFramebuffer!==void 0){g.bindFramebuffer(L.FRAMEBUFFER,pt.__webglFramebuffer),gt.copy(x.viewport),xt.copy(x.scissor),Yt=x.scissorTest,g.viewport(gt),g.scissor(xt),g.setScissorTest(Yt),tt=-1;return}else if(pt.__webglFramebuffer===void 0)W.setupRenderTarget(x);else if(pt.__hasExternalTextures)W.rebindTextures(x,z.get(x.texture).__webglTexture,z.get(x.depthTexture).__webglTexture);else if(x.depthBuffer){const Ot=x.depthTexture;if(pt.__boundDepthTexture!==Ot){if(Ot!==null&&z.has(Ot)&&(x.width!==Ot.image.width||x.height!==Ot.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");W.setupDepthRenderbuffer(x)}}const yt=x.texture;(yt.isData3DTexture||yt.isDataArrayTexture||yt.isCompressedArrayTexture)&&(mt=!0);const wt=z.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(wt[N])?O=wt[N][k]:O=wt[N],G=!0):x.samples>0&&W.useMultisampledRTT(x)===!1?O=z.get(x).__webglMultisampledFramebuffer:Array.isArray(wt)?O=wt[k]:O=wt,gt.copy(x.viewport),xt.copy(x.scissor),Yt=x.scissorTest}else gt.copy(Ct).multiplyScalar(et).floor(),xt.copy(_e).multiplyScalar(et).floor(),Yt=Ht;if(k!==0&&(O=H),g.bindFramebuffer(L.FRAMEBUFFER,O)&&g.drawBuffers(x,O),g.viewport(gt),g.scissor(xt),g.setScissorTest(Yt),G){const pt=z.get(x.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+N,pt.__webglTexture,k)}else if(mt){const pt=N;for(let yt=0;yt<x.textures.length;yt++){const wt=z.get(x.textures[yt]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+yt,wt.__webglTexture,k,pt)}}else if(x!==null&&k!==0){const pt=z.get(x.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,pt.__webglTexture,k)}tt=-1},this.readRenderTargetPixels=function(x,N,k,O,G,mt,Mt,pt=0){if(!(x&&x.isWebGLRenderTarget)){Vt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let yt=z.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&Mt!==void 0&&(yt=yt[Mt]),yt){g.bindFramebuffer(L.FRAMEBUFFER,yt);try{const wt=x.textures[pt],Ot=wt.format,zt=wt.type;if(x.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+pt),!T.textureFormatReadable(Ot)){Vt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!T.textureTypeReadable(zt)){Vt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=x.width-O&&k>=0&&k<=x.height-G&&L.readPixels(N,k,O,G,ct.convert(Ot),ct.convert(zt),mt)}finally{const wt=J!==null?z.get(J).__webglFramebuffer:null;g.bindFramebuffer(L.FRAMEBUFFER,wt)}}},this.readRenderTargetPixelsAsync=async function(x,N,k,O,G,mt,Mt,pt=0){if(!(x&&x.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let yt=z.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&Mt!==void 0&&(yt=yt[Mt]),yt)if(N>=0&&N<=x.width-O&&k>=0&&k<=x.height-G){g.bindFramebuffer(L.FRAMEBUFFER,yt);const wt=x.textures[pt],Ot=wt.format,zt=wt.type;if(x.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+pt),!T.textureFormatReadable(Ot))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!T.textureTypeReadable(zt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const At=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,At),L.bufferData(L.PIXEL_PACK_BUFFER,mt.byteLength,L.STREAM_READ),L.readPixels(N,k,O,G,ct.convert(Ot),ct.convert(zt),0);const te=J!==null?z.get(J).__webglFramebuffer:null;g.bindFramebuffer(L.FRAMEBUFFER,te);const ge=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await ud(L,ge,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,At),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,mt),L.deleteBuffer(At),L.deleteSync(ge),mt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(x,N=null,k=0){const O=Math.pow(2,-k),G=Math.floor(x.image.width*O),mt=Math.floor(x.image.height*O),Mt=N!==null?N.x:0,pt=N!==null?N.y:0;W.setTexture2D(x,0),L.copyTexSubImage2D(L.TEXTURE_2D,k,0,0,Mt,pt,G,mt),g.unbindTexture()},this.copyTextureToTexture=function(x,N,k=null,O=null,G=0,mt=0){let Mt,pt,yt,wt,Ot,zt,At,te,ge;const me=x.isCompressedTexture?x.mipmaps[mt]:x.image;if(k!==null)Mt=k.max.x-k.min.x,pt=k.max.y-k.min.y,yt=k.isBox3?k.max.z-k.min.z:1,wt=k.min.x,Ot=k.min.y,zt=k.isBox3?k.min.z:0;else{const ve=Math.pow(2,-G);Mt=Math.floor(me.width*ve),pt=Math.floor(me.height*ve),x.isDataArrayTexture?yt=me.depth:x.isData3DTexture?yt=Math.floor(me.depth*ve):yt=1,wt=0,Ot=0,zt=0}O!==null?(At=O.x,te=O.y,ge=O.z):(At=0,te=0,ge=0);const se=ct.convert(N.format),De=ct.convert(N.type);let vt;N.isData3DTexture?(W.setTexture3D(N,0),vt=L.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(W.setTexture2DArray(N,0),vt=L.TEXTURE_2D_ARRAY):(W.setTexture2D(N,0),vt=L.TEXTURE_2D),g.activeTexture(L.TEXTURE0),g.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,N.flipY),g.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),g.pixelStorei(L.UNPACK_ALIGNMENT,N.unpackAlignment);const je=g.getParameter(L.UNPACK_ROW_LENGTH),qt=g.getParameter(L.UNPACK_IMAGE_HEIGHT),si=g.getParameter(L.UNPACK_SKIP_PIXELS),xi=g.getParameter(L.UNPACK_SKIP_ROWS),$i=g.getParameter(L.UNPACK_SKIP_IMAGES);g.pixelStorei(L.UNPACK_ROW_LENGTH,me.width),g.pixelStorei(L.UNPACK_IMAGE_HEIGHT,me.height),g.pixelStorei(L.UNPACK_SKIP_PIXELS,wt),g.pixelStorei(L.UNPACK_SKIP_ROWS,Ot),g.pixelStorei(L.UNPACK_SKIP_IMAGES,zt);const Un=x.isDataArrayTexture||x.isData3DTexture,ae=N.isDataArrayTexture||N.isData3DTexture;if(x.isDepthTexture){const ve=z.get(x),Ki=z.get(N),oe=z.get(ve.__renderTarget),Zi=z.get(Ki.__renderTarget);g.bindFramebuffer(L.READ_FRAMEBUFFER,oe.__webglFramebuffer),g.bindFramebuffer(L.DRAW_FRAMEBUFFER,Zi.__webglFramebuffer);for(let Fn=0;Fn<yt;Fn++)Un&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,z.get(x).__webglTexture,G,zt+Fn),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,z.get(N).__webglTexture,mt,ge+Fn)),L.blitFramebuffer(wt,Ot,Mt,pt,At,te,Mt,pt,L.DEPTH_BUFFER_BIT,L.NEAREST);g.bindFramebuffer(L.READ_FRAMEBUFFER,null),g.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(G!==0||x.isRenderTargetTexture||z.has(x)){const ve=z.get(x),Ki=z.get(N);g.bindFramebuffer(L.READ_FRAMEBUFFER,q),g.bindFramebuffer(L.DRAW_FRAMEBUFFER,B);for(let oe=0;oe<yt;oe++)Un?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,ve.__webglTexture,G,zt+oe):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,ve.__webglTexture,G),ae?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ki.__webglTexture,mt,ge+oe):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Ki.__webglTexture,mt),G!==0?L.blitFramebuffer(wt,Ot,Mt,pt,At,te,Mt,pt,L.COLOR_BUFFER_BIT,L.NEAREST):ae?L.copyTexSubImage3D(vt,mt,At,te,ge+oe,wt,Ot,Mt,pt):L.copyTexSubImage2D(vt,mt,At,te,wt,Ot,Mt,pt);g.bindFramebuffer(L.READ_FRAMEBUFFER,null),g.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else ae?x.isDataTexture||x.isData3DTexture?L.texSubImage3D(vt,mt,At,te,ge,Mt,pt,yt,se,De,me.data):N.isCompressedArrayTexture?L.compressedTexSubImage3D(vt,mt,At,te,ge,Mt,pt,yt,se,me.data):L.texSubImage3D(vt,mt,At,te,ge,Mt,pt,yt,se,De,me):x.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,mt,At,te,Mt,pt,se,De,me.data):x.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,mt,At,te,me.width,me.height,se,me.data):L.texSubImage2D(L.TEXTURE_2D,mt,At,te,Mt,pt,se,De,me);g.pixelStorei(L.UNPACK_ROW_LENGTH,je),g.pixelStorei(L.UNPACK_IMAGE_HEIGHT,qt),g.pixelStorei(L.UNPACK_SKIP_PIXELS,si),g.pixelStorei(L.UNPACK_SKIP_ROWS,xi),g.pixelStorei(L.UNPACK_SKIP_IMAGES,$i),mt===0&&N.generateMipmaps&&L.generateMipmap(vt),g.unbindTexture()},this.initRenderTarget=function(x){z.get(x).__webglFramebuffer===void 0&&W.setupRenderTarget(x)},this.initTexture=function(x){x.isCubeTexture?W.setTextureCube(x,0):x.isData3DTexture?W.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?W.setTexture2DArray(x,0):W.setTexture2D(x,0),g.unbindTexture()},this.resetState=function(){X=0,V=0,J=null,g.reset(),_t.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ai}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=Wt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Wt._getUnpackColorSpace()}}const pc={type:"change"},Ul={type:"start"},Ru={type:"end"},Na=new Mr,mc=new sn,ev=Math.cos(70*pd.DEG2RAD),Te=new U,Ye=2*Math.PI,ie={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},lo=1e-6;class iv extends sp{constructor(t,e=null){super(t,e),this.state=ie.NONE,this.target=new U,this.cursor=new U,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:hs.ROTATE,MIDDLE:hs.DOLLY,RIGHT:hs.PAN},this.touches={ONE:is.ROTATE,TWO:is.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new U,this._lastQuaternion=new fn,this._lastTargetPosition=new U,this._quat=new fn().setFromUnitVectors(t.up,new U(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Hh,this._sphericalDelta=new Hh,this._scale=1,this._panOffset=new U,this._rotateStart=new Rt,this._rotateEnd=new Rt,this._rotateDelta=new Rt,this._panStart=new Rt,this._panEnd=new Rt,this._panDelta=new Rt,this._dollyStart=new Rt,this._dollyEnd=new Rt,this._dollyDelta=new Rt,this._dollyDirection=new U,this._mouse=new Rt,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=sv.bind(this),this._onPointerDown=nv.bind(this),this._onPointerUp=av.bind(this),this._onContextMenu=fv.bind(this),this._onMouseWheel=lv.bind(this),this._onKeyDown=hv.bind(this),this._onTouchStart=cv.bind(this),this._onTouchMove=uv.bind(this),this._onMouseDown=rv.bind(this),this._onMouseMove=ov.bind(this),this._interceptControlDown=dv.bind(this),this._interceptControlUp=pv.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction=""}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(pc),this.update(),this.state=ie.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){const e=this.object.position;Te.copy(e).sub(this.target),Te.applyQuaternion(this._quat),this._spherical.setFromVector3(Te),this.autoRotate&&this.state===ie.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=Ye:n>Math.PI&&(n-=Ye),s<-Math.PI?s+=Ye:s>Math.PI&&(s-=Ye),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let a=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const r=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),a=r!=this._spherical.radius}if(Te.setFromSpherical(this._spherical),Te.applyQuaternion(this._quatInverse),e.copy(this.target).add(Te),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let r=null;if(this.object.isPerspectiveCamera){const o=Te.length();r=this._clampDistance(o*this._scale);const l=o-r;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),a=!!l}else if(this.object.isOrthographicCamera){const o=new U(this._mouse.x,this._mouse.y,0);o.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),a=l!==this.object.zoom;const h=new U(this._mouse.x,this._mouse.y,0);h.unproject(this.object),this.object.position.sub(h).add(o),this.object.updateMatrixWorld(),r=Te.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;r!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(r).add(this.object.position):(Na.origin.copy(this.object.position),Na.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Na.direction))<ev?this.object.lookAt(this.target):(mc.setFromNormalAndCoplanarPoint(this.object.up,this.target),Na.intersectPlane(mc,this.target))))}else if(this.object.isOrthographicCamera){const r=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),r!==this.object.zoom&&(this.object.updateProjectionMatrix(),a=!0)}return this._scale=1,this._performCursorZoom=!1,a||this._lastPosition.distanceToSquared(this.object.position)>lo||8*(1-this._lastQuaternion.dot(this.object.quaternion))>lo||this._lastTargetPosition.distanceToSquared(this.target)>lo?(this.dispatchEvent(pc),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?Ye/60*this.autoRotateSpeed*t:Ye/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Te.setFromMatrixColumn(e,0),Te.multiplyScalar(-t),this._panOffset.add(Te)}_panUp(t,e){this.screenSpacePanning===!0?Te.setFromMatrixColumn(e,1):(Te.setFromMatrixColumn(e,0),Te.crossVectors(this.object.up,Te)),Te.multiplyScalar(t),this._panOffset.add(Te)}_pan(t,e){const n=this.domElement;if(this.object.isPerspectiveCamera){const s=this.object.position;Te.copy(s).sub(this.target);let a=Te.length();a*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*a/n.clientHeight,this.object.matrix),this._panUp(2*e*a/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),s=t-n.left,a=e-n.top,r=n.width,o=n.height;this._mouse.x=s/r*2-1,this._mouse.y=-(a/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(Ye*this._rotateDelta.x/e.clientHeight),this._rotateUp(Ye*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(Ye*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-Ye*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(Ye*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-Ye*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,a=Math.sqrt(n*n+s*s);this._dollyStart.set(0,a)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),a=.5*(t.pageY+n.y);this._rotateEnd.set(s,a)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(Ye*this._rotateDelta.x/e.clientHeight),this._rotateUp(Ye*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,a=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,a),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const r=(t.pageX+e.x)*.5,o=(t.pageY+e.y)*.5;this._updateZoomParameters(r,o)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new Rt,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function nv(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function sv(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function av(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Ru),this.state=ie.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function rv(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case hs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=ie.DOLLY;break;case hs.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ie.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ie.ROTATE}break;case hs.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ie.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ie.PAN}break;default:this.state=ie.NONE}this.state!==ie.NONE&&this.dispatchEvent(Ul)}function ov(i){switch(this.state){case ie.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case ie.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case ie.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function lv(i){this.enabled===!1||this.enableZoom===!1||this.state!==ie.NONE||(i.preventDefault(),this.dispatchEvent(Ul),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Ru))}function hv(i){this.enabled!==!1&&this._handleKeyDown(i)}function cv(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case is.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=ie.TOUCH_ROTATE;break;case is.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=ie.TOUCH_PAN;break;default:this.state=ie.NONE}break;case 2:switch(this.touches.TWO){case is.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=ie.TOUCH_DOLLY_PAN;break;case is.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=ie.TOUCH_DOLLY_ROTATE;break;default:this.state=ie.NONE}break;default:this.state=ie.NONE}this.state!==ie.NONE&&this.dispatchEvent(Ul)}function uv(i){switch(this._trackPointer(i),this.state){case ie.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case ie.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case ie.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case ie.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=ie.NONE}}function fv(i){this.enabled!==!1&&i.preventDefault()}function dv(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function pv(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function mv(i){i("EPSG:4326","+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"),i("EPSG:4269","+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"),i("EPSG:3857","+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");for(var t=1;t<=60;++t)i("EPSG:"+(32600+t),"+proj=utm +zone="+t+" +datum=WGS84 +units=m"),i("EPSG:"+(32700+t),"+proj=utm +zone="+t+" +south +datum=WGS84 +units=m");i("EPSG:5041","+title=WGS 84 / UPS North (E,N) +proj=stere +lat_0=90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m"),i("EPSG:5042","+title=WGS 84 / UPS South (E,N) +proj=stere +lat_0=-90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m"),i.WGS84=i["EPSG:4326"],i["EPSG:3785"]=i["EPSG:3857"],i.GOOGLE=i["EPSG:3857"],i["EPSG:900913"]=i["EPSG:3857"],i["EPSG:102113"]=i["EPSG:3857"]}var In=1,Ln=2,ds=3,_v=4,hl=5,_c=6378137,gv=6356752314e-3,gc=.0066943799901413165,Gs=484813681109536e-20,j=Math.PI/2,vv=.16666666666666666,Mv=.04722222222222222,xv=.022156084656084655,nt=1e-10,he=.017453292519943295,Ze=57.29577951308232,Zt=Math.PI/4,Ys=Math.PI*2,Me=3.14159265359,Qe={};Qe.greenwich=0;Qe.lisbon=-9.131906111111;Qe.paris=2.337229166667;Qe.bogota=-74.080916666667;Qe.madrid=-3.687938888889;Qe.rome=12.452333333333;Qe.bern=7.439583333333;Qe.jakarta=106.807719444444;Qe.ferro=-17.666666666667;Qe.brussels=4.367975;Qe.stockholm=18.058277777778;Qe.athens=23.7163375;Qe.oslo=10.722916666667;const Sv={mm:{to_meter:.001},cm:{to_meter:.01},ft:{to_meter:.3048},"us-ft":{to_meter:1200/3937},fath:{to_meter:1.8288},kmi:{to_meter:1852},"us-ch":{to_meter:20.1168402336805},"us-mi":{to_meter:1609.34721869444},km:{to_meter:1e3},"ind-ft":{to_meter:.30479841},"ind-yd":{to_meter:.91439523},mi:{to_meter:1609.344},yd:{to_meter:.9144},ch:{to_meter:20.1168},link:{to_meter:.201168},dm:{to_meter:.1},in:{to_meter:.0254},"ind-ch":{to_meter:20.11669506},"us-in":{to_meter:.025400050800101},"us-yd":{to_meter:.914401828803658}};var vc=/[\s_\-\/\(\)]/g;function pn(i,t){if(i[t])return i[t];for(var e=Object.keys(i),n=t.toLowerCase().replace(vc,""),s=-1,a,r;++s<e.length;)if(a=e[s],r=a.toLowerCase().replace(vc,""),r===n)return i[a]}function cl(i){var t={},e=i.split("+").map(function(o){return o.trim()}).filter(function(o){return o}).reduce(function(o,l){var h=l.split("=");return h.push(!0),o[h[0].toLowerCase()]=h[1],o},{}),n,s,a,r={proj:"projName",datum:"datumCode",rf:function(o){t.rf=parseFloat(o)},lat_0:function(o){t.lat0=o*he},lat_1:function(o){t.lat1=o*he},lat_2:function(o){t.lat2=o*he},lat_ts:function(o){t.lat_ts=o*he},lon_0:function(o){t.long0=o*he},lon_wrap:function(o){t.long_wrap=parseFloat(o)*he},lon_1:function(o){t.long1=o*he},lon_2:function(o){t.long2=o*he},alpha:function(o){t.alpha=parseFloat(o)*he},gamma:function(o){t.rectified_grid_angle=parseFloat(o)*he},lonc:function(o){t.longc=o*he},x_0:function(o){t.x0=parseFloat(o)},y_0:function(o){t.y0=parseFloat(o)},k_0:function(o){t.k0=parseFloat(o)},k:function(o){t.k0=parseFloat(o)},a:function(o){t.a=parseFloat(o)},b:function(o){t.b=parseFloat(o)},r:function(o){t.a=t.b=parseFloat(o)},r_a:function(){t.R_A=!0},zone:function(o){t.zone=parseInt(o,10)},south:function(){t.utmSouth=!0},towgs84:function(o){t.datum_params=o.split(",").map(function(l){return parseFloat(l)})},to_meter:function(o){t.to_meter=parseFloat(o)},units:function(o){t.units=o;var l=pn(Sv,o);l&&(t.to_meter=l.to_meter)},from_greenwich:function(o){t.from_greenwich=o*he},pm:function(o){var l=pn(Qe,o);t.from_greenwich=(l||parseFloat(o))*he},nadgrids:function(o){o==="@null"?t.datumCode="none":t.nadgrids=o},axis:function(o){var l="ewnsud";o.length===3&&l.indexOf(o.substr(0,1))!==-1&&l.indexOf(o.substr(1,1))!==-1&&l.indexOf(o.substr(2,1))!==-1&&(t.axis=o)},approx:function(){t.approx=!0},over:function(){t.over=!0}};for(n in e)s=e[n],n in r?(a=r[n],typeof a=="function"?a(s):t[a]=s):t[n]=s;return typeof t.datumCode=="string"&&t.datumCode!=="WGS84"&&(t.datumCode=t.datumCode.toLowerCase()),t.projStr=i,t}class yv{static getId(t){const e=t.find(n=>Array.isArray(n)&&n[0]==="ID");return e&&e.length>=3?{authority:e[1],code:parseInt(e[2],10)}:null}static convertUnit(t,e="unit"){if(!t||t.length<3)return{type:e,name:"unknown",conversion_factor:null};const n=t[1],s=parseFloat(t[2])||null,a=t.find(o=>Array.isArray(o)&&o[0]==="ID"),r=a?{authority:a[1],code:parseInt(a[2],10)}:null;return{type:e,name:n,conversion_factor:s,id:r}}static convertAxis(t){const e=t[1]||"Unknown";let n;const s=e.match(/^\((.)\)$/);if(s){const h=s[1].toUpperCase();if(h==="E")n="east";else if(h==="N")n="north";else if(h==="U")n="up";else if(t[2])n=t[2];else throw new Error(`Unknown axis abbreviation: ${h}`)}else n=t[2]||"unknown";const a=t.find(h=>Array.isArray(h)&&h[0]==="ORDER"),r=a?parseInt(a[1],10):null,o=t.find(h=>Array.isArray(h)&&(h[0]==="LENGTHUNIT"||h[0]==="ANGLEUNIT"||h[0]==="SCALEUNIT")),l=this.convertUnit(o);return{name:e,direction:n,unit:l,order:r}}static extractAxes(t){return t.filter(e=>Array.isArray(e)&&e[0]==="AXIS").map(e=>this.convertAxis(e)).sort((e,n)=>(e.order||0)-(n.order||0))}static convert(t,e={}){switch(t[0]){case"PROJCRS":e.type="ProjectedCRS",e.name=t[1],e.base_crs=t.find(d=>Array.isArray(d)&&d[0]==="BASEGEOGCRS")?this.convert(t.find(d=>Array.isArray(d)&&d[0]==="BASEGEOGCRS")):null,e.conversion=t.find(d=>Array.isArray(d)&&d[0]==="CONVERSION")?this.convert(t.find(d=>Array.isArray(d)&&d[0]==="CONVERSION")):null;const n=t.find(d=>Array.isArray(d)&&d[0]==="CS");n&&(e.coordinate_system={subtype:n[1],axis:this.extractAxes(t)});const s=t.find(d=>Array.isArray(d)&&d[0]==="LENGTHUNIT");if(s){const d=this.convertUnit(s);e.coordinate_system.unit=d}e.id=this.getId(t);break;case"BASEGEOGCRS":case"GEOGCRS":case"GEODCRS":e.type=t[0]==="GEODCRS"?"GeodeticCRS":"GeographicCRS",e.name=t[1];const a=t.find(d=>Array.isArray(d)&&(d[0]==="DATUM"||d[0]==="ENSEMBLE"));if(a){const d=this.convert(a);a[0]==="ENSEMBLE"?e.datum_ensemble=d:e.datum=d;const _=t.find(M=>Array.isArray(M)&&M[0]==="PRIMEM");_&&_[1]!=="Greenwich"&&(d.prime_meridian={name:_[1],longitude:parseFloat(_[2])})}const r=t.find(d=>Array.isArray(d)&&d[0]==="CS");e.coordinate_system={subtype:r?r[1]:"ellipsoidal",axis:this.extractAxes(t)},e.id=this.getId(t);break;case"DATUM":e.type="GeodeticReferenceFrame",e.name=t[1],e.ellipsoid=t.find(d=>Array.isArray(d)&&d[0]==="ELLIPSOID")?this.convert(t.find(d=>Array.isArray(d)&&d[0]==="ELLIPSOID")):null;break;case"ENSEMBLE":e.type="DatumEnsemble",e.name=t[1],e.members=t.filter(d=>Array.isArray(d)&&d[0]==="MEMBER").map(d=>({type:"DatumEnsembleMember",name:d[1],id:this.getId(d)}));const o=t.find(d=>Array.isArray(d)&&d[0]==="ENSEMBLEACCURACY");o&&(e.accuracy=parseFloat(o[1]));const l=t.find(d=>Array.isArray(d)&&d[0]==="ELLIPSOID");l&&(e.ellipsoid=this.convert(l)),e.id=this.getId(t);break;case"ELLIPSOID":e.type="Ellipsoid",e.name=t[1],e.semi_major_axis=parseFloat(t[2]),e.inverse_flattening=parseFloat(t[3]),t.find(d=>Array.isArray(d)&&d[0]==="LENGTHUNIT")&&this.convert(t.find(d=>Array.isArray(d)&&d[0]==="LENGTHUNIT"),e);break;case"CONVERSION":e.type="Conversion",e.name=t[1],e.method=t.find(d=>Array.isArray(d)&&d[0]==="METHOD")?this.convert(t.find(d=>Array.isArray(d)&&d[0]==="METHOD")):null,e.parameters=t.filter(d=>Array.isArray(d)&&d[0]==="PARAMETER").map(d=>this.convert(d));break;case"METHOD":e.type="Method",e.name=t[1],e.id=this.getId(t);break;case"PARAMETER":e.type="Parameter",e.name=t[1],e.value=parseFloat(t[2]),e.unit=this.convertUnit(t.find(d=>Array.isArray(d)&&(d[0]==="LENGTHUNIT"||d[0]==="ANGLEUNIT"||d[0]==="SCALEUNIT"))),e.id=this.getId(t);break;case"BOUNDCRS":e.type="BoundCRS";const h=t.find(d=>Array.isArray(d)&&d[0]==="SOURCECRS");if(h){const d=h.find(_=>Array.isArray(_));e.source_crs=d?this.convert(d):null}const f=t.find(d=>Array.isArray(d)&&d[0]==="TARGETCRS");if(f){const d=f.find(_=>Array.isArray(_));e.target_crs=d?this.convert(d):null}const u=t.find(d=>Array.isArray(d)&&d[0]==="ABRIDGEDTRANSFORMATION");u?e.transformation=this.convert(u):e.transformation=null;break;case"ABRIDGEDTRANSFORMATION":if(e.type="Transformation",e.name=t[1],e.method=t.find(d=>Array.isArray(d)&&d[0]==="METHOD")?this.convert(t.find(d=>Array.isArray(d)&&d[0]==="METHOD")):null,e.parameters=t.filter(d=>Array.isArray(d)&&(d[0]==="PARAMETER"||d[0]==="PARAMETERFILE")).map(d=>{if(d[0]==="PARAMETER")return this.convert(d);if(d[0]==="PARAMETERFILE")return{name:d[1],value:d[2],id:{authority:"EPSG",code:8656}}}),e.parameters.length===7){const d=e.parameters[6];d.name==="Scale difference"&&(d.value=Math.round((d.value-1)*1e12)/1e6)}e.id=this.getId(t);break;case"AXIS":e.coordinate_system||(e.coordinate_system={type:"unspecified",axis:[]}),e.coordinate_system.axis.push(this.convertAxis(t));break;case"LENGTHUNIT":const c=this.convertUnit(t,"LinearUnit");e.coordinate_system&&e.coordinate_system.axis&&e.coordinate_system.axis.forEach(d=>{d.unit||(d.unit=c)}),c.conversion_factor&&c.conversion_factor!==1&&e.semi_major_axis&&(e.semi_major_axis={value:e.semi_major_axis,unit:c});break;default:e.keyword=t[0];break}return e}}function Ev(i){return yv.convert(i)}function bv(i){const t=i.toUpperCase();return t.includes("PROJCRS")||t.includes("GEOGCRS")||t.includes("BOUNDCRS")||t.includes("VERTCRS")||t.includes("LENGTHUNIT")||t.includes("ANGLEUNIT")||t.includes("SCALEUNIT")?"WKT2":(t.includes("PROJCS")||t.includes("GEOGCS")||t.includes("LOCAL_CS")||t.includes("VERT_CS")||t.includes("UNIT"),"WKT1")}var $s=1,Cu=2,Iu=3,sr=4,Lu=5,Fl=-1,Tv=/\s/,wv=/[A-Za-z]/,Av=/[A-Za-z84_]/,Er=/[,\]]/,Nu=/[\d\.E\-\+]/;function Yi(i){if(typeof i!="string")throw new Error("not a string");this.text=i.trim(),this.level=0,this.place=0,this.root=null,this.stack=[],this.currentObject=null,this.state=$s}Yi.prototype.readCharicter=function(){var i=this.text[this.place++];if(this.state!==sr)for(;Tv.test(i);){if(this.place>=this.text.length)return;i=this.text[this.place++]}switch(this.state){case $s:return this.neutral(i);case Cu:return this.keyword(i);case sr:return this.quoted(i);case Lu:return this.afterquote(i);case Iu:return this.number(i);case Fl:return}};Yi.prototype.afterquote=function(i){if(i==='"'){this.word+='"',this.state=sr;return}if(Er.test(i)){this.word=this.word.trim(),this.afterItem(i);return}throw new Error(`havn't handled "`+i+'" in afterquote yet, index '+this.place)};Yi.prototype.afterItem=function(i){if(i===","){this.word!==null&&this.currentObject.push(this.word),this.word=null,this.state=$s;return}if(i==="]"){this.level--,this.word!==null&&(this.currentObject.push(this.word),this.word=null),this.state=$s,this.currentObject=this.stack.pop(),this.currentObject||(this.state=Fl);return}};Yi.prototype.number=function(i){if(Nu.test(i)){this.word+=i;return}if(Er.test(i)){this.word=parseFloat(this.word),this.afterItem(i);return}throw new Error(`havn't handled "`+i+'" in number yet, index '+this.place)};Yi.prototype.quoted=function(i){if(i==='"'){this.state=Lu;return}this.word+=i};Yi.prototype.keyword=function(i){if(Av.test(i)){this.word+=i;return}if(i==="["){var t=[];t.push(this.word),this.level++,this.root===null?this.root=t:this.currentObject.push(t),this.stack.push(this.currentObject),this.currentObject=t,this.state=$s;return}if(Er.test(i)){this.afterItem(i);return}throw new Error(`havn't handled "`+i+'" in keyword yet, index '+this.place)};Yi.prototype.neutral=function(i){if(wv.test(i)){this.word=i,this.state=Cu;return}if(i==='"'){this.word="",this.state=sr;return}if(Nu.test(i)){this.word=i,this.state=Iu;return}if(Er.test(i)){this.afterItem(i);return}throw new Error(`havn't handled "`+i+'" in neutral yet, index '+this.place)};Yi.prototype.output=function(){for(;this.place<this.text.length;)this.readCharicter();if(this.state===Fl)return this.root;throw new Error('unable to parse string "'+this.text+'". State is '+this.state)};function Pv(i){var t=new Yi(i);return t.output()}function ho(i,t,e){Array.isArray(t)&&(e.unshift(t),t=null);var n=t?{}:i,s=e.reduce(function(a,r){return ss(r,a),a},n);t&&(i[t]=s)}function ss(i,t){if(!Array.isArray(i)){t[i]=!0;return}var e=i.shift();if(e==="PARAMETER"&&(e=i.shift()),i.length===1){if(Array.isArray(i[0])){t[e]={},ss(i[0],t[e]);return}t[e]=i[0];return}if(!i.length){t[e]=!0;return}if(e==="TOWGS84"){t[e]=i;return}if(e==="AXIS"){e in t||(t[e]=[]),t[e].push(i);return}Array.isArray(e)||(t[e]={});var n;switch(e){case"UNIT":case"PRIMEM":case"VERT_DATUM":t[e]={name:i[0].toLowerCase(),convert:i[1]},i.length===3&&ss(i[2],t[e]);return;case"SPHEROID":case"ELLIPSOID":t[e]={name:i[0],a:i[1],rf:i[2]},i.length===4&&ss(i[3],t[e]);return;case"EDATUM":case"ENGINEERINGDATUM":case"LOCAL_DATUM":case"DATUM":case"VERT_CS":case"VERTCRS":case"VERTICALCRS":i[0]=["name",i[0]],ho(t,e,i);return;case"COMPD_CS":case"COMPOUNDCRS":case"FITTED_CS":case"PROJECTEDCRS":case"PROJCRS":case"GEOGCS":case"GEOCCS":case"PROJCS":case"LOCAL_CS":case"GEODCRS":case"GEODETICCRS":case"GEODETICDATUM":case"ENGCRS":case"ENGINEERINGCRS":i[0]=["name",i[0]],ho(t,e,i),t[e].type=e;return;default:for(n=-1;++n<i.length;)if(!Array.isArray(i[n]))return ss(i,t[e]);return ho(t,e,i)}}var Rv=.017453292519943295;function ri(i){return i*Rv}function Du(i){const t=(i.projName||"").toLowerCase().replace(/_/g," ");i.long0===void 0&&i.longc!==void 0&&(i.long0=i.longc),!i.lat_ts&&i.lat1&&(t==="stereographic south pole"||t==="polar stereographic (variant b)")?(i.lat0=ri(i.lat1>0?90:-90),i.lat_ts=i.lat1,delete i.lat1):!i.lat_ts&&i.lat0&&(t==="polar stereographic"||t==="polar stereographic (variant a)")&&(i.lat_ts=i.lat0,i.lat0=ri(i.lat0>0?90:-90),delete i.lat1)}function Mc(i){let t={units:null,to_meter:void 0};return typeof i=="string"?(t.units=i.toLowerCase(),t.units==="metre"&&(t.units="meter"),t.units==="meter"&&(t.to_meter=1)):i&&i.name&&(t.units=i.name.toLowerCase(),t.units==="metre"&&(t.units="meter"),t.to_meter=i.conversion_factor),t}function xc(i){return typeof i=="object"?i.value*i.unit.conversion_factor:i}function Sc(i,t){i.ellipsoid.radius?(t.a=i.ellipsoid.radius,t.rf=0):(t.a=xc(i.ellipsoid.semi_major_axis),i.ellipsoid.inverse_flattening!==void 0?t.rf=i.ellipsoid.inverse_flattening:i.ellipsoid.semi_major_axis!==void 0&&i.ellipsoid.semi_minor_axis!==void 0&&(t.rf=t.a/(t.a-xc(i.ellipsoid.semi_minor_axis))))}function ar(i,t={}){return!i||typeof i!="object"?i:i.type==="BoundCRS"?(ar(i.source_crs,t),i.transformation&&(i.transformation.method&&i.transformation.method.name==="NTv2"?t.nadgrids=i.transformation.parameters[0].value:t.datum_params=i.transformation.parameters.map(e=>e.value)),t):(Object.keys(i).forEach(e=>{const n=i[e];if(n!==null)switch(e){case"name":if(t.srsCode)break;t.name=n,t.srsCode=n;break;case"type":n==="GeographicCRS"?t.projName="longlat":n==="GeodeticCRS"?i.coordinate_system&&i.coordinate_system.subtype==="Cartesian"?t.projName="geocent":t.projName="longlat":n==="ProjectedCRS"&&i.conversion&&i.conversion.method&&(t.projName=i.conversion.method.name);break;case"datum":case"datum_ensemble":n.ellipsoid&&(t.ellps=n.ellipsoid.name,Sc(n,t)),n.prime_meridian&&(t.from_greenwich=n.prime_meridian.longitude*Math.PI/180);break;case"ellipsoid":t.ellps=n.name,Sc(n,t);break;case"prime_meridian":t.long0=(n.longitude||0)*Math.PI/180;break;case"coordinate_system":if(n.axis){const s={east:"e",north:"n",west:"w",south:"s",up:"u",down:"d",geocentricx:"e",geocentricy:"n",geocentricz:"u"},a=n.axis.map(r=>s[r.direction.toLowerCase()]);if(a.every(Boolean)&&(t.axis=a.join(""),t.axis.length===2&&(t.axis+="u")),n.unit){const{units:r,to_meter:o}=Mc(n.unit);t.units=r,t.to_meter=o}else if(n.axis[0]&&n.axis[0].unit){const{units:r,to_meter:o}=Mc(n.axis[0].unit);t.units=r,t.to_meter=o}}break;case"id":n.authority&&n.code&&(t.title=n.authority+":"+n.code);break;case"conversion":n.method&&n.method.name&&(t.projName=n.method.name),n.parameters&&n.parameters.forEach(s=>{const a=s.name.toLowerCase().replace(/\s+/g,"_"),r=s.value;s.unit&&s.unit.conversion_factor?t[a]=r*s.unit.conversion_factor:s.unit==="degree"?t[a]=r*Math.PI/180:t[a]=r});break;case"unit":n.name&&(t.units=n.name.toLowerCase(),t.units==="metre"&&(t.units="meter")),n.conversion_factor&&(t.to_meter=n.conversion_factor);break;case"base_crs":ar(n,t),t.datumCode=n.id?n.id.authority+"_"+n.id.code:n.name;break}}),t.latitude_of_false_origin!==void 0&&(t.lat0=t.latitude_of_false_origin),t.longitude_of_false_origin!==void 0&&(t.long0=t.longitude_of_false_origin),t.latitude_of_standard_parallel!==void 0&&(t.lat0=t.latitude_of_standard_parallel,t.lat1=t.latitude_of_standard_parallel),t.latitude_of_1st_standard_parallel!==void 0&&(t.lat1=t.latitude_of_1st_standard_parallel),t.latitude_of_2nd_standard_parallel!==void 0&&(t.lat2=t.latitude_of_2nd_standard_parallel),t.latitude_of_projection_centre!==void 0&&(t.lat0=t.latitude_of_projection_centre),t.longitude_of_projection_centre!==void 0&&(t.longc=t.longitude_of_projection_centre),t.easting_at_false_origin!==void 0&&(t.x0=t.easting_at_false_origin),t.northing_at_false_origin!==void 0&&(t.y0=t.northing_at_false_origin),t.latitude_of_natural_origin!==void 0&&(t.lat0=t.latitude_of_natural_origin),t.longitude_of_natural_origin!==void 0&&(t.long0=t.longitude_of_natural_origin),t.longitude_of_origin!==void 0&&(t.long0=t.longitude_of_origin),t.false_easting!==void 0&&(t.x0=t.false_easting),t.easting_at_projection_centre&&(t.x0=t.easting_at_projection_centre),t.false_northing!==void 0&&(t.y0=t.false_northing),t.northing_at_projection_centre&&(t.y0=t.northing_at_projection_centre),t.standard_parallel_1!==void 0&&(t.lat1=t.standard_parallel_1),t.standard_parallel_2!==void 0&&(t.lat2=t.standard_parallel_2),t.scale_factor_at_natural_origin!==void 0&&(t.k0=t.scale_factor_at_natural_origin),t.scale_factor_at_projection_centre!==void 0&&(t.k0=t.scale_factor_at_projection_centre),t.scale_factor_on_pseudo_standard_parallel!==void 0&&(t.k0=t.scale_factor_on_pseudo_standard_parallel),t.azimuth!==void 0&&(t.alpha=t.azimuth),t.azimuth_at_projection_centre!==void 0&&(t.alpha=t.azimuth_at_projection_centre),t.angle_from_rectified_to_skew_grid&&(t.rectified_grid_angle=t.angle_from_rectified_to_skew_grid),Du(t),t)}var Cv=["PROJECTEDCRS","PROJCRS","GEOGCS","GEOCCS","PROJCS","LOCAL_CS","GEODCRS","GEODETICCRS","GEODETICDATUM","ENGCRS","ENGINEERINGCRS"];function Iv(i,t){var e=t[0],n=t[1];!(e in i)&&n in i&&(i[e]=i[n],t.length===3&&(i[e]=t[2](i[e])))}function Uu(i){for(var t=Object.keys(i),e=0,n=t.length;e<n;++e){var s=t[e];Cv.indexOf(s)!==-1&&Lv(i[s]),typeof i[s]=="object"&&Uu(i[s])}}function Lv(i){if(i.AUTHORITY){var t=Object.keys(i.AUTHORITY)[0];t&&t in i.AUTHORITY&&(i.title=t+":"+i.AUTHORITY[t])}if(i.type==="GEOGCS"?i.projName="longlat":i.type==="LOCAL_CS"?(i.projName="identity",i.local=!0):typeof i.PROJECTION=="object"?i.projName=Object.keys(i.PROJECTION)[0]:i.projName=i.PROJECTION,i.AXIS){for(var e="",n=0,s=i.AXIS.length;n<s;++n){var a=[i.AXIS[n][0].toLowerCase(),i.AXIS[n][1].toLowerCase()];a[0].indexOf("north")!==-1||(a[0]==="y"||a[0]==="lat")&&a[1]==="north"?e+="n":a[0].indexOf("south")!==-1||(a[0]==="y"||a[0]==="lat")&&a[1]==="south"?e+="s":a[0].indexOf("east")!==-1||(a[0]==="x"||a[0]==="lon")&&a[1]==="east"?e+="e":(a[0].indexOf("west")!==-1||(a[0]==="x"||a[0]==="lon")&&a[1]==="west")&&(e+="w")}e.length===2&&(e+="u"),e.length===3&&(i.axis=e)}i.UNIT&&(i.units=i.UNIT.name.toLowerCase(),i.units==="metre"&&(i.units="meter"),i.UNIT.convert&&(i.type==="GEOGCS"?i.DATUM&&i.DATUM.SPHEROID&&(i.to_meter=i.UNIT.convert*i.DATUM.SPHEROID.a):i.to_meter=i.UNIT.convert));var r=i.GEOGCS;i.type==="GEOGCS"&&(r=i),r&&(r.PRIMEM&&r.PRIMEM.convert&&(i.from_greenwich=ri(r.PRIMEM.convert)),r.DATUM?i.datumCode=r.DATUM.name.toLowerCase():i.datumCode=r.name.toLowerCase(),i.datumCode.slice(0,2)==="d_"&&(i.datumCode=i.datumCode.slice(2)),i.datumCode==="new_zealand_1949"&&(i.datumCode="nzgd49"),(i.datumCode==="wgs_1984"||i.datumCode==="world_geodetic_system_1984")&&(i.PROJECTION==="Mercator_Auxiliary_Sphere"&&(i.sphere=!0),i.datumCode="wgs84"),i.datumCode==="belge_1972"&&(i.datumCode="rnb72"),r.DATUM&&r.DATUM.SPHEROID&&(i.ellps=r.DATUM.SPHEROID.name.replace("_19","").replace(/[Cc]larke\_18/,"clrk"),i.ellps.toLowerCase().slice(0,13)==="international"&&(i.ellps="intl"),i.a=r.DATUM.SPHEROID.a,i.rf=parseFloat(r.DATUM.SPHEROID.rf)),r.DATUM&&r.DATUM.TOWGS84&&(i.datum_params=r.DATUM.TOWGS84),~i.datumCode.indexOf("osgb_1936")&&(i.datumCode="osgb36"),~i.datumCode.indexOf("osni_1952")&&(i.datumCode="osni52"),(~i.datumCode.indexOf("tm65")||~i.datumCode.indexOf("geodetic_datum_of_1965"))&&(i.datumCode="ire65"),i.datumCode==="ch1903+"&&(i.datumCode="ch1903"),~i.datumCode.indexOf("israel")&&(i.datumCode="isr93")),i.b&&!isFinite(i.b)&&(i.b=i.a),i.rectified_grid_angle&&(i.rectified_grid_angle=ri(i.rectified_grid_angle));function o(f){var u=i.to_meter||1;return f*u}var l=function(f){return Iv(i,f)},h=[["standard_parallel_1","Standard_Parallel_1"],["standard_parallel_1","Latitude of 1st standard parallel"],["standard_parallel_2","Standard_Parallel_2"],["standard_parallel_2","Latitude of 2nd standard parallel"],["false_easting","False_Easting"],["false_easting","False easting"],["false-easting","Easting at false origin"],["false_northing","False_Northing"],["false_northing","False northing"],["false_northing","Northing at false origin"],["central_meridian","Central_Meridian"],["central_meridian","Longitude of natural origin"],["central_meridian","Longitude of false origin"],["latitude_of_origin","Latitude_Of_Origin"],["latitude_of_origin","Central_Parallel"],["latitude_of_origin","Latitude of natural origin"],["latitude_of_origin","Latitude of false origin"],["scale_factor","Scale_Factor"],["k0","scale_factor"],["latitude_of_center","Latitude_Of_Center"],["latitude_of_center","Latitude_of_center"],["lat0","latitude_of_center",ri],["longitude_of_center","Longitude_Of_Center"],["longitude_of_center","Longitude_of_center"],["longc","longitude_of_center",ri],["x0","false_easting",o],["y0","false_northing",o],["long0","central_meridian",ri],["lat0","latitude_of_origin",ri],["lat0","standard_parallel_1",ri],["lat1","standard_parallel_1",ri],["lat2","standard_parallel_2",ri],["azimuth","Azimuth"],["alpha","azimuth",ri],["srsCode","name"]];h.forEach(l),Du(i)}function rr(i){if(typeof i=="object")return ar(i);const t=bv(i);var e=Pv(i);if(t==="WKT2"){const a=Ev(e);return ar(a)}var n=e[0],s={};return ss(e,s),Uu(s),s[n]}function Le(i){var t=this;if(arguments.length===2){var e=arguments[1];typeof e=="string"?e.charAt(0)==="+"?Le[i]=cl(arguments[1]):Le[i]=rr(arguments[1]):e&&typeof e=="object"&&!("projName"in e)?Le[i]=rr(arguments[1]):(Le[i]=e,e||delete Le[i])}else if(arguments.length===1){if(Array.isArray(i))return i.map(function(n){return Array.isArray(n)?Le.apply(t,n):Le(n)});if(typeof i=="string"){if(i in Le)return Le[i]}else"EPSG"in i?Le["EPSG:"+i.EPSG]=i:"ESRI"in i?Le["ESRI:"+i.ESRI]=i:"IAU2000"in i?Le["IAU2000:"+i.IAU2000]=i:console.log(i);return}}mv(Le);function Nv(i){return typeof i=="string"}function Dv(i){return i in Le}function Uv(i){return i.indexOf("+")!==0&&i.indexOf("[")!==-1||typeof i=="object"&&!("srsCode"in i)}var yc=["3857","900913","3785","102113"];function Fv(i){if(i.title)return i.title.toLowerCase().indexOf("epsg:")===0&&yc.indexOf(i.title.substr(5))>-1;var t=pn(i,"authority");if(t){var e=pn(t,"epsg");return e&&yc.indexOf(e)>-1}}function Ov(i){var t=pn(i,"extension");if(t)return pn(t,"proj4")}function Gv(i){return i[0]==="+"}function Bv(i){let t;if(Nv(i))if(Dv(i))t=Le[i];else if(Uv(i)){t=rr(i);var e=Ov(t);e&&(t=cl(e))}else Gv(i)&&(t=cl(i));else"projName"in i?t=i:t=rr(i);return t&&Fv(t)?Le["EPSG:3857"]:t}function Ec(i,t){i=i||{};var e,n;if(!t)return i;for(n in t)e=t[n],e!==void 0&&(i[n]=e);return i}function Ni(i,t,e){var n=i*t;return e/Math.sqrt(1-n*n)}function js(i){return i<0?-1:1}function at(i,t){return t||Math.abs(i)<=Me?i:i-js(i)*Ys}function _i(i,t,e){var n=i*e,s=.5*i;return n=Math.pow((1-n)/(1+n),s),Math.tan(.5*(j-t))/n}function Ks(i,t){for(var e=.5*i,n,s,a=j-2*Math.atan(t),r=0;r<=15;r++)if(n=i*Math.sin(a),s=j-2*Math.atan(t*Math.pow((1-n)/(1+n),e))-a,a+=s,Math.abs(s)<=1e-10)return a;return-9999}function zv(){var i=this.b/this.a;this.es=1-i*i,"x0"in this||(this.x0=0),"y0"in this||(this.y0=0),this.long0=this.long0||0,this.e=Math.sqrt(this.es),this.lat_ts?this.sphere?this.k0=Math.cos(this.lat_ts):this.k0=Ni(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts)):this.k0||(this.k?this.k0=this.k:this.k0=1)}function kv(i){var t=i.x,e=i.y;if(e*Ze>90&&e*Ze<-90&&t*Ze>180&&t*Ze<-180)return null;var n,s;if(Math.abs(Math.abs(e)-j)<=nt)return null;if(this.sphere)n=this.x0+this.a*this.k0*at(t-this.long0,this.over),s=this.y0+this.a*this.k0*Math.log(Math.tan(Zt+.5*e));else{var a=Math.sin(e),r=_i(this.e,e,a);n=this.x0+this.a*this.k0*at(t-this.long0,this.over),s=this.y0-this.a*this.k0*Math.log(r)}return i.x=n,i.y=s,i}function Hv(i){var t=i.x-this.x0,e=i.y-this.y0,n,s;if(this.sphere)s=j-2*Math.atan(Math.exp(-e/(this.a*this.k0)));else{var a=Math.exp(-e/(this.a*this.k0));if(s=Ks(this.e,a),s===-9999)return null}return n=at(this.long0+t/(this.a*this.k0),this.over),i.x=n,i.y=s,i}var Vv=["Mercator","Popular Visualisation Pseudo Mercator","Mercator_1SP","Mercator_Auxiliary_Sphere","Mercator_Variant_A","merc"];const Wv={init:zv,forward:kv,inverse:Hv,names:Vv};function Xv(){}function bc(i){return i}var Fu=["longlat","identity"];const qv={init:Xv,forward:bc,inverse:bc,names:Fu};var Yv=[Wv,qv],En={},as=[];function Ou(i,t){var e=as.length;return i.names?(as[e]=i,i.names.forEach(function(n){En[n.toLowerCase()]=e}),this):(console.log(t),!0)}function Gu(i){return i.replace(/[-\(\)\s]+/g," ").trim().replace(/ /g,"_")}function $v(i){if(!i)return!1;var t=i.toLowerCase();if(typeof En[t]<"u"&&as[En[t]]||(t=Gu(t),t in En&&as[En[t]]))return as[En[t]]}function Kv(){Yv.forEach(Ou)}const Zv={start:Kv,add:Ou,get:$v};var Bu={MERIT:{a:6378137,rf:298.257,ellipseName:"MERIT 1983"},SGS85:{a:6378136,rf:298.257,ellipseName:"Soviet Geodetic System 85"},GRS80:{a:6378137,rf:298.257222101,ellipseName:"GRS 1980(IUGG, 1980)"},IAU76:{a:6378140,rf:298.257,ellipseName:"IAU 1976"},airy:{a:6377563396e-3,b:635625691e-2,ellipseName:"Airy 1830"},APL4:{a:6378137,rf:298.25,ellipseName:"Appl. Physics. 1965"},NWL9D:{a:6378145,rf:298.25,ellipseName:"Naval Weapons Lab., 1965"},mod_airy:{a:6377340189e-3,b:6356034446e-3,ellipseName:"Modified Airy"},andrae:{a:637710443e-2,rf:300,ellipseName:"Andrae 1876 (Den., Iclnd.)"},aust_SA:{a:6378160,rf:298.25,ellipseName:"Australian Natl & S. Amer. 1969"},GRS67:{a:6378160,rf:298.247167427,ellipseName:"GRS 67(IUGG 1967)"},bessel:{a:6377397155e-3,rf:299.1528128,ellipseName:"Bessel 1841"},bess_nam:{a:6377483865e-3,rf:299.1528128,ellipseName:"Bessel 1841 (Namibia)"},clrk66:{a:63782064e-1,b:63565838e-1,ellipseName:"Clarke 1866"},clrk80:{a:6378249145e-3,rf:293.4663,ellipseName:"Clarke 1880 mod."},clrk80ign:{a:63782492e-1,b:6356515,rf:293.4660213,ellipseName:"Clarke 1880 (IGN)"},clrk58:{a:6378293645208759e-9,rf:294.2606763692654,ellipseName:"Clarke 1858"},CPM:{a:63757387e-1,rf:334.29,ellipseName:"Comm. des Poids et Mesures 1799"},delmbr:{a:6376428,rf:311.5,ellipseName:"Delambre 1810 (Belgium)"},engelis:{a:637813605e-2,rf:298.2566,ellipseName:"Engelis 1985"},evrst30:{a:6377276345e-3,rf:300.8017,ellipseName:"Everest 1830"},evrst48:{a:6377304063e-3,rf:300.8017,ellipseName:"Everest 1948"},evrst56:{a:6377301243e-3,rf:300.8017,ellipseName:"Everest 1956"},evrst69:{a:6377295664e-3,rf:300.8017,ellipseName:"Everest 1969"},evrstSS:{a:6377298556e-3,rf:300.8017,ellipseName:"Everest (Sabah & Sarawak)"},fschr60:{a:6378166,rf:298.3,ellipseName:"Fischer (Mercury Datum) 1960"},fschr60m:{a:6378155,rf:298.3,ellipseName:"Fischer 1960"},fschr68:{a:6378150,rf:298.3,ellipseName:"Fischer 1968"},helmert:{a:6378200,rf:298.3,ellipseName:"Helmert 1906"},hough:{a:6378270,rf:297,ellipseName:"Hough"},intl:{a:6378388,rf:297,ellipseName:"International 1909 (Hayford)"},kaula:{a:6378163,rf:298.24,ellipseName:"Kaula 1961"},lerch:{a:6378139,rf:298.257,ellipseName:"Lerch 1979"},mprts:{a:6397300,rf:191,ellipseName:"Maupertius 1738"},new_intl:{a:63781575e-1,b:63567722e-1,ellipseName:"New International 1967"},plessis:{a:6376523,b:6355863,ellipseName:"Plessis 1817 (France)"},krass:{a:6378245,rf:298.3,ellipseName:"Krassovsky, 1942"},SEasia:{a:6378155,b:63567733205e-4,ellipseName:"Southeast Asia"},walbeck:{a:6376896,b:63558348467e-4,ellipseName:"Walbeck"},WGS60:{a:6378165,rf:298.3,ellipseName:"WGS 60"},WGS66:{a:6378145,rf:298.25,ellipseName:"WGS 66"},WGS7:{a:6378135,rf:298.26,ellipseName:"WGS 72"},WGS84:{a:6378137,rf:298.257223563,ellipseName:"WGS 84"},sphere:{a:6370997,b:6370997,ellipseName:"Normal Sphere (r=6370997)"}};const Jv=Bu.WGS84;function Qv(i,t,e,n){var s=i*i,a=t*t,r=(s-a)/s,o=0;n?(i*=1-r*(vv+r*(Mv+r*xv)),s=i*i,r=0):o=Math.sqrt(r);var l=(s-a)/a;return{es:r,e:o,ep2:l}}function jv(i,t,e,n,s){if(!i){var a=pn(Bu,n);a||(a=Jv),i=a.a,t=a.b,e=a.rf}return e&&!t&&(t=(1-1/e)*i),(e===0||Math.abs(i-t)<nt)&&(s=!0,t=i),{a:i,b:t,rf:e,sphere:s}}var Xa={wgs84:{towgs84:"0,0,0",ellipse:"WGS84",datumName:"WGS84"},ch1903:{towgs84:"674.374,15.056,405.346",ellipse:"bessel",datumName:"swiss"},ggrs87:{towgs84:"-199.87,74.79,246.62",ellipse:"GRS80",datumName:"Greek_Geodetic_Reference_System_1987"},nad83:{towgs84:"0,0,0",ellipse:"GRS80",datumName:"North_American_Datum_1983"},nad27:{nadgrids:"@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",ellipse:"clrk66",datumName:"North_American_Datum_1927"},potsdam:{towgs84:"598.1,73.7,418.2,0.202,0.045,-2.455,6.7",ellipse:"bessel",datumName:"Potsdam Rauenberg 1950 DHDN"},carthage:{towgs84:"-263.0,6.0,431.0",ellipse:"clrk80ign",datumName:"Carthage 1934 Tunisia"},hermannskogel:{towgs84:"577.326,90.129,463.919,5.137,1.474,5.297,2.4232",ellipse:"bessel",datumName:"Hermannskogel"},mgi:{towgs84:"577.326,90.129,463.919,5.137,1.474,5.297,2.4232",ellipse:"bessel",datumName:"Militar-Geographische Institut"},osni52:{towgs84:"482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",ellipse:"airy",datumName:"Irish National"},ire65:{towgs84:"482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",ellipse:"mod_airy",datumName:"Ireland 1965"},rassadiran:{towgs84:"-133.63,-157.5,-158.62",ellipse:"intl",datumName:"Rassadiran"},nzgd49:{towgs84:"59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",ellipse:"intl",datumName:"New Zealand Geodetic Datum 1949"},osgb36:{towgs84:"446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",ellipse:"airy",datumName:"Ordnance Survey of Great Britain 1936"},s_jtsk:{towgs84:"589,76,480",ellipse:"bessel",datumName:"S-JTSK (Ferro)"},beduaram:{towgs84:"-106,-87,188",ellipse:"clrk80",datumName:"Beduaram"},gunung_segara:{towgs84:"-403,684,41",ellipse:"bessel",datumName:"Gunung Segara Jakarta"},rnb72:{towgs84:"106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1",ellipse:"intl",datumName:"Reseau National Belge 1972"},EPSG_5451:{towgs84:"6.41,-49.05,-11.28,1.5657,0.5242,6.9718,-5.7649"},IGNF_LURESG:{towgs84:"-192.986,13.673,-39.309,-0.4099,-2.9332,2.6881,0.43"},EPSG_4614:{towgs84:"-119.4248,-303.65872,-11.00061,1.164298,0.174458,1.096259,3.657065"},EPSG_4615:{towgs84:"-494.088,-312.129,279.877,-1.423,-1.013,1.59,-0.748"},ESRI_37241:{towgs84:"-76.822,257.457,-12.817,2.136,-0.033,-2.392,-0.031"},ESRI_37249:{towgs84:"-440.296,58.548,296.265,1.128,10.202,4.559,-0.438"},ESRI_37245:{towgs84:"-511.151,-181.269,139.609,1.05,2.703,1.798,3.071"},EPSG_4178:{towgs84:"24.9,-126.4,-93.2,-0.063,-0.247,-0.041,1.01"},EPSG_4622:{towgs84:"-472.29,-5.63,-304.12,0.4362,-0.8374,0.2563,1.8984"},EPSG_4625:{towgs84:"126.93,547.94,130.41,-2.7867,5.1612,-0.8584,13.8227"},EPSG_5252:{towgs84:"0.023,0.036,-0.068,0.00176,0.00912,-0.01136,0.00439"},EPSG_4314:{towgs84:"597.1,71.4,412.1,0.894,0.068,-1.563,7.58"},EPSG_4282:{towgs84:"-178.3,-316.7,-131.5,5.278,6.077,10.979,19.166"},EPSG_4231:{towgs84:"-83.11,-97.38,-117.22,0.005693,-0.044698,0.044285,0.1218"},EPSG_4274:{towgs84:"-230.994,102.591,25.199,0.633,-0.239,0.9,1.95"},EPSG_4134:{towgs84:"-180.624,-225.516,173.919,-0.81,-1.898,8.336,16.71006"},EPSG_4254:{towgs84:"18.38,192.45,96.82,0.056,-0.142,-0.2,-0.0013"},EPSG_4159:{towgs84:"-194.513,-63.978,-25.759,-3.4027,3.756,-3.352,-0.9175"},EPSG_4687:{towgs84:"0.072,-0.507,-0.245,0.0183,-0.0003,0.007,-0.0093"},EPSG_4227:{towgs84:"-83.58,-397.54,458.78,-17.595,-2.847,4.256,3.225"},EPSG_4746:{towgs84:"599.4,72.4,419.2,-0.062,-0.022,-2.723,6.46"},EPSG_4745:{towgs84:"612.4,77,440.2,-0.054,0.057,-2.797,2.55"},EPSG_6311:{towgs84:"8.846,-4.394,-1.122,-0.00237,-0.146528,0.130428,0.783926"},EPSG_4289:{towgs84:"565.7381,50.4018,465.2904,-0.395026,0.330772,-1.876073,4.07244"},EPSG_4230:{towgs84:"-68.863,-134.888,-111.49,-0.53,-0.14,0.57,-3.4"},EPSG_4154:{towgs84:"-123.02,-158.95,-168.47"},EPSG_4156:{towgs84:"570.8,85.7,462.8,4.998,1.587,5.261,3.56"},EPSG_4299:{towgs84:"482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15"},EPSG_4179:{towgs84:"33.4,-146.6,-76.3,-0.359,-0.053,0.844,-0.84"},EPSG_4313:{towgs84:"-106.8686,52.2978,-103.7239,0.3366,-0.457,1.8422,-1.2747"},EPSG_4194:{towgs84:"163.511,127.533,-159.789"},EPSG_4195:{towgs84:"105,326,-102.5"},EPSG_4196:{towgs84:"-45,417,-3.5"},EPSG_4611:{towgs84:"-162.619,-276.959,-161.764,0.067753,-2.243648,-1.158828,-1.094246"},EPSG_4633:{towgs84:"137.092,131.66,91.475,-1.9436,-11.5993,-4.3321,-7.4824"},EPSG_4641:{towgs84:"-408.809,366.856,-412.987,1.8842,-0.5308,2.1655,-121.0993"},EPSG_4643:{towgs84:"-480.26,-438.32,-643.429,16.3119,20.1721,-4.0349,-111.7002"},EPSG_4300:{towgs84:"482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15"},EPSG_4188:{towgs84:"482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15"},EPSG_4660:{towgs84:"982.6087,552.753,-540.873,6.681627,-31.611492,-19.848161,16.805"},EPSG_4662:{towgs84:"97.295,-263.247,310.882,-1.5999,0.8386,3.1409,13.3259"},EPSG_3906:{towgs84:"577.88891,165.22205,391.18289,4.9145,-0.94729,-13.05098,7.78664"},EPSG_4307:{towgs84:"-209.3622,-87.8162,404.6198,0.0046,3.4784,0.5805,-1.4547"},EPSG_6892:{towgs84:"-76.269,-16.683,68.562,-6.275,10.536,-4.286,-13.686"},EPSG_4690:{towgs84:"221.597,152.441,176.523,2.403,1.3893,0.884,11.4648"},EPSG_4691:{towgs84:"218.769,150.75,176.75,3.5231,2.0037,1.288,10.9817"},EPSG_4629:{towgs84:"72.51,345.411,79.241,-1.5862,-0.8826,-0.5495,1.3653"},EPSG_4630:{towgs84:"165.804,216.213,180.26,-0.6251,-0.4515,-0.0721,7.4111"},EPSG_4692:{towgs84:"217.109,86.452,23.711,0.0183,-0.0003,0.007,-0.0093"},EPSG_9333:{towgs84:"0,0,0,-0.008393,0.000749,-0.010276,0"},EPSG_9059:{towgs84:"0,0,0"},EPSG_4312:{towgs84:"601.705,84.263,485.227,4.7354,1.3145,5.393,-2.3887"},EPSG_4123:{towgs84:"-96.062,-82.428,-121.753,4.801,0.345,-1.376,1.496"},EPSG_4309:{towgs84:"-124.45,183.74,44.64,-0.4384,0.5446,-0.9706,-2.1365"},ESRI_104106:{towgs84:"-283.088,-70.693,117.445,-1.157,0.059,-0.652,-4.058"},EPSG_4281:{towgs84:"-219.247,-73.802,269.529"},EPSG_4322:{towgs84:"0,0,4.5"},EPSG_4324:{towgs84:"0,0,1.9"},EPSG_4284:{towgs84:"43.822,-108.842,-119.585,1.455,-0.761,0.737,0.549"},EPSG_4277:{towgs84:"446.448,-125.157,542.06,0.15,0.247,0.842,-20.489"},EPSG_4207:{towgs84:"-282.1,-72.2,120,-1.529,0.145,-0.89,-4.46"},EPSG_4688:{towgs84:"347.175,1077.618,2623.677,33.9058,-70.6776,9.4013,186.0647"},EPSG_4689:{towgs84:"410.793,54.542,80.501,-2.5596,-2.3517,-0.6594,17.3218"},EPSG_4720:{towgs84:"0,0,4.5"},EPSG_4273:{towgs84:"278.3,93,474.5,7.889,0.05,-6.61,6.21"},EPSG_4240:{towgs84:"204.64,834.74,293.8"},EPSG_4817:{towgs84:"278.3,93,474.5,7.889,0.05,-6.61,6.21"},ESRI_104131:{towgs84:"426.62,142.62,460.09,4.98,4.49,-12.42,-17.1"},EPSG_4265:{towgs84:"-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68"},EPSG_4263:{towgs84:"-111.92,-87.85,114.5,1.875,0.202,0.219,0.032"},EPSG_4298:{towgs84:"-689.5937,623.84046,-65.93566,-0.02331,1.17094,-0.80054,5.88536"},EPSG_4270:{towgs84:"-253.4392,-148.452,386.5267,0.15605,0.43,-0.1013,-0.0424"},EPSG_4229:{towgs84:"-121.8,98.1,-10.7"},EPSG_4220:{towgs84:"-55.5,-348,-229.2"},EPSG_4214:{towgs84:"12.646,-155.176,-80.863"},EPSG_4232:{towgs84:"-345,3,223"},EPSG_4238:{towgs84:"-1.977,-13.06,-9.993,0.364,0.254,0.689,-1.037"},EPSG_4168:{towgs84:"-170,33,326"},EPSG_4131:{towgs84:"199,931,318.9"},EPSG_4152:{towgs84:"-0.9102,2.0141,0.5602,0.029039,0.010065,0.010101,0"},EPSG_5228:{towgs84:"572.213,85.334,461.94,4.9732,1.529,5.2484,3.5378"},EPSG_8351:{towgs84:"485.021,169.465,483.839,7.786342,4.397554,4.102655,0"},EPSG_4683:{towgs84:"-127.62,-67.24,-47.04,-3.068,4.903,1.578,-1.06"},EPSG_4133:{towgs84:"0,0,0"},EPSG_7373:{towgs84:"0.819,-0.5762,-1.6446,-0.00378,-0.03317,0.00318,0.0693"},EPSG_9075:{towgs84:"-0.9102,2.0141,0.5602,0.029039,0.010065,0.010101,0"},EPSG_9072:{towgs84:"-0.9102,2.0141,0.5602,0.029039,0.010065,0.010101,0"},EPSG_9294:{towgs84:"1.16835,-1.42001,-2.24431,-0.00822,-0.05508,0.01818,0.23388"},EPSG_4212:{towgs84:"-267.434,173.496,181.814,-13.4704,8.7154,7.3926,14.7492"},EPSG_4191:{towgs84:"-44.183,-0.58,-38.489,2.3867,2.7072,-3.5196,-8.2703"},EPSG_4237:{towgs84:"52.684,-71.194,-13.975,-0.312,-0.1063,-0.3729,1.0191"},EPSG_4740:{towgs84:"-1.08,-0.27,-0.9"},EPSG_4124:{towgs84:"419.3836,99.3335,591.3451,0.850389,1.817277,-7.862238,-0.99496"},EPSG_5681:{towgs84:"584.9636,107.7175,413.8067,1.1155,0.2824,-3.1384,7.9922"},EPSG_4141:{towgs84:"23.772,17.49,17.859,-0.3132,-1.85274,1.67299,-5.4262"},EPSG_4204:{towgs84:"-85.645,-273.077,-79.708,2.289,-1.421,2.532,3.194"},EPSG_4319:{towgs84:"226.702,-193.337,-35.371,-2.229,-4.391,9.238,0.9798"},EPSG_4200:{towgs84:"24.82,-131.21,-82.66"},EPSG_4130:{towgs84:"0,0,0"},EPSG_4127:{towgs84:"-82.875,-57.097,-156.768,-2.158,1.524,-0.982,-0.359"},EPSG_4149:{towgs84:"674.374,15.056,405.346"},EPSG_4617:{towgs84:"-0.991,1.9072,0.5129,0.02579,0.00965,0.01166,0"},EPSG_4663:{towgs84:"-210.502,-66.902,-48.476,2.094,-15.067,-5.817,0.485"},EPSG_4664:{towgs84:"-211.939,137.626,58.3,-0.089,0.251,0.079,0.384"},EPSG_4665:{towgs84:"-105.854,165.589,-38.312,-0.003,-0.026,0.024,-0.048"},EPSG_4666:{towgs84:"631.392,-66.551,481.442,1.09,-4.445,-4.487,-4.43"},EPSG_4756:{towgs84:"-192.873,-39.382,-111.202,-0.00205,-0.0005,0.00335,0.0188"},EPSG_4723:{towgs84:"-179.483,-69.379,-27.584,-7.862,8.163,6.042,-13.925"},EPSG_4726:{towgs84:"8.853,-52.644,180.304,-0.393,-2.323,2.96,-24.081"},EPSG_4267:{towgs84:"-8.0,160.0,176.0"},EPSG_5365:{towgs84:"-0.16959,0.35312,0.51846,0.03385,-0.16325,0.03446,0.03693"},EPSG_4218:{towgs84:"304.5,306.5,-318.1"},EPSG_4242:{towgs84:"-33.722,153.789,94.959,-8.581,-4.478,4.54,8.95"},EPSG_4216:{towgs84:"-292.295,248.758,429.447,4.9971,2.99,6.6906,1.0289"},ESRI_104105:{towgs84:"631.392,-66.551,481.442,1.09,-4.445,-4.487,-4.43"},ESRI_104129:{towgs84:"0,0,0"},EPSG_4673:{towgs84:"174.05,-25.49,112.57"},EPSG_4202:{towgs84:"-124,-60,154"},EPSG_4203:{towgs84:"-117.763,-51.51,139.061,0.292,0.443,0.277,-0.191"},EPSG_3819:{towgs84:"595.48,121.69,515.35,4.115,-2.9383,0.853,-3.408"},EPSG_8694:{towgs84:"-93.799,-132.737,-219.073,-1.844,0.648,-6.37,-0.169"},EPSG_4145:{towgs84:"275.57,676.78,229.6"},EPSG_4283:{towgs84:"0.06155,-0.01087,-0.04019,0.039492,0.032722,0.032898,-0.009994"},EPSG_4317:{towgs84:"2.3287,-147.0425,-92.0802,-0.309248,0.324822,0.497299,5.689063"},EPSG_4272:{towgs84:"59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993"},EPSG_4248:{towgs84:"-307.7,265.3,-363.5"},EPSG_5561:{towgs84:"24,-121,-76"},EPSG_5233:{towgs84:"-0.293,766.95,87.713,0.195704,1.695068,3.473016,-0.039338"},ESRI_104130:{towgs84:"-86,-98,-119"},ESRI_104102:{towgs84:"682,-203,480"},ESRI_37207:{towgs84:"7,-10,-26"},EPSG_4675:{towgs84:"59.935,118.4,-10.871"},ESRI_104109:{towgs84:"-89.121,-348.182,260.871"},ESRI_104112:{towgs84:"-185.583,-230.096,281.361"},ESRI_104113:{towgs84:"25.1,-275.6,222.6"},IGNF_WGS72G:{towgs84:"0,12,6"},IGNF_NTFG:{towgs84:"-168,-60,320"},IGNF_EFATE57G:{towgs84:"-127,-769,472"},IGNF_PGP50G:{towgs84:"324.8,153.6,172.1"},IGNF_REUN47G:{towgs84:"94,-948,-1262"},IGNF_CSG67G:{towgs84:"-186,230,110"},IGNF_GUAD48G:{towgs84:"-467,-16,-300"},IGNF_TAHI51G:{towgs84:"162,117,154"},IGNF_TAHAAG:{towgs84:"65,342,77"},IGNF_NUKU72G:{towgs84:"84,274,65"},IGNF_PETRELS72G:{towgs84:"365,194,166"},IGNF_WALL78G:{towgs84:"253,-133,-127"},IGNF_MAYO50G:{towgs84:"-382,-59,-262"},IGNF_TANNAG:{towgs84:"-139,-967,436"},IGNF_IGN72G:{towgs84:"-13,-348,292"},IGNF_ATIGG:{towgs84:"1118,23,66"},IGNF_FANGA84G:{towgs84:"150.57,158.33,118.32"},IGNF_RUSAT84G:{towgs84:"202.13,174.6,-15.74"},IGNF_KAUE70G:{towgs84:"126.74,300.1,-75.49"},IGNF_MOP90G:{towgs84:"-10.8,-1.8,12.77"},IGNF_MHPF67G:{towgs84:"338.08,212.58,-296.17"},IGNF_TAHI79G:{towgs84:"160.61,116.05,153.69"},IGNF_ANAA92G:{towgs84:"1.5,3.84,4.81"},IGNF_MARQUI72G:{towgs84:"330.91,-13.92,58.56"},IGNF_APAT86G:{towgs84:"143.6,197.82,74.05"},IGNF_TUBU69G:{towgs84:"237.17,171.61,-77.84"},IGNF_STPM50G:{towgs84:"11.363,424.148,373.13"},EPSG_4150:{towgs84:"674.374,15.056,405.346"},EPSG_4754:{towgs84:"-208.4058,-109.8777,-2.5764"},ESRI_104101:{towgs84:"372.87,149.23,585.29"},EPSG_4693:{towgs84:"0,-0.15,0.68"},EPSG_6207:{towgs84:"293.17,726.18,245.36"},EPSG_4153:{towgs84:"-133.63,-157.5,-158.62"},EPSG_4132:{towgs84:"-241.54,-163.64,396.06"},EPSG_4221:{towgs84:"-154.5,150.7,100.4"},EPSG_4266:{towgs84:"-80.7,-132.5,41.1"},EPSG_4193:{towgs84:"-70.9,-151.8,-41.4"},EPSG_5340:{towgs84:"-0.41,0.46,-0.35"},EPSG_4246:{towgs84:"-294.7,-200.1,525.5"},EPSG_4318:{towgs84:"-3.2,-5.7,2.8"},EPSG_4121:{towgs84:"-199.87,74.79,246.62"},EPSG_4223:{towgs84:"-260.1,5.5,432.2"},EPSG_4158:{towgs84:"-0.465,372.095,171.736"},EPSG_4285:{towgs84:"-128.16,-282.42,21.93"},EPSG_4613:{towgs84:"-404.78,685.68,45.47"},EPSG_4607:{towgs84:"195.671,332.517,274.607"},EPSG_4475:{towgs84:"-381.788,-57.501,-256.673"},EPSG_4208:{towgs84:"-157.84,308.54,-146.6"},EPSG_4743:{towgs84:"70.995,-335.916,262.898"},EPSG_4710:{towgs84:"-323.65,551.39,-491.22"},EPSG_7881:{towgs84:"-0.077,0.079,0.086"},EPSG_4682:{towgs84:"283.729,735.942,261.143"},EPSG_4739:{towgs84:"-156,-271,-189"},EPSG_4679:{towgs84:"-80.01,253.26,291.19"},EPSG_4750:{towgs84:"-56.263,16.136,-22.856"},EPSG_4644:{towgs84:"-10.18,-350.43,291.37"},EPSG_4695:{towgs84:"-103.746,-9.614,-255.95"},EPSG_4292:{towgs84:"-355,21,72"},EPSG_4302:{towgs84:"-61.702,284.488,472.052"},EPSG_4143:{towgs84:"-124.76,53,466.79"},EPSG_4606:{towgs84:"-153,153,307"},EPSG_4699:{towgs84:"-770.1,158.4,-498.2"},EPSG_4247:{towgs84:"-273.5,110.6,-357.9"},EPSG_4160:{towgs84:"8.88,184.86,106.69"},EPSG_4161:{towgs84:"-233.43,6.65,173.64"},EPSG_9251:{towgs84:"-9.5,122.9,138.2"},EPSG_9253:{towgs84:"-78.1,101.6,133.3"},EPSG_4297:{towgs84:"-198.383,-240.517,-107.909"},EPSG_4269:{towgs84:"0,0,0"},EPSG_4301:{towgs84:"-147,506,687"},EPSG_4618:{towgs84:"-59,-11,-52"},EPSG_4612:{towgs84:"0,0,0"},EPSG_4678:{towgs84:"44.585,-131.212,-39.544"},EPSG_4250:{towgs84:"-130,29,364"},EPSG_4144:{towgs84:"214,804,268"},EPSG_4147:{towgs84:"-17.51,-108.32,-62.39"},EPSG_4259:{towgs84:"-254.1,-5.36,-100.29"},EPSG_4164:{towgs84:"-76,-138,67"},EPSG_4211:{towgs84:"-378.873,676.002,-46.255"},EPSG_4182:{towgs84:"-422.651,-172.995,84.02"},EPSG_4224:{towgs84:"-143.87,243.37,-33.52"},EPSG_4225:{towgs84:"-205.57,168.77,-4.12"},EPSG_5527:{towgs84:"-67.35,3.88,-38.22"},EPSG_4752:{towgs84:"98,390,-22"},EPSG_4310:{towgs84:"-30,190,89"},EPSG_9248:{towgs84:"-192.26,65.72,132.08"},EPSG_4680:{towgs84:"124.5,-63.5,-281"},EPSG_4701:{towgs84:"-79.9,-158,-168.9"},EPSG_4706:{towgs84:"-146.21,112.63,4.05"},EPSG_4805:{towgs84:"682,-203,480"},EPSG_4201:{towgs84:"-165,-11,206"},EPSG_4210:{towgs84:"-157,-2,-299"},EPSG_4183:{towgs84:"-104,167,-38"},EPSG_4139:{towgs84:"11,72,-101"},EPSG_4668:{towgs84:"-86,-98,-119"},EPSG_4717:{towgs84:"-2,151,181"},EPSG_4732:{towgs84:"102,52,-38"},EPSG_4280:{towgs84:"-377,681,-50"},EPSG_4209:{towgs84:"-138,-105,-289"},EPSG_4261:{towgs84:"31,146,47"},EPSG_4658:{towgs84:"-73,46,-86"},EPSG_4721:{towgs84:"265.025,384.929,-194.046"},EPSG_4222:{towgs84:"-136,-108,-292"},EPSG_4601:{towgs84:"-255,-15,71"},EPSG_4602:{towgs84:"725,685,536"},EPSG_4603:{towgs84:"72,213.7,93"},EPSG_4605:{towgs84:"9,183,236"},EPSG_4621:{towgs84:"137,248,-430"},EPSG_4657:{towgs84:"-28,199,5"},EPSG_4316:{towgs84:"103.25,-100.4,-307.19"},EPSG_4642:{towgs84:"-13,-348,292"},EPSG_4698:{towgs84:"145,-187,103"},EPSG_4192:{towgs84:"-206.1,-174.7,-87.7"},EPSG_4311:{towgs84:"-265,120,-358"},EPSG_4135:{towgs84:"58,-283,-182"},ESRI_104138:{towgs84:"198,-226,-347"},EPSG_4245:{towgs84:"-11,851,5"},EPSG_4142:{towgs84:"-125,53,467"},EPSG_4213:{towgs84:"-106,-87,188"},EPSG_4253:{towgs84:"-133,-77,-51"},EPSG_4129:{towgs84:"-132,-110,-335"},EPSG_4713:{towgs84:"-77,-128,142"},EPSG_4239:{towgs84:"217,823,299"},EPSG_4146:{towgs84:"295,736,257"},EPSG_4155:{towgs84:"-83,37,124"},EPSG_4165:{towgs84:"-173,253,27"},EPSG_4672:{towgs84:"175,-38,113"},EPSG_4236:{towgs84:"-637,-549,-203"},EPSG_4251:{towgs84:"-90,40,88"},EPSG_4271:{towgs84:"-2,374,172"},EPSG_4175:{towgs84:"-88,4,101"},EPSG_4716:{towgs84:"298,-304,-375"},EPSG_4315:{towgs84:"-23,259,-9"},EPSG_4744:{towgs84:"-242.2,-144.9,370.3"},EPSG_4244:{towgs84:"-97,787,86"},EPSG_4293:{towgs84:"616,97,-251"},EPSG_4714:{towgs84:"-127,-769,472"},EPSG_4736:{towgs84:"260,12,-147"},EPSG_6883:{towgs84:"-235,-110,393"},EPSG_6894:{towgs84:"-63,176,185"},EPSG_4205:{towgs84:"-43,-163,45"},EPSG_4256:{towgs84:"41,-220,-134"},EPSG_4262:{towgs84:"639,405,60"},EPSG_4604:{towgs84:"174,359,365"},EPSG_4169:{towgs84:"-115,118,426"},EPSG_4620:{towgs84:"-106,-129,165"},EPSG_4184:{towgs84:"-203,141,53"},EPSG_4616:{towgs84:"-289,-124,60"},EPSG_9403:{towgs84:"-307,-92,127"},EPSG_4684:{towgs84:"-133,-321,50"},EPSG_4708:{towgs84:"-491,-22,435"},EPSG_4707:{towgs84:"114,-116,-333"},EPSG_4709:{towgs84:"145,75,-272"},EPSG_4712:{towgs84:"-205,107,53"},EPSG_4711:{towgs84:"124,-234,-25"},EPSG_4718:{towgs84:"230,-199,-752"},EPSG_4719:{towgs84:"211,147,111"},EPSG_4724:{towgs84:"208,-435,-229"},EPSG_4725:{towgs84:"189,-79,-202"},EPSG_4735:{towgs84:"647,1777,-1124"},EPSG_4722:{towgs84:"-794,119,-298"},EPSG_4728:{towgs84:"-307,-92,127"},EPSG_4734:{towgs84:"-632,438,-609"},EPSG_4727:{towgs84:"912,-58,1227"},EPSG_4729:{towgs84:"185,165,42"},EPSG_4730:{towgs84:"170,42,84"},EPSG_4733:{towgs84:"276,-57,149"},ESRI_37218:{towgs84:"230,-199,-752"},ESRI_37240:{towgs84:"-7,215,225"},ESRI_37221:{towgs84:"252,-209,-751"},ESRI_4305:{towgs84:"-123,-206,219"},ESRI_104139:{towgs84:"-73,-247,227"},EPSG_4748:{towgs84:"51,391,-36"},EPSG_4219:{towgs84:"-384,664,-48"},EPSG_4255:{towgs84:"-333,-222,114"},EPSG_4257:{towgs84:"-587.8,519.75,145.76"},EPSG_4646:{towgs84:"-963,510,-359"},EPSG_6881:{towgs84:"-24,-203,268"},EPSG_6882:{towgs84:"-183,-15,273"},EPSG_4715:{towgs84:"-104,-129,239"},IGNF_RGF93GDD:{towgs84:"0,0,0"},IGNF_RGM04GDD:{towgs84:"0,0,0"},IGNF_RGSPM06GDD:{towgs84:"0,0,0"},IGNF_RGTAAF07GDD:{towgs84:"0,0,0"},IGNF_RGFG95GDD:{towgs84:"0,0,0"},IGNF_RGNCG:{towgs84:"0,0,0"},IGNF_RGPFGDD:{towgs84:"0,0,0"},IGNF_ETRS89G:{towgs84:"0,0,0"},IGNF_RGR92GDD:{towgs84:"0,0,0"},EPSG_4173:{towgs84:"0,0,0"},EPSG_4180:{towgs84:"0,0,0"},EPSG_4619:{towgs84:"0,0,0"},EPSG_4667:{towgs84:"0,0,0"},EPSG_4075:{towgs84:"0,0,0"},EPSG_6706:{towgs84:"0,0,0"},EPSG_7798:{towgs84:"0,0,0"},EPSG_4661:{towgs84:"0,0,0"},EPSG_4669:{towgs84:"0,0,0"},EPSG_8685:{towgs84:"0,0,0"},EPSG_4151:{towgs84:"0,0,0"},EPSG_9702:{towgs84:"0,0,0"},EPSG_4758:{towgs84:"0,0,0"},EPSG_4761:{towgs84:"0,0,0"},EPSG_4765:{towgs84:"0,0,0"},EPSG_8997:{towgs84:"0,0,0"},EPSG_4023:{towgs84:"0,0,0"},EPSG_4670:{towgs84:"0,0,0"},EPSG_4694:{towgs84:"0,0,0"},EPSG_4148:{towgs84:"0,0,0"},EPSG_4163:{towgs84:"0,0,0"},EPSG_4167:{towgs84:"0,0,0"},EPSG_4189:{towgs84:"0,0,0"},EPSG_4190:{towgs84:"0,0,0"},EPSG_4176:{towgs84:"0,0,0"},EPSG_4659:{towgs84:"0,0,0"},EPSG_3824:{towgs84:"0,0,0"},EPSG_3889:{towgs84:"0,0,0"},EPSG_4046:{towgs84:"0,0,0"},EPSG_4081:{towgs84:"0,0,0"},EPSG_4558:{towgs84:"0,0,0"},EPSG_4483:{towgs84:"0,0,0"},EPSG_5013:{towgs84:"0,0,0"},EPSG_5264:{towgs84:"0,0,0"},EPSG_5324:{towgs84:"0,0,0"},EPSG_5354:{towgs84:"0,0,0"},EPSG_5371:{towgs84:"0,0,0"},EPSG_5373:{towgs84:"0,0,0"},EPSG_5381:{towgs84:"0,0,0"},EPSG_5393:{towgs84:"0,0,0"},EPSG_5489:{towgs84:"0,0,0"},EPSG_5593:{towgs84:"0,0,0"},EPSG_6135:{towgs84:"0,0,0"},EPSG_6365:{towgs84:"0,0,0"},EPSG_5246:{towgs84:"0,0,0"},EPSG_7886:{towgs84:"0,0,0"},EPSG_8431:{towgs84:"0,0,0"},EPSG_8427:{towgs84:"0,0,0"},EPSG_8699:{towgs84:"0,0,0"},EPSG_8818:{towgs84:"0,0,0"},EPSG_4757:{towgs84:"0,0,0"},EPSG_9140:{towgs84:"0,0,0"},EPSG_8086:{towgs84:"0,0,0"},EPSG_4686:{towgs84:"0,0,0"},EPSG_4737:{towgs84:"0,0,0"},EPSG_4702:{towgs84:"0,0,0"},EPSG_4747:{towgs84:"0,0,0"},EPSG_4749:{towgs84:"0,0,0"},EPSG_4674:{towgs84:"0,0,0"},EPSG_4755:{towgs84:"0,0,0"},EPSG_4759:{towgs84:"0,0,0"},EPSG_4762:{towgs84:"0,0,0"},EPSG_4763:{towgs84:"0,0,0"},EPSG_4764:{towgs84:"0,0,0"},EPSG_4166:{towgs84:"0,0,0"},EPSG_4170:{towgs84:"0,0,0"},EPSG_5546:{towgs84:"0,0,0"},EPSG_7844:{towgs84:"0,0,0"},EPSG_4818:{towgs84:"589,76,480"},EPSG_10328:{towgs84:"0,0,0"},EPSG_9782:{towgs84:"0,0,0"},EPSG_9777:{towgs84:"0,0,0"},EPSG_10690:{towgs84:"0,0,0"},EPSG_10639:{towgs84:"0,0,0"},EPSG_10739:{towgs84:"0,0,0"},EPSG_7686:{towgs84:"0,0,0"},EPSG_8900:{towgs84:"0,0,0"},EPSG_5886:{towgs84:"0,0,0"},EPSG_7683:{towgs84:"0,0,0"},EPSG_6668:{towgs84:"0,0,0"},EPSG_20046:{towgs84:"0,0,0"},EPSG_10299:{towgs84:"0,0,0"},EPSG_10310:{towgs84:"0,0,0"},EPSG_10475:{towgs84:"0,0,0"},EPSG_4742:{towgs84:"0,0,0"},EPSG_10671:{towgs84:"0,0,0"},EPSG_10762:{towgs84:"0,0,0"},EPSG_10725:{towgs84:"0,0,0"},EPSG_10791:{towgs84:"0,0,0"},EPSG_10800:{towgs84:"0,0,0"},EPSG_10305:{towgs84:"0,0,0"},EPSG_10941:{towgs84:"0,0,0"},EPSG_10968:{towgs84:"0,0,0"},EPSG_10875:{towgs84:"0,0,0"},EPSG_6318:{towgs84:"0,0,0"},EPSG_10910:{towgs84:"0,0,0"}};for(var tM in Xa){var co=Xa[tM];co.datumName&&(Xa[co.datumName]=co)}function eM(i,t,e,n,s,a,r){var o={};return o.datum_type=hl,t&&(o.datum_type=_v,o.datum_params=t.map(parseFloat),(o.datum_params[0]!==0||o.datum_params[1]!==0||o.datum_params[2]!==0)&&(o.datum_type=In),o.datum_params.length>3&&(o.datum_params[3]!==0||o.datum_params[4]!==0||o.datum_params[5]!==0||o.datum_params[6]!==0)&&(o.datum_type=Ln,o.datum_params[3]*=Gs,o.datum_params[4]*=Gs,o.datum_params[5]*=Gs,o.datum_params[6]=o.datum_params[6]/1e6+1)),r&&(o.datum_type=ds,o.grids=r),o.a=e,o.b=n,o.es=s,o.ep2=a,o}var Ol={};function iM(i,t,e){return t instanceof ArrayBuffer?nM(i,t,e):{ready:sM(i,t)}}function nM(i,t,e){var n=!0;e!==void 0&&e.includeErrorFields===!1&&(n=!1);var s=new DataView(t),a=oM(s),r=lM(s,a),o=hM(s,r,a,n),l={header:r,subgrids:o};return Ol[i]=l,l}async function sM(i,t){for(var e=[],n=await t.getImageCount(),s=n-1;s>=0;s--){var a=await t.getImage(s),r=await a.readRasters(),o=r,l=[a.getWidth(),a.getHeight()],h=a.getBoundingBox().map(Tc),f=typeof a.fileDirectory.getValue=="function"?a.fileDirectory.getValue("ModelPixelScale"):a.fileDirectory.ModelPixelScale,u=[f[0],f[1]].map(Tc),c=h[0]+(l[0]-1)*u[0],d=h[3]-(l[1]-1)*u[1],_=o[0],M=o[1],m=[];for(let A=l[1]-1;A>=0;A--)for(let S=l[0]-1;S>=0;S--){var p=A*l[0]+S;m.push([-on(M[p]),on(_[p])])}e.push({del:u,lim:l,ll:[-c,d],cvs:m})}var b={header:{nSubgrids:n},subgrids:e};return Ol[i]=b,b}function aM(i){if(i===void 0)return null;var t=i.split(",");return t.map(rM)}function rM(i){if(i.length===0)return null;var t=i[0]==="@";return t&&(i=i.slice(1)),i==="null"?{name:"null",mandatory:!t,grid:null,isNull:!0}:{name:i,mandatory:!t,grid:Ol[i]||null,isNull:!1}}function Tc(i){return i*Math.PI/180}function on(i){return i/3600*Math.PI/180}function oM(i){var t=i.getInt32(8,!1);return t===11?!1:(t=i.getInt32(8,!0),t!==11&&console.warn("Failed to detect nadgrid endian-ness, defaulting to little-endian"),!0)}function lM(i,t){return{nFields:i.getInt32(8,t),nSubgridFields:i.getInt32(24,t),nSubgrids:i.getInt32(40,t),shiftType:ul(i,56,64).trim(),fromSemiMajorAxis:i.getFloat64(120,t),fromSemiMinorAxis:i.getFloat64(136,t),toSemiMajorAxis:i.getFloat64(152,t),toSemiMinorAxis:i.getFloat64(168,t)}}function ul(i,t,e){return String.fromCharCode.apply(null,new Uint8Array(i.buffer.slice(t,e)))}function hM(i,t,e,n){for(var s=176,a=[],r=0;r<t.nSubgrids;r++){var o=uM(i,s,e),l=fM(i,s,o,e,n),h=Math.round(1+(o.upperLongitude-o.lowerLongitude)/o.longitudeInterval),f=Math.round(1+(o.upperLatitude-o.lowerLatitude)/o.latitudeInterval);a.push({ll:[on(o.lowerLongitude),on(o.lowerLatitude)],del:[on(o.longitudeInterval),on(o.latitudeInterval)],lim:[h,f],count:o.gridNodeCount,cvs:cM(l)});var u=16;n===!1&&(u=8),s+=176+o.gridNodeCount*u}return a}function cM(i){return i.map(function(t){return[on(t.longitudeShift),on(t.latitudeShift)]})}function uM(i,t,e){return{name:ul(i,t+8,t+16).trim(),parent:ul(i,t+24,t+24+8).trim(),lowerLatitude:i.getFloat64(t+72,e),upperLatitude:i.getFloat64(t+88,e),lowerLongitude:i.getFloat64(t+104,e),upperLongitude:i.getFloat64(t+120,e),latitudeInterval:i.getFloat64(t+136,e),longitudeInterval:i.getFloat64(t+152,e),gridNodeCount:i.getInt32(t+168,e)}}function fM(i,t,e,n,s){var a=t+176,r=16;s===!1&&(r=8);for(var o=[],l=0;l<e.gridNodeCount;l++){var h={latitudeShift:i.getFloat32(a+l*r,n),longitudeShift:i.getFloat32(a+l*r+4,n)};s!==!1&&(h.latitudeAccuracy=i.getFloat32(a+l*r+8,n),h.longitudeAccuracy=i.getFloat32(a+l*r+12,n)),o.push(h)}return o}function ci(i,t){if(!(this instanceof ci))return new ci(i);this.forward=null,this.inverse=null,this.init=null,this.name,this.axis,this.names=null,this.title,t=t||function(h){if(h)throw h};var e=Bv(i);if(typeof e!="object"){t("Could not parse to valid json: "+i);return}var n=ci.projections.get(e.projName);if(!n){t("Could not get projection name from: "+i);return}if(e.datumCode&&e.datumCode!=="none"){var s=pn(Xa,e.datumCode);s&&(e.datum_params=e.datum_params||(s.towgs84?s.towgs84.split(","):null),e.ellps=s.ellipse,e.datumName=s.datumName?s.datumName:e.datumCode)}e.axis=e.axis||"enu",e.ellps=e.ellps||"wgs84",e.lat1=e.lat1||e.lat0;var a=jv(e.a,e.b,e.rf,e.ellps,e.sphere),r=Qv(a.a,a.b,a.rf,e.R_A),o=aM(e.nadgrids),l=e.datum||eM(e.datumCode,e.datum_params,a.a,a.b,r.es,r.ep2,o);Ec(this,e),Ec(this,n),this.a=a.a,this.b=a.b,this.rf=a.rf,this.sphere=a.sphere,this.es=r.es,this.e=r.e,this.ep2=r.ep2,this.datum=l,"init"in this&&typeof this.init=="function"&&this.init(),this.k0||(this.k0=1),t(null,this)}ci.projections=Zv;ci.projections.start();function dM(i,t){return i.datum_type!==t.datum_type||i.a!==t.a||Math.abs(i.es-t.es)>5e-11?!1:i.datum_type===In?i.datum_params[0]===t.datum_params[0]&&i.datum_params[1]===t.datum_params[1]&&i.datum_params[2]===t.datum_params[2]:i.datum_type===Ln?i.datum_params[0]===t.datum_params[0]&&i.datum_params[1]===t.datum_params[1]&&i.datum_params[2]===t.datum_params[2]&&i.datum_params[3]===t.datum_params[3]&&i.datum_params[4]===t.datum_params[4]&&i.datum_params[5]===t.datum_params[5]&&i.datum_params[6]===t.datum_params[6]:!0}function zu(i,t,e){var n=i.x,s=i.y,a=i.z?i.z:0,r,o,l,h;if(s<-j&&s>-1.001*j)s=-j;else if(s>j&&s<1.001*j)s=j;else{if(s<-j)return{x:-1/0,y:-1/0,z:i.z};if(s>j)return{x:1/0,y:1/0,z:i.z}}return n>Math.PI&&(n-=2*Math.PI),o=Math.sin(s),h=Math.cos(s),l=o*o,r=e/Math.sqrt(1-t*l),{x:(r+a)*h*Math.cos(n),y:(r+a)*h*Math.sin(n),z:(r*(1-t)+a)*o}}function ku(i,t,e,n){var s=1e-12,a=s*s,r=30,o,l,h,f,u,c,d,_,M,m,p,b,A,S=i.x,w=i.y,y=i.z?i.z:0,P,v,E;if(o=Math.sqrt(S*S+w*w),l=Math.sqrt(S*S+w*w+y*y),o/e<s){if(P=0,l/e<s)return v=j,E=-n,{x:i.x,y:i.y,z:i.z}}else P=Math.atan2(w,S);h=y/l,f=o/l,u=1/Math.sqrt(1-t*(2-t)*f*f),_=f*(1-t)*u,M=h*u,A=0;do A++,d=e/Math.sqrt(1-t*M*M),E=o*_+y*M-d*(1-t*M*M),c=t*d/(d+E),u=1/Math.sqrt(1-c*(2-c)*f*f),m=f*(1-c)*u,p=h*u,b=p*_-m*M,_=m,M=p;while(b*b>a&&A<r);return v=Math.atan(p/Math.abs(m)),{x:P,y:v,z:E}}function pM(i,t,e){if(t===In)return{x:i.x+e[0],y:i.y+e[1],z:i.z+e[2]};if(t===Ln){var n=e[0],s=e[1],a=e[2],r=e[3],o=e[4],l=e[5],h=e[6];return{x:h*(i.x-l*i.y+o*i.z)+n,y:h*(l*i.x+i.y-r*i.z)+s,z:h*(-o*i.x+r*i.y+i.z)+a}}}function mM(i,t,e){if(t===In)return{x:i.x-e[0],y:i.y-e[1],z:i.z-e[2]};if(t===Ln){var n=e[0],s=e[1],a=e[2],r=e[3],o=e[4],l=e[5],h=e[6],f=(i.x-n)/h,u=(i.y-s)/h,c=(i.z-a)/h;return{x:f+l*u-o*c,y:-l*f+u+r*c,z:o*f-r*u+c}}}function Da(i){return i===In||i===Ln}function _M(i,t,e){if(dM(i,t)||i.datum_type===hl||t.datum_type===hl)return e;var n=i.a,s=i.es;if(i.datum_type===ds){var a=wc(i,!1,e);if(a!==0)return;n=_c,s=gc}var r=t.a,o=t.b,l=t.es;if(t.datum_type===ds&&(r=_c,o=gv,l=gc),s===l&&n===r&&!Da(i.datum_type)&&!Da(t.datum_type))return e;if(e=zu(e,s,n),Da(i.datum_type)&&(e=pM(e,i.datum_type,i.datum_params)),Da(t.datum_type)&&(e=mM(e,t.datum_type,t.datum_params)),e=ku(e,l,r,o),t.datum_type===ds){var h=wc(t,!0,e);if(h!==0)return}return e}function wc(i,t,e){if(i.grids===null||i.grids.length===0)return console.log("Grid shift grids not found"),-1;var n={x:-e.x,y:e.y},s={x:Number.NaN,y:Number.NaN},a=[];t:for(var r=0;r<i.grids.length;r++){var o=i.grids[r];if(a.push(o.name),o.isNull){s=n;break}if(o.grid===null){if(o.mandatory)return console.log("Unable to find mandatory grid '"+o.name+"'"),-1;continue}for(var l=o.grid.subgrids,h=0,f=l.length;h<f;h++){var u=l[h],c=(Math.abs(u.del[1])+Math.abs(u.del[0]))/1e4,d=u.ll[0]-c,_=u.ll[1]-c,M=u.ll[0]+(u.lim[0]-1)*u.del[0]+c,m=u.ll[1]+(u.lim[1]-1)*u.del[1]+c;if(!(_>n.y||d>n.x||m<n.y||M<n.x)&&(s=gM(n,t,u),!isNaN(s.x)))break t}}return isNaN(s.x)?(console.log("Failed to find a grid shift table for location '"+-n.x*Ze+" "+n.y*Ze+" tried: '"+a+"'"),-1):(e.x=-s.x,e.y=s.y,0)}function gM(i,t,e){var n={x:Number.NaN,y:Number.NaN};if(isNaN(i.x))return n;var s={x:i.x,y:i.y};s.x-=e.ll[0],s.y-=e.ll[1],s.x=at(s.x-Math.PI)+Math.PI;var a=Ac(s,e);if(t){if(isNaN(a.x))return n;a.x=s.x-a.x,a.y=s.y-a.y;var r=9,o=1e-12,l,h;do{if(h=Ac(a,e),isNaN(h.x)){console.log("Inverse grid shift iteration failed, presumably at grid edge.  Using first approximation.");break}l={x:s.x-(h.x+a.x),y:s.y-(h.y+a.y)},a.x+=l.x,a.y+=l.y}while(r--&&Math.abs(l.x)>o&&Math.abs(l.y)>o);if(r<0)return console.log("Inverse grid shift iterator failed to converge."),n;n.x=at(a.x+e.ll[0]),n.y=a.y+e.ll[1]}else isNaN(a.x)||(n.x=i.x+a.x,n.y=i.y+a.y);return n}function Ac(i,t){var e={x:i.x/t.del[0],y:i.y/t.del[1]},n={x:Math.floor(e.x),y:Math.floor(e.y)},s={x:e.x-1*n.x,y:e.y-1*n.y},a={x:Number.NaN,y:Number.NaN},r;if(n.x<0||n.x>=t.lim[0]||n.y<0||n.y>=t.lim[1])return a;r=n.y*t.lim[0]+n.x;var o={x:t.cvs[r][0],y:t.cvs[r][1]};r++;var l={x:t.cvs[r][0],y:t.cvs[r][1]};r+=t.lim[0];var h={x:t.cvs[r][0],y:t.cvs[r][1]};r--;var f={x:t.cvs[r][0],y:t.cvs[r][1]},u=s.x*s.y,c=s.x*(1-s.y),d=(1-s.x)*(1-s.y),_=(1-s.x)*s.y;return a.x=d*o.x+c*l.x+_*f.x+u*h.x,a.y=d*o.y+c*l.y+_*f.y+u*h.y,a}var bn=["x","y","z"];function vM(i,t){const e={};for(let n=0,s=i.axis.length;n<s;n++){if(n===2&&t.z===void 0)continue;let a=t[bn[n]];switch(i.axis[n]){case"e":e.x=a;break;case"w":e.x=-a;break;case"n":e.y=a;break;case"s":e.y=-a;break;case"u":e.z=a;break;case"d":e.z=-a;break;default:return null}}return e}function MM(i,t){const e={};for(let n=0,s=i.axis.length;n<s;n++)if(!(n===2&&t.z===void 0))switch(i.axis[n]){case"e":e[bn[n]]=t.x;break;case"w":e[bn[n]]=-t.x;break;case"n":e[bn[n]]=t.y;break;case"s":e[bn[n]]=-t.y;break;case"u":e[bn[n]]=t.z;break;case"d":e[bn[n]]=-t.z;break;default:return null}return e}function Gl(i){var t={x:i[0],y:i[1]};return i.length>2&&(t.z=i[2]),i.length>3&&(t.m=i[3]),t}function xM(i){Pc(i.x),Pc(i.y)}function Pc(i){if(typeof Number.isFinite=="function"){if(Number.isFinite(i))return;throw new TypeError("coordinates must be finite numbers")}if(typeof i!="number"||i!==i||!isFinite(i))throw new TypeError("coordinates must be finite numbers")}function SM(i,t){return(i.datum.datum_type===In||i.datum.datum_type===Ln||i.datum.datum_type===ds)&&t.datumCode!=="WGS84"||(t.datum.datum_type===In||t.datum.datum_type===Ln||t.datum.datum_type===ds)&&i.datumCode!=="WGS84"}function or(i,t,e,n){var s,a=e.z!==void 0;if(xM(e),i.datum&&t.datum&&SM(i,t)&&(s=new ci("WGS84"),e=or(i,s,e,n),i=s),n&&i.axis!=="enu"&&(e=vM(i,e)),i.projName==="longlat")e={x:e.x*he,y:e.y*he,z:e.z||0};else if(i.to_meter&&(e={x:e.x*i.to_meter,y:e.y*i.to_meter,z:e.z||0}),e=i.inverse(e),!e)return;if(i.from_greenwich&&(e.x+=i.from_greenwich),e=_M(i.datum,t.datum,e),!!e)return e=e,t.from_greenwich&&(e={x:e.x-t.from_greenwich,y:e.y,z:e.z||0}),t.projName==="longlat"?(t.long_wrap!==void 0&&(e.x=t.long_wrap+at(e.x-t.long_wrap)),e={x:e.x*Ze,y:e.y*Ze,z:e.z||0}):(e=t.forward(e),t.to_meter&&(e={x:e.x/t.to_meter,y:e.y/t.to_meter,z:e.z||0})),n&&t.axis!=="enu"?MM(t,e):(e&&!a&&t.projName!=="geocent"&&delete e.z,e)}function yM(i,t,e,n){var s;return Array.isArray(e)?s=Gl(e):s={x:e.x,y:e.y,z:e.z,m:e.m},or(i,t,s,n)}var Rc=ci("WGS84");function uo(i,t,e,n){var s,a,r;return Array.isArray(e)?(s=or(i,t,Gl(e),n)||{x:NaN,y:NaN},e.length>2?(a=typeof i.name<"u"&&i.name==="geocent"||typeof t.name<"u"&&t.name==="geocent",a?typeof s.z=="number"?[s.x,s.y,s.z].concat(e.slice(3)):[s.x,s.y,e[2]].concat(e.slice(3)):n&&typeof s.z=="number"?[s.x,s.y,s.z].concat(e.slice(3)):[s.x,s.y].concat(e.slice(2))):[s.x,s.y]):(s=or(i,t,{x:e.x,y:e.y,z:e.z,m:e.m},n)||{x:NaN,y:NaN},r=Object.keys(e),r.length===2||(a=typeof i.name<"u"&&i.name==="geocent"||typeof t.name<"u"&&t.name==="geocent",r.forEach(function(o){o==="x"||o==="y"||o==="z"&&(a||n)||(s[o]=e[o])})),s)}function Ua(i){return i instanceof ci?i:typeof i=="object"&&"oProj"in i?i.oProj:ci(i)}function EM(i,t,e){var n,s,a=!1,r;return typeof t>"u"?(s=Ua(i),n=Rc,a=!0):(typeof t.x<"u"||Array.isArray(t))&&(e=t,s=Ua(i),n=Rc,a=!0),n||(n=Ua(i)),s||(s=Ua(t)),e?uo(n,s,e):(r={forward:function(o,l){return uo(n,s,o,l)},inverse:function(o,l){return uo(s,n,o,l)}},a&&(r.oProj=s),r)}var Cc=6,Hu="AJSAJS",Vu="AFAFAF",rs=65,$e=73,oi=79,Us=86,Fs=90;const bM={forward:Wu,inverse:TM,toPoint:Xu};function Wu(i,t){return t=t||5,PM(wM({lat:i[1],lon:i[0]}),t)}function TM(i){var t=Bl(Yu(i.toUpperCase()));return t.lat&&t.lon?[t.lon,t.lat,t.lon,t.lat]:[t.left,t.bottom,t.right,t.top]}function Xu(i){var t=Bl(Yu(i.toUpperCase()));return t.lat&&t.lon?[t.lon,t.lat]:[(t.left+t.right)/2,(t.top+t.bottom)/2]}function fo(i){return i*(Math.PI/180)}function Ic(i){return 180*(i/Math.PI)}function wM(i){var t=i.lat,e=i.lon,n=6378137,s=.00669438,a=.9996,r,o,l,h,f,u,c,d=fo(t),_=fo(e),M,m;m=Math.floor((e+180)/6)+1,e===180&&(m=60),t>=56&&t<64&&e>=3&&e<12&&(m=32),t>=72&&t<84&&(e>=0&&e<9?m=31:e>=9&&e<21?m=33:e>=21&&e<33?m=35:e>=33&&e<42&&(m=37)),r=(m-1)*6-180+3,M=fo(r),o=s/(1-s),l=n/Math.sqrt(1-s*Math.sin(d)*Math.sin(d)),h=Math.tan(d)*Math.tan(d),f=o*Math.cos(d)*Math.cos(d),u=Math.cos(d)*(_-M),c=n*((1-s/4-3*s*s/64-5*s*s*s/256)*d-(3*s/8+3*s*s/32+45*s*s*s/1024)*Math.sin(2*d)+(15*s*s/256+45*s*s*s/1024)*Math.sin(4*d)-35*s*s*s/3072*Math.sin(6*d));var p=a*l*(u+(1-h+f)*u*u*u/6+(5-18*h+h*h+72*f-58*o)*u*u*u*u*u/120)+5e5,b=a*(c+l*Math.tan(d)*(u*u/2+(5-h+9*f+4*f*f)*u*u*u*u/24+(61-58*h+h*h+600*f-330*o)*u*u*u*u*u*u/720));return t<0&&(b+=1e7),{northing:Math.round(b),easting:Math.round(p),zoneNumber:m,zoneLetter:AM(t)}}function Bl(i){var t=i.northing,e=i.easting,n=i.zoneLetter,s=i.zoneNumber;if(s<0||s>60)return null;var a=.9996,r=6378137,o=.00669438,l,h=(1-Math.sqrt(1-o))/(1+Math.sqrt(1-o)),f,u,c,d,_,M,m,p,b,A=e-5e5,S=t;n<"N"&&(S-=1e7),m=(s-1)*6-180+3,l=o/(1-o),M=S/a,p=M/(r*(1-o/4-3*o*o/64-5*o*o*o/256)),b=p+(3*h/2-27*h*h*h/32)*Math.sin(2*p)+(21*h*h/16-55*h*h*h*h/32)*Math.sin(4*p)+151*h*h*h/96*Math.sin(6*p),f=r/Math.sqrt(1-o*Math.sin(b)*Math.sin(b)),u=Math.tan(b)*Math.tan(b),c=l*Math.cos(b)*Math.cos(b),d=r*(1-o)/Math.pow(1-o*Math.sin(b)*Math.sin(b),1.5),_=A/(f*a);var w=b-f*Math.tan(b)/d*(_*_/2-(5+3*u+10*c-4*c*c-9*l)*_*_*_*_/24+(61+90*u+298*c+45*u*u-252*l-3*c*c)*_*_*_*_*_*_/720);w=Ic(w);var y=(_-(1+2*u+c)*_*_*_/6+(5-2*c+28*u-3*c*c+8*l+24*u*u)*_*_*_*_*_/120)/Math.cos(b);y=m+Ic(y);var P;if(i.accuracy){var v=Bl({northing:i.northing+i.accuracy,easting:i.easting+i.accuracy,zoneLetter:i.zoneLetter,zoneNumber:i.zoneNumber});P={top:v.lat,right:v.lon,bottom:w,left:y}}else P={lat:w,lon:y};return P}function AM(i){var t="Z";return 84>=i&&i>=72?t="X":72>i&&i>=64?t="W":64>i&&i>=56?t="V":56>i&&i>=48?t="U":48>i&&i>=40?t="T":40>i&&i>=32?t="S":32>i&&i>=24?t="R":24>i&&i>=16?t="Q":16>i&&i>=8?t="P":8>i&&i>=0?t="N":0>i&&i>=-8?t="M":-8>i&&i>=-16?t="L":-16>i&&i>=-24?t="K":-24>i&&i>=-32?t="J":-32>i&&i>=-40?t="H":-40>i&&i>=-48?t="G":-48>i&&i>=-56?t="F":-56>i&&i>=-64?t="E":-64>i&&i>=-72?t="D":-72>i&&i>=-80&&(t="C"),t}function PM(i,t){var e="00000"+i.easting,n="00000"+i.northing;return i.zoneNumber+i.zoneLetter+RM(i.easting,i.northing,i.zoneNumber)+e.substr(e.length-5,t)+n.substr(n.length-5,t)}function RM(i,t,e){var n=qu(e),s=Math.floor(i/1e5),a=Math.floor(t/1e5)%20;return CM(s,a,n)}function qu(i){var t=i%Cc;return t===0&&(t=Cc),t}function CM(i,t,e){var n=e-1,s=Hu.charCodeAt(n),a=Vu.charCodeAt(n),r=s+i-1,o=a+t,l=!1;r>Fs&&(r=r-Fs+rs-1,l=!0),(r===$e||s<$e&&r>$e||(r>$e||s<$e)&&l)&&r++,(r===oi||s<oi&&r>oi||(r>oi||s<oi)&&l)&&(r++,r===$e&&r++),r>Fs&&(r=r-Fs+rs-1),o>Us?(o=o-Us+rs-1,l=!0):l=!1,(o===$e||a<$e&&o>$e||(o>$e||a<$e)&&l)&&o++,(o===oi||a<oi&&o>oi||(o>oi||a<oi)&&l)&&(o++,o===$e&&o++),o>Us&&(o=o-Us+rs-1);var h=String.fromCharCode(r)+String.fromCharCode(o);return h}function Yu(i){if(i&&i.length===0)throw"MGRSPoint coverting from nothing";for(var t=i.length,e=null,n="",s,a=0;!/[A-Z]/.test(s=i.charAt(a));){if(a>=2)throw"MGRSPoint bad conversion from: "+i;n+=s,a++}var r=parseInt(n,10);if(a===0||a+3>t)throw"MGRSPoint bad conversion from: "+i;var o=i.charAt(a++);if(o<="A"||o==="B"||o==="Y"||o>="Z"||o==="I"||o==="O")throw"MGRSPoint zone letter "+o+" not handled: "+i;e=i.substring(a,a+=2);for(var l=qu(r),h=IM(e.charAt(0),l),f=LM(e.charAt(1),l);f<NM(o);)f+=2e6;var u=t-a;if(u%2!==0)throw`MGRSPoint has to have an even number
of digits after the zone letter and two 100km letters - front
half for easting meters, second half for
northing meters`+i;var c=u/2,d=0,_=0,M,m,p,b,A;return c>0&&(M=1e5/Math.pow(10,c),m=i.substring(a,a+c),d=parseFloat(m)*M,p=i.substring(a+c),_=parseFloat(p)*M),b=d+h,A=_+f,{easting:b,northing:A,zoneLetter:o,zoneNumber:r,accuracy:M}}function IM(i,t){for(var e=Hu.charCodeAt(t-1),n=1e5,s=!1;e!==i.charCodeAt(0);){if(e++,e===$e&&e++,e===oi&&e++,e>Fs){if(s)throw"Bad character: "+i;e=rs,s=!0}n+=1e5}return n}function LM(i,t){if(i>"V")throw"MGRSPoint given invalid Northing "+i;for(var e=Vu.charCodeAt(t-1),n=0,s=!1;e!==i.charCodeAt(0);){if(e++,e===$e&&e++,e===oi&&e++,e>Us){if(s)throw"Bad character: "+i;e=rs,s=!0}n+=1e5}return n}function NM(i){var t;switch(i){case"C":t=11e5;break;case"D":t=2e6;break;case"E":t=28e5;break;case"F":t=37e5;break;case"G":t=46e5;break;case"H":t=55e5;break;case"J":t=64e5;break;case"K":t=73e5;break;case"L":t=82e5;break;case"M":t=91e5;break;case"N":t=0;break;case"P":t=8e5;break;case"Q":t=17e5;break;case"R":t=26e5;break;case"S":t=35e5;break;case"T":t=44e5;break;case"U":t=53e5;break;case"V":t=62e5;break;case"W":t=7e6;break;case"X":t=79e5;break;default:t=-1}if(t>=0)return t;throw"Invalid zone letter: "+i}function xs(i,t,e){if(!(this instanceof xs))return new xs(i,t,e);if(Array.isArray(i))this.x=i[0],this.y=i[1],this.z=i[2]||0;else if(typeof i=="object")this.x=i.x,this.y=i.y,this.z=i.z||0;else if(typeof i=="string"&&typeof t>"u"){var n=i.split(",");this.x=parseFloat(n[0]),this.y=parseFloat(n[1]),this.z=parseFloat(n[2])||0}else this.x=i,this.y=t,this.z=e||0;console.warn("proj4.Point will be removed in version 3, use proj4.toPoint")}xs.fromMGRS=function(i){return new xs(Xu(i))};xs.prototype.toMGRS=function(i){return Wu([this.x,this.y],i)};var DM=1,UM=.25,Lc=.046875,Nc=.01953125,Dc=.01068115234375,FM=.75,OM=.46875,GM=.013020833333333334,BM=.007120768229166667,zM=.3645833333333333,kM=.005696614583333333,HM=.3076171875;function zl(i){var t=[];t[0]=DM-i*(UM+i*(Lc+i*(Nc+i*Dc))),t[1]=i*(FM-i*(Lc+i*(Nc+i*Dc)));var e=i*i;return t[2]=e*(OM-i*(GM+i*BM)),e*=i,t[3]=e*(zM-i*kM),t[4]=e*i*HM,t}function ys(i,t,e,n){return e*=t,t*=t,n[0]*i-e*(n[1]+t*(n[2]+t*(n[3]+t*n[4])))}var VM=20;function kl(i,t,e){for(var n=1/(1-t),s=i,a=VM;a;--a){var r=Math.sin(s),o=1-t*r*r;if(o=(ys(s,r,Math.cos(s),e)-i)*(o*Math.sqrt(o))*n,s-=o,Math.abs(o)<nt)return s}return s}function WM(){this.x0=this.x0!==void 0?this.x0:0,this.y0=this.y0!==void 0?this.y0:0,this.long0=this.long0!==void 0?this.long0:0,this.lat0=this.lat0!==void 0?this.lat0:0,this.es&&(this.en=zl(this.es),this.ml0=ys(this.lat0,Math.sin(this.lat0),Math.cos(this.lat0),this.en))}function XM(i){var t=i.x,e=i.y,n=at(t-this.long0,this.over),s,a,r,o=Math.sin(e),l=Math.cos(e);if(this.es){var f=l*n,u=Math.pow(f,2),c=this.ep2*Math.pow(l,2),d=Math.pow(c,2),_=Math.abs(l)>nt?Math.tan(e):0,M=Math.pow(_,2),m=Math.pow(M,2);s=1-this.es*Math.pow(o,2),f=f/Math.sqrt(s);var p=ys(e,o,l,this.en);a=this.a*(this.k0*f*(1+u/6*(1-M+c+u/20*(5-18*M+m+14*c-58*M*c+u/42*(61+179*m-m*M-479*M)))))+this.x0,r=this.a*(this.k0*(p-this.ml0+o*n*f/2*(1+u/12*(5-M+9*c+4*d+u/30*(61+m-58*M+270*c-330*M*c+u/56*(1385+543*m-m*M-3111*M))))))+this.y0}else{var h=l*Math.sin(n);if(Math.abs(Math.abs(h)-1)<nt)return 93;if(a=.5*this.a*this.k0*Math.log((1+h)/(1-h))+this.x0,r=l*Math.cos(n)/Math.sqrt(1-Math.pow(h,2)),h=Math.abs(r),h>=1){if(h-1>nt)return 93;r=0}else r=Math.acos(r);e<0&&(r=-r),r=this.a*this.k0*(r-this.lat0)+this.y0}return i.x=a,i.y=r,i}function qM(i){var t,e,n,s,a=(i.x-this.x0)*(1/this.a),r=(i.y-this.y0)*(1/this.a);if(this.es)if(t=this.ml0+r/this.k0,e=kl(t,this.es,this.en),Math.abs(e)<j){var u=Math.sin(e),c=Math.cos(e),d=Math.abs(c)>nt?Math.tan(e):0,_=this.ep2*Math.pow(c,2),M=Math.pow(_,2),m=Math.pow(d,2),p=Math.pow(m,2);t=1-this.es*Math.pow(u,2);var b=a*Math.sqrt(t)/this.k0,A=Math.pow(b,2);t=t*d,n=e-t*A/(1-this.es)*.5*(1-A/12*(5+3*m-9*_*m+_-4*M-A/30*(61+90*m-252*_*m+45*p+46*_-A/56*(1385+3633*m+4095*p+1574*p*m)))),s=at(this.long0+b*(1-A/6*(1+2*m+_-A/20*(5+28*m+24*p+8*_*m+6*_-A/42*(61+662*m+1320*p+720*p*m))))/c,this.over)}else n=j*js(r),s=0;else{var o=Math.exp(a/this.k0),l=.5*(o-1/o),h=this.lat0+r/this.k0,f=Math.cos(h);t=Math.sqrt((1-Math.pow(f,2))/(1+Math.pow(l,2))),n=Math.asin(t),r<0&&(n=-n),l===0&&f===0?s=0:s=at(Math.atan2(l,f)+this.long0,this.over)}return i.x=s,i.y=n,i}var YM=["Fast_Transverse_Mercator","Fast Transverse Mercator"];const qa={init:WM,forward:XM,inverse:qM,names:YM};function $u(i){var t=Math.exp(i);return t=(t-1/t)/2,t}function Ke(i,t){i=Math.abs(i),t=Math.abs(t);var e=Math.max(i,t),n=Math.min(i,t)/(e||1);return e*Math.sqrt(1+Math.pow(n,2))}function $M(i){var t=1+i,e=t-1;return e===0?i:i*Math.log(t)/e}function KM(i){var t=Math.abs(i);return t=$M(t*(1+t/(Ke(1,t)+1))),i<0?-t:t}function Hl(i,t){for(var e=2*Math.cos(2*t),n=i.length-1,s=i[n],a=0,r;--n>=0;)r=-a+e*s+i[n],a=s,s=r;return t+r*Math.sin(2*t)}function ZM(i,t){for(var e=2*Math.cos(t),n=i.length-1,s=i[n],a=0,r;--n>=0;)r=-a+e*s+i[n],a=s,s=r;return Math.sin(t)*r}function JM(i){var t=Math.exp(i);return t=(t+1/t)/2,t}function Ku(i,t,e){for(var n=Math.sin(t),s=Math.cos(t),a=$u(e),r=JM(e),o=2*s*r,l=-2*n*a,h=i.length-1,f=i[h],u=0,c=0,d=0,_,M;--h>=0;)_=c,M=u,c=f,u=d,f=-_+o*c-l*u+i[h],d=-M+l*c+o*u;return o=n*r,l=s*a,[o*f-l*d,o*d+l*f]}function QM(){if(!this.approx&&(isNaN(this.es)||this.es<=0))throw new Error('Incorrect elliptical usage. Try using the +approx option in the proj string, or PROJECTION["Fast_Transverse_Mercator"] in the WKT.');this.approx&&(qa.init.apply(this),this.forward=qa.forward,this.inverse=qa.inverse),this.x0=this.x0!==void 0?this.x0:0,this.y0=this.y0!==void 0?this.y0:0,this.long0=this.long0!==void 0?this.long0:0,this.lat0=this.lat0!==void 0?this.lat0:0,this.k0=this.k0!==void 0?this.k0:1,this.cgb=[],this.cbg=[],this.utg=[],this.gtu=[];var i=this.es/(1+Math.sqrt(1-this.es)),t=i/(2-i),e=t;this.cgb[0]=t*(2+t*(-2/3+t*(-2+t*(116/45+t*(26/45+t*(-2854/675)))))),this.cbg[0]=t*(-2+t*(2/3+t*(4/3+t*(-82/45+t*(32/45+t*(4642/4725)))))),e=e*t,this.cgb[1]=e*(7/3+t*(-8/5+t*(-227/45+t*(2704/315+t*(2323/945))))),this.cbg[1]=e*(5/3+t*(-16/15+t*(-13/9+t*(904/315+t*(-1522/945))))),e=e*t,this.cgb[2]=e*(56/15+t*(-136/35+t*(-1262/105+t*(73814/2835)))),this.cbg[2]=e*(-26/15+t*(34/21+t*(8/5+t*(-12686/2835)))),e=e*t,this.cgb[3]=e*(4279/630+t*(-332/35+t*(-399572/14175))),this.cbg[3]=e*(1237/630+t*(-12/5+t*(-24832/14175))),e=e*t,this.cgb[4]=e*(4174/315+t*(-144838/6237)),this.cbg[4]=e*(-734/315+t*(109598/31185)),e=e*t,this.cgb[5]=e*(601676/22275),this.cbg[5]=e*(444337/155925),e=Math.pow(t,2),this.Qn=this.k0/(1+t)*(1+e*(1/4+e*(1/64+e/256))),this.utg[0]=t*(-.5+t*(2/3+t*(-37/96+t*(1/360+t*(81/512+t*(-96199/604800)))))),this.gtu[0]=t*(.5+t*(-2/3+t*(5/16+t*(41/180+t*(-127/288+t*(7891/37800)))))),this.utg[1]=e*(-1/48+t*(-1/15+t*(437/1440+t*(-46/105+t*(1118711/3870720))))),this.gtu[1]=e*(13/48+t*(-3/5+t*(557/1440+t*(281/630+t*(-1983433/1935360))))),e=e*t,this.utg[2]=e*(-17/480+t*(37/840+t*(209/4480+t*(-5569/90720)))),this.gtu[2]=e*(61/240+t*(-103/140+t*(15061/26880+t*(167603/181440)))),e=e*t,this.utg[3]=e*(-4397/161280+t*(11/504+t*(830251/7257600))),this.gtu[3]=e*(49561/161280+t*(-179/168+t*(6601661/7257600))),e=e*t,this.utg[4]=e*(-4583/161280+t*(108847/3991680)),this.gtu[4]=e*(34729/80640+t*(-3418889/1995840)),e=e*t,this.utg[5]=e*(-20648693/638668800),this.gtu[5]=e*(212378941/319334400);var n=Hl(this.cbg,this.lat0);this.Zb=-this.Qn*(n+ZM(this.gtu,2*n))}function jM(i){var t=at(i.x-this.long0,this.over),e=i.y;e=Hl(this.cbg,e);var n=Math.sin(e),s=Math.cos(e),a=Math.sin(t),r=Math.cos(t);e=Math.atan2(n,r*s),t=Math.atan2(a*s,Ke(n,s*r)),t=KM(Math.tan(t));var o=Ku(this.gtu,2*e,2*t);e=e+o[0],t=t+o[1];var l,h;return Math.abs(t)<=2.623395162778?(l=this.a*(this.Qn*t)+this.x0,h=this.a*(this.Qn*e+this.Zb)+this.y0):(l=1/0,h=1/0),i.x=l,i.y=h,i}function tx(i){var t=(i.x-this.x0)*(1/this.a),e=(i.y-this.y0)*(1/this.a);e=(e-this.Zb)/this.Qn,t=t/this.Qn;var n,s;if(Math.abs(t)<=2.623395162778){var a=Ku(this.utg,2*e,2*t);e=e+a[0],t=t+a[1],t=Math.atan($u(t));var r=Math.sin(e),o=Math.cos(e),l=Math.sin(t),h=Math.cos(t);e=Math.atan2(r*h,Ke(l,h*o)),t=Math.atan2(l,h*o),n=at(t+this.long0,this.over),s=Hl(this.cgb,e)}else n=1/0,s=1/0;return i.x=n,i.y=s,i}var ex=["Extended_Transverse_Mercator","Extended Transverse Mercator","etmerc","Transverse_Mercator","Transverse Mercator","Gauss Kruger","Gauss_Kruger","tmerc"];const Ya={init:QM,forward:jM,inverse:tx,names:ex};function ix(i,t){if(i===void 0){if(i=Math.floor((at(t)+Math.PI)*30/Math.PI)+1,i<0)return 0;if(i>60)return 60}return i}var nx="etmerc";function sx(){var i=ix(this.zone,this.long0);if(i===void 0)throw new Error("unknown utm zone");this.lat0=0,this.long0=(6*Math.abs(i)-183)*he,this.x0=5e5,this.y0=this.utmSouth?1e7:0,this.k0=.9996,Ya.init.apply(this),this.forward=Ya.forward,this.inverse=Ya.inverse}var ax=["Universal Transverse Mercator System","utm"];const rx={init:sx,names:ax,dependsOn:nx};function Vl(i,t){return Math.pow((1-i)/(1+i),t)}var ox=20;function lx(){var i=Math.sin(this.lat0),t=Math.cos(this.lat0);t*=t,this.rc=Math.sqrt(1-this.es)/(1-this.es*i*i),this.C=Math.sqrt(1+this.es*t*t/(1-this.es)),this.phic0=Math.asin(i/this.C),this.ratexp=.5*this.C*this.e,this.K=Math.tan(.5*this.phic0+Zt)/(Math.pow(Math.tan(.5*this.lat0+Zt),this.C)*Vl(this.e*i,this.ratexp))}function hx(i){var t=i.x,e=i.y;return i.y=2*Math.atan(this.K*Math.pow(Math.tan(.5*e+Zt),this.C)*Vl(this.e*Math.sin(e),this.ratexp))-j,i.x=this.C*t,i}function cx(i){for(var t=1e-14,e=i.x/this.C,n=i.y,s=Math.pow(Math.tan(.5*n+Zt)/this.K,1/this.C),a=ox;a>0&&(n=2*Math.atan(s*Vl(this.e*Math.sin(i.y),-.5*this.e))-j,!(Math.abs(n-i.y)<t));--a)i.y=n;return a?(i.x=e,i.y=n,i):null}const Wl={init:lx,forward:hx,inverse:cx};function ux(){Wl.init.apply(this),this.rc&&(this.sinc0=Math.sin(this.phic0),this.cosc0=Math.cos(this.phic0),this.R2=2*this.rc,this.title||(this.title="Oblique Stereographic Alternative"))}function fx(i){var t,e,n,s;return i.x=at(i.x-this.long0,this.over),Wl.forward.apply(this,[i]),t=Math.sin(i.y),e=Math.cos(i.y),n=Math.cos(i.x),s=this.k0*this.R2/(1+this.sinc0*t+this.cosc0*e*n),i.x=s*e*Math.sin(i.x),i.y=s*(this.cosc0*t-this.sinc0*e*n),i.x=this.a*i.x+this.x0,i.y=this.a*i.y+this.y0,i}function dx(i){var t,e,n,s,a;if(i.x=(i.x-this.x0)/this.a,i.y=(i.y-this.y0)/this.a,i.x/=this.k0,i.y/=this.k0,a=Ke(i.x,i.y)){var r=2*Math.atan2(a,this.R2);t=Math.sin(r),e=Math.cos(r),s=Math.asin(e*this.sinc0+i.y*t*this.cosc0/a),n=Math.atan2(i.x*t,a*this.cosc0*e-i.y*this.sinc0*t)}else s=this.phic0,n=0;return i.x=n,i.y=s,Wl.inverse.apply(this,[i]),i.x=at(i.x+this.long0,this.over),i}var px=["Stereographic_North_Pole","Oblique_Stereographic","sterea","Oblique Stereographic Alternative","Double_Stereographic"];const mx={init:ux,forward:fx,inverse:dx,names:px};function Xl(i,t,e){return t*=e,Math.tan(.5*(j+i))*Math.pow((1-t)/(1+t),.5*e)}function _x(){this.x0=this.x0||0,this.y0=this.y0||0,this.lat0=this.lat0||0,this.long0=this.long0||0,this.coslat0=Math.cos(this.lat0),this.sinlat0=Math.sin(this.lat0),this.sphere?!isNaN(this.lat_ts)&&Math.abs(this.coslat0)<=nt&&(this.k0=.5*(1+js(this.lat0)*Math.sin(this.lat_ts))):(Math.abs(this.coslat0)<=nt&&(this.lat0>0?this.con=1:this.con=-1),this.cons=Math.sqrt(Math.pow(1+this.e,1+this.e)*Math.pow(1-this.e,1-this.e)),!isNaN(this.lat_ts)&&Math.abs(this.coslat0)<=nt&&Math.abs(Math.cos(this.lat_ts))>nt&&(this.k0=.5*this.cons*Ni(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts))/_i(this.e,this.con*this.lat_ts,this.con*Math.sin(this.lat_ts))),this.ms1=Ni(this.e,this.sinlat0,this.coslat0),this.X0=2*Math.atan(Xl(this.lat0,this.sinlat0,this.e))-j,this.cosX0=Math.cos(this.X0),this.sinX0=Math.sin(this.X0))}function gx(i){var t=i.x,e=i.y,n=Math.sin(e),s=Math.cos(e),a,r,o,l,h,f,u=at(t-this.long0,this.over);return Math.abs(Math.abs(t-this.long0)-Math.PI)<=nt&&Math.abs(e+this.lat0)<=nt?(i.x=NaN,i.y=NaN,i):this.sphere?(a=2*this.k0/(1+this.sinlat0*n+this.coslat0*s*Math.cos(u)),i.x=this.a*a*s*Math.sin(u)+this.x0,i.y=this.a*a*(this.coslat0*n-this.sinlat0*s*Math.cos(u))+this.y0,i):(r=2*Math.atan(Xl(e,n,this.e))-j,l=Math.cos(r),o=Math.sin(r),Math.abs(this.coslat0)<=nt?(h=_i(this.e,e*this.con,this.con*n),f=2*this.a*this.k0*h/this.cons,i.x=this.x0+f*Math.sin(t-this.long0),i.y=this.y0-this.con*f*Math.cos(t-this.long0),i):(Math.abs(this.sinlat0)<nt?(a=2*this.a*this.k0/(1+l*Math.cos(u)),i.y=a*o):(a=2*this.a*this.k0*this.ms1/(this.cosX0*(1+this.sinX0*o+this.cosX0*l*Math.cos(u))),i.y=a*(this.cosX0*o-this.sinX0*l*Math.cos(u))+this.y0),i.x=a*l*Math.sin(u)+this.x0,i))}function vx(i){i.x-=this.x0,i.y-=this.y0;var t,e,n,s,a,r=Math.sqrt(i.x*i.x+i.y*i.y);if(this.sphere){var o=2*Math.atan(r/(2*this.a*this.k0));return t=this.long0,e=this.lat0,r<=nt?(i.x=t,i.y=e,i):(e=Math.asin(Math.cos(o)*this.sinlat0+i.y*Math.sin(o)*this.coslat0/r),Math.abs(this.coslat0)<nt?this.lat0>0?t=at(this.long0+Math.atan2(i.x,-1*i.y),this.over):t=at(this.long0+Math.atan2(i.x,i.y),this.over):t=at(this.long0+Math.atan2(i.x*Math.sin(o),r*this.coslat0*Math.cos(o)-i.y*this.sinlat0*Math.sin(o)),this.over),i.x=t,i.y=e,i)}else if(Math.abs(this.coslat0)<=nt){if(r<=nt)return e=this.lat0,t=this.long0,i.x=t,i.y=e,i;i.x*=this.con,i.y*=this.con,n=r*this.cons/(2*this.a*this.k0),e=this.con*Ks(this.e,n),t=this.con*at(this.con*this.long0+Math.atan2(i.x,-1*i.y),this.over)}else s=2*Math.atan(r*this.cosX0/(2*this.a*this.k0*this.ms1)),t=this.long0,r<=nt?a=this.X0:(a=Math.asin(Math.cos(s)*this.sinX0+i.y*Math.sin(s)*this.cosX0/r),t=at(this.long0+Math.atan2(i.x*Math.sin(s),r*this.cosX0*Math.cos(s)-i.y*this.sinX0*Math.sin(s)),this.over)),e=-1*Ks(this.e,Math.tan(.5*(j+a)));return i.x=t,i.y=e,i}var Mx=["stere","Stereographic_South_Pole","Polar_Stereographic_variant_A","Polar_Stereographic_variant_B","Polar_Stereographic"];const xx={init:_x,forward:gx,inverse:vx,names:Mx,ssfn_:Xl};function Sx(){this.k0||(this.k0=1);var i=this.lat0;this.lambda0=this.long0;var t=Math.sin(i),e=this.a,n=this.rf,s=1/n,a=2*s-Math.pow(s,2),r=this.e=Math.sqrt(a);this.R=this.k0*e*Math.sqrt(1-a)/(1-a*Math.pow(t,2)),this.alpha=Math.sqrt(1+a/(1-a)*Math.pow(Math.cos(i),4)),this.b0=Math.asin(t/this.alpha);var o=Math.log(Math.tan(Math.PI/4+this.b0/2)),l=Math.log(Math.tan(Math.PI/4+i/2)),h=Math.log((1+r*t)/(1-r*t));this.K=o-this.alpha*l+this.alpha*r/2*h}function yx(i){var t=Math.log(Math.tan(Math.PI/4-i.y/2)),e=this.e/2*Math.log((1+this.e*Math.sin(i.y))/(1-this.e*Math.sin(i.y))),n=-this.alpha*(t+e)+this.K,s=2*(Math.atan(Math.exp(n))-Math.PI/4),a=this.alpha*(i.x-this.lambda0),r=Math.atan(Math.sin(a)/(Math.sin(this.b0)*Math.tan(s)+Math.cos(this.b0)*Math.cos(a))),o=Math.asin(Math.cos(this.b0)*Math.sin(s)-Math.sin(this.b0)*Math.cos(s)*Math.cos(a));return i.y=this.R/2*Math.log((1+Math.sin(o))/(1-Math.sin(o)))+this.y0,i.x=this.R*r+this.x0,i}function Ex(i){for(var t=i.x-this.x0,e=i.y-this.y0,n=t/this.R,s=2*(Math.atan(Math.exp(e/this.R))-Math.PI/4),a=Math.asin(Math.cos(this.b0)*Math.sin(s)+Math.sin(this.b0)*Math.cos(s)*Math.cos(n)),r=Math.atan(Math.sin(n)/(Math.cos(this.b0)*Math.cos(n)-Math.sin(this.b0)*Math.tan(s))),o=this.lambda0+r/this.alpha,l=0,h=a,f=-1e3,u=0;Math.abs(h-f)>1e-7;){if(++u>20)return;l=1/this.alpha*(Math.log(Math.tan(Math.PI/4+a/2))-this.K)+this.e*Math.log(Math.tan(Math.PI/4+Math.asin(this.e*Math.sin(h))/2)),f=h,h=2*Math.atan(Math.exp(l))-Math.PI/2}return i.x=o,i.y=h,i}var bx=["somerc"];const Tx={init:Sx,forward:yx,inverse:Ex,names:bx};var es=1e-7;function wx(i){var t=["Hotine_Oblique_Mercator","Hotine_Oblique_Mercator_variant_A","Hotine_Oblique_Mercator_Azimuth_Natural_Origin"],e=typeof i.projName=="object"?Object.keys(i.projName)[0]:i.projName;return"no_uoff"in i||"no_off"in i||t.indexOf(e)!==-1||t.indexOf(Gu(e))!==-1}function Ax(){var i,t,e,n,s,a,r,o,l,h,f=0,u,c=0,d=0,_=0,M=0,m=0,p=0;this.k0||(this.k0=1),this.no_off=wx(this),this.no_rot="no_rot"in this;var b=!1;"alpha"in this&&(b=!0);var A=!1;if("rectified_grid_angle"in this&&(A=!0),b&&(p=this.alpha),A&&(f=this.rectified_grid_angle,b||(p=0,b=!0)),b||A)c=this.longc;else if(d=this.long1,M=this.lat1,_=this.long2,m=this.lat2,Math.abs(M-m)<=es||(i=Math.abs(M))<=es||Math.abs(i-j)<=es||Math.abs(Math.abs(this.lat0)-j)<=es||Math.abs(Math.abs(m)-j)<=es)throw new Error;var S=1-this.es;t=Math.sqrt(S),Math.abs(this.lat0)>nt?(o=Math.sin(this.lat0),e=Math.cos(this.lat0),i=1-this.es*o*o,this.B=e*e,this.B=Math.sqrt(1+this.es*this.B*this.B/S),this.A=this.B*this.k0*t/i,n=this.B*t/(e*Math.sqrt(i)),s=n*n-1,s<=0?s=0:(s=Math.sqrt(s),this.lat0<0&&(s=-s)),this.E=s+=n,this.E*=Math.pow(_i(this.e,this.lat0,o),this.B)):(this.B=1/t,this.A=this.k0,this.E=n=s=1),b||A?(b?(u=Math.asin(Math.sin(p)/n),A||(f=p)):(u=f,p=Math.asin(n*Math.sin(u))),this.lam0=c-Math.asin(.5*(s-1/s)*Math.tan(u))/this.B):(a=Math.pow(_i(this.e,M,Math.sin(M)),this.B),r=Math.pow(_i(this.e,m,Math.sin(m)),this.B),s=this.E/a,l=(r-a)/(r+a),h=this.E*this.E,h=(h-r*a)/(h+r*a),i=d-_,i<-Math.PI?_-=Ys:i>Math.PI&&(_+=Ys),this.lam0=at(.5*(d+_)-Math.atan(h*Math.tan(.5*this.B*(d-_))/l)/this.B,this.over),u=Math.atan(2*Math.sin(this.B*at(d-this.lam0,this.over))/(s-1/s)),f=p=Math.asin(n*Math.sin(u))),this.singam=Math.sin(u),this.cosgam=Math.cos(u),this.sinrot=Math.sin(f),this.cosrot=Math.cos(f),this.rB=1/this.B,this.ArB=this.A*this.rB,this.BrA=1/this.ArB,this.no_off?this.u_0=0:(this.u_0=Math.abs(this.ArB*Math.atan(Math.sqrt(n*n-1)/Math.cos(p))),this.lat0<0&&(this.u_0=-this.u_0)),s=.5*u,this.v_pole_n=this.ArB*Math.log(Math.tan(Zt-s)),this.v_pole_s=this.ArB*Math.log(Math.tan(Zt+s))}function Px(i){var t={},e,n,s,a,r,o,l,h;if(i.x=i.x-this.lam0,Math.abs(Math.abs(i.y)-j)>nt){if(r=this.E/Math.pow(_i(this.e,i.y,Math.sin(i.y)),this.B),o=1/r,e=.5*(r-o),n=.5*(r+o),a=Math.sin(this.B*i.x),s=(e*this.singam-a*this.cosgam)/n,Math.abs(Math.abs(s)-1)<nt)throw new Error;h=.5*this.ArB*Math.log((1-s)/(1+s)),o=Math.cos(this.B*i.x),Math.abs(o)<es?l=this.A*i.x:l=this.ArB*Math.atan2(e*this.cosgam+a*this.singam,o)}else h=i.y>0?this.v_pole_n:this.v_pole_s,l=this.ArB*i.y;return this.no_rot?(t.x=l,t.y=h):(l-=this.u_0,t.x=h*this.cosrot+l*this.sinrot,t.y=l*this.cosrot-h*this.sinrot),t.x=this.a*t.x+this.x0,t.y=this.a*t.y+this.y0,t}function Rx(i){var t,e,n,s,a,r,o,l={};if(i.x=(i.x-this.x0)*(1/this.a),i.y=(i.y-this.y0)*(1/this.a),this.no_rot?(e=i.y,t=i.x):(e=i.x*this.cosrot-i.y*this.sinrot,t=i.y*this.cosrot+i.x*this.sinrot+this.u_0),n=Math.exp(-this.BrA*e),s=.5*(n-1/n),a=.5*(n+1/n),r=Math.sin(this.BrA*t),o=(r*this.cosgam+s*this.singam)/a,Math.abs(Math.abs(o)-1)<nt)l.x=0,l.y=o<0?-j:j;else{if(l.y=this.E/Math.sqrt((1+o)/(1-o)),l.y=Ks(this.e,Math.pow(l.y,1/this.B)),l.y===1/0)throw new Error;l.x=-this.rB*Math.atan2(s*this.cosgam-r*this.singam,Math.cos(this.BrA*t))}return l.x+=this.lam0,l}var Cx=["Hotine_Oblique_Mercator","Hotine Oblique Mercator","Hotine_Oblique_Mercator_variant_A","Hotine_Oblique_Mercator_Variant_B","Hotine_Oblique_Mercator_Azimuth_Natural_Origin","Hotine_Oblique_Mercator_Two_Point_Natural_Origin","Hotine_Oblique_Mercator_Azimuth_Center","Oblique_Mercator","omerc"];const Ix={init:Ax,forward:Px,inverse:Rx,names:Cx};function Lx(){if(this.lat2||(this.lat2=this.lat1),this.k0||(this.k0=1),this.x0=this.x0||0,this.y0=this.y0||0,this.long0=this.long0||0,!(Math.abs(this.lat1+this.lat2)<nt)){var i=this.b/this.a;this.e=Math.sqrt(1-i*i);var t=Math.sin(this.lat1),e=Math.cos(this.lat1),n=Ni(this.e,t,e),s=_i(this.e,this.lat1,t),a=Math.sin(this.lat2),r=Math.cos(this.lat2),o=Ni(this.e,a,r),l=_i(this.e,this.lat2,a),h=_i(this.e,this.lat0,Math.sin(this.lat0));Math.abs(this.lat1-this.lat2)>nt?this.ns=Math.log(n/o)/Math.log(s/l):this.ns=t,isNaN(this.ns)&&(this.ns=t),this.f0=n/(this.ns*Math.pow(s,this.ns)),this.rh=Math.abs(Math.abs(this.lat0)-j)<nt?0:this.a*this.f0*Math.pow(h,this.ns),this.title||(this.title="Lambert Conformal Conic")}}function Nx(i){var t=i.x,e=i.y;Math.abs(2*Math.abs(e)-Math.PI)<=nt&&(e=js(e)*(j-2*nt));var n=Math.abs(Math.abs(e)-j),s,a;if(n>nt)s=_i(this.e,e,Math.sin(e)),a=this.a*this.f0*Math.pow(s,this.ns);else{if(n=e*this.ns,n<=0)return null;a=0}var r=this.ns*at(t-this.long0,this.over);return i.x=this.k0*(a*Math.sin(r))+this.x0,i.y=this.k0*(this.rh-a*Math.cos(r))+this.y0,i}function Dx(i){var t,e,n,s,a,r=(i.x-this.x0)/this.k0,o=this.rh-(i.y-this.y0)/this.k0;this.ns>0?(t=Math.sqrt(r*r+o*o),e=1):(t=-Math.sqrt(r*r+o*o),e=-1);var l=0;if(t!==0&&(l=Math.atan2(e*r,e*o)),t!==0||this.ns>0){if(e=1/this.ns,n=Math.pow(t/(this.a*this.f0),e),s=Ks(this.e,n),s===-9999)return null}else s=-j;return a=at(l/this.ns+this.long0,this.over),i.x=a,i.y=s,i}var Ux=["Lambert Tangential Conformal Conic Projection","Lambert_Conformal_Conic","Lambert_Conformal_Conic_1SP","Lambert_Conformal_Conic_2SP","lcc","Lambert Conic Conformal (1SP)","Lambert Conic Conformal (2SP)"];const Fx={init:Lx,forward:Nx,inverse:Dx,names:Ux};function Ox(){this.a=6377397155e-3,this.es=.006674372230614,this.e=Math.sqrt(this.es),this.lat0||(this.lat0=.863937979737193),this.long0||(this.long0=.7417649320975901-.308341501185665),this.k0||(this.k0=.9999),this.s45=.785398163397448,this.s90=2*this.s45,this.fi0=this.lat0,this.e2=this.es,this.e=Math.sqrt(this.e2),this.alfa=Math.sqrt(1+this.e2*Math.pow(Math.cos(this.fi0),4)/(1-this.e2)),this.uq=1.04216856380474,this.u0=Math.asin(Math.sin(this.fi0)/this.alfa),this.g=Math.pow((1+this.e*Math.sin(this.fi0))/(1-this.e*Math.sin(this.fi0)),this.alfa*this.e/2),this.k=Math.tan(this.u0/2+this.s45)/Math.pow(Math.tan(this.fi0/2+this.s45),this.alfa)*this.g,this.k1=this.k0,this.n0=this.a*Math.sqrt(1-this.e2)/(1-this.e2*Math.pow(Math.sin(this.fi0),2)),this.s0=1.37008346281555,this.n=Math.sin(this.s0),this.ro0=this.k1*this.n0/Math.tan(this.s0),this.ad=this.s90-this.uq}function Gx(i){var t,e,n,s,a,r,o,l=i.x,h=i.y,f=at(l-this.long0,this.over);return t=Math.pow((1+this.e*Math.sin(h))/(1-this.e*Math.sin(h)),this.alfa*this.e/2),e=2*(Math.atan(this.k*Math.pow(Math.tan(h/2+this.s45),this.alfa)/t)-this.s45),n=-f*this.alfa,s=Math.asin(Math.cos(this.ad)*Math.sin(e)+Math.sin(this.ad)*Math.cos(e)*Math.cos(n)),a=Math.asin(Math.cos(e)*Math.sin(n)/Math.cos(s)),r=this.n*a,o=this.ro0*Math.pow(Math.tan(this.s0/2+this.s45),this.n)/Math.pow(Math.tan(s/2+this.s45),this.n),i.y=o*Math.cos(r)/1,i.x=o*Math.sin(r)/1,this.czech||(i.y*=-1,i.x*=-1),i}function Bx(i){var t,e,n,s,a,r,o,l,h=i.x;i.x=i.y,i.y=h,this.czech||(i.y*=-1,i.x*=-1),r=Math.sqrt(i.x*i.x+i.y*i.y),a=Math.atan2(i.y,i.x),s=a/Math.sin(this.s0),n=2*(Math.atan(Math.pow(this.ro0/r,1/this.n)*Math.tan(this.s0/2+this.s45))-this.s45),t=Math.asin(Math.cos(this.ad)*Math.sin(n)-Math.sin(this.ad)*Math.cos(n)*Math.cos(s)),e=Math.asin(Math.cos(n)*Math.sin(s)/Math.cos(t)),i.x=this.long0-e/this.alfa,o=t,l=0;var f=0;do i.y=2*(Math.atan(Math.pow(this.k,-1/this.alfa)*Math.pow(Math.tan(t/2+this.s45),1/this.alfa)*Math.pow((1+this.e*Math.sin(o))/(1-this.e*Math.sin(o)),this.e/2))-this.s45),Math.abs(o-i.y)<1e-10&&(l=1),o=i.y,f+=1;while(l===0&&f<15);return f>=15?null:i}var zx=["Krovak","Krovak Modified","Krovak (North Orientated)","Krovak Modified (North Orientated)","krovak"];const kx={init:Ox,forward:Gx,inverse:Bx,names:zx};function Ve(i,t,e,n,s){return i*s-t*Math.sin(2*s)+e*Math.sin(4*s)-n*Math.sin(6*s)}function ta(i){return 1-.25*i*(1+i/16*(3+1.25*i))}function ea(i){return .375*i*(1+.25*i*(1+.46875*i))}function ia(i){return .05859375*i*i*(1+.75*i)}function na(i){return i*i*i*(35/3072)}function ql(i,t,e){var n=t*e;return i/Math.sqrt(1-n*n)}function gn(i){return Math.abs(i)<j?i:i-js(i)*Math.PI}function lr(i,t,e,n,s){var a,r;a=i/t;for(var o=0;o<15;o++)if(r=(i-(t*a-e*Math.sin(2*a)+n*Math.sin(4*a)-s*Math.sin(6*a)))/(t-2*e*Math.cos(2*a)+4*n*Math.cos(4*a)-6*s*Math.cos(6*a)),a+=r,Math.abs(r)<=1e-10)return a;return NaN}function Hx(){this.sphere||(this.e0=ta(this.es),this.e1=ea(this.es),this.e2=ia(this.es),this.e3=na(this.es),this.ml0=this.a*Ve(this.e0,this.e1,this.e2,this.e3,this.lat0))}function Vx(i){var t,e,n=i.x,s=i.y;if(n=at(n-this.long0,this.over),this.sphere)t=this.a*Math.asin(Math.cos(s)*Math.sin(n)),e=this.a*(Math.atan2(Math.tan(s),Math.cos(n))-this.lat0);else{var a=Math.sin(s),r=Math.cos(s),o=ql(this.a,this.e,a),l=Math.tan(s)*Math.tan(s),h=n*Math.cos(s),f=h*h,u=this.es*r*r/(1-this.es),c=this.a*Ve(this.e0,this.e1,this.e2,this.e3,s);t=o*h*(1-f*l*(1/6-(8-l+8*u)*f/120)),e=c-this.ml0+o*a/r*f*(.5+(5-l+6*u)*f/24)}return i.x=t+this.x0,i.y=e+this.y0,i}function Wx(i){i.x-=this.x0,i.y-=this.y0;var t=i.x/this.a,e=i.y/this.a,n,s;if(this.sphere){var a=e+this.lat0;n=Math.asin(Math.sin(a)*Math.cos(t)),s=Math.atan2(Math.tan(t),Math.cos(a))}else{var r=this.ml0/this.a+e,o=lr(r,this.e0,this.e1,this.e2,this.e3);if(Math.abs(Math.abs(o)-j)<=nt)return i.x=this.long0,i.y=j,e<0&&(i.y*=-1),i;var l=ql(this.a,this.e,Math.sin(o)),h=l*l*l/this.a/this.a*(1-this.es),f=Math.pow(Math.tan(o),2),u=t*this.a/l,c=u*u;n=o-l*Math.tan(o)/h*u*u*(.5-(1+3*f)*u*u/24),s=u*(1-c*(f/3+(1+3*f)*f*c/15))/Math.cos(o)}return i.x=at(s+this.long0,this.over),i.y=gn(n),i}var Xx=["Cassini","Cassini_Soldner","cass"];const qx={init:Hx,forward:Vx,inverse:Wx,names:Xx};function Ci(i,t){var e;return i>1e-7?(e=i*t,(1-i*i)*(t/(1-e*e)-.5/i*Math.log((1-e)/(1+e)))):2*t}var Yx=.3333333333333333,$x=.17222222222222222,Kx=.10257936507936508,Zx=.06388888888888888,Jx=.0664021164021164,Qx=.016415012942191543;function Zu(i){var t,e=[];return e[0]=i*Yx,t=i*i,e[0]+=t*$x,e[1]=t*Zx,t*=i,e[0]+=t*Kx,e[1]+=t*Jx,e[2]=t*Qx,e}function Ju(i,t){var e=i+i;return i+t[0]*Math.sin(e)+t[1]*Math.sin(e+e)+t[2]*Math.sin(e+e+e)}var fl=1,dl=2,pl=3,$a=4;function jx(){var i=Math.abs(this.lat0);if(Math.abs(i-j)<nt?this.mode=this.lat0<0?fl:dl:Math.abs(i)<nt?this.mode=pl:this.mode=$a,this.es>0){var t;switch(this.qp=Ci(this.e,1),this.mmf=.5/(1-this.es),this.apa=Zu(this.es),this.mode){case dl:this.dd=1;break;case fl:this.dd=1;break;case pl:this.rq=Math.sqrt(.5*this.qp),this.dd=1/this.rq,this.xmf=1,this.ymf=.5*this.qp;break;case $a:this.rq=Math.sqrt(.5*this.qp),t=Math.sin(this.lat0),this.sinb1=Ci(this.e,t)/this.qp,this.cosb1=Math.sqrt(1-this.sinb1*this.sinb1),this.dd=Math.cos(this.lat0)/(Math.sqrt(1-this.es*t*t)*this.rq*this.cosb1),this.ymf=(this.xmf=this.rq)/this.dd,this.xmf*=this.dd;break}}else this.mode===$a&&(this.sinph0=Math.sin(this.lat0),this.cosph0=Math.cos(this.lat0))}function t1(i){var t,e,n,s,a,r,o,l,h,f,u=i.x,c=i.y;if(u=at(u-this.long0,this.over),this.sphere){if(a=Math.sin(c),f=Math.cos(c),n=Math.cos(u),this.mode===this.OBLIQ||this.mode===this.EQUIT){if(e=this.mode===this.EQUIT?1+f*n:1+this.sinph0*a+this.cosph0*f*n,e<=nt)return null;e=Math.sqrt(2/e),t=e*f*Math.sin(u),e*=this.mode===this.EQUIT?a:this.cosph0*a-this.sinph0*f*n}else if(this.mode===this.N_POLE||this.mode===this.S_POLE){if(this.mode===this.N_POLE&&(n=-n),Math.abs(c+this.lat0)<nt)return null;e=Zt-c*.5,e=2*(this.mode===this.S_POLE?Math.cos(e):Math.sin(e)),t=e*Math.sin(u),e*=n}}else{switch(o=0,l=0,h=0,n=Math.cos(u),s=Math.sin(u),a=Math.sin(c),r=Ci(this.e,a),(this.mode===this.OBLIQ||this.mode===this.EQUIT)&&(o=r/this.qp,l=Math.sqrt(1-o*o)),this.mode){case this.OBLIQ:h=1+this.sinb1*o+this.cosb1*l*n;break;case this.EQUIT:h=1+l*n;break;case this.N_POLE:h=j+c,r=this.qp-r;break;case this.S_POLE:h=c-j,r=this.qp+r;break}if(Math.abs(h)<nt)return null;switch(this.mode){case this.OBLIQ:case this.EQUIT:h=Math.sqrt(2/h),this.mode===this.OBLIQ?e=this.ymf*h*(this.cosb1*o-this.sinb1*l*n):e=(h=Math.sqrt(2/(1+l*n)))*o*this.ymf,t=this.xmf*h*l*s;break;case this.N_POLE:case this.S_POLE:r>=0?(t=(h=Math.sqrt(r))*s,e=n*(this.mode===this.S_POLE?h:-h)):t=e=0;break}}return i.x=this.a*t+this.x0,i.y=this.a*e+this.y0,i}function e1(i){i.x-=this.x0,i.y-=this.y0;var t=i.x/this.a,e=i.y/this.a,n,s,a,r,o,l,h;if(this.sphere){var f=0,u,c=0;if(u=Math.sqrt(t*t+e*e),s=u*.5,s>1)return null;switch(s=2*Math.asin(s),(this.mode===this.OBLIQ||this.mode===this.EQUIT)&&(c=Math.sin(s),f=Math.cos(s)),this.mode){case this.EQUIT:s=Math.abs(u)<=nt?0:Math.asin(e*c/u),t*=c,e=f*u;break;case this.OBLIQ:s=Math.abs(u)<=nt?this.lat0:Math.asin(f*this.sinph0+e*c*this.cosph0/u),t*=c*this.cosph0,e=(f-Math.sin(s)*this.sinph0)*u;break;case this.N_POLE:e=-e,s=j-s;break;case this.S_POLE:s-=j;break}n=e===0&&(this.mode===this.EQUIT||this.mode===this.OBLIQ)?0:Math.atan2(t,e)}else{if(h=0,this.mode===this.OBLIQ||this.mode===this.EQUIT){if(t/=this.dd,e*=this.dd,l=Math.sqrt(t*t+e*e),l<nt)return i.x=this.long0,i.y=this.lat0,i;r=2*Math.asin(.5*l/this.rq),a=Math.cos(r),t*=r=Math.sin(r),this.mode===this.OBLIQ?(h=a*this.sinb1+e*r*this.cosb1/l,o=this.qp*h,e=l*this.cosb1*a-e*this.sinb1*r):(h=e*r/l,o=this.qp*h,e=l*a)}else if(this.mode===this.N_POLE||this.mode===this.S_POLE){if(this.mode===this.N_POLE&&(e=-e),o=t*t+e*e,!o)return i.x=this.long0,i.y=this.lat0,i;h=1-o/this.qp,this.mode===this.S_POLE&&(h=-h)}n=Math.atan2(t,e),s=Ju(Math.asin(h),this.apa)}return i.x=at(this.long0+n,this.over),i.y=s,i}var i1=["Lambert Azimuthal Equal Area","Lambert_Azimuthal_Equal_Area","laea"];const n1={init:jx,forward:t1,inverse:e1,names:i1,S_POLE:fl,N_POLE:dl,EQUIT:pl,OBLIQ:$a};function mn(i){return Math.abs(i)>1&&(i=i>1?1:-1),Math.asin(i)}function s1(){Math.abs(this.lat1+this.lat2)<nt||(this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e3=Math.sqrt(this.es),this.sin_po=Math.sin(this.lat1),this.cos_po=Math.cos(this.lat1),this.t1=this.sin_po,this.con=this.sin_po,this.ms1=Ni(this.e3,this.sin_po,this.cos_po),this.qs1=Ci(this.e3,this.sin_po),this.sin_po=Math.sin(this.lat2),this.cos_po=Math.cos(this.lat2),this.t2=this.sin_po,this.ms2=Ni(this.e3,this.sin_po,this.cos_po),this.qs2=Ci(this.e3,this.sin_po),this.sin_po=Math.sin(this.lat0),this.cos_po=Math.cos(this.lat0),this.t3=this.sin_po,this.qs0=Ci(this.e3,this.sin_po),Math.abs(this.lat1-this.lat2)>nt?this.ns0=(this.ms1*this.ms1-this.ms2*this.ms2)/(this.qs2-this.qs1):this.ns0=this.con,this.c=this.ms1*this.ms1+this.ns0*this.qs1,this.rh=this.a*Math.sqrt(this.c-this.ns0*this.qs0)/this.ns0)}function a1(i){var t=i.x,e=i.y;this.sin_phi=Math.sin(e),this.cos_phi=Math.cos(e);var n=Ci(this.e3,this.sin_phi),s=this.a*Math.sqrt(this.c-this.ns0*n)/this.ns0,a=this.ns0*at(t-this.long0,this.over),r=s*Math.sin(a)+this.x0,o=this.rh-s*Math.cos(a)+this.y0;return i.x=r,i.y=o,i}function r1(i){var t,e,n,s,a,r;return i.x-=this.x0,i.y=this.rh-i.y+this.y0,this.ns0>=0?(t=Math.sqrt(i.x*i.x+i.y*i.y),n=1):(t=-Math.sqrt(i.x*i.x+i.y*i.y),n=-1),s=0,t!==0&&(s=Math.atan2(n*i.x,n*i.y)),n=t*this.ns0/this.a,this.sphere?r=Math.asin((this.c-n*n)/(2*this.ns0)):(e=(this.c-n*n)/this.ns0,r=this.phi1z(this.e3,e)),a=at(s/this.ns0+this.long0,this.over),i.x=a,i.y=r,i}function o1(i,t){var e,n,s,a,r,o=mn(.5*t);if(i<nt)return o;for(var l=i*i,h=1;h<=25;h++)if(e=Math.sin(o),n=Math.cos(o),s=i*e,a=1-s*s,r=.5*a*a/n*(t/(1-l)-e/a+.5/i*Math.log((1-s)/(1+s))),o=o+r,Math.abs(r)<=1e-7)return o;return null}var l1=["Albers_Conic_Equal_Area","Albers_Equal_Area","Albers","aea"];const h1={init:s1,forward:a1,inverse:r1,names:l1,phi1z:o1};function c1(){this.sin_p14=Math.sin(this.lat0),this.cos_p14=Math.cos(this.lat0),this.infinity_dist=1e3*this.a,this.rc=1}function u1(i){var t,e,n,s,a,r,o,l,h=i.x,f=i.y;return n=at(h-this.long0,this.over),t=Math.sin(f),e=Math.cos(f),s=Math.cos(n),r=this.sin_p14*t+this.cos_p14*e*s,a=1,r>0||Math.abs(r)<=nt?(o=this.x0+this.a*a*e*Math.sin(n)/r,l=this.y0+this.a*a*(this.cos_p14*t-this.sin_p14*e*s)/r):(o=this.x0+this.infinity_dist*e*Math.sin(n),l=this.y0+this.infinity_dist*(this.cos_p14*t-this.sin_p14*e*s)),i.x=o,i.y=l,i}function f1(i){var t,e,n,s,a,r;return i.x=(i.x-this.x0)/this.a,i.y=(i.y-this.y0)/this.a,i.x/=this.k0,i.y/=this.k0,(t=Math.sqrt(i.x*i.x+i.y*i.y))?(s=Math.atan2(t,this.rc),e=Math.sin(s),n=Math.cos(s),r=mn(n*this.sin_p14+i.y*e*this.cos_p14/t),a=Math.atan2(i.x*e,t*this.cos_p14*n-i.y*this.sin_p14*e),a=at(this.long0+a,this.over)):(r=this.phic0,a=0),i.x=a,i.y=r,i}var d1=["gnom"];const p1={init:c1,forward:u1,inverse:f1,names:d1};function m1(i,t){var e=1-(1-i*i)/(2*i)*Math.log((1-i)/(1+i));if(Math.abs(Math.abs(t)-e)<1e-6)return t<0?-1*j:j;for(var n=Math.asin(.5*t),s,a,r,o,l=0;l<30;l++)if(a=Math.sin(n),r=Math.cos(n),o=i*a,s=Math.pow(1-o*o,2)/(2*r)*(t/(1-i*i)-a/(1-o*o)+.5/i*Math.log((1-o)/(1+o))),n+=s,Math.abs(s)<=1e-10)return n;return NaN}function _1(){this.sphere||(this.k0=Ni(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts)))}function g1(i){var t=i.x,e=i.y,n,s,a=at(t-this.long0,this.over);if(this.sphere)n=this.x0+this.a*a*Math.cos(this.lat_ts),s=this.y0+this.a*Math.sin(e)/Math.cos(this.lat_ts);else{var r=Ci(this.e,Math.sin(e));n=this.x0+this.a*this.k0*a,s=this.y0+this.a*r*.5/this.k0}return i.x=n,i.y=s,i}function v1(i){i.x-=this.x0,i.y-=this.y0;var t,e;return this.sphere?(t=at(this.long0+i.x/this.a/Math.cos(this.lat_ts),this.over),e=Math.asin(i.y/this.a*Math.cos(this.lat_ts))):(e=m1(this.e,2*i.y*this.k0/this.a),t=at(this.long0+i.x/(this.a*this.k0),this.over)),i.x=t,i.y=e,i}var M1=["cea"];const x1={init:_1,forward:g1,inverse:v1,names:M1};function S1(){this.x0=this.x0||0,this.y0=this.y0||0,this.lat0=this.lat0||0,this.long0=this.long0||0,this.lat_ts=this.lat_ts||0,this.title=this.title||"Equidistant Cylindrical (Plate Carre)",this.rc=Math.cos(this.lat_ts)}function y1(i){var t=i.x,e=i.y,n=at(t-this.long0,this.over),s=gn(e-this.lat0);return i.x=this.x0+this.a*n*this.rc,i.y=this.y0+this.a*s,i}function E1(i){var t=i.x,e=i.y;return i.x=at(this.long0+(t-this.x0)/(this.a*this.rc),this.over),i.y=gn(this.lat0+(e-this.y0)/this.a),i}var b1=["Equirectangular","Equidistant_Cylindrical","Equidistant_Cylindrical_Spherical","eqc"];const T1={init:S1,forward:y1,inverse:E1,names:b1};var Uc=20;function w1(){this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e=Math.sqrt(this.es),this.e0=ta(this.es),this.e1=ea(this.es),this.e2=ia(this.es),this.e3=na(this.es),this.ml0=this.a*Ve(this.e0,this.e1,this.e2,this.e3,this.lat0)}function A1(i){var t=i.x,e=i.y,n,s,a,r=at(t-this.long0,this.over);if(a=r*Math.sin(e),this.sphere)Math.abs(e)<=nt?(n=this.a*r,s=-1*this.a*this.lat0):(n=this.a*Math.sin(a)/Math.tan(e),s=this.a*(gn(e-this.lat0)+(1-Math.cos(a))/Math.tan(e)));else if(Math.abs(e)<=nt)n=this.a*r,s=-1*this.ml0;else{var o=ql(this.a,this.e,Math.sin(e))/Math.tan(e);n=o*Math.sin(a),s=this.a*Ve(this.e0,this.e1,this.e2,this.e3,e)-this.ml0+o*(1-Math.cos(a))}return i.x=n+this.x0,i.y=s+this.y0,i}function P1(i){var t,e,n,s,a,r,o,l,h;if(n=i.x-this.x0,s=i.y-this.y0,this.sphere)if(Math.abs(s+this.a*this.lat0)<=nt)t=at(n/this.a+this.long0,this.over),e=0;else{r=this.lat0+s/this.a,o=n*n/this.a/this.a+r*r,l=r;var f;for(a=Uc;a;--a)if(f=Math.tan(l),h=-1*(r*(l*f+1)-l-.5*(l*l+o)*f)/((l-r)/f-1),l+=h,Math.abs(h)<=nt){e=l;break}t=at(this.long0+Math.asin(n*Math.tan(l)/this.a)/Math.sin(e),this.over)}else if(Math.abs(s+this.ml0)<=nt)e=0,t=at(this.long0+n/this.a,this.over);else{r=(this.ml0+s)/this.a,o=n*n/this.a/this.a+r*r,l=r;var u,c,d,_,M;for(a=Uc;a;--a)if(M=this.e*Math.sin(l),u=Math.sqrt(1-M*M)*Math.tan(l),c=this.a*Ve(this.e0,this.e1,this.e2,this.e3,l),d=this.e0-2*this.e1*Math.cos(2*l)+4*this.e2*Math.cos(4*l)-6*this.e3*Math.cos(6*l),_=c/this.a,h=(r*(u*_+1)-_-.5*u*(_*_+o))/(this.es*Math.sin(2*l)*(_*_+o-2*r*_)/(4*u)+(r-_)*(u*d-2/Math.sin(2*l))-d),l-=h,Math.abs(h)<=nt){e=l;break}u=Math.sqrt(1-this.es*Math.pow(Math.sin(e),2))*Math.tan(e),t=at(this.long0+Math.asin(n*u/this.a)/Math.sin(e),this.over)}return i.x=t,i.y=e,i}var R1=["Polyconic","American_Polyconic","poly"];const C1={init:w1,forward:A1,inverse:P1,names:R1};var I1=1;function L1(){this.A=[],this.A[1]=.6399175073,this.A[2]=-.1358797613,this.A[3]=.063294409,this.A[4]=-.02526853,this.A[5]=.0117879,this.A[6]=-.0055161,this.A[7]=.0026906,this.A[8]=-.001333,this.A[9]=67e-5,this.A[10]=-34e-5,this.B_re=[],this.B_im=[],this.B_re[1]=.7557853228,this.B_im[1]=0,this.B_re[2]=.249204646,this.B_im[2]=.003371507,this.B_re[3]=-.001541739,this.B_im[3]=.04105856,this.B_re[4]=-.10162907,this.B_im[4]=.01727609,this.B_re[5]=-.26623489,this.B_im[5]=-.36249218,this.B_re[6]=-.6870983,this.B_im[6]=-1.1651967,this.C_re=[],this.C_im=[],this.C_re[1]=1.3231270439,this.C_im[1]=0,this.C_re[2]=-.577245789,this.C_im[2]=-.007809598,this.C_re[3]=.508307513,this.C_im[3]=-.112208952,this.C_re[4]=-.15094762,this.C_im[4]=.18200602,this.C_re[5]=1.01418179,this.C_im[5]=1.64497696,this.C_re[6]=1.9660549,this.C_im[6]=2.5127645,this.D=[],this.D[1]=1.5627014243,this.D[2]=.5185406398,this.D[3]=-.03333098,this.D[4]=-.1052906,this.D[5]=-.0368594,this.D[6]=.007317,this.D[7]=.0122,this.D[8]=.00394,this.D[9]=-.0013}function N1(i){var t,e=i.x,n=i.y,s=n-this.lat0,a=e-this.long0,r=s/Gs*1e-5,o=a,l=1,h=0;for(t=1;t<=10;t++)l=l*r,h=h+this.A[t]*l;var f=h,u=o,c=1,d=0,_,M,m=0,p=0;for(t=1;t<=6;t++)_=c*f-d*u,M=d*f+c*u,c=_,d=M,m=m+this.B_re[t]*c-this.B_im[t]*d,p=p+this.B_im[t]*c+this.B_re[t]*d;return i.x=p*this.a+this.x0,i.y=m*this.a+this.y0,i}function D1(i){var t,e=i.x,n=i.y,s=e-this.x0,a=n-this.y0,r=a/this.a,o=s/this.a,l=1,h=0,f,u,c=0,d=0;for(t=1;t<=6;t++)f=l*r-h*o,u=h*r+l*o,l=f,h=u,c=c+this.C_re[t]*l-this.C_im[t]*h,d=d+this.C_im[t]*l+this.C_re[t]*h;for(var _=0;_<this.iterations;_++){var M=c,m=d,p,b,A=r,S=o;for(t=2;t<=6;t++)p=M*c-m*d,b=m*c+M*d,M=p,m=b,A=A+(t-1)*(this.B_re[t]*M-this.B_im[t]*m),S=S+(t-1)*(this.B_im[t]*M+this.B_re[t]*m);M=1,m=0;var w=this.B_re[1],y=this.B_im[1];for(t=2;t<=6;t++)p=M*c-m*d,b=m*c+M*d,M=p,m=b,w=w+t*(this.B_re[t]*M-this.B_im[t]*m),y=y+t*(this.B_im[t]*M+this.B_re[t]*m);var P=w*w+y*y;c=(A*w+S*y)/P,d=(S*w-A*y)/P}var v=c,E=d,C=1,R=0;for(t=1;t<=9;t++)C=C*v,R=R+this.D[t]*C;var D=this.lat0+R*Gs*1e5,H=this.long0+E;return i.x=H,i.y=D,i}var U1=["New_Zealand_Map_Grid","nzmg"];const F1={init:L1,forward:N1,inverse:D1,names:U1,iterations:I1};function O1(){}function G1(i){var t=i.x,e=i.y,n=at(t-this.long0,this.over),s=this.x0+this.a*n,a=this.y0+this.a*Math.log(Math.tan(Math.PI/4+e/2.5))*1.25;return i.x=s,i.y=a,i}function B1(i){i.x-=this.x0,i.y-=this.y0;var t=at(this.long0+i.x/this.a,this.over),e=2.5*(Math.atan(Math.exp(.8*i.y/this.a))-Math.PI/4);return i.x=t,i.y=e,i}var z1=["Miller_Cylindrical","mill"];const k1={init:O1,forward:G1,inverse:B1,names:z1};var H1=20;function V1(){this.long0=this.long0||0,this.sphere?(this.n=1,this.m=0,this.es=0,this.C_y=Math.sqrt((this.m+1)/this.n),this.C_x=this.C_y/(this.m+1)):this.en=zl(this.es)}function Qu(i){var t,e,n=i.x,s=i.y;if(n=at(n-this.long0,this.over),this.sphere){if(!this.m)s=this.n!==1?Math.asin(this.n*Math.sin(s)):s;else for(var a=this.n*Math.sin(s),r=H1;r;--r){var o=(this.m*s+Math.sin(s)-a)/(this.m+Math.cos(s));if(s-=o,Math.abs(o)<nt)break}t=this.a*this.C_x*n*(this.m+Math.cos(s)),e=this.a*this.C_y*s}else{var l=Math.sin(s),h=Math.cos(s);e=this.a*ys(s,l,h,this.en),t=this.a*n*h/Math.sqrt(1-this.es*l*l)}return i.x=t,i.y=e,i}function ju(i){var t,e,n,s;return i.x-=this.x0,n=i.x/this.a,i.y-=this.y0,t=i.y/this.a,this.sphere?(t/=this.C_y,n=n/(this.C_x*(this.m+Math.cos(t))),this.m?t=mn((this.m*t+Math.sin(t))/this.n):this.n!==1&&(t=mn(Math.sin(t)/this.n)),n=at(n+this.long0,this.over),t=gn(t)):(t=kl(i.y/this.a,this.es,this.en),s=Math.abs(t),s<j?(s=Math.sin(t),e=this.long0+i.x*Math.sqrt(1-this.es*s*s)/(this.a*Math.cos(t)),n=at(e,this.over)):s-nt<j&&(n=this.long0)),i.x=n,i.y=t,i}var W1=["Sinusoidal","sinu"];const X1={init:V1,forward:Qu,inverse:ju,names:W1};function q1(){this.sphere=!0,this.b=this.a,this.m=1,this.n=2.5707963267948966,this.es=0,this.C_y=Math.sqrt((this.m+1)/this.n),this.C_x=this.C_y/(this.m+1)}var Y1=Qu,$1=ju,K1=["Eckert_VI","eck6"];const Z1={init:q1,forward:Y1,inverse:$1,names:K1};function J1(){this.x0=this.x0!==void 0?this.x0:0,this.y0=this.y0!==void 0?this.y0:0,this.long0=this.long0!==void 0?this.long0:0}function Q1(i){for(var t=i.x,e=i.y,n=at(t-this.long0,this.over),s=e,a=Math.PI*Math.sin(e);;){var r=-(s+Math.sin(s)-a)/(1+Math.cos(s));if(s+=r,Math.abs(r)<nt)break}s/=2,Math.PI/2-Math.abs(e)<nt&&(n=0);var o=.900316316158*this.a*n*Math.cos(s)+this.x0,l=1.4142135623731*this.a*Math.sin(s)+this.y0;return i.x=o,i.y=l,i}function j1(i){var t,e;i.x-=this.x0,i.y-=this.y0,e=i.y/(1.4142135623731*this.a),Math.abs(e)>.999999999999&&(e=.999999999999),t=Math.asin(e);var n=at(this.long0+i.x/(.900316316158*this.a*Math.cos(t)),this.over);n<-Math.PI&&(n=-Math.PI),n>Math.PI&&(n=Math.PI),e=(2*t+Math.sin(2*t))/Math.PI,Math.abs(e)>1&&(e=1);var s=Math.asin(e);return i.x=n,i.y=s,i}var tS=["Mollweide","moll"];const eS={init:J1,forward:Q1,inverse:j1,names:tS};function iS(){Math.abs(this.lat1+this.lat2)<nt||(this.lat2=this.lat2||this.lat1,this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e=Math.sqrt(this.es),this.e0=ta(this.es),this.e1=ea(this.es),this.e2=ia(this.es),this.e3=na(this.es),this.sin_phi=Math.sin(this.lat1),this.cos_phi=Math.cos(this.lat1),this.ms1=Ni(this.e,this.sin_phi,this.cos_phi),this.ml1=Ve(this.e0,this.e1,this.e2,this.e3,this.lat1),Math.abs(this.lat1-this.lat2)<nt?this.ns=this.sin_phi:(this.sin_phi=Math.sin(this.lat2),this.cos_phi=Math.cos(this.lat2),this.ms2=Ni(this.e,this.sin_phi,this.cos_phi),this.ml2=Ve(this.e0,this.e1,this.e2,this.e3,this.lat2),this.ns=(this.ms1-this.ms2)/(this.ml2-this.ml1)),this.g=this.ml1+this.ms1/this.ns,this.ml0=Ve(this.e0,this.e1,this.e2,this.e3,this.lat0),this.rh=this.a*(this.g-this.ml0))}function nS(i){var t=i.x,e=i.y,n;if(this.sphere)n=this.a*(this.g-e);else{var s=Ve(this.e0,this.e1,this.e2,this.e3,e);n=this.a*(this.g-s)}var a=this.ns*at(t-this.long0,this.over),r=this.x0+n*Math.sin(a),o=this.y0+this.rh-n*Math.cos(a);return i.x=r,i.y=o,i}function sS(i){i.x-=this.x0,i.y=this.rh-i.y+this.y0;var t,e,n,s;this.ns>=0?(e=Math.sqrt(i.x*i.x+i.y*i.y),t=1):(e=-Math.sqrt(i.x*i.x+i.y*i.y),t=-1);var a=0;if(e!==0&&(a=Math.atan2(t*i.x,t*i.y)),this.sphere)return s=at(this.long0+a/this.ns,this.over),n=gn(this.g-e/this.a),i.x=s,i.y=n,i;var r=this.g-e/this.a;return n=lr(r,this.e0,this.e1,this.e2,this.e3),s=at(this.long0+a/this.ns,this.over),i.x=s,i.y=n,i}var aS=["Equidistant_Conic","eqdc"];const rS={init:iS,forward:nS,inverse:sS,names:aS};function oS(){this.R=this.a}function lS(i){var t=i.x,e=i.y,n=at(t-this.long0,this.over),s,a;if(Math.abs(e)<=nt)return s=this.x0+this.R*n,a=this.y0,i.x=s,i.y=a,i;var r=mn(2*Math.abs(e/Math.PI));if(Math.abs(n)<=nt||Math.abs(Math.abs(e)-j)<=nt)return s=this.x0,e>=0?a=this.y0+Math.PI*this.R*Math.tan(.5*r):a=this.y0+Math.PI*this.R*-Math.tan(.5*r),i.x=s,i.y=a,i;var o=.5*Math.abs(Math.PI/n-n/Math.PI),l=o*o,h=Math.sin(r),f=Math.cos(r),u=f/(h+f-1),c=u*u,d=u*(2/h-1),_=d*d,M=Math.PI*this.R*(o*(u-_)+Math.sqrt(l*(u-_)*(u-_)-(_+l)*(c-_)))/(_+l);n<0&&(M=-M),s=this.x0+M;var m=l+u;return M=Math.PI*this.R*(d*m-o*Math.sqrt((_+l)*(l+1)-m*m))/(_+l),e>=0?a=this.y0+M:a=this.y0-M,i.x=s,i.y=a,i}function hS(i){var t,e,n,s,a,r,o,l,h,f,u,c,d;return i.x-=this.x0,i.y-=this.y0,u=Math.PI*this.R,n=i.x/u,s=i.y/u,a=n*n+s*s,r=-Math.abs(s)*(1+a),o=r-2*s*s+n*n,l=-2*r+1+2*s*s+a*a,d=s*s/l+(2*o*o*o/l/l/l-9*r*o/l/l)/27,h=(r-o*o/3/l)/l,f=2*Math.sqrt(-h/3),u=3*d/h/f,Math.abs(u)>1&&(u>=0?u=1:u=-1),c=Math.acos(u)/3,i.y>=0?e=(-f*Math.cos(c+Math.PI/3)-o/3/l)*Math.PI:e=-(-f*Math.cos(c+Math.PI/3)-o/3/l)*Math.PI,Math.abs(n)<nt?t=this.long0:t=at(this.long0+Math.PI*(a-1+Math.sqrt(1+2*(n*n-s*s)+a*a))/2/n,this.over),i.x=t,i.y=e,i}var cS=["Van_der_Grinten_I","VanDerGrinten","Van_der_Grinten","vandg"];const uS={init:oS,forward:lS,inverse:hS,names:cS};function fS(i,t,e,n,s,a){const r=n-t,o=Math.atan((1-a)*Math.tan(i)),l=Math.atan((1-a)*Math.tan(e)),h=Math.sin(o),f=Math.cos(o),u=Math.sin(l),c=Math.cos(l);let d=r,_,M=100,m,p,b,A,S,w,y,P,v,E,C,R,D,H;do{if(m=Math.sin(d),p=Math.cos(d),b=Math.sqrt(c*m*(c*m)+(f*u-h*c*p)*(f*u-h*c*p)),b===0)return{azi1:0,s12:0};A=h*u+f*c*p,S=Math.atan2(b,A),w=f*c*m/b,y=1-w*w,P=y!==0?A-2*h*u/y:0,v=a/16*y*(4+a*(4-3*y)),_=d,d=r+(1-v)*a*w*(S+v*b*(P+v*A*(-1+2*P*P)))}while(Math.abs(d-_)>1e-12&&--M>0);return M===0?{azi1:NaN,s12:NaN}:(E=y*(s*s-s*(1-a)*(s*(1-a)))/(s*(1-a)*(s*(1-a))),C=1+E/16384*(4096+E*(-768+E*(320-175*E))),R=E/1024*(256+E*(-128+E*(74-47*E))),D=R*b*(P+R/4*(A*(-1+2*P*P)-R/6*P*(-3+4*b*b)*(-3+4*P*P))),H=s*(1-a)*C*(S-D),{azi1:Math.atan2(c*m,f*u-h*c*p),s12:H})}function dS(i,t,e,n,s,a){const r=Math.atan((1-a)*Math.tan(i)),o=Math.sin(r),l=Math.cos(r),h=Math.sin(e),f=Math.cos(e),u=Math.atan2(o,l*f),c=l*h,d=1-c*c,_=d*(s*s-s*(1-a)*(s*(1-a)))/(s*(1-a)*(s*(1-a))),M=1+_/16384*(4096+_*(-768+_*(320-175*_))),m=_/1024*(256+_*(-128+_*(74-47*_)));let p=n/(s*(1-a)*M),b,A=100,S,w,y,P;do S=Math.cos(2*u+p),w=Math.sin(p),y=Math.cos(p),P=m*w*(S+m/4*(y*(-1+2*S*S)-m/6*S*(-3+4*w*w)*(-3+4*S*S))),b=p,p=n/(s*(1-a)*M)+P;while(Math.abs(p-b)>1e-12&&--A>0);if(A===0)return{lat2:NaN,lon2:NaN};const v=o*w-l*y*f,E=Math.atan2(o*y+l*w*f,(1-a)*Math.sqrt(c*c+v*v)),C=Math.atan2(w*h,l*y-o*w*f),R=a/16*d*(4+a*(4-3*d)),D=C-(1-R)*a*c*(p+R*w*(S+R*y*(-1+2*S*S))),H=t+D;return{lat2:E,lon2:H}}function pS(){this.sin_p12=Math.sin(this.lat0),this.cos_p12=Math.cos(this.lat0),this.x0=this.x0||0,this.y0=this.y0||0,this.long0=this.long0||0,this.f=this.es/(1+Math.sqrt(1-this.es))}function mS(i){var t=i.x,e=i.y,n=Math.sin(i.y),s=Math.cos(i.y),a=at(t-this.long0,this.over),r,o,l,h,f,u,c,d,_,M,m;return this.sphere?Math.abs(this.sin_p12-1)<=nt?(i.x=this.x0+this.a*(j-e)*Math.sin(a),i.y=this.y0-this.a*(j-e)*Math.cos(a),i):Math.abs(this.sin_p12+1)<=nt?(i.x=this.x0+this.a*(j+e)*Math.sin(a),i.y=this.y0+this.a*(j+e)*Math.cos(a),i):(_=this.sin_p12*n+this.cos_p12*s*Math.cos(a),c=Math.acos(_),d=c?c/Math.sin(c):1,i.x=this.x0+this.a*d*s*Math.sin(a),i.y=this.y0+this.a*d*(this.cos_p12*n-this.sin_p12*s*Math.cos(a)),i):(r=ta(this.es),o=ea(this.es),l=ia(this.es),h=na(this.es),Math.abs(this.sin_p12-1)<=nt?(f=this.a*Ve(r,o,l,h,j),u=this.a*Ve(r,o,l,h,e),i.x=this.x0+(f-u)*Math.sin(a),i.y=this.y0-(f-u)*Math.cos(a),i):Math.abs(this.sin_p12+1)<=nt?(f=this.a*Ve(r,o,l,h,j),u=this.a*Ve(r,o,l,h,e),i.x=this.x0+(f+u)*Math.sin(a),i.y=this.y0+(f+u)*Math.cos(a),i):Math.abs(t)<nt&&Math.abs(e-this.lat0)<nt?(i.x=this.x0,i.y=this.y0,i):(M=fS(this.lat0,this.long0,e,t,this.a,this.f),m=M.azi1,i.x=this.x0+M.s12*Math.sin(m),i.y=this.y0+M.s12*Math.cos(m),i))}function _S(i){i.x-=this.x0,i.y-=this.y0;var t,e,n,s,a,r,o,l,h,f,u,c,d,_,M,m;return this.sphere?(t=Math.sqrt(i.x*i.x+i.y*i.y),t>2*j*this.a?void 0:(e=t/this.a,n=Math.sin(e),s=Math.cos(e),a=this.long0,Math.abs(t)<=nt?r=this.lat0:(r=mn(s*this.sin_p12+i.y*n*this.cos_p12/t),o=Math.abs(this.lat0)-j,Math.abs(o)<=nt?this.lat0>=0?a=at(this.long0+Math.atan2(i.x,-i.y),this.over):a=at(this.long0-Math.atan2(-i.x,i.y),this.over):a=at(this.long0+Math.atan2(i.x*n,t*this.cos_p12*s-i.y*this.sin_p12*n),this.over)),i.x=a,i.y=r,i)):(l=ta(this.es),h=ea(this.es),f=ia(this.es),u=na(this.es),Math.abs(this.sin_p12-1)<=nt?(c=this.a*Ve(l,h,f,u,j),t=Math.sqrt(i.x*i.x+i.y*i.y),d=c-t,r=lr(d/this.a,l,h,f,u),a=at(this.long0+Math.atan2(i.x,-1*i.y),this.over),i.x=a,i.y=r,i):Math.abs(this.sin_p12+1)<=nt?(c=this.a*Ve(l,h,f,u,j),t=Math.sqrt(i.x*i.x+i.y*i.y),d=t-c,r=lr(d/this.a,l,h,f,u),a=at(this.long0+Math.atan2(i.x,i.y),this.over),i.x=a,i.y=r,i):(_=Math.atan2(i.x,i.y),M=Math.sqrt(i.x*i.x+i.y*i.y),m=dS(this.lat0,this.long0,_,M,this.a,this.f),i.x=m.lon2,i.y=m.lat2,i))}var gS=["Azimuthal_Equidistant","aeqd"];const vS={init:pS,forward:mS,inverse:_S,names:gS};function MS(){this.sin_p14=Math.sin(this.lat0||0),this.cos_p14=Math.cos(this.lat0||0)}function xS(i){var t,e,n,s,a,r,o,l,h=i.x,f=i.y;return n=at(h-(this.long0||0),this.over),t=Math.sin(f),e=Math.cos(f),s=Math.cos(n),r=this.sin_p14*t+this.cos_p14*e*s,a=1,(r>0||Math.abs(r)<=nt)&&(o=this.a*a*e*Math.sin(n),l=(this.y0||0)+this.a*a*(this.cos_p14*t-this.sin_p14*e*s)),i.x=o,i.y=l,i}function SS(i){var t,e,n,s,a,r,o,l,h;return i.x-=this.x0||0,i.y-=this.y0||0,t=Math.sqrt(i.x*i.x+i.y*i.y),e=mn(t/this.a),n=Math.sin(e),s=Math.cos(e),l=this.long0||0,h=this.lat0||0,r=l,Math.abs(t)<=nt?(o=h,i.x=r,i.y=o,i):(o=mn(s*this.sin_p14+i.y*n*this.cos_p14/t),a=Math.abs(h)-j,Math.abs(a)<=nt?(h>=0?r=at(l+Math.atan2(i.x,-i.y),this.over):r=at(l-Math.atan2(-i.x,i.y),this.over),i.x=r,i.y=o,i):(r=at(l+Math.atan2(i.x*n,t*this.cos_p14*s-i.y*this.sin_p14*n),this.over),i.x=r,i.y=o,i))}var yS=["ortho"];const ES={init:MS,forward:xS,inverse:SS,names:yS};var ce={FRONT:1,RIGHT:2,BACK:3,LEFT:4,TOP:5,BOTTOM:6},Jt={AREA_0:1,AREA_1:2,AREA_2:3,AREA_3:4};function bS(){this.x0=this.x0||0,this.y0=this.y0||0,this.lat0=this.lat0||0,this.long0=this.long0||0,this.lat_ts=this.lat_ts||0,this.title=this.title||"Quadrilateralized Spherical Cube",this.lat0>=j-Zt/2?this.face=ce.TOP:this.lat0<=-(j-Zt/2)?this.face=ce.BOTTOM:Math.abs(this.long0)<=Zt?this.face=ce.FRONT:Math.abs(this.long0)<=j+Zt?this.face=this.long0>0?ce.RIGHT:ce.LEFT:this.face=ce.BACK,this.es!==0&&(this.one_minus_f=1-(this.a-this.b)/this.a,this.one_minus_f_squared=this.one_minus_f*this.one_minus_f)}function TS(i){var t={x:0,y:0},e,n,s,a,r,o,l={value:0};if(i.x-=this.long0,this.es!==0?e=Math.atan(this.one_minus_f_squared*Math.tan(i.y)):e=i.y,n=i.x,this.face===ce.TOP)a=j-e,n>=Zt&&n<=j+Zt?(l.value=Jt.AREA_0,s=n-j):n>j+Zt||n<=-(j+Zt)?(l.value=Jt.AREA_1,s=n>0?n-Me:n+Me):n>-(j+Zt)&&n<=-Zt?(l.value=Jt.AREA_2,s=n+j):(l.value=Jt.AREA_3,s=n);else if(this.face===ce.BOTTOM)a=j+e,n>=Zt&&n<=j+Zt?(l.value=Jt.AREA_0,s=-n+j):n<Zt&&n>=-Zt?(l.value=Jt.AREA_1,s=-n):n<-Zt&&n>=-(j+Zt)?(l.value=Jt.AREA_2,s=-n-j):(l.value=Jt.AREA_3,s=n>0?-n+Me:-n-Me);else{var h,f,u,c,d,_,M;this.face===ce.RIGHT?n=ps(n,+j):this.face===ce.BACK?n=ps(n,+Me):this.face===ce.LEFT&&(n=ps(n,-j)),c=Math.sin(e),d=Math.cos(e),_=Math.sin(n),M=Math.cos(n),h=d*M,f=d*_,u=c,this.face===ce.FRONT?(a=Math.acos(h),s=Fa(a,u,f,l)):this.face===ce.RIGHT?(a=Math.acos(f),s=Fa(a,u,-h,l)):this.face===ce.BACK?(a=Math.acos(-h),s=Fa(a,u,-f,l)):this.face===ce.LEFT?(a=Math.acos(-f),s=Fa(a,u,h,l)):(a=s=0,l.value=Jt.AREA_0)}return o=Math.atan(12/Me*(s+Math.acos(Math.sin(s)*Math.cos(Zt))-j)),r=Math.sqrt((1-Math.cos(a))/(Math.cos(o)*Math.cos(o))/(1-Math.cos(Math.atan(1/Math.cos(s))))),l.value===Jt.AREA_1?o+=j:l.value===Jt.AREA_2?o+=Me:l.value===Jt.AREA_3&&(o+=1.5*Me),t.x=r*Math.cos(o),t.y=r*Math.sin(o),t.x=t.x*this.a+this.x0,t.y=t.y*this.a+this.y0,i.x=t.x,i.y=t.y,i}function wS(i){var t={lam:0,phi:0},e,n,s,a,r,o,l,h,f,u={value:0};if(i.x=(i.x-this.x0)/this.a,i.y=(i.y-this.y0)/this.a,n=Math.atan(Math.sqrt(i.x*i.x+i.y*i.y)),e=Math.atan2(i.y,i.x),i.x>=0&&i.x>=Math.abs(i.y)?u.value=Jt.AREA_0:i.y>=0&&i.y>=Math.abs(i.x)?(u.value=Jt.AREA_1,e-=j):i.x<0&&-i.x>=Math.abs(i.y)?(u.value=Jt.AREA_2,e=e<0?e+Me:e-Me):(u.value=Jt.AREA_3,e+=j),f=Me/12*Math.tan(e),r=Math.sin(f)/(Math.cos(f)-1/Math.sqrt(2)),o=Math.atan(r),s=Math.cos(e),a=Math.tan(n),l=1-s*s*a*a*(1-Math.cos(Math.atan(1/Math.cos(o)))),l<-1?l=-1:l>1&&(l=1),this.face===ce.TOP)h=Math.acos(l),t.phi=j-h,u.value===Jt.AREA_0?t.lam=o+j:u.value===Jt.AREA_1?t.lam=o<0?o+Me:o-Me:u.value===Jt.AREA_2?t.lam=o-j:t.lam=o;else if(this.face===ce.BOTTOM)h=Math.acos(l),t.phi=h-j,u.value===Jt.AREA_0?t.lam=-o+j:u.value===Jt.AREA_1?t.lam=-o:u.value===Jt.AREA_2?t.lam=-o-j:t.lam=o<0?-o-Me:-o+Me;else{var c,d,_;c=l,f=c*c,f>=1?_=0:_=Math.sqrt(1-f)*Math.sin(o),f+=_*_,f>=1?d=0:d=Math.sqrt(1-f),u.value===Jt.AREA_1?(f=d,d=-_,_=f):u.value===Jt.AREA_2?(d=-d,_=-_):u.value===Jt.AREA_3&&(f=d,d=_,_=-f),this.face===ce.RIGHT?(f=c,c=-d,d=f):this.face===ce.BACK?(c=-c,d=-d):this.face===ce.LEFT&&(f=c,c=d,d=-f),t.phi=Math.acos(-_)-j,t.lam=Math.atan2(d,c),this.face===ce.RIGHT?t.lam=ps(t.lam,-j):this.face===ce.BACK?t.lam=ps(t.lam,-Me):this.face===ce.LEFT&&(t.lam=ps(t.lam,+j))}if(this.es!==0){var M,m,p;M=t.phi<0?1:0,m=Math.tan(t.phi),p=this.b/Math.sqrt(m*m+this.one_minus_f_squared),t.phi=Math.atan(Math.sqrt(this.a*this.a-p*p)/(this.one_minus_f*p)),M&&(t.phi=-t.phi)}return t.lam+=this.long0,i.x=t.lam,i.y=t.phi,i}function Fa(i,t,e,n){var s;return i<nt?(n.value=Jt.AREA_0,s=0):(s=Math.atan2(t,e),Math.abs(s)<=Zt?n.value=Jt.AREA_0:s>Zt&&s<=j+Zt?(n.value=Jt.AREA_1,s-=j):s>j+Zt||s<=-(j+Zt)?(n.value=Jt.AREA_2,s=s>=0?s-Me:s+Me):(n.value=Jt.AREA_3,s+=j)),s}function ps(i,t){var e=i+t;return e<-Me?e+=Ys:e>+Me&&(e-=Ys),e}var AS=["Quadrilateralized Spherical Cube","Quadrilateralized_Spherical_Cube","qsc"];const PS={init:bS,forward:TS,inverse:wS,names:AS};var ml=[[1,22199e-21,-715515e-10,31103e-10],[.9986,-482243e-9,-24897e-9,-13309e-10],[.9954,-83103e-8,-448605e-10,-986701e-12],[.99,-.00135364,-59661e-9,36777e-10],[.9822,-.00167442,-449547e-11,-572411e-11],[.973,-.00214868,-903571e-10,18736e-12],[.96,-.00305085,-900761e-10,164917e-11],[.9427,-.00382792,-653386e-10,-26154e-10],[.9216,-.00467746,-10457e-8,481243e-11],[.8962,-.00536223,-323831e-10,-543432e-11],[.8679,-.00609363,-113898e-9,332484e-11],[.835,-.00698325,-640253e-10,934959e-12],[.7986,-.00755338,-500009e-10,935324e-12],[.7597,-.00798324,-35971e-9,-227626e-11],[.7186,-.00851367,-701149e-10,-86303e-10],[.6732,-.00986209,-199569e-9,191974e-10],[.6213,-.010418,883923e-10,624051e-11],[.5722,-.00906601,182e-6,624051e-11],[.5322,-.00677797,275608e-9,624051e-11]],Os=[[-520417e-23,.0124,121431e-23,-845284e-16],[.062,.0124,-126793e-14,422642e-15],[.124,.0124,507171e-14,-160604e-14],[.186,.0123999,-190189e-13,600152e-14],[.248,.0124002,710039e-13,-224e-10],[.31,.0123992,-264997e-12,835986e-13],[.372,.0124029,988983e-12,-311994e-12],[.434,.0123893,-369093e-11,-435621e-12],[.4958,.0123198,-102252e-10,-345523e-12],[.5571,.0121916,-154081e-10,-582288e-12],[.6176,.0119938,-241424e-10,-525327e-12],[.6769,.011713,-320223e-10,-516405e-12],[.7346,.0113541,-397684e-10,-609052e-12],[.7903,.0109107,-489042e-10,-104739e-11],[.8435,.0103431,-64615e-9,-140374e-14],[.8936,.00969686,-64636e-9,-8547e-9],[.9394,.00840947,-192841e-9,-42106e-10],[.9761,.00616527,-256e-6,-42106e-10],[1,.00328947,-319159e-9,-42106e-10]],tf=.8487,ef=1.3523,nf=Ze/5,RS=1/nf,os=18,hr=function(i,t){return i[0]+t*(i[1]+t*(i[2]+t*i[3]))},CS=function(i,t){return i[1]+t*(2*i[2]+t*3*i[3])};function IS(i,t,e,n){for(var s=t;n;--n){var a=i(s);if(s-=a,Math.abs(a)<e)break}return s}function LS(){this.x0=this.x0||0,this.y0=this.y0||0,this.long0=this.long0||0,this.es=0,this.title=this.title||"Robinson"}function NS(i){var t=at(i.x-this.long0,this.over),e=Math.abs(i.y),n=Math.floor(e*nf);n<0?n=0:n>=os&&(n=os-1),e=Ze*(e-RS*n);var s={x:hr(ml[n],e)*t,y:hr(Os[n],e)};return i.y<0&&(s.y=-s.y),s.x=s.x*this.a*tf+this.x0,s.y=s.y*this.a*ef+this.y0,s}function DS(i){var t={x:(i.x-this.x0)/(this.a*tf),y:Math.abs(i.y-this.y0)/(this.a*ef)};if(t.y>=1)t.x/=ml[os][0],t.y=i.y<0?-j:j;else{var e=Math.floor(t.y*os);for(e<0?e=0:e>=os&&(e=os-1);;)if(Os[e][0]>t.y)--e;else if(Os[e+1][0]<=t.y)++e;else break;var n=Os[e],s=5*(t.y-n[0])/(Os[e+1][0]-n[0]);s=IS(function(a){return(hr(n,a)-t.y)/CS(n,a)},s,nt,100),t.x/=hr(ml[e],s),t.y=(5*e+s)*he,i.y<0&&(t.y=-t.y)}return t.x=at(t.x+this.long0,this.over),t}var US=["Robinson","robin"];const FS={init:LS,forward:NS,inverse:DS,names:US};function OS(){this.name="geocent"}function GS(i){var t=zu(i,this.es,this.a);return t}function BS(i){var t=ku(i,this.es,this.a,this.b);return t}var zS=["Geocentric","geocentric","geocent","Geocent"];const kS={init:OS,forward:GS,inverse:BS,names:zS};var Oe={N_POLE:0,S_POLE:1,EQUIT:2,OBLIQ:3},Ls={h:{def:1e5,num:!0},azi:{def:0,num:!0,degrees:!0},tilt:{def:0,num:!0,degrees:!0},long0:{def:0,num:!0},lat0:{def:0,num:!0}};function HS(){if(Object.keys(Ls).forEach((function(e){if(typeof this[e]>"u")this[e]=Ls[e].def;else{if(Ls[e].num&&isNaN(this[e]))throw new Error("Invalid parameter value, must be numeric "+e+" = "+this[e]);Ls[e].num&&(this[e]=parseFloat(this[e]))}Ls[e].degrees&&(this[e]=this[e]*he)}).bind(this)),Math.abs(Math.abs(this.lat0)-j)<nt?this.mode=this.lat0<0?Oe.S_POLE:Oe.N_POLE:Math.abs(this.lat0)<nt?this.mode=Oe.EQUIT:(this.mode=Oe.OBLIQ,this.sinph0=Math.sin(this.lat0),this.cosph0=Math.cos(this.lat0)),this.pn1=this.h/this.a,this.pn1<=0||this.pn1>1e10)throw new Error("Invalid height");this.p=1+this.pn1,this.rp=1/this.p,this.h1=1/this.pn1,this.pfact=(this.p+1)*this.h1,this.es=0;var i=this.tilt,t=this.azi;this.cg=Math.cos(t),this.sg=Math.sin(t),this.cw=Math.cos(i),this.sw=Math.sin(i)}function VS(i){i.x-=this.long0;var t=Math.sin(i.y),e=Math.cos(i.y),n=Math.cos(i.x),s,a;switch(this.mode){case Oe.OBLIQ:a=this.sinph0*t+this.cosph0*e*n;break;case Oe.EQUIT:a=e*n;break;case Oe.S_POLE:a=-t;break;case Oe.N_POLE:a=t;break}switch(a=this.pn1/(this.p-a),s=a*e*Math.sin(i.x),this.mode){case Oe.OBLIQ:a*=this.cosph0*t-this.sinph0*e*n;break;case Oe.EQUIT:a*=t;break;case Oe.N_POLE:a*=-(e*n);break;case Oe.S_POLE:a*=e*n;break}var r,o;return r=a*this.cg+s*this.sg,o=1/(r*this.sw*this.h1+this.cw),s=(s*this.cg-a*this.sg)*this.cw*o,a=r*o,i.x=s*this.a,i.y=a*this.a,i}function WS(i){i.x/=this.a,i.y/=this.a;var t={x:i.x,y:i.y},e,n,s;s=1/(this.pn1-i.y*this.sw),e=this.pn1*i.x*s,n=this.pn1*i.y*this.cw*s,i.x=e*this.cg+n*this.sg,i.y=n*this.cg-e*this.sg;var a=Ke(i.x,i.y);if(Math.abs(a)<nt)t.x=0,t.y=i.y;else{var r,o;switch(o=1-a*a*this.pfact,o=(this.p-Math.sqrt(o))/(this.pn1/a+a/this.pn1),r=Math.sqrt(1-o*o),this.mode){case Oe.OBLIQ:t.y=Math.asin(r*this.sinph0+i.y*o*this.cosph0/a),i.y=(r-this.sinph0*Math.sin(t.y))*a,i.x*=o*this.cosph0;break;case Oe.EQUIT:t.y=Math.asin(i.y*o/a),i.y=r*a,i.x*=o;break;case Oe.N_POLE:t.y=Math.asin(r),i.y=-i.y;break;case Oe.S_POLE:t.y=-Math.asin(r);break}t.x=Math.atan2(i.x,i.y)}return i.x=t.x+this.long0,i.y=t.y,i}var XS=["Tilted_Perspective","tpers"];const qS={init:HS,forward:VS,inverse:WS,names:XS};function YS(){if(this.flip_axis=this.sweep==="x"?1:0,this.h=Number(this.h),this.radius_g_1=this.h/this.a,this.radius_g_1<=0||this.radius_g_1>1e10)throw new Error;if(this.radius_g=1+this.radius_g_1,this.C=this.radius_g*this.radius_g-1,this.es!==0){var i=1-this.es,t=1/i;this.radius_p=Math.sqrt(i),this.radius_p2=i,this.radius_p_inv2=t,this.shape="ellipse"}else this.radius_p=1,this.radius_p2=1,this.radius_p_inv2=1,this.shape="sphere";this.title||(this.title="Geostationary Satellite View")}function $S(i){var t=i.x,e=i.y,n,s,a,r;if(t=t-this.long0,this.shape==="ellipse"){e=Math.atan(this.radius_p2*Math.tan(e));var o=this.radius_p/Ke(this.radius_p*Math.cos(e),Math.sin(e));if(s=o*Math.cos(t)*Math.cos(e),a=o*Math.sin(t)*Math.cos(e),r=o*Math.sin(e),(this.radius_g-s)*s-a*a-r*r*this.radius_p_inv2<0)return i.x=Number.NaN,i.y=Number.NaN,i;n=this.radius_g-s,this.flip_axis?(i.x=this.radius_g_1*Math.atan(a/Ke(r,n)),i.y=this.radius_g_1*Math.atan(r/n)):(i.x=this.radius_g_1*Math.atan(a/n),i.y=this.radius_g_1*Math.atan(r/Ke(a,n)))}else this.shape==="sphere"&&(n=Math.cos(e),s=Math.cos(t)*n,a=Math.sin(t)*n,r=Math.sin(e),n=this.radius_g-s,this.flip_axis?(i.x=this.radius_g_1*Math.atan(a/Ke(r,n)),i.y=this.radius_g_1*Math.atan(r/n)):(i.x=this.radius_g_1*Math.atan(a/n),i.y=this.radius_g_1*Math.atan(r/Ke(a,n))));return i.x=i.x*this.a,i.y=i.y*this.a,i}function KS(i){var t=-1,e=0,n=0,s,a,r,o;if(i.x=i.x/this.a,i.y=i.y/this.a,this.shape==="ellipse"){this.flip_axis?(n=Math.tan(i.y/this.radius_g_1),e=Math.tan(i.x/this.radius_g_1)*Ke(1,n)):(e=Math.tan(i.x/this.radius_g_1),n=Math.tan(i.y/this.radius_g_1)*Ke(1,e));var l=n/this.radius_p;if(s=e*e+l*l+t*t,a=2*this.radius_g*t,r=a*a-4*s*this.C,r<0)return i.x=Number.NaN,i.y=Number.NaN,i;o=(-a-Math.sqrt(r))/(2*s),t=this.radius_g+o*t,e*=o,n*=o,i.x=Math.atan2(e,t),i.y=Math.atan(n*Math.cos(i.x)/t),i.y=Math.atan(this.radius_p_inv2*Math.tan(i.y))}else if(this.shape==="sphere"){if(this.flip_axis?(n=Math.tan(i.y/this.radius_g_1),e=Math.tan(i.x/this.radius_g_1)*Math.sqrt(1+n*n)):(e=Math.tan(i.x/this.radius_g_1),n=Math.tan(i.y/this.radius_g_1)*Math.sqrt(1+e*e)),s=e*e+n*n+t*t,a=2*this.radius_g*t,r=a*a-4*s*this.C,r<0)return i.x=Number.NaN,i.y=Number.NaN,i;o=(-a-Math.sqrt(r))/(2*s),t=this.radius_g+o*t,e*=o,n*=o,i.x=Math.atan2(e,t),i.y=Math.atan(n*Math.cos(i.x)/t)}return i.x=i.x+this.long0,i}var ZS=["Geostationary Satellite View","Geostationary_Satellite","geos"];const JS={init:YS,forward:$S,inverse:KS,names:ZS};var Bs=1.340264,zs=-.081106,ks=893e-6,Hs=.003796,cr=Math.sqrt(3)/2;function QS(){this.long0=this.long0!==void 0?this.long0:0,this.x0=this.x0!==void 0?this.x0:0,this.y0=this.y0!==void 0?this.y0:0,this.es!==0&&(this.apa=Zu(this.es),this.qp=Ci(this.e,1),this.rqda=Math.sqrt(.5*this.qp))}function jS(i){var t=at(i.x-this.long0,this.over),e=i.y,n=Math.sin(e);this.es!==0&&(n=Ci(this.e,n)/this.qp);var s=Math.asin(cr*n),a=s*s,r=a*a*a;return i.x=t*Math.cos(s)/(cr*(Bs+3*zs*a+r*(7*ks+9*Hs*a))),i.y=s*(Bs+zs*a+r*(ks+Hs*a)),this.es!==0&&(i.x*=this.rqda,i.y*=this.rqda),i.x=this.a*i.x+this.x0,i.y=this.a*i.y+this.y0,i}function ty(i){i.x=(i.x-this.x0)/this.a,i.y=(i.y-this.y0)/this.a,this.es!==0&&(i.x/=this.rqda,i.y/=this.rqda);var t=1e-9,e=12,n=i.y,s,a,r,o,l,h;for(h=0;h<e&&(s=n*n,a=s*s*s,r=n*(Bs+zs*s+a*(ks+Hs*s))-i.y,o=Bs+3*zs*s+a*(7*ks+9*Hs*s),n-=l=r/o,!(Math.abs(l)<t));++h);return s=n*n,a=s*s*s,i.x=cr*i.x*(Bs+3*zs*s+a*(7*ks+9*Hs*s))/Math.cos(n),i.y=Math.asin(Math.sin(n)/cr),this.es!==0&&(i.y=Ju(i.y,this.apa)),i.x=at(i.x+this.long0,this.over),i}var ey=["eqearth","Equal Earth","Equal_Earth"];const iy={init:QS,forward:jS,inverse:ty,names:ey};var Zs=1e-10;function ny(){var i;if(this.phi1=this.lat1,Math.abs(this.phi1)<Zs)throw new Error;this.es?(this.en=zl(this.es),this.m1=ys(this.phi1,this.am1=Math.sin(this.phi1),i=Math.cos(this.phi1),this.en),this.am1=i/(Math.sqrt(1-this.es*this.am1*this.am1)*this.am1),this.inverse=ay,this.forward=sy):(Math.abs(this.phi1)+Zs>=j?this.cphi1=0:this.cphi1=1/Math.tan(this.phi1),this.inverse=oy,this.forward=ry)}function sy(i){var t=at(i.x-(this.long0||0),this.over),e=i.y,n,s,a;return n=this.am1+this.m1-ys(e,s=Math.sin(e),a=Math.cos(e),this.en),s=a*t/(n*Math.sqrt(1-this.es*s*s)),i.x=n*Math.sin(s),i.y=this.am1-n*Math.cos(s),i.x=this.a*i.x+(this.x0||0),i.y=this.a*i.y+(this.y0||0),i}function ay(i){i.x=(i.x-(this.x0||0))/this.a,i.y=(i.y-(this.y0||0))/this.a;var t,e,n,s;if(e=Ke(i.x,i.y=this.am1-i.y),s=kl(this.am1+this.m1-e,this.es,this.en),(t=Math.abs(s))<j)t=Math.sin(s),n=e*Math.atan2(i.x,i.y)*Math.sqrt(1-this.es*t*t)/Math.cos(s);else if(Math.abs(t-j)<=Zs)n=0;else throw new Error;return i.x=at(n+(this.long0||0),this.over),i.y=gn(s),i}function ry(i){var t=at(i.x-(this.long0||0),this.over),e=i.y,n,s;return s=this.cphi1+this.phi1-e,Math.abs(s)>Zs?(i.x=s*Math.sin(n=t*Math.cos(e)/s),i.y=this.cphi1-s*Math.cos(n)):i.x=i.y=0,i.x=this.a*i.x+(this.x0||0),i.y=this.a*i.y+(this.y0||0),i}function oy(i){i.x=(i.x-(this.x0||0))/this.a,i.y=(i.y-(this.y0||0))/this.a;var t,e,n=Ke(i.x,i.y=this.cphi1-i.y);if(e=this.cphi1+this.phi1-n,Math.abs(e)>j)throw new Error;return Math.abs(Math.abs(e)-j)<=Zs?t=0:t=n*Math.atan2(i.x,i.y)/Math.cos(e),i.x=at(t+(this.long0||0),this.over),i.y=gn(e),i}var ly=["bonne","Bonne (Werner lat_1=90)"];const hy={init:ny,names:ly},Fc={OBLIQUE:{forward:py,inverse:_y},TRANSVERSE:{forward:my,inverse:gy}},ur={ROTATE:{o_alpha:"oAlpha",o_lon_c:"oLongC",o_lat_c:"oLatC"},NEW_POLE:{o_lat_p:"oLatP",o_lon_p:"oLongP"},NEW_EQUATOR:{o_lon_1:"oLong1",o_lat_1:"oLat1",o_lon_2:"oLong2",o_lat_2:"oLat2"}};function cy(){if(this.x0=this.x0||0,this.y0=this.y0||0,this.long0=this.long0||0,this.title=this.title||"General Oblique Transformation",this.isIdentity=Fu.includes(this.o_proj),!this.o_proj)throw new Error("Missing parameter: o_proj");if(this.o_proj==="ob_tran")throw new Error("Invalid value for o_proj: "+this.o_proj);const i=this.projStr.replace("+proj=ob_tran","").replace("+o_proj=","+proj=").trim(),t=ci(i);if(!t)throw new Error("Invalid parameter: o_proj. Unknown projection "+this.o_proj);t.long0=0,this.obliqueProjection=t;let e;const n=Object.keys(ur),s=o=>{if(typeof this[o]>"u")return;const l=parseFloat(this[o])*he;if(isNaN(l))throw new Error("Invalid value for "+o+": "+this[o]);return l};for(let o=0;o<n.length;o++){const l=n[o],h=ur[l],f=Object.entries(h);if(f.some(([c])=>typeof this[c]<"u")){e=h;for(let c=0;c<f.length;c++){const[d,_]=f[c],M=s(d);if(typeof M>"u")throw new Error("Missing parameter: "+d+".");this[_]=M}break}}if(!e)throw new Error("No valid parameters provided for ob_tran projection.");const{lamp:a,phip:r}=dy(this,e);this.lamp=a,Math.abs(r)>nt?(this.cphip=Math.cos(r),this.sphip=Math.sin(r),this.projectionType=Fc.OBLIQUE):this.projectionType=Fc.TRANSVERSE}function uy(i){return this.projectionType.forward(this,i)}function fy(i){return this.projectionType.inverse(this,i)}function dy(i,t){let e,n;if(t===ur.ROTATE){let s=i.oLongC,a=i.oLatC,r=i.oAlpha;if(Math.abs(Math.abs(a)-j)<=nt)throw new Error("Invalid value for o_lat_c: "+i.o_lat_c+" should be < 90°");n=s+Math.atan2(-1*Math.cos(r),-1*Math.sin(r)*Math.sin(a)),e=Math.asin(Math.cos(a)*Math.sin(r))}else if(t===ur.NEW_POLE)n=i.oLongP,e=i.oLatP;else{let s=i.oLong1,a=i.oLat1,r=i.oLong2,o=i.oLat2,l=Math.abs(a);if(Math.abs(a)>j-nt)throw new Error("Invalid value for o_lat_1: "+i.o_lat_1+" should be < 90°");if(Math.abs(o)>j-nt)throw new Error("Invalid value for o_lat_2: "+i.o_lat_2+" should be < 90°");if(Math.abs(a-o)<nt)throw new Error("Invalid value for o_lat_1 and o_lat_2: o_lat_1 should be different from o_lat_2");if(l<nt)throw new Error("Invalid value for o_lat_1: o_lat_1 should be different from zero");n=Math.atan2(Math.cos(a)*Math.sin(o)*Math.cos(s)-Math.sin(a)*Math.cos(o)*Math.cos(r),Math.sin(a)*Math.cos(o)*Math.sin(r)-Math.cos(a)*Math.sin(o)*Math.sin(s)),e=Math.atan(-1*Math.cos(n-s)/Math.tan(a))}return{lamp:n,phip:e}}function py(i,t){let{x:e,y:n}=t;e=at(e-i.long0,i.over);const s=Math.cos(e),a=Math.sin(n),r=Math.cos(n);t.x=at(Math.atan2(r*Math.sin(e),i.sphip*r*s+i.cphip*a)+i.lamp),t.y=Math.asin(i.sphip*a-i.cphip*r*s);const o=i.obliqueProjection.forward(t);return i.isIdentity&&(o.x*=Ze,o.y*=Ze),o}function my(i,t){let{x:e,y:n}=t;e=at(e-i.long0,i.over);const s=Math.cos(n),a=Math.cos(e);t.x=at(Math.atan2(s*Math.sin(e),Math.sin(n))+i.lamp),t.y=Math.asin(-1*s*a);const r=i.obliqueProjection.forward(t);return i.isIdentity&&(r.x*=Ze,r.y*=Ze),r}function _y(i,t){i.isIdentity&&(t.x*=he,t.y*=he);const e=i.obliqueProjection.inverse(t);let{x:n,y:s}=e;if(n<Number.MAX_VALUE){n-=i.lamp;const a=Math.cos(n),r=Math.sin(s),o=Math.cos(s);t.x=Math.atan2(o*Math.sin(n),i.sphip*o*a-i.cphip*r),t.y=Math.asin(i.sphip*r+i.cphip*o*a)}return t.x=at(t.x+i.long0),t}function gy(i,t){i.isIdentity&&(t.x*=he,t.y*=he);const e=i.obliqueProjection.inverse(t);let{x:n,y:s}=e;if(n<Number.MAX_VALUE){const a=Math.cos(s);n-=i.lamp,t.x=Math.atan2(a*Math.sin(n),-1*Math.sin(s)),t.y=Math.asin(a*Math.cos(n))}return t.x=at(t.x+i.long0),t}var vy=["General Oblique Transformation","General_Oblique_Transformation","ob_tran"];const My={init:cy,forward:uy,inverse:fy,names:vy};function xy(i){i.Proj.projections.add(qa),i.Proj.projections.add(Ya),i.Proj.projections.add(rx),i.Proj.projections.add(mx),i.Proj.projections.add(xx),i.Proj.projections.add(Tx),i.Proj.projections.add(Ix),i.Proj.projections.add(Fx),i.Proj.projections.add(kx),i.Proj.projections.add(qx),i.Proj.projections.add(n1),i.Proj.projections.add(h1),i.Proj.projections.add(p1),i.Proj.projections.add(x1),i.Proj.projections.add(T1),i.Proj.projections.add(C1),i.Proj.projections.add(F1),i.Proj.projections.add(k1),i.Proj.projections.add(X1),i.Proj.projections.add(Z1),i.Proj.projections.add(eS),i.Proj.projections.add(rS),i.Proj.projections.add(uS),i.Proj.projections.add(vS),i.Proj.projections.add(ES),i.Proj.projections.add(PS),i.Proj.projections.add(FS),i.Proj.projections.add(kS),i.Proj.projections.add(qS),i.Proj.projections.add(JS),i.Proj.projections.add(iy),i.Proj.projections.add(hy),i.Proj.projections.add(My)}const br=Object.assign(EM,{defaultDatum:"WGS84",Proj:ci,WGS84:new ci("WGS84"),Point:xs,toPoint:Gl,defs:Le,nadgrid:iM,transform:yM,mgrs:bM,version:"__VERSION__"});xy(br);function Sy(i,t,e){return[i.originX+(t+.5)*i.resolutionM,i.originY-(e+.5)*i.resolutionM]}function sf(i,t,e){const n=Math.floor((t-i.originX)/i.resolutionM),s=Math.floor((i.originY-e)/i.resolutionM);return n<0||s<0||n>=i.width||s>=i.height?null:{col:n,row:s}}function af(i,t,e){return[t-(i.originX+i.width*i.resolutionM/2),e-(i.originY-i.height*i.resolutionM/2)]}function yy(i,t,e){return[t+i.originX+i.width*i.resolutionM/2,e+i.originY-i.height*i.resolutionM/2]}const Yl="+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs",$l=[{id:"syabrubesi",name:"Syabrubesi",lon:85.3344,lat:28.1633,color:"#ffd45c"},{id:"timure",name:"Timure",lon:85.3702,lat:28.2555,color:"#38d4c5"},{id:"rasuwagadhi",name:"Rasuwagadhi",lon:85.377744,lat:28.279672,color:"#ff6b9c"}],rf=document.querySelector("#viewport"),of=document.querySelector("#inspection"),Ey=document.querySelector("#statistics"),by=document.querySelector("#legend"),Oc=document.querySelector("#exaggeration"),Ty=document.querySelector("#exaggeration-value"),lf=document.querySelector("#unsupported"),Gc=document.querySelector("#context-toggle"),Bc=document.querySelector("#context-panel"),wy=document.querySelector("#map-coordinates"),_l=document.querySelector("#product-grid"),hf=document.querySelector("#imagery-panel"),Ay=document.querySelector("#imagery-close"),zc=document.querySelector("#imagery-location"),Py=document.querySelector("#view-a-crop"),Ry=document.querySelector("#view-b-crop"),Cy=document.querySelector("#view-a-meta"),Iy=document.querySelector("#view-b-meta"),Ly=new URLSearchParams(location.search),cf=Ly.get("grid")==="10m"?"10m":"32m";_l.value=cf;_l.addEventListener("change",()=>{const i=new URL(location.href);_l.value==="10m"?i.searchParams.set("grid","10m"):i.searchParams.delete("grid"),location.assign(i)});const Hi=new Pd;Hi.background=new Et(462872);Hi.fog=new gr(462872,85e-6);const gi=new li(45,innerWidth/innerHeight,1,1e5);gi.position.set(6e3,-9e3,7e3);const Vi=new tv({antialias:!0});Vi.setPixelRatio(Math.min(devicePixelRatio,2));Vi.setSize(innerWidth,innerHeight);rf.append(Vi.domElement);const Wi=new iv(gi,Vi.domElement);Wi.enableDamping=!0;Wi.dampingFactor=.08;Wi.target.set(0,0,500);Hi.add(new Jd(12314879,1515535,2.3));const uf=new tp(16773332,2.5);uf.position.set(-5e3,-3e3,9e3);Hi.add(uf);const Vs=new ns;Hi.add(Vs);const fr=new Map,ff=new Map;let cn,po,Ka,Ee,ln,df=null;const Ny=[new Et(7153789),new Et(2578853),new Et(15066072),new Et(13669421),new Et(8003854)];let Gt,ms,dr,ls="change",Nn=2,Za,gl;function Oa(i,t,e,n){const a=Math.max(0,Math.min(.999,(i-t)/(e-t)))*(n.length-1),r=Math.floor(a);return n[r].clone().lerp(n[Math.min(r+1,n.length-1)],a-r)}function Dy(i){const t=Gt.measured[i]===1;return!t&&!lf.checked?new Et(462872):t?ls==="change"&&Gt.significance[i]===0?new Et(6713464):ls==="change"?Oa(Gt.surfaceChangeM[i]??0,-20,20,Ny):ls==="uncertainty"?Oa(Gt.uncertaintyM[i]??0,0,10,[new Et(2071922),new Et(15777349),new Et(13056824)]):ls==="support"?Oa(Gt.supportCount[i]??0,1,5,[new Et(5859443),new Et(6672616),new Et(16777215)]):Oa(Gt.elevationM[i]??Gt.baseElevationM,Gt.baseElevationM,Gt.baseElevationM+1800,[new Et(1592637),new Et(7834450),new Et(12889986),new Et(15855592)]):new Et(2503226)}function pf(i,t){const e=t*Gt.width+i;return Gt.elevationM[e]??Gt.baseElevationM}function Uy(i,t){const e=document.createElement("canvas");e.width=512,e.height=112;const n=e.getContext("2d");n.fillStyle="rgba(4, 16, 24, .88)",n.strokeStyle=t,n.lineWidth=5,n.beginPath(),n.roundRect(4,4,504,104,18),n.fill(),n.stroke(),n.fillStyle="#fff",n.font="700 38px Inter, system-ui, sans-serif",n.textAlign="center",n.textBaseline="middle",n.fillText(i,256,57);const s=new kd(e);s.colorSpace=ii;const a=new Dd(new du({map:s,transparent:!0,depthTest:!1,fog:!1}));return a.scale.set(1e3,220,1),a.position.z=440,a.renderOrder=30,a}function kc(i,t,e){const n=new ns;n.userData.pinId=i;const s=new Cl({color:e,depthTest:!1,fog:!1}),a=new ui(new Ll(22,22,220,14),s);a.rotation.x=Math.PI/2,a.position.z=110,a.renderOrder=25;const r=new ui(new Nl(72,20,16),s);return r.position.z=270,r.renderOrder=25,n.add(a,r,Uy(t,e)),n}function pr(i,t,e){const n=sf(Gt,t,e);if(!n)return i.visible=!1,!1;const[s,a]=af(Gt,t,e);return i.position.set(s,a,(pf(n.col,n.row)-Gt.baseElevationM)*Nn+18),i.userData.east=t,i.userData.north=e,i.visible=!0,!0}function Fy(){Vs.clear(),fr.clear();for(const i of $l){const[t,e]=br("EPSG:4326",Yl,[i.lon,i.lat]),n=kc(i.id,i.name,i.color);pr(n,t,e),fr.set(i.id,n),Vs.add(n)}cn=kc("selected-location","Selected","#ff3b8d"),cn.visible=!1,Vs.add(cn)}function Oy(){for(const i of fr.values())pr(i,Number(i.userData.east),Number(i.userData.north));cn?.visible&&ln&&!ln.pinId&&pr(cn,ln.east,ln.north)}function Tr(){for(let i=0;i<Gt.elevationM.length;i+=1){Za[i*3+2]=((Gt.elevationM[i]??Gt.baseElevationM)-Gt.baseElevationM)*Nn;const t=Dy(i);gl.set([t.r,t.g,t.b],i*3)}if(ms.geometry.attributes.position.needsUpdate=!0,ms.geometry.attributes.color.needsUpdate=!0,ms.geometry.computeVertexNormals(),dr&&Gt.buildings){const i=dr.geometry.getAttribute("position");Gt.buildings.forEach((t,e)=>{i.setZ(e,(t.elevationM-Gt.baseElevationM)*Nn+20)}),i.needsUpdate=!0}Oy()}function mf(){const i={change:"−20 m negative residual ← 0 → +20 m positive residual",elevation:"Low elevation → high elevation",uncertainty:"Low uncertainty → high uncertainty",support:"Sparse support → repeated support"};by.title=i[ls]}function _f(i){df=i;for(const[t,e]of fr)e.scale.setScalar(t===i?1.35:1);for(const[t,e]of ff)e.getElement().classList.toggle("active",t===i)}function Gy(i,t,e){const[n,s]=af(Gt,i,t),a=new U(n,s,(e-Gt.baseElevationM)*Nn),r=gi.position.clone().sub(Wi.target);r.length()<1200&&r.set(1800,-2600,2100),Wi.target.copy(a),gi.position.copy(a.clone().add(r)),Wi.update()}function gf(i,t=!1){const e=document.createElement("button");return e.className=`geo-pin${t?" selected-location":""}`,e.dataset.pinId=i.id,e.style.setProperty("--pin-color",i.color),e.title=i.name,e.setAttribute("aria-label",i.name),e}function vf(i){if(!(!Ee||!Ka)){if(po?.remove(),po=void 0,!i.pinId){const t=gf({id:"selected-location",name:"Selected terrain cell",lon:i.lon,lat:i.lat,color:"#ff3b8d"},!0);po=new Ka.Marker({element:t,anchor:"center"}).setLngLat([i.lon,i.lat]).setPopup(new Ka.Popup({offset:18}).setHTML(`<strong>Selected terrain cell</strong><br>${i.lat.toFixed(5)}°N, ${i.lon.toFixed(5)}°E`)).addTo(Ee)}Ee.flyTo({center:[i.lon,i.lat],zoom:Math.max(Ee.getZoom(),13),duration:650})}}function By(i){const t=Gt.elevationM[i.index],e=Gt.surfaceChangeM[i.index],n=Gt.uncertaintyM[i.index],s=Gt.supportCount[i.index]??0;of.textContent=`${i.label} · ${i.lat.toFixed(5)}°N, ${i.lon.toFixed(5)}°E · contextual elevation ${t?.toFixed(1)??"n/a"} m · residual Δh ${e?.toFixed(1)??"unsupported"} m · uncertainty ${n?.toFixed(1)??"n/a"} m · support ${s}`}function Mf(i,t,e,n=null,s=!0){const a=sf(Gt,i,t);if(!a){of.textContent=`${e} is outside the current product grid.`;return}const r=a.row*Gt.width+a.col,[o,l]=Sy(Gt,a.col,a.row),[h,f]=br(Yl,"EPSG:4326",[o,l]),u={...a,index:r,east:o,north:l,lon:h,lat:f,label:e,pinId:n};ln=u,_f(n),cn&&(cn.visible=!n,n||pr(cn,o,l)),By(u),vf(u),qy(u),s&&Gy(o,l,pf(a.col,a.row))}function vl(i,t,e,n=null,s=!0){const[a,r]=br("EPSG:4326",Yl,[i,t]);Mf(a,r,e,n,s)}function zy(i){let t=i;for(;t;){if(typeof t.userData.pinId=="string")return t.userData.pinId;t=t.parent}return null}function ky(){const i=new np,t=new Rt;let e;Vi.domElement.addEventListener("pointerdown",n=>{e={x:n.clientX,y:n.clientY}}),Vi.domElement.addEventListener("pointerup",n=>{if(!e||Math.hypot(n.clientX-e.x,n.clientY-e.y)>5)return;const s=Vi.domElement.getBoundingClientRect();t.set((n.clientX-s.left)/s.width*2-1,-((n.clientY-s.top)/s.height)*2+1),i.setFromCamera(t,gi);const a=i.intersectObjects(Vs.children,!0)[0];if(a){const h=zy(a.object),f=$l.find(u=>u.id===h);if(f){vl(f.lon,f.lat,f.name,f.id);return}}const r=i.intersectObject(ms)[0];if(!r)return;const[o,l]=yy(Gt,r.point.x,r.point.y);Mf(o,l,"Selected terrain cell",null,!1)})}function Hy(i){Gt=i;const{width:t,height:e,resolutionM:n}=Gt,s=Math.max(t,e)*n;gi.position.set(s*.38,-s*.58,s*.45),gi.far=s*10,gi.updateProjectionMatrix(),Hi.fog=new gr(462872,1.35/s),Za=new Float32Array(t*e*3),gl=new Float32Array(t*e*3);const a=[];for(let l=0;l<e;l+=1)for(let h=0;h<t;h+=1){const f=l*t+h;Za.set([(h-(t-1)/2)*n,((e-1)/2-l)*n,0],f*3)}for(let l=0;l<e-1;l+=1)for(let h=0;h<t-1;h+=1){const f=l*t+h,u=f+1,c=f+t,d=c+1;a.push(f,c,u,u,c,d)}const r=new Xe;if(r.setAttribute("position",new He(Za,3)),r.setAttribute("color",new He(gl,3)),r.setIndex(a),ms=new ui(r,new $d({vertexColors:!0,roughness:.86,metalness:0,side:bi})),Hi.add(ms),Fy(),Tr(),Gt.buildings?.length){const l=new Float32Array(Gt.buildings.length*3),h=new Float32Array(Gt.buildings.length*3);Gt.buildings.forEach((u,c)=>{l.set([(u.col-(t-1)/2)*n,((e-1)/2-u.row)*n,(u.elevationM-Gt.baseElevationM)*Nn+20],c*3);const d=u.significanceClass??"MEASURED_NOT_SIGNIFICANT",_=d==="SIGNIFICANT_POSITIVE"?new Et(16739122):d==="SIGNIFICANT_NEGATIVE"?new Et(8406727):new Et(7635852);h.set([_.r,_.g,_.b],c*3)});const f=new Xe;f.setAttribute("position",new He(l,3)),f.setAttribute("color",new He(h,3)),dr=new zd(f,new mu({size:28,vertexColors:!0,sizeAttenuation:!0})),Hi.add(dr)}const o={changeMedianM:"residual Δh median m",changeP10M:"residual Δh p10 m",changeP90M:"residual Δh p90 m",significantCells:"two-sigma residual cells"};Ey.innerHTML=Object.entries(Gt.statistics).map(([l,h])=>`<dt>${o[l]??l.replace(/[A-Z]/g,f=>` ${f.toLowerCase()}`)}</dt><dd>${typeof h=="number"?h.toFixed(l.includes("Fraction")?3:2):"n/a"}</dd>`).join(""),Wi.target.set(0,0,500),Wi.update(),mf(),ky()}document.querySelectorAll("button[data-mode]").forEach(i=>{i.addEventListener("click",()=>{document.querySelectorAll("button[data-mode]").forEach(t=>t.classList.remove("active")),i.classList.add("active"),ls=i.dataset.mode,Tr(),mf()})});Oc.addEventListener("input",()=>{Nn=Number(Oc.value),Ty.value=`${Nn}×`,Tr()});lf.addEventListener("change",Tr);addEventListener("resize",()=>{gi.aspect=innerWidth/innerHeight,gi.updateProjectionMatrix(),Vi.setSize(innerWidth,innerHeight)});async function Vy(){if(Ee)return;const i=await Cf(()=>import("./maplibre-gl-DRBtsT0Z.js"),[],import.meta.url);Ka=i,Ee=new i.Map({container:"context-map",center:[85.35,28.21],zoom:10.3,attributionControl:!0,style:{version:8,sources:{osm:{type:"raster",tiles:["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],tileSize:256,attribution:"© OpenStreetMap contributors"}},layers:[{id:"osm",type:"raster",source:"osm"}]}}),Ee.addControl(new i.NavigationControl({showCompass:!1}),"top-right"),Ee.on("mousemove",t=>{wy.value=`${t.lngLat.lat.toFixed(5)}°N, ${t.lngLat.lng.toFixed(5)}°E`}),Ee.on("click",t=>{vl(t.lngLat.lng,t.lngLat.lat,"Selected map location",null,!0)}),Ee.on("load",async()=>{const t=await Promise.all(["unosat_damage_area","hot_flood_extent","strong-pair-common-footprint","measured-support","mapped-tiles-1km"].map(async e=>[e,await fetch(`./context/${e}.geojson`).then(n=>n.json())]));for(const[e,n]of t)Ee.addSource(e,{type:"geojson",data:n});Ee.addLayer({id:"unosat-fill",type:"fill",source:"unosat_damage_area",paint:{"fill-color":"#d94c4c","fill-opacity":.22}}),Ee.addLayer({id:"unosat-line",type:"line",source:"unosat_damage_area",paint:{"line-color":"#d94c4c","line-width":2.5}}),Ee.addLayer({id:"hot-line",type:"line",source:"hot_flood_extent",paint:{"line-color":"#ff7777","line-width":2}}),Ee.addLayer({id:"pair-line",type:"line",source:"strong-pair-common-footprint",paint:{"line-color":"#18c8f4","line-width":3}}),Ee.addLayer({id:"measured-fill",type:"fill",source:"measured-support",paint:{"fill-color":"#f4aa35","fill-opacity":.82}}),Ee.addLayer({id:"tiles-line",type:"line",source:"mapped-tiles-1km",paint:{"line-color":"#f5e76b","line-width":1.5}});for(const e of $l){const n=gf(e);let s;n.addEventListener("click",a=>{a.stopImmediatePropagation(),a.preventDefault(),vl(e.lon,e.lat,e.name,e.id,!0),s.togglePopup()}),s=new i.Marker({element:n,anchor:"bottom"}).setLngLat([e.lon,e.lat]).setPopup(new i.Popup({offset:22,anchor:"bottom"}).setHTML(`<strong>${e.name}</strong><br>${e.lat.toFixed(5)}°N, ${e.lon.toFixed(5)}°E<br><small>Same colour in the 3D terrain</small>`)).addTo(Ee),ff.set(e.id,s)}Ee.fitBounds([[85.3002,28.1297],[85.4039,28.293]],{padding:34,duration:0}),ln&&vf(ln),_f(df)})}Gc.addEventListener("click",async()=>{Bc.classList.toggle("visible");const i=Bc.classList.contains("visible");Gc.classList.toggle("active",i),i&&(await Vy(),setTimeout(()=>Ee?.resize(),0))});function Wy(i){return new Promise((t,e)=>{const n=new Image;n.onload=()=>t(n),n.onerror=()=>e(new Error(`Unable to load ${i}`)),n.src=i})}async function Hc(i){const t=await fetch(`./imagery/${i}.json`).then(async e=>{if(!e.ok)throw new Error(`Imagery metadata request failed: ${e.status}`);return await e.json()});return{metadata:t,image:await Wy(`./imagery/${t.image}`)}}let Vc;function Xy(){return Vc??=Promise.all([Hc("view-a"),Hc("view-b")]),Vc}function Wc(i,t,e){const n=i.getContext("2d"),{metadata:s,image:a}=t,r=(e.east-s.originX)/s.resolutionM,o=(s.originY-e.north)/s.resolutionM,l=Math.round(640/s.resolutionM);n.fillStyle="#020609",n.fillRect(0,0,i.width,i.height),n.imageSmoothingEnabled=!0,n.imageSmoothingQuality="high",n.drawImage(a,r-l/2,o-l/2,l,l,0,0,i.width,i.height);const h=i.width/2,f=i.height/2;n.strokeStyle="rgba(0, 0, 0, .8)",n.lineWidth=5,n.beginPath(),n.moveTo(h-25,f),n.lineTo(h+25,f),n.moveTo(h,f-25),n.lineTo(h,f+25),n.stroke(),n.strokeStyle="#ff3b8d",n.lineWidth=2,n.stroke();const u=100/640*i.width;n.strokeStyle="#fff",n.lineWidth=4,n.beginPath(),n.moveTo(18,i.height-22),n.lineTo(18+u,i.height-22),n.stroke(),n.fillStyle="#fff",n.font="700 18px system-ui, sans-serif",n.fillText("100 m",18,i.height-30)}function Xc(i){return`${i.acquiredAt.slice(11,19)}Z · ${i.offNadirDeg.toFixed(1)}° off-nadir · az ${i.azimuthDeg.toFixed(1)}°`}async function qy(i){hf.classList.add("visible"),document.body.classList.add("imagery-open");const t=Gt.measured[i.index]===1;zc.textContent=`${i.label} · ${i.lat.toFixed(5)}°N, ${i.lon.toFixed(5)}°E · ${t?"direct parallax support":"no direct parallax support at this cell"}`;try{const[e,n]=await Xy();if(ln!==i)return;Cy.textContent=Xc(e.metadata),Iy.textContent=Xc(n.metadata),Wc(Py,e,i),Wc(Ry,n,i)}catch(e){zc.textContent=`Satellite preview unavailable: ${String(e)}`}}Ay.addEventListener("click",()=>{hf.classList.remove("visible"),document.body.classList.remove("imagery-open")});function xf(){requestAnimationFrame(xf),Wi.update(),Vi.render(Hi,gi)}xf();fetch(cf==="10m"?"./data/surface-grid-10m.json":"./data/surface-grid.json").then(async i=>{if(!i.ok)throw new Error(`Data request failed: ${i.status}`);return await i.json()}).then(Hy).catch(i=>{rf.innerHTML=`<div class="error"><h2>Terrain data unavailable</h2>${String(i)}</div>`});
