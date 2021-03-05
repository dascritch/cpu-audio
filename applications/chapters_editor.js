/**

TODO
- draggable cursor . some primitive "nearly" ready for release
- regression cpu controller => player
- click on the timeline to create a point
- export .csv 

**/


var new_chapter_line;
var sound_element, component_element, list_element, edit_source_audio_element, edit_source_waveform_element, edit_source_webvtt_element;
var sound_CPU;
var line_number = 1;

var chapters = [];
var cues = [];

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
    sound_element.dataset.title = decodeURIComponent(url.replace(/(^.*\/)([^\/]+)/,'$2'));
    sound_element.dataset.waveform = edit_source_waveform_element.value;

    if ( (edit_source_webvtt_element.value !== '') && (track_element.src !== edit_source_webvtt_element.value) )  {
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
    return document.CPU.convert.SecondsInPaddledColonTime(sound_element.currentTime);
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
    line.querySelector('.timecode_input').value = time_value ? document.CPU.convert.SecondsInPaddledColonTime(time_value) : currentTime_in_colon();
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
                document.CPU.jumpIdAt('sound', document.CPU.convert.TimeInSeconds(this_line_time_element.value));
                break ;
            case 'set' : 
                this_line_time_element.value = currentTime_in_colon();
                interpret_line(this_line_element);
                break ;
            case 'remove' :
                sound_CPU.remove_point('cursors', this_line_element.id);
                this_line_element.remove();
                event.preventDefault();
                break ;
        }
    }
}

/**
 * Hide all lines of the chapters editor, show only the one focused
 *
 * @param      {string}  point_name  The point name to show
 * note : a second parameter (event) is added due to eventListener, but is ignored
 */
function show_only_line(point_name) {
    Array.from(
        document.querySelectorAll('p.line')
        ).forEach( (element) => {
            element.classList.remove('editing');
        });
    let active_line = document.getElementById(point_name) ;
    if (active_line) {
        active_line.classList.add('editing');
        active_line.querySelector('input[type="text"]').focus();
    }
}

function cursor_hover(point_name) {
    let data = component_element.CPU.get_point('cursors', point_name);
    component_element.CPU.show_throbber_at(data.start);
}

function cursor_out(point_name) {
    component_element.CPU.hide_throbber();
}

/* not yet ready
let initial_x;
let x_offset = 0;
let clicked_a;
let clicked_track;
function drag_start(event) {
    initial_x = event.clientX - x_offset;
    let clicked_point = event.originalTarget;
    clicked_a = clicked_point.tagName === 'A' ? clicked_point : clicked_point.closest('a');
    clicked_track = clicked_point.closest('aside');
    let relative_x = initial_x - clicked_track.offsetLeft;

    let ratio = relative_x / clicked_track.clientWidth;
    let seeked_time = ratio * sound_element.duration;
    console.log(relative_x, seeked_time);
    component_element.CPU.show_throbber_at(seeked_time);
}

function drag(event) {
    if (!clicked_track) {
        return ;
    }
    console.log(event)
    event.preventDefault();
    current_x = event.clientX - initial_x;
    let relative_x = current_x - clicked_track.offsetLeft;
    console.log(current_x);

    let ratio = relative_x / clicked_track.clientWidth;
    let seeked_time = ratio * sound_element.duration;
    component_element.CPU.show_throbber_at(seeked_time);
}

function drag_end(event) {
    console.log(event)
    clicked_track = false;
    component_element.CPU.hide_throbber();
    current_x = event.clientX - initial_x;
    let relative_x = current_x - clicked_track.offsetLeft;

    let ratio = relative_x / clicked_track.clientWidth;
    let seeked_time = ratio * sound_element.duration;
    console.log(relative_x, seeked_time);
}
*/

/**
 * When a repaint occurs on a cpu-audio component point element, we add our events
 *
 * @class      CPU_draw_point (name)
 * @param      {<type>}  event   The event
 */
function CPU_draw_point(event) {
    // I show how you can reach CPU API from an event. Not used here, but it may helps someone digging into it
    // let  CPU_controler = event.target.CPU;

    let detail = event.detail;
    let element_point_track = detail.element_point_track;
    let element_point_panel = detail.element_point_panel;

    if ((!element_point_track) || (!element_point_panel)) {
        // May happen is phracking github pages integration
        return;
    }

    // first, we remove pre-existing events
    
    element_point_track.removeEventListener('mouseover', cursor_hover);
    element_point_track.removeEventListener('mouseout',cursor_out);
    element_point_track.removeEventListener('click', show_only_line);
    element_point_panel.removeEventListener('mouseover', cursor_hover);
    element_point_panel.removeEventListener('mouseout',cursor_out);
    element_point_panel.removeEventListener('click', show_only_line);
    /* not yet ready
        element_point_track.removeEventListener('pointerdown', drag_start);
        element_point_track.removeEventListener('pointermove', drag);
        element_point_track.removeEventListener('pointerup', drag_end);
    */
    
    // When you click on a point, we show the line editing interface
    // we bind() the function to pass its arguments. 
    element_point_track.addEventListener('mouseover', cursor_hover.bind(event, detail.point));
    element_point_track.addEventListener('mouseout',cursor_out.bind(event, detail.point));
    element_point_track.addEventListener('click', show_only_line.bind(event, detail.point));
    /* not yet ready
        element_point_track.addEventListener('pointerdown', drag_start);
        element_point_track.addEventListener('pointermove', drag);
        element_point_track.addEventListener('pointerup', drag_end);
    */
    element_point_panel.addEventListener('mouseover', cursor_hover.bind(event, detail.point));
    element_point_panel.addEventListener('mouseout',cursor_out.bind(event, detail.point));
    element_point_panel.addEventListener('click', show_only_line.bind(event, detail.point));

}

/**
 * Interpret a chapter line edited
 *
 * @param      {Element}  this_line_element  The this line element
 */
function interpret_line(this_line_element, from_interpret_form=false) {
    let time = this_line_element.querySelector('.timecode_input').value; 
    let text = this_line_element.querySelector('.text_input').value; // TODO : clean HTML , perhaps via a innerHTML ?

    if ((!from_interpret_form) && (Number(this_line_element.dataset.time) !== Number(document.CPU.convert.TimeInSeconds(time)))) {
        interpret_form();
        return ;
    }

    this_line_element.dataset.time = document.CPU.convert.TimeInSeconds(time);
    if ( (time === '') && (text === '') ) {
        // no time code ? no text ? do not record it yet
        return ;
    }

    let seconds = Math.floor(document.CPU.convert.TimeInSeconds( time ));
    
    let this_line_data = {
        code: time,
        time: seconds,
        text: text
    };
    chapters.push(this_line_data);

    let data = {  
            'image' : '../assets/pointer.png',
            'text' : text,
            'link' : true, // on click, should both repoint the player and trigger an action (delegated to event) 
            'start' : seconds
    }

    if (! sound_CPU.get_point('cursors', this_line_element.id)) {
        sound_CPU.add_point('cursors', seconds, this_line_element.id, data);
    } else {
        data.start = seconds;
        sound_CPU.edit_point('cursors', this_line_element.id, data);
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
           out1.push(`\n\t<li><a href="#t=${line.time}">${line.text} (${document.CPU.convert.SecondsInColonTime(line.time)})</a></li>`) 
           out2.push(`\n\t<li>${line.text} — (<a href="#t=${line.time}">${document.CPU.convert.SecondsInColonTime(line.time)}</a>)</li>`) 
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
            let start = document.CPU.convert.SecondsInPaddledColonTime(line.time);
            let end = document.CPU.convert.SecondsInPaddledColonTime( number < chapters.length ? chapters[number].time : sound_element.duration );
            out.push(`\n\nchapter-${number}\n${start}.000 --> ${end}.000\n${line.text}`) 
        }
        return `WEBVTT FILE\n${out.join('')}\n`;
    }

    if (_event) {
        _event.preventDefault();
    }
    chapters = [];
    sound_CPU.clear_plane('cursors');

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
    document.location.hash = '#configure';

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
    document.addEventListener('CPU_draw_point', CPU_draw_point);

    /* Chapter editor */
    add_events_line(document.querySelector('p.line'));
    new_chapter_line = document.querySelector('p.line').innerHTML;
    document.getElementById('add').addEventListener('click', add_line);
    list_element.addEventListener('click', check_for_actions);
});

document.addEventListener('CPU_ready', e => {
    // sometimes not fired, so we needed a "ready" event
    component_element = e.target;

    let sound_element = document.getElementById('sound'); // We may have DOMContentLoaded after CPU_ready :/

    sound_CPU = sound_element.CPU_controller().CPU;
    sound_CPU.add_plane('cursors', 'Chapters preview', {track : 'cursors', panel : true});
    sound_CPU.inject_css('cursors', `
        .cursors {
            left: -6px;
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