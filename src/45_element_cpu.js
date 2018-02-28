let CPU_element_api = class {
    constructor(element, container_interface) {
        // I hate this style. I rather prefer the object notation
        this.element = element;
        this.elements = {};
        this.audiotag = element._audiotag;
        this.container = container_interface;
    }

    update_act_container(act) {
        this.container.classList.remove(
            'act-loading',
            'act-pause',
            'act-play'
            );
        this.container.classList.add(`act-${act}`);
    }
    update_playbutton() {
        if (this.audiotag.readyState < this.audiotag.HAVE_CURRENT_DATA ) {
            this.update_act_container('loading');
            return;
        }

        this.update_act_container(this.audiotag.paused ? 'pause' : 'play');
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
        let timecode = Math.floor(this.audiotag.currentTime);
        let canonical = this.audiotag.dataset.canonical;
        canonical = canonical === undefined ? '' : canonical;
        let link_to = absolutize_url(canonical)+'#';
        link_to += ((canonical.indexOf('#') === -1) ? this.audiotag.id : canonical.substr(canonical.indexOf('#')+1) )+'&';
        link_to += 't='+timecode;

        let elapse_element = this.elements['elapse'];
        elapse_element.href = link_to;

        let total_duration = '…';
        if (!isNaN(Math.round(this.audiotag.duration))){
            total_duration = convert.SecondsInColonTime(Math.round(this.audiotag.duration));
        } 
         
        let colon_time = convert.SecondsInColonTime(this.audiotag.currentTime);
        elapse_element.innerHTML = `${colon_time}<span class="notiny"> / ${total_duration}</span>`;

        // How to check a focused element ? document.activeElement respond the webcomponent tag :/ You must call shadowRoot.activeElement
        if (!this.elements.inputtime.isEqualNode(this.element.shadowRoot.activeElement)) {
            this.elements.inputtime.value = convert.SecondsInPaddledColonTime( this.audiotag.currentTime );  // yes, this SHOULD be in HH:MM:SS format precisely
        }
        this.elements.inputtime.max = convert.SecondsInPaddledColonTime(this.audiotag.duration);
        this.update_line('loading', this.audiotag.currentTime);
        this.update_buffered();
    }
    update_time_borders() {
        if ((!document.CPU.is_audiotag_global(this.audiotag)) || (trigger._timecode_end === false)) {
            this.elements.points.style.opacity = 0;
            return;
        }
        this.elements.points.style.opacity = 1;
        // UGLY to rewrite
        this.elements.pointstart.style.left = `calc(${100 * trigger._timecode_start / this.audiotag.duration}% - 4px)`;
        this.elements.pointend.style.left = `calc(${100 * trigger._timecode_end / this.audiotag.duration}% + 0px)`;

    }
    update_loading(seconds) {
        this.update_line('loading', seconds);
        this.update_act_container('loading');
    }
    update_error() {
        // NOTE : this is not working, even on non supported media type
        // Chrome logs an error « Uncaught (in promise) DOMException: Failed to load because no supported source was found. »
        // but don't update message
        if (this.audiotag.error !== null) {
            let error_message;
            let pageerror = this.elements['pageerror'];
            this.show_interface('error');
            switch (this.audiotag.error.code) {
                case this.audiotag.error.MEDIA_ERR_ABORTED:
                    error_message = __.media_err_aborted;
                    break;
                case this.audiotag.error.MEDIA_ERR_NETWORK:
                    error_message = __.media_err_network;
                    break;
                case this.audiotag.error.MEDIA_ERR_DECODE:
                    error_message = __.media_err_decode;
                    break;
                case this.audiotag.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
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

    preview(_timecode_start, _timecode_end) {
        let mode = _timecode_start !== undefined;
        let classlist = this.elements['interface'].classList;
        let classname = 'with-preview';
        if (mode) {
            classlist.add(classname);
            document.CPU.previewed = this.audiotag.id;
        } else {
            document.CPU.previewed = null;
            classlist.remove(classname);
            return ;
        }

        let element = this.elements['preview'];
        element.style.left = `${100 * _timecode_start / this.audiotag.duration}%`;
        _timecode_end = _timecode_end === undefined ? this.audiotag.duration : _timecode_end;
        element.style.right = `${100-100 * _timecode_end / this.audiotag.duration}%`;

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

        this.elements['canonical'].href = dataset.canonical;

        if (dataset.title === null) {
            this.elements['canonical'].classList.add('untitled')
            dataset.title = __.untitled
        } else {
            this.elements['canonical'].classList.remove('untitled')
        }
        this.elements['canonical'].innerText = dataset.title; 
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
        trigger.update({target : this.audiotag});
    }
    build_chapters(event) {
        let self = this;
        if (event !== undefined) {
            // Chrome load <track> afterwards, so an event is needed, and we need to recatch our CPU api to this event
            self = document.CPU.find_container(event.target);
        }

        let chapters_element = self.elements['chapters'];
        chapters_element.innerHTML = '';
        if ((!self.audiotag) || (!self.audiotag.textTracks) || (self.audiotag.textTracks.length === 0)) {
            return;
        }


        for (let tracks of self.audiotag.textTracks) {
            if ((tracks.kind.toLowerCase() === 'chapters') && (tracks.cues !== null)) {
                tracks.addEventListener('cuechange', function (event) {
                    // ugly, but best way to catch the DOM element, as the `cuechange` event won't give it to you via `this` or `event`
                    trigger.cuechange(event, chapters_element);
                });
                for (let cue of tracks.cues) {
                    let line = document.createElement('li');
                    line.id  = cue.id;
                    line.classList.add('cue');
                    let cuepoint = Math.floor(cue.startTime);
                    let cuetime = convert.SecondsInColonTime(cue.startTime);
                    line.innerHTML = 
                        `<a href="#${self.audiotag.id}&t=${cuepoint}" tabindex="0">`+
                            `<strong>${cue.text}</strong>`+
                            `<span>${cuetime}</span>`+
                        `</a>`;
                    chapters_element.append(line);

                    line.dataset.cueId = cue.id; 
                    line.dataset.cueStartTime = cuepoint; 
                    line.dataset.cueEndTime = Math.floor(cue.endTime);
                }
            }
        }

        if (
            (self.element.tagName === CpuAudioTagName) &&
            (document.CPU.is_audiotag_playing(self.audiotag)) &&
            (document.CPU.global_controller !== null)) {
            document.CPU.global_controller.build_chapters();
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
        querySelector_apply('[id]', function(element){
            controller.elements[element.id] = element;
        }, this.element.shadowRoot);

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
                do_events[event_name] ? trigger.hover : trigger.out, {passive: true});
        }
        // alternative ime navigation for handhelds
            timeline_element.addEventListener('touchstart', trigger.touchstart, {passive:true});
            timeline_element.addEventListener('touchend', trigger.touchcancel, {passive: true});
            timeline_element.addEventListener('contextmenu', this.show_handheld_nav );
            this.elements['inputtime'].addEventListener('input', trigger.input_time_change);
            this.elements['inputtime'].addEventListener('change', trigger.input_time_change);

        this.show_main();
        this.build_chapters();

        let chapters_element = this.elements['chapters'];

        chapters_element.addEventListener('mouseover', trigger.preview_container_hover)
        chapters_element.addEventListener('focusin', trigger.preview_container_hover)
        chapters_element.addEventListener('mouseleave', this.preview_chapter)
        chapters_element.addEventListener('focusout', trigger.preview_container_hover)
    }
};