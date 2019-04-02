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

Aspect changes when page's width is under 640px, 480px and 320px wide. The element must be able to insert itself in any width constraints, in liquid responsive web-design fashion.

Some examples using <code>&lt;iframe&gt;</code>s :

<div id="constrained">
<style scoped>
#constrained div { border : 1px black solid; margin :2px auto; padding : 4px;}
#constrained iframe {width : 100%;  height: 70px}
@media (max-width: 640px) { #constrained .size_2 { display : none; } }
@media (max-width: 480px) { #constrained .size_3 { display : none; } }
@media (max-width: 320px) { #constrained .size_4 { display : none; } }
</style>

<div class="size_2" style="width:639px">
<strong>Under 640px wide</strong> : Height and font-size is reduced, image is hidden.
<iframe src="./iframe_for_dimension.html" ></iframe>
</div>

<div  class="size_3" style="width:479px">
<strong>Under 480px wide</strong> : Total time and chapters timeline are hidden.
<iframe src="./iframe_for_dimension.html" ></iframe>
</div>

<div  class="size_4" style="width:319px">
<strong>Under 320px wide</strong> : Current time is hidden.
<iframe src="./iframe_for_dimension.html" ></iframe>
</div>
</div>

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


No need to use `title=""`, `canonical=""` or `twitter=""` attributes for the two previous examples _excepted_ when you also use `<cpu-controller>`. Other modes exists, and some feature may be hidden. [See INSTALL.md](INSTALL)

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


<cpu-audio
    title="Ex0085 Le Mystère Enigma"
    poster="https://cpu.dascritch.net/public/Images/Emissions/.1805-Ex0085-Enigma_m.jpg"
    canonical="https://cpu.dascritch.net/post/2018/05/17/Ex0085-Histoires-de-la-cryptographie%2C-2%C3%A8me-partie-%3A-Le-myst%C3%A8re-d-Enigma"
    twitter="@cpuprogramme"
    hide="chapters">
    <!-- Pour des raisons  de compatibilité arrière, il *faut* garder la balise <audio controls> dans la déclaration. -->
    <audio controls id="highligths">
        <source src="https://dascritch.net/vrac/Emissions/CPU/0085-CPU%2817-05-18%29.ogg" type="audio/ogg">
        <source src="https://dascritch.net/vrac/Emissions/CPU/podcast/0085-CPU%2817-05-18%29.mp3" type="audio/mpeg">
        <track kind="chapters" src="./tests-assets/chapters-ex0085.vtt" default>
    </audio>
    <!-- {% include no_component_message.html %} -->
</cpu-audio>

<div>
    <style>
        .cpu_playing_tag_«highligths»_cue_«chap-1» #highligths_c1,
        .cpu_playing_tag_«highligths»_cue_«chap-2» #highligths_c2,
        .cpu_playing_tag_«highligths»_cue_«chap-4» #highligths_c4,
        .cpu_playing_tag_«highligths»_cue_«chap-5» #highligths_c5,
        .cpu_playing_tag_«highligths»_cue_«chap-7» #highligths_c7,
        .cpu_playing_tag_«highligths»_cue_«chap-8» #highligths_c8,
        .cpu_playing_tag_«highligths»_cue_«chap-10» #highligths_c10 {
            background : #ddd;
            outline : 1px solid black;
        }
    </style>
    <ul>
        <li id="highligths_c1"><a href="#highligths&t=1m17s">Bonjour à toi, Enfant du Futur Immédiat : Des chiffres et des lettres</a></li>
        <li id="highligths_c2"><a href="#highligths&t=6m28s">Lexique : Casser un chiffrement</a></li>
        <li id="highligths_c4"><a href="#highligths&t=12m45s">Plantage : La chute de l'Empire du chiffre Allemand</a></li>
        <li id="highligths_c5"><a href="#highligths&t=20m45s">Artefact du passé : La machine Enigma</a></li>
        <li id="highligths_c7"><a href="#highligths&t=33m19s">Histoire : Les génies du Biuro Szyfrów</a></li>
        <li id="highligths_c8"><a href="#highligths&t=38m35s">Ainsi naquit : Bletchley Park, le premier campus technologique</a></li>
        <li id="highligths_c10"><a href="#highligths&t=50m03s">Le Gourou : Alan Turing</a></li>
    </ul>
</div>


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

Notes :

 - The global controller (see below) is able to show the current playlist, and highlight the playing media.
 - The playlist feature won't work among iframes.


Global page controller
----------------------

↓ Controller only on the playing / last played `<audio>`

<cpu-controller>
</cpu-controller>

(except those included via `<iframe>`)


<!-- {% include footer.html %} -->
