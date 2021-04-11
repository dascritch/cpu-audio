API
===

How to dive into `cpu-audio.js` :

 - `cpu-audio.js` can be fine-tuned with HTML attributes and CSS variables,
 - its layout and embedded css can be completed or recreated in `src/themes` via themes-built,
 - javascript-savvy developers can use API features to get more precise controls or extend possibilities, as we do in our <a href="https://dascritch.github.io/cpu-audio/applications/chapters_editor.html">chapters editor</a>,
 - theme builders may later easily ([#132](#132)) include their specific code into their custom build librairy.

This is the reference page for public accessible methods and properties. You can read some test cases in the `examples` sub-directory of this project.

Some informations can be also found in the [INTERNALS.md](INTERNALS.md) page. Some of them are usefull to create a brand new theme, as we are describing elemnt ID and class names usages.

Important : Undocumented feature uses is at your risks, we won't check naming, parameters, actions and outputs continuity. We only test methods and properties continuity on those listed below. And seriously, keep our webcomponent up to date on the stable version.


document.CPU
------------

This object is a global configuration interface.

Properties :

name                     | default value | usage
-------------------------|---------------|----------
keymove                  | `5`           | Number of seconds skipped in the timeline when <kbd>←</kbd> or <kbd>→</kbd> keys are pressed in an interface
alternateDelay           | `500`         | Delay for a long press on time-line (in milliseconds) to switch to the handheld alternate browsing interface
fastFactor               | `4`           | Amplification ratio between <kbd>▸︎▸︎</kbd> and <kbd>▸︎▸︎▸︎</kbd> in handheld alternate browsing interface
repeatDelay              | `400`         | First repetition delay when clicking a button in handheld alternate browsing interface
repeatFactor             | `100`         | Next repetitions delay when clicking a button in handheld alternate browsing interface
playStopOthers   | `true`        | When a cpu-audio starts to play, any other instances in the same page are paused.
currentAudiotagPlaying   | `null`        | Reference to the playing `<audio>` element, `null` if none
globalController         | `null`        | Reference to the `<cpu-controller>` in the page if any, `null` elsewhere
playlists                | `{}`          | Collection of audio tag by playlists (named by the `<cpu-audio playlist="">` attribute). [See playlist feature](https://dascritch.github.io/cpu-audio/FEATURES#playlists).
advanceInPlaylist        | `true`        | When an audio is ended in a playlist, starts immediatly the next one.
autoplay                 | `false`       | Will try to play at the start of the page if a temporal url is given or the audio was previously exited

Some properties are still not documented, for internal usage, as they may evolve.


Methods :

name                             | returns                      	| usage
---------------------------------|----------------------------------|-----------------
isAudiotagPlaying(audiotag)      | boolean                       	| Indicate if this `<audio>` element is playing and correctly cpu-audio started
isAudiotagGlobal(audiotag)       | boolean                       	| Indicate if this `<audio>` element is displayed by `<cpu-controller>` if installed
jumpIdAt(hash, timecode)         | 	                             	| will jump the `<audio id="hash">` to timecode (any convertable format in seconds, colon-coded or human coded)
seekElementAt(audiotag, seconds) |                               	| will jump the `<audio>` to a position in seconds (number only)
findCPU(child)             		 | CpuAudioElement.`CPU` or `null`	| For any `<audio>` tag or its child tag, will returns the element `CPU` API
currentPlaylist()                | array                       		| Returns an array of the current playing playlist
adjacentKey(object, key, offset) | string or `null`					| Returns the adjacent key of a key in an object (offset -1 for previous, +1 for next)

Some methods are still not documented, for internal usage, as they may evolve.


`document.body.CPU.convert` sub-API methods :

name                              | returns | usage
----------------------------------|---------|-----------------
timeInSeconds(string)             | number  | Convert a string empty, with a number, with a colon-coded or an human-coded timecode in seconds
subunittimeInSeconds(string)      | number  | Convert a human-coded (`1h2m3s`) time in seconds 
colontimeInSeconds(string)        | number  | Convert a colon-coded (`01:02:03`) time in seconds 
secondsInTime(number)             | string  | Convert a time in seconds in a human-coded time (`1h2m3s`). Zero is `0s`.
secondsInColonTime(number)        | string  | Convert a time in seconds in a colon-coded time (`1:02:03s`). Zero is `0:00`.
secondsInPaddledColonTime(number) | string  | Same as `secondsInColonTime`, but suited for `<input type="time" />`. Zero is `00:00:00`.
durationIso(number)               | string  | Convert a duration in an ISO 8601 string suitable for `datetime=""` attribute in `<time>`


CpuAudioElement and CpuControllerElement
----------------------------------------

Attributes of their DOM elements may be live changed in the same way for the HTML inclusion, but using `CpuAudioElement.setAttribute(attribute, value)` or `CpuAudioElement.removeAttribute(attribute, value)`. It can be useful for advanced interactions. See *“Attributes references”* in [INSTALL.md](INSTALL.md) of course. 

 - `"mode"` can be set afterwards from `"default"` to `"button"`
 - `"hide"` can be used to mask some elements later, as `"panels timeline"`, if you where only `<cpu-audio hide="timeline">`

Example : `CpuAudioElement.setAttribute("hide", "panels timeline")`


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

name                                                     | returns | usage
---------------------------------------------------------|---------|------
setMode(string)                                 		 |         | Change the presentation mode, [used for `mode=""` attribute](./INSTALL#attributes-references)
setAct(string)			                                 |         | Change the presentation style between `'loading'`, `'glow'`, `'pause'` or `'play'`, reflecting the media tag status
setHide(array)											 |         | Array of strings, may contains `'actions'` or `'chapters'`, [used for `hide=""` attribute](./INSTALL#attributes-references)
showThrobberAt(number)                                   |         | Display the throbber on the timeline at a given time in seconds.
hideThrobber()                                           |         | Hide immediately the throbber
hideThrobberLater()                                      |         | Hide the throbber later (waiting 1 seconds). A newer call will delay the hiding later.
show(string)                                    		 |         | Switch between `'main'`, `'share'` or `'error'` interfaces.
addPlane(planeName, planeData)                    		 | boolean | Create an annotation plane (¹)(²)(³)
removePlane(planeName)                                   | boolean | Remove an annotation plane (¹)(²)
addPoint(planeName, pointName, pointData)                | boolean | Add an annotation point to a plane at a timecode (¹)(²)(⁴)
point(planeName, pointName) 			                 | object  | Return data for a point (³)
editPoint(planeName, pointName, pointData)               |         | Modify data for a point (³). Only existing keys from point() are updated
focusPoint(planeName, pointName)                         | boolean | Give focus on a point on a plane, else on the track
focusedId()												 | string  | Give focused Id (element or parent), or null/undefined
removePoint(planeName, pointName)                        | boolean | Remove an annotation point (¹)(²)
clearPlane(planeName)                                    |         | Remove any points from an annotation plane (¹)(²)
redrawAllPlanes()                                        |         | Redraw any annotation planes and points
highlightPoint(planeName, pointName, className, mirror)  |         | Highlight a perticuliar annotation point, className is `'with-preview'` by default (²)
removeHighlightsPoints(planeName, className, mirror)     |         | Remove highlights on a plane, className is `'with-preview'` by default (²)
injectCss(styleName, css)					             |		   | Inject a `<style>` tag into the shadowDom of the component. (²)
removeCss(styleName)						             |		   | Remove an inject `<style>` from the shadowDom. (²)

(¹) Only available via `CpuAudioElement.CPU`

(²) `planeName`, `pointName`, `className` and `styleName` accepts only alphanum (`/a-zA-Z0-9\_\-/`). Planes starting with a `_` are reserved for system usage, try avoid creating one or messing too much with them.

(³) `planeData` is an object, with detailled keys for planes :

key         | type              | default value | usage
------------|-------------------|---------------|-------
title 		| 					| `''`			| Title displayed on the panel
track       | boolean or string | `true`        | Create a track in the time line, string to precise the kind (`chapters`, `borders`, same naming convention than upper (²)), or presentation restriction (`nosmall`, `nosmaller`, `nosmallest`), space separated
panel       | boolean or string | `true`        | Create a panel under the player, or precise presentation restriction (`nosmall`, `nosmaller`, `nosmallest`, `nocuetime`) space separated
highlight   | boolean           | `true`        | Points of this annotation plane can be highlighted with the mouse
_comp		| boolean			| `false`		| Private use only. Data stored on the component instead of audio element

(⁴) `pointData` is an object, with detailled keys for points :

key         | type                        | default value | usage
------------|-----------------------------|---------------|-------
image       | boolean or string           | `false`       | Url of an image, `false` elsewhere
link        | boolean or string           | `true`        | Click action :  `false` for nothing, `true` to link moment, url string for an external link
text        | string                      |               | Legend
start       | number                      |               | The anotation point begins at this timecode (not used in addPoint)
end         | number                      | `undefined`   | The anotation point ends at this timecode


Events
------

`<CPU-audio>` and `<CPU-controller>` elements fire events about their interface. For disambiguation, events created by our webcomponent are `CPU_` prefixed

event_name          | description                                          | detail, see next table (⁵)
--------------------|------------------------------------------------------|------------------------------------------
CPU_ready	        | The DOM component and its interface are ready        |
CPU_addPoint        | During `addPoint` method, even private ones          | planeName, pointName, pointData
CPU_drawPoint       | A point is drawn or redrawn                          | planeName, pointName, pointData, elementPointTrack, elementPointPanel
CPU_editPoint       | During `editPoint` method                            | planeName, pointName, pointData
CPU_bulkPoints      | During `bulkPoints` method                           | planeName, pointDataGroup
CPU_removePoint     | During `removePoint` method, even private ones       | planeName, pointName
CPU_chapterChanged  | A cue event defined in WebVTT occured                | cue

(⁵) Returned object informations usually have a `detail` object, it may contains :

detail key         | type    | description
-------------------|---------|-------------
planeName          | string  | the name of the plane, as given in the `addPlane` method, `planeName` parameter
pointName          | string  | the name of the point, as given in the `addPoint` method, `pointName` parameter
pointData          | object  | data for the point, as in `point(planeName, pointName)`
pointDataGroup     | object  | Object of points in the plane, as `{ pointName : pointData, pointName : pointData…}`
elementPointTrack  | Element | The created or existing point in the time track
elementPointPanel  | Element | The created or existing point in the panel


As the `event.target` is the `<cpu-audio>` element, you can reach its API with `event.target.CPU`. Here is a way to do it for asynchronous build :
```js
function CPU_ready(event) {
	let CPU = event.target.CPU;
	CPU.addPlane("hello_world", { title : "Now, we can play !" });
}

document.addEventListener('CPU_ready', CPU_ready);
```
Watch out, as `CPU_ready` is triggered for EACH webcomponent started on the page. If you've got 3 players and 1 controller, you will get 4 calls.

More tricks can be seen in the <applications/chapters_editor.html> source code.

Note : events aren't impacted by `.preventDefault()`, yet.


Console messages
----------------

Any technical messages for cpu-audio.js will begin with “*CPU-AUDIO:* ”. All messages are in English, we won't provide translations in console messages.
