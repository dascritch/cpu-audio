RELEASE NOTES Version 6.5pre
=========================

New features
------------

 * [Native lazy-loading](https://web.dev/native-lazy-loading) of the feature picture (Chrome only, as today).


Corrections
-----------

 * Use css contain to help browser perfs [#85](#85)
 * Correct play from position on the timeline when metadata not preloaded ([#88](#88))
 * Stop playing an audiotag when scrobbing another one (mainly for Chrome, [#89](#89))
 * Removed vestigial elements : Unuseful “elapsed” progress bar and element.CPU.update_buffered() were re-activated during beta and did graphic glitch.
 * Document ways to generate pictures for `waveform=""` attribute.


Back-end
--------

 * [Firefox Nightly will fire lot of errors on media](https://bugzilla.mozilla.org/show_bug.cgi?id=1507193), tests aren't reliable as we need
 * [MP3 streamed media are not correctly detected](https://bugzilla.mozilla.org/show_bug.cgi?id=1568527), may probably occurs on others media formats, browsers and OSes
 * Bug found in Google Closure : [Error on a constant declaration for HTMLAudioElement #3488](https://github.com/google/closure-compiler/issues/3488). Thanks a lot to Myagoo for helping me to find it.
 * No more warnings in Google Closure ADVANCED, but the generated code is still not usable.


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
