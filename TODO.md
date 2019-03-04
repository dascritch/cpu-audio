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
    - [ ] use standard [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) in `hashOrder`, instead of the custom code. We need a strategy to get the anchor, seen as a key without value
    - [ ] [Support MSE API for non-buffered playing, needed for HTTP/2 push](https://github.com/dascritch/cpu-audio/issues/12)
- [ ] manage [autoplaying sound blocking](https://github.com/dascritch/cpu-audio/issues/17)
    - [ ] resumed play
- [ ] DOM manipulation events :
    - [ ] dynamic modification of `<head>`
    - [ ] dynamic modification of `document.location.href` (webapp)
- [ ] add-ons packages
    - [X] [dotclear](https://github.com/dascritch/plugin-dotclear-cpu-audio)
    - [ ] wordpress
- [ ] `<video>` support
- [ ] `<track>` support for subtitles 
- [ ] [Put a soundwave form image alongside the timeline, server precalculated](https://github.com/dascritch/cpu-audio/issues/6)
- [ ] Sharing service companion
    - [ ] [Create a real playlist service](https://github.com/dascritch/cpu-audio/issues/8)
    - [ ] [Supporting annotations à la SoundCloud](https://github.com/dascritch/cpu-audio/issues/10)
- [ ] [Prepare design and key bindings for RTL localizations](https://github.com/dascritch/cpu-audio/issues/26)


Retired functions from v4
-------------------------

- offline cross-sites playlist
- ability to use another format than `&t=`

<!-- {% include footer.html %} -->
