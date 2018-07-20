WebComponent version of CPU-Audio
=================================

Author :  [Xavier "dascritch" Mouton-Dubosc](http://dascritch.com)

Version : 5 ALPHA

Rewrite of the [ondemiroir-audio-tag](https://github.com/dascritch/ondemiroir-audio-tag) towards WebComponents, which is an extension of [timecodehash](https://github.com/dascritch/timecodehash).

Some links :
* Informations (in french) : <http://dascritch.net/post/2014/09/03/Timecodehash-%3A-Lier-vers-un-moment-d-un-sonore>
* Demonstration page : https://dascritch.net/vrac/.projets/audiowc/index.html
* `<link rel="import">` polyfilled with [webcomponentsjs](https://github.com/webcomponents/webcomponentsjs)

Copyright © 2014 Xavier "dascritch" Mouton-Dubosc ; Licence GPL 3

Features
----------

* standards first, de-polyfillable, future-proof ;
* hyperlink `<audio>` tags to a specific time, [Media Fragment standards](https://www.w3.org/TR/media-frags/) ;
* add an UI ;
* recall the player where it was unexpectedly left (click on a link when playing) ;
* play only one sound in the page ;
* global `<cpu-controller>` .

It could have been done via polyfills or frameworks, but I wanted a plain standard, vanilla javascript, easy to install and configure.

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

Keyboard functions
------------------

* <kbd>Space</kbd> : play/pause audio
* <kbd>Enter</kbd> : play/pause audio (only on play/pause button)
* <kbd>←</kbd> : -5 seconds
* <kbd>→</kbd> : +5 seconds
* <kbd>↖</kbd> : back to start
* <kbd>End</kbd> : to the end, finish playing
* <kbd>Escape</kbd> : back to start, stop playing

How-to install
--------------

Simply put `<link rel="import" href="./cpu-audio.html" type="text/html">` in the head of your html page. (eventually include webcomponentjs for polyfill).

Then encapsulate `<audio control>` with `<cpu-audio>` to compose an specialy crafted UI. Some attributes enhance the component :

* `title="<string>"` : name of the audio 
* `poster="<url>"` : cover image, squarred ratio prefered
* `canonical="<url>"` : link to the original page of the sound
* `mode="<string>"` : kind of presentation (default, compact, button, hidden)
* `twitter="@<account>"` : twitter handle for social partage (fallback on the declared one in your page)

Example : 

<!--
```
<custom-element-demo>
  <template>
    <link rel="import" href="cpu-audio.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->
```html
<cpu-audio 
    title="Au carnaval avec Samba Résille (2003)"
    poster="https://dascritch.net/vrac/.blog2/entendu/.1404-SambaResille_m.jpg"
    canonical="https://dascritch.net/post/2014/04/08/Au-Carnaval-avec-Samba-R%C3%A9sille"
    twitter="@dascritch"
    >
    <audio controls id="audiodemo">
        <source src="https://dascritch.net/vrac/sonores/1404-SambaResille2003.mp3" type="audio/ogg">
        <source src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3" type="audio/mpeg">
    </audio>
</cpu-audio>
<p>
Jump at <a href="#audiodemo&amp;t=5m">5 minutes</a> in the sound
</p>
```


Cloned player : You can invoke a global media controller by creating a `<cpu-controller>` without `<audio>` tag.

Chapters : You cna add a chapters track into the `<audio>`, : `<track kind="chapters" src="chapters-ex0085.vtt" default>`. Note that `default` is really needed.

Beware, WebComponents is a to-be-implemented-elsewhere standard. Will work mainly on : 

* Google Chrome
* Firefox Nightly (not yet for 61)

To be tested on :

* Safari iOS
* Edge
* Safari Mac

Permitted hash notations
------------------------

Original purpose of [“timecodehash” is to link any media element of any webpage to a specific moment](https://github.com/dascritch/timecodehash). It uses the [W3C standard Media Fragments](https://www.w3.org/TR/media-frags/) notation, extending the URL. 

For the timecode, you can use :

* `page.html#tagID&t=7442` : seconds without unit ;
* `page.html#tagID&t=02:04:02` : colon (“professional”) timecode as `02:04:02` (2 hours, 4 minutes and 2 seconds) ;
* `page.html#tagID&t=2h4m2s` : human-readable units, sub-units availables : `s`econds, `m`inutes, `h`ours and `d`ays

Note : if a timecode without named anchor is given, as in `href="#&t=2h4m2s"`, the very first `<audio controls>` element of the document will be started and placed at this time.

Bugs
----

* A media error is not correctly triggered and unseen from its  `<cpu-audio>`. Chrome needs to be asked to go inside (click on the timeline), Firefox never gets it.
* To use correctly the webcomponents.js polyfill, as [it still lacks `<link rel="import">` support](https://hacks.mozilla.org/2015/06/the-state-of-web-components/), Firefox (Nightly, 63 as today) needs a CSP policy permitting `data:` scripts.
* Firefox versions 62 and below cannot start it correctly even with the polyfill.
* [Middle click on canonical not working on Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1476302)
* [Key browsing focus is trapped inside the webcomponent on Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1476301)

Planned evolutions
------------------

- [X] report issues from `timecodehash` and `ondemiroir-audio-tag`
    - [ ] link back from `timecodehash` and `ondemiroir-audio-tag`
    - [ ] merge with `ondemiroir-audio-tag` , rename or redirect to `cpu-audio`
    - [ ] mark `timecodehash` as no-more maintened
- [ ] explode webcomponent source, and write a build and deploy makefile 
- [ ] fallbacks
    - [X] make a test about available functions and browser version (for Firefox <63)
    - [ ] make hash observer service usable even if webcomponent is not launched (Graceful degradation / progressive enhancement)
    - [ ] if too old or not suitable, make a fallback to old `ondemiroir-audio-tag` (will need a specific js snippet out of webcomponent)
- [ ] Standards first
    - [ ] [Support incoming navigator.share API](https://github.com/dascritch/ondemiroir-audio-tag/issues/55)
    - [ ] use standard [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) in `hashOrder`, instead of the custom code. We need a strategy to get the anchor, seen as a key without value
    - [ ] [Support MSE API for non-burferred playing, needed for HTTP/2](https://github.com/dascritch/ondemiroir-audio-tag/issues/22)
- [ ] [recreate/adding TDD/BDD.  Via a browsable test page ?](https://github.com/dascritch/ondemiroir-audio-tag/issues/35)
- [ ] [playlists in a page, play next audio in playlist parametrable via API](https://github.com/dascritch/ondemiroir-audio-tag/issues/47)
- [ ] show playlist in `<cpu-controller>`
- [X] `<track>` support :
    - [X] [chapters](https://github.com/dascritch/timecodehash/issues/1)
    - [X] [named chapters](https://github.com/dascritch/ondemiroir-audio-tag/issues/9)
- [ ] DOM manipulation events :
    - [ ] dynamic creation of a `<cpu-audio>` (not feasable because of `<audio controls>` needed)
    - [ ] dynamic remove of a `<cpu-audio>`
    - [ ] [remove of a `<cpu-audio>` on a `<audio>` remove](https://github.com/dascritch/ondemiroir-audio-tag/issues/8)
    - [ ] dynamic modification of `<head>`
    - [ ] dynamic modification of window.document.location.href (webapp)
- [ ] [support of end point timecode](https://github.com/dascritch/ondemiroir-audio-tag/issues/25)
- [ ] [parameters to not put share button](https://github.com/dascritch/ondemiroir-audio-tag/issues/26)
- [ ] deploiement on <http://cpu.pm> , when [HTML imports will be properly supported](https://caniuse.com/#feat=imports) or via better polyfill support (still bugs in Firefox 61)
    - [ ] [public announcement](https://www.webcomponents.org/publish)
- [ ] `<video>` support
- [ ] `<track>` support for subtitles 
- [ ] Restore i18n [timecodehash#12](https://github.com/dascritch/timecodehash/issues/12)
- [ ] [Put a soundwave form image alongside the timeline, server precalculated](https://github.com/dascritch/ondemiroir-audio-tag/issues/52)
- [ ] Sharing service companion
    - [ ] [Create a real playlist service](https://github.com/dascritch/ondemiroir-audio-tag/issues/42)
    - [ ] [Supporting annotations à la SoundCloud](https://github.com/dascritch/ondemiroir-audio-tag/issues/29)
- [ ] [Using touchstart event to emulate hover](https://github.com/dascritch/ondemiroir-audio-tag/issues/37)


Retired functions from v4
-------------------------

- offline cross-sites playlist
- i18n
- ability to use another format than `&t=`

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

Keeping in touch
----------------

* professional <http://dascritch.com>
* blog <http://dascritch.net>
* twitter : [@dascritch](https://twitter.com/dascritch)
