INTERNALS
=========

The way cpu-audio.js is working internally. If you want to create a themed build, you should read this.

WARNING : this documentation is provided as this. And lot of elemnts may change during a non major release.

And YES, it is not complete yet


DOM elements
============

Classes
-------

Those class names are used by code. You can perfectly create a theme without any mention of them, but you will need to style with them to have UI feedbacks.

Class name 		| Importance  | Usage
----------------|-------------|--------
`no`       		| Needed      | This class is for hiding elements, usable for any elements, even shadow.
`panel` 		| Needed      | A plane with panels will generate `div#panel`
`cue` 			| Needed      | Every point may have a `time#cue` indicating the `start` timecode
`chapters` 		| Important   | Attributed by build_chapters, aspect used for the points under the timeline. Only tracks and panels
`borders`       | Needed 	  | Attributed when a media link indicate a start time and a end time. Only tracks.
`nocuetime`     | Needed 	  | As in playlist panels, we sometimes need to hide the start time in the panel
`active-cue`    | Needed 	  | Indicate focus on a point
`with-preview`  | Needed 	  | Indicate hover on a point
`media-streamed`| Needed      | Indicate a streaming media, so no total duration, no time-line bar, etc…
`act-pause` 	| Needed      | Set by setAct(), indicate media is in pause
`act-glow` 	    | Cosmetic    | Set by setAct() and the `glow` attribute. As `act-pause` but before first interaction
`act-loading`   | Important   | Set by setAct(), indicate media is loading
`act-play` 		| Needed      | Set by setAct(), indicate media is playing
`act-buffer`	| Important   | Set by setAct(), indicate media is buffering (loading will playing)
`show-main` 	| Needed	  | Set by show(), the usual panel with controls and timeline
`show-error` 	| Important	  | Set by show(), indicate the media is in error
`show-share` 	| Important	  | Set by show(), for showing an action panel, as “shares”, or “more infos”
`show-handheld-nav` | Cosmetic | For altenate fine position handheld buttons
`mode-default`  | Cosmetic	  | Set via `mode=""` attribute, or when not mentionned.
`mode-compact`  | Cosmetic	  | Set via `mode=""` attribute
`mode-button`   | Cosmetic	  | Set via `mode=""` attribute. The minimalistic presentation
`mode-hidden`   | Cosmetic	  | Set via `mode=""` attribute. The panel won't be shown in the page
`hide-poster`   | Cosmetic	  | Set via `hide=""` attribute. Should hide `img#poster`
`hide-actions`  | Cosmetic	  | Set via `hide=""` attribute. Should hide `#actions` button and its panel
`hide-timeline` | Cosmetic	  | Set via `hide=""` attribute. Should hide timeline, as in `media-streamed`, except the total duration
`hide-chapters` | Cosmetic	  | Set via `hide=""` attribute. Should hide chapters plane (track and panel)
`hide-panels-title` | Cosmetic	  | Set via `hide=""` attribute. Should hide `h6` panel titles
`hide-panels` 	| Cosmetic	  | Set via `hide=""` attribute. Should hide any panels
`hide-panels-except-play` 	| Cosmetic	  | Set via `hide=""` attribute. Should hide any panels except when media is playing
`hasnativeshare` | Cosmetic	  | Indicate the browser can use system sharing facilities, and so prefers `#nativeshare` instead of `#twitter`, `#facebook`, and `#email`

Those class names are not used by code but are important in our `default` theme, they help for building a responsive interface : `siders`, `nosmall`, `nosmaller`, and `nosmallest`


ID elements
-----------

Those elements can be targeted via `<cpu-audio>.CPU.shadowId()` . You will need to dive into it for building a new theme.
The reported tag names are used in default theme, but nothing forbid you to use another tag name for the same ID.

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
`button#playpause` 	| Important	  | Toggle play/pause  Needed if no `#play` or `#pause`
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

