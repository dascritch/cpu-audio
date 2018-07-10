WebComponent version of CPU-Audio
=================================

Author :  [Xavier "dascritch" Mouton-Dubosc](http://dascritch.com)

Version : 5

Rewrite of the [ondemiroir-audio-tag](https://github.com/dascritch/ondemiroir-audio-tag) towards WebComponents ( polyfilled with [webcomponentsjs](https://github.com/webcomponents/webcomponentsjs) ), which is an extension of [timecodehash](https://github.com/dascritch/timecodehash). Commits history lost due to a fenzy code rage during a morning ;)

Thank you to my lovely friends
* [Thomas Parisot](https://oncletom.io/) for suggestions
* [Loïc Gerbaud](https://github.com/chibani) for corrections
* [Guillaume Lemoine and Phonitive](http://www.phonitive.fr/) for helping
* [Benoît Salles](https://twitter.com/infestedgrunt) for testing

* Informations (in french) : <http://dascritch.net/post/2014/09/03/Timecodehash-%3A-Lier-vers-un-moment-d-un-sonore>
* Demonstration page : https://dascritch.net/vrac/.projets/audiowc/index.html
* Its source : https://github.com/dascritch/cpu-audio/blob/master/index.html
* Media Fragment standard : https://www.w3.org/TR/media-frags/

Purpose
-------

This is an hashtag extention for `<audio>`, derivated from my [timecodehash.js](https://github.com/dascritch/timecodehash). It could have been done via polyfills or frameworks, but I wanted a plain standard, vanilla, easy to install and configure.

* Hyperlink `<audio>` tags to a specific fragment
* Add an UI
* Recall the player where it was unexpectedly left (click on a link when playing).
* Plays only one sound in the page
* Global `<cpu-controller>` 

How-to
------

Simply put `<link rel="import" href="./cpu-audio.html" type="text/html">` in the head of your html page. (eventually include webcomponentjs for polyfill).

Then encapsulate  `<audio control>` with `<cpu-audio>` to compose an specialy crafted UI. Some attributes enhance the component :

* `data-title="<string>"` : Name of the audio
* `data-poster="<url>"` : Cover image
* `data-canonical="<url>"` : link to the original page of the sound

The script will link automatically to the playlister in the same repertory.

Cloned player : You can invoke a global media controller by creating a `<cpu-controller>` without `<audio>` tag.

Beware, WebComponents is a to-be-implemented standard. Will work mainly on : 

* Google Chrome
* Firefox Nightly (not yet for 61)

To be tested on :

* Safari iOS
* Edge
* Safari Mac

Keyboard functions
------------------

* <kbd>Space</kbd> : play/pause audio
* <kbd>←</kbd> : -5 seconds
* <kbd>→</kbd> : +5 seconds
* <kbd>↖</kbd> : back to start
* <kbd>End</kbd> : to the end, finish playing
* <kbd>Escape</kbd> : back to start, stop playing

Permitted notations
-------------------

Original purpose of [“timecodehash” is to link any media element of any webpage to a specific moment](https://github.com/dascritch/timecodehash). It uses the [W3C standard Media Fragments](https://www.w3.org/TR/media-frags/) notation, extending the URL. 

For the timecode, you can use :

* seconds without unit : `page.html#player&t=7442`
* colon (“professional”) timecode as `02:04:02` (2 hours, 4 minutes and 2 seconds) : `page.html#player&t=02:04:02`
* human-readable units as in `page.html#player&t=2h4m2s` for the previous example. Sub-units availables : `s`econds, `m`inutes, `h`ours and `d`ays

Note : if a timecode without named anchor is given, as in `href="#&t=13h37m"`, the very first `<audio controls>` element of the document will be started and placed at this time.

Bugs
----

- A media error is not correctly triggered and unseen from its  `<cpu-audio>`. Chrome needs to be asked to go inside (click on the timeline), Firefox never gets it.
- To use correctly the webcomponents.js polyfill, as it still lacks `<link rel="import">` support, Firefox (Nightly, 63 as today) needs a CSP policy permitting `data:` scripts.

Planned evolutions
------------------

* report issues from `timecodehash` and `ondemiroir-audio-tag`
* recreate/adding TDD/BDD.  Via a browsable test page ?
* playlists in a page, play net in playlist (parametrable via API)
* show playlist in `<cpu-controller>`
* `<track>` support : show subtitles 
* group functions out of the DOM basic level of the elemnt (subsection, may be `domobject.CPU.fx()`)
* native chapters via `<tracks>`
* multimedia keys support, at the document.body DOM level
* ability to hide `<cpu-audio>` , if a `<cpu-controller>` is declared and `<audio controls>` hidden
* dynamic creation of a `<cpu-audio>`
* dynamic remove of a `<cpu-audio>`
* `<video>` support
* Support for elapsed time / countdown time / total time

Retired functions
-----------------

- offline cross-sites playlist
- i18n
- ability to use another format than `&t=`

Versions
--------

* June 2018 : 5 , forking to cpu-audio, WebComponent version
* August 2017 : 4 , i18n, modularization, clone
* August 2015 : 3 , forking to ondemiroir-audio-tag
* October 2014 : Final version
* September 2014 : 2 , correcting to standard separator
* September 2014 : 1 , public announcing
* July 2014 : 1.a , public release
* June 2014 : 0.2 , proof of concept
* October 2012 : first version, trashed

Licence
-------

Copyright (C) 2014 Xavier "dascritch" Mouton-Dubosc

This software is licenced under the [GNU General Purpose Licence](http://www.gnu.org/licenses/gpl-3.0.txt).
Use it and deploy it as you want : i've done too much closed source before.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

Keeping in touch
----------------

* professional <http://dascritch.com>
* blog <http://dascritch.net>
* twitter : [@dascritch](https://twitter.com/dascritch)
