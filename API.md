API
===

cpu-audio.js can be used only with HTML attributes and CSS variables, but javascript savvy developers can use API features to get a more precise control.


document.body.CPU
-----------------

This is a global configuration tool.

Properties :

name                        | default value | usage
----------------------------|-----------|----------
keymove                     | `5`       | Number of seconds skipped in the timeline when <kbd>←</kbd> or <kbd>→</kbd> keys are pressed in an interface
only_play_one_audiotag      | `true`    | When a cpu-audio starts to play, any other instances in the same page are paused.
current_audiotag_playing    | `null`    | Reference to the playing `<audio>` element, `null` if none
global_controller           | `null`    | Reference to the `<cpu-controller>` in the page if any, `null` elsewhere
playlists                   | `{}`      | Collection of audio tag by playlists (named by the `<cpu-audio playlist="">` attribute). [See playlist feature](./FEATURES#playlists).
advance_in_playlist         | `true`    | When an audio is ended in a playlist, starts immediatly the next one.

Some preoperties are still not documented, for internal usage, as they may evolve


Methods :

name                                | returns                       | usage
------------------------------------|-------------------------------|-----------------
is_audiotag_playing(audiotag)       | boolean                       | Indicate if this `<audio>` element is playing and correctly cpu-audio started
is_audiotag_global(audiotag)        | boolean                       | Indicate if this `<audio>` element is displayed by `<cpu-controller>` if installed
jumpIdAt(hash, timecode)            | boolean                       | will jump the `<audio id="hash">` to timecode (any convertable format in seconds, colon-coded or human coded)
seekElementAt(audiotag, seconds)    |                               | will jump the `<audio>` to a position in seconds (number only)
find_interface(child)               | HTMLElement or null           | For any ShadowDOM element, will returns its parent interface container
find_container(child)               | CpuAudioElement.`CPU` or null | For any `<audio>` tag or its child tag, will returns the element `CPU` API
find_current_playlist()             | array                         | returns an array of the current playing playlist

Some methods are still not documented, for internal usage, as they may evolve


`document.body.CPU.convert` sub-API methods :

TimeInSeconds(string) | int | convert a string empty, with a number, with a colon-coded or an human-coded timecode in seconds
SubunitTimeInSeconds(string) | int | convert a human-coded (`1h2m3s`) time in seconds 
ColonTimeInSeconds(string) | int | convert a colon-coded (`01:02:03`) time in seconds 
SecondsInTime(int) | string | convert a time in seconds in a human-coded time (`1h2m3s`). Zero is `0s`.
SecondsInColonTime(int) | string | convert a time in seconds in a colon-coded time (`1:02:03s`). Zero is `0:00`.
SecondsInPaddledColonTime(int) | string | same as `SecondsInColonTime`, but suited for `<input type="time" />`. Zero is `00:00:00`.



CpuAudioElement.CPU and CpuControllerElement.CPU
------------------------------------------------

Note that `CpuAudioElement.CPU` and `CpuControllerElement.CPU` have the same CPU object, with same methods and properties


Properties :

name | default value | usage
-----|---------------|------
element | `<cpu-audio>` | The WebComponent hosting DOM element
elements | object | ShadowDOM elements, keyed by their id attributes
audiotag | `<audio>` | Media DOM element


Methods :

name | returns | usage
-----|---------------|------
set_mode_container(string) | | Change the presentation mode, [used for `mode=""` attribute](./INSTALL#attributes-references)
set_act_container(string) | | Change the presentation style between `'loading'`, `'pause'` or `'play'`, reflecting the media tag status
set_hide_container(array) | | Array of strings, may contains `'actions'` or `'chapters'`, [used for `hide=""` attribute](./INSTALL#attributes-references)
show_throbber_at(int) | | Display the throbber on the timeline at a given time in seconds.
hide_throbber() | | Hide immediately the throbber.
hide_throbber_later() | | Hide the throbber later (waiting 1 seconds). A newer call will delay later. News at 11.
show_interface(string) | | Switch between `'main'`, `'share'` or `'error'` interfaces.
build_chapters() | | Rebuild chapters list and time-line.
build_playlist() | | Rebuild playlist. Should only be used  for `<cpu-controller>`


Console messages
----------------

Any technical messages for cpu-audio.js will starts with `CPU-AUDIO: `. All messages will be in English, there is no translation for console messages. Except if you want to help, but those messages may vary a lot alongside versions.
