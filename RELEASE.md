RELEASE NOTES actual
====================

New features
------------

 * Possibility to create themed versions with specific html and css files ([#56](#56))
 * Possibility to change css breakpoints ([#51](#51)) by this way ([#56](#56))
 * Possibility to create RTL version ([#26](#26)) by this way ([#56](#56))

Corrections
-----------

 * Production files are now more logically created in `build/` instead of `directory/`
 * Reduce repaints
 * Do not change color when changing mode play→loading→play ([#114](#114)) 
 * Resolving a probable issue on fine navigation panel on handheld
 * Play/pause button may have issues if Chrome got numerous webcomponents in the same page
 * An translation error may occurs in shareable URL. We remove audio id if we are not in same URL
 * Issue with intermittent `.replaceAll()` resolved
 * When changing component title, its title="" must follows
 * `Element.CPU.removeHighlightsPoints()` was too generic. Modification in parameters ([#109](#109))
 * `Element.CPU.removePoint()` was terrible
 * `Element.CPU.build_chapters()` and `Element.CPU.build_playlist()` are no more public API
 * Attributes `hide`, `mode` and `glow` weren't properly checked

Back-end
--------

 * [Made a call on contribulle.org](https://contribulle.org/projects/27) 
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
 * QUnit removed from repo, provided via `npm`
 * QUnit-puppeteer integrated into `make.sh`
 * Automated links from MD (or examples.html) to examples and applications
 * Playlist are now using the standard API, with special code for CPU-Controller ([#109](#109))
 * Removing some builders from `Element.CPU`, to avoid expose them in public API

Todo for this release :
-----------------------

 - Finish drag'n'drop in chapters-editors
 - If we unify name style camelCase or snake_case ([#112](#112)), or as we changed some public API, we go for a major version release (7.0)
 - we still have a flashing chapters before the one clicked in panel. There is something to clean up, probable root cause is my (voluntary) 206 defaillant web server
 - Debug issues in Chrome mobile , as replay position or highlighted chapters in double
 - Can't remember, but to check : regression cpu controller => player (color focus, I believe)
 - Click on any chapter in players in examples/controller_playlist_and_chapters.html makes chapter position unfocused in controller
 - Create and example of multiple choices downloads in panel with data-downloadables=""
 - Add a style with handheld fine position panel already on
 - Implement <kbd>↑</kbd> and <kbd>↓</kbd> keys to move on chapters and playlists ([#108](#108))
 - Example of a vocal recorder, with a special template for the record button.

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
