INTERNALS
=========

The way cpu-audio.js is working internally. If you want to create a themed build, you should read this.

WARNING : this documentation is provided as this. And lot of elemnts may change during a non major release.

And YES, it is not complete yet


DOM elements
============

Classes
-------

Class name | Importance                  | Usage
-----------|-----------------------------|--------
`no`       | Needed in code              | This class is for hiding elements, usable for any elements, even shadow.
`chapters` | Attributed by build_chapters| Aspect class used for the points under the timeline. Only tracks and panels

(to do)


ID elements
-----------

Those elements can be targeted via `<cpu-audio>.CPU.shadowId()` . You will need to dive into it for building a new theme

ID           | Importance    | Usage
-------------|---------------|--------------------------------------------
`interface`  | Needed        | englobing `<div>` for the `<main>` and panels. Support for classes. May be later placed in facultative
`pageerror`  | Important     | This section is shown if the media has got an issue
`pagemain`   | Important     | The front control panel of the player
`pageshare`  | Facultative   | This section is shown when `#actions` is clicked
`canonical`  | Facultative	 | `<a>` with a link (if provided) to the canonical page of this media. Kind of `longdesc=""`
`elapse`     | Facultative	 | `<a>` link to the current listened time for this media. May link to the canonical or the actual page.
`currenttime`| Facultative	 | Display the actual playing time of the media
`totaltime`  | Facultative	 | Display the duration time of the media
`poster`     | Facultative	 | `<img>`. Clicking on it will go back from `#pageshare` to `#pagemain`
`control`    | Facultative   | `<button>` with start/stop
`actions`    | Facultative   | `<button>` to display `#pageshare` instead of `#pagemain`
`nativeshare`| Facultative   | `<button>` that trigger the native sharing functions of the browser
`twitter`    | Facultative	 | `<a>` link for editing a new tweet with the current media time position
`facebook`   | Facultative	 | `<a>` link for editing a new post with the current media time position
`email`		 | Facultative	 | `<a>` link for launching the client e-mail with a new e-mail, containing the current media time position
`link` 		 | Facultative	 | `<a>` link to download the media source
`back`		 | Facultative	 | `<button>` for going back from `#pageshare` to `#pagemain`
`pause` 	 | Needed	     | `<button>` for pausing the attached media if playing
`play`   	 | Needed	     | `<button>` for playing the attached media if playing
`restart`	 | Facultative	 | `<button>` for restarting and playing the attached media. Used in handheld-nav
`fastreward` | Facultative	 | `<button>` for fast rewarding into the media. Used in handheld-nav
`reward`     | Facultative	 | `<button>` for rewarding into the media. Used in handheld-nav
`foward`     | Facultative	 | `<button>` for fowarding into the media. Used in handheld-nav
`fastfoward` | Facultative	 | `<button>` for fast fowarding into the media. Used in handheld-nav
`line`		 | Facultative	 | `<div>` supporting the progress bars, `#popup` and the track planes (chapters, pointers, etc).
`popup`      | Facultative   | Element shown when the cursor is over the timeline to indicate the pointed time
`time`		 | Facultative	 | `<div>` to show what position is reading in the media
`loadingline`| Facultative	 | `<div role="progressbar">` to show that media is buffering
`prevcue`    | Facultative   | `<button>` for jumping to next chapter
`nextcue`    | Facultative   | `<button>` for jumping to previous chapter

