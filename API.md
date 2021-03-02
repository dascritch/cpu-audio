API
===

cpu-audio.js can be fine-tuned only with HTML attributes and CSS variables, but javascript-savvy developers can use API features to get more precise controls or extend possibilities, as we do in our <a href="applications/chapters_editor.html">chapters editor</a>.

This is the reference page for public accessible methods and properties. You can read some test cases in the `examples` sub-directory of this project.


document.body.CPU
-----------------

This object is a global configuration interface.

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
autoplay                 | `false`       | Will try to play at the start of the page if a temporal url is given or the audio was previously exited

Some properties are still not documented, for internal usage, as they may evolve.


Methods :

name                             | returns                       | usage
---------------------------------|-------------------------------|-----------------
is_audiotag_playing(audiotag)    | boolean                       | Indicate if this `<audio>` element is playing and correctly cpu-audio started
is_audiotag_global(audiotag)     | boolean                       | Indicate if this `<audio>` element is displayed by `<cpu-controller>` if installed
jumpIdAt(hash, timecode)         | 	                             | will jump the `<audio id="hash">` to timecode (any convertable format in seconds, colon-coded or human coded)
seekElementAt(audiotag, seconds) |                               | will jump the `<audio>` to a position in seconds (number only)
find_interface(child)            | HTMLElement or null           | For any ShadowDOM element, will returns its parent interface container
find_container(child)            | CpuAudioElement.`CPU` or null | For any `<audio>` tag or its child tag, will returns the element `CPU` API
find_current_playlist()          | array                         | Returns an array of the current playing playlist

Some methods are still not documented, for internal usage, as they may evolve.


`document.body.CPU.convert` sub-API methods :

