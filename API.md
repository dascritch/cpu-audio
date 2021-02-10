API
===

cpu-audio.js can be used only with HTML attributes and CSS variables, but javascript-savvy developers can use API features to get more precise controls or extend possibilities.


document.body.CPU
-----------------

This is a global configuration tool.

Properties :

name                     | default value | usage
-------------------------|---------------|----------
keymove                  | `5`           | Number of seconds skipped in the timeline when <kbd>←</kbd> or <kbd>→</kbd> keys are pressed in an interface
alternate_delay          | `500`         | Delay for a long press on time-line (in milliseconds) to switch to the handheld alternate browsing interface
fast_factor              | `4`           | Amplification ratio between <kbd>▸︎▸︎</kbd> and <kbd>▸︎▸︎▸︎</kbd> in handheld alternate browsing interface
repeat_delay             | `400`         | First repetition delay when clicking a button in handheld alternate browsing interface
repeat_factor            | `100`         | Next repetitions delay when clicking a button in handheld alternate browsing interface
only_play_one_audiotag   | `true`        | When a cpu-audio starts to play, any other instances in the same page are paused.
current_audiotag_playing | `null`        | Reference to the playing `<audio>` element, `null` if none
global_controller        | `null`        | Reference to the `<cpu-controller>` in the page if any, `null` elsewhere
playlists                | `{}`          | Collection of audio tag by playlists (named by the `<cpu-audio playlist="">` attribute). [See playlist feature](./FEATURES#playlists).
advance_in_playlist      | `true`        | When an audio is ended in a playlist, starts immediatly the next one.

Some preoperties are still not documented, for internal usage, as they may evolve


Methods :

name                             | returns                       | usage
---------------------------------|-------------------------------|-----------------
is_audiotag_playing(audiotag)    | boolean                       | Indicate if this `<audio>` element is playing and correctly cpu-audio started
is_audiotag_global(audiotag)     | boolean                       | Indicate if this `<audio>` element is displayed by `<cpu-controller>` if installed
jumpIdAt(hash, timecode)         | boolean                       | will jump the `<audio id="hash">` to timecode (any convertable format in seconds, colon-coded or human coded)
seekElementAt(audiotag, seconds) |                               | will jump the `<audio>` to a position in seconds (number only)
find_interface(child)            | HTMLElement or null           | For any ShadowDOM element, will returns its parent interface container
find_container(child)            | CpuAudioElement.`CPU` or null | For any `<audio>` tag or its child tag, will returns the element `CPU` API
find_current_playlist()          | array                         | Returns an array of the current playing playlist

Some methods are still not documented, for internal usage, as they may evolve


`document.body.CPU.convert` sub-API methods :

name                           | returns | usage
-------------------------------|---------|-----------------
TimeInSeconds(string)          | int     | Convert a string empty, with a number, with a colon-coded or an human-coded timecode in seconds
SubunitTimeInSeconds(string)   | int     | Convert a human-coded (`1h2m3s`) time in seconds 
ColonTimeInSeconds(string)     | int     | Convert a colon-coded (`01:02:03`) time in seconds 
SecondsInTime(int)             | string  | Convert a time in seconds in a human-coded time (`1h2m3s`). Zero is `0s`.
SecondsInColonTime(int)        | string  | Convert a time in seconds in a colon-coded time (`1:02:03s`). Zero is `0:00`.
SecondsInPaddledColonTime(int) | string  | Same as `SecondsInColonTime`, but suited for `<input type="time" />`. Zero is `00:00:00`.


CpuAudioElement.CPU and CpuControllerElement.CPU
------------------------------------------------

Note that `CpuAudioElement.CPU` and `CpuControllerElement.CPU` share the same CPU object, with same methods and properties, except those noted (¹) below.


Properties :

name        | default value | usage
------------|---------------|------
element     | `<cpu-audio>` | The WebComponent hosting DOM element
elements    | object        | ShadowDOM elements, keyed by their id attributes
audiotag    | `<audio>`     | Media DOM element


Methods :

name                                         | returns | usage
---------------------------------------------|---------|------
set_mode_container(string)                   |         | Change the presentation mode, [used for `mode=""` attribute](./INSTALL#attributes-references)
set_act_container(string)                    |         | Change the presentation style between `'loading'`, `'pause'` or `'play'`, reflecting the media tag status
set_hide_container(array)                    |         | Array of strings, may contains `'actions'` or `'chapters'`, [used for `hide=""` attribute](./INSTALL#attributes-references)
show_throbber_at(int)                        |         | Display the throbber on the timeline at a given time in seconds.
hide_throbber()                              |         | Hide immediately the throbber
hide_throbber_later()                        |         | Hide the throbber later (waiting 1 seconds). A newer call will delay later. News at 11
show_interface(string)                       |         | Switch between `'main'`, `'share'` or `'error'` interfaces.
build_chapters()                             |         | Rebuild chapters list and time-line.
build_playlist()                             |         | Rebuild playlist. Should only be used  for `<cpu-controller>`
add_plane(plane, title, data)                | boolean | Create an annotation plane (¹)(²)(³)
remove_plane(plane)                          | boolean | Remove an annotation plane (¹)(²)
add_point(plane, timecode, point, data)      | boolean | Add an annotation point to a plane at a timecode (¹)(²)(⁴)
remove_point(plane, point)                   | boolean | Remove an annotation point (¹)(²)
clear_plane(plane)                           |         | Remove any points from an annotation plane (¹)(²)
redraw_all_planes()                          |         | Redraw any annotation planes and points
highlight_point(plane, point, class, mirror) |         | Highlight a perticuliar annotation point, class is `with-preview` by default (²)
remove_highlights_points(class, mirror)      |         | Remove any highlights on any points, class is `with-preview` by default (²)


(¹) Only available via `CpuAudioElement.CPU`

(²) `plane`, `point` and `class` accepts only alphanum (`/a-zA-Z0-9\_\-/`). Planes starting with a `_` are reserved for system usage, try avoid creating one or messing too much with them.

(³) `data` is an object, with detailled keys for planes :

key         | type              | default value | usage
------------|-------------------|---------------|-------
track       | boolean or string | `true`        | Create a track in the time line, or precise the kind (`chapters`, `borders`, `ticker` (⁵)), or presentation restriction (`nosmall`, `nosmaller`, `nosmallest`)
ticker      | boolean or string | `false`       | Create a ticker in the band under time-line, or precise the kind (`chapters`, `borders`, `ticker` (⁵)), or presentation restriction (`nosmall`, `nosmaller`, `nosmallest`)
panel       | boolean or string | `true`        | Create a panel under the player, or precise presentation restriction (`nosmall`, `nosmaller`, `nosmallest`)
highlight   | boolean           | `true`        | Points of this annotation plane can be highlighted with the mouse

(⁴) `data` is an object, with detailled keys for points :

key         | type              | default value | usage
------------|-------------------|---------------|-------
image       | boolean or string | `false`       | Add an image
link        | boolean or string | `true`        | Points to this moment, or elsewhere (any URL)
text        | string            |               | Legend
end         | float             |               | The anotation point ends at this timecode

(⁵) `"track":"ticker"` is actually experimental and not finalized. Any CSS specialist, here ?

Console messages
----------------

Any technical messages for cpu-audio.js will begin with `CPU-AUDIO: `. All messages are in English, there is no translation for console messages. Except if you want to help, but those messages may vary a lot between versions.
