(function(){

'use strict';

const thisDoc = (document._currentScript || document.currentScript).ownerDocument;

let template, shadow_element;

const CpuAudioTagName = 'CPU-AUDIO';
const CpuControllerTagName = 'CPU-CONTROLLER';
const selector_interface = '.interface';

const cpu_i18n = {
    'untitled' : '(sans titre)',
    'cover' : 'pochette',
    'more' : 'Partager',
    'twitter' : 'Partager sur Twitter',
    'facebook' : 'Partager sur Facebook',
    'e-mail' : 'Partager par e-mail',
    'download' : 'Télécharger',
    'back' : 'Annuler',

    'media_err_aborted' : 'Vous avez annulé la lecture.',
    'media_err_network' : 'Une erreur réseau a causé l\'interruption du téléchargement.',
    'media_err_decode' : 'La lecture du sonore a été annulée suite à des problèmes de corruption ou de fonctionnalités non supportés par votre navigateur.',
    'media_err_src_not_supported' : 'Le sonore n\'a pu être chargé, soit à cause de sourcis sur le serveur, le réseau ou parce que le format n\'est pas supporté.',
    'media_err_unknow' : 'Erreur due à une raison inconnue'
};

function onDebug(callback_fx) {
    // this is needed for testing, as we now run in async tests
    if (typeof callback_fx === 'function') {
        callback_fx();
    }
}

function querySelector_apply(selector, callback, subtree) {
    subtree = subtree === undefined ? document : subtree;
    Array.from(subtree.querySelectorAll(selector)).forEach(callback);
}

function is_decent_browser_for_webcomponents() {
    return window.customElements !== undefined;
}

const convert = {
    _units : {
        'd' : 86400,
        'h' : 3600,
        'm' : 60,
        's' : 1
    },

    TimeInSeconds : function(givenTime) {
        let seconds = 0;
        if (/^\d+$/.test(givenTime)) {
            seconds = Number(givenTime);
        } else {
            seconds = (givenTime.indexOf(':') === -1) ? this.SubunitTimeInSeconds(givenTime) : this.ColonTimeInSeconds(givenTime) ;
        }
        return seconds;
    },
    SubunitTimeInSeconds : function(givenTime) {
        let seconds = 0;
        for(let key in convert._units) {
            if ( (convert._units.hasOwnProperty(key)) && (givenTime.indexOf(key) !== -1) ) {
                let atoms = givenTime.split(key);
                seconds += Number(atoms[0].replace(/\D*/g,'' )) * convert._units[key];
                givenTime = atoms[1];
            }
        }
        return seconds;
    },
    ColonTimeInSeconds : function(givenTime) {
        let seconds = 0;
        let atoms = givenTime.split(':');
        let convert = [1, 60, 3600, 86400];
        for (let pos = 0 ; pos < atoms.length ; pos++) {
            seconds += Number(atoms[pos]) * convert[((atoms.length-1) - pos)];
        }
        return seconds;
    },
    SecondsInTime : function(givenSeconds) {
        let converted = '';
        let inned = false;
        for(let key in convert._units) {
            if (convert._units.hasOwnProperty(key)) {
                let multiply = convert._units[key];
                if ((givenSeconds >= multiply) || (inned)) {
                    inned = true;
                    let digits = Math.floor(givenSeconds / multiply);
                    converted += digits + key;
                    givenSeconds -= digits * multiply;
                }
            }
        }
        return converted === '' ? '0s' : converted;
    },
    SecondsInColonTime : function(givenSeconds) {
        let converted = '';
        let inned = false;
        for(let key in convert._units) {
            if (convert._units.hasOwnProperty(key)) {
                let multiply = convert._units[key];
                if ((givenSeconds >= multiply) || (inned)) {
                    inned = true;
                    let digits = Math.floor(givenSeconds / multiply);
                    converted += (converted === '' ? '' : ':');
                    converted += ( ((digits<10) && (converted !== '')) ? '0' : '') + digits ;
                    givenSeconds -= digits * multiply;
                }
            }
        }
        if (converted.length === 1) {
            return '0:0' + converted;
        }
        if (converted.length === 2) {
            return '0:' + converted;
        } 
        
        return converted === '' ? '0:00' : converted;
    },
}

const trigger = {

    hashOrder : function(hashcode, callback_fx){
        let at_start = true;
        if (typeof hashcode !== 'string') {
            at_start = 'at_start' in hashcode;
            hashcode = location.hash.substr(1);
        }
        let hash = '';
        let timecode = '';
        let segments = hashcode.split('&');
        let autoplay = false;

        for (let _id in segments) {
            let parameter = segments[_id];
            if ((parameter.indexOf('=') === -1) && (hash === '')) {
                // should reference to the ID of the element
                hash = parameter;
            } else {
                // should be a key=value parameter
                let atoms = parameter.split('=');
                let p_key = atoms[0];
                let p_value = atoms[1];
                switch (p_key) {
                    case 't':
                        // is a time index
                        timecode = p_value;
                        // we make autoplay at requested timecode, simplier of the user
                        autoplay = true;
                        break;
                    case 'autoplay':
                        // is a card from a social network, run now
                        autoplay =  p_value === '1';
                        break;
                    case 'auto_play':
                        // is a card from a social network, run now
                        autoplay = p_value === 'true';
                        break;
                }

            }
        }

        if ((timecode === '') || ((at_start) && (!autoplay))) {
            // this is a normal anchor call. Go back to normal behaviour
            onDebug(callback_fx);
            return false;
        }

        CPU_Audio.jumpIdAt(hash, timecode, callback_fx);
        // scroll to the audio element. Should be reworked
        // window.location.hash = `#${hash}`;
        return true;
    },
    hover : function(event) {
        let container = CPU_Audio.find_container(event.target);

        let target_rect = event.target.getClientRects()[0];
        let relLeft = target_rect.left;
        let ratio = event.offsetX / event.target.clientWidth;
        let seeked_time = ratio * container.audiotag.duration;

        container.show_throbber_at(seeked_time);
    },
    out : function(event) {
        let container = CPU_Audio.find_container(event.target);
        container.hide_throbber();
    },

    throbble : function(event) {
        let at = 0;
        let container = CPU_Audio.find_container(event.target);
        let audiotag = container.audiotag;
        if (event.at !== undefined) {
            at = event.at;
        } else {
            // normal usage
            let ratio = event.offsetX  / event.target.clientWidth;
            at = ratio * audiotag.duration;
        }
        CPU_Audio.seekElementAt(audiotag, at);
        trigger.play(event);
    },
    pause : function(event, audiotag) {
        if (audiotag === undefined) {
            let target = event.target;
            audiotag = (target.tagName === 'AUDIO') ? target : CPU_Audio.find_container(target).audiotag;
        }
        audiotag.pause();
        CPU_Audio.current_audiotag_playing = null;
        window.localStorage.removeItem(audiotag.currentSrc);
    },
    play_once : function(event) {
        let audiotag = event.target;
        
        if ( (CPU_Audio.only_play_one_audiotag) && (CPU_Audio.current_audiotag_playing) && (!audiotag.isEqualNode(CPU_Audio.current_audiotag_playing)) ) {
            trigger.pause(undefined, CPU_Audio.current_audiotag_playing);
        }
        CPU_Audio.current_audiotag_playing = audiotag;
    },
    play : function(event, audiotag) {
        if (audiotag === undefined) {
            audiotag = CPU_Audio.find_container(event.target).audiotag;
        }
        if (CPU_Audio.global_controller) {
            CPU_Audio.global_controller.attach_audiotag_to_controller(audiotag);
            CPU_Audio.global_controller.audiotag = audiotag;
            CPU_Audio.global_controller.show_main();
        }
        audiotag.play();
    },
    key : function(event) {
        let container = CPU_Audio.find_container(event.target);

        function seek_relative(seconds) {
            event.at = container.audiotag.currentTime + seconds;
            container.show_throbber_at(event.at);
            trigger.throbble(event);
            container.hide_throbber_later();
        }

        switch (event.keyCode) {
            // can't use enter : standard usage
            case 27 : // esc
                CPU_Audio.seekElementAt(container.audiotag, 0);
                trigger.pause(undefined,container.audiotag);
                break;
            case 32 : // space
                container.audiotag.paused ?
                    trigger.play(undefined,container.audiotag) :
                    trigger.pause(undefined,container.audiotag);
                break;
            case 35 : // end
                CPU_Audio.seekElementAt(container.audiotag, container.audiotag.duration);
                break;
            case 36 : // home
                CPU_Audio.seekElementAt(container.audiotag, 0);
                break;
            case 37 : // ←
                seek_relative(- CPU_Audio.keymove);
                break;
            case 39 : // →
                seek_relative(+ CPU_Audio.keymove);
                break;
            default:
                return ;
        }
        event.preventDefault();
    },
    keydownplay : function(event) {
        if (event.keyCode !== 13 ) {
            return;
        } 
        let container = CPU_Audio.find_container(event.target);

        container.audiotag.paused ?
            trigger.play(undefined,container.audiotag) :
            trigger.pause(undefined,container.audiotag);
        
        event.preventDefault();
    },

    cuechange : function(event, chapters_element) {
        if (chapters_element === undefined) {
            return;
        }
        let classname = 'active-cue';
        let previous = chapters_element.querySelector(`.${classname}`);
        if (previous !== null) {
            previous.classList.remove(classname);
        }
        if (event.target.activeCues.length === 0) {
            // too early, we need to keep this case from Chrome
            return;
        }

        let cue_id = event.target.activeCues[0].id;
        chapters_element.querySelector(`#${cue_id}`).classList.add(classname);
    },

    update : function(event) {
        let audiotag = event.target;
        audiotag.CPU_update();
        if (!audiotag.paused) {
            window.localStorage.setItem(audiotag.currentSrc, String(audiotag.currentTime));
        }
    },
}

function absolutize_url(url) {
    let test_element = document.createElement('a');
    test_element.href = url;
    return test_element.href;
}

function not_screen_context() {
    return !window.matchMedia("screen").matches;
}

function prevent_link_on_same_page(event) {
    if (absolutize_url(window.location.href) !== absolutize_url(event.target.href)) {
        return ;
    }
    event.preventDefault();
}

function element_prevent_link_on_same_page(element) {
    element.addEventListener('click', prevent_link_on_same_page);
}

function _isEvent(event) {
    // is this event really triggered via a native event ?
    return event.preventDefault !== undefined;
}

const CPU_Audio = {
    // global object for global controller
    keymove : 5,
    only_play_one_audiotag : true,
    current_audiotag_playing : null,
    global_controller : null,
    dynamicallyAllocatedIdPrefix : 'CPU-Audio-tag-',
    count_element : 0,
    convert : convert, // Needed for tests
    trigger : trigger, // Needed for tests

    // NOTE : we will need to refresh this when the <head> of the host page changes
    default_dataset : {
        'title' : function () { 
                for(let domain of ['og', 'twitter']){
                    let header_element = window.document.querySelector(`meta[property="${domain}:title"]`);
                    if (header_element !== null) {
                        return header_element.content;
                    }
                }
                let title = window.document.title;
                return title === '' ? null : title;
            }(), 
        'poster' : function () {
                for(let attr of ['property="og:image"', 'name="twitter:image:src"']){
                    let header_element = window.document.querySelector(`meta[${attr}]`);
                    if (header_element !== null) {
                        return header_element.content;
                    }
                }
                return null;
            }(),
        'canonical' : function () {
                let header_element = window.document.querySelector('link[rel="canonical"]');
                if (header_element !== null) {
                    return header_element.href;
                }
                return window.location.href;
            }(),
        'twitter' : function () {
                let header_element = window.document.querySelector('meta[name="twitter:creator"]');
                if ((header_element !== null) && (header_element.content.length>1)) {
                    return header_element.content;
                }
                return null;
            }()
    },

    recall_stored_play : function(event) {
        if (CPU_Audio.current_audiotag_playing !== null) {
            return;
        } 
        let audiotag = event.target;
        let lasttimecode = Number(window.localStorage.getItem(audiotag.currentSrc));
        // TODO and no hashed time
        if (lasttimecode > 0) {
            CPU_Audio.seekElementAt(audiotag, lasttimecode);
            trigger.play(undefined, audiotag);
        }
    },
    recall_audiotag : function(audiotag) {
        audiotag.addEventListener('loadedmetadata', CPU_Audio.recall_stored_play);
        audiotag.addEventListener('play', trigger.play_once);
        // audiotag.addEventListener('progress', trigger.play_once);
        // those ↓ for PHRACKING SAFARI
        audiotag.addEventListener('ready', CPU_Audio.recall_stored_play);
        audiotag.addEventListener('canplay', CPU_Audio.recall_stored_play);

        // see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events for list of events
        [
            'ready', 'load', 'loadeddata', 'canplay', 'abort', 
            'error', 'stalled', 'suspend', 'emptied',
            'play', 'playing', 'pause', 'ended',
            'durationchange',  'loadedmetadata', 'progress', 'timeupdate', 'waiting'
        ].forEach( function(on){ 
            audiotag.addEventListener(on, trigger.update); 
        });

        if (!is_decent_browser_for_webcomponents()) {
            // in case we are in legacy mode
            [
                'pause', 'ended'
            ].forEach( function(on){ 
                audiotag.addEventListener(on, trigger.pause);
            });
        }

        

        // ask ASAP metadata about media
        // we have to set in HTML code preload="none" due to a very laggy behaviour in HTTP2
        // https://stackoverflow.com/questions/14479413/chrome-ignoring-audio-preload-metadata
        if (audiotag.preload === '') {
            audiotag.preload = 'metadata';
        }
        audiotag.load();
    },

    connect_audiotag : function(audiotag) {

        audiotag.addEventListener('loadedmetadata', CPU_Audio.find_container(audiotag).build_chapters);

        CPU_Audio.recall_audiotag(audiotag);

        // hide native controls
        audiotag.hidden = true;
        // PHRACK SAFARI
        audiotag.removeAttribute('controls');
    },

    jumpIdAt : function(hash, timecode, callback_fx) {

        function do_needle_move(event) {
            let audiotag = event.target;

            if (_isEvent(event)) {
                audiotag.removeEventListener('loadedmetadata', do_needle_move, true);
            }

            let secs = convert.TimeInSeconds(timecode);
            CPU_Audio.seekElementAt(audiotag, secs);

            if (audiotag.readyState >= audiotag.HAVE_FUTURE_DATA)  {
                do_element_play({ target : audiotag });
            } else {
                audiotag.addEventListener('canplay', do_element_play, true);
            }
            trigger.update({target : audiotag});
        }

        function do_element_play(event) {
            let tag = event.target;
            trigger.play(undefined, tag)
            if (_isEvent(event)) {
                tag.removeEventListener('canplay', do_element_play, true);
            }
            onDebug(callback_fx);
        }

        let selector_fallback = 'cpu-audio audio'; // should be 'audio[controls]' but PHRACK APPLE !
        let audiotag = (hash !== '') ? document.getElementById(hash) : document.querySelector(selector_fallback);

        if ((audiotag === undefined) || (audiotag === null) || (audiotag.currentTime === undefined)) {
            console.warn('jumpIdAt audiotag ', audiotag)
            return false;
        }

        if (audiotag.readyState < audiotag.HAVE_CURRENT_DATA ) {
            audiotag.addEventListener('loadedmetadata', do_needle_move , true);
            audiotag.load();
        } else {
            do_needle_move({target : audiotag});
        }
        trigger.update({target : audiotag});
    },

    find_interface : function(child) {
        return child.closest(selector_interface);
    },
    find_container : function(child) {

        if ((child.tagName === CpuAudioTagName) 
            || ( child.tagName === CpuControllerTagName)) {
            return child.CPU
        }
        if (child.tagName === 'AUDIO') {
            return child.parentNode.CPU
        }
        return this.find_interface(child).parentNode.host.CPU;
    },
    seekElementAt : function (audiotag, seconds) {

        if (isNaN(seconds)) {
            // may happens, if the audio track is not loaded/loadable
            return;
        }

        if (audiotag.fastSeek !== undefined) {
            audiotag.fastSeek(seconds);
            // Firefox doesn't see fastSeek
        } else {
            try {
                // but can set currentTime
                audiotag.currentTime = seconds;
            } catch(e) {
                // exept sometimes, so you must use standard media fragment
                audiotag.src = `${audiotag.currentSrc.split('#')[0]}#t=${seconds}`;
            }
        }

        let controller = audiotag.CPU_controller();
        if ((controller !== null) && (controller.update_loading)) {
            // it may be still constructing it
            controller.update_loading(seconds);
        }
    }

}

// Extension on media element

HTMLAudioElement.prototype.CPU_controller = function() {
    return this.closest(CpuAudioTagName);
}

HTMLAudioElement.prototype.CPU_update = function() {
    let controller = this.CPU_controller();
    if (controller) {
        let api = controller.CPU;
        if ((api) && (api.update)) {
            // i don't like try catch
            api.update();
        }
    }
    if (CPU_Audio.global_controller) {
        CPU_Audio.global_controller.update();
    }
}

var CPU_element_api = class {
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
                    error_message = cpu_i18n.media_err_aborted;
                    break;
                case this.audiotag.error.MEDIA_ERR_NETWORK:
                    error_message = cpu_i18n.media_err_network;
                    break;
                case this.audiotag.error.MEDIA_ERR_DECODE:
                    error_message = cpu_i18n.media_err_decode;
                    break;
                case this.audiotag.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    error_message = cpu_i18n.media_err_src_not_supported;
                    break;
                default:
                    error_message = cpu_i18n.media_err_unknow;
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

        let url = (dataset.canonical === undefined ? '' : remove_hash(dataset.canonical))
                    + `#${this.audiotag.id}` 
                    + ( this.audiotag.currentTime === 0 
                            ? ''
                            : `&t=${convert.SecondsInTime(this.audiotag.currentTime)}`
                        );

        let _url = encodeURI(absolutize_url(url));
        let _twitter = '';
        if ((dataset.twitter !== undefined) && (dataset.twitter[0]==='@')) {
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
            dataset.title = cpu_i18n['untitled']
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

        if (self.element.tagName !== CpuAudioTagName) {
            // we will only build (now) the chapter list for <cup-audio>
            return;
        }

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


let acceptable_selector = 'audio[controls]';

// Controller without assigned audio element, i.e. global page controller
class CpuControllerElement extends HTMLElement {

    constructor() {
        // Always call super first in constructor
        super();

        if (not_screen_context()) {
            // I'm not in a screen context, as a braille surface
            // Sorry, but your browser's native controls are surely more accessible
            this.remove();
            return ;
        }

        if (this.tagName === CpuAudioTagName) {
            if (this.querySelector(acceptable_selector) === null) {
                // Graceful degradation : do not start if no media element OR no native controls
                console.warn(`Tag <${CpuAudioTagName}> without <audio controls>.\nSee https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md for a correct installation.`);
                this.remove();
                return;
            }
        }

        template =  thisDoc.querySelector('template');
        shadow_element = this.attachShadow({mode: 'open'});
        shadow_element.innerHTML = template.innerHTML;
    }

    connectedCallback() {
        if (not_screen_context()) {
            return ;
        }
        this.CPU = new CPU_element_api(
            this,
            this.shadowRoot.querySelector('.interface')
        );
        if (!this.CPU.audiotag) {
            CPU_Audio.global_controller = this.CPU;
            this.CPU.audiotag = window.document.querySelector('cpu-audio audio');
        }

        this.CPU.build_controller();
        querySelector_apply('.canonical', element_prevent_link_on_same_page);

        this.CPU.attach_audiotag_to_controller(this.CPU.audiotag);

        let mode = this.getAttribute('mode');
        mode = mode !== null ? mode : 'default'
        this.CPU.elements['interface'].classList.add(`mode-${mode}`)
    }

    disconnectedCallback() {
    }

}

// Controller with assigned audio element
class CpuAudioElement extends CpuControllerElement {

    connectedCallback() {

        this._audiotag = this.querySelector(acceptable_selector);
        if (this._audiotag === null) {
            return;
        }

        // copying personalized data to audio tag
        for (let key in CPU_Audio.default_dataset) {
            let value = this.getAttribute(key);
            if (value !== null) {
                this._audiotag.dataset[key] = value;
            }
        }
        super.connectedCallback();

        CPU_Audio.connect_audiotag(this.CPU.audiotag);

        // If we didn't have a timecode hash at loading document, try to recall previous interrupted player
        //CPU_Audio.recall_stored_play({target : this.CPU.audiotag});

    }

}

// expose API in parent page DOM
window.document.CPU = CPU_Audio;

window.addEventListener('hashchange', trigger.hashOrder, false);
trigger.hashOrder({ at_start : true });

if (!is_decent_browser_for_webcomponents()) {
    console.error(`<${CpuAudioTagName}> WebComponent may NOT behave correctly. Only timecode hash links are activated.\nSee https://github.com/dascritch/cpu-audio/blob/master/index.html for details`);
    querySelector_apply(acceptable_selector, CPU_Audio.recall_audiotag);
    window.document.body.classList.add('cpu-audio-without-webcomponents');
} else {
    window.customElements.define(CpuAudioTagName.toLowerCase(), CpuAudioElement);
    window.customElements.define(CpuControllerTagName.toLowerCase(), CpuControllerElement); 
    window.document.body.classList.add('cpu-audio-with-webcomponents');
}
})();
