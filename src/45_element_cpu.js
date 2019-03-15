let CPU_element_api = class {
    constructor(element, container_interface) {
        // I hate this style. I rather prefer the object notation
        this.element = element;
        this.elements = {};
        this.audiotag = element._audiotag;
        this.container = container_interface;
        this.mode_when_play = null;
    }

    set_mode_container(mode) {
        mode = mode !== null ? mode : 'default';
        this.container.classList.remove(`mode-${this.mode_was}`);
        this.mode_was = mode;
        this.container.classList.add(`mode-${mode}`);
    }

    set_act_container(act) {
        this.container.classList.remove(
            'act-loading',
            'act-pause',
            'act-play'
            );
        this.container.classList.add(`act-${act}`);
    }
    set_hide_container(hide_elements) {
        for (let hide_this of acceptable_hide_atttributes) {
            this.container.classList.remove(`hide-${hide_this}`)
        }

        for (let hide_this of hide_elements) {
            hide_this = hide_this.toLowerCase();
            if (acceptable_hide_atttributes.indexOf(hide_this)>-1) {
                this.container.classList.add(`hide-${hide_this}`)
            }
        }
    }

    update_playbutton() {
        let audiotag = this.audiotag;
        if (audiotag.readyState < audiotag.HAVE_CURRENT_DATA ) {
            this.set_act_container('loading');
            return;
        }

        this.set_act_container(audiotag.paused ? 'pause' : 'play');

        if ((!audiotag.paused) && (this.mode_when_play !== null)) {
            this.set_mode_container(this.mode_when_play);
            this.mode_when_play = null;
        }
    }
    update_line(type, seconds) {
        // type = 'elapsed', 'loading'
        let duration = this.audiotag.duration;
        this.elements[`${type}line`].style.width = duration === 0
                                                ? 0
                                                : `${100*seconds / duration}%`;
    }
    update_buffered() {
        let end = 0;
        let buffered  = this.audiotag.buffered ;
        for (let segment=0 ; segment++; segment < buffered.length) {
            end = buffered.end(segment);
        }
        this.update_line('elapsed', end);
    }
    update_time(event) {
        let audiotag = this.audiotag;
        let timecode = Math.floor(audiotag.currentTime);
        let canonical = audiotag.dataset.canonical;
        canonical = canonical === undefined ? '' : canonical;
        let link_to = absolutize_url(canonical)+'#';
        link_to += ((canonical.indexOf('#') === -1) ? audiotag.id : canonical.substr(canonical.indexOf('#')+1) )+'&';
        link_to += 't='+timecode;

        let elapse_element = this.elements['elapse'];
        elapse_element.href = link_to;

        let total_duration = '…';
        if (!isNaN(Math.round(audiotag.duration))){
            total_duration = convert.SecondsInColonTime(Math.round(audiotag.duration));
        } 
         
        let colon_time = convert.SecondsInColonTime(audiotag.currentTime);
        elapse_element.innerHTML = `${colon_time}<span class="notiny"> / ${total_duration}</span>`;

        let inputtime_element = this.elements['inputtime'];
        // How to check a focused element ? document.activeElement respond the webcomponent tag :/ You must call shadowRoot.activeElement
        if (!inputtime_element.isEqualNode(this.element.shadowRoot.activeElement)) {
            inputtime_element.value = convert.SecondsInPaddledColonTime( audiotag.currentTime );  // yes, this SHOULD be in HH:MM:SS format precisely
        }
        inputtime_element.max = convert.SecondsInPaddledColonTime(audiotag.duration);
        this.update_line('loading', audiotag.currentTime);
        this.update_buffered();
    }
    update_time_borders() {
        let audiotag = this.audiotag;
        if ((!document.CPU.is_audiotag_global(audiotag)) || (trigger._timecode_end === false)) {
            this.elements['points'].style.opacity = 0;
            return;
        }
        this.elements['points'].style.opacity = 1;
        // UGLY to rewrite
        this.elements['pointstart'].style.left = `calc(${100 * trigger._timecode_start / audiotag.duration}% - 4px)`;
        this.elements['pointend'].style.left = `calc(${100 * trigger._timecode_end / audiotag.duration}% + 0px)`;

    }
    update_loading(seconds) {
        this.update_line('loading', seconds);
        this.set_act_container('loading');
    }
    update_error() {
        // NOTE : this is not working, even on non supported media type
        // Chrome logs an error « Uncaught (in promise) DOMException: Failed to load because no supported source was found. »
        // but don't update message
        let audiotag = this.audiotag;
        if (audiotag.error !== null) {
            let error_message;
            let pageerror = this.elements['pageerror'];
            this.show_interface('error');
            switch (audiotag.error.code) {
                case audiotag.error.MEDIA_ERR_ABORTED:
                    error_message = __.media_err_aborted;
                    break;
                case audiotag.error.MEDIA_ERR_NETWORK:
                    error_message = __.media_err_network;
                    break;
                case audiotag.error.MEDIA_ERR_DECODE:
                    error_message = __.media_err_decode;
                    break;
                case audiotag.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    error_message = __.media_err_src_not_supported;
                    break;
                default:
                    error_message = __.media_err_unknow;
                    break;
            }
            pageerror.innerText = error_message;
            return true;
        }
        return false;
    }
    update() {
        if (!this.update_error()) {
            this.update_playbutton();
            this.update_time();
            this.update_time_borders();
        }
    }

    show_throbber_at(seeked_time) {
        if (this.audiotag.duration < 1) {
            // do not try to show if no metadata
            return;
        }
        let phylactere = this.elements['popup'];
        let elapse_element = this.elements['line'];

        phylactere.style.opacity = 1;
        phylactere.style.left = (100 * seeked_time / this.audiotag.duration) +'%';
        phylactere.innerHTML = convert.SecondsInColonTime(seeked_time);
    }
    hide_throbber(that) {
        that = that === undefined ? this : that;
        let phylactere = that.elements['popup'];
        phylactere.style.opacity = 0;
    }
    hide_throbber_later() {
        let phylactere = this.elements['popup'];
        if (phylactere._hider) {
            window.clearTimeout(phylactere._hider);
        }
        phylactere._hider = window.setTimeout(this.hide_throbber, 1000, this);
    }

    preview(_timecode_start, _timecode_end, _chapter_id) {
        let mode = !isNaN(_timecode_start);
        let classlist = this.elements['interface'].classList;
        let classname = 'with-preview';
        let chaptersline = this.elements['chaptersline'];
        let previous_segment = chaptersline.querySelector('.'+classname);
        if (previous_segment) {
            previous_segment.classList.remove(classname);
        }
        if (mode) {
            classlist.add(classname);
            document.CPU.previewed = this.audiotag.id;
        } else {
            classlist.remove(classname);
            document.CPU.previewed = null;
            return ;
        }

        let audiotag_duration = this.audiotag.duration;
        let element = this.elements['preview'];
        element.style.left = `${100 * _timecode_start / audiotag_duration}%`;
        _timecode_end = _timecode_end === undefined ? audiotag_duration : _timecode_end;
        element.style.right = `${100- 100 *( _timecode_end / audiotag_duration) }%`;

        let segment = chaptersline.querySelector('#segment-'+_chapter_id);
        if (segment) {
            segment.classList.add(classname);
        }
    }

    fetch_audiotag_dataset() {
        let dataset = {} 
        for (let key in document.CPU.default_dataset) {
            let value = null;
            if (key in this.audiotag.dataset) {
                value = this.audiotag.dataset[key];
            } else {
                if (document.CPU.default_dataset[key] !== null) {
                    value = document.CPU.default_dataset[key];
                }
            }
            dataset[key] = value === undefined ? null : value;
        }
        return dataset;
    }

    update_links() {
        let container = this;
        function ahref(category, href) {
            container.elements[category].href = href;
        }
        function remove_hash(canonical) {
            let hash_at = canonical.indexOf('#');
            return hash_at === -1 ? canonical : canonical.substr(0,hash_at);
        }

        let dataset = this.fetch_audiotag_dataset();

        let url = (dataset.canonical === null ? '' : remove_hash(dataset.canonical))
                    + `#${this.audiotag.id}` 
                    + ( this.audiotag.currentTime === 0 
                            ? ''
                            : `&t=${Math.floor(this.audiotag.currentTime)}`
                        );

        let _url = encodeURI(absolutize_url(url));
        let _twitter = '';
        if (
            (dataset.twitter) && /* a little bit better than `dataset.twitter === null` or `typeof dataset.twitter === 'string'` . but really, “a little bit” */
            (dataset.twitter[0]==='@') /* why did I want an @ in the attribute if I cut it in my code ? to keep HTML readable and comprehensible, instead to developpe attribute name into a "twitter-handler" */
            ) {
            _twitter = `&via=${dataset.twitter.substring(1)}`;
        }
        ahref('twitter', `https://twitter.com/share?text=${dataset.title}&url=${_url}${_twitter}`);
        ahref('facebook', `https://www.facebook.com/sharer.php?t=${dataset.title}&u=${_url}`);
        ahref('email', `mailto:?subject=${dataset.title}&body=${_url}`);
        ahref('link', this.audiotag.currentSrc);
    }

    show_interface(mode) {
        this.container.classList.remove('show-main', 'show-share', 'show-error');
        this.container.classList.add('show-'+mode);
    }
    show_actions(event) {
        let container = (event !== undefined) ?
                document.CPU.find_container(event.target) :
                this;
        container.show_interface('share');
        container.update_links();
    }
    show_main(event) {
        let container = (event !== undefined) ?
                document.CPU.find_container(event.target) :
                this;
        container.show_interface('main');
    }

    show_handheld_nav(event) {
        let container = (event !== undefined) ?
                document.CPU.find_container(event.target) :
                this;
        container.container.classList.toggle('show-handheld-nav');
        event.preventDefault();
    }

    add_id_to_audiotag() {
        if (this.audiotag.id === '') {
            this.audiotag.id = document.CPU.dynamicallyAllocatedIdPrefix + String(document.CPU.count_element++);
        }
    }

    complete_template() {
        let dataset = this.fetch_audiotag_dataset();
        let element_canonical = this.elements['canonical'];

        element_canonical.href = dataset.canonical;

        if (dataset.title === null) {
            element_canonical.classList.add('untitled')
            dataset.title = __.untitled
        } else {
            element_canonical.classList.remove('untitled')
        }
        element_canonical.innerText = dataset.title; 
        this.elements['poster'].src = dataset.poster;
    }
    attach_audiotag_to_controller(audiotag) {
        if (!audiotag) {
            return;
        }
        this.audiotag = audiotag;

        this.add_id_to_audiotag()
        this.complete_template();

        // throw simplified event
        trigger.update({target : audiotag});
    }
    _cuechange_event(event) {
        // ugly, but best way to catch the DOM element, as the `cuechange` event won't give it to you via `this` or `event`

        // this junk to NOT repaint 4 times the same active chapter
        try {

            let activecue;
            activecue = event.target.activeCues[0];
            if (Object.is(activecue, this._activecue)) {
                return ;
            }
            this._activecue = activecue;
            // do NOT tell me this is ugly, i know this is ugly. I missed something better
        } catch (error) {

        }

        trigger.cuechange(event, this.elements['interface']);
    }
    build_chapters(event) {
        let self = this;

        let audiotag = this.audiotag;
        if (event !== undefined) {
            // Chrome load <track> afterwards, so an event is needed, and we need to recatch our CPU api to this event
            self = document.CPU.find_container(event.target);
            if (self === null) {
                // not yet ready, should not occurs
                error('Container CPU- not ready yet. WTF ?');
            }
        }

        let chapters_element = self.elements['chapters'];
        chapters_element.innerHTML = '';
        let lines_element = self.elements['chaptersline'];
        lines_element.innerHTML = '';
        
        let has = false;

        if ((audiotag) && (audiotag.textTracks) && (audiotag.textTracks.length > 0)) {
            for (let tracks of audiotag.textTracks) {
                // TODO : we have here a singular problem : how to NOT rebuild the chapter lists, being sure to have the SAME cues and they are loaded, as we may have FOUR builds.
                // Those multiple repaint events doesn't seem to have so much impact, but they are awful, unwanted and MAY have an impact
                // We must find a way to clean it up or not rebuild for SAME tracks, AND remove associated events 
                // AND clean up the chapter list if a new chapter list is loaded and really empty
                if (
                    (tracks.kind.toLowerCase() === 'chapters') &&
                    (tracks.cues !== null) /*&&
                    (!Object.is(self._chaptertracks, tracks))*/) {

                    // window.console.log({ s: self._chaptertracks , t: tracks , l:tracks.cues.length ,c: Object.is(self._chaptertracks, tracks)})
                    // self._chaptertracks = tracks;

                    let _cuechange_event = self._cuechange_event.bind(self);
                    tracks.removeEventListener('cuechange', _cuechange_event);
                    // adding chapter changing event
                    tracks.addEventListener('cuechange', _cuechange_event);

                    for (let cue of tracks.cues) {
                        let cuepoint = Math.floor(cue.startTime);
                        let cuetime = convert.SecondsInColonTime(cue.startTime);
                        let href = `#${audiotag.id}&t=${cuepoint}`;

                        /* list */

                        let line = document.createElement('li');
                        line.id  = cue.id;
                        line.classList.add('cue');
                        line.innerHTML = 
                            `<a href="${href}" tabindex="0">`+
                                `<strong>${cue.text}</strong>`+
                                `<span>${cuetime}</span>`+
                            `</a>`;
                        chapters_element.append(line);

                        line.dataset.cueId = cue.id; 
                        line.dataset.cueStartTime = cuepoint; 
                        line.dataset.cueEndTime = Math.floor(cue.endTime);

                        /* line */
                        let segment = document.createElement('a');
                        segment.id  = 'segment-'+cue.id;
                        segment.href  = href;
                        segment.title  = cue.text;
                        segment.tabIndex = '-1';
                        segment.style.left = `${100 * (cue.startTime / audiotag.duration)}%`;
                        segment.style.right = `${100 - 100 *( cue.endTime / audiotag.duration)}%`;
                        lines_element.append(segment);
                    }

                    if (tracks.cues.length > 0) {
                        has = true;
                    }
                }
            }

        }

        if (self.element.tagName === CpuAudioTagName) {
            if (has) {
                // indicate in host page that audio tag chapters are listed
                // see https://github.com/dascritch/cpu-audio/issues/36
                document.body.classList.add(`cpu_tag_«${audiotag.id}»_chaptered`);
            }

            if (
                (document.CPU.global_controller !== null) &&
                (audiotag.isEqualNode(document.CPU.global_controller.audiotag))
                ) {
                document.CPU.global_controller.build_chapters();
            }
        }

    }
    build_playlist() {
        // Note that ONLY the global controller will display the playlist. For now.

        let playlist_element = this.elements['playlist'];
        playlist_element.innerHTML = '';

        let current_playlist = document.CPU.find_current_playlist();
        if (current_playlist === null) {
            return;
        }

        for (let audiotag_id of current_playlist) {
            let audiotag = document.getElementById(audiotag_id);
            
            let line = document.createElement('li');
            line.classList.add('cue');

            if (audiotag_id === this.audiotag.id) {
                line.classList.add('active-cue');
            }
            line.innerHTML = `<a href="#${audiotag.id}&t=0" tabindex="0">`+
                                `<strong>${audiotag.dataset.title}</strong>`+
                            `</a>`;
            playlist_element.append(line);
        }

    }
    build_controller() {

        this.element.classList.add(this.classname);
        //this.tabIndex = 0 // see http://snook.ca/archives/accessibility_and_usability/elements_focusable_with_tabindex and http://www.456bereastreet.com/archive/201302/making_elements_keyboard_focusable_and_clickable/

        // the following mess is to simplify sub-element declaration and selection
        let controller = this;
        querySelector_apply('[id]', function (element) {
            controller.elements[element.id] = element;
        }, this.element.shadowRoot);
        this.elements['poster'].addEventListener('load', function () {
            controller.elements['interface'].classList.add('poster-loaded'); 
        });

        let passive_ev = {passive: true};

        let cliquables = {
            'pause'     : trigger.play,
            'play'      : trigger.pause,
            'time'      : trigger.throbble,
            'actions'   : this.show_actions,
            'back'      : this.show_main,
            'poster'    : this.show_main,
            // handheld nav. To allow repetition , we will move it to keypress later
            'restart'   : trigger.restart,
            'fastreward': trigger.fastreward,
            'reward'    : trigger.reward,
            'foward'    : trigger.foward,
            'fastfoward': trigger.fastfoward,
        };
        for (let that in cliquables) {
            this.elements[that].addEventListener('click', cliquables[that]);
        }
        // key management
        this.element.addEventListener('keydown', trigger.key);

        // not working correctly :/
        this.elements['control'].addEventListener('keydown', trigger.keydownplay);
        // throbber management
        let timeline_element = this.elements['time'];
        let do_events = {
            'mouseover' : true,
            'mousemove' : true,
            'mouseout'  : false,

            'touchstart'  : true,
            // 'touchmove'   : true,
            'touchend'    : false,
            'touchcancel' : false,
        }
        for (let event_name in do_events) {
            timeline_element.addEventListener(
                event_name,
                do_events[event_name] ? trigger.hover : trigger.out, passive_ev);
        }
        // alternative ime navigation for handhelds
            timeline_element.addEventListener('touchstart', trigger.touchstart, passive_ev);
            timeline_element.addEventListener('touchend', trigger.touchcancel, passive_ev);
            timeline_element.addEventListener('contextmenu', this.show_handheld_nav );
            this.elements['inputtime'].addEventListener('input', trigger.input_time_change);
            this.elements['inputtime'].addEventListener('change', trigger.input_time_change);

        this.show_main();
        this.build_chapters();
        let this_build_chapters = this.build_chapters.bind(this);
        // sometimes, we MAY have loose loading
        this.audiotag.addEventListener('loadedmetadata', this_build_chapters, passive_ev);
        
        let track_element = this.audiotag.querySelector('track[kind="chapters"]');
        if (track_element) {
            track_element.addEventListener('load', this_build_chapters, passive_ev);
        }
        

        let chapters_element = this.elements['chapters'];

        chapters_element.addEventListener('mouseover', trigger.preview_container_hover, passive_ev);
        chapters_element.addEventListener('focusin', trigger.preview_container_hover, passive_ev);
        let preview_bind = this.preview.bind(this);
        chapters_element.addEventListener('mouseleave', preview_bind, passive_ev);
        chapters_element.addEventListener('focusout', preview_bind, passive_ev);
    }
};