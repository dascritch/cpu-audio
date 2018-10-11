<script src="./dist/cpu-audio.js" async></script>
<link rel="stylesheet" href="./src/global.css" />

<div id="demo">
<cpu-audio 
    title="Au carnaval avec Samba Résille (2003)"
    poster="https://dascritch.net/vrac/.blog2/entendu/.1404-SambaResille_m.jpg"
    canonical="https://dascritch.net/post/2014/04/08/Au-Carnaval-avec-Samba-R%C3%A9sille"
    twitter="@dascritch"
    >
    <audio controls id="sound">
        <source src="https://dascritch.net/vrac/sonores/podcast/1404-SambaResille2003.mp3" type="audio/mpeg">
    </audio>
    <!-- {% include no_component_message.html %} -->
</cpu-audio>
</div>

<div class="cpu-audio-with-webcomponents">

- [Configure html](#configurator_html)
- [Generated html](#generated_html)
- [Configure css](#configurator_css)
- [Generated css](#generated_css)

<form id="configurator_html" action="#generated_html" class="pan" >

<fieldset>
    <label for="source_1">
        <span>
            <select>
                <option value="audio/mpeg">MP3</option>
                <option selected value="audio/ogg">OGG Vorbis</option>
                <option value="audio/aac">MP4 AAC</option>
                <option value="audio/webm">Webm</option>
                <option value="audio/wav">WAV</option>
            </select> sound file
        </span>
        <input id="source_1" name="source_1" type="url" value="https://dascritch.net/vrac/Emissions/CPU/0085-CPU%2817-05-18%29.ogg" />
    </label>
    <label for="source_2">
        <span>
            <select>
                <option selected value="audio/mpeg">MP3</option>
                <option value="audio/ogg">OGG Vorbis</option>
                <option value="audio/aac">MP4 AAC</option>
                <option value="audio/webm">Webm</option>
                <option value="audio/wav">WAV</option>
            </select> sound file
        </span>
        <input id="source_2" name="source_2" type="url" value="https://dascritch.net/vrac/Emissions/CPU/podcast/0085-CPU%2817-05-18%29.mp3" />
    </label>
    <label for="source_3">
        <span>
            <select>
                <option value="audio/mpeg">MP3</option>
                <option value="audio/ogg">OGG Vorbis</option>
                <option value="audio/aac">MP4 AAC</option>
                <option value="audio/webm">Webm</option>
                <option value="audio/wav">WAV</option>
            </select> sound file
        </span>
        <input id="source_3" name="source_3" type="url"  />
    </label>
    <label for="source_vtt">
        <span>Chapter VTT text file</span>
        <input id="source_vtt" name="source_vtt" type="url" />
    </label>
</fieldset>

<fieldset>
    <label for="meta_mode">
        <span>Mode</span>
        <select id="meta_mode" name="meta_mode">
            <option value="default">default : player with poster, timeline, playlist and chapters list</option>
            <option value="compact">compact : play/pause button and time indication</option>
            <option value="button">a single play/pause button only,</option>
            <option value="hidden">hidden, mainly for tests purposes</option>
            <option selected value="">be implicit, as "default"</option>
        </select>
    </label>
    <label for="meta_title">
        <span>Title</span>
        <input id="meta_title" name="meta_title" type="text" value="Au carnaval avec Samba Résille (2003)" />
    </label>
    <label for="meta_poster">
        <span>Cover image url</span>
        <input id="meta_poster" name="meta_poster" type="url" value="https://dascritch.net/vrac/.blog2/entendu/.1404-SambaResille_m.jpg" />
    </label>
    <label for="meta_canonical">
        <span>Canonical page link</span>
        <input id="meta_canonical" name="meta_canonical" type="url" />
    </label>
    <label for="meta_twitter">
        <span>Twitter handle</span>
        <input id="meta_twitter" name="meta_twitter" type="string" pattern="@[\d\w_]+" />
    </label>
</fieldset>

<button type="reset">Reset values</button>
<button type="submit">See result HTML code</button>

</form>


<div class="pan" id="generated_css">
    Paste this HTML code where you want the player in your page
<pre id="code">
</pre>

<a href="#configurator_css">Go to CSS configurator</a>
</div>

<form id="configurator_css" action="#generated_css" class="pan">

<button type="reset">Reset values</button>

<fieldset>
    <label>
        <span>Colours except playing or in error</span>
        <input name="css_background" type="color" />
        <input name="css_color" type="color" />
    </label>
    <label for="css_elapse-width">
        <span>Time indicator width (upper than 640px wide)</span>
        <input id="css_elapse-width" name="css_elapse-width" type="text" />
    </label>
    <label for="css_error-background">
        <span>Colours when there is a media error</span>
        <input name="css_error-background" type="color" />
        <input name="css_error-color" type="color" />
    </label>
    <label for="css_font-family">
        <span>Font families</span>
        <input id="css_font-family" name="css_font-family" type="text" />
    </label>
    <label for="css_font-size">
        <span>Font size</span>
        <input id="css_font-size" name="css_font-size" type="text" />
    </label>
    <label for="css_height">
        <span>Height and width of the square buttons</span>
        <input id="css_height" name="css_height" type="text" />
    </label>
    <label for="css_inner-shadow">
        <span>Shadow between horizontal panels</span>
        <input id="css_inner-shadow" name="css_inner-shadow" type="text" />
    </label>
    <label for="css_playing-background">
        <span>Colours while playing</span>
        <input name="css_playing-background" type="color" />
        <input name="css_playing-color" type="color" />
    </label>
    <label for="css_popup-background">
        <span>Colours for the time pointer</span>
        <input name="css_popup-background" type="color" />
        <input name="css_popup-color" type="color" />
    </label>
</fieldset>

<button type="reset">Reset values</button>
<button type="submit">See result CSS code</button>

</form>


<div class="pan" id="generated_css">
    Copy and paste this CSS code into your stylesheet. Or write it :

<pre><style id="style" contenteditable>
</style></pre>
</div>

<script>

let form_html = document.getElementById('configurator_html');
let form_css = document.getElementById('configurator_css');
let cpu_audio = document.querySelector('cpu-audio');
let css_attributes = [
    'background', 'color',
    'elapse-width',
    'error-background', 'error-color',
    'font-family', 'font-size',
    'height', 'inner-shadow',
    'playing-background', 'playing-color',
    'popup-background', 'popup-color'
    ];

function reset_css_default() {
    // ah ouais, faut intégrer global.css preums
    // i have grave la femme
    let style = getComputedStyle(document.body);
    let regex_4096_colours = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/;
    for (let attr of css_attributes) {
        let input = form_css.querySelector(`[name="css_${attr}"]`);
        let value = style.getPropertyValue(`--cpu-${attr}`).trim();
        value = value.replace(regex_4096_colours,'#$1$1$2$2$3$3')
        input.value = value;
        input.setAttribute('value', value);
    }
}

function configurator_html(event) {
    let cpu_audio_attributes = '';
    let audio_sources = '';
    let has_one_source = false;

    function esc(chain) {
        return chain.replace('&','&amp;').replace('"','&quot;').replace('<','&lt;').replace('>','&gt;');
    }

    function adjust_attributes_cpu_audio() {
        for (let attr of ['mode', 'title', 'poster', 'canonical', 'twitter']) {
            let value = form_html.querySelector(`[name="meta_${attr}"]`).value;
            if (value) {
                cpu_audio_attributes += ` ${attr}="${esc(value)}"`;
            }
        }
    }
    function adjust_audio_sources() {
        for (let attr of ['1', '2', '3', 'vtt']) {
            let value = form_html.querySelector(`[name="source_${attr}"]`).value;
            if (value) {
                if (attr === 'vtt') {
                    audio_sources += `\n      <track src="${esc(value)}" kind="chapters" default />`;
                } else {
                    let kind = form_html.querySelector(`[for="source_${attr}"] select`);
                    has_one_source = true;
                    audio_sources += `\n      <source src="${esc(value)}" type="${esc(kind.value)}" />`;
                }
            }
        }
    }

    adjust_attributes_cpu_audio();
    adjust_audio_sources();

    if (!has_one_source) {
        // ajouter les erreurs
    }

    let code = `<cpu-audio${cpu_audio_attributes}>
    <audio controls id="sound">${audio_sources}
    </audio>
</cpu-audio>`;
    document.getElementById('demo').innerHTML = code;
    document.getElementById('code').innerText = code;
    
    if (event) {
        event.preventDefault();
    }
}

function configurator_css() {
    let css = 'body {';
    for (let attr of css_attributes) {
        let value = form_css.querySelector(`[name="css_${attr}"]`).value;
        if (value) {
            css += `\n    --cpu-${attr} : ${value};`;
        }
    }
    css += '\n}';

    document.getElementById('style').innerHTML = css;
    if (event) {
        event.preventDefault();
    }
}

function noop(event) {
    document.location.hash = event.target.action;
    event.preventDefault();
}

document.addEventListener('DOMContentLoaded', function(){
    for (let event of ['input', 'change' ,'reset']) {
        form_html.addEventListener(event, configurator_html);
        form_css.addEventListener(event, configurator_css);
    }
    form_html.addEventListener('submit', noop);
    form_css.addEventListener('submit', noop);
    reset_css_default();
    configurator_html();
    document.location.hash = '#'+form_html.id; 
}, false);

</script>

<style>
    form label {display : flex;}
    form label * {flex : 1 0 auto;}
    form label span {flex : 0 0 200px;}
    #style {display : block;}

    .pan { display :none ; }
    .pan:target { display :block ; }
</style>
</div>

<!-- {% include footer.html %} -->