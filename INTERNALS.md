INTERNALS
=========

The way cpu-audio.js is working internally. If you want to create a themed build, you should read this.

WARNING : this documentation is provided as this. And lot of elemnts may change during a non major release.

And YES, it is not complete yet


DOM elements
============

Classes
-------

Class name | Importance  | Usage
-----------|-------------|--------
`no`       | Needed      | This class is for hiding elements, usable for any elements, even shadow.
`chapters` | Important   | Attributed by build_chapters, aspect used for the points under the timeline. Only tracks and panels

(to do)


ID elements
-----------

Those elements can be targeted via `<cpu-audio>.CPU.shadowId()` . You will need to dive into it for building a new theme

Selector            | Importance  | Usage
--------------------|-------------|--------------------------------------------
`#interface`  		| Needed      | englobing `<div>` for the `<main>` and panels. Support for classes. `opacity:0` at start
`#pageerror`  		| Important   | This section is shown if the media has got an issue
`#pagemain`   		| Important   | The front control panel of the player
`#pageshare`  		| Facultative | This section is shown when `#actions` is clicked
`a#canonical` 		| Facultative | Link (if provided) to the canonical page of this media. Kind of `longdesc=""`
`æ#elapse`    		| Facultative | Link to the current listened time for this media. May link to the canonical or the actual page.
`#currenttime`		| Facultative | Display the actual playing time of the media
`#totaltime`  		| Facultative | Display the duration time of the media
`img#poster`  		| Facultative | how the provider cover. Clicking on it will go back from `#pageshare` to `#pagemain`
`button#control`    | Facultative | Start/stop playing, should have `#play` and `#pause` , or `#playpause`
`button#actions`    | Facultative | Click to display `#pageshare` instead of `#pagemain`
`button#nativeshare`| Facultative | Triggers the native sharing functions of the browser
`a#twitter`    		| Facultative | Link for editing a new tweet with the current media time position
`a#facebook`   		| Facultative | Link for editing a new post with the current media time position
`a#email`		 	| Facultative | Link for launching the client e-mail with a new e-mail, containing the current media time position
`#link` 		 	| Facultative | Link to download the media source
`button#back`		| Facultative | Going back from `#pageshare` to `#pagemain`
`button#pause` 	 	| Important   | Pausing the attached media if playing. Needed if no `#playpause`
`button#play`   	| Important	  | Playing the attached media if playing. Needed if no `#playpause`
`button#play`   	| Important	  | Toggle play/pause  Needed if no `#playpause`
`button#restart`	| Facultative | Restart and playing the attached media. Used in handheld-nav
`button#fastreward` | Facultative | Fast rewarding into the media. Used in handheld-nav
`button#reward`     | Facultative | Rewarding into the media. Used in handheld-nav
`button#foward`     | Facultative | Fowarding into the media. Used in handheld-nav
`button#fastfoward` | Facultative | Fast fowarding into the media. Used in handheld-nav
`#line`				| Facultative | Element supporting the progress bars, `#popup` and the track planes (chapters, pointers, etc).
`#popup`      		| Facultative | Element shown when the cursor is over the timeline to indicate the pointed time
`#time`		 		| Facultative | Show what position is reading in the media
`#loadingline`		| Facultative | Show that media is buffering. Recommended to have `role="progressbar"`
`button#prevcue`    | Facultative | Jumping to next chapter in media if chaptered
`button#nextcue`    | Facultative | Jumping to previous chapter in media if chaptered

