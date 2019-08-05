RELEASE NOTES Version 6.4pre
=========================

New features
------------

 * Time-line can be hidden via `hide="timeline"`
 * Streamed media can be indicated in `<audio>` with `data-streamed` attribute

 
Corrections
-----------

 * Regression in playlist panel in `<cpu-controller>`
 * [Do not show total duration on streaming media](#83)
 * [Do not permit time navigation via keys, timeline or handheld navigation on streaming media](#83)
 * [Do not store time position in browser on streaming media](#83)
 * [Do not recall a position from a stored information in browser on streaming media](#83)
 * [No timecode > 0 in links but still 0 to autoplay on streaming media](#83)
 * [Forbid direct download on streaming media](#83)
 * Reduced `svg:path` precision : we don't have 10000 dpi screens (yet)
 * Some `.nosmall` elements weren't hidden
 * Streamed media won't display their time-line
 * Should accept a declared `lang` in `<html>` even in caps-lock
 * A warning message for too-old browsers got a bad link


Back-end
--------

 * Some precisions in documentation about contributions
 * You can `./make.sh` an experimental ADVANCED_OPTIMIZATION, option `--advanced`
 * `./make.sh` can clean `dist/*` but onw on demand, option `--clean`
 * [Firefox Nightly will fire lot of errors on media](https://bugzilla.mozilla.org/show_bug.cgi?id=1507193), tests aren't reliable as we need
 * [MP3 streamed media are not correctly detected](https://bugzilla.mozilla.org/show_bug.cgi?id=1568527), may probably occurs on others media formats, browsers and OSes


Making of
---------

[Those posts are mainly in French, sorry](https://dascritch.net/serie/cpu-audio)

 * [Mettre de l'audio dans le web n'a pas été simple](https://dascritch.net/post/2018/11/06/Mettre-de-l-audio-dans-le-web-n-a-pas-%C3%A9t%C3%A9-simple)
 * [Reconstruire son lecteur audio pour le web](https://dascritch.net/post/2018/11/06/Reconstruire-son-lecteur-audio-pour-le-web)
 * [Retravailler un lecteur web audio dans les petites largeurs](https://dascritch.net/post/2019/06/05/Retravailler-un-lecteur-web-audio-dans-les-petites-largeurs) (on issues [#51](#51) [#58](#58), [#62](#62), [#63](#63))
 * [Le blues du Web Share](https://dascritch.net/post/2019/06/18/Le-blues-du-navigator.share) , [in english](https://dascritch.net/post/2019/06/26/We-need-Web-Share)
 * Deux couleurs bizarres en CSS (on issue [#29](#29))
 * Tout-terrain WebVTT pour de l'audio (on issues [#57](#57), [#59](#59))
 * Dichotomie entre podcast et web sur l'audience
