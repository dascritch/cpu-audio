How-to install
==============

Copy [`build/cpu-audio.js`](https://github.com/dascritch/cpu-audio/blob/master/build/cpu-audio.js) file on your website.

Call it in the `<head>` of your html page :

```html
<script src="cpu-audio.js" async></script>
```

Do not forget to add a `lang=""` attribute in the hosting `<html>` tag. Elsewhere, the component will try to guess user's language via the browser preferences, which may cause funny rendering (in English because so was configurated the client system, as your website is in French). Actual version only have english and french locales, [may be can you help us ?](CONTRIBUTING.md)


Invoking element in pure HTML
-----------------------------

Encapsulate your usual `<audio control>` with `<cpu-audio>`. 

The bare minimal code for invoking : 

```html
<cpu-audio>
    <audio controls src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3"></audio>
</cpu-audio>
```

A more elaborated example :

```html
<cpu-audio 
    title="Au carnaval avec Samba Résille (2003)"
    poster="https://dascritch.net/vrac/.blog2/entendu/.1404-SambaResille_m.jpg"
    canonical="https://dascritch.net/post/2014/04/08/Au-Carnaval-avec-Samba-R%C3%A9sille"
    >
    <audio controls id="audiodemo">
        <source src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3" type="audio/mpeg" />
    </audio>
</cpu-audio>
```

**Important Notes** : 

* Put one and only one `<audio>` tag into `<cpu-audio>`, or you may have unexpected issues.
* **We recommend to set an `id` attribute** to the `<audio>` tag for the anchoring feature, elsewhere cpu-audio.js will autoset an `id`, that may cause later some problems for deep-linking sound into your page or your web-app. Please set an ID to the `<audio>` tag by yourself.
* You **must** put a `controls` attribute to the included `<audio>` tag ; this is a good practice for having a functional fallback in case of malfunction ; we wish you to comply. Please also add this rule in your css, even if our included css will put it :

```css
audio[controls] {
    display : block;
    width : 100%;
}
```

You can play with our [live configurator tool](https://dascritch.github.io/cpu-audio/applications/live_config.html), to build a HTML and CSS canvas ready to be copy-pasted in your website code.


Invoking element in a javascript framework
------------------------------------------

Most frameworks as React can now co-op friendly with WebComponents. cpu-audio can be [easily called as in this example](examples/Call_from_React.jsx) :

```jsx
export const CpuAudio = () => {
    useEffect(() => import("…/cpu-audio.js"), []);
    return (
        <cpu-audio>
            <audio controls src='…/sound.mp3'></audio>
        </cpu-audio>
    )
};
```


How to link
-----------

In the upper example, `<audio>` tag is ID-entified as `audiodemo`. Usually, you link to its anchor with `#audiodemo`. Add a parameter `t=` with the expected timecode, with a `&` as separator. By example, for 5 minutes from the start, you should target `#audiodemo&t=5m` : 

```html
<p>
    Jump at <a href="#audiodemo&amp;t=5m">5 minutes</a> in the sound
</p>
```

Original purpose of the ancestor of this WebComponent [was to link any media element of any webpage to a specific moment](https://dascritch.net/post/2014/09/03/Timecodehash-%3A-Lier-vers-un-moment-d-un-sonore). It uses the [W3C standard Media Fragments](https://www.w3.org/TR/media-frags/) notation, extending the URL. 

We accept different notations for the time segment of the hash :

* `page.html#tagID&t=7442` : seconds without unit ;
* `page.html#tagID&t=02:04:02` : colon (“professional”) timecode as `02:04:02` (2 hours, 4 minutes and 2 seconds) ;
* `page.html#tagID&t=2h4m2s` : human-readable units, sub-units availables : `s`econds, `m`inutes, `h`ours and `d`ays

A playable range can be indicated, with a coma separator between the start and the end position : `page.html#tagID&t=5m,5m5s` will <a href="#sound&t=5m,5m5s">play the sound starting at 5 minutes, and stops it at 5 minutes and 5 seconds</a>

**Note** : if a timecode without any named anchor is given, as in `href="#t=2h4m2s"`, the very first `<audio controls>` element of the document will be addressed. If you are absolutely sure you will only have one audio tag in your page and it will never vary, you can omit the ID : `<a href="#t=5m">`. But **we strongly recommend to precise an `id` attribute to each `<audio>`, and use an explicit id to a time position.**


Attributes references
---------------------

Some attributes enhance the component :

* `title="<string>"` : title of the sound ;
* `poster="<url>"` : cover image, squared ratio recommended, only in `default` and `compact` modes ;
* `canonical="<url>"` : link to the original page of the sound ; 
* `download="<url>"` : link to a downloadable resource for the sound ; 
* `mode="<string>"` : kind of presentation :
    * `default` : player with poster, timeline and chapters list,
    * `compact` : poster, play/pause button and time indication,
    * `button` : play/pause button only,
    * `button,default`, `button,compact` or `compact,default` : once playing, will unfold from a standby mode (`button` or `compact`) to a wider one,
    * `hidden` : no interface ;
* `hide="<string>"` : hide some features, space-separated :
    * `poster` : the poster image,
    * `actions` : the share button,
    * `chapters` : the chapters list (think to do not include a `<track kind="chapters">` file ^^;),
    * `timeline` : the time-line element, including chapter marks,
    * `panels` : any panels as chapters or playlist,
    * `panels-title` : titles of the panels,
    * `panels-except-play` : any panels, except when the module is playing a media (do not use with `panels`) ;
* `waveform="<url>"` : waveform image, will be displayed in the timeline, only in `default` mode (may be generated with [sox spectrogram](http://sox.sourceforge.net/sox.html) or [audiowaveform](https://github.com/bbc/audiowaveform)) ;
* `playlist="<string>"` : add this media in a named playlist, play the next one when ended ;
* `duration="<seconds|coloncoded|humanreadable>"` : force displayed duration instead to load it from the media resource before playing (add a `preload="none"` attribute to the `<audio>` tag). Metadata will be loaded in case of hover on the timeline if a duration nor steamed-media indication are given ;
* `twitter="@<account>"` : twitter handle for social sharing (fallback on the declared one in your page) ;
* `glow` : will make the play button glowing before the first play, even if autoplay is not prevented.


Cloned player
-------------

You can invoke a global media controller by creating a `<cpu-controller>` without `<audio>` tag. 

It may be useful if, as [in the CPU website](http://cpu.pm), you have a player in the main content and a cloned one in a fixed element, in the header/menu of your website, by example.

Note that a `<cpu-controller>` invoked without any valid `<cpu-audio>` player will just display a plain placeholder, until a valid `<cpu-audio>` is created in the page.


Chapters
--------

One poorly used native HTML feature is chapters track. A `<track>` tag is mostly used as native closed-caption feature in `<video>` tag, but you may also create a `<track>` for chaptering in an `<audio>` tag. Everything is natively managed by any major browser, except display it. So we are doing it with cpu-audio.js.

Here is the code you can put into the `<audio controls>` tag : 

```html
<track kind="chapters" src="chapters.vtt" default />
```

Note that `default` attribute **is really needed**. In case you've got more than one `<track kind="chapters" default />` declared in a `<audio>` tag, only the very first one will be interpreted by the browser (blocking us to catch the one according to its `srclang=""` [see #69](#69) ).

You can create VTT files with [our online editor](https://dascritch.github.io/cpu-audio/applications/chapters_editor.html).

**Note** : The chapters info will only appears with `mode="default"` aspect settings in `<cpu-audio>`. You can hide them with the `hide=""` attribute, set to `panels` or `chapters`.


Indicate a prefered downloadable audio resource
-----------------------------------------------

The player will check which audio source is used, to link it as downloadable. By example, if you set a source in `.mp3` format and another one in `.ogg` format, the browsers will get the `.ogg` files as source, except Safari who can only play the `.mp3` one. So the “*download*” link in the player will be `.ogg` except for Safari, getting the `.mp3` instead.

In case you offer multiple `<source>` to your `<audio>` tag (by example, you can offer DASH or HLS “streamed” sources alternatives, but your `index.mpd` or `index.m3u8` won't be useful to download for your visitors), but there is still a downloadable one-file source, you can indicate to the component which link can be downloaded for listening in any app. 

We have two methods : `download` attribute on `<cpu-audio>`, or add a `data-downloadable` attribute on the relevant `<source>`.

Please note that you **SHOULD NOT** put a `data-streamed` attribute in this case : It would be unuseful, as it blocks access to the download link.

Here is an example with the `<cpu-audio download="<url>">` method :

```html
<cpu-audio title="CPU Ex0155 Cyberpunk" canonical="https://cpu.pm/0155" download=".../podcast/0155-CPU%2817-12-20%29.mp3">
    <audio controls>
        <!-- 
            Here is our “streamed” HLS source, linking to a playlist of files. Not suitable for user downloading.
            We put it in first position, as the HLS source is really the better option for smartphones,
            instead of heavier complete files. -->
        <source src=".../hls/0155-CPU%2817-12-20%29/index.m3u8" type="application/x-mpegurl" />
        <!-- Here are our conventional, one-file sources.
            Ogg is in second, for most modern browsers as Chrome and Firefox. Overkill for most users due to my high-quality settings.
            MP3 is the last resort source, for older browsers as UC Browser, Safari and Nintendo DS. We chose it because this format is universal -->
        <source src=".../0155-CPU%2817-12-20%29.ogg" type="audio/ogg" />
        <source src=".../podcast/0155-CPU%2817-12-20%29.mp3" type="audio/mp3" />
    </audio>
</cpu-audio>
```

Here is the `<source data-downloadable>` method. It is recommended for dynamic source changes, and will take priority on `<cpu-audio download="<url>">`. Only the first indicated `<source>` will be used :

```html
<cpu-audio title="CPU Ex0155 Cyberpunk" canonical="https://cpu.pm/0155">
    <audio controls>
        <!-- The HLS source and the too high quality ogg -->
        <source src=".../hls/0155-CPU%2817-12-20%29/index.m3u8" type="application/x-mpegurl" />
        <source src=".../0155-CPU%2817-12-20%29.ogg" type="audio/ogg" />
        <!--  And the mp3, that we declare downloadable  -->
        <source data-downloadable src=".../podcast/0155-CPU%2817-12-20%29.mp3" type="audio/mp3" />
    </audio>
</cpu-audio>
```

Note that we have [a code snippet extending this attribute for displaying multiple choices to the visitor](examples/API_insert_downloadables_panel.html)


Special case for live streamed media
------------------------------------

When you put a live streamed media as an audio source, some functions in the player will be disabled :

 - Any time-related position service won't work on this instance :
     - total time indication (obviously),
     - timecoded links,
     - stored positions and replay,
     - time-line,
     - fine handheld navigation panel,
     - chapter time-lines,
     - chapter panels.
 - Direct download link is hidden.
 - Some `<cpu-audio>` attributes will be unuseful : `waveform=""` and `duration=""`.

Some recommendations :
 - Avoid using the default mode, use `compact` instead, or hide the share panel with `hide="actions"` attribute.
 - Add a `preload="none"` attribute to your `<audio>` tag, to avoid unuseful buffering.
 - Add a `data-streamed` attribute to your `<audio>` tag, some browsers on some codecs [cannot detect correctly](https://bugzilla.mozilla.org/show_bug.cgi?id=1568527) if a media is streamed and the player may interact not nicely with it.

Here is a nice example, with a pure streamed source :

```html
<cpu-audio title="Radio &lt;FMR&gt;, live from Toulouse France on 89.1 FM" mode="compact" poster="http://radio-fmr.net/param/pix/shared/logofmr.png">
    <audio controls preload="none" data-streamed src="http://stream.radio-fmr.net:8000/radio-fmr.mp3">
    </audio>
</cpu-audio>
```


Personnalization via CSS variables
----------------------------------

You can change some presentation features of the interface [with CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables). Check their effects [with the live editor](https://dascritch.github.io/cpu-audio/applications/live_config.html)

Variable name               | Description                                                 | Default value 
----------------------------|-------------------------------------------------------------|---------------------------------------------------------------------------------
`--cpu-background`          | Background, except playing or in error                      | `#555`
`--cpu-color`               | Color, except playing                                       | `#ddd`
`--cpu-color-transitions`   | Colors (text and background) transitions duration           | `0s`
`--cpu-elapse-width`        | Time indicator width                                        | `185px` (`160px` under 640px width, `80px` under 480px, `0` under 320px)
`--cpu-error-background`    | Background when there is a media error                      | `#a00`
`--cpu-error-color`         | Color when there is a media error                           | `#ff7`
`--cpu-font-family`         | Font families                                               | `Lato, "Open Sans", "Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif`
`--cpu-font-size`           | Font size                                                   | `15px`
`--cpu-font-small-size`     | Small font size                                             | `calc(var(--cpu-font-size) * 0.8)`
`--cpu-line-height`         | Line height for the font                                    | `1.2`
`--cpu-height`              | Height and width of the square buttons                      | `64px` (`48px` under 640px width)
`--cpu-inner-shadow`        | Shadow between horizontal panels                            | `inset 0px 5px 10px -5px black`
`--cpu-playing-background`  | Background while playing                                    | `#444`
`--cpu-playing-color`       | Color while playing                                         | `#fff`
`--cpu-focus-background`    | Background when an active element is hover/focused          | Current color definition
`--cpu-focus-color`         | Color when an active element is hover/focused               | Current background definition
`--cpu-popup-background`    | Background for the time pointer                             | `#aaa`
`--cpu-popup-color`         | Text color for the time pointer                             | `#333`
`--cpu-cue`                 | Color for the chapter lines under the time-line             | `#000`
`--cpu-timeline-limits`     | Color of the bordered playing, if a ending point is defined | `#f00`

If the user prefers a reduced motion interface, the player will remove any motion and transitions. This is an accssibility feature.

Some color/background values are not recommended, as `currentColor` and `transparent` ([explained here in French](https://dascritch.net/post/2019/11/13/Deux-couleurs-bizarres-en-CSS)), except if you also define `--cpu-focus-background` and `--cpu-focus-color` to address accessibility issues.

In case you need to create some specific breakpoints, the best way is to create a theme and make your own version. See [API.md](https://github.com/dascritch/cpu-audio/blob/master/API.md) and [CONTRIBUTING.md](https://github.com/dascritch/cpu-audio/blob/master/CONTRIBUTING.md).


Using classes on host page
--------------------------

The intention onto cpu-audio.js is to be configurable and usable without any javascript knwonledge. HTML attributes, CSS variables, and CSS selectors must be able to help integrators to hide some elements of their page without having to painly dig into javascript snippets.

You can use some CSS features in the host page, as some classes are added to your host page `<body>` to reflect what is happening with the player :

### `.cpu-audio-without-webcomponents` and `.cpu-audio-with-webcomponents`

`.cpu-audio-without-webcomponents` is set when cpu-audio.js is launched but the interface cannot be displayed, due to incomplete WebComponent suppport by the browser. Only the hash links are interpreted.

`.cpu-audio-with-webcomponents` means that cpu-audio.js was able to build its graphic interface.

Here is an example :

```css
    /* fallback style for browsers without webcomponents */
    audio[controls] {
        display : block;
        width : 100%;
    }
    .cpu-audio-without-webcomponents #no-player-interface {
        display : block;
    }
    /* fully operative */
    .cpu-audio-with-webcomponents #no-player-interface {
        display : none;
    }
```

```html
<div id="no-player-interface">
    Nothing wrong, but your browser seems a little old.
</div>
```

### `.cpu_tag_«audiotag_id»_chaptered`

The `<audio id="audiotag_id">` has its `<track kind="chapters">` decoded and displayed. 

**Note** : This class will be set even if the chapters list is set to be hidden.

### `.cpu_playing_tag_«audiotag_id»_cue_«cue_id»`

The `<audio id="audiotag_id">` is actually playing the `cue_id` chapter. The `cue_id` is the cue (chapter) name described in the .VTT file in its `<track kind="chapters">` . 

This function was meant to build effects as in [BBC Computer Literacy archive](https://computer-literacy-project.pilots.bbcconnectedstudio.co.uk/) : During a play of a show, each chapter was highlighting its text resumee.


Setting global application parameters via a tag
-----------------------------------------------

Some global parameters for CPU-Audio may be set via a tag, avoiding to write javascript code for the same result. Those prameters must be set in a JSON form (non-nested object), into a `<script type="application/json" data-cpu-audio>` tag set statically in the `<head>` of the document. Beware to set this tag _before_ then `<script>` calling (or including) cpu-audio.js . Here is an example, modifying the playing stoping others players behaviour :

```html
<head>
[…]
	<script type="application/json" data-cpu-audio>
		{ "playStopOthers" : false }
	</script>
	<script src="cpu-audio.js" async></script>
```

Here are those parameters, usage and default values :

name (case sensitive)    | default value | usage
-------------------------|---------------|----------
`playStopOthers`         | `true`        | When a `<cpu-audio>` starts to play, any other instances in the same page are paused.
`scrollTo`               | `false`       | On any link to a time-stamp in the page, will scroll the viewport to display the playing interface.
`autoplay`               | `false`       | Will try to play at the start of the page if a temporal url is given or the audio was previously exited. This may be prevented by your browser.
`globalCss`	             | `true`        | Insert in the `<head>` of the host document a specific `<style>` with all needed css variables for the player.
`advanceInPlaylist`      | `true`        | When an audio is ended in a playlist, starts immediatly the next one.
`keymove`                | `5`           | Number of seconds skipped in the timeline when <kbd>←</kbd> or <kbd>→</kbd> keys are pressed in an interface
`alternateDelay`         | `1000`        | Delay for a long press on time-line (in milliseconds) to switch to the handheld alternate browsing interface. Not recommended to modify.
`fastFactor`             | `4`           | Amplification ratio between <kbd>▸︎▸︎</kbd> and <kbd>▸︎▸︎▸︎</kbd> in handheld alternate browsing interface
`repeatDelay`            | `400`         | First repetition delay when clicking a button in handheld alternate browsing interface
`repeatFactor`           | `100`         | Next repetitions delay when clicking a button in handheld alternate browsing interface

Those parameters may also be changed via javascript, see the [API.md](API.md) page, *document.CPU* chapter


Using javascript API
--------------------

cpu-audio.js can be used only with HTML attributes and CSS variables, but javascript savvy developers have [API features to get a more precise control or even extend functionnalities](API.md).
