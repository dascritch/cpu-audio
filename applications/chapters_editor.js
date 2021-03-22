'use strict'; 

/**

TODO
- AAARG ! Chrome still doesn't keep the moving cursor :(
- when unfolding generators, expanded panels should be also scrolled to
- draggable cursor . some primitive "nearly" ready for release
- use audiotag...points for working, remove repeted form elements
- use <textarea> instead of <input type="text">
- export points as JSON (for fuure addPlane with adding points in bulk mode)
- export .csv 

**/


let new_chapter_line;
let sound_element, component_element, list_element, edit_source_audio_element, edit_source_waveform_element, edit_source_webvtt_element;
let sound_CPU;
let line_number = 1;
let convert;

let chapters = [];
let cues = [];

const regex_filename_without_path = /(^.*\/)([^\/]+)/;

/**
 * Fired once <track> is loaded
 * 
 * @param      {Event}  event   "Load" event on <track>
 */
function interpret_loaded_tracks(event) {
    for(let t of sound_element.textTracks[0].cues) {
        interpret_line(add_line(t.startTime, t.text), true);
    }
    show_only_line();
}

/**
 * Fired on any configuration field changed. Mainly for setting audio source, ev, timeline and track source
 */
function set_source_audio() {
    let url = edit_source_audio_element.value;
    let track_element = sound_element.querySelector('track');
    document.body.classList.add('loaded');
    track_element.addEventListener('load', interpret_loaded_tracks);
    
    sound_element.src = url;
    sound_element.dataset.title = decodeURIComponent(url.replace(regex_filename_without_path, '$2'));
    sound_element.dataset.waveform = edit_source_waveform_element.value;

    if ( (edit_source_webvtt_element.value) && (track_element.src !== edit_source_webvtt_element.value) )  {
        track_element.src = edit_source_webvtt_element.value;
    }
}

/**
 * Fired once configuration form is  validated
 *
 * @param      {<type>}  event   The event
 */
function check_configure(event) {
    set_source_audio();
    event.preventDefault();
    // test if audio is correctly loaded
    document.querySelector('#at_start').open = false;
    document.querySelector('#chapters').open = true;
    show_only_line();
}

/**
 * Present the currently elapsed time in <audio> in a 00:00 form
 *
 * @return     {string}  Timecode colon-separated, zero-paded
 */
function currentTime_in_colon() {
    return convert.secondsInPaddledColonTime(sound_element.currentTime);
}

/**
 * Adds a line in chapter editor
 *
 * @param      {number}  [time_value=undefined]  Time position 
 * @param      {string}  [text_value='']         Text title
 * @return     {Element} Resulting created <p> element
 */
function add_line(time_value=undefined , text_value='') {
    if (time_value.preventDefault) {
        // we have an event, we don't want to badly interpret it
        time_value = false;
    }
    let line = document.createElement('p');
    line.id = `line-${line_number++}`;
    line.innerHTML = new_chapter_line;
    line.classList.add('line');
    line.querySelector('.timecode_input').value = time_value ? convert.secondsInPaddledColonTime(time_value) : currentTime_in_colon();
    line.querySelector('.text_input').value = text_value;
    add_events_line(line);
    document.getElementById('list').appendChild(line);
    show_only_line(line.id);
    return line;
}


/**
 * Special operations on <button type="button">
 *
 * @param      {Event}  event   "change", "input" or "submit" onto <p>
 */
function check_for_actions(event) {
    if (event.target.tagName === 'BUTTON') {
        let this_line_element = event.target.closest('p');
        let this_line_time_element = this_line_element.querySelector('.timecode_input');
        switch (event.target.className) {
            case 'test' : 
                document.CPU.jumpIdAt('sound', convert.timeInSeconds(this_line_time_element.value));
                break ;
            case 'set' : 
                this_line_time_element.value = currentTime_in_colon();
                interpret_line(this_line_element);
                break ;
            case 'remove' :
                sound_CPU.removePoint('cursors', this_line_element.id);
                this_line_element.remove();
                event.preventDefault();
                break ;
        }
    }
}

/**
 * Hide all lines of the chapters editor, show only the one focused
 *
 * @param      {string}  pointName  The point name to show
 * note : a second parameter (event) is added due to eventListener, but is ignored
 */
function show_only_line(pointName) {
    Array.from(
        document.querySelectorAll('p.line')
        ).forEach( (element) => {
            element.classList.remove('editing');
        });
    let active_line = document.getElementById(pointName) ;
    if (active_line) {
        active_line.classList.add('editing');
        active_line.querySelector('input[type="text"]').focus();
    }
}

function cursor_hover(pointName) {
    let data = sound_CPU.point('cursors', pointName);
    sound_CPU.showThrobberAt(data.start);
}

