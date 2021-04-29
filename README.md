CPU-Audio WebComponent
======================

[An audio WebComponent to provide an user-interface, timecoded links and some other features to an `<audio>` tag.](https://dascritch.github.io/cpu-audio/)

<!-- calling the webcomponent -->
<cpu-audio 
    title="Au carnaval avec Samba Résille (2003)"
    poster="https://dascritch.net/vrac/.blog2/entendu/.1404-SambaResille_m.jpg"
    canonical="https://dascritch.net/post/2014/04/08/Au-Carnaval-avec-Samba-R%C3%A9sille"
    waveform="./tests-assets/waveform-sambaresille.png"
    twitter="@dascritch"
    >
    <audio controls id="sound">
        <source src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3" type="audio/mpeg">
    </audio>
    <!-- {% include no_component_message.html %} -->
</cpu-audio>


Purpose
-------

A generic WebComponent crafted with a hashtag observer for `<audio>` tags with fancy interface, hyperlinks, chaptering, playlist and share buttons.

When you load a page :

1. if your URL has a hash with a timecode (`https://example.com/page#tagID&t=10m`), the service will position the named `<audio controls>` at this timecode (here, `#TagID` at 10 minutes) ;
2. or, if a audio source (qualified by its url) was played in your website, and was unexpectedly exited, the service will reposition its `<audio controls>` at the same timecode.

During the page life :

* if an `<audio controls>` anchor <a href="https://dascritch.github.io/cpu-audio/#sound&t=10m">is linked with a timecode, as `<a href="#sound&t=10m">`</a>, the service will play this tag at this timecode ;
* no cacophony : when a `<audio controls>` starts, it will stop any other `<audio controls>` in the page ;
* if you have a `<cpu-controller>` in your page, it will clone the playing `<cpu-audio>` interface.

<a href="https://dascritch.github.io/cpu-audio/#sound&t=20m45s">This link starts the upper player at 20:45</a>, and a link can limit <a href="https://dascritch.github.io/cpu-audio/#sound&t=5s,7s">playing between a start (0:05) and end (0:08) marks</a>


Features
---------

[TL;DR ? See it in action](https://dascritch.github.io/cpu-audio/FEATURES)

* hyperlink `<audio>` tags to a specific time, using not well-known [Media Fragment standards](https://www.w3.org/TR/media-frags/) ;
* standards first, future-proof ;
* only one single file to deploy ;
* pure vanilla, no dependencies to any framework, so usable in *any* JS framework ;
* progressive enhancement, can works even without proper WebComponent support ;
* add an UI, customizable via attributes and CSS variables ;
* exists in different graphic themes ;
* responsive liquid design ;
* recall the player where it was unexpectedly left (click on a link when playing) ;
* play only one sound in the page ;
* playlist with auto-advance ;
* play only a range between 2 timestamps ;
* chapters, using standards WebVTT ;
* alternate navigation for a finest precision on smartphones ;
* global `<cpu-controller>` .

It could have been done via polyfills or frameworks, but I wanted a plain standard, vanilla javascript, easy to install and configure.


HOW TO install
--------------

A unique and lightweight js file to install, without any dependencies.

* [How to install, deploy and customize on your server](https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md)
* [You can try playing with our live configurator tool](https://dascritch.github.io/cpu-audio/applications/live_config.html)
* [See it running in our demonstration site](https://dascritch.github.io/cpu-audio/)
* See [basic examples](https://dascritch.github.io/cpu-audio/examples.html) and applications with advanced use cases
* [A React .jsx example](https://github.com/dascritch/cpu-audio/blob/master/examples/Call_from_React.jsx)


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
* <kbd>↑</kbd> and <kbd>↓</kbd> : move focus between entries in panels (<kbd>Enter</kbd> to select)

For handheld users, a long press on the timeline will show you another interface for a more precise navigation (Desktop users can try it via a right click on it).


Some links
----------

* [Demonstration site](https://dascritch.github.io/cpu-audio/)
    * [Features](https://dascritch.github.io/cpu-audio/FEATURES)
    * [How to install](https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md)
    * [Live configuration](https://dascritch.github.io/cpu-audio/applications/live_config.html)
* [JS installable code](https://github.com/dascritch/cpu-audio/blob/master/build/cpu-audio.js) 
* [Code repository](https://github.com/dascritch/cpu-audio/), [Latest stable release](https://github.com/dascritch/cpu-audio/releases/latest)
* [Frequently Asked Questions](https://github.com/dascritch/cpu-audio/blob/master/FAQ.md)
* Blog posts about its creation and development : [Série cpu-audio sur dascritch.net](https://dascritch.net/serie/cpu-audio)
* [How to cite a podcast](https://www.buzzsprout.com/blog/cite-podcast), now you can support time positions URL
* Main author : [Xavier "dascritch" Mouton-Dubosc](http://dascritch.com)
* [Licence LGPL 3](https://github.com/dascritch/cpu-audio/blob/master/LICENSE.md)


Participate
-----------

* [Contribute in any way](https://github.com/dascritch/cpu-audio/blob/master/CONTRIBUTING.md)
* [Where we are now](https://github.com/dascritch/cpu-audio/blob/master/RELEASE.md)
* [Tests](tests/tests-minimal.html)
* [Bugs, issues, tickets and features](https://github.com/dascritch/cpu-audio/issues)
* [What to do, next](https://github.com/dascritch/cpu-audio/blob/master/TODO.md)


Credits
-------

Thank you to my lovely friends :
* [Thomas Parisot](https://oncletom.io/) for suggestions
* [Loïc Gerbaud](https://github.com/chibani), [Guillaume Lemoine](https://www.linkedin.com/in/glguillaumelemoine/) and [Guillaume de Jabrun](https://github.com/Wykks) for bug-hunting
* [Benoît Salles](https://twitter.com/infestedgrunt) and [Michel Poulain](https://twitter.com/MichelPoulain) for testing
* [@mariejulien](https://twitter.com/mariejulien/status/1047827583126183937) about [CONTRIBUTING.md](https://github.com/dascritch/cpu-audio/blob/master/CONTRIBUTING.md)
* [Christophe Porteneuve](https://github.com/tdd) of [Delicious Insights](http://delicious-insights.com/) to kick my ass on modern javascript.
* [scombat for a wonderful wrapper of cpu-audio.js in React](https://github.com/scombat/react-cpu-audio)
* [Éric Daspet for its remarks on documentation](https://github.com/edas)
* [Gabi Boyer for helping me avery a lot to debug iOS issues](https://twitter.com/GabiBoyer)

Really sorry, [NerOcrO](https://github.com/NerOcrO)


Keeping in touch
----------------

* professional <http://dascritch.com>
* blog <http://dascritch.net>
* twitter : [@dascritch](https://twitter.com/dascritch)

<!-- {% include footer.html %} -->
