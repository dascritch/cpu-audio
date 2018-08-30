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
                return window.location.href.split('#')[0];
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