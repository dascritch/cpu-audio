WebComponent version of CPU-Audio
=================================

An audio web-component to provide an user-interface, timecoded links and some other features.

Author : [Xavier "dascritch" Mouton-Dubosc](http://dascritch.com)

Version : 5 BETA

Some links :
* Demonstration page : https://dascritch.github.io/cpu-audio/
* Informations (in french) : <https://dascritch.net/post/2014/09/03/Timecodehash-%3A-Lier-vers-un-moment-d-un-sonore>
* The timecodehash.js project, first implementation : <https://github.com/dascritch/timecodehash>
* Previous version of the projet, ondemiroir-audio-tag : <https://github.com/dascritch/ondemiroir-audio-tag>

Copyright © 2014-2018 Xavier "dascritch" Mouton-Dubosc ; Licence GPL 3


Purpose
-------

This is mainly an hashtag observer for `<audio>`, derivated from my [timecodehash.js](https://github.com/dascritch/timecodehash), with fancy hyperlinks and share buttons.

When you load a page :

1. if your URL has an hash with a timecode (`page#tagID&t=4s`), the service will play the named `<audio controls>` at this timecode (here, `#TagID` at 4 seconds) ;
2. else, if a `<audio controls>` with a url `<source>` was played in your website, and was unexpectedly exited, the service will play the `<audio controls>` at the same timecode.

During the page life :

* if an `<audio controls>` anchor is linked with a timecode, the service will play this tag at this timecode ;
* no cacophony : when a `<audio controls>` starts, it will stop any other `<audio controls>` in the page ;
* if you have a `<cpu-controller>`, this one will clone the playing `<cpu-audio>` interface.


Features
----------

* hyperlink `<audio>` tags to a specific time, [Media Fragment standards](https://www.w3.org/TR/media-frags/) ;
* standards first, future-proof ;
* pure vanilla, no dependencies to any framework ;
* progressive enhancement ; 
* add an UI, customizable via attributes and CSS variables ;
* recall the player where it was unexpectedly left (click on a link when playing) ;
* play only one sound in the page ;
* playlist with auto-advance ;
* global `<cpu-controller>` .

It could have been done via polyfills or frameworks, but I wanted a plain standard, vanilla javascript, easy to install and configure.

Beware, WebComponents is a to-be-implemented-elsewhere standard. Will work mainly on : 

* Google Chrome
* Firefox Nightly (63 +)
* Safari Mac

To be tested on :

* Safari iOS
* Edge


Permitted hash notations
------------------------

Original purpose [was to link any media element of any webpage to a specific moment](https://dascritch.net/post/2014/09/03/Timecodehash-%3A-Lier-vers-un-moment-d-un-sonore). It uses the [W3C standard Media Fragments](https://www.w3.org/TR/media-frags/) notation, extending the URL. 

For the timecode, you can use :

* `page.html#tagID&t=7442` : seconds without unit ;
* `page.html#tagID&t=02:04:02` : colon (“professional”) timecode as `02:04:02` (2 hours, 4 minutes and 2 seconds) ;
* `page.html#tagID&t=2h4m2s` : human-readable units, sub-units availables : `s`econds, `m`inutes, `h`ours and `d`ays

Note : if a timecode without any named anchor is given, as in `href="#t=2h4m2s"`, the very first `<audio controls>` element of the document will be started and placed at this time.


Keyboard functions
------------------

* <kbd>Space</kbd> : play/pause audio
* <kbd>Enter</kbd> : play/pause audio (only on play/pause button)
* <kbd>←</kbd> : -5 seconds
* <kbd>→</kbd> : +5 seconds
* <kbd>↖</kbd> : back to start
* <kbd>End</kbd> : to the end, finish playing
* <kbd>Escape</kbd> : back to start, stop playing


Versions
--------

* April 2018 : 5 , [forking to cpu-audio, WebComponent version](https://github.com/dascritch/ondemiroir-audio-tag/issues/7#issuecomment-382043789)
* August 2017 : 4 , i18n, modularization, clone
* August 2015 : 3 , forking to ondemiroir-audio-tag, for launching [CPU radio show](http://cpu.pm)
* October 2014 : Final version of timecodehash
* September 2014 : 2 , correcting to standard separator
* September 2014 : 1 , public announcing
* July 2014 : 1.a , public release
* June 2014 : 0.2 , proof of concept
* October 2012 : first version, trashed


Credits
-------

Thank you to my lovely friends :
* [Thomas Parisot](https://oncletom.io/) for suggestions
* [Loïc Gerbaud](https://github.com/chibani) for corrections
* [Guillaume Lemoine and Phonitive](http://www.phonitive.fr/) for helping
* [Benoît Salles](https://twitter.com/infestedgrunt) for testing

Really sorry, [NerOcrO](https://github.com/NerOcrO)

Keeping in touch
----------------

* professional <http://dascritch.com>
* blog <http://dascritch.net>
* twitter : [@dascritch](https://twitter.com/dascritch)
