'use strict'; 

/**
TODO
- add on the fly generated spectrogram
- do not enter a timeline greater than duration
- when unfolding generators, expanded panels should be also scrolled to
**/


let sound_element, component_element, list_element, edit_source_audio_element, edit_source_webvtt_element;
let sound_CPU;
let line_number = 1;
let convert = document.CPU;

const point_canvas = {
            text : '',
            start : 0,
            link : true, // on click, should both repoint the player and trigger an action (delegated to event) 
            image : '../assets/pointer.png',
    };

let pointName_editing = 'line-0';
let points = {
    [pointName_editing] : point_canvas
};

let cues = [];

const regex_filename_without_path = /(^.*\/)([^\/]+)/;

let timecode_input, text_input;


/**
 * Fired once <track> is loaded
 * 
 * @param      {Event}  event   "Load" event on <track>
 */
function interpret_loaded_tracks(event) {
    let line_number = 0;
    for(let t of sound_element.textTracks[0].cues) {
        let { startTime, text } = t;
        let this_pointName = `line-${line_number++}`;
        points[this_pointName] = {
            ...point_canvas,
            start  : Number(startTime),
            text   : text,
            _input : text
        };
    }
    sound_CPU.clearPlane('cursors');
    sound_CPU.bulkPoints('cursors', points);
    show_only_line();
}

function histogram() {
    // to complete https://github.com/dascritch/cpu-audio/issues/117
    // TODO async
    console.log('histogram')
    // taken from https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createAnalyser
    let audioCtx = new AudioContext();
    let source = audioCtx.createMediaElementSource(sound_element);
    let analyser = audioCtx.createAnalyser();
    analyser.fftSize = 32;
    let WIDTH = 2000;
    let HEIGHT = 32;
    let canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvasctx = axis.getContext("2d");

    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    let drawVisual = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    canvasctx.fillStyle = 'rgb(70, 70, 70)';
    canvasctx.fillRect(0, 0, WIDTH, HEIGHT);
    canvasctx.lineWidth = 2;
    canvasctx.strokeStyle = 'rgb(0, 0, 0)';
    canvasctx.beginPath();
    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;
    for(let i = 0; i < bufferLength; i++) {
        console.log(i)
        if (i % 10000 == 0) {
            console.log(i)
        }



        let v = dataArray[i] / 128.0;
        let y = v * HEIGHT;

        if (i === 0) {
            canvasctx.moveTo(x, y);
        } else {
            canvasctx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    canvasctx.lineTo(canvasctx.width, canvasctx.height/2);
    canvasctx.stroke();
    sound_element.dataset.waveform = canvas.toDataURL();
    console.log(sound_element.dataset.waveform)
}


/**
 * Fired on any configuration field changed. Mainly for setting audio source, ev, timeline and track source
 */
function set_source_audio() {
    let file_source_audio = edit_source_audio_element.files[0];

    if ( (!file_source_audio.type.startsWith('audio')) && (!file_source_audio.type.startsWith('video'))) {
        console.warn(`Cannot use file type ${file_source_audio.type}. Is it me or you ?`)
        return;
    }
    sound_element.dataset.title = decodeURIComponent(file_source_audio.name);
    sound_element.src = URL.createObjectURL(file_source_audio);
    // TODO sound_element.dataset.waveform with generated 

    let file_source_webvtt = edit_source_webvtt_element.files[0];

    let track_element = document.querySelector('track');
    if (file_source_webvtt) {
        track_element.addEventListener('load', interpret_loaded_tracks);
        track_element.default = true;
        track_element.kind = 'metadata';
        track_element.src = URL.createObjectURL(edit_source_webvtt_element.files[0]);
        sound_element.preload = 'metadata';
    }

    document.body.classList.add('loaded');
    
    /*
    try {
        if (url) {
            // histogram();  CORS issue;, see https://github.com/dascritch/cpu-audio/issues/117

        }
    } catch {

    }*/
}

/**
 * Fired once configuration form is  validated
 *
 * @param      {<type>}  event   The event
 */
function check_configure(event) {
    event.preventDefault();
    set_source_audio();
    // test if audio is correctly loaded
    document.querySelector('#at_start').open = false;
    document.querySelector('#chapters').open = true;
    show_only_line();
}

/**
 * Special operations on <button type="button">
 *
 * @param      {Event}  event   "change", "input" or "submit" onto <p>
 */
function check_for_actions(event) {
    if (event.target.tagName === 'BUTTON') {
        switch (event.target.id) {
            case 'add' :
                pointName_editing = `line-${line_number++}`;
                points[pointName_editing] = { ...point_canvas, start : Number(sound_element.currentTime) };
                interpret_form();
                show_only_line(pointName_editing, true);
                break;
            case 'test' : 
                document.CPU.jumpIdAt('sound', convert.timeInSeconds(timecode_input.value));
                break ;
            case 'set' : 
                sound_CPU.editPoint('cursors', pointName_editing, {start : sound_element.currentTime});
                timecode_input.value = convert.secondsInColonTime( sound_element.currentTime );
                points[pointName_editing].start = sound_element.currentTime;
                sound_CPU.editPoint('cursors', pointName_editing, points[pointName_editing]);
                interpret_form();
                break ;
            case 'remove' :
                let points_names = Object.keys(points);
                let was = pointName_editing;
                let now = points_names[ Math.max(points_names.indexOf(pointName_editing) -1, 0) ];
                sound_CPU.removePoint('cursors', pointName_editing);
                pointName_editing = now;
                interpret_form();
                break ;
        }
        event.preventDefault();
    }
}

/**
 * Hide all lines of the chapters editor, show only the one focused
 *
 * @param      {string}  pointName  The point name to show
 * note : a second parameter (event) is added due to eventListener, but is ignored
 */
function show_only_line(pointName=pointName_editing, with_focus=false) {
    let {start, _input} = points[pointName] ?? point_canvas ;
    timecode_input.value = convert.secondsInColonTime(start) ?? '' ;
    text_input.value = _input ?? '';
    pointName_editing = pointName;
    sound_CPU.highlightPoint('cursors', pointName, 'editing')

    if (with_focus) {
        text_input.focus();
    }
}

function cursor_hover(pointName) {
    let data = sound_CPU.point('cursors', pointName);
    if (data == undefined) {
        return ;
    }
    sound_CPU.showThrobberAt(data.start);
}

function cursor_out(pointName) {
    sound_CPU.hideThrobber();
}

let current_x;
let x_offset = 0;
let track_width = 0;
let seeked_time;
let clicked_a;
let clicked_pointName = null;
function drag_start(_clicked_a, _clicked_pointName, event) {
    clicked_a = _clicked_a;
    clicked_pointName = _clicked_pointName;
    let clicked_track = clicked_a.closest('aside');
    x_offset = clicked_track.getBoundingClientRect().left
    track_width = clicked_track.clientWidth;

    current_x = event.clientX - x_offset;
    seeked_time = sound_element.duration * current_x / track_width;
    sound_CPU.showThrobberAt(seeked_time);

    event.preventDefault();
}

function drag(event) {
    if (!clicked_pointName) {
        return ;
    }

    current_x = event.clientX - x_offset;
    seeked_time = sound_element.duration * current_x / track_width;
    if ((seeked_time < 0) || (seeked_time > sound_element.duration)) {
        console.error(seeked_time);
        return ;
    }
    
    sound_CPU.showThrobberAt(seeked_time);
    sound_CPU.positionTimeElement(clicked_a, seeked_time, seeked_time);
    // should we mode play position too ?
    event.preventDefault();
}

function drag_end(event) {
    if (!clicked_pointName) {
        return ;
    }
    timecode_input.value = convert.secondsInPaddledColonTime(seeked_time);
    points[clicked_pointName].start = Math.floor(seeked_time);
    sound_CPU.bulkPoints('cursors', points);
    clicked_pointName = null;
    interpret_form();
}
//*/

/**
 * When a repaint occurs on a cpu-audio component point element, we add our events
 *
 * @class      CPU_drawPoint (name)
 * @param      {<type>}  event   The event
 */
function CPU_drawPoint({detail}) {
    // I show how you can reach CPU API from an event. Not used here, but it may helps someone digging into it
    // let  CPU_controler = event.target.CPU;

    let {elementPointTrack, elementPointPanel, pointName} = detail;

    if ((!elementPointTrack) || (!elementPointPanel)) {
        // May happen is phracking github pages integration
        return;
    }

    // first, we remove pre-existing events    
    elementPointTrack.removeEventListener('mouseover', cursor_hover);
    elementPointTrack.removeEventListener('mouseout',cursor_out);
    elementPointTrack.removeEventListener('click', show_only_line);
    elementPointPanel.removeEventListener('mouseover', cursor_hover);
    elementPointPanel.removeEventListener('mouseout',cursor_out);
    elementPointPanel.removeEventListener('click', show_only_line);

    elementPointTrack.removeEventListener('pointerdown', drag_start);
    
    // When you click on a point, we show the line editing interface
    // we bind() the function to pass its arguments. 
    elementPointTrack.addEventListener('mouseover', cursor_hover.bind(null, pointName));
    elementPointTrack.addEventListener('mouseout',cursor_out.bind(null, pointName));
    elementPointTrack.addEventListener('click', show_only_line.bind(null, pointName, true));

    elementPointTrack.addEventListener('pointerdown', drag_start.bind(null, elementPointTrack, pointName));

    elementPointPanel.addEventListener('mouseover', cursor_hover.bind(null, pointName));
    elementPointPanel.addEventListener('mouseout',cursor_out.bind(null, pointName));
    elementPointPanel.addEventListener('click', show_only_line.bind(null, pointName, true));

}

// imported from src/utils.js
function escapeHtml(text) {
    let burn_after_reading = document.createElement('span');
    burn_after_reading.innerText = text;
    let out = burn_after_reading.innerHTML;
    burn_after_reading.remove();
    return out;
}

/**
 * Interpret a chapter line edited
 *
 */
function interpret_line(event=null, this_line_element=undefined) {
    let start = convert.timeInSeconds( timecode_input.value ?? '0' );
    let _input = text_input.value ?? '';
    let text = _input;

    if (this_line_element) {
        start = this_line_element.time;
        text = this_line_element.text;
    }

    // very simple clean HTML
    if ((text.split('<').length) !== (text.split('>').length)) {
        text = escapeHtml(text);
    }

    if ( (start === '') && (_input === '') ) {
        // no time code ? no text ? do not record it yet
        return ;
    }
    points[pointName_editing] =  { ...point_canvas, start, text, /* recall for text_input */ _input }

    sound_CPU.bulkPoints('cursors', points);
    // perhaps we have blink there
    show_only_line(pointName_editing);
    interpret_form();
}

/**
 * Render chapters in different formats : HTML, MarkDown, WikiDoku and WebVTT
 */
function interpret_form(_event) {
    _event?.preventDefault();
    let data;
    let track = document.querySelector('audio').addTextTrack("chapters");
    sound_CPU.bulkPoints('cursors', points);
    points = sound_CPU.planePoints('cursors'); // get the points re-ordered
    show_only_line();
    const array_points = Object.values(points);

    function prepare_export_file(text) {
        data = new Blob([text], {type: 'text/plain'});
        let textFile = window.URL.createObjectURL(data);
        return textFile;
    }

    function build_html_source() {
        let out1=[];
        let out2=[];
        for(let {start, text} of array_points) {
            out1.push(`\t<li><a href="#t=${start}">${text} (${convert.secondsInColonTime(start)})</a></li>`) 
            out2.push(`\t<li>${text} — (<a href="#t=${start}">${convert.secondsInColonTime(start)}</a>)</li>`) 
        }
        return `<ol>\n${out1.join('\n')}\n</ol>\n<p>Alternate version :</p>\n<ol>\n${out2.join('\n')}\n</ol>`;
    }

    function build_md_source() {
        let out =[];
        for(let {start, text} of array_points) {
           out.push(`\n * [${text}](#t=${start})`) 
        }
        return `${out.join('')}`;
    }

    function build_wiki_source() {
        let out =[];
        for(let {start, text} of array_points) {
           out.push(`\n  - [[#t=${start}|${text}]]`) 
        }
        return `${out.join('')}`;
    }

    function build_vtt_source() {
        let out =[];
        let number = 0;
        for (let {start, text} of array_points) {
            number++;
            let end = convert.secondsInPaddledColonTime( (number < array_points.length) ? array_points[number].start : sound_element.duration );
            out.push(`\n\nchapter-${number}\n${convert.secondsInPaddledColonTime(start)}.000 --> ${end}.000\n${text}`) 
        }
        return `WEBVTT FILE\n${out.join('')}\n`;
    }

    function build_json_source() {
        let out = {};
        for (let pointName of sound_CPU.planePointNames('cursors')) {
            const {start, text} = points[pointName];
            out[pointName] = {start, text};
        }
        return JSON.stringify(out, null, 4);
    }

    const filename = sound_element.dataset.title.replace(/(.*)(\.(ogg|mp3|wav|flac|mp4|aac))$/,'$1');

    const html_source =  build_html_source();
    document.getElementById('html_out').innerHTML = html_source;
    document.getElementById('html_source').innerText =  html_source;
    document.querySelector('#html_source').open = true;
    document.getElementById('md_source').innerText = build_md_source();
    document.getElementById('wiki_source').innerText = build_wiki_source();
    const vtt = build_vtt_source();
    document.getElementById('vtt_source').innerText = vtt;
    const vtt_virtual_file = prepare_export_file(vtt);
    document.getElementById('vtt_source_download').href = vtt_virtual_file;
    document.getElementById('vtt_source_download').download = `${filename}.vtt`;
    document.querySelector('#vtt_source').open = true;
    const pointsjson = build_json_source();
    const json_virtual_file = prepare_export_file(pointsjson);
    document.getElementById('json_source').innerText = pointsjson;
    document.getElementById('json_source_download').href = json_virtual_file;
    document.getElementById('json_source_download').download = `${filename}.json`;
}

document.addEventListener('DOMContentLoaded', e => {
    document.location.hash = '#';

    sound_element = document.getElementById('sound');

    edit_source_audio_element = document.getElementById('source_audio');
    edit_source_webvtt_element = document.getElementById('source_webvtt');

    /* Settings */
    //edit_source_audio_element.addEventListener('change', set_source_audio);
    //edit_source_webvtt_element.addEventListener('change', set_source_audio);
    document.querySelector('#configure').addEventListener('submit', check_configure);

    /* Building addedd events into CPU-audio panels */
    document.addEventListener('CPU_drawPoint', CPU_drawPoint);

    /* Chapter editor */
    timecode_input = document.getElementById('timecode_input');
    text_input = document.getElementById('text_input');
    timecode_input.addEventListener('input', interpret_line);
    text_input.addEventListener('input', interpret_line);
    document.getElementById('edit_chapters').addEventListener('click', check_for_actions);

    /* drag'n'drop events */
    document.body.addEventListener('pointermove', drag);
    document.body.addEventListener('pointerup', drag_end);
    document.body.addEventListener('pointerleave', drag_end);
    document.body.addEventListener('pointercancel', drag_end);
});

document.addEventListener('CPU_ready', e => {
    convert = document.CPU.convert;
    // sometimes not fired, so we needed a "ready" event
    component_element = e.target;
    sound_CPU = component_element.CPU;
    sound_CPU.addPlane('cursors', {title : 'Chapters preview', track : 'cursors', panel : true});
    sound_CPU.injectCss('cursors', `
        .cursors {
            left: -6px;
            user-select: none;
        }
        .cursors .with-preview {
            outline : white 4px solid;
            z-index : 10;
        }
        .cursors a {
            width: 11px;
            height: 21px;
            position: absolute;
            display : block;
            touch-action: none;
            user-select: none;
        }
        .cursors img {
            width: 11px;
            height: 21px;
        }
        .editing {
            background : black;
        }
        a.editing img {
            outline : black 4px solid;
        }
    `);
});
