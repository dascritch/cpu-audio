RELEASE NOTES actual, 6.99.4
============================

**INCOMPATIBLES CHANGES** : Nothing incompatible changed is you only used HTML layout or CSS variables. But, there may be some work to adapt previous cpu-audio.js (< 6.7) to cpu-audio version and above 7, **only and only if** you used the javascript API on `document.CPU` or component`.CPU`. We hope Javascript coders will enjoy most of thoses changes, and [discuss about them in our tickets](https://github.com/dascritch/cpu-audio/issues).


New features
------------

 * Persistant `<CPU-Controller>` for single page web-app, with current playing remanence ([#87](#87))
 * Added a [theme with a direct download button](examples/Build_with_download_action.html), instead of the action button. Example for creating graphic theme ([#56](#56))
 * Added a [theme with a simple big square button](examples/Theme_big-square.html). Example for creating leaner graphic theme ([#56](#56))
 * Possibility to create themed versions with specific html and css files ([#56](#56))
 * Possibility to change css breakpoints ([#51](#51)) by this way ([#56](#56))
 * Possibility to create RTL version ([#26](#26)) by this way ([#56](#56))
 * A11y : Support reduced motion preferences
 * Adding support for <kbd>↑</kbd> and <kbd>↓</kbd> keys, moving focus among panels
 * Adding support for `prevcue`/`nextcue` facultative buttons ([#108](#108))
 * Adding support for `prevtrack`/`nexttrack` facultative buttons ([#125](#125))
 * Added method `Element.CPU.bulkPoints()`
 * Some examples added
 * Degradable code, some elements are no more absolutely required in template ([#56](#56))
 * Revised [chapters-editors application](https://dascritch.github.io/cpu-audio/applications/chapters_editor.html), can now accept “uploaded” files [#126](#126)
 * [Wonderful example of React integration](https://github.com/scombat/react-cpu-audio) ([#120](#120))
 * [Attributes for the webcomponent can be live-changed](#128)
 * `<CPU-Controller>` has a specific CSS class ([#87](#87))
 * WebVTT tag translation in chapters editor ([#152](#152))
 * Added a [FAQ page](FAQ.md)

Corrections
-----------

 * Removing annoying interactions from Safari iOS ([#138](#138))
 * Resolving graphic glitches on Safari, SVG aren't correctly calculated on iOS ([#138](#138))
 * Production files are now more logically created in `build/` instead of `directory/`
 * `<CPU-Controller>` cannot be instancied twice
 * Methods and parameters names have been unified camelCase. Changes are incompatible with versions <7.0 ([#112](#112))
 * Title parameter in `Element.CPU.addPlane()` is now in `planePoint`
 * `Element.CPU.removeHighlightsPoints()` was too generic. Modification in parameters ([#109](#109))
 * `Element.CPU.build_chapters()` and `Element.CPU.build_playlist()` are no more public API
 * Some accessibilities issues on keyboard behavior and time line ([#116](#116))
 * Don't hide nymore the mouse cursor over the time-line ([#133](#133))
 * Reduce repaints, graphic glitches
 * An unuseful focusable was removed
 * Restauring alternative fine browsing mode on Safari ([#150](#150))
 * Do not change color when changing mode play→loading→play ([#114](#114)) 
 * Resolving a probable issue on fine navigation panel on handheld
 * Play/pause button may have issues if Chrome got numerous webcomponents in the same page
 * An translation error may occurs in shareable URL. We remove audio id if we are not in same URL
 * Issue with intermittent `.replaceAll()` resolved
 * When changing component title, its title="" must follows
 * Attributes `hide`, `mode` and `glow` weren't properly checked
 * Leave error mode if template is recompleted
 * Update controller playlist panel if current playlist has changed
 * Removing a `<CPU-Audio>` will remove its reference in playlists
 * Heavy simplification of the fine-position panel management
 * Pop-up on time-line may have incorrectly displayed “0:00”
 * Too many problems in documentations in gh-pages, links to config and chaptering applications are now absolute ([#135](#135))
 * Do not show panels when in error state
 * Disambiguation in renaming `findContainer()` in `findCPU()` ([#142](#142))
 * Faster instanciation time, removing `<template>` from host page ([#148](#148))
 * Documentation re-formated ([#134](#134))
 * `HTMLAudioElement.CPU_Update()` and `HTMLAudioElement.CPU_Controller()` going private (vestigial use) ([#143](#143))
 * Build lib still under 50,000 bytes

Back-end
--------

 * [Made a call on contribulle.org](https://contribulle.org/projects/27)
 * gh-pages jekyll theme changed 
 * Using standard ECMA imports ([#110](#110))
 * Using ECMA5+ classes, getters, setters, rests & spreads ([#115](#115))
 * Renamed files ([#110](#110))
 * Better separation between public objects and private methods ([#110](#110))
 * Use `npm` to catch dependencies
 * Leaving Google Closure for webpack : too many bugs, too old
 * Using a more aggressive linter
 * Using `css-minify` for compressing css, instead of home-boiled regex ([#56](#56))
 * Using `html-minifier` for compressing html, for the exact same reasons ([#56](#56))
 * Reduce CSS and HTML compressions operations if no need to freshen ([#56](#56))
 * Re-inverted play/pause button semantic ([#116](#116))
 * QUnit removed from repo, provided via `npm`
 * QUnit-puppeteer integrated into `make.sh`
 * Automated links from MD (or examples.html) to examples and applications
 * Playlist are now using the standard API, with special code for CPU-Controller ([#109](#109))
 * Some builders are removed from `Element.CPU`, to avoid expose them in public API
 * gh-pages re-organized ([#135](#135))
 * A [INTERNALS.md](INTERNALS.md) documentation for theme builders


RELEASE NOTES version 6.6.3
===========================

New features
------------

 * Colour of the chapter lines under the time-line is now configurable (`--cpu-cue`)
 * Colour of the border points in timeline, when you play a end-specified segment (as in `#0,60`), is now configurable (`--cpu-timeline-limits`)
 * Live chapter editor has been deeply revised
 * New [public API functions](./API.md), mainly on planes and points editions
 * Custom events are fired, (documented in [API page](./API.md)). They are `CPU_` prefixed
 * API get inject specific styles features. Very useful for specific annotations presentations. (Preparatory works for [#76](#76)) 
 * Adding some examples how to use API ([#66](#66), [#101](#101))
 * Adding a `convert.durationIso` public method, `datetime=""` attribute in `<time>` needing a specific duration format in ISO 8601
 * User-defined annotation planes can have cue times hidden ([#106](#106))
 * Users can add volume and playrate controls, but we let them program it, [as documented here](examples/API_insert_annotations.html)

Corrections
-----------

 * Check race condition or already called web-commponent
 * Interface may be stucked in loading state. Now, we cannot display "wait" mode if a first play didn't occured first.
 * Annotations points are sorted by timecode ([#68](#68))
 * Reducing repaints on panels point draws
 * Some events are passive, others are better once-called
 * Won't try to autoplay anymore, as this behaviour is really annoying. You can still revert to this mode with `document.CPU.autoplay` parameter ([#103](#103))
 * Returns from `document.CPU.jumpIdAt` and `trigger.hashOrder` aren't used. We can `async` them
 * We try to preload duration metadata when the mouse cursors goes over the timeline on a not know duration and not streamed source ([#88](#88))
 * github-pages trigger strange problems, numerous CPU-audio instances
 * Chrome returned more than one activeCue, strange regression
 * Lot of corrections in chapters panels/tracks due to surprising behaviour of Chrome :
   * multiple TextTracks.activeCues creating race conflicts but only in some specific conditions,
   * chapter tracks not displayed if duration not seen in time, refreshing timeline when duration is certainly known,
   * unuseful refreshes
 * Removed Chapter editor from github pages due to a sync problem. Now available [as a standalone and not yet skinned page](applications/chapters_editor.html) with better explanations


Back-end
--------

 * Tests and examples moved in their own subdirs
 * Using arrow functions, modernizing code
 * Updating [Google Closure to v20200719](https://dl.google.com/closure-compiler/compiler-20200719.tar.gz)
   * Removing `--jscomp_off internetExplorerChecks`
   * Moved to ECMAScript 2019 as output (`Object.fromEntries` [seems enough available](https://caniuse.com/?search=fromEntries))
   * Annotations updated
   * Erroneous `@brief` annotations changed to `@summary`
   * … but a lot of bugs in Closure, as TextTracks objects aren't declared as iterable, a surprising “*Property replaceAll never defined on String*” and so on…
 * We have a [surprising bug in Chrome that avoid to use `audiotag.currentTime=<number>` ONLY if the source is hosted on localhost](https://stackoverflow.com/questions/52620284/make-html5-video-start-at-specified-currenttime-in-chrome), if your local server doesn't support HTTP response 206 (partial content). If you need to local test on Chrome, please user file:/// protocol or a complete web server.
 * An `applications` sub-directory is created by the way
 * Mask error from Google Closure that doesn't `recognize string.replace().replaceAll()`
 * Primitives for package github ([#86](#86)). “to be done”


RELEASE NOTES version 6.5.1
===========================

A lot of bug fixes, ameliorations and complements for streamed media, a11y issues, and some tricks documented. Version 6.5 got a small graphic glitch. This one weights again under 50,000 bytes.

New features
------------

 * [Native lazy-loading](https://web.dev/native-lazy-loading) of the feature picture.
 * You can [explicitly indicate the downloadable resource](INSTALL.md#Indicate-a-prefered-downloadable-audio-resource) in case you've got DASH or HLS source ([#12](#12) and [#96](#96)).
 * Blink to engage to click, optional or to continue an interrupted play ([#93](#93))
 * Color and background on `hover:`/`focus:` may be declared, overruled with `--cpu-focus-color` and `--cpu-focus-background` ([#99](#99))


Corrections
-----------

 * Action icon is a three-dots instead of a share ([#92](#92))
 * Blocked autoplay may do loop on events and stressing reloading audio source ([#93](#93))
 * Use css contain to help browser perfs ([#85](#85))
 * Correct play from position on the timeline when metadata not preloaded ([#88](#88))
 * Stop playing an audiotag when scrobbing another one (mainly for Chrome, ([#89](#89)))
 * Removed vestigial elements : Unuseful “elapsed” progress bar and element.CPU.update_buffered() were re-activated during beta and did graphic glitch.
 * Document ways to generate pictures for `waveform=""` attribute.
 * Do not intercept keys when modified (as in <kbd>Alt</kbd>+<kbd>←</kbd> [#98](#98))
 * Have a proper chapters list : <code>nav > ul > li</code>
 * Some CSS tweaks to help browser perfs ([#85](#85))
 * “wait” animation is now more consistent ([#93](#93))
 * Avoid inconsequent DOM refreshes ([#28](#28))


Back-end
--------

 * [Firefox Nightly will fire lot of errors on media](https://bugzilla.mozilla.org/show_bug.cgi?id=1507193), tests aren't reliable as we need
 * [MP3 streamed media are not correctly detected](https://bugzilla.mozilla.org/show_bug.cgi?id=1568527), may probably occurs on others media formats, browsers and OSes
 * Bug found in Google Closure : [Error on a constant declaration for HTMLAudioElement #3488](https://github.com/google/closure-compiler/issues/3488). Thanks a lot to Myagoo for helping me to find it.
 * No more warnings in Google Closure ADVANCED, but the generated code is still not usable.



RELEASE NOTES version 6.5
=========================

A lot of bug fixes, ameliorations and complements for streamed media, a11y issues, and some tricks documented.

New features
------------

 * [Native lazy-loading](https://web.dev/native-lazy-loading) of the feature picture.
 * You can [explicitly indicate the downloadable resource](INSTALL.md#Indicate-a-prefered-downloadable-audio-resource) in case you've got DASH or HLS source ([#12](#12) and [#96](#96)).
 * Blink to engage to click, optional or to continue an interrupted play ([#93](#93))
 * Color and background on `hover:`/`focus:` may be declared, overruled with `--cpu-focus-color` and `--cpu-focus-background` ([#99](#99))


Corrections
-----------

 * Action icon is a three-dots instead of a share ([#92](#92))
 * Blocked autoplay may do loop on events and stressing reloading audio source ([#93](#93))
 * Use css contain to help browser perfs ([#85](#85))
 * Correct play from position on the timeline when metadata not preloaded ([#88](#88))
 * Stop playing an audiotag when scrobbing another one (mainly for Chrome, ([#89](#89)))
 * Removed vestigial elements : Unuseful “elapsed” progress bar and element.CPU.update_buffered() were re-activated during beta and did graphic glitch.
 * Document ways to generate pictures for `waveform=""` attribute.
 * Do not intercept keys when modified (as in <kbd>Alt</kbd>+<kbd>←</kbd> [#98](#98))
 * Have a proper chapters list : <code>nav > ul > li</code>
 * Some CSS tweaks to help browser perfs ([#85](#85))
 * “wait” animation is now more consistent ([#93](#93))
 * Avoid inconsequent DOM refreshes ([#28](#28))


Back-end
--------

 * [Firefox Nightly will fire lot of errors on media](https://bugzilla.mozilla.org/show_bug.cgi?id=1507193), tests aren't reliable as we need
 * [MP3 streamed media are not correctly detected](https://bugzilla.mozilla.org/show_bug.cgi?id=1568527), may probably occurs on others media formats, browsers and OSes
 * Bug found in Google Closure : [Error on a constant declaration for HTMLAudioElement #3488](https://github.com/google/closure-compiler/issues/3488). Thanks a lot to Myagoo for helping me to find it.
 * No more warnings in Google Closure ADVANCED, but the generated code is still not usable.


RELEASE NOTES version 6.4
=========================

This is mainly a stability release, with some work on streamed media.

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
 * Warning message for too-old browsers got a bad link


Back-end
--------

 * Some precisions in documentation about contributions
 * You can `./make.sh` an experimental ADVANCED_OPTIMIZATION, option `--advanced`
 * `./make.sh` can clean `dist/*` but onw on demand, option `--clean`
 * [Firefox Nightly will fire lot of errors on media](https://bugzilla.mozilla.org/show_bug.cgi?id=1507193), tests aren't reliable as we need
 * [MP3 streamed media are not correctly detected](https://bugzilla.mozilla.org/show_bug.cgi?id=1568527), may probably occurs on others media formats, browsers and OSes


RELEASE NOTES version 6.2
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
=========

[Those posts are mainly in French, sorry](https://dascritch.net/serie/cpu-audio)

 * [Mettre de l'audio dans le web n'a pas été simple](https://dascritch.net/post/2018/11/06/Mettre-de-l-audio-dans-le-web-n-a-pas-%C3%A9t%C3%A9-simple)
 * [Reconstruire son lecteur audio pour le web](https://dascritch.net/post/2018/11/06/Reconstruire-son-lecteur-audio-pour-le-web)
 * [Retravailler un lecteur web audio dans les petites largeurs](https://dascritch.net/post/2019/06/05/Retravailler-un-lecteur-web-audio-dans-les-petites-largeurs) (on issues [#51](#51) [#58](#58), [#62](#62), [#63](#63))
 * [Le blues du Web Share](https://dascritch.net/post/2019/06/18/Le-blues-du-navigator.share) , [in english](https://dascritch.net/post/2019/06/26/We-need-Web-Share)
 * [Deux couleurs bizarres en CSS](https://dascritch.net/post/2019/11/13/Deux-couleurs-bizarres-en-CSS) (on issues [#29](#29), [#99](#99))
 * Tout-terrain WebVTT pour de l'audio (on issues [#57](#57), [#59](#59))
 * Dichotomie entre podcast et web sur l'audience


RELEASE NOTES version 6.1
=========================

Corrections
-----------

 * Strange behaviour with `nth-child` into CSS prevented 3rd `<circle>` to blink correctly
 * Optimized CSS styles
 * Waiting line with a more convenient graphic glitch [#61](#61)
 * Better, but more verbose, svg icon for share, via [Icons8](https://icons8.com/icons/set/share)
 * Removing again poster in chapter editor (parameters are space separated instead of previously comma separated) 



RELEASE NOTES version 6.0
=========================


New features
------------
 
 * Add a [waveform in the time-line](#6).
 * [Annotations API](#57).
 * A handle on the time-line is appearing when hovering with a pointer.
 * On small screens, time-line now goes out of between-buttons space, using the full WC width to [gain precision on small screens](#58).
 * Chapters time-line are displayed on small screens, but won't be clickable.
 * All panels can be hidden via parameters, even future ones.
 * Panels can be displayed only if the media is playing.
 * [Live configurator](LIVE) can test waiting state and error state.
 * [Live configurator](LIVE) have placeholders in attribute fields.
 * [Live chapters editor](CHAPTERS_ED) can preview edited chapers in the shown player.
 * Can avoid to [not force preloading metadata](#70) and indicates an estimation instead.
 * Panels (chapters and playlist) have a hide-able title.
 * [Translating specific VTT markup into HTML tags](#59)
 * Automatic small font size, parametrable


Corrections
-----------

 * Use SPACE instead of COMMA as separators for the `hide=""` attribute (You may do changes in your previous installation)
 * Time-line won't have round ends anymore : Graphically inconsistent and not easy on small widths.
 * Less visible [graphic glitch](#61) on the loading line.
 * Error mode style correction.
 * Chapters now use [annotations API](#57).
 * Texts in chapters panel should use more space.
 * Texts in chapters panel [should not accept embeded links](#59)
 * Boxed playing (with a end timecode) now uses [annotations API](#57).
 * DOM and CSS cleanups.
 * A11y corrections in `<svg>` tags
 * Regression in CSS, mainly on playing mode
 * Graphic corrections on the alternative handheld navigation : buttons are centered, some are skiped on smallest screens.
 * Buttons in alternative handheld navigation now support longpresses for repeat action.
 * Functions renamed for constistancy.
 * Chapters live editor don't use anymore `<input type="time">` as [it is not a duration input, nor correctly working in 12-hours locale](#63) à la Américaine Way
 * Media title is now in bold
 * Time position indication in panels is now smaller than text, to distinguish them when they are closer
 * Download button should trigger download, not a new page

Versions history
================

* March 2021 : 7 , review and rewrite in ES2021
* June 2019 : 6 , plane and points, public API stabilization
* April 2018 : 5 , [forking to cpu-audio, WebComponent version](https://github.com/dascritch/ondemiroir-audio-tag/issues/7#issuecomment-382043789)
* August 2017 : 4 , i18n, modularization, clone
* August 2015 : 3 , forking to ondemiroir-audio-tag, for launching [CPU radio show](http://cpu.pm)
* October 2014 : Final version of timecodehash
* September 2014 : 2 , correcting to standard separator
* September 2014 : 1 , public announcing
* July 2014 : 1.a , public release
* June 2014 : 0.2 , proof of concept
* October 2012 : first version, trashed

[See releases for detailled changes](https://github.com/dascritch/cpu-audio/releases)