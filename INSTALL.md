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

It is recommended to set to the `<audio>` tag an `id` attribute for using anchoring feature.

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
* `twitter="@<account>"` : twitter handle for social sharing (fallback on the declared one in your page) ;
* `playlist="<string>"` : add this media in a named playlist, play the next one when ended.


How to link
-----------


In the upper example, `<audio>` tag is id-ed as `audiodemo`. Usually, you link to it with `#audiodemo`. Add a parameter `t=` with the expected timecode, with a `&` as separator. By example, for 5 minutes from the start, you should target `#audiodemo&t=5m` : 

```html
<p>
    Jump at <a href="#audiodemo&amp;t=5m">5 minutes</a> in the sound
</p>
```


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

The chapter list will only appears in `mode="default"` settings


Personnalization via CSS variables
----------------------------------

You can change some presentation features of the interface [with CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables).

variable | description | default value 
--|--|--
`--cpu-background`  | Background, except playing or in error      | `#555`
`--cpu-color`       | Color, except playing                       | `#ddd`
`--cpu-error-background` | Background when there is a media error | `#a00`
`--cpu-error-color` | Color when there is a media error           | `#ff7`
`--cpu-font-family` | Font families                               | `Lato, "Open Sans", "Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif`
`--cpu-font-size`   | Font size                                   | `15px`
`--cpu-elapse-width` | Time indicator width                       | `185px` (`160px` under 640px width, `80px` under 480px, `0` under 320px)
`--cpu-height`      | Height and width of the square buttons      | `64px` (`32px` under 640px width)
`--cpu-playing-background` | Background while playing             | `#444`
`--cpu-playing-color` | Color while playing                       | `#fff`
`--cpu-popup-background` | Background for the time pointer        | `#aaa`
`--cpu-popup-color` | Text color for the time pointer             | `#333`