function cursor_out(pointName) {
    sound_CPU.hideThrobber();
}

///* not yet ready
let current_x;
let x_offset = 0;
let track_width = 0;
let seeked_time;
let clicked_a;
let clicked_pointName;
let clicked_track;
let this_line_time_element;
function drag_start(_clicked_a, _clicked_pointName, event) {
    clicked_a = _clicked_a;
    clicked_pointName = _clicked_pointName;
    clicked_track = clicked_a.closest('aside');
    x_offset = clicked_track.getBoundingClientRect().left
    track_width = clicked_track.clientWidth;

    current_x = event.clientX - x_offset;
    seeked_time = sound_element.duration * current_x / track_width;
    sound_CPU.showThrobberAt(seeked_time);

    this_line_time_element = document.querySelector(`p#${clicked_pointName} .timecode_input`);
    event.preventDefault();
}

function drag(event) {
    if (!clicked_track) {
        return ;
    }

    current_x = event.clientX - x_offset;
    seeked_time = sound_element.duration * current_x / track_width;
    if ((seeked_time < 0) || (seeked_time > sound_element.duration)) {
        console.error(seeked_time);
        return ;
    }
    
    sound_CPU.showThrobberAt(seeked_time);
    sound_CPU.position_time_element(clicked_a, seeked_time, seeked_time);
    // should we mode play position too ?
    event.preventDefault();
}

function drag_end(event) {
    if (!clicked_track) {
        return ;
    }
    clicked_track = false;
    this_line_time_element.value = convert.secondsInPaddledColonTime(seeked_time);
    sound_CPU.editPoint('cursors', clicked_pointName, {start : seeked_time});
    //sound_CPU.
}
//*/

/**
 * When a repaint occurs on a cpu-audio component point element, we add our events
 *
 * @class      CPU_drawPoint (name)
 * @param      {<type>}  event   The event
 */
function CPU_drawPoint(event) {
    // I show how you can reach CPU API from an event. Not used here, but it may helps someone digging into it
    // let  CPU_controler = event.target.CPU;

    let detail = event.detail;
    let elementPointTrack = detail.elementPointTrack;
    let elementPointPanel = detail.elementPointPanel;

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
    elementPointTrack.addEventListener('mouseover', cursor_hover.bind(event, detail.point));
    elementPointTrack.addEventListener('mouseout',cursor_out.bind(event, detail.point));
    elementPointTrack.addEventListener('click', show_only_line.bind(event, detail.point));

    elementPointTrack.addEventListener('pointerdown', drag_start.bind(undefined, elementPointTrack, detail.point));

    elementPointPanel.addEventListener('mouseover', cursor_hover.bind(event, detail.point));
    elementPointPanel.addEventListener('mouseout',cursor_out.bind(event, detail.point));
    elementPointPanel.addEventListener('click', show_only_line.bind(event, detail.point));

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
 * @param      {Element}  this_line_element  The this line element
 */
function interpret_line(this_line_element, from_interpret_form=false) {
    let time = this_line_element.querySelector('.timecode_input').value; 
    let text = this_line_element.querySelector('.text_input').value;

    // very simple clean HTML
    if ((text.split('<').length) !== (text.split('>').length)) {
        text = escapeHtml(text);
    }

    if ((!from_interpret_form) && (Number(this_line_element.dataset.time) !== Number(convert.timeInSeconds(time)))) {
        interpret_form();
        return ;
    }

    this_line_element.dataset.time = convert.timeInSeconds(time);
    if ( (time === '') && (text === '') ) {
        // no time code ? no text ? do not record it yet
        return ;
    }

    let seconds = Math.floor(convert.timeInSeconds( time ));
    
    let this_line_data = {
        code: time,
        time: seconds,
        text: text
    };
    chapters.push(this_line_data);

    let data = {  
            image : '../assets/pointer.png',
            text : text,
            link : true, // on click, should both repoint the player and trigger an action (delegated to event) 
            start : seconds
    }

    if (! sound_CPU.point('cursors', this_line_element.id)) {
        sound_CPU.addPoint('cursors', this_line_element.id, data);
    } else {
        data.start = seconds;
        sound_CPU.editPoint('cursors', this_line_element.id, data);
    }
}

/**
 * Event into a chapter editor line
 *
 * @param      {Event}  event   The event
 */
function event_line(event) {
    let this_line_element = event.target;
    if (this_line_element.tagName !== 'P' ) {
        this_line_element = this_line_element.closest('p');
    }
    interpret_line(this_line_element);
    //interpret_form();
}

/**
 * Adds events listeners to a newly created <p> element in chapter editor
 *
 * @param      {<type>}  line    The line
 */
function add_events_line(line) {
    line.addEventListener('input', event_line);
    for (let event_name of ['change', 'click']) {
        line.addEventListener(event_name, interpret_form);
    }
}

/**
 * Render chapters in different formats : HTML, MarkDown, WikiDoku and WebVTT
 *
 * @param      {<type>}   _event  The event
 */
function interpret_form(_event) {
    let data;
    let track = document.querySelector('audio').addTextTrack("chapters");

    function prepare_export_file(text) {
        data = new Blob([text], {type: 'text/plain'});
        let textFile = window.URL.createObjectURL(data);
        return textFile;

    }

    function build_html_source() {
        let out1=[];
        let out2=[];
        for(let line of chapters) {
           out1.push(`\n\t<li><a href="#t=${line.time}">${line.text} (${convert.secondsInColonTime(line.time)})</a></li>`) 
           out2.push(`\n\t<li>${line.text} — (<a href="#t=${line.time}">${convert.secondsInColonTime(line.time)}</a>)</li>`) 
        }
        return `<ol>${out1.join('')}\n</ol>\n<p>Alternate version :</p>\n<ol>${out2.join('')}\n</ol>`;
    }

    function build_md_source() {
        let out =[];
        for(let line of chapters) {
           out.push(`\n * [${line.text}](#t=${line.time})`) 
        }
        return `${out.join('')}`;
    }

    function build_wiki_source() {
        let out =[];
        for(let line of chapters) {
           out.push(`\n  - [[#t=${line.time}|${line.text}]]`) 
        }
        return `${out.join('')}`;
    }

    function build_vtt_source() {
        let out =[];
        let number = 0;
        for(let line of chapters) {
            number++;
            let start = convert.secondsInPaddledColonTime(line.time);
            let end = convert.secondsInPaddledColonTime( number < chapters.length ? chapters[number].time : sound_element.duration );
            out.push(`\n\nchapter-${number}\n${start}.000 --> ${end}.000\n${line.text}`) 
        }
        return `WEBVTT FILE\n${out.join('')}\n`;
    }

    _event?.preventDefault();
    chapters = [];
    sound_CPU.clearPlane('cursors');

    // this segment is a bit tricky : we sort lines per their timecode, without moving them from the DOM
    // If we move them, we lose focus and cursor positions, very annoying
    function seconds_from_input(p){
        return p.dataset.time;
    }
    function compare_lines(a, b){
        return seconds_from_input(a) - seconds_from_input(b)
    }
    Array.from(list_element.querySelectorAll('p')).sort(compare_lines).forEach((l) => { interpret_line(l, true); });

    let html_source =  build_html_source();
    if (chapters.length === 0) {
        // empty list
        return;
    }
    document.getElementById('html_out').innerHTML = html_source;
    document.getElementById('html_source').innerText =  html_source;
    document.querySelector('#html_source').open = true;
    document.getElementById('md_source').innerText = build_md_source();
    document.getElementById('wiki_source').innerText = build_wiki_source();
    let vtt = build_vtt_source();
    document.getElementById('vtt_source').innerText = vtt;
    let vtt_virtual_file = prepare_export_file(vtt);
    document.getElementById('vtt_source_download').href = vtt_virtual_file;
    document.getElementById('vtt_source_download').download = sound_element.dataset.title.replace(/(.*)(\.(ogg|mp3|wav|flac|mp4|aac))$/,'$1') + '.vtt';
    document.querySelector('#vtt_source').open = true;
}

document.addEventListener('DOMContentLoaded', e => {
    document.location.hash = '#';

    sound_element = document.getElementById('sound');
    list_element = document.getElementById('list');

    edit_source_audio_element = document.getElementById('source_audio');
    edit_source_waveform_element = document.getElementById('source_waveform');
    edit_source_webvtt_element = document.getElementById('source_webvtt');

    /* Settings */
    edit_source_audio_element.addEventListener('change', set_source_audio);
    edit_source_waveform_element.addEventListener('change', set_source_audio);
    edit_source_webvtt_element.addEventListener('change', set_source_audio);
    document.querySelector('#configure').addEventListener('submit', check_configure);

    /* Building addedd events into CPU-audio panels */
    document.addEventListener('CPU_drawPoint', CPU_drawPoint);

    /* Chapter editor */
    add_events_line(document.querySelector('p.line'));
    new_chapter_line = document.querySelector('p.line').innerHTML;
    document.getElementById('add').addEventListener('click', add_line);
    list_element.addEventListener('click', check_for_actions);


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
    sound_CPU.addPlane('cursors', 'Chapters preview', {track : 'cursors', panel : true});
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
    `);
});
