TO DO list
==========

Bugs
----

* A media error is not correctly triggered and unseen from its  `<cpu-audio>`. Chrome needs to be asked to go inside (click on the timeline), Firefox never gets it.
* To use correctly the webcomponents.js polyfill, as [it still lacks `<link rel="import">` support](https://hacks.mozilla.org/2015/06/the-state-of-web-components/), Firefox (Nightly, 63 as today) needs a CSP policy permitting `data:` scripts.
* Firefox versions 62 and below cannot start it correctly even with the polyfill.
* [Key browsing focus is trapped inside the webcomponent on Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1476301)
* <del>[Middle click on canonical not working on Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1476302)</del>

Planned evolutions
------------------

- [X] report issues from `timecodehash` and `ondemiroir-audio-tag`
    - [ ] link back from `timecodehash` and `ondemiroir-audio-tag`
    - [ ] merge with `ondemiroir-audio-tag` , rename or redirect to `cpu-audio`
    - [ ] mark `timecodehash` as no-more maintened
- [ ] explode webcomponent source, and write a build and deploy makefile 
- [X] fallbacks
    - [X] make a test about available functions and browser version (for Firefox <63)
    - [X] make hash observer service usable even if webcomponent is not launched (Graceful degradation / progressive enhancement)
- [ ] Standards first
    - [ ] [Support incoming navigator.share API](https://github.com/dascritch/ondemiroir-audio-tag/issues/55)
    - [ ] use standard [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) in `hashOrder`, instead of the custom code. We need a strategy to get the anchor, seen as a key without value
    - [ ] [Support MSE API for non-burferred playing, needed for HTTP/2](https://github.com/dascritch/ondemiroir-audio-tag/issues/22)
- [X] [recreate/adding TDD/BDD.  Via a browsable test page ?](https://github.com/dascritch/ondemiroir-audio-tag/issues/35)
    - [ ] add tests on restart from previous visit
    - [ ] add behaviour tests on interface
- [ ] [playlists in a page](https://github.com/dascritch/ondemiroir-audio-tag/issues/47)
    - [ ] expose playlist in document.CPU API
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