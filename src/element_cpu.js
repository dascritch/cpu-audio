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
            end = buffered.end(segment)
        }
        this.update_line('elapsed', end);
    }
    update_time(event) {
        let timecode = convert.SecondsInTime(this.audiotag.currentTime);
        let link_to = absolutize_url(this.audiotag.dataset.canonical)+'#';
        link_to += this.audiotag.id ? (this.audiotag.id+'&') : '';
        link_to += 't='+timecode;

        let elapse_element = this.elements['elapse'];
        elapse_element.href = link_to;

        let total_duration = '…';
        if (!isNaN(Math.round(this.audiotag.duration))){
            total_duration = convert.SecondsInColonTime(Math.round(this.audiotag.duration));
        } 
         
        elapse_element.innerHTML = `${convert.SecondsInColonTime(this.audiotag.currentTime)}
                                    <span class="notiny"> / ${total_duration}</span>`;
        this.update_line('loading', this.audiotag.currentTime);
        this.update_buffered();
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

    fetch_audiotag_dataset() {
        let dataset = {} 
        for (let key in CPU_Audio.default_dataset) {
            let value = null;
            if (key in this.audiotag.dataset) {
                value = this.audiotag.dataset[key];
            } else {
                if (CPU_Audio.default_dataset[key] !== null) {
                    value = CPU_Audio.default_dataset[key];
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
                            : `&t=${convert.SecondsInTime(this.audiotag.currentTime)}`
                        );

        let _url = encodeURI(absolutize_url(url));
        let _twitter = '';
        if (
            (dataset.twitter) && /* a little bit better than dataset.twitter === null or typeof dataset.twitter === 'string' . but really, “a little bit” */
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
                CPU_Audio.find_container(event.target) :
                this;
        container.show_interface('share');
        container.update_links();
    }
    show_main(event) {
        let container = (event !== undefined) ?
                CPU_Audio.find_container(event.target) :
                this;
        container.show_interface('main');
    }

    add_id_to_audiotag() {
        if (this.audiotag.id === '') {
            this.audiotag.id = CPU_Audio.dynamicallyAllocatedIdPrefix + String(CPU_Audio.count_element++);
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
            self = CPU_Audio.find_container(event.target);
        }

        /*
        if (self.element.tagName !== CpuAudioTagName) {
            // we will only build (now) the chapter list for <cup-audio>
            return;
        }
        */

        let chapters_element = self.elements['chapters'];
        chapters_element.innerHTML = '';
        if ((!self.audiotag.textTracks) || (self.audiotag.textTracks.length === 0)) {
            return;
        }

        for (let tracks of self.audiotag.textTracks) {
            
            if ((tracks.kind === 'chapters') && (tracks.cues !== null)) {
                tracks.addEventListener('cuechange', function(event) {
                    // ugly, but best way to catch the DOM element
                    trigger.cuechange(event, chapters_element);
                });
                for (let cue of tracks.cues) {
                    let line = document.createElement('li');
                    line.id  = cue.id;
                    line.classList.add('cue');
                    let cuepoint = convert.SecondsInTime(cue.startTime);
                    let cuetime = convert.SecondsInColonTime(cue.startTime);
                    line.innerHTML = `<a href="#${self.audiotag.id}&t=${cuepoint}" tabindex="0">
                                        <strong>${cue.text}</strong>
                                        <span>${cuetime}</span>
                                    </a>`;
                    self.elements['chapters'].append(line);
                }
            }
        }

        if ((CPU_Audio.current_audiotag_playing !== null) && (self.audiotag.id === CPU_Audio.current_audiotag_playing.id) && (CPU_Audio.global_controller !== null)) {
            CPU_Audio.global_controller.build_chapters();
        }

    }
    build_controller() {

        this.element.classList.add(this.classname);
        //this.tabIndex = 0 // see http://snook.ca/archives/accessibility_and_usability/elements_focusable_with_tabindex and http://www.456bereastreet.com/archive/201302/making_elements_keyboard_focusable_and_clickable/

        // the following mess is to simplify sub element declaration and selection
        let controller = this;
        querySelector_apply('*', function(element){
            element.classList.forEach(function(this_class) {
                if (controller.elements[this_class] === undefined) {
                    controller.elements[this_class] = element;
                }
            });
        }, this.element.shadowRoot);

        let cliquables = {
            'pause'     : trigger.play,
            'play'      : trigger.pause,
            'time'      : trigger.throbble,
            'actions'   : this.show_actions,
            'back'      : this.show_main,
            'poster'    : this.show_main,
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
        for(let event_name in do_events) {
            timeline_element.addEventListener(
                event_name,
                do_events[event_name] ? trigger.hover : trigger.out);               
        }
        this.show_main();
        this.build_chapters();
    }
};