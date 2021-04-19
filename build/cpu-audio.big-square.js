(()=>{"use strict";
/** @license
Cpu-Audio: an extension to the hash system to address timecode into audio/video elements and a player WebComponent
Version 6.7pre
Copyright (C) 2014-2021 Xavier "dascritch" Mouton-Dubosc & contributors.
License GNU GPL 3

- project mini-site https://dascritch.github.io/cpu-audio/
- project repository : https://github.com/dascritch/cpu-audio
- use case : http://cpu.pm
- blog post : https://dascritch.net/post/2018/11/06/Reconstruire-son-lecteur-audio-pour-le-web
**/
const t="CPU-AUDIO",e="CPU-CONTROLLER",n="audio[controls]",a="cpu-audio audio",o={passive:!0},i={passive:!0,once:!0};function r(t,e,n=document){Array.from(n.querySelectorAll(t)).forEach(e)}function s(t,e,n){if(!t?.indexOf)return null;const a=t.indexOf(e);return-1===a?null:t[a+n]}function l(){return void 0!==window.customElements}function d(t){let e=document.createElement("a");return e.href="string"!=typeof t?t:t.split("#")[0],e.href}function c(){return!window.matchMedia("screen").matches}function u(t){d(window.location.href)===d(t.target.href)&&t.preventDefault()}function h(t){let e=document.createElement("span");e.innerText=t;let n=e.innerHTML;return e.remove(),n}function p(n){if([t,e].includes(n.tagName))return n.CPU;let a=n.closest(t)??n.closest(e);return a?a.CPU:n.getRootNode().host.CPU}function m(e){window.console.warn(`${t}: `,e)}const g={fr:{loading:"Chargement en cours…",pause:"Pause",play:"Lecture",canonical:"Lien vers la fiche du sonore",moment:"Lien vers ce moment",untitled:"(sans titre)",cover:"pochette",more:"Actions",share:"Partager",twitter:"Partager sur Twitter",facebook:"Partager sur Facebook",e_mail:"Partager par e-mail",download:"Télécharger",back:"Annuler",chapters:"Chapitres",playlist:"Playlist",media_err_aborted:"Vous avez annulé la lecture.",media_err_network:"Une erreur réseau a causé l'interruption du téléchargement.",media_err_decode:"La lecture du sonore a été annulée suite à des problèmes de corruption ou de fonctionnalités non supportés par votre navigateur.",media_err_src_not_supported:"Le sonore n'a pu être chargé, soit à cause de sourcis sur le serveur, le réseau ou parce que le format n'est pas supporté.",media_err_unknow:"Erreur due à une raison inconnue."},en:{loading:"Loading…",pause:"Pause",play:"Play",canonical:"Link to the sound's page",moment:"Link to this time",untitled:"(untitled)",cover:"cover",more:"Actions",share:"Share",twitter:"Share on Twitter",facebook:"Share on Facebook",e_mail:"Share via e-mail",download:"Download",back:"Back",chapters:"Chapters",playlist:"Playlist",media_err_aborted:"You have aborted the play.",media_err_network:"A network error broke the download.",media_err_decode:"Play was canceled due to file corruption or a not supported function in your browser.",media_err_src_not_supported:"The media cannot be downloaded due to server problems, network problems or unsupported by your browser.",media_err_unknow:"Error of unknown cause."}};let f=document.querySelector("html").lang;if(!f.length||!(f.toLowerCase()in g)){f="en";let t=window.navigator.languages;t=void 0!==t?t:[navigator.language||navigator.browserLanguage];let e=!1;for(let n of t)if(n.split){let t=n.split("-")[0];!e&&t in g&&(f=t)}}const y=g[f];let w=document.head;const v={get title(){for(const t of['property="og:title"','name="twitter:title"']){const e=w.querySelector(`meta[${t}]`);if(e)return e.content}const t=document.title;return""===t?null:t},get poster(){for(const t of['property="og:image"','name="twitter:image:src"']){const e=w.querySelector(`meta[${t}]`);if(e)return e.content}return null},get canonical(){const t=w.querySelector('link[rel="canonical"]');return t?t.href:location.href.split("#")[0]},get twitter(){const t=w.querySelector('meta[name="twitter:creator"]');return t&&t.content.length>1?t.content:null},playlist:null,waveform:null,duration:null,download:null},b={d:86400,h:3600,m:60,s:1};let P=[1,60,3600,86400];const C=/^\d+$/,_=/\D*/g,k=function(t){let e=0;return""!==t&&(e=C.test(t)?Number(t):t.includes(":")?U.colontimeInSeconds(t):U.subunittimeInSeconds(t)),e},T=function(t){if(t===1/0)return"?";let e="",n=!1;for(let a in b)if(b.hasOwnProperty(a)){let o=b[a];if(t>=o||n){n=!0;let i=Math.floor(t/o);e+=i+a,t-=i*o}}return""===e?"0s":e},E=function(t){if(t===1/0)return"?";let e="",n=!1;for(let a in b)if(b.hasOwnProperty(a)){let o=b[a];if(t>=o||n){n=!0;let a=Math.floor(t/o);e+=""===e?"":":",e+=(a<10&&""!==e?"0":"")+a,t-=a*o}}return 1===e.length?`0:0${e}`:2===e.length?`0:${e}`:""===e?"0:00":e},L=function(t){return`P${U.secondsInTime(t).toUpperCase()}`},U={timeInSeconds:k,subunittimeInSeconds:function(t){let e,n=0;for(let a in b)b.hasOwnProperty(a)&&t.includes(a)&&([e,t]=t.split(a),n+=Number(e.replace(_,""))*b[a]);return n},colontimeInSeconds:function(t){let e=0,n=t.split(":");for(let t=0;t<n.length;t++)e+=Number(n[t])*P[n.length-1-t];return e},secondsInTime:T,secondsInColonTime:E,secondsInPaddledColonTime:function(t){if(t===1/0)return"?";let e=U.secondsInColonTime(t);return"00:00:00".substr(0,8-e.length)+e},durationIso:L},A={i:"i",em:"i",b:"b",bold:"strong",u:"u",lang:"i"},I={i:"i",em:"i",b:"b",strong:"b",u:"u"};let x=A;const N=/<(\w+)(\.[^>]+)?( [^>]+)?>/gi,$=/<\/(\w+)( [^>]*)?>/gi,S=/\n/gi,O=/<br\s*[^>]*>/gi;function D(t){return!(t in x)}function M(t,e,n,a){if(D(e=e.toLowerCase()))return"";let o="";return"lang"==e&&(o=` lang="${a.trim()}"`),`<${x[e]}${o}>`}function H(t,e){return D(e=e.toLowerCase())?"":`</${x[e]}>`}function q(t,e=!0){if(x=e?A:I,t.split("<").length!==t.split(">").length)return h(t);const n=t.replace(N,M).replace($,H);return e?n.replace(S,"<br/>"):n.replace(O,"\n")}const R="_playlist";function j({id:t}){const e=document.CPU.playlists,n=document.CPU.currentPlaylistID();let a=!1;for(let o in e){const i=e[o].length,r=e[o].filter((e=>e!==t&&document.getElementById(e)));i!==r.length&&o===n&&(a=!0),document.CPU.playlists[o]=r,0===r.length&&delete document.CPU.playlists[o]}a&&F()}function B(){const t=document.CPU.globalController;if(!t)return;const e=t.current_playlist,n={};if(t.clearPlane(R),0!==t.current_playlist.length){for(let t of e)n[t]={text:document.getElementById(t)?.dataset.title,link:`#${t}&t=0`};t.bulkPoints(R,n),t.element.shadowRoot.querySelector("main").insertAdjacentElement("afterend",t.planePanel(R))}else t.removePlane(R)}function F(t){const e=document.CPU.globalController;if(!e||!e.isController)return;let n=e.current_playlist;if(e.current_playlist=document.CPU.currentPlaylist(),e.plane(R)||e.addPlane(R,{title:y.playlist,track:!1,panel:"nocuetime",highlight:!0,_comp:!0}),n!==e.current_playlist&&B(),e.highlightPoint(R,e.audiotag.id,vt),t){const{planeName:n,pointName:a}=_t(t);e.focusPoint(n,a)}}function z(t){let e=t.target;if(null!==document.CPU.currentAudiotagPlaying||K(e))return;let n=Number(window.localStorage.getItem(e.currentSrc));n>0&&!at&&(document.CPU.seekElementAt(e,n),ot.play(null,e))}HTMLAudioElement.prototype._CPU_played=null,HTMLAudioElement.prototype._CPU_planes=null;let V=0;function K(t){return null==t||t.duration===1/0||null!=t.dataset.streamed}function W(t){return t===1/0||null===t||isNaN(t)}function G(t){return 0===t||W(t)}function Z({duration:t,dataset:e}){let n=null,a=Number(t);if(G(a)){const t=Number(e.duration);G(t)||(n=t)}else n=a;return n}function X(t,e){if(W(e))return null;e=e<0?0:e;const n=Z(t);return G(n)||(e=e<n?e:n),e}function Y(t,e=null,n=null){t&&(t.readyState>t.HAVE_NOTHING?e?.(n):(e&&t.addEventListener("loadedmetadata",(()=>{e?.(n)}),i),t.load()))}function J(t){t.addEventListener("loadedmetadata",z,i),t.addEventListener("play",ot.playOnce,o),t.addEventListener("ended",ot.nexttrack,o),t.addEventListener("ready",z,o),t.addEventListener("canplay",z,o),["ready","load","loadeddata","canplay","abort","error","emptied","play","playing","pause","ended","durationchange","loadedmetadata","timeupdate","waiting"].forEach((e=>{t.addEventListener(e,ot.update,o)})),l()||["pause","ended"].forEach((e=>{t.addEventListener(e,ot.pause,o)})),""===t.getAttribute("preload")&&Y(t)}function Q(t){null==t._CPU_played&&(t._CPU_played=!1,J(t),t.hidden=!0,t.removeAttribute("controls"),function(t){if("string"==typeof t.dataset.playlist){const e=t.dataset.playlist;e in document.CPU.playlists||(document.CPU.playlists[e]=[]),document.CPU.playlists[e].push(t.id),document.CPU.globalController&&e===document.CPU.currentPlaylistID()&&F()}}(t))}let tt=null,et=0,nt=!1,at=!1;const ot={_end:()=>nt,update:function({target:t}){!1!==nt&&t.currentTime>nt&&ot.pause(void 0,t),function(t){p(t)?.update(),document.CPU.globalController?.update()}(t),t.paused||K(t)||window.localStorage.setItem(t.currentSrc,String(t.currentTime))},hashOrder:async function(t,e=null){let n=!0;"string"!=typeof t&&(n="at_start"in t,t=location.hash.substr(1));let a="",o="",i=t.split("&"),r=!1;for(let t of i)if(t.includes("=")||""!==a){let[e,n]=t.split("=");switch(e){case"t":o=n||"0",r=!0;break;case"autoplay":r="1"===n;break;case"auto_play":r="true"===n}}else a=t;if(""===o||n&&!r)return void e?.();let[s,l]=o.split(",");et=k(s),nt=void 0!==l&&k(l),!1!==nt&&(nt=nt>et&&nt),await document.CPU.jumpIdAt(a,s,e),F()},hover:function(t){const{target:e,clientX:n,targetTouches:a}=t;if(!e)return;const o=p(e),i=o.audiotag,r=Z(i);if(G(r))return void(K(i)||Y(i,ot.hover,t));const{x:s,width:l}=o.shadowId("time").getBoundingClientRect(),d=((n??a?.[0]?.clientX)-s)/l;o.showThrobberAt(X(i,d*r))},out:function({target:t}){p(t).hideThrobber()},throbble:function(t){const{target:e,offsetX:n,at:a}=t,o=document.CPU,i=p(e),r=i.audiotag;if(a>=0)return void o.seekElementAt(r,a);const s=n/e.clientWidth,l=Z(r);o.currentAudiotagPlaying&&!o.isAudiotagPlaying(r)&&ot.pause(null,o.currentAudiotagPlaying),ot.play(t,r),G(l)?i.updateLoading(void 0,100):o.seekElementAt(r,s*l)},pause:function(t=null,e=null){if(!e){let{target:n}=t;e="AUDIO"==n.tagName?n:p(n).audiotag}e.pause(),document.CPU.currentAudiotagPlaying=null,window.localStorage.removeItem(e.currentSrc)},playOnce:function({target:t}){let e=document.CPU;document.CPU.lastUsed=t,e.playStopOthers&&e.currentAudiotagPlaying&&!e.isAudiotagPlaying(t)&&ot.pause(void 0,e.currentAudiotagPlaying),e.currentAudiotagPlaying=t},play:function(t=null,e=null){if(!t&&at)return void m("play() prevented because already waiting for focus");var n;e=e??p(t.target).audiotag,at=!1,((n=e.currentTime)<et||!1!==nt&&n>nt)&&(et=0,nt=!1);let a=e.play();a&&a.then((()=>{document.CPU.hadPlayed=!0})).catch((n=>{at=!0;const a=()=>{!function(t,e){at=!1,document.CPU.autoplay&&ot.play(t,e)}(t,e)};switch(n.name){case"NotAllowedError":if(m("Auto-play prevented : Browser requires a manual interaction first."),document.addEventListener("focus",a,i),document.addEventListener("click",a,i),null!=e._CPU_played){let t=p(e);t.glowBeforePlay=!0,t.setAct("glow")}break;case"NotSupportedError":n("The browser refuses the audio source, probably due to audio format.")}})),It(e)},toggleplay:function({target:t}){const e=p(t).audiotag;e.paused?ot.play(null,e):ot.pause(null,e)},key:function(t,e=1){if(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)return;let n=p(t.target),a=n.audiotag;function o(e){let o=X(a,a.currentTime+e);t.at=o,n.showThrobberAt(t.at),ot.throbble(t),n.hideThrobberLater()}switch(t.keyCode){case 13:if("control"!=n.focused()?.id.toLowerCase())return;ot.toggleplay(t);break;case 27:ot.restart(t),ot.pause(null,a);break;case 32:ot.toggleplay(t);break;case 35:document.CPU.seekElementAt(a,a.duration);break;case 36:ot.restart(t);break;case 37:o(-document.CPU.keymove*e);break;case 39:o(+document.CPU.keymove*e);break;case 38:n.prevFocus();break;case 40:n.nextFocus();break;default:return}t.preventDefault?.()},restart:function({target:t}){let e=p(t);document.CPU.seekElementAt(e.audiotag,0)},reward:function(t){t.keyCode=37,ot.key(t)},foward:function(t){t.keyCode=39,ot.key(t)},fastreward:function(t){t.keyCode=37,ot.key(t,document.CPU.fastFactor)},fastfoward:function(t){t.keyCode=39,ot.key(t,document.CPU.fastFactor)},prevcue:function({target:t}){it(p(t),-1)},nextcue:function({target:t}){it(p(t),1)},cuechange:function(t,e){let n=document.body.classList;n.remove(tt),tt=`cpu_playing_tag_«${e.id}»_cue_«${t.id}»`,n.add(tt)},prevtrack:function({target:t},e=null){rt(e??p(t).audiotag,-1)},nexttrack:function({target:t},e=null){rt(e??p(t).audiotag,1)}};function it(t,e){const n=t.audiotag,a=t.planePoints("_chapters");if(!a)return;const{pointName:o}=_t(tt);let i=s(a,o,e),r=Object.values(a);e<0&&(r=r.reverse());const{currentTime:l}=n;if(!i)for(let t of r)!i&&(e<0&&t.end<=l||e>0&&t.start>=l)&&(i=t);i&&document.CPU.jumpIdAt(n.id,i.start)}function rt(t,e){const{id:n}=t,a=t.dataset.playlist;if(!a)return;const o=document.CPU.playlists[a];if(!o)return void m(`Named playlist ${a} not created. WTF ?`);let i=o.indexOf(n);if(i<0)return void m(`Audiotag ${n} not in playlist ${a}. WTF ?`);const r=o[i+e];if(!r)return;let s=document.getElementById(r);s?(document.CPU.seekElementAt(s,0),ot.play(null,s)):m(`Audiotag #${r} doesn't exists. WTF ?`)}let st=null;const lt=["fastreward","reward","foward","fastfoward"],dt={press:function(t){let e=t.target.id?t.target:t.target.closest("button");e.id&&lt.includes(e.id)&&(ot[e.id](t),st&&window.clearTimeout(st),st=window.setTimeout(dt.repeat,document.CPU.repeatDelay,{target:e}),t.preventDefault())},repeat:function(t){ot[t.target.id](t),st=window.setTimeout(dt.repeat,document.CPU.repeatFactor,t),t.preventDefault?.()},release:function(t){window.clearTimeout(st),st=null,t.preventDefault()}},ct={ev:null,down:function({target:t}){ct.ev=setTimeout(ct.do,document.CPU.alternateDelay,p(t))},do:function(t){t.showHandheldNav(),ct.ev=null},up:function(){clearTimeout(ct.ev),ct.ev=null}},ut="_chapters";function ht(t){if(!t)return null;let e=null;if(t.textTracks?.length>0)for(let n of t.textTracks)"chapters"!==n.kind.toLowerCase()||!n.cues||e&&n.language.toLowerCase()!==f||(e=n);return e}async function pt(t){if(t.isController)return;const e=t.audiotag;let n=!1;const a={};if(e){const i=ht(e);if(i?.cues.length>0){t.addPlane(ut,{title:y.chapters,track:"chapters"});const r=()=>{mt(t)};i.removeEventListener("cuechange",r),i.addEventListener("cuechange",r,o);for(let n of i.cues)t.point(ut,n.id)||(a[n.id]={start:X(e,Math.floor(n.startTime)),text:q(n.text),link:!0,end:X(e,Math.floor(n.endTime))});i.cues.length>0&&(n=!0),t.bulkPoints(ut,a),mt(t,{target:{activeCues:i.cues}})}}let i=`cpu_tag_«${e.id}»_chaptered`,r=document.body.classList;n?r.add(i):(t.removePlane(ut),r.remove(i))}function mt(t,e=null){const n=e?e.target.activeCues:ht(t.audiotag)?.activeCues;let a,o=t.audiotag.currentTime;if(n?.length>0)for(let t of n)t.startTime<=o&&o<t.endTime&&(a=t);a?.id!==t._activecue_id&&(t.removeHighlightsPoints(ut,vt),t._activecue_id=a?.id,a&&(ot.cuechange(a,t.audiotag),t.emitEvent("chapterChanged",{cue:a}),t.highlightPoint(ut,a.id,vt)))}function gt(t){let{title:e,canonical:n}=p(t.target).audiotagDataset();navigator.share({title:e,text:e,url:n}),t.preventDefault()}function ft(t){const e=t.shadowId("interface").classList;t.shadowId("poster")?.addEventListener("load",(()=>{e.add("poster-loaded")}),o);let n={pause:ot.pause,play:ot.play,time:ot.throbble,actions:()=>{t.showActions()},back:()=>{t.showMain()},poster:()=>{t.showMain()},restart:ot.restart,toggleplay:ot.toggleplay,prevcue:ot.prevcue,nextcue:ot.nextcue,prevtrack:ot.prevtrack,nexttrack:ot.nexttrack};for(let e in n)t.shadowId(e)?.addEventListener("click",n[e],o);const a=["fastreward","reward","foward","fastfoward"];for(let e of a){const n=t.shadowId(e);n?.addEventListener("pointerdown",dt.press),n?.addEventListener("pointerout",dt.release),n?.addEventListener("pointerup",dt.release)}t.element.addEventListener("keydown",ot.key);const r=t.shadowId("time");r?.addEventListener("pointerenter",ot.hover,o),r?.addEventListener("pointermove",ot.hover,o),r?.addEventListener("pointerout",ot.out,o),r?.addEventListener("pointerdown",ct.down,o),r?.addEventListener("pointerup",ct.up,o),navigator.share&&(e.add("hasnativeshare"),t.shadowId("nativeshare")?.addEventListener("click",gt,o));let s=t.shadowId("canonical");s&&s.addEventListener("click",u),t.audiotag&&(t.container.addEventListener("pointerenter",(()=>{Y(t.audiotag)}),i),t.audiotag.addEventListener("durationchange",(()=>{t.repositionTracks()}),o),function(t){const e=()=>{pt(t)};e();let n=t.audiotag;n.addEventListener("loadedmetadata",e,i);let a=n.querySelector('track[kind="chapters"]');a&&!a._CPU_load_ev&&(a._CPU_load_ev=a.addEventListener("load",e,o))}(t),F(),t.showMain(),t.updatePlayButton(),t.emitEvent("ready"),t.updateLinks())}const yt=["poster","actions","timeline","chapters","panels","panels-title","panels-except-play"],wt="with-preview",vt="active-cue",bt="_borders",Pt=/^[a-zA-Z0-9\-_]+$/,Ct=/^[a-zA-Z0-9\-_]+_«([a-zA-Z0-9\-_]+)(»_.*_«([a-zA-Z0-9\-_]+))?»$/;function _t(t){let e,n;return"string"==typeof t&&([,e,,n]=t?.match(Ct)||[]),{planeName:e??"",pointName:n??""}}function kt({target:t}){if(t.id||(t=t.closest("[id]")),!t)return;const{planeName:e,pointName:n}=_t(t.id);p(t).highlightPoint(e,n)}function Tt(t,e,n){return`${n?"panel":"track"}_«${t}»_point_«${e}»`}function Et({classList:t},e){e?t.remove("no"):t.add("no")}function Lt({start:t,end:e}){return(null==t||t>=0)&&(null==e||e>=t)}class Ut{constructor(t){this.element=t,this.shadow=t.shadowRoot,this.audiotag=t.audiotag,this.container=this.shadowId("interface"),this.mode_when_play=null,this.glowBeforePlay=!!t.hasAttribute("glow"),this.current_playlist=[],this._activecue_id=null,this.mode_was=null,this.act_was=null,this.isController=!1,t.CPU=this,this.audiotag&&!this.audiotag._CPU_planes&&(this.audiotag._CPU_planes={}),this._planes={};const e=document.CPU.globalController;this.audiotag&&e&&!e.audiotag&&It(this.audiotag),this.audiotag||(this.isController=!0,this.container.classList.add("controller"),document.CPU.globalController=this,this.audiotag=document.querySelector(a),Y(this.audiotag)),ft(this),this.attachAudiotagToInterface(this.audiotag),this.attributesChanges()}attributesChanges(){let t=null;if(this.element.hasAttribute("mode")){t=this.element.getAttribute("mode");const[e,n]=t.split(",");n&&(t=this.audiotag.paused?e:n,this.mode_when_play=n)}this.setMode(t),this.element.hasAttribute("hide")&&this.setHide(this.element.getAttribute("hide").split(" "))}mirroredInController(){const t=document.CPU.globalController;return t&&this.audiotag.isEqualNode(t.audiotag)}translateVTT(t,e){return q(t,e)}planeAndPointNamesFromId(t){return _t(t)}async emitEvent(t,e){this.element.dispatchEvent(new CustomEvent(`CPU_${t}`,{target:this.element,bubbles:!0,cancelable:!1,composed:!1,detail:e}))}shadowId(t){return this.shadow.getElementById(t)}setMode(t=null){if(t=t??"default",this.mode_was===t)return;const e=this.container.classList;e.remove(`mode-${this.mode_was}`),e.add(`mode-${t}`),this.mode_was=t}setAct(t){if(this.act_was===t)return;if(!document.CPU.hadPlayed&&"loading"===t){if(null!==this.act_was)return;t="glow"}const e=this.container.classList;e.remove("act-loading","act-buffer","act-pause","act-play","act-glow"),e.add(`act-${t}`),"play"===this.act_was&&"loading"===t&&e.add("act-buffer"),this.act_was=t}setHide(t){const e=this.container.classList;for(let t of yt)e.remove(`hide-${t}`);for(let n of t)n=n.toLowerCase(),yt.includes(n)&&e.add(`hide-${n}`)}updatePlayButton(){const t=this.audiotag,e=t.getAttribute("preload"),n=this.shadowId("control"),a="aria-label";let o=!e||"none"!==e.toLowerCase();if(t.readyState<t.HAVE_CURRENT_DATA&&(o||t._CPU_played))return this.setAct("loading"),void n.setAttribute(a,y.loading);let i="pause",r="play";t.paused&&(i="play",r="pause",!t._CPU_played&&this.glowBeforePlay&&(r="glow")),this.setAct(r),n.setAttribute(a,y[i]);let s="last-used";const l=this.container.classList;t.paused?this.audiotag.isEqualNode(document.CPU.lastUsed)||l.remove(s):(t._CPU_played=!0,l.add(s),this.mode_when_play&&(this.setMode(this.mode_when_play),this.mode_when_play=null))}updateLine(t,e=null){const n=this.shadowId("loadingline");if(!n)return;const{duration:a}=this.audiotag;e=e??(0===a?0:100*t/a),n.style.width=`${e}%`}updateTime(){const t=this.audiotag,e=K(t)?0:Math.floor(t.currentTime),n=t.dataset.canonical??"",a=n.indexOf("#"),o=this.shadowId("elapse");o&&(o.href=`${d(n)}#${a<0?t.id:n.substr(a+1)}&t=${e}`);this.shadowId("currenttime")&&(this.shadowId("currenttime").innerText=E(t.currentTime));const i=this.shadowId("totaltime");if(i){const e=Z(t);i.innerText=G(e)?"":` / ${E(e)}`,Et(i,e)}this.updateLine(t.currentTime)}updateTimeBorders(){const t=this.audiotag;if(document.CPU.isAudiotagGlobal(t)&&!1!==nt){if(this.plane(bt)){const t=this.point(bt,bt);if(t&&t.start===et&&t.end===nt)return}this.addPlane(bt,{track:"borders",panel:!1,highlight:!1}),this.addPoint(bt,bt,{start:et,link:!1,end:nt})}else this.removePlane(bt)}updateLoading(t,e){this.updateLine(t,e),this.setAct("loading")}updateError(){const t=this.audiotag;if(!t)return!0;const e=t.error;if(e){let t;this.show("error");const n=MediaError;switch(e.code){case n.MEDIA_ERR_ABORTED:t=y.media_err_aborted;break;case n.MEDIA_ERR_NETWORK:t=y.media_err_network;break;case n.MEDIA_ERR_DECODE:t=y.media_err_decode;break;case n.MEDIA_ERR_SRC_NOT_SUPPORTED:t=y.media_err_src_not_supported;break;default:t=y.media_err_unknow}const a=this.shadowId("pageerror");return a&&(a.innerText=t),!0}return!1}update(){this.updateError()||(this.updatePlayButton(),this.updateTime(),this.updateTimeBorders())}positionTimeElement(t,e=null,n=null){const{duration:a}=this.audiotag;if(G(a))return;const o=t=>null!=t&&!1!==t;o(e)&&(t.style.left=e/a*100+"%"),o(n)&&(t.style.right=100*(1-n/a)+"%")}async showThrobberAt(t){const e=this.audiotag;if(e.duration<1)return;isNaN(e.duration)&&!K(e)&&(e.setAttribute("preload","metadata"),Y(e,ot.hover,event));const n=this.shadowId("popup");this.positionTimeElement(n,t),n.style.opacity=1,n.innerHTML=E(t),n.dateTime=T(t).toUpperCase()}hideThrobber(){this.shadowId("popup").style.opacity=0}hideThrobberLater(){const t=this.shadowId("popup");t._hider&&window.clearTimeout(t._hider),t._hider=window.setTimeout((()=>{this.hideThrobber()}),1e3)}audiotagDataset(){return{...v,...this.audiotag.dataset}}updateLinks(){const t=this.audiotag,e=this.audiotagDataset(),n=d(e.canonical??""),a=0===t.currentTime?"":`&t=${Math.floor(t.currentTime)}`,o=n===d(window.location.href)?t.id:"",i=encodeURIComponent(`${n}#${o}${a}`);let r="";"@"===e.twitter?.[0]&&(r=`&via=${e.twitter.substring(1)}`);const s=t.querySelector("source[data-downloadable]")?.src||e.download||t.currentSrc,l=e.title,c={twitter:`https://twitter.com/share?text=${l}&url=${i}${r}`,facebook:`https://www.facebook.com/sharer.php?t=${l}&u=${i}`,email:`mailto:?subject=${l}&body=${i}`,link:s};for(let t in c){const e=this.shadowId(t);e&&(e.href=c[t])}}show(t){let e=this.container.classList;e.remove("show-main","show-share","show-error","media-streamed"),K(this.audiotag)&&e.add("media-streamed"),e.add(`show-${t}`)}showActions(){this.show("share"),this.updateLinks()}showMain(){Et(this.container,!0),this.show("main")}showHandheldNav(t){K(this.audiotag)||(this.container.classList.toggle("show-handheld-nav"),t?.preventDefault())}injectCss(e,n){if(!e.match(Pt))return a=`injectCss invalid key "${e}"`,void window.console.error(`${t}: `,a);var a;this.removeCss(e);const o=document.createElement("style");o.id=`style_${e}`,o.innerHTML=n,this.container.appendChild(o)}removeCss(t){this.shadowId(`style_${t}`)?.remove()}completeTemplate(){const t=this.audiotagDataset();let{title:e,waveform:n}=t;const a=this.shadowId("canonical");if(a){a.href=t.canonical;let n=a.classList;e?n.remove("untitled"):(n.add("untitled"),e=y.untitled),a.innerText=e}this.element.title!==e&&(this.element.title=e);const o=this.shadowId("poster");o&&(o.src=t.poster||"");const i=this.shadowId("time");i&&(i.style.backgroundImage=n?`url(${n})`:""),this.showMain()}attachAudiotagToInterface(t){t&&(this.audiotag=t,function(t){t.id=t.id||"CPU-Audio-tag-"+V++}(t),this.completeTemplate(),ot.update({target:t}))}planeNames(){return Object.keys(this._planes).concat(Object.keys(this.audiotag?._CPU_planes??{}))}plane(t){return this._planes[t]??this.audiotag?._CPU_planes[t]}planeTrack(t){return this.shadowId(`track_«${t}»`)}planePanel(t){return this.shadowId(`panel_«${t}»`)}planeNav(t){return this.planePanel(t)?.querySelector("ul")}drawPlane(t){this.planeTrack(t)?.remove(),this.planePanel(t)?.remove();const e=this.plane(t);if(!e)return;const{track:n,panel:a,title:i}=e,r=()=>{this.removeHighlightsPoints(t,wt,!0)},s=t=>{t.addEventListener("mouseover",kt,o),t.addEventListener("focusin",kt,o),t.addEventListener("mouseleave",r,o),t.addEventListener("focusout",r,o)};if(!1!==n){const e=document.createElement("aside");e.id=`track_«${t}»`,!0!==n&&e.classList.add(n.split(" ")),this.shadowId("line").appendChild(e),s(e)}if(!1!==a){const e=document.createElement("div");e.id=`panel_«${t}»`,!0!==a&&e.classList.add(a.split(" ")),e.classList.add("panel"),e.innerHTML=`<h6>${h(i)}</h6><nav><ul></ul></nav>`,this.container.appendChild(e),Et(e.querySelector("h6"),i),s(e)}!this.isController&&this.mirroredInController()&&document.CPU.globalController.drawPlane(t)}addPlane(t,e={}){if(!t.match(Pt)||this.plane(t))return!1;if((e={track:!0,panel:!0,title:"",highlight:!0,points:{},_comp:!1,...e})._comp)this._planes[t]=e;else{if(this.isController)return!1;this.audiotag._CPU_planes=this.audiotag._CPU_planes??{},this.audiotag._CPU_planes[t]=e}return this.drawPlane(t),!0}removePlane(t){return!(!t.match(Pt)||!this.plane(t)||this.isController&&!this._planes[t])&&(delete(this._planes[t]?this._planes:this.audiotag._CPU_planes)[t],this.planeTrack(t)?.remove(),this.planePanel(t)?.remove(),!this.isController&&this.mirroredInController()&&document.CPU.globalController.drawPlane(t),!0)}planePoints(t){return this.plane(t)?.points}point(t,e){return this.plane(t)?.points?.[e]}pointTrack(t,e){return this.shadowId(Tt(t,e,!1))}pointPanel(t,e){return this.shadowId(Tt(t,e,!0))}planeSort(t){const e=this.planePoints(t);if(!e)return;this.plane(t).points=Object.fromEntries(Object.entries(e).sort((([,t],[,e])=>t.start-e.start)));const n=Object.values(this.plane(t).points);this.plane(t)._st_max=n[n.length-1]?.start??0}planePointNames(t){return Object.keys(this.planePoints(t))}panelReorder(t){if(this.planeSort(t),!this.planePanel(t))return;let e,n;for(let a of this.planePointNames(t))n=this.pointPanel(t,a),e?.insertAdjacentElement("afterend",n),e=n}drawPoint(t,e){const n=this.audiotag??document.CPU.globalController.audiotag,a=this.point(t,e),{start:o,link:i,text:r,image:s,end:l}=a;let d="#";!0===i&&(d=`#${n.id}&t=${o}`),"string"==typeof i&&(d=i);const c=this.planeTrack(t);let u;if(c){u=this.pointTrack(t,e),u||(u=document.createElement("a"),u.id=Tt(t,e,!1),u.tabIndex=-1,u.innerHTML='<img alt="" /><span></span>',c.appendChild(u)),u.href=d,u.title=r;const n=u.querySelector("img");Et(n,s),n.src=s||"",u.querySelector("img").innerHTML=r,this.positionTimeElement(u,o,l)}const h=this.planeNav(t);let p;if(h){p=this.pointPanel(t,e),p||(p=document.createElement("li"),p.id=Tt(t,e,!0),p.innerHTML='<a href="#" class="cue"><strong></strong><time></time></a>',h.appendChild(p)),p.querySelector("a").href=d,p.querySelector("strong").innerHTML=r;const n=p.querySelector("time");n.dateTime=L(o),n.innerText=E(o)}this.emitEvent("drawPoint",{planeName:t,pointName:e,pointData:a,elementPointTrack:u,elementPointPanel:p}),!this.isController&&this.mirroredInController()&&document.CPU.globalController.drawPoint(t,e)}addPoint(t,e,n={}){const a=Number(n.start);return!(!e.match(Pt)||!this.plane(t)||this.point(t,e)||!Lt(n))&&(!(!this._planes[t]&&this.isController)&&(n.start=a,this.plane(t).points[e]=n,this.emitEvent("addPoint",{planeName:t,pointName:e,pointData:n}),this.plane(t)._st_max>a?this.panelReorder(t):(this.drawPoint(t,e),this.plane(t)._st_max=a),!0))}bulkPoints(t,e={}){if(!this.plane(t))return!1;if(!this._planes[t]&&this.isController)return!1;for(let[t,n]of Object.entries(e))if(!t.match(Pt)||!Lt(n))return!1;e={...this.plane(t).points,...e},this.plane(t).points=e,this.emitEvent("bulkPoints",{planeName:t,pointDataGroup:e});const n=this.planeNav(t);return n&&(n.innerHTML=""),this.refreshPlane(t),!0}editPoint(t,e,n){const a=this.plane(t);if(!a)return!1;const o=this.point(t,e);if(!o)return!1;let{start:i}=n;i=Number(i);const r=null!=i&&i!==o.start;if(!Lt(n={...o,...n}))return!1;a.points[e]=n,this.drawPoint(t,e),r&&this.panelReorder(t),this.emitEvent("editPoint",{planeName:t,pointName:e,pointData:n}),a._st_max<i&&(a._st_max=i)}removePoint(t,e){const n=this.plane(t);if(!n||!this.point(t,e))return!1;this.emitEvent("removePoint",{planeName:t,pointName:e}),this.pointTrack(t,e)?.remove(),this.pointPanel(t,e)?.remove();let a=0;for(let e of Object.values(this.planePoints(t))){const t=Number(e.start);a=a<t?t:a}return n._st_max=a,!this.isController&&this.mirroredInController()&&document.CPU.globalController.removePoint(t,e),n.points[e]&&delete n.points[e],!0}clearPlane(t){const e=this.plane(t);if(!e)return!1;for(let n of Object.keys(e.points))this.removePoint(t,n);const n=this.planeNav(t);return n&&(n.innerHTML=""),e._st_max=0,!0}refreshPlane(t){this.planeSort(t);for(let e of this.planePointNames(t))this.drawPoint(t,e)}redrawAllPlanes(){r("aside, div.panel",(t=>{t.remove()}),this.container);for(let t of Object.keys({...this._planes,...this.audiotag._CPU_planes}))this.drawPlane(t),this.refreshPlane(t);mt(this)}repositionTracks(){if(!G(this.audiotag.duration))for(let t in this.audiotag._CPU_planes){if(this.plane(t).track)for(let e of this.planePointNames(t)){const{start:n,end:a}=this.point(t,e),o=this.pointTrack(t,e);o&&this.positionTimeElement(o,n,a)}}}removeHighlightsPoints(t,e="with-preview",n=!0){if(r(`#track_«${t}» .${e}, #panel_«${t}» .${e}`,(t=>{t.classList.remove(e)}),this.container),n&&this.mirroredInController()){const n=document.CPU.globalController;(this.isController?p(n.audiotag):n).removeHighlightsPoints(t,e,!1)}}highlightPoint(t,e,n="with-preview",a=!0){if(this.removeHighlightsPoints(t,n,a),this.plane(t)?.highlight&&(this.pointTrack(t,e)?.classList.add(n),this.pointPanel(t,e)?.classList.add(n),a&&this.mirroredInController())){const a=document.CPU.globalController;(this.isController?p(a.audiotag):a).highlightPoint(t,e,n,!1)}}focusPoint(t,e){const n=this.pointPanel(t,e)?.querySelector("a")??this.pointTrack(t,e);return!!n&&(n.focus(),!0)}focused(){return this.shadow.querySelector(":focus")}focusedId(){const t=this.focused();if(!t)return;const e=""!=t.id?t.id:t.closest("[id]").id;return""==e?null:e}prevFocus(){At(this,!1)}nextFocus(){At(this,!0)}}function At(t,e){const n=t.planeNames();if(0==n.length)return;const a=e=>{const{track:n,panel:a,points:o}=t.plane(e);return(!1!==n||!1!==a)&&(t.planePanel(e)?.clientHeight>0||t.planeTrack(e)?.clientHeight>0)&&o&&Object.keys(o).length>0};let o,i,r,l=t.focused();if(l&&(l.id||(l=l.closest("[id]")),({planeName:o,pointName:i}=_t(l.id))),""!=i&&(r=t.planePointNames(o),i=s(r,i,e?1:-1)),!i){if(o=e?(t=>{for(let e=n.indexOf(t)+1;e<n.length;e++){const t=n[e];if(a(t))return t}})(o):(t=>{for(let e=n.indexOf(t)-1;e>=0;e--){const t=n[e];if(a(t))return t}})(o),!o)return;const r=t.planePointNames(o);i=r[e?0:r.length-1]}t.focusPoint(o,i)}function It(t){const e=document.CPU.globalController;if(e&&!t.isEqualNode(e.audiotag)){const n=document.CPU.globalController.element.querySelector("audio");n&&(j(n),n.remove());const a=e.focusedId();e.attachAudiotagToInterface(t),e.showMain(),e.redrawAllPlanes(),e.setMode(),F(a)}}function xt([{target:n}]){const a=p(n),o=a.element,i="audio",r=o.querySelector(i),s=document.CPU.globalController;if(!r&&o.tagName!==e)return l="<audio> element was removed.",window.console.info(`${t}: `,l),o.remove(),void(s&&B());var l;o.copyAttributesToMediaDataset?.(),a.attributesChanges(),document.CPU.currentPlaylistID()===r?.dataset.playlist&&B()}class Nt extends HTMLElement{constructor(){if(super(),this.CPU=null,this.observer=null,c())this.remove();else{if(this.tagName===t&&!this.querySelector(n))return m(`Tag <${t}> without <audio controls>.\nSee https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md for a correct installation.`),void this.remove();if(this.tagName===e&&document.CPU.globalController)return m(`<${e}> tag instancied twice.`),void this.remove();this.shadow=this.attachShadow({mode:"open"}),this.shadow.innerHTML=`<style>:host{all:initial;display:block;contain:content}#interface,*{font-family:var(--cpu-font-family);font-size:var(--cpu-font-size);font-weight:400;font-style:normal;line-height:1.2;border:none;padding:0;margin:0;text-indent:0;list-style-type:none;user-select:none;transition:color var(--cpu-color-transitions),background-color var(--cpu-background-transitions),opacity var(--cpu-background-transitions)}button{color:currentColor;border:none;text-decoration:none;cursor:pointer;vertical-align:middle;background:var(--cpu-background);color:var(--cpu-color);display:flex;flex-direction:column;overflow:hidden;max-width:var(--cpu-height);max-height:var(--cpu-height);text-align:center}svg{fill:currentColor}[src='']{visibility:hidden}#poster{display:block;max-width:530px;margin:10px 35px;object-fit:contain;opacity:0}.poster-loaded #poster{opacity:1}h5{font-weight:700}#control svg,#loading,#pause,#play,.mode-hidden,.no,.panel{display:none}.act-glow #play,.act-loading #loading,.act-pause #play,.act-play #pause{display:block}.act-glow #play{animation:glow 2s infinite}@keyframes glow{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}.act-loading #loading circle{fill:#777;opacity:1;animation:pulse 2s infinite}#loading circle:nth-child(2){animation-delay:.5s}#loading circle:nth-child(3){animation-delay:1s}@keyframes pulse{50%{opacity:0}}svg{max-width:32px;max-height:32px}#control{display:flex;flex-direction:row;height:32px;align-items:center;margin:0 35px}.expand{flex:auto 1 0}#elapse{text-align:right;height:32px}#elapse span{vertical-align:middle}</style><div id="interface"class="no"><button type="button"id="toggleplay"><img id="poster"class="nosmall"src=""alt=""loading="lazy"decoding="async"><h5 id="title"><span id="canonical"></span></h5><div id="control"><svg id="loading"viewBox="0 0 32 32"><title>${y.loading}</title><circle cx="6"cy="22"r="4"/><circle cx="16"cy="22"r="4"/><circle cx="26"cy="22"r="4"/></svg> <svg id="pause"viewBox="0 0 32 32"><title>${y.pause}</title><path d="M 6,6 12.667,6 12.667,26 6,26 z"/><path d="M 19.333,6 26,6 26,26 19.333,26 z"/></svg> <svg id="play"viewBox="0 0 32 32"><title>${y.play}</title><path d="M 6,6 6,26 26,16 z"/></svg> <span class="expand"></span> <span><span id="currenttime">…</span><span id="totaltime"class="nosmaller"></span></span></div></button></div>`}}connectedCallback(){c()||this.shadowRoot&&(new Ut(this),this.observer=new MutationObserver(xt),this.observer.observe(this,{childList:!0,attributes:!0}),this.CPU.attributesChanges())}disconnectedCallback(){this.observer&&(this.observer.disconnect(),this.CPU.emitEvent("removed"),this.tagName===e&&document.CPU.globalController&&(document.CPU.globalController=null))}}function $t([{target:t}]){const e=p(t);pt(e),e.completeTemplate();const n=document.CPU.globalController;e.audiotag.isEqualNode(n?.audiotag)&&(pt(n),n.completeTemplate())}class St extends Nt{constructor(){super(),this.audiotag=this.querySelector(n),this.audiotag?this.observer=null:this.remove()}copyAttributesToMediaDataset(){if(this.audiotag){for(let t in document.CPU.defaultDataset)if(this.hasAttribute(t)){const e=this.getAttribute(t);this.audiotag.dataset[t]="duration"!==t?e:k(e)}}else this.remove()}connectedCallback(){this.audiotag&&(this.copyAttributesToMediaDataset(),super.connectedCallback(),Q(this.CPU.audiotag),this.observer=new MutationObserver($t),this.observer.observe(this,{childList:!0,attributes:!0,subtree:!0}),document.CPU.currentPlaylistID()===this.audiotag.dataset.playlist&&B())}disconnectedCallback(){const t=document.CPU.globalController,e=this.audiotag.dataset.playlist;this.audiotag&&t&&this.audiotag.isEqualNode(t.audiotag)?t.element.appendChild(this.audiotag):e&&j(this.audiotag),super.disconnectedCallback()}}const Ot={autoplay:!1,keymove:5,playStopOthers:!0,alternateDelay:1e3,fastFactor:4,repeatDelay:400,repeatFactor:100,advanceInPlaylist:!0,currentAudiotagPlaying:null,globalController:null,hadPlayed:!1,lastUsed:null,playlists:{},convert:U,trigger:ot,defaultDataset:v,findCPU:p,adjacentKey:function(t,e,n){if(!t?.hasOwnProperty)return null;const a=Object.keys(t);return a[a.indexOf(e)+n]},isAudiotagPlaying:function(t){let e=document.CPU.currentAudiotagPlaying;return e&&t.isEqualNode(e)},isAudiotagGlobal:function(t){return this.globalController?t.isEqualNode(this.globalController.audiotag):this.isAudiotagPlaying(t)},jumpIdAt:async function(t,e,n){function o({target:t}){let n=k(e);document.CPU.seekElementAt(t,n);let a={target:t};t.readyState>=t.HAVE_FUTURE_DATA?r(a):t.addEventListener("canplay",r,i),ot.update(a)}function r(t){let e=t.target;ot.play(null,e),n?.()}let s=""!==t?document.getElementById(t):document.querySelector(a);if(null==(s?.currentTime??null))return void m(`Unknow audiotag ${t}`);let l={target:s};s.readyState<s.HAVE_CURRENT_DATA?(s.addEventListener("loadedmetadata",o,i),s.load(),ot.update(l)):o(l)},seekElementAt:function(t,e){if(!W(e)&&!K(t)){if(e=X(t,e),t.fastSeek)t.fastSeek(e);else try{const n=()=>{t.currentTime=e};t.readyState>=t.HAVE_CURRENT_DATA?n():(t.load(),n(),t.currentTime<e&&t.addEventListener("loadedmetadata",n,{once:!0}))}catch(n){t.src=`${t.currentSrc.split("#")[0]}#t=${e}`}p(t)?.updateLoading?.(e)}},currentPlaylist:function(){let t=this.globalController?.audiotag;if(!t)return[];for(let e of Object.values(this.playlists))if(e.includes(t.id))return e;return[]},currentPlaylistID:function(){let t=this.globalController?.audiotag;if(!t)return[];for(let e of Object.keys(this.playlists))if(this.playlists[e].includes(t.id))return e;return null}};async function Dt(){let a;!function(){const t=document.createElement("style");t.innerHTML='audio[controls]{display:block;width:100%}:root{--cpu-height:600px;--cpu-font-family:Lato,"Open Sans","Segoe UI",Frutiger,"Frutiger Linotype","Dejavu Sans","Helvetica Neue",Arial,sans-serif;--cpu-font-size:15px;--cpu-font-small-size:calc(var(--cpu-font-size) * 0.8);--cpu-background:#555;--cpu-color:#ddd;--cpu-playing-background:#444;--cpu-playing-color:#fff;--cpu-cue:#000;--cpu-timeline-limits:#f00;--cpu-color-transitions:0.1s;--cpu-background-transitions:0.1s;--cpu-focus-outline:8px dashed #f00}@media (max-width:640px){.interface,:root{--cpu-font-size:13px;--cpu-height:100%}}',document.head.appendChild(t)}(),l()?(a="with-webcomponents",window.customElements.define(t.toLowerCase(),St),window.customElements.define(e.toLowerCase(),Nt)):(m("WebComponent may NOT behave correctly on this browser. Only timecode hash links are activated.\nSee https://github.com/dascritch/cpu-audio/ for details"),r(n,J),a="without-webcomponents"),document.body.classList.add(`cpu-audio-${a}`),window.addEventListener("hashchange",ot.hashOrder,o),ot.hashOrder({at_start:!0})}document.CPU||window.customElements.get(t.toLowerCase())?m("cpu-audio is called twice"):(HTMLDocument.prototype.CPU=Ot,document.body?Dt():document.addEventListener("DOMContentLoaded",Dt,o))})();
//# sourceMappingURL=cpu-audio.big-square.js.map
// Generated theme : big-square

