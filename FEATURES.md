CPU-Audio features
==================

An example with chapters.

<!-- calling the webcomponent -->
<cpu-audio
    title="Ex0085 Le Mystère Enigma"
    poster="https://cpu.dascritch.net/public/Images/Emissions/.1805-Ex0085-Enigma_m.jpg"
    canonical="https://cpu.dascritch.net/post/2018/05/17/Ex0085-Histoires-de-la-cryptographie%2C-2%C3%A8me-partie-%3A-Le-myst%C3%A8re-d-Enigma"
    twitter="@cpuprogramme">
    <!-- Pour des raisons  de compatibilité arrière, il *faut* garder la balise <audio controls> dans la déclaration. -->
    <audio controls id="emission">
        <source src="https://dascritch.net/vrac/Emissions/CPU/0085-CPU%2817-05-18%29.ogg" type="audio/ogg">
        <source src="https://dascritch.net/vrac/Emissions/CPU/podcast/0085-CPU%2817-05-18%29.mp3" type="audio/mpeg">
        <track kind="chapters" src="./tests-assets/chapters-ex0085.vtt" default>
    </audio>
    <!-- {% include no_component_message.html %} -->
</cpu-audio>

Size constraints
----------------

Aspect changes when page's width is under 640px and 320px wide. The element must be able to insert itself in any width constraints, in liquid responsive web-design fashion.

<cpu-audio 
    title="Au carnaval avec Samba Résille (2003)"
    poster="https://dascritch.net/vrac/.blog2/entendu/.1404-SambaResille_m.jpg"
    canonical="https://dascritch.net/post/2014/04/08/Au-Carnaval-avec-Samba-R%C3%A9sille"
    twitter="@dascritch">
    <audio controls id="live">
        <source src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3" type="audio/mpeg">
    </audio>
</cpu-audio>


Modes
-----

↓ `mode="compact"` 

<cpu-audio  mode="compact"
    canonical="https://dascritch.net/post/2016/12/27/35-ans-de-Radio-FMR%2C-et-elle-dure-encore"
    title="35 ans de Radio FMR, et elle dure encore"
    poster="https://dascritch.net/vrac/.blog2/radio/.1612-FMR-35ans_t.jpg">
    <audio controls id="b1">
        <source src="https://dascritch.net/vrac/Emissions/Speciales/podcast/1612-35ans-RadioFMR.mp3" type="audio/mpeg">
    </audio>
</cpu-audio>

↓ `mode="button"` . The component **should not** reduce under 640px wide. 

<cpu-audio mode="button">
    <audio controls id="b2">
        <source src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3" type="audio/mpeg">
    </audio>
</cpu-audio>


No need to use `title=""`, `poster=""`, `canonical=""` or `twitter=""` attributes for the two previous examples _excepted_ when you also use `<cpu-controller>`. Other modes exists, and some feature may be hidden. [See INSTALL.md](INSTALL)

↓ Unfoldable mode, by example : `mode="compact,default"`  , the component will be displayed in `compact` mode in stand-by, but will unfold to `default` once it plays.

<cpu-audio mode="button">
    <audio controls id="b2">
        <source src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3" type="audio/mpeg">
    </audio>
</cpu-audio>


Personnalization
----------------

You can change some aspects of the interface [via some handy CSS variables](https://dascritch.github.io/cpu-audio/INSTALL.html#personnalization-via-css-variables), even only in a region of your page.

<div id="personnalization-demo">
<pre><style class="showcode" scoped contenteditable>/* you can edit to test it right now */
    #personnalization-demo {
        --cpu-background : yellow;
        --cpu-color : green;
        --cpu-playing-background : yellow;
        --cpu-playing-color : green;
    }
</style></pre>

<cpu-audio
        title="Au carnaval avec Samba Résille (2003)"
        poster="https://dascritch.net/vrac/.blog2/entendu/.1404-SambaResille_m.jpg"
        canonical="https://dascritch.net/post/2014/04/08/Au-Carnaval-avec-Samba-R%C3%A9sille"
    >
    <audio controls id="p1">
        <source src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3" type="audio/mpeg">
    </audio>
</cpu-audio>
</div>


Highlighting text amond chapters
--------------------------------

If you use a chapter track with name chapters, you can use a CSS rule to highlight a portion of your text with the playing audio.


Playlists
---------

You can create playlists on a page, one or more. When a player is ending, the next one in its playlists starts.

<cpu-audio 
    playlist="demo"
    title="micro @HalluFMR #36 : Placebo"
    poster="https://dascritch.net/vrac/.blog2/radio/.1409-Hallucinarium-FMR_s.jpg"
    canonical="https://dascritch.net/post/2015/05/27/micro-%40HalluFMR-36-%3A-Placebo">
    <audio controls id="pl1">
        <source src="https://dascritch.net/vrac/Emissions/AtHalluFMR/podcast/36-AtHalluFMR%2827-05-15%29.mp3" type="audio/mpeg">
    </audio>
</cpu-audio>
<cpu-audio
    playlist="demo"
    title="micro @HalluFMR #38 : Sensationnel"
    poster="https://dascritch.net/vrac/.blog2/radio/1411-AtHalluFmr/.1505-PassageF3_m.jpg"
    canonical="https://dascritch.net/post/2015/06/10/micro-%40HalluFMR-38-%3A-Sensationnel">
    <audio controls id="pl2">
        <source src="http://dascritch.net/vrac/Emissions/AtHalluFMR/podcast/38-AtHalluFMR(10-06-15).mp3" type="audio/mpeg">
    </audio>
</cpu-audio>
<cpu-audio
    playlist="demo"
    title="micro @HalluFMR #40 : Conditions Générales"
    poster="https://dascritch.net/vrac/.blog2/radio/.1409-Hallucinarium-FMR_s.jpg"
    canonical="https://dascritch.net/post/2015/06/24/micro-%40HalluFMR-40-%3A-Conditions-G%C3%A9n%C3%A9rales">
    <audio controls id="pl3">
        <source src="http://dascritch.net/vrac/Emissions/AtHalluFMR/podcast/40-AtHalluFMR(24-06-15).mp3" type="audio/mpeg">
    </audio>
</cpu-audio>

Note that the global controller (see below) is able to show the current playlist, and highlight the playing media.


Global page controller
----------------------

↓ Controller only on the playing / last played `<audio>`

<cpu-controller>
</cpu-controller>


<!-- {% include footer.html %} -->
