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
const e="CPU-AUDIO",t="CPU-CONTROLLER",n="#interface",a="audio[controls]",i="cpu-audio audio",o={passive:!0},r={passive:!0,once:!0};function l(e,t,n=document){Array.from(n.querySelectorAll(e)).forEach(t)}function s(e,t,n){if(!e?.indexOf)return null;const a=e.indexOf(t);return-1===a?null:e[a+n]}function d(){return void 0!==window.customElements}function u(e){let t=document.createElement("a");return t.href="string"!=typeof e?e:e.split("#")[0],t.href}function c(){return!window.matchMedia("screen").matches}function h(e){u(window.location.href)===u(e.target.href)&&e.preventDefault()}function p(e){let t=document.createElement("span");t.innerText=e;let n=t.innerHTML;return t.remove(),n}function m(e){return e.closest(n)}function f(n){if([e,t].includes(n.tagName))return n.CPU;let a=n.closest(e);return a?a.CPU:m(n).parentNode.host.CPU}function g(t){window.console.warn(`${e}: `,t)}const y={fr:{loading:"Chargement en cours…",pause:"Pause",play:"Lecture",canonical:"Lien vers la fiche du sonore",moment:"Lien vers ce moment",untitled:"(sans titre)",cover:"pochette",more:"Actions",share:"Partager",twitter:"Partager sur Twitter",facebook:"Partager sur Facebook",e_mail:"Partager par e-mail",download:"Télécharger",back:"Annuler",chapters:"Chapitres",playlist:"Playlist",media_err_aborted:"Vous avez annulé la lecture.",media_err_network:"Une erreur réseau a causé l'interruption du téléchargement.",media_err_decode:"La lecture du sonore a été annulée suite à des problèmes de corruption ou de fonctionnalités non supportés par votre navigateur.",media_err_src_not_supported:"Le sonore n'a pu être chargé, soit à cause de sourcis sur le serveur, le réseau ou parce que le format n'est pas supporté.",media_err_unknow:"Erreur due à une raison inconnue."},en:{loading:"Loading…",pause:"Pause",play:"Play",canonical:"Link to the sound's page",moment:"Link to this time",untitled:"(untitled)",cover:"cover",more:"Actions",share:"Share",twitter:"Share on Twitter",facebook:"Share on Facebook",e_mail:"Share via e-mail",download:"Download",back:"Back",chapters:"Chapters",playlist:"Playlist",media_err_aborted:"You have aborted the play.",media_err_network:"A network error broke the download.",media_err_decode:"Play was canceled due to file corruption or a not supported function in your browser.",media_err_src_not_supported:"The media cannot be downloaded due to server problems, network problems or unsupported by your browser.",media_err_unknow:"Error of unknown cause."}};let _=document.querySelector("html").lang;if(!_.length||!(_.toLowerCase()in y)){_="en";let e=window.navigator.languages;e=void 0!==e?e:[navigator.language||navigator.browserLanguage];let t=!1;for(let n of e)if(n.split){let e=n.split("-")[0];!t&&e in y&&(_=e)}}const w=y[_];let v=document.head;const b={get title(){for(const e of['property="og:title"','name="twitter:title"']){const t=v.querySelector(`meta[${e}]`);if(t)return t.content}const e=document.title;return""===e?null:e},get poster(){for(const e of['property="og:image"','name="twitter:image:src"']){const t=v.querySelector(`meta[${e}]`);if(t)return t.content}return null},get canonical(){const e=v.querySelector('link[rel="canonical"]');return e?e.href:location.href.split("#")[0]},get twitter(){const e=v.querySelector('meta[name="twitter:creator"]');return e&&e.content.length>1?e.content:null},playlist:null,waveform:null,duration:null,download:null},P={d:86400,h:3600,m:60,s:1};let C=[1,60,3600,86400];const k=/^\d+$/,T=/\D*/g,E=function(e){let t=0;return""!==e&&(t=k.test(e)?Number(e):e.includes(":")?x.colontimeInSeconds(e):x.subunittimeInSeconds(e)),t},L=function(e){if(e===1/0)return"?";let t="",n=!1;for(let a in P)if(P.hasOwnProperty(a)){let i=P[a];if(e>=i||n){n=!0;let o=Math.floor(e/i);t+=o+a,e-=o*i}}return""===t?"0s":t},U=function(e){if(e===1/0)return"?";let t="",n=!1;for(let a in P)if(P.hasOwnProperty(a)){let i=P[a];if(e>=i||n){n=!0;let a=Math.floor(e/i);t+=""===t?"":":",t+=(a<10&&""!==t?"0":"")+a,e-=a*i}}return 1===t.length?`0:0${t}`:2===t.length?`0:${t}`:""===t?"0:00":t},A=function(e){return`P${x.secondsInTime(e).toUpperCase()}`},x={timeInSeconds:E,subunittimeInSeconds:function(e){let t,n=0;for(let a in P)P.hasOwnProperty(a)&&e.includes(a)&&([t,e]=e.split(a),n+=Number(t.replace(T,""))*P[a]);return n},colontimeInSeconds:function(e){let t=0,n=e.split(":");for(let e=0;e<n.length;e++)t+=Number(n[e])*C[n.length-1-e];return t},secondsInTime:L,secondsInColonTime:U,secondsInPaddledColonTime:function(e){if(e===1/0)return"?";let t=x.secondsInColonTime(e);return"00:00:00".substr(0,8-t.length)+t},durationIso:A};let I={i:"i",em:"em",b:"b",bold:"strong",u:"u",lang:"i"};const $=/<(\w+)(\.[^>]+)?( [^>]+)?>/gi,N=/<\/(\w+)( [^>]*)?>/gi,S=/\n/gi;function M(e){return!(e in I)}function O(e,t,n,a){if(M(t=t.toLowerCase()))return"";let i="";return"lang"===t&&(i=` lang="${a.trim()}"`),`<${I[t]}${i}>`}function D(e,t){return M(t=t.toLowerCase())?"":`</${I[t]}>`}function H(e){return e.split("<").length!==e.split(">").length?p(e):e.replace($,O).replace(N,D).replace(S,"<br/>")}const q="_playlist";function j(e){const t=document.CPU.globalController;if(!t||!t.isController)return;let n=t.current_playlist;t.current_playlist=document.CPU.currentPlaylist();const a={};if(t.plane(q)||t.addPlane(q,{title:w.playlist,track:!1,panel:"nocuetime",highlight:!0,_comp:!0}),n!==t.current_playlist){if(t.clearPlane(q),0===t.current_playlist.length)return void t.removePlane(q);for(let e of t.current_playlist)a[e]={text:document.getElementById(e)?.dataset.title,link:`#${e}&t=0`};t.bulkPoints(q,a),t.element.shadowRoot.querySelector("main").insertAdjacentElement("afterend",t.planePanel(q))}if(t.highlightPoint(q,t.audiotag.id,oe),e){const[n,a]=de(e);t.focusPoint(n,a)}}function R(e){let t=e.target;if(null!==document.CPU.currentAudiotagPlaying||F(t))return;let n=Number(window.localStorage.getItem(t.currentSrc));n>0&&!V._last_play_error&&(document.CPU.seekElementAt(t,n),V.play(null,t))}HTMLAudioElement.prototype.CPU_connected=!1;let B=0;function F(e){return null==e||e.duration===1/0||null!=e.dataset.streamed}function z(e){e.addEventListener("loadedmetadata",R,o),e.addEventListener("play",V.playOnce,o),e.addEventListener("ended",V.ended,o),e.addEventListener("ready",R,o),e.addEventListener("canplay",R,o),["ready","load","loadeddata","canplay","abort","error","emptied","play","playing","pause","ended","durationchange","loadedmetadata","timeupdate","waiting"].forEach((t=>{e.addEventListener(t,V.update,o)})),d()||["pause","ended"].forEach((t=>{e.addEventListener(t,V.pause,o)})),""===e.getAttribute("preload")&&(e.preload="metadata",e.load())}HTMLAudioElement.prototype.CPU_controller=function(){return this.closest(e)},HTMLAudioElement.prototype.CPU_update=function(){let e=this.CPU_controller();if(e){let t=e.CPU;t&&t.update&&t.update()}document.CPU.globalController&&document.CPU.globalController.update()};let W=null;function K(e,t){V._last_play_error=!1,document.CPU.autoplay&&V.play(e,t)}const V={_timecode_start:0,_timecode_end:!1,_last_play_error:!1,hashOrder:async function(e,t=null){let n=!0;"string"!=typeof e&&(n="at_start"in e,e=location.hash.substr(1));let a="",i="",o=e.split("&"),r=!1;for(let e of o)if(e.includes("=")||""!==a){let[t,n]=e.split("=");switch(t){case"t":i=n||"0",r=!0;break;case"autoplay":r="1"===n;break;case"auto_play":r="true"===n}}else a=e;if(""===i||n&&!r)return void t?.();let[l,s]=i.split(",");V._timecode_start=E(l),V._timecode_end=void 0!==s&&E(s),!1!==V._timecode_end&&(V._timecode_end=V._timecode_end>V._timecode_start&&V._timecode_end),await document.CPU.jumpIdAt(a,l,t),j()},hover:function({target:e,offsetX:t}){let n=f(e),a=t/e.clientWidth*n.audiotag.duration;n.showThrobberAt(a)},out:function({target:e}){f(e).hideThrobber()},throbble:function(e){let t=0,{target:n,offsetX:a}=e,i=document.CPU,o=f(n).audiotag;if(o.duration!==1/0){if(i.currentAudiotagPlaying&&!i.isAudiotagPlaying(o)&&V.pause(void 0,i.currentAudiotagPlaying),isNaN(o.duration)&&!F(o)){let e=o.CPU_controller();e&&e.updateLoading&&e.updateLoading(void 0,100*a/n.clientWidth);let t="loadedmetadata";return o.addEventListener(t,(()=>{V.throbble({offsetX:a,target:n})}),r),void o.setAttribute("preload","metadata")}if(null!=e.at)t=e.at;else{t=e.offsetX/n.clientWidth*o.duration}i.seekElementAt(o,t),V.play(e)}else V.play(e)},pause:function(e=null,t=null){if(!t){let{target:n}=e;t="AUDIO"===n.tagName?n:f(n).audiotag}t.pause(),document.CPU.currentAudiotagPlaying=null,window.localStorage.removeItem(t.currentSrc)},playOnce:function({target:e}){let t=document.CPU;document.CPU.lastUsed=e,t.playStopOthers&&t.currentAudiotagPlaying&&!t.isAudiotagPlaying(e)&&V.pause(void 0,t.currentAudiotagPlaying),t.currentAudiotagPlaying=e},play:function(e=null,t=null){if(!e&&V._last_play_error)return void g("play() prevented because already waiting for focus");var n;t=t??f(e.target).audiotag,V._last_play_error=!1,((n=t.currentTime)<V._timecode_start||!1!==V._timecode_end&&n>V._timecode_end)&&(V._timecode_start=0,V._timecode_end=!1);let a=t.play();a&&a.then((()=>{document.CPU.hadPlayed=!0})).catch((e=>{V._last_play_error=!0;let n=K.bind(this,t);switch(e.name){case"NotAllowedError":if(g("Auto-play prevented : Browser requires a manual interaction first."),document.addEventListener("focus",n,r),document.addEventListener("click",n,r),t.CPU_connected){let e=t.CPU_controller().CPU;e.glowBeforePlay=!0,e.setActContainer("glow")}break;case"NotSupportedError":e("The browser refuses the audio source, probably due to audio format.")}})),function(e){const t=document.CPU.globalController;if(t&&!e.isEqualNode(t.audiotag)){const n=t.focusedId();t.attachAudiotagToController(e),t.audiotag=e,t.showMain(),t.redrawAllPlanes(),t.setModeContainer(),j(n)}}(t)},toggleplay:function({target:e}){const t=f(e).audiotag;t.paused?V.play(event,t):V.pause(void 0,t)},key:function(e,t=1){if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;let n=f(e.target),a=n.audiotag;function i(t){let i=n.audiotag.currentTime+t;i=i>0?i:0;let o=a.duration;isNaN(o)||(i=i<o?i:o),e.at=i,n.showThrobberAt(e.at),V.throbble(e),n.hideThrobberLater()}switch(e.keyCode){case 13:if("control"!=n.focused()?.id.toLowerCase())return;V.toggleplay(e);break;case 27:V.restart(e),V.pause(void 0,a);break;case 32:V.toggleplay(e);break;case 35:document.CPU.seekElementAt(a,a.duration);break;case 36:V.restart(e);break;case 37:i(-document.CPU.keymove*t);break;case 39:i(+document.CPU.keymove*t);break;case 38:n.prevFocus();break;case 40:n.nextFocus();break;default:return}e.preventDefault?.()},restart:function({target:e}){let t=f(e);document.CPU.seekElementAt(t.audiotag,0)},reward:function(e){e.keyCode=37,V.key(e)},foward:function(e){e.keyCode=39,V.key(e)},fastreward:function(e){e.keyCode=37,V.key(e,document.CPU.fastFactor)},fastfoward:function(e){e.keyCode=39,V.key(e,document.CPU.fastFactor)},prevcue:function(){const e=f(event.target),t=e.audiotag,n=e.planePoints("_chapters");if(!n)return;const[,a]=de(W);let i=s(n,a,-1);if(!i)for(let e of Object.values(n).reverse())!i&&e.end<=t.currentTime&&(i=e);i&&document.CPU.jumpIdAt(t.id,i.start)},nextcue:function(){const e=f(event.target),t=e.audiotag,n=e.planePoints("_chapters");if(!n)return;const[,a]=de(W);let i=s(n,a,1);if(!i)for(let e of Object.values(n))!i&&e.start>=t.currentTime&&(i=e);i&&document.CPU.jumpIdAt(t.id,i.start)},cuechange:function(e,t){let n=document.body.classList;n.remove(W),W=`cpu_playing_tag_«${t.id}»_cue_«${e.id}»`,n.add(W)},update:function({target:e}){!1!==V._timecode_end&&e.currentTime>V._timecode_end&&V.pause(void 0,e),e.CPU_update(),e.paused||F(e)||window.localStorage.setItem(e.currentSrc,String(e.currentTime))},ended:function({target:e},t=null){t=t??e;let{dataset:n,id:a}=t;if(!n.playlist)return;let i=n.playlist,o=document.CPU.playlists[i];if(void 0===o)return void g(`Named playlist ${i} not created. WTF ?`);let r=o.indexOf(a);if(r<0)return void g(`Audiotag ${a} not in playlist ${i}. WTF ?`);if(r+1===o.length)return;let l=o[r+1],s=document.getElementById(l);s?(document.CPU.seekElementAt(s,0),V.play({},s)):g(`Audiotag #${l} doesn't exists. WTF ?`)}};let X=null;const Z=["fastreward","reward","foward","fastfoward"],G={press:function(e){let t=e.target.id?e.target:e.target.closest("button");t.id&&Z.includes(t.id)&&(V[t.id](e),X&&window.clearTimeout(X),X=window.setTimeout(G.repeat,document.CPU.repeatDelay,{target:t}),e.preventDefault())},repeat:function(e){V[e.target.id](e),X=window.setTimeout(G.repeat,document.CPU.repeatFactor,e),e.preventDefault?.()},release:function(e){window.clearTimeout(X),X=null,e.preventDefault()}},Y="_chapters";function J(e){if(!e)return null;let t=null;if(e.textTracks?.length>0)for(let n of e.textTracks)"chapters"!==n.kind.toLowerCase()||!n.cues||t&&n.language.toLowerCase()!==_||(t=n);return t}async function Q(e){if(e.isController)return;const t=e.audiotag;let n=!1;const a={};if(t){const i=J(t);if(i?.cues.length>0){e.addPlane(Y,{title:w.chapters,track:"chapters"});let t=ee.bind(void 0,e);i.removeEventListener("cuechange",t),i.addEventListener("cuechange",t,o);for(let t of i.cues)if(!e.point(Y,t.id)){let e=Math.floor(t.startTime);a[t.id]={start:e,text:H(t.text),link:!0,end:t.endTime}}i.cues.length>0&&(n=!0),e.bulkPoints(Y,a),ee(e,{target:{activeCues:i.cues}})}}let i=`cpu_tag_«${t.id}»_chaptered`,r=document.body.classList;n?r.add(i):(e.removePlane(Y),r.remove(i))}function ee(e,t=null){const n=t?t.target.activeCues:J(e.audiotag)?.activeCues;let a,i=e.audiotag.currentTime;if(n?.length>0)for(let e of n)e.startTime<=i&&i<e.endTime&&(a=e);a?.id!==e._activecue_id&&(e.removeHighlightsPoints(Y,oe),e._activecue_id=a?.id,a&&(V.cuechange(a,e.audiotag),e.emitEvent("chapterChanged",{cue:a}),e.highlightPoint(Y,a.id,oe)))}function te(e){let{title:t,canonical:n}=f(e.target).audiotagDataset();navigator.share({title:t,text:t,url:n}),e.preventDefault()}function ne(e){let t=e.shadowId("interface").classList;e.shadowId("poster")?.addEventListener("load",(()=>{t.add("poster-loaded")}),o);let n=e.showMain.bind(e),a={pause:V.pause,play:V.play,time:V.throbble,actions:e.showActions.bind(e),back:n,poster:n,restart:V.restart,toggleplay:V.toggleplay};for(let t in a)e.shadowId(t)?.addEventListener("click",a[t],o);let i=["prevcue","fastreward","reward","foward","fastfoward","nextcue"];for(let t of i){const n=e.shadowId(t);n?.addEventListener("pointerdown",G.press),n?.addEventListener("pointerout",G.release),n?.addEventListener("pointerup",G.release)}e.element.addEventListener("keydown",V.key);let l=e.shadowId("time"),s={mouseover:!0,mousemove:!0,mouseout:!1,touchstart:!0,touchend:!1,touchcancel:!1};for(let e in s)l?.addEventListener(e,s[e]?V.hover:V.out,o);if(l?.addEventListener("contextmenu",e.showHandheldNav.bind(e)),navigator.share&&(t.add("hasnativeshare"),e.shadowId("nativeshare")?.addEventListener("click",te,o)),!e.audiotag)return;e.audiotag.addEventListener("durationchange",e.repositionTracks.bind(e),o),function(e){Q(e);let t=e.audiotag,n=Q.bind(void 0,e);t.addEventListener("loadedmetadata",n,r);let a=t.querySelector('track[kind="chapters"]');a&&!a._CPU_load_ev&&(a._CPU_load_ev=a.addEventListener("load",n,o))}(e),j(),e.showMain(),e.updatePlayButton(),e.emitEvent("ready"),e.updateLinks();let d=e.shadowId("canonical");d&&d.addEventListener("click",h)}const ae=["poster","actions","timeline","chapters","panels","panels-title","panels-except-play"],ie="with-preview",oe="active-cue";let re="_borders";const le=/^[a-zA-Z0-9\-_]+$/,se=/^[a-zA-Z0-9\-_]+_«([a-zA-Z0-9\-_]+)(»_.*_«([a-zA-Z0-9\-_]+))?»$/;function de(e){let t,n;return"string"==typeof e&&([,t,,n]=e?.match(se)||[]),[t??"",n??""]}function ue({target:e}){if(e.id||(e=e.closest("[id]")),!e)return;let[t,n]=de(e.id);f(e).highlightPoint(t,n)}function ce(e,t,n){return`${n?"panel":"track"}_«${e}»_point_«${t}»`}function he(e=!1){return void 0!==e&&!1!==e}function pe({classList:e},t){t?e.remove("no"):e.add("no")}function me({start:e,end:t}){return(null==e||e>=0)&&(null==t||t>=e)}class fe{constructor(e,n){this.element=e,this.shadow=e.shadowRoot,this.audiotag=e.audiotag,this.container=n,this.mode_when_play=null,this.glowBeforePlay=!!e.hasAttribute("glow"),this.current_playlist=[],this._activecue_id=null,this.mode_was=null,this.act_was=null,e.CPU=this,this.audiotag&&!this.audiotag._CPU_planes&&(this.audiotag._CPU_planes={}),this.isController=this.element.tagName===t,this._planes={},this.audiotag||(document.CPU.globalController=this,this.audiotag=document.querySelector(i)),ne(this),this.attachAudiotagToController(this.audiotag),this.attributesChanges()}attributesChanges(){let e=null;if(this.element.hasAttribute("mode")){e=this.element.getAttribute("mode");let[t,n]=e.split(",");n&&(e=this.audiotag.paused?t:n,this.mode_when_play=n)}this.setModeContainer(e),this.element.hasAttribute("hide")&&this.setHideContainer(this.element.getAttribute("hide").split(" "))}mirroredInController(){let e=document.CPU.globalController;return e&&this.audiotag.isEqualNode(e.audiotag)}translateVTT(e){return H(e)}planeAndPointNamesFromId(e){return de(e)}async emitEvent(e,t){this.element.dispatchEvent(new CustomEvent(`CPU_${e}`,{target:this.element,bubbles:!0,cancelable:!1,composed:!1,detail:t}))}shadowId(e){return this.shadow.getElementById(e)}setModeContainer(e=null){if(e=e??"default",this.mode_was===e)return;let t=this.container.classList;t.remove(`mode-${this.mode_was}`),t.add(`mode-${e}`),this.mode_was=e}setActContainer(e){if(this.act_was===e)return;if(!document.CPU.hadPlayed&&null!==this.act_was&&"loading"===e)return;let t=this.container.classList;t.remove("act-loading","act-buffer","act-pause","act-play","act-glow"),t.add(`act-${e}`),"play"===this.act_was&&"loading"===e&&t.add("act-buffer"),this.act_was=e}setHideContainer(e){let t=this.container.classList;for(let e of ae)t.remove(`hide-${e}`);for(let n of e)n=n.toLowerCase(),ae.includes(n)&&t.add(`hide-${n}`)}updatePlayButton(){let e=this.audiotag,t=e.getAttribute("preload"),n=this.shadowId("control");const a="aria-label";let i=!t||"none"!==t.toLowerCase();if(e.readyState<HTMLMediaElement.HAVE_CURRENT_DATA&&(i||e._CPU_played))return this.setActContainer("loading"),void n.setAttribute(a,w.loading);let o="pause",r="play";e.paused&&(o="play",r="pause",!e._CPU_played&&this.glowBeforePlay&&(r="glow")),this.setActContainer(r),n.setAttribute(a,w[o]);let l="last-used",s=this.container.classList;e.paused?this.audiotag.isEqualNode(document.CPU.lastUsed)||s.remove(l):(e._CPU_played=!0,s.add(l),this.mode_when_play&&(this.setModeContainer(this.mode_when_play),this.mode_when_play=null))}updateLine(e,t=null){let n=this.shadowId("loadingline");if(!n)return;let{duration:a}=this.audiotag;t=t??(0===a?0:100*e/a),n.style.width=`${t}%`}updateTime(){let e=this.audiotag,t=F(e)?0:Math.floor(e.currentTime),n=e.dataset.canonical??"",a=n.indexOf("#"),i=this.shadowId("elapse");i&&(i.href=`${u(n)}#${a<0?e.id:n.substr(a+1)}&t=${t}`),this.shadowId("currenttime")&&(this.shadowId("currenttime").innerText=U(e.currentTime));let o=this.shadowId("totaltime");if(o){let t=!1,n=Math.round(e.duration);if(isNaN(n)){let n=Math.round(e.dataset.duration);n>0&&(t=U(n))}else t=U(n);o.innerText=t?` / ${t}`:"",pe(o,t)}this.updateLine(e.currentTime)}updateTimeBorders(){let e=this.audiotag;if(document.CPU.isAudiotagGlobal(e)&&!1!==V._timecode_end){if(this.plane(re)){let e=this.point(re,re);if(e&&e.start===V._timecode_start&&e.end===V._timecode_end)return}this.addPlane(re,{track:"borders",panel:!1,highlight:!1}),this.addPoint(re,re,{start:V._timecode_start,link:!1,end:V._timecode_end})}else this.removePlane(re)}updateLoading(e,t){this.updateLine(e,t),this.setActContainer("loading")}updateError(){let e=this.audiotag;if(!e)return!0;let t=e.error;if(t){let e,n=this.shadowId("pageerror");switch(this.showInterface("error"),t.code){case MediaError.MEDIA_ERR_ABORTED:e=w.media_err_aborted;break;case MediaError.MEDIA_ERR_NETWORK:e=w.media_err_network;break;case MediaError.MEDIA_ERR_DECODE:e=w.media_err_decode;break;case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:e=w.media_err_src_not_supported;break;default:e=w.media_err_unknow}return n.innerText=e,!0}return!1}update(){this.updateError()||(this.updatePlayButton(),this.updateTime(),this.updateTimeBorders())}positionTimeElement(e,t=null,n=null){let{duration:a}=this.audiotag;0===a||isNaN(a)||(he(t)&&(e.style.left=t/a*100+"%"),he(n)&&(e.style.right=100*(1-n/a)+"%"))}async showThrobberAt(e){let t=this.audiotag;if(t.duration<1)return;isNaN(t.duration)&&!F(t)&&t.setAttribute("preload","metadata");let n=this.shadowId("popup");n.style.opacity=1,this.positionTimeElement(n,e),n.innerHTML=U(e),n.dateTime=L(e).toUpperCase()}hideThrobber(){this.shadowId("popup").style.opacity=0}hideThrobberLater(){let e=this.shadowId("popup");e._hider&&window.clearTimeout(e._hider),e._hider=window.setTimeout(this.hideThrobber.bind(this),1e3)}audiotagDataset(){return{...b,...this.audiotag.dataset}}updateLinks(){let e=this,t=this.audiotag,n=this.audiotagDataset(),a=u(n.canonical??""),i=0===t.currentTime?"":`&t=${Math.floor(t.currentTime)}`,o=a===u(window.location.href)?t.id:"",r=encodeURIComponent(`${a}#${o}${i}`),l="";"@"===n.twitter?.[0]&&(l=`&via=${n.twitter.substring(1)}`);const s=t.querySelector("source[data-downloadable]")?.src||n.download||t.currentSrc,d=n.title,c={twitter:`https://twitter.com/share?text=${d}&url=${r}${l}`,facebook:`https://www.facebook.com/sharer.php?t=${d}&u=${r}`,email:`mailto:?subject=${d}&body=${r}`,link:s};for(let t in c){const n=e.shadowId(t);n&&(n.href=c[t])}}showInterface(e){let t=this.container.classList;t.remove("show-main","show-share","show-error","media-streamed"),F(this.audiotag)&&t.add("media-streamed"),t.add(`show-${e}`)}showActions(){this.showInterface("share"),this.updateLinks()}showMain(){pe(this.container,!0),this.showInterface("main")}showHandheldNav(e){F(this.audiotag)||(this.container.classList.toggle("show-handheld-nav"),e?.preventDefault())}injectCss(t,n){if(!t.match(le))return a=`injectCss invalid key "${t}"`,void window.console.error(`${e}: `,a);var a;this.removeCss(t);let i=document.createElement("style");i.id=`style_${t}`,i.innerHTML=n,this.container.appendChild(i)}removeCss(e){this.shadowId(`style_${e}`)?.remove()}completeTemplate(){const e=this.audiotagDataset();let{title:t,waveform:n}=e;const a=this.shadowId("canonical");if(a){a.href=e.canonical;let n=a.classList;t?n.remove("untitled"):(n.add("untitled"),t=w.untitled),a.innerText=t}this.element.title!==t&&(this.element.title=t);const i=this.shadowId("poster");i&&(i.src=e.poster||"");const o=this.shadowId("time");o&&(o.style.backgroundImage=n?`url(${n})`:""),this.showMain()}attachAudiotagToController(e){e&&(this.audiotag=e,function(e){e.id=e.id||"CPU-Audio-tag-"+B++}(e),this.completeTemplate(),V.update({target:e}))}planeNames(){return Object.keys(this._planes).concat(Object.keys(this.audiotag._CPU_planes))}plane(e){return this._planes[e]??this.audiotag._CPU_planes[e]}planeTrack(e){return this.shadowId(`track_«${e}»`)}planePanel(e){return this.shadowId(`panel_«${e}»`)}planeNav(e){return this.planePanel(e)?.querySelector("ul")}drawPlane(e){this.planeTrack(e)?.remove(),this.planePanel(e)?.remove();let t=this.plane(e);if(!t)return;let{track:n,panel:a,title:i}=t,r=this.removeHighlightsPoints.bind(this,e,ie,!0);function l(e){e.addEventListener("mouseover",ue,o),e.addEventListener("focusin",ue,o),e.addEventListener("mouseleave",r,o),e.addEventListener("focusout",r,o)}if(!1!==n){let t=document.createElement("aside");t.id=`track_«${e}»`,!0!==n&&t.classList.add(n.split(" ")),this.shadowId("line").appendChild(t),l(t)}if(!1!==a){let t=document.createElement("div");t.id=`panel_«${e}»`,!0!==a&&t.classList.add(a.split(" ")),t.classList.add("panel"),t.innerHTML=`<h6>${p(i)}</h6><nav><ul></ul></nav>`,this.container.appendChild(t),pe(t.querySelector("h6"),i),l(t)}!this.isController&&this.mirroredInController()&&document.CPU.globalController.drawPlane(e)}addPlane(e,t={}){if(!e.match(le)||this.plane(e))return!1;if((t={track:!0,panel:!0,title:"",highlight:!0,points:{},_comp:!1,...t})._comp)this._planes[e]=t;else{if(this.isController)return!1;this.audiotag._CPU_planes=this.audiotag._CPU_planes??{},this.audiotag._CPU_planes[e]=t}return this.drawPlane(e),!0}removePlane(e){return!(!e.match(le)||!this.plane(e)||this.isController&&!this._planes[e])&&(delete(this._planes[e]?this._planes:this.audiotag._CPU_planes)[e],this.planeTrack(e)?.remove(),this.planePanel(e)?.remove(),!this.isController&&this.mirroredInController()&&document.CPU.globalController.drawPlane(e),!0)}planePoints(e){return this.plane(e)?.points}point(e,t){return this.plane(e)?.points?.[t]}pointTrack(e,t){return this.shadowId(ce(e,t,!1))}pointPanel(e,t){return this.shadowId(ce(e,t,!0))}planeSort(e){this.plane(e).points=Object.fromEntries(Object.entries(this.planePoints(e)).sort((([,e],[,t])=>e.start-t.start)));let t=Object.values(this.plane(e).points);this.plane(e)._st_max=t[t.length-1]?.start??0}planePointNames(e){return Object.keys(this.planePoints(e))}panelReorder(e){if(this.planeSort(e),!this.planePanel(e))return;let t,n;for(let a of this.planePointNames(e))n=this.pointPanel(e,a),t?.insertAdjacentElement("afterend",n),t=n}drawPoint(e,t){let n=this.audiotag?this.audiotag:document.CPU.globalController.audiotag,a=this.point(e,t),{start:i,link:o,text:r,image:l,end:s}=a,d="#";!0===o&&(d=`#${n.id}&t=${i}`),"string"==typeof o&&(d=o);let u,c=this.planeTrack(e);if(c){u=this.pointTrack(e,t),u||(u=document.createElement("a"),u.id=ce(e,t,!1),u.tabIndex=-1,u.innerHTML='<img alt="" /><span></span>',c.appendChild(u)),u.href=d,u.title=r;let n=u.querySelector("img");pe(n,l),n.src=l||"",u.querySelector("img").innerHTML=r,this.positionTimeElement(u,i,s)}let h,p=this.planeNav(e);if(p){h=this.pointPanel(e,t),h||(h=document.createElement("li"),h.id=ce(e,t,!0),h.innerHTML='<a href="#" class="cue"><strong></strong><time></time></a>',p.appendChild(h)),h.querySelector("a").href=d,h.querySelector("strong").innerHTML=r;let n=h.querySelector("time");n.dateTime=A(i),n.innerText=U(i)}this.emitEvent("drawPoint",{planeName:e,pointName:t,pointData:a,elementPointTrack:u,elementPointPanel:h}),!this.isController&&this.mirroredInController()&&document.CPU.globalController.drawPoint(e,t)}addPoint(e,t,n={}){let a=Number(n.start);return!(!t.match(le)||!this.plane(e)||this.point(e,t)||!me(n))&&(!(!this._planes[e]&&this.isController)&&(n.start=a,this.plane(e).points[t]=n,this.emitEvent("addPoint",{planeName:e,pointName:t,pointData:n}),this.plane(e)._st_max>a?this.panelReorder(e):(this.drawPoint(e,t),this.plane(e)._st_max=a),!0))}bulkPoints(e,t={}){if(!this.plane(e))return!1;if(!this._planes[e]&&this.isController)return!1;for(let[e,n]of Object.entries(t))if(!e.match(le)||!me(n))return!1;t={...this.plane(e).points,...t},this.plane(e).points=t,this.emitEvent("bulkPoints",{planeName:e,pointDataGroup:t});let n=this.planeNav(e);return n&&(n.innerHTML=""),this.refreshPlane(e),!0}editPoint(e,t,n){let a=this.plane(e);if(!a)return!1;let i=this.point(e,t);if(!i)return!1;let{start:o}=n;o=Number(o);let r=null!=o&&o!==i.start;if(!me(n={...i,...n}))return!1;a.points[t]=n,this.drawPoint(e,t),r&&this.panelReorder(e),this.emitEvent("editPoint",{planeName:e,pointName:t,pointData:n}),a._st_max<o&&(a._st_max=o)}removePoint(e,t){let n=this.plane(e);if(!n||!this.point(e,t))return!1;this.emitEvent("removePoint",{planeName:e,pointName:t}),this.pointTrack(e,t)?.remove(),this.pointPanel(e,t)?.remove();let a=0;for(let t of Object.values(this.planePoints(e))){let e=Number(t.start);a=a<e?e:a}return n._st_max=a,!this.isController&&this.mirroredInController()&&document.CPU.globalController.removePoint(e,t),n.points[t]&&delete n.points[t],!0}clearPlane(e){let t=this.plane(e);if(!t)return!1;for(let n of Object.keys(t.points))this.removePoint(e,n);let n=this.planeNav(e);return n&&(n.innerHTML=""),t._st_max=0,!0}refreshPlane(e){this.planeSort(e);for(let t of this.planePointNames(e))this.drawPoint(e,t)}redrawAllPlanes(){l("aside, div.panel",(e=>{e.remove()}),this.container);for(let e of Object.keys({...this._planes,...this.audiotag._CPU_planes}))this.drawPlane(e),this.refreshPlane(e);ee(this)}repositionTracks(){let e=this.audiotag.duration;if(0!==e&&!isNaN(e))for(let e in this.audiotag._CPU_planes){if(this.plane(e).track)for(let t of this.planePointNames(e)){let n=this.pointTrack(e,t),{start:a,end:i}=this.point(e,t);this.positionTimeElement(n,a,i)}}}removeHighlightsPoints(e,t="with-preview",n=!0){if(l(`#track_«${e}» .${t}, #panel_«${e}» .${t}`,(e=>{e.classList.remove(t)}),this.container),n&&this.mirroredInController()){let n,a=document.CPU.globalController;n=this.isController?f(a.audiotag):a,n.removeHighlightsPoints(e,t,!1)}}highlightPoint(e,t,n="with-preview",a=!0){if(this.removeHighlightsPoints(e,n,a),this.plane(e)?.highlight&&(this.pointTrack(e,t)?.classList.add(n),this.pointPanel(e,t)?.classList.add(n),a&&this.mirroredInController())){let a,i=document.CPU;a=this.isController?f(i.globalController.audiotag):i.globalController,a.highlightPoint(e,t,n,!1)}}focusPoint(e,t){const n=this.pointPanel(e,t)?.querySelector("a")??this.pointTrack(e,t);return!!n&&(n.focus(),!0)}focused(){return this.shadow.querySelector(":focus")}focusedId(){const e=this.focused();if(!e)return;const t=""!=e.id?e.id:e.closest("[id]").id;return""==t?null:t}prevFocus(){ge(this,!1)}nextFocus(){ge(this,!0)}}function ge(e,t){const n=e.planeNames();if(0==n.length)return;const a=t=>{let{track:n,panel:a,points:i}=e.plane(t);return(!1!==n||!1!==a)&&i&&Object.keys(i).length>0};let i,o,r,l,d=e.focused();if(d&&(d.id||(d=d.closest("[id]")),[o,i]=de(d.id)),""!=i&&(l=e.planePointNames(o),r=s(l,i,t?1:-1)),!r){if(o=t?(e=>{for(let t=n.indexOf(e)+1;t<n.length;t++){let e=n[t];if(a(e))return e}})(o):(e=>{for(let t=n.indexOf(e)-1;t>=0;t--){let e=n[t];if(a(e))return e}})(o),!o)return;let i=e.planePointNames(o);r=i[t?0:i.length-1]}e.focusPoint(o,r)}function ye([{target:n}]){const a=f(n);let i=a.element,o="audio";if(!i.querySelector(o)&&i.tagName!==t)return r="<audio> element was removed.",window.console.info(`${e}: `,r),void i.remove();var r;i.copyAttributesToMediaDataset?.(),a.attributesChanges()}class _e extends HTMLElement{constructor(){if(super(),this.CPU=null,this.observer_component=null,c())return void this.remove();if(this.tagName===e&&!this.querySelector(a))return g(`Tag <${e}> without <audio controls>.\nSee https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md for a correct installation.`),void this.remove();if(this.tagName===t&&document.CPU.globalController)return g(`<${t}> tag instancied twice.`),void this.remove();let n=document.querySelector("template#CPU__template");this.attachShadow({mode:"open"}).innerHTML=n.innerHTML}connectedCallback(){c()||this.shadowRoot&&(new fe(this,this.shadowRoot.querySelector(n)),this.observer_component=new MutationObserver(ye),this.observer_component.observe(this,{childList:!0,attributes:!0}),this.CPU.attributesChanges())}disconnectedCallback(){this.tagName===t&&document.CPU.globalController&&(document.CPU.globalController=null)}}function we([{target:e}]){const t=f(e);Q(t),t.completeTemplate();const n=document.CPU.globalController;t.audiotag.isEqualNode(n?.audiotag)&&(Q(n),n.completeTemplate())}class ve extends _e{constructor(){super(),this.audiotag=this.querySelector(a),this.audiotag?this.observer_audio=null:this.remove()}copyAttributesToMediaDataset(){if(this.audiotag){for(let e in document.CPU.defaultDataset)if(this.hasAttribute(e)){let t=this.getAttribute(e);this.audiotag.dataset[e]="duration"!==e?t:E(t)}}else this.remove()}connectedCallback(){this.audiotag&&(this.copyAttributesToMediaDataset(),super.connectedCallback(),function(e){if(!e.CPU_connected&&(e.CPU_connected=!0,z(e),e.hidden=!0,e.removeAttribute("controls"),"string"==typeof e.dataset.playlist)){let t=e.dataset.playlist;t in document.CPU.playlists||(document.CPU.playlists[t]=[]),document.CPU.playlists[t].push(e.id),document.CPU.globalController&&t===document.CPU.currentPlaylist()&&j()}}(this.CPU.audiotag),this.observer_audio=new MutationObserver(we),this.observer_audio.observe(this,{childList:!0,attributes:!0,subtree:!0}))}disconnectedCallback(){if(this.audiotag?.id){const e=document.CPU.playlists;for(let t in e){const n=e[t].filter((e=>e!==this.audiotag.id));document.CPU.playlists[t]=n,0===n.length&&delete document.CPU.playlists[t]}}}}const be={autoplay:!1,keymove:5,playStopOthers:!0,alternateDelay:500,fastFactor:4,repeatDelay:400,repeatFactor:100,advanceInPlaylist:!0,currentAudiotagPlaying:null,globalController:null,hadPlayed:!1,lastUsed:null,playlists:{},convert:x,trigger:V,defaultDataset:b,findInterface:m,findContainer:f,adjacentKey:function(e,t,n){if(!e?.hasOwnProperty)return null;const a=Object.keys(e);return a[a.indexOf(t)+n]},isAudiotagPlaying:function(e){let t=document.CPU.currentAudiotagPlaying;return t&&e.isEqualNode(t)},isAudiotagGlobal:function(e){return this.globalController?e.isEqualNode(this.globalController.audiotag):this.isAudiotagPlaying(e)},jumpIdAt:async function(e,t,n){function a({target:e}){let n=E(t);document.CPU.seekElementAt(e,n);let a={target:e};e.readyState>=e.HAVE_FUTURE_DATA?o(a):e.addEventListener("canplay",o,r),V.update(a)}function o(e){let t=e.target;V.play(null,t),n?.()}let l=""!==e?document.getElementById(e):document.querySelector(i);if(null==l||void 0===l.currentTime)return void g(`Unknow audiotag ${e}`);let s={target:l};l.readyState<HTMLMediaElement.HAVE_CURRENT_DATA?(l.addEventListener("loadedmetadata",a,r),l.load(),V.update(s)):a(s)},seekElementAt:function(e,t){if(isNaN(t)||F(e))return;if(e.fastSeek)e.fastSeek(t);else try{e.currentTime=t}catch(n){e.src=`${e.currentSrc.split("#")[0]}#t=${t}`}e.CPU_controller()?.updateLoading?.(t)},currentPlaylist:function(){let e=this.globalController?.audiotag;if(!e)return[];for(let t of Object.values(this.playlists))if(t.includes(e.id))return t;return[]}};async function Pe(){!function(){let e=document.createElement("style");e.innerHTML='audio[controls]{display:block;width:100%}:root{--cpu-height:600px;--cpu-font-family:Lato,"Open Sans","Segoe UI",Frutiger,"Frutiger Linotype","Dejavu Sans","Helvetica Neue",Arial,sans-serif;--cpu-font-size:15px;--cpu-font-small-size:calc(var(--cpu-font-size) * 0.8);--cpu-background:#555;--cpu-color:#ddd;--cpu-playing-background:#444;--cpu-playing-color:#fff;--cpu-error-background:#a00;--cpu-error-color:#ff7;--cpu-popup-background:#aaa;--cpu-popup-color:#333;--cpu-cue:#000;--cpu-timeline-limits:#f00;--cpu-color-transitions:0s;--cpu-background-transitions:0s;--cpu-unfold:0s;--cpu-focus-outline:none}@media (max-width:640px){.interface,:root{--cpu-font-size:13px;--cpu-height:480px}@media (max-width:480px){.interface,:root{--cpu-height:100vh}}}',document.head.appendChild(e);let t=document.createElement("template");t.id="CPU__template",t.innerHTML=`<style>:host{all:initial;display:block;contain:content}#interface{--cpu-timeline-height:10px}#interface,*{font-family:var(--cpu-font-family);font-size:var(--cpu-font-size);font-weight:400;font-style:normal;line-height:1.2;border:none;padding:0;margin:0;text-indent:0;list-style-type:none;user-select:none;transition:color var(--cpu-color-transitions),background-color var(--cpu-background-transitions),opacity var(--cpu-background-transitions)}button{color:currentColor;border:none;text-decoration:none;cursor:pointer;vertical-align:middle;background:var(--cpu-background);color:var(--cpu-color);display:flex;flex-direction:column;overflow:hidden;width:var(--cpu-height);height:var(--cpu-height);text-align:center}button:focus{outline:var(--cpu-focus-outline)}button:focus,button:hover{background:var(--cpu-focus-background,var(--cpu-color))!important;color:var(--cpu-focus-color,var(--cpu-background))!important}svg{fill:currentColor}[src='']{visibility:hidden}#poster{display:block;height:530px;width:530px;margin:10px 35px;object-fit:contain;opacity:0}.poster-loaded #poster{opacity:1}h5{font-weight:700}#control svg,#loading,#pause,#play,.mode-hidden,.no,.panel{display:none}.act-glow #play,.act-loading #loading,.act-pause #play,.act-play #pause{display:block}.act-glow #play{animation:glow 2s infinite}@keyframes glow{0%{opacity:.5}50%{opacity:1}100%{opacity:.5}}.act-loading #loading circle{fill:#777;opacity:1;animation:pulse 2s infinite}#loading circle:nth-child(2){animation-delay:.5s}#loading circle:nth-child(3){animation-delay:1s}@keyframes pulse{50%{opacity:0}}svg{max-width:32px;max-height:32px}#control{display:flex;flex-direction:row;height:32px;width:530px;align-items:center;margin:0 35px}.expand{flex:auto 1 0}#elapse{text-align:right;height:32px}#elapse span{vertical-align:middle}</style><div id="interface"class="no"tabindex="0"><button type="button"id="toggleplay"><img id="poster"class="nosmall"src=""alt=""loading="lazy"decoding="async"><h5 id="title"><span id="canonical"></span></h5><div id="control"><svg id="loading"viewBox="0 0 32 32"><title>${w.loading}</title><circle cx="6"cy="22"r="4"/><circle cx="16"cy="22"r="4"/><circle cx="26"cy="22"r="4"/></svg> <svg id="pause"viewBox="0 0 32 32"><title>${w.pause}</title><path d="M 6,6 12.667,6 12.667,26 6,26 z"/><path d="M 19.333,6 26,6 26,26 19.333,26 z"/></svg> <svg id="play"viewBox="0 0 32 32"><title>${w.play}</title><path d="M 6,6 6,26 26,16 z"/></svg> <span class="expand"></span> <span><span id="currenttime">…</span><span id="totaltime"class="nosmaller"></span></span></div></button></div>`,document.head.appendChild(t)}(),d()?(window.customElements.define(e.toLowerCase(),ve),window.customElements.define(t.toLowerCase(),_e),document.body.classList.add("cpu-audio-with-webcomponents")):(g("WebComponent may NOT behave correctly on this browser. Only timecode hash links are activated.\nSee https://github.com/dascritch/cpu-audio/ for details"),l(a,z),document.body.classList.add("cpu-audio-without-webcomponents")),window.addEventListener("hashchange",V.hashOrder,o),V.hashOrder({at_start:!0})}document.CPU||window.customElements.get(e.toLowerCase())?g("cpu-audio is called twice"):(HTMLDocument.prototype.CPU=be,null!==document.body?Pe():document.addEventListener("DOMContentLoaded",Pe,o))})();
//# sourceMappingURL=cpu-audio.big-square.js.map
// Generated theme : big-square

