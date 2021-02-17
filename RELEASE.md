RELEASE NOTES Version 6.6pre
=========================

New features
------------

 * Colour of the chapter lines under the time-line in now configurable (`--cpu-cue`)
 * Live chapter editor has been revised
 * New public API functions, mainly on planes and points editions
 * API get inject specific styles features. Very useful for specific annotations presentations. (Preparatory works for [#76](#76)) 
 * Adding a `convert.IsoDuration` public method, `datetime=""` attribute in `<time>` needing a specific duration format in ISO 8601

Corrections
-----------

 * Reducing repaints on panels point draws
 * Annotations points are sorted by timecode ([#68](#68))

Back-end
--------

 * Using arrow functions, modernizing code
 * Updating [Google Closure to v20200719](https://dl.google.com/closure-compiler/compiler-20200719.tar.gz)
   * Removing `--jscomp_off internetExplorerChecks`
   * Moved to ECMAScript 2019 as output (`Object.fromEntries` [seems enough available](https://caniuse.com/?search=fromEntries))
   * Annotations updated
   * Erroneous `@brief` annotations changed to `@summary`
   * ... but a lot of bugs in Closure, as TextTracks objects aren't declared as iterable, and so on...

Making of
---------

[Those posts are mainly in French, sorry](https://dascritch.net/serie/cpu-audio)

 * [Mettre de l'audio dans le web n'a pas été simple](https://dascritch.net/post/2018/11/06/Mettre-de-l-audio-dans-le-web-n-a-pas-%C3%A9t%C3%A9-simple)
 * [Reconstruire son lecteur audio pour le web](https://dascritch.net/post/2018/11/06/Reconstruire-son-lecteur-audio-pour-le-web)
 * [Retravailler un lecteur web audio dans les petites largeurs](https://dascritch.net/post/2019/06/05/Retravailler-un-lecteur-web-audio-dans-les-petites-largeurs) (on issues [#51](#51) [#58](#58), [#62](#62), [#63](#63))
 * [Le blues du Web Share](https://dascritch.net/post/2019/06/18/Le-blues-du-navigator.share) , [in english](https://dascritch.net/post/2019/06/26/We-need-Web-Share)
 * [Deux couleurs bizarres en CSS](https://dascritch.net/post/2019/11/13/Deux-couleurs-bizarres-en-CSS) (on issues [#29](#29), [#99](#99))
 * Tout-terrain WebVTT pour de l'audio (on issues [#57](#57), [#59](#59))
 * Dichotomie entre podcast et web sur l'audience
