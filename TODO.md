TO DO list
==========

Bugs
----

* A media error is not correctly triggered and unseen from its  `<cpu-audio>`. Chrome needs to be asked to go inside (click on the timeline), Firefox never gets it.
* Firefox versions 63 and upper seems to still have a focus trap into the WebComponent

Resolved standards issues
-------------------------

* [Middle click on canonical not working on Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1476302)
* [Key browsing focus is trapped inside the webcomponent on Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1476301)

Planned evolutions
------------------

- [ ] Standards first
    - [X] [Support incoming navigator.share API](https://github.com/dascritch/cpu-audio/issues/4)
    - [ ] use standard [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) in `hashOrder`, instead of the custom code. We need a strategy to get the anchor, seen as a key without value
    - [ ] [Support MSE API for non-buffered playing, needed for HTTP/2](https://github.com/dascritch/cpu-audio/issues/12)
- [ ] [playlists in a page](https://github.com/dascritch/cpu-audio/issues/7)
    - [X] expose playlist in document.CPU API
    - [X] playlists in a page, play next audio in playlist parametrable via API
    - [X] show playlist in `<cpu-controller>`
    - [ ] show playlist in current playing `<cpu-audio>`
- [ ] manage [autoplaying sound blocking](https://github.com/dascritch/cpu-audio/issues/17)
    - [ ] for tests
    - [ ] hashlinked
    - [ ] resumed play
- [ ] DOM manipulation events :
    - [X] dynamic creation of a `<cpu-audio>` (not feasable because of `<audio controls>` needed)
    - [X] dynamic remove of a `<cpu-audio>`
    - [X] [remove of a `<cpu-audio>` on a `<audio>` remove](https://github.com/dascritch/ondemiroir-audio-tag/issues/8)
    - [X] [dynamic modification of `<audio>`](https://github.com/dascritch/cpu-audio/issues/13)
    - [ ] dynamic modification of `<head>`
    - [ ] dynamic modification of window.document.location.href (webapp)
- [ ] deploiement on <http://cpu.pm> 
    - [ ] [public announcement](https://www.webcomponents.org/publish)
- [ ] `<video>` support
- [ ] `<track>` support for subtitles 
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
