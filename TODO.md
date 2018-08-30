TO DO list
==========

Bugs
----

* A media error is not correctly triggered and unseen from its  `<cpu-audio>`. Chrome needs to be asked to go inside (click on the timeline), Firefox never gets it.
* To use correctly the webcomponents.js polyfill, as [it still lacks `<link rel="import">` support](https://hacks.mozilla.org/2015/06/the-state-of-web-components/), Firefox (Nightly, 63 as today) needs a CSP policy permitting `data:` scripts.
* Firefox versions 62 and below cannot start HTML Import version correctly even with the polyfill.
* Firefox versions 63 and upper seems to still have a focus trap into the WebComponent

Resolved standards issues
-------------------------

* [Middle click on canonical not working on Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1476302)
* [Key browsing focus is trapped inside the webcomponent on Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1476301)

Planned evolutions
------------------

- [X] report issues from `timecodehash` and `ondemiroir-audio-tag`
    - [X] link back from `timecodehash` and `ondemiroir-audio-tag`
    - [ ] <del>merge with `ondemiroir-audio-tag` , rename or redirect to `cpu-audio`</del>
    - [X] mark `timecodehash` as no-more maintened
- [ ] Standards first
    - [ ] [Support incoming navigator.share API](https://github.com/dascritch/cpu-audio/issues/4)
    - [ ] use standard [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) in `hashOrder`, instead of the custom code. We need a strategy to get the anchor, seen as a key without value
    - [ ] [Support MSE API for non-buffered playing, needed for HTTP/2](https://github.com/dascritch/cpu-audio/issues/12)
- [ ] [playlists in a page](https://github.com/dascritch/cpu-audio/issues/7)
    - [ ] expose playlist in document.CPU API
    - [ ] playlists in a page, play next audio in playlist parametrable via API
    - [ ] show playlist in `<cpu-controller>`
- [ ] DOM manipulation events :
    - [X] dynamic creation of a `<cpu-audio>` (not feasable because of `<audio controls>` needed)
    - [X] dynamic remove of a `<cpu-audio>`
    - [ ] [remove of a `<cpu-audio>` on a `<audio>` remove](https://github.com/dascritch/ondemiroir-audio-tag/issues/8)
    - [ ] [dynamic modification of `<audio>`](https://github.com/dascritch/cpu-audio/issues/13)
    - [ ] dynamic modification of `<head>`
    - [ ] dynamic modification of window.document.location.href (webapp)
- [ ] [support of end point timecode](https://github.com/dascritch/cpu-audio/issues/11)
- [ ] [parameters to not put share button](https://github.com/dascritch/cpu-audio/issues/15)
- [ ] deploiement on <http://cpu.pm> , when [HTML imports will be properly supported](https://caniuse.com/#feat=imports) or via better polyfill support (still bugs in Firefox 61)
    - [ ] [public announcement](https://www.webcomponents.org/publish)
- [ ] `<video>` support
- [ ] `<track>` support for subtitles 
- [ ] [Restore i18n](https://github.com/dascritch/cpu-audio/issues/16)
- [ ] [Put a soundwave form image alongside the timeline, server precalculated](https://github.com/dascritch/cpu-audio/issues/6)
- [ ] Sharing service companion
    - [ ] [Create a real playlist service](https://github.com/dascritch/cpu-audio/issues/8)
    - [ ] [Supporting annotations à la SoundCloud](https://github.com/dascritch/cpu-audio/issues/10)
- [ ] [Using touchstart event to emulate hover](https://github.com/dascritch/cpu-audio/issues/9)


Retired functions from v4
-------------------------

- offline cross-sites playlist
- i18n
- ability to use another format than `&t=`
