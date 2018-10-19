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
    twitter="@dascritch"
    >
    <audio controls id="audiodemo">
        <source src="https://dascritch.net/vrac/sonores/1404-SambaResille2003.mp3" type="audio/ogg">
        <source src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3" type="audio/mpeg">
    </audio>
</cpu-audio>
```

You **must** put a `control` attribute to the included `<audio>` tag as a fallback in case of malfunction. Please also add this rule in your css :

```css
audio[controls] {
    display : block;
    width : 100%;
}
```

**Important Note** : Put only one and only one `<audio>` tag into `<cpu-audio>`, or you may have unexpected issues.

It is recommended to set to the `<audio>` tag an `id` attribute for using anchoring feature.


You can try playing with our [live configurator tool](LIVE.md), event it isn't perfect yet.


Attributes references
---------------------

Some attributes enhance the component :

* `title="<string>"` : title of the sound ;
* `poster="<url>"` : cover image, squared ratio recommended ;
* `canonical="<url>"` : link to the original page of the sound ; 
* `mode="<string>"` : kind of presentation :
    * `default` : player with poster, timeline and chapters list,
    * `compact` : play/pause button and time indication,
    * `button` : play/pause button only,
    * `hidden` : nothing to show ;
* `hide="<string>"` : hide some features, comma-separated :
    * `actions` : the share button
    * `chapters` : the chapters list
* `twitter="@<account>"` : twitter handle for social sharing (fallback on the declared one in your page) ;
* `playlist="<string>"` : add this media in a named playlist, play the next one when ended.


How to link
-----------

In the upper example, `<audio>` tag is ID-entified as `audiodemo`. Usually, you link to it with `#audiodemo`. Add a parameter `t=` with the expected timecode, with a `&` as separator. By example, for 5 minutes from the start, you should target `#audiodemo&t=5m` : 

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

**Note** : if a timecode without any named anchor is given, as in `href="#t=2h4m2s"`, the very first `<audio controls>` element of the document will be started and placed at this time. If you are absolutely sure you will only have one audio tag in your page, you can omit the ID : `<a href="#t=5m">`


Cloned player
-------------

You can invoke a global media controller by creating a `<cpu-controller>` without `<audio>` tag. 

It may be useful if, as [in the CPU website](http://cpu.pm), you have a player in the main content and a cloned one in a fixed element.


Chapters
--------

You can add a chapters track into the `<audio control>` tag : 

```html
<track kind="chapters" src="chapters.vtt" default>
```

Note that `default` attribute **is really needed**.

The chapter list will only appears with `mode="default"` settings in `<cpu-audio>`.

You may edit a VTT file with [our online editor](https://dascritch.github.io/cpu-audio/LIVE).


Personnalization via CSS variables
----------------------------------

You can change some presentation features of the interface [with CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables). Check their effects [with the live editor](https://dascritch.github.io/cpu-audio/LIVE)

variable | description | default value 
--|--|--
`--cpu-background`  | Background, except playing or in error      | `#555`
`--cpu-color`       | Color, except playing                       | `#ddd`
`--cpu-elapse-width` | Time indicator width                       | `185px` (`160px` under 640px width, `80px` under 480px, `0` under 320px)
`--cpu-error-background` | Background when there is a media error | `#a00`
`--cpu-error-color` | Color when there is a media error           | `#ff7`
`--cpu-font-family` | Font families                               | `Lato, "Open Sans", "Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif`
`--cpu-font-size`   | Font size                                   | `15px`
`--cpu-height`      | Height and width of the square buttons      | `64px` (`32px` under 640px width)
`--cpu-inner-shadow` | Shadow between horizontal panels           | `inset 0px 5px 10px -5px black`
`--cpu-playing-background` | Background while playing             | `#444`
`--cpu-playing-color` | Color while playing                       | `#fff`
`--cpu-popup-background` | Background for the time pointer        | `#aaa`
`--cpu-popup-color` | Text color for the time pointer             | `#333`

<!-- {% include footer.html %} -->