name                              | returns | usage
----------------------------------|---------|-----------------
TimeInSeconds(string)             | number  | Convert a string empty, with a number, with a colon-coded or an human-coded timecode in seconds
SubunitTimeInSeconds(string)      | number  | Convert a human-coded (`1h2m3s`) time in seconds 
ColonTimeInSeconds(string)        | number  | Convert a colon-coded (`01:02:03`) time in seconds 
SecondsInTime(number)             | string  | Convert a time in seconds in a human-coded time (`1h2m3s`). Zero is `0s`.
SecondsInColonTime(number)        | string  | Convert a time in seconds in a colon-coded time (`1:02:03s`). Zero is `0:00`.
SecondsInPaddledColonTime(number) | string  | Same as `SecondsInColonTime`, but suited for `<input type="time" />`. Zero is `00:00:00`.
IsoDuration(number)               | string  | Convert a duration in an ISO 8601 string suitable for `datetime=""` attribute in `<time>`


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
set_act_container(string)                    |         | Change the presentation style between `'loading'`, `'glow'`, `'pause'` or `'play'`, reflecting the media tag status
set_hide_container(array)                    |         | Array of strings, may contains `'actions'` or `'chapters'`, [used for `hide=""` attribute](./INSTALL#attributes-references)
show_throbber_at(number)                     |         | Display the throbber on the timeline at a given time in seconds.
hide_throbber()                              |         | Hide immediately the throbber
hide_throbber_later()                        |         | Hide the throbber later (waiting 1 seconds). A newer call will delay the hiding later. News at 11.
show_interface(string)                       |         | Switch between `'main'`, `'share'` or `'error'` interfaces.
build_chapters()                             |         | Rebuild chapters list and time-line.
build_playlist()                             |         | Rebuild playlist. Should only be used  for `<cpu-controller>`
add_plane(plane, title, data)                | boolean | Create an annotation plane (¹)(²)(³)
remove_plane(plane)                          | boolean | Remove an annotation plane (¹)(²)
add_point(plane, timecode, point, data)      | boolean | Add an annotation point to a plane at a timecode (¹)(²)(⁴)
get_point(plane, point)						 | object  | Return data for a point (³)
edit_point(plane, point, data)				 |         | Modify data for a point (³). Only existing keys from get_point() are updated
remove_point(plane, point)                   | boolean | Remove an annotation point (¹)(²)
clear_plane(plane)                           |         | Remove any points from an annotation plane (¹)(²)
redraw_all_planes()                          |         | Redraw any annotation planes and points
highlight_point(plane, point, class, mirror) |         | Highlight a perticuliar annotation point, class is `with-preview` by default (²)
remove_highlights_points(class, mirror)      |         | Remove any highlights on any points, class is `with-preview` by default (²)
inject_css(style_key, css)					 |		   | Inject a `<style>` tag into the shadowDom of the component. (²)
remove_css(style_key)						 |		   | Remove an inject `<style>` from the shadowDom. (²)

(¹) Only available via `CpuAudioElement.CPU`

(²) `plane`, `point`, `class` and `style_key` accepts only alphanum (`/a-zA-Z0-9\_\-/`). Planes starting with a `_` are reserved for system usage, try avoid creating one or messing too much with them.

(³) `data` is an object, with detailled keys for planes :

key         | type              | default value | usage
------------|-------------------|---------------|-------
track       | boolean or string | `true`        | Create a track in the time line, string to precise the kind (`chapters`, `borders`, same naming convention than upper (²)), or presentation restriction (`nosmall`, `nosmaller`, `nosmallest`), space separated
panel       | boolean or string | `true`        | Create a panel under the player, or precise presentation restriction (`nosmall`, `nosmaller`, `nosmallest`, `nocuetime`) space separated
highlight   | boolean           | `true`        | Points of this annotation plane can be highlighted with the mouse

(⁴) `data` is an object, with detailled keys for points :

key         | type                        | default value | usage
------------|-----------------------------|---------------|-------
image       | boolean or string           | `false`       | Url of an image, `false` elsewhere
link        | boolean or string of function | `true`        | Click action :  `false` for nothing, `true` to link moment, url string for an external link
text        | string                      |               | Legend
start       | number                      |               | The anotation point begins at this timecode (not used in add_point)
end         | number                      | `undefined`   | The anotation point ends at this timecode


Events
------

`<CPU-audio>` and `<CPU-controller>` elements fire events about their interface. For disambiguation, events created by our webcomponent are `CPU_` prefixed

event_name          | description                                          | detail, see next table (⁵)
--------------------|------------------------------------------------------|------------------------------------------
CPU_ready	        | The DOM component and its interface are ready        |
CPU_add_point       | During `add_point` method, even private ones         | plane, point, data_point
CPU_draw_point      | A point is drawn or redrawn                          | plane, point, data_point, element_point_track, element_point_panel
CPU_edit_point      | During `edit_point` method                           | plane, point, data_point
CPU_remove_point    | During `remove_point` method, even private ones      | plane, point
CPU_chapter_changed | A cue event defined in WebVTT occured                | cue

(⁵) Returned object informations usually have a `detail` object, it may contains :

detail key          | type    | description
--------------------|---------|-------------
plane               | string  | the name of the plane, as given in the `add_plane` method, `plane` parameter
point               | string  | the name of the point, as given in the `add_point` method, `point` parameter
data_point          | object  | data for the point, as in `get_point(plane, point)`
element_point_track | Element | The created or existing point in the time track
element_point_panel | Element | The created or existing point in the panel


As the `event.target` is the `<cpu-audio>` element, you can reach its API with `event.target.CPU`. Here is a way to do it for asynchronous build :

```js
function CPU_ready(event) {
	let CPU = event.target.CPU;
	CPU.add_plane("hello_world", "Now, we can play !", {});
}

document.addEventListener('CPU_ready', CPU_ready);
```

More tricks can be seen in the <applications/chapters_editor.html> source code.

Note : events aren't impacted by `.preventDefault()`, yet.


Console messages
----------------

Any technical messages for cpu-audio.js will begin with `CPU-AUDIO: `. All messages are in English, we won't provide translations in console messages.
