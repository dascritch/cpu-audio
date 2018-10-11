CPU-Audio WebComponent
======================

An audio WebComponent to provide an user-interface, timecoded links and some other features to an `<audio>` tag.

Main author : [Xavier "dascritch" Mouton-Dubosc](http://dascritch.com)

Some links :
* [Demonstration page](https://dascritch.github.io/cpu-audio/)
* [Code repository](https://github.com/dascritch/cpu-audio/)
* Informations (in french) : [Timecodehash : Lier vers un moment d'un sonore](https://dascritch.net/post/2014/09/03/Timecodehash-%3A-Lier-vers-un-moment-d-un-sonore)
* [The timecodehash.js project, first implementation](https://github.com/dascritch/timecodehash)
* [Previous version of the projet, ondemiroir-audio-tag](https://github.com/dascritch/ondemiroir-audio-tag)

Version : 5 BETA. Copyright © 2014-2018 Xavier "dascritch" Mouton-Dubosc. Licence GPL 3


Purpose
-------

An hashtag observer for `<audio>` tags with fancy interface, hyperlinks and share buttons.

When you load a page :

1. if <a href="#sound&t=10m">your URL has an hash with a timecode (`page#tagID&t=10m`)</a>, the service will play the named `<audio controls>` at this timecode (here, `#TagID` at 10 minutes) ;
2. else, if a `<audio controls>` with a url `<source>` was played in your website, and was unexpectedly exited, the service will play the `<audio controls>` at the same timecode.

During the page life :

* if an `<audio controls>` anchor is linked with a timecode, as `<a href="#sound&t=10m">`, the service will play this tag at this timecode ;
* no cacophony : when a `<audio controls>` starts, it will stop any other `<audio controls>` in the page ;
* if you have a `<cpu-controller>` in your page, it will clone the playing `<cpu-audio>` interface.

<a href="#sound&t=20m45s">This link starts the below player at 20:45</a>

<!-- calling the webcomponent -->
<script src="./dist/cpu-audio.js" async></script>
<cpu-audio 
    title="Au carnaval avec Samba Résille (2003)"
    poster="https://dascritch.net/vrac/.blog2/entendu/.1404-SambaResille_m.jpg"
    canonical="https://dascritch.net/post/2014/04/08/Au-Carnaval-avec-Samba-R%C3%A9sille"
    twitter="@dascritch"
    >
    <audio controls id="sound">
        <source src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3" type="audio/mpeg">
    </audio>
    <!-- fallback messages for browsers without webcomponents -->
    <div class="cpu-audio-without-webcomponents">
        <h2>Your browser DOESN'T support WebComponent fairly enough.</h2>
        <p>
            Following examples are <strong>not fully functionnal</strong>, as the interface is not shown and the browser display its native player. This is intentional.<br />
            Only the hash-links functions works.
        </p>
    </div>
</cpu-audio>
<style type="text/css">
    /* fallback style for browsers without webcomponents */
    audio[control] {
        display : block;
        width : 100%;
    }
    .cpu-audio-without-webcomponents {
        border : 4px red solid; padding : 4px;
    }
    /* fully operative */
    .cpu-audio-with-webcomponents .cpu-audio-without-webcomponents {
        display : none;
    }
</style>


Features
----------

* hyperlink `<audio>` tags to a specific time, [Media Fragment standards](https://www.w3.org/TR/media-frags/) ;
* standards first, future-proof ;
* only one single file to deploy ;
* pure vanilla, no dependencies to any framework ;
* progressive enhancement, can works even without proper WebComponent support ;
* add an UI, customizable via attributes and CSS variables ;
* responsive liquid design ;
* recall the player where it was unexpectedly left (click on a link when playing) ;
* play only one sound in the page ;
* playlist with auto-advance ;
* play only a range between 2 timestamps ;
* global `<cpu-controller>` .

It could have been done via polyfills or frameworks, but I wanted a plain standard, vanilla javascript, easy to install and configure.

Beware, WebComponents is a to-be-implemented-elsewhere standard. Will work mainly on : 

* Google Chrome
* Firefox Nightly (63 +)
* Safari Mac

To be tested on :

* Safari iOS

Standard not implemented yet, the hash links will work but without the interface :

* Edge



Permitted hash notations
------------------------

Original purpose [was to link any media element of any webpage to a specific moment](https://dascritch.net/post/2014/09/03/Timecodehash-%3A-Lier-vers-un-moment-d-un-sonore). It uses the [W3C standard Media Fragments](https://www.w3.org/TR/media-frags/) notation, extending the URL. 

For the timecode, you can use :

* `page.html#tagID&t=7442` : seconds without unit ;
* `page.html#tagID&t=02:04:02` : colon (“professional”) timecode as `02:04:02` (2 hours, 4 minutes and 2 seconds) ;
* `page.html#tagID&t=2h4m2s` : human-readable units, sub-units availables : `s`econds, `m`inutes, `h`ours and `d`ays

Note : if a timecode without any named anchor is given, as in `href="#t=2h4m2s"`, the very first `<audio controls>` element of the document will be started and placed at this time.

A playable range can be used : `page.html#tagID&t=5m,5m5s` will <a href="#sound&t=5m,5m5s">play the sound starting at 5 minutes, and stops it at 5 minutes and 5 seconds</a>


Keyboard functions
------------------

When the interface got the focus, you can use those keys :

* <kbd>Space</kbd> : play/pause audio
* <kbd>Enter</kbd> : play/pause audio (only on play/pause button)
* <kbd>←</kbd> : -5 seconds
* <kbd>→</kbd> : +5 seconds
* <kbd>↖</kbd> : back to start
* <kbd>End</kbd> : to the end, finish playing, ev. skip to the sound in playlist
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
