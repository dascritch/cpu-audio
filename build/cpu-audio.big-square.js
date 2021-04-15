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
const t="CPU-AUDIO",e="CPU-CONTROLLER",n="audio[controls]",a="cpu-audio audio",i={passive:!0},o={passive:!0,once:!0};function r(t,e,n=document){Array.from(n.querySelectorAll(t)).forEach(e)}function s(t,e,n){if(!t?.indexOf)return null;const a=t.indexOf(e);return-1===a?null:t[a+n]}function l(){return void 0!==window.customElements}function d(t){let e=document.createElement("a");return e.href="string"!=typeof t?t:t.split("#")[0],e.href}function u(){return!window.matchMedia("screen").matches}function c(t){d(window.location.href)===d(t.target.href)&&t.preventDefault()}function h(t){let e=document.createElement("span");e.innerText=t;let n=e.innerHTML;return e.remove(),n}function p(n){if([t,e].includes(n.tagName))return n.CPU;let a=n.closest(t)??n.closest(e);return a?a.CPU:n.getRootNode().host.CPU}function m(e){window.console.warn(`${t}: `,e)}const g={fr:{loading:"Chargement en cours…",pause:"Pause",play:"Lecture",canonical:"Lien vers la fiche du sonore",moment:"Lien vers ce moment",untitled:"(sans titre)",cover:"pochette",more:"Actions",share:"Partager",twitter:"Partager sur Twitter",facebook:"Partager sur Facebook",e_mail:"Partager par e-mail",download:"Télécharger",back:"Annuler",chapters:"Chapitres",playlist:"Playlist",media_err_aborted:"Vous avez annulé la lecture.",media_err_network:"Une erreur réseau a causé l'interruption du téléchargement.",media_err_decode:"La lecture du sonore a été annulée suite à des problèmes de corruption ou de fonctionnalités non supportés par votre navigateur.",media_err_src_not_supported:"Le sonore n'a pu être chargé, soit à cause de sourcis sur le serveur, le réseau ou parce que le format n'est pas supporté.",media_err_unknow:"Erreur due à une raison inconnue."},en:{loading:"Loading…",pause:"Pause",play:"Play",canonical:"Link to the sound's page",moment:"Link to this time",untitled:"(untitled)",cover:"cover",more:"Actions",share:"Share",twitter:"Share on Twitter",facebook:"Share on Facebook",e_mail:"Share via e-mail",download:"Download",back:"Back",chapters:"Chapters",playlist:"Playlist",media_err_aborted:"You have aborted the play.",media_err_network:"A network error broke the download.",media_err_decode:"Play was canceled due to file corruption or a not supported function in your browser.",media_err_src_not_supported:"The media cannot be downloaded due to server problems, network problems or unsupported by your browser.",media_err_unknow:"Error of unknown cause."}};let f=document.querySelector("html").lang;if(!f.length||!(f.toLowerCase()in g)){f="en";let t=window.navigator.languages;t=void 0!==t?t:[navigator.language||navigator.browserLanguage];let e=!1;for(let n of t)if(n.split){let t=n.split("-")[0];!e&&t in g&&(f=t)}}const y=g[f];let w=document.head;const v={get title(){for(const t of['property="og:title"','name="twitter:title"']){const e=w.querySelector(`meta[${t}]`);if(e)return e.content}const t=document.title;return""===t?null:t},get poster(){for(const t of['property="og:image"','name="twitter:image:src"']){const e=w.querySelector(`meta[${t}]`);if(e)return e.content}return null},get canonical(){const t=w.querySelector('link[rel="canonical"]');return t?t.href:location.href.split("#")[0]},get twitter(){const t=w.querySelector('meta[name="twitter:creator"]');return t&&t.content.length>1?t.content:null},playlist:null,waveform:null,duration:null,download:null},P={d:86400,h:3600,m:60,s:1};let b=[1,60,3600,86400];const C=/^\d+$/,_=/\D*/g,k=function(t){let e=0;return""!==t&&(e=C.test(t)?Number(t):t.includes(":")?L.colontimeInSeconds(t):L.subunittimeInSeconds(t)),e},T=function(t){if(t===1/0)return"?";let e="",n=!1;for(let a in P)if(P.hasOwnProperty(a)){let i=P[a];if(t>=i||n){n=!0;let o=Math.floor(t/i);e+=o+a,t-=o*i}}return""===e?"0s":e},E=function(t){if(t===1/0)return"?";let e="",n=!1;for(let a in P)if(P.hasOwnProperty(a)){let i=P[a];if(t>=i||n){n=!0;let a=Math.floor(t/i);e+=""===e?"":":",e+=(a<10&&""!==e?"0":"")+a,t-=a*i}}return 1===e.length?`0:0${e}`:2===e.length?`0:${e}`:""===e?"0:00":e},U=function(t){return`P${L.secondsInTime(t).toUpperCase()}`},L={timeInSeconds:k,subunittimeInSeconds:function(t){let e,n=0;for(let a in P)P.hasOwnProperty(a)&&t.includes(a)&&([e,t]=t.split(a),n+=Number(e.replace(_,""))*P[a]);return n},colontimeInSeconds:function(t){let e=0,n=t.split(":");for(let t=0;t<n.length;t++)e+=Number(n[t])*b[n.length-1-t];return e},secondsInTime:T,secondsInColonTime:E,secondsInPaddledColonTime:function(t){if(t===1/0)return"?";let e=L.secondsInColonTime(t);return"00:00:00".substr(0,8-e.length)+e},durationIso:U},A={i:"i",em:"i",b:"b",bold:"strong",u:"u",lang:"i"},I={i:"i",em:"i",b:"b",strong:"b",u:"u"};let x=A;const $=/<(\w+)(\.[^>]+)?( [^>]+)?>/gi,N=/<\/(\w+)( [^>]*)?>/gi,S=/\n/gi,O=/<br\s*[^>]*>/gi;function D(t){return!(t in x)}function M(t,e,n,a){if(D(e=e.toLowerCase()))return"";let i="";return"lang"==e&&(i=` lang="${a.trim()}"`),`<${x[e]}${i}>`}function H(t,e){return D(e=e.toLowerCase())?"":`</${x[e]}>`}function q(t,e=!0){if(x=e?A:I,t.split("<").length!==t.split(">").length)return h(t);const n=t.replace($,M).replace(N,H);return e?n.replace(S,"<br/>"):n.replace(O,"\n")}const R="_playlist";function j({id:t}){const e=document.CPU.playlists,n=document.CPU.currentPlaylistID();let a=!1;for(let i in e){const o=e[i].length,r=e[i].filter((e=>e!==t&&document.getElementById(e)));o!==r.length&&i===n&&(a=!0),document.CPU.playlists[i]=r,0===r.length&&delete document.CPU.playlists[i]}a&&F()}function B(){const t=document.CPU.globalController;if(!t)return;const e=t.current_playlist,n={};if(t.clearPlane(R),0!==t.current_playlist.length){for(let t of e)n[t]={text:document.getElementById(t)?.dataset.title,link:`#${t}&t=0`};t.bulkPoints(R,n),t.element.shadowRoot.querySelector("main").insertAdjacentElement("afterend",t.planePanel(R))}else t.removePlane(R)}function F(t){const e=document.CPU.globalController;if(!e||!e.isController)return;let n=e.current_playlist;if(e.current_playlist=document.CPU.currentPlaylist(),e.plane(R)||e.addPlane(R,{title:y.playlist,track:!1,panel:"nocuetime",highlight:!0,_comp:!0}),n!==e.current_playlist&&B(),e.highlightPoint(R,e.audiotag.id,vt),t){const[n,a]=_t(t);e.focusPoint(n,a)}}function z(t){let e=t.target;if(null!==document.CPU.currentAudiotagPlaying||K(e))return;let n=Number(window.localStorage.getItem(e.currentSrc));n>0&&!at&&(document.CPU.seekElementAt(e,n),it.play(null,e))}HTMLAudioElement.prototype.CPU_connected=!1;let V=0;function K(t){return null==t||t.duration===1/0||null!=t.dataset.streamed}function W(t){return t===1/0||null===t||isNaN(t)}function G(t){return 0===t||W(t)}function Z({duration:t,dataset:e}){let n=null,a=Number(t);if(G(a)){const t=Number(e.duration);G(t)||(n=t)}else n=a;return n}function X(t,e){if(W(e))return null;e=e<0?0:e;const n=Z(t);return G(n)||(e=e<n?e:n),e}function Y(t,e=null,n=null){t&&(t.readyState>t.HAVE_NOTHING?e?.(n):(e&&t.addEventListener("loadedmetadata",(()=>{e?.(n)}),o),t.load()))}function J(t){t.addEventListener("loadedmetadata",z,o),t.addEventListener("play",it.playOnce,i),t.addEventListener("ended",it.nexttrack,i),t.addEventListener("ready",z,i),t.addEventListener("canplay",z,i),["ready","load","loadeddata","canplay","abort","error","emptied","play","playing","pause","ended","durationchange","loadedmetadata","timeupdate","waiting"].forEach((e=>{t.addEventListener(e,it.update,i)})),l()||["pause","ended"].forEach((e=>{t.addEventListener(e,it.pause,i)})),""===t.getAttribute("preload")&&Y(t)}function Q(t){t.CPU_connected||(t.CPU_connected=!0,J(t),t.hidden=!0,t.removeAttribute("controls"),function(t){if("string"==typeof t.dataset.playlist){const e=t.dataset.playlist;e in document.CPU.playlists||(document.CPU.playlists[e]=[]),document.CPU.playlists[e].push(t.id),document.CPU.globalController&&e===document.CPU.currentPlaylistID()&&F()}}(t))}HTMLAudioElement.prototype.CPU_controller=function(){return this.closest(t)??this.closest(e)},HTMLAudioElement.prototype.CPU_update=function(){let t=this.CPU_controller();if(t){let e=t.CPU;e&&e.update&&e.update()}document.CPU.globalController&&document.CPU.globalController.update()};let tt=null,et=0,nt=!1,at=!1;const it={_end:()=>nt,update:function({target:t}){!1!==nt&&t.currentTime>nt&&it.pause(void 0,t),t.CPU_update(),t.paused||K(t)||window.localStorage.setItem(t.currentSrc,String(t.currentTime))},hashOrder:async function(t,e=null){let n=!0;"string"!=typeof t&&(n="at_start"in t,t=location.hash.substr(1));let a="",i="",o=t.split("&"),r=!1;for(let t of o)if(t.includes("=")||""!==a){let[e,n]=t.split("=");switch(e){case"t":i=n||"0",r=!0;break;case"autoplay":r="1"===n;break;case"auto_play":r="true"===n}}else a=t;if(""===i||n&&!r)return void e?.();let[s,l]=i.split(",");et=k(s),nt=void 0!==l&&k(l),!1!==nt&&(nt=nt>et&&nt),await document.CPU.jumpIdAt(a,s,e),F()},hover:function(t){const{target:e,clientX:n,targetTouches:a}=t;if(!e)return;const i=p(e),o=i.audiotag,r=Z(o);if(G(r))return void(K(o)||Y(o,it.hover,t));const{x:s,width:l}=i.shadowId("time").getBoundingClientRect(),d=((n??a?.[0]?.clientX)-s)/l;i.showThrobberAt(X(o,d*r))},out:function({target:t}){p(t).hideThrobber()},throbble:function(t){const{target:e,offsetX:n,at:a}=t,i=document.CPU,o=p(e).audiotag;if(a>=0)return void i.seekElementAt(o,a);const r=n/e.clientWidth,s=Z(o);i.currentAudiotagPlaying&&!i.isAudiotagPlaying(o)&&it.pause(null,i.currentAudiotagPlaying),it.play(t,o),G(s)?o.CPU_controller()?.updateLoading?.(void 0,100):i.seekElementAt(o,r*s)},pause:function(t=null,e=null){if(!e){let{target:n}=t;e="AUDIO"==n.tagName?n:p(n).audiotag}e.pause(),document.CPU.currentAudiotagPlaying=null,window.localStorage.removeItem(e.currentSrc)},playOnce:function({target:t}){let e=document.CPU;document.CPU.lastUsed=t,e.playStopOthers&&e.currentAudiotagPlaying&&!e.isAudiotagPlaying(t)&&it.pause(void 0,e.currentAudiotagPlaying),e.currentAudiotagPlaying=t},play:function(t=null,e=null){if(!t&&at)return void m("play() prevented because already waiting for focus");var n;e=e??p(t.target).audiotag,at=!1,((n=e.currentTime)<et||!1!==nt&&n>nt)&&(et=0,nt=!1);let a=e.play();a&&a.then((()=>{document.CPU.hadPlayed=!0})).catch((n=>{at=!0;const a=()=>{!function(t,e){at=!1,document.CPU.autoplay&&it.play(t,e)}(t,e)};switch(n.name){case"NotAllowedError":if(m("Auto-play prevented : Browser requires a manual interaction first."),document.addEventListener("focus",a,o),document.addEventListener("click",a,o),e.CPU_connected){let t=e.CPU_controller().CPU;t.glowBeforePlay=!0,t.setAct("glow")}break;case"NotSupportedError":n("The browser refuses the audio source, probably due to audio format.")}})),xt(e)},toggleplay:function({target:t}){const e=p(t).audiotag;e.paused?it.play(null,e):it.pause(null,e)},key:function(t,e=1){if(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)return;let n=p(t.target),a=n.audiotag;function i(e){let i=X(a,a.currentTime+e);t.at=i,n.showThrobberAt(t.at),it.throbble(t),n.hideThrobberLater()}switch(t.keyCode){case 13:if("control"!=n.focused()?.id.toLowerCase())return;it.toggleplay(t);break;case 27:it.restart(t),it.pause(null,a);break;case 32:it.toggleplay(t);break;case 35:document.CPU.seekElementAt(a,a.duration);break;case 36:it.restart(t);break;case 37:i(-document.CPU.keymove*e);break;case 39:i(+document.CPU.keymove*e);break;case 38:n.prevFocus();break;case 40:n.nextFocus();break;default:return}t.preventDefault?.()},restart:function({target:t}){let e=p(t);document.CPU.seekElementAt(e.audiotag,0)},reward:function(t){t.keyCode=37,it.key(t)},foward:function(t){t.keyCode=39,it.key(t)},fastreward:function(t){t.keyCode=37,it.key(t,document.CPU.fastFactor)},fastfoward:function(t){t.keyCode=39,it.key(t,document.CPU.fastFactor)},prevcue:function({target:t}){ot(p(t),-1)},nextcue:function({target:t}){ot(p(t),1)},cuechange:function(t,e){let n=document.body.classList;n.remove(tt),tt=`cpu_playing_tag_«${e.id}»_cue_«${t.id}»`,n.add(tt)},prevtrack:function({target:t},e=null){rt(e??p(t).audiotag,-1)},nexttrack:function({target:t},e=null){rt(e??p(t).audiotag,1)}};function ot(t,e){const n=t.audiotag,a=t.planePoints("_chapters");if(!a)return;const[,i]=_t(tt);let o=s(a,i,e),r=Object.values(a);e<0&&(r=r.reverse());const{currentTime:l}=n;if(!o)for(let t of r)!o&&(e<0&&t.end<=l||e>0&&t.start>=l)&&(o=t);o&&document.CPU.jumpIdAt(n.id,o.start)}function rt(t,e){const{id:n}=t,a=t.dataset.playlist;if(!a)return;const i=document.CPU.playlists[a];if(!i)return void m(`Named playlist ${a} not created. WTF ?`);let o=i.indexOf(n);if(o<0)return void m(`Audiotag ${n} not in playlist ${a}. WTF ?`);const r=i[o+e];if(!r)return;let s=document.getElementById(r);s?(document.CPU.seekElementAt(s,0),it.play(null,s)):m(`Audiotag #${r} doesn't exists. WTF ?`)}let st=null;const lt=["fastreward","reward","foward","fastfoward"],dt={press:function(t){let e=t.target.id?t.target:t.target.closest("button");e.id&&lt.includes(e.id)&&(it[e.id](t),st&&window.clearTimeout(st),st=window.setTimeout(dt.repeat,document.CPU.repeatDelay,{target:e}),t.preventDefault())},repeat:function(t){it[t.target.id](t),st=window.setTimeout(dt.repeat,document.CPU.repeatFactor,t),t.preventDefault?.()},release:function(t){window.clearTimeout(st),st=null,t.preventDefault()}},ut={ev:null,down:function({target:t}){ut.ev=setTimeout(ut.do,document.CPU.alternateDelay,p(t))},do:function(t){t.showHandheldNav(),ut.ev=null},up:function(){clearTimeout(ut.ev),ut.ev=null}},ct="_chapters";function ht(t){if(!t)return null;let e=null;if(t.textTracks?.length>0)for(let n of t.textTracks)"chapters"!==n.kind.toLowerCase()||!n.cues||e&&n.language.toLowerCase()!==f||(e=n);return e}async function pt(t){if(t.isController)return;const e=t.audiotag;let n=!1;const a={};if(e){const o=ht(e);if(o?.cues.length>0){t.addPlane(ct,{title:y.chapters,track:"chapters"});const r=()=>{mt(t)};o.removeEventListener("cuechange",r),o.addEventListener("cuechange",r,i);for(let n of o.cues)t.point(ct,n.id)||(a[n.id]={start:X(e,Math.floor(n.startTime)),text:q(n.text),link:!0,end:X(e,Math.floor(n.endTime))});o.cues.length>0&&(n=!0),t.bulkPoints(ct,a),mt(t,{target:{activeCues:o.cues}})}}let o=`cpu_tag_«${e.id}»_chaptered`,r=document.body.classList;n?r.add(o):(t.removePlane(ct),r.remove(o))}function mt(t,e=null){const n=e?e.target.activeCues:ht(t.audiotag)?.activeCues;let a,i=t.audiotag.currentTime;if(n?.length>0)for(let t of n)t.startTime<=i&&i<t.endTime&&(a=t);a?.id!==t._activecue_id&&(t.removeHighlightsPoints(ct,vt),t._activecue_id=a?.id,a&&(it.cuechange(a,t.audiotag),t.emitEvent("chapterChanged",{cue:a}),t.highlightPoint(ct,a.id,vt)))}function gt(t){let{title:e,canonical:n}=p(t.target).audiotagDataset();navigator.share({title:e,text:e,url:n}),t.preventDefault()}function ft(t){const e=t.shadowId("interface").classList;t.shadowId("poster")?.addEventListener("load",(()=>{e.add("poster-loaded")}),i);let n={pause:it.pause,play:it.play,time:it.throbble,actions:()=>{t.showActions()},back:()=>{t.showMain()},poster:()=>{t.showMain()},restart:it.restart,toggleplay:it.toggleplay,prevcue:it.prevcue,nextcue:it.nextcue,prevtrack:it.prevtrack,nexttrack:it.nexttrack};for(let e in n)t.shadowId(e)?.addEventListener("click",n[e],i);const a=["fastreward","reward","foward","fastfoward"];for(let e of a){const n=t.shadowId(e);n?.addEventListener("pointerdown",dt.press),n?.addEventListener("pointerout",dt.release),n?.addEventListener("pointerup",dt.release)}t.element.addEventListener("keydown",it.key);const r=t.shadowId("time");r?.addEventListener("pointerenter",it.hover,i),r?.addEventListener("pointermove",it.hover,i),r?.addEventListener("pointerout",it.out,i),r?.addEventListener("pointerdown",ut.down,i),r?.addEventListener("pointerup",ut.up,i),navigator.share&&(e.add("hasnativeshare"),t.shadowId("nativeshare")?.addEventListener("click",gt,i));let s=t.shadowId("canonical");s&&s.addEventListener("click",c),t.audiotag&&(t.container.addEventListener("pointerenter",(()=>{Y(t.audiotag)}),o),t.audiotag.addEventListener("durationchange",(()=>{t.repositionTracks()}),i),function(t){const e=()=>{pt(t)};e();let n=t.audiotag;n.addEventListener("loadedmetadata",e,o);let a=n.querySelector('track[kind="chapters"]');a&&!a._CPU_load_ev&&(a._CPU_load_ev=a.addEventListener("load",e,i))}(t),F(),t.showMain(),t.updatePlayButton(),t.emitEvent("ready"),t.updateLinks())}const yt=["poster","actions","timeline","chapters","panels","panels-title","panels-except-play"],wt="with-preview",vt="active-cue";let Pt="_borders";const bt=/^[a-zA-Z0-9\-_]+$/,Ct=/^[a-zA-Z0-9\-_]+_«([a-zA-Z0-9\-_]+)(»_.*_«([a-zA-Z0-9\-_]+))?»$/;function _t(t){let e,n;return"string"==typeof t&&([,e,,n]=t?.match(Ct)||[]),[e??"",n??""]}function kt({target:t}){if(t.id||(t=t.closest("[id]")),!t)return;let[e,n]=_t(t.id);p(t).highlightPoint(e,n)}function Tt(t,e,n){return`${n?"panel":"track"}_«${t}»_point_«${e}»`}function Et(t=!1){return void 0!==t&&!1!==t}function Ut({classList:t},e){e?t.remove("no"):t.add("no")}function Lt({start:t,end:e}){return(null==t||t>=0)&&(null==e||e>=t)}class At{constructor(t){this.element=t,this.shadow=t.shadowRoot,this.audiotag=t.audiotag,this.container=this.shadowId("interface"),this.mode_when_play=null,this.glowBeforePlay=!!t.hasAttribute("glow"),this.current_playlist=[],this._activecue_id=null,this.mode_was=null,this.act_was=null,this.isController=!1,t.CPU=this,this.audiotag&&!this.audiotag._CPU_planes&&(this.audiotag._CPU_planes={}),this._planes={};const e=document.CPU.globalController;this.audiotag&&e&&!e.audiotag&&xt(this.audiotag),this.audiotag||(this.isController=!0,this.container.classList.add("controller"),document.CPU.globalController=this,this.audiotag=document.querySelector(a),Y(this.audiotag)),ft(this),this.attachAudiotagToInterface(this.audiotag),this.attributesChanges()}attributesChanges(){let t=null;if(this.element.hasAttribute("mode")){t=this.element.getAttribute("mode");let[e,n]=t.split(",");n&&(t=this.audiotag.paused?e:n,this.mode_when_play=n)}this.setMode(t),this.element.hasAttribute("hide")&&this.setHide(this.element.getAttribute("hide").split(" "))}mirroredInController(){let t=document.CPU.globalController;return t&&this.audiotag.isEqualNode(t.audiotag)}translateVTT(t,e){return q(t,e)}planeAndPointNamesFromId(t){return _t(t)}async emitEvent(t,e){this.element.dispatchEvent(new CustomEvent(`CPU_${t}`,{target:this.element,bubbles:!0,cancelable:!1,composed:!1,detail:e}))}shadowId(t){return this.shadow.getElementById(t)}setMode(t=null){if(t=t??"default",this.mode_was===t)return;let e=this.container.classList;e.remove(`mode-${this.mode_was}`),e.add(`mode-${t}`),this.mode_was=t}setAct(t){if(this.act_was===t)return;if(!document.CPU.hadPlayed&&"loading"===t){if(null!==this.act_was)return;t="glow"}let e=this.container.classList;e.remove("act-loading","act-buffer","act-pause","act-play","act-glow"),e.add(`act-${t}`),"play"===this.act_was&&"loading"===t&&e.add("act-buffer"),this.act_was=t}setHide(t){let e=this.container.classList;for(let t of yt)e.remove(`hide-${t}`);for(let n of t)n=n.toLowerCase(),yt.includes(n)&&e.add(`hide-${n}`)}updatePlayButton(){let t=this.audiotag,e=t.getAttribute("preload"),n=this.shadowId("control");const a="aria-label";let i=!e||"none"!==e.toLowerCase();if(t.readyState<t.HAVE_CURRENT_DATA&&(i||t._CPU_played))return this.setAct("loading"),void n.setAttribute(a,y.loading);let o="pause",r="play";t.paused&&(o="play",r="pause",!t._CPU_played&&this.glowBeforePlay&&(r="glow")),this.setAct(r),n.setAttribute(a,y[o]);let s="last-used",l=this.container.classList;t.paused?this.audiotag.isEqualNode(document.CPU.lastUsed)||l.remove(s):(t._CPU_played=!0,l.add(s),this.mode_when_play&&(this.setMode(this.mode_when_play),this.mode_when_play=null))}updateLine(t,e=null){let n=this.shadowId("loadingline");if(!n)return;let{duration:a}=this.audiotag;e=e??(0===a?0:100*t/a),n.style.width=`${e}%`}updateTime(){let t=this.audiotag,e=K(t)?0:Math.floor(t.currentTime),n=t.dataset.canonical??"",a=n.indexOf("#"),i=this.shadowId("elapse");i&&(i.href=`${d(n)}#${a<0?t.id:n.substr(a+1)}&t=${e}`),this.shadowId("currenttime")&&(this.shadowId("currenttime").innerText=E(t.currentTime));let o=this.shadowId("totaltime");if(o){const e=Z(t);o.innerText=G(e)?"":` / ${E(e)}`,Ut(o,e)}this.updateLine(t.currentTime)}updateTimeBorders(){let t=this.audiotag;if(document.CPU.isAudiotagGlobal(t)&&!1!==nt){if(this.plane(Pt)){let t=this.point(Pt,Pt);if(t&&t.start===et&&t.end===nt)return}this.addPlane(Pt,{track:"borders",panel:!1,highlight:!1}),this.addPoint(Pt,Pt,{start:et,link:!1,end:nt})}else this.removePlane(Pt)}updateLoading(t,e){this.updateLine(t,e),this.setAct("loading")}updateError(){const t=this.audiotag;if(!t)return!0;let e=t.error;if(e){let t;this.show("error");const n=MediaError;switch(e.code){case n.MEDIA_ERR_ABORTED:t=y.media_err_aborted;break;case n.MEDIA_ERR_NETWORK:t=y.media_err_network;break;case n.MEDIA_ERR_DECODE:t=y.media_err_decode;break;case n.MEDIA_ERR_SRC_NOT_SUPPORTED:t=y.media_err_src_not_supported;break;default:t=y.media_err_unknow}const a=this.shadowId("pageerror");return a&&(a.innerText=t),!0}return!1}update(){this.updateError()||(this.updatePlayButton(),this.updateTime(),this.updateTimeBorders())}positionTimeElement(t,e=null,n=null){const{duration:a}=this.audiotag;G(a)||(Et(e)&&(t.style.left=e/a*100+"%"),Et(n)&&(t.style.right=100*(1-n/a)+"%"))}async showThrobberAt(t){const e=this.audiotag;if(e.duration<1)return;isNaN(e.duration)&&!K(e)&&(e.setAttribute("preload","metadata"),Y(e,it.hover,event));const n=this.shadowId("popup");this.positionTimeElement(n,t),n.style.opacity=1,n.innerHTML=E(t),n.dateTime=T(t).toUpperCase()}hideThrobber(){this.shadowId("popup").style.opacity=0}hideThrobberLater(){const t=this.shadowId("popup");t._hider&&window.clearTimeout(t._hider),t._hider=window.setTimeout((()=>{this.hideThrobber()}),1e3)}audiotagDataset(){return{...v,...this.audiotag.dataset}}updateLinks(){const t=this.audiotag,e=this.audiotagDataset(),n=d(e.canonical??""),a=0===t.currentTime?"":`&t=${Math.floor(t.currentTime)}`,i=n===d(window.location.href)?t.id:"",o=encodeURIComponent(`${n}#${i}${a}`);let r="";"@"===e.twitter?.[0]&&(r=`&via=${e.twitter.substring(1)}`);const s=t.querySelector("source[data-downloadable]")?.src||e.download||t.currentSrc,l=e.title,u={twitter:`https://twitter.com/share?text=${l}&url=${o}${r}`,facebook:`https://www.facebook.com/sharer.php?t=${l}&u=${o}`,email:`mailto:?subject=${l}&body=${o}`,link:s};for(let t in u){const e=this.shadowId(t);e&&(e.href=u[t])}}show(t){let e=this.container.classList;e.remove("show-main","show-share","show-error","media-streamed"),K(this.audiotag)&&e.add("media-streamed"),e.add(`show-${t}`)}showActions(){this.show("share"),this.updateLinks()}showMain(){Ut(this.container,!0),this.show("main")}showHandheldNav(t){K(this.audiotag)||(this.container.classList.toggle("show-handheld-nav"),t?.preventDefault())}injectCss(e,n){if(!e.match(bt))return a=`injectCss invalid key "${e}"`,void window.console.error(`${t}: `,a);var a;this.removeCss(e);const i=document.createElement("style");i.id=`style_${e}`,i.innerHTML=n,this.container.appendChild(i)}removeCss(t){this.shadowId(`style_${t}`)?.remove()}completeTemplate(){const t=this.audiotagDataset();let{title:e,waveform:n}=t;const a=this.shadowId("canonical");if(a){a.href=t.canonical;let n=a.classList;e?n.remove("untitled"):(n.add("untitled"),e=y.untitled),a.innerText=e}this.element.title!==e&&(this.element.title=e);const i=this.shadowId("poster");i&&(i.src=t.poster||"");const o=this.shadowId("time");o&&(o.style.backgroundImage=n?`url(${n})`:""),this.showMain()}attachAudiotagToInterface(t){t&&(this.audiotag=t,function(t){t.id=t.id||"CPU-Audio-tag-"+V++}(t),this.completeTemplate(),it.update({target:t}))}planeNames(){return Object.keys(this._planes).concat(Object.keys(this.audiotag?._CPU_planes??{}))}plane(t){return this._planes[t]??this.audiotag?._CPU_planes[t]}planeTrack(t){return this.shadowId(`track_«${t}»`)}planePanel(t){return this.shadowId(`panel_«${t}»`)}planeNav(t){return this.planePanel(t)?.querySelector("ul")}drawPlane(t){this.planeTrack(t)?.remove(),this.planePanel(t)?.remove();let e=this.plane(t);if(!e)return;let{track:n,panel:a,title:o}=e;const r=()=>{this.removeHighlightsPoints(t,wt,!0)};function s(t){t.addEventListener("mouseover",kt,i),t.addEventListener("focusin",kt,i),t.addEventListener("mouseleave",r,i),t.addEventListener("focusout",r,i)}if(!1!==n){let e=document.createElement("aside");e.id=`track_«${t}»`,!0!==n&&e.classList.add(n.split(" ")),this.shadowId("line").appendChild(e),s(e)}if(!1!==a){let e=document.createElement("div");e.id=`panel_«${t}»`,!0!==a&&e.classList.add(a.split(" ")),e.classList.add("panel"),e.innerHTML=`<h6>${h(o)}</h6><nav><ul></ul></nav>`,this.container.appendChild(e),Ut(e.querySelector("h6"),o),s(e)}!this.isController&&this.mirroredInController()&&document.CPU.globalController.drawPlane(t)}addPlane(t,e={}){if(!t.match(bt)||this.plane(t))return!1;if((e={track:!0,panel:!0,title:"",highlight:!0,points:{},_comp:!1,...e})._comp)this._planes[t]=e;else{if(this.isController)return!1;this.audiotag._CPU_planes=this.audiotag._CPU_planes??{},this.audiotag._CPU_planes[t]=e}return this.drawPlane(t),!0}removePlane(t){return!(!t.match(bt)||!this.plane(t)||this.isController&&!this._planes[t])&&(delete(this._planes[t]?this._planes:this.audiotag._CPU_planes)[t],this.planeTrack(t)?.remove(),this.planePanel(t)?.remove(),!this.isController&&this.mirroredInController()&&document.CPU.globalController.drawPlane(t),!0)}planePoints(t){return this.plane(t)?.points}point(t,e){return this.plane(t)?.points?.[e]}pointTrack(t,e){return this.shadowId(Tt(t,e,!1))}pointPanel(t,e){return this.shadowId(Tt(t,e,!0))}planeSort(t){const e=this.planePoints(t);if(!e)return;this.plane(t).points=Object.fromEntries(Object.entries(e).sort((([,t],[,e])=>t.start-e.start)));let n=Object.values(this.plane(t).points);this.plane(t)._st_max=n[n.length-1]?.start??0}planePointNames(t){return Object.keys(this.planePoints(t))}panelReorder(t){if(this.planeSort(t),!this.planePanel(t))return;let e,n;for(let a of this.planePointNames(t))n=this.pointPanel(t,a),e?.insertAdjacentElement("afterend",n),e=n}drawPoint(t,e){const n=this.audiotag??document.CPU.globalController.audiotag,a=this.point(t,e),{start:i,link:o,text:r,image:s,end:l}=a;let d="#";!0===o&&(d=`#${n.id}&t=${i}`),"string"==typeof o&&(d=o);let u,c=this.planeTrack(t);if(c){u=this.pointTrack(t,e),u||(u=document.createElement("a"),u.id=Tt(t,e,!1),u.tabIndex=-1,u.innerHTML='<img alt="" /><span></span>',c.appendChild(u)),u.href=d,u.title=r;let n=u.querySelector("img");Ut(n,s),n.src=s||"",u.querySelector("img").innerHTML=r,this.positionTimeElement(u,i,l)}let h,p=this.planeNav(t);if(p){h=this.pointPanel(t,e),h||(h=document.createElement("li"),h.id=Tt(t,e,!0),h.innerHTML='<a href="#" class="cue"><strong></strong><time></time></a>',p.appendChild(h)),h.querySelector("a").href=d,h.querySelector("strong").innerHTML=r;let n=h.querySelector("time");n.dateTime=U(i),n.innerText=E(i)}this.emitEvent("drawPoint",{planeName:t,pointName:e,pointData:a,elementPointTrack:u,elementPointPanel:h}),!this.isController&&this.mirroredInController()&&document.CPU.globalController.drawPoint(t,e)}addPoint(t,e,n={}){let a=Number(n.start);return!(!e.match(bt)||!this.plane(t)||this.point(t,e)||!Lt(n))&&(!(!this._planes[t]&&this.isController)&&(n.start=a,this.plane(t).points[e]=n,this.emitEvent("addPoint",{planeName:t,pointName:e,pointData:n}),this.plane(t)._st_max>a?this.panelReorder(t):(this.drawPoint(t,e),this.plane(t)._st_max=a),!0))}bulkPoints(t,e={}){if(!this.plane(t))return!1;if(!this._planes[t]&&this.isController)return!1;for(let[t,n]of Object.entries(e))if(!t.match(bt)||!Lt(n))return!1;e={...this.plane(t).points,...e},this.plane(t).points=e,this.emitEvent("bulkPoints",{planeName:t,pointDataGroup:e});let n=this.planeNav(t);return n&&(n.innerHTML=""),this.refreshPlane(t),!0}editPoint(t,e,n){let a=this.plane(t);if(!a)return!1;let i=this.point(t,e);if(!i)return!1;let{start:o}=n;o=Number(o);let r=null!=o&&o!==i.start;if(!Lt(n={...i,...n}))return!1;a.points[e]=n,this.drawPoint(t,e),r&&this.panelReorder(t),this.emitEvent("editPoint",{planeName:t,pointName:e,pointData:n}),a._st_max<o&&(a._st_max=o)}removePoint(t,e){let n=this.plane(t);if(!n||!this.point(t,e))return!1;this.emitEvent("removePoint",{planeName:t,pointName:e}),this.pointTrack(t,e)?.remove(),this.pointPanel(t,e)?.remove();let a=0;for(let e of Object.values(this.planePoints(t))){let t=Number(e.start);a=a<t?t:a}return n._st_max=a,!this.isController&&this.mirroredInController()&&document.CPU.globalController.removePoint(t,e),n.points[e]&&delete n.points[e],!0}clearPlane(t){let e=this.plane(t);if(!e)return!1;for(let n of Object.keys(e.points))this.removePoint(t,n);let n=this.planeNav(t);return n&&(n.innerHTML=""),e._st_max=0,!0}refreshPlane(t){this.planeSort(t);for(let e of this.planePointNames(t))this.drawPoint(t,e)}redrawAllPlanes(){r("aside, div.panel",(t=>{t.remove()}),this.container);for(let t of Object.keys({...this._planes,...this.audiotag._CPU_planes}))this.drawPlane(t),this.refreshPlane(t);mt(this)}repositionTracks(){if(!G(this.audiotag.duration))for(let t in this.audiotag._CPU_planes){if(this.plane(t).track)for(let e of this.planePointNames(t)){let n=this.pointTrack(t,e),{start:a,end:i}=this.point(t,e);this.positionTimeElement(n,a,i)}}}removeHighlightsPoints(t,e="with-preview",n=!0){if(r(`#track_«${t}» .${e}, #panel_«${t}» .${e}`,(t=>{t.classList.remove(e)}),this.container),n&&this.mirroredInController()){const n=document.CPU.globalController;(this.isController?p(n.audiotag):n).removeHighlightsPoints(t,e,!1)}}highlightPoint(t,e,n="with-preview",a=!0){if(this.removeHighlightsPoints(t,n,a),this.plane(t)?.highlight&&(this.pointTrack(t,e)?.classList.add(n),this.pointPanel(t,e)?.classList.add(n),a&&this.mirroredInController())){const a=document.CPU.globalController;(this.isController?p(a.audiotag):a).highlightPoint(t,e,n,!1)}}focusPoint(t,e){const n=this.pointPanel(t,e)?.querySelector("a")??this.pointTrack(t,e);return!!n&&(n.focus(),!0)}focused(){return this.shadow.querySelector(":focus")}focusedId(){const t=this.focused();if(!t)return;const e=""!=t.id?t.id:t.closest("[id]").id;return""==e?null:e}prevFocus(){It(this,!1)}nextFocus(){It(this,!0)}}function It(t,e){const n=t.planeNames();if(0==n.length)return;const a=e=>{let{track:n,panel:a,points:i}=t.plane(e);return(!1!==n||!1!==a)&&(t.planePanel(e)?.clientHeight>0||t.planeTrack(e)?.clientHeight>0)&&i&&Object.keys(i).length>0};let i,o,r,l,d=t.focused();if(d&&(d.id||(d=d.closest("[id]")),[o,i]=_t(d.id)),""!=i&&(l=t.planePointNames(o),r=s(l,i,e?1:-1)),!r){if(o=e?(t=>{for(let e=n.indexOf(t)+1;e<n.length;e++){let t=n[e];if(a(t))return t}})(o):(t=>{for(let e=n.indexOf(t)-1;e>=0;e--){let t=n[e];if(a(t))return t}})(o),!o)return;let i=t.planePointNames(o);r=i[e?0:i.length-1]}t.focusPoint(o,r)}function xt(t){const e=document.CPU.globalController;if(e&&!t.isEqualNode(e.audiotag)){const n=document.CPU.globalController.element.querySelector("audio");n&&(j(n),n.remove());const a=e.focusedId();e.attachAudiotagToInterface(t),e.showMain(),e.redrawAllPlanes(),e.setMode(),F(a)}}function $t([{target:n}]){const a=p(n),i=a.element,o="audio",r=i.querySelector(o),s=document.CPU.globalController;if(!r&&i.tagName!==e)return l="<audio> element was removed.",window.console.info(`${t}: `,l),i.remove(),void(s&&B());var l;i.copyAttributesToMediaDataset?.(),a.attributesChanges(),document.CPU.currentPlaylistID()===r?.dataset.playlist&&B()}class Nt extends HTMLElement{constructor(){if(super(),this.CPU=null,this.observer=null,u())this.remove();else{if(this.tagName===t&&!this.querySelector(n))return m(`Tag <${t}> without <audio controls>.\nSee https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md for a correct installation.`),void this.remove();if(this.tagName===e&&document.CPU.globalController)return m(`<${e}> tag instancied twice.`),void this.remove();this.shadow=this.attachShadow({mode:"open"}),this.shadow.innerHTML=`<style>:host{all:initial;display:block;contain:content}#interface,*{font-family:var(--cpu-font-family);font-size:var(--cpu-font-size);font-weight:400;font-style:normal;line-height:1.2;border:none;padding:0;margin:0;text-indent:0;list-style-type:none;user-select:none;transition:color var(--cpu-color-transitions),background-color var(--cpu-background-transitions),opacity var(--cpu-background-transitions)}button{color:currentColor;border:none;text-decoration:none;cursor:pointer;vertical-align:middle;background:var(--cpu-background);color:var(--cpu-color);display:flex;flex-direction:column;overflow:hidden;max-width:var(--cpu-height);max-height:var(--cpu-height);text-align:center}svg{fill:currentColor}[src='']{visibility:hidden}#poster{display:block;max-width:530px;margin:10px 35px;object-fit:contain;opacity:0}.poster-loaded #poster{opacity:1}h5{font-weight:700}#control svg,#loading,#pause,#play,.mode-hidden,.no,.panel{display:none}.act-glow #play,.act-loading #loading,.act-pause #play,.act-play #pause{display:block}.act-glow #play{animation:glow 2s infinite}@keyframes glow{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}.act-loading #loading circle{fill:#777;opacity:1;animation:pulse 2s infinite}#loading circle:nth-child(2){animation-delay:.5s}#loading circle:nth-child(3){animation-delay:1s}@keyframes pulse{50%{opacity:0}}svg{max-width:32px;max-height:32px}#control{display:flex;flex-direction:row;height:32px;align-items:center;margin:0 35px}.expand{flex:auto 1 0}#elapse{text-align:right;height:32px}#elapse span{vertical-align:middle}</style><div id="interface"class="no"><button type="button"id="toggleplay"><img id="poster"class="nosmall"src=""alt=""loading="lazy"decoding="async"><h5 id="title"><span id="canonical"></span></h5><div id="control"><svg id="loading"viewBox="0 0 32 32"><title>${y.loading}</title><circle cx="6"cy="22"r="4"/><circle cx="16"cy="22"r="4"/><circle cx="26"cy="22"r="4"/></svg> <svg id="pause"viewBox="0 0 32 32"><title>${y.pause}</title><path d="M 6,6 12.667,6 12.667,26 6,26 z"/><path d="M 19.333,6 26,6 26,26 19.333,26 z"/></svg> <svg id="play"viewBox="0 0 32 32"><title>${y.play}</title><path d="M 6,6 6,26 26,16 z"/></svg> <span class="expand"></span> <span><span id="currenttime">…</span><span id="totaltime"class="nosmaller"></span></span></div></button></div>`}}connectedCallback(){u()||this.shadowRoot&&(new At(this),this.observer=new MutationObserver($t),this.observer.observe(this,{childList:!0,attributes:!0}),this.CPU.attributesChanges())}disconnectedCallback(){this.observer&&(this.observer.disconnect(),this.CPU.emitEvent("removed"),this.tagName===e&&document.CPU.globalController&&(document.CPU.globalController=null))}}function St([{target:t}]){const e=p(t);pt(e),e.completeTemplate();const n=document.CPU.globalController;e.audiotag.isEqualNode(n?.audiotag)&&(pt(n),n.completeTemplate())}class Ot extends Nt{constructor(){super(),this.audiotag=this.querySelector(n),this.audiotag?this.observer=null:this.remove()}copyAttributesToMediaDataset(){if(this.audiotag){for(let t in document.CPU.defaultDataset)if(this.hasAttribute(t)){const e=this.getAttribute(t);this.audiotag.dataset[t]="duration"!==t?e:k(e)}}else this.remove()}connectedCallback(){this.audiotag&&(this.copyAttributesToMediaDataset(),super.connectedCallback(),Q(this.CPU.audiotag),this.observer=new MutationObserver(St),this.observer.observe(this,{childList:!0,attributes:!0,subtree:!0}),document.CPU.currentPlaylistID()===this.audiotag.dataset.playlist&&B())}disconnectedCallback(){const t=document.CPU.globalController,e=this.audiotag.dataset.playlist;this.audiotag&&t&&this.audiotag.isEqualNode(t.audiotag)?t.element.appendChild(this.audiotag):e&&j(this.audiotag),super.disconnectedCallback()}}const Dt={autoplay:!1,keymove:5,playStopOthers:!0,alternateDelay:500,fastFactor:4,repeatDelay:400,repeatFactor:100,advanceInPlaylist:!0,currentAudiotagPlaying:null,globalController:null,hadPlayed:!1,lastUsed:null,playlists:{},convert:L,trigger:it,defaultDataset:v,findCPU:p,adjacentKey:function(t,e,n){if(!t?.hasOwnProperty)return null;const a=Object.keys(t);return a[a.indexOf(e)+n]},isAudiotagPlaying:function(t){let e=document.CPU.currentAudiotagPlaying;return e&&t.isEqualNode(e)},isAudiotagGlobal:function(t){return this.globalController?t.isEqualNode(this.globalController.audiotag):this.isAudiotagPlaying(t)},jumpIdAt:async function(t,e,n){function i({target:t}){let n=k(e);document.CPU.seekElementAt(t,n);let a={target:t};t.readyState>=t.HAVE_FUTURE_DATA?r(a):t.addEventListener("canplay",r,o),it.update(a)}function r(t){let e=t.target;it.play(null,e),n?.()}let s=""!==t?document.getElementById(t):document.querySelector(a);if(null==(s?.currentTime??null))return void m(`Unknow audiotag ${t}`);let l={target:s};s.readyState<s.HAVE_CURRENT_DATA?(s.addEventListener("loadedmetadata",i,o),s.load(),it.update(l)):i(l)},seekElementAt:function(t,e){if(W(e)||K(t))return;if(e=X(t,e),t.fastSeek)t.fastSeek(e);else try{const n=()=>{t.currentTime=e};t.readyState>=t.HAVE_CURRENT_DATA?n():(t.load(),n(),t.currentTime<e&&t.addEventListener("loadedmetadata",n,{once:!0}))}catch(n){t.src=`${t.currentSrc.split("#")[0]}#t=${e}`}t.CPU_controller()?.updateLoading?.(e)},currentPlaylist:function(){let t=this.globalController?.audiotag;if(!t)return[];for(let e of Object.values(this.playlists))if(e.includes(t.id))return e;return[]},currentPlaylistID:function(){let t=this.globalController?.audiotag;if(!t)return[];for(let e of Object.keys(this.playlists))if(this.playlists[e].includes(t.id))return e;return null}};async function Mt(){let a;!function(){const t=document.createElement("style");t.innerHTML='audio[controls]{display:block;width:100%}:root{--cpu-height:600px;--cpu-font-family:Lato,"Open Sans","Segoe UI",Frutiger,"Frutiger Linotype","Dejavu Sans","Helvetica Neue",Arial,sans-serif;--cpu-font-size:15px;--cpu-font-small-size:calc(var(--cpu-font-size) * 0.8);--cpu-background:#555;--cpu-color:#ddd;--cpu-playing-background:#444;--cpu-playing-color:#fff;--cpu-cue:#000;--cpu-timeline-limits:#f00;--cpu-color-transitions:0.1s;--cpu-background-transitions:0.1s;--cpu-focus-outline:8px dashed #f00}@media (max-width:640px){.interface,:root{--cpu-font-size:13px;--cpu-height:100%}}',document.head.appendChild(t)}(),l()?(a="with-webcomponents",window.customElements.define(t.toLowerCase(),Ot),window.customElements.define(e.toLowerCase(),Nt)):(m("WebComponent may NOT behave correctly on this browser. Only timecode hash links are activated.\nSee https://github.com/dascritch/cpu-audio/ for details"),r(n,J),a="without-webcomponents"),document.body.classList.add(`cpu-audio-${a}`),window.addEventListener("hashchange",it.hashOrder,i),it.hashOrder({at_start:!0})}document.CPU||window.customElements.get(t.toLowerCase())?m("cpu-audio is called twice"):(HTMLDocument.prototype.CPU=Dt,document.body?Mt():document.addEventListener("DOMContentLoaded",Mt,i))})();
//# sourceMappingURL=cpu-audio.big-square.js.map
// Generated theme : big-square

