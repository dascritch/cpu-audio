How-to install
==============

Copy [`dist/cpu-audio.js`](dist/cpu-audio.js) file on your website.
Put in the head of your html page :

```html
<script src="./cpu-audio.js" async></script>
```


Invoking element
----------------

Encapsulate your usual `<audio control>` with `<cpu-audio>`. 

Example : 

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

**Important Note** : Put one and only one `<audio>` tag into `<cpu-audio>`, or you may have unexpected issues. We recommend to set an `id` attribute to the `<audio>` tag for the anchoring feature.

You **must** put a `control` attribute to the included `<audio>` tag as a fallback in case of malfunction. Please also add this rule in your css :

```css
audio[controls] {
    display : block;
    width : 100%;
}
```

You can try playing with our [live configurator tool](LIVE.md), event it isn't perfect yet.


Attributes references
---------------------

Some attributes enhance the component :

* `title="<string>"` : title of the sound ;
* `poster="<url>"` : cover image, squared ratio recommended ;
* `waveform="<url>"` : waveform image, will be displayed in the timeline ;
* `canonical="<url>"` : link to the original page of the sound ; 
* `mode="<string>"` : kind of presentation :
    * `default` : player with poster, timeline and chapters list,
    * `compact` : poster, play/pause button and time indication,
    * `button` : play/pause button only,
    * `button,default`, `button,compact` or `compact,default` : once playing, will unfold from a standby mode (`button` or `compact`) to a wider one,
    * `hidden` : no interface ;
* `hide="<string>"` : hide some features, comma-separated :
    * `poster` : the poster image,
    * `actions` : the share button,
    * `chapters` : the chapters list,
    * `panels` : any panels as chapters or playlist,
    * `panels-except-play` : any panels, except when the module is playing a media (do not use with `panels`) ;
* `playlist="<string>"` : add this media in a named playlist, play the next one when ended ;
* `duration="<seconds|coloncoded|humanreadable>"` : force displayed duration instead to load it from the media resource before playing (add a `preload="none"` attribute to the `<audio>` tag);
* `twitter="@<account>"` : twitter handle for social sharing (fallback on the declared one in your page).


How to link
-----------

In the upper example, `<audio>` tag is ID-entified as `audiodemo`. Usually, you link to its anchor with `#audiodemo`. Add a parameter `t=` with the expected timecode, with a `&` as separator. By example, for 5 minutes from the start, you should target `#audiodemo&t=5m` : 

```html
<p>
    Jump at <a href="#audiodemo&amp;t=5m">5 minutes</a> in the sound
</p>
```


Permitted hash notations
------------------------

Original purpose [was to link any media element of any webpage to a specific moment](https://dascritch.net/post/2014/09/03/Timecodehash-%3A-Lier-vers-un-moment-d-un-sonore). It uses the [W3C standard Media Fragments](https://www.w3.org/TR/media-frags/) notation, extending the URL. 

For the timecode, you can use :

* `page.html#tagID&t=7442` : seconds without unit ;
* `page.html#tagID&t=02:04:02` : colon (“professional”) timecode as `02:04:02` (2 hours, 4 minutes and 2 seconds) ;
* `page.html#tagID&t=2h4m2s` : human-readable units, sub-units availables : `s`econds, `m`inutes, `h`ours and `d`ays

A playable range can be indicated : `page.html#tagID&t=5m,5m5s` will <a href="#sound&t=5m,5m5s">play the sound starting at 5 minutes, and stops it at 5 minutes and 5 seconds</a>

**Note** : if a timecode without any named anchor is given, as in `href="#t=2h4m2s"`, the very first `<audio controls>` element of the document will be addressed. If you are absolutely sure you will only have one audio tag in your page, you can omit the ID : `<a href="#t=5m">`


Cloned player
-------------

You can invoke a global media controller by creating a `<cpu-controller>` without `<audio>` tag. 

It may be useful if, as [in the CPU website](http://cpu.pm), you have a player in the main content and a cloned one in a fixed element.


Chapters
--------

You can add a chapters track into the `<audio control>` tag : 

```html
<track kind="chapters" src="chapters.vtt" default />
```

Note that `default` attribute **is really needed**.

The chapter list will only appears with `mode="default"` settings in `<cpu-audio>`.

You can create the VTT file with [our online editor](https://dascritch.github.io/cpu-audio/LIVE).


Personnalization via CSS variables
----------------------------------

You can change some presentation features of the interface [with CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables). Check their effects [with the live editor](https://dascritch.github.io/cpu-audio/LIVE)

Variable name               | Description                                       | Default value 
----------------------------|---------------------------------------------------|---------------------------------------------------------------------------------
`--cpu-background`          | Background, except playing or in error            | `#555`
`--cpu-color`               | Color, except playing                             | `#ddd`
`--cpu-color-transitions`   | Colors (text and background) transitions duration | `0s`
`--cpu-elapse-width`        | Time indicator width                              | `185px` (`160px` under 640px width, `80px` under 480px, `0` under 320px)
`--cpu-error-background`    | Background when there is a media error            | `#a00`
`--cpu-error-color`         | Color when there is a media error                 | `#ff7`
`--cpu-font-family`         | Font families                                     | `Lato, "Open Sans", "Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif`
`--cpu-font-size`           | Font size                                         | `15px`
`--cpu-height`              | Height and width of the square buttons            | `64px` (`48px` under 640px width)
`--cpu-inner-shadow`        | Shadow between horizontal panels                  | `inset 0px 5px 10px -5px black`
`--cpu-playing-background`  | Background while playing                          | `#444`
`--cpu-playing-color`       | Color while playing                               | `#fff`
`--cpu-popup-background`    | Background for the time pointer                   | `#aaa`
`--cpu-popup-color`         | Text color for the time pointer                   | `#333`


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
    audio[control] {
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

Be aware that this class wil be set even if the chapters list is set to be hidden.

### `.cpu_playing_tag_«audiotag_id»_cue_«cue_id»`

The `<audio id="audiotag_id">` is actually playing the `cue_id` chapter. The `cue_id` is the chapter name described in the .VTT file in its `<track kind="chapters">` . 

This function was meant to build effects as in [BBC Computer Literacy archive](https://computer-literacy-project.pilots.bbcconnectedstudio.co.uk/) : During a play of a show, each chapter is highlighting its text resumee.


Using javascript API
--------------------

cpu-audio.js can be used only with HTML attributes and CSS variables, but javascript savvy developers have [API features to get a more precise control](./API).


<!-- {% include footer.html %} -->