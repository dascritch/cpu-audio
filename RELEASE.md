RELEASE NOTES Version 6.3pre
=========================

New features
------------

Nothing

 
Corrections
-----------

 * [Streamed media gave an confusing duration of `Infinity:NaN:NaN:NaN`](#80)
 * `connect_audiotag()`, renamed `attach_events_audiotag()`, was called to many times
 * handheld alternate navigation was not appearing correctly due to a rename
 * Message about an aging browser is now a warning, as not breaking application

Back-end
--------

 * Code converted back to tabs, [this is a real accessibility issue](https://www.reddit.com/r/javascript/comments/c8drjo/nobody_talks_about_the_real_reason_to_use_tabs/)
 * Tests are now compliant on some [browsers' interaction-first policies](#17)
 * Comments cleaned, annotations reformated
 * Google Closure callable in ADVANCED to cleanse code and better annotations. NOT YET FOR PRODUCTION.


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
