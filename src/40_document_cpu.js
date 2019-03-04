document['CPU'] = document['CPU'] ? document['CPU'] : {
    // global object for global API

    // parameters
    'keymove' : 5,
    'only_play_one_audiotag' : true,

    // actual active elements
    'current_audiotag_playing' : null,
    'global_controller' : null,
    previewed : null,
    body_className_playing_cue : null,

    // to add attributes for unnamed <audio>
    dynamicallyAllocatedIdPrefix : 'CPU-Audio-tag-',
    count_element : 0,

    // playlists
    'playlists' : {},
    'advance_in_playlist' : true,

    // Exposing internals needed for tests
    'convert' : convert, 
    'trigger' : trigger,

    // NOTE : we will need to refresh this when the <head> of the host page changes
    default_dataset : {
        'title' : function () { 
                for(let domain of ['og', 'twitter']){
                    let header_element = document.querySelector(`meta[property="${domain}:title"]`);
                    if (header_element !== null) {
                        return header_element.content;
                    }
                }
                let title = document.title;
                return title === '' ? null : title;
            }(), 
        'poster' : function () {
                for(let attr of ['property="og:image"', 'name="twitter:image:src"']){
                    let header_element = document.querySelector(`meta[${attr}]`);
                    if (header_element !== null) {
                        return header_element.content;
                    }
                }
                return null;
            }(),
        'canonical' : function () {
                let header_element = document.querySelector('link[rel="canonical"]');
                if (header_element !== null) {
                    return header_element.href;
                }
                return location.href.split('#')[0];
            }(),
        'twitter' : function () {
                let header_element = document.querySelector('meta[name="twitter:creator"]');
                if ((header_element !== null) && (header_element.content.length>1)) {
                    return header_element.content;
                }
                return null;
            }(),
        'playlist' : null,
    },

    recall_stored_play : function(event) {
        if (document.CPU.current_audiotag_playing !== null) {
            return;
        } 
        let audiotag = event.target;
        let lasttimecode = Number(window.localStorage.getItem(audiotag.currentSrc));
        // TODO and no hashed time
        if (lasttimecode > 0) {
            document.CPU.seekElementAt(audiotag, lasttimecode);
            trigger.play(undefined, audiotag);
        }
    },
    recall_audiotag : function(audiotag) {
        audiotag.addEventListener('loadedmetadata', document.CPU.recall_stored_play);
        audiotag.addEventListener('play', trigger.play_once);
        audiotag.addEventListener('ended', trigger.ended);
        // those ↓ for PHRACKING SAFARI
        audiotag.addEventListener('ready', document.CPU.recall_stored_play);
        audiotag.addEventListener('canplay', document.CPU.recall_stored_play);

        // see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events for list of events
        [
            'ready', 'load', 'loadeddata', 'canplay', 'abort', 
            'error', /*'stalled',*/ 'suspend', 'emptied',
            'play', 'playing', 'pause', 'ended',
            'durationchange',  'loadedmetadata', /*'progress',*/ 'timeupdate', 'waiting'
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
        if (audiotag.preload === '') {
            audiotag.preload = 'metadata';
        }
        audiotag.load();
    },

    connect_audiotag : function(audiotag) {

        document.CPU.recall_audiotag(audiotag);

        // hide native controls
        audiotag.hidden = true;
        // PHRACK SAFARI
        audiotag.removeAttribute('controls');

        // playlist 
        if (typeof(audiotag.dataset.playlist) === 'string') {
            let playlist_name = audiotag.dataset.playlist;
            if (!(playlist_name in document.CPU.playlists)) {
                document.CPU.playlists[playlist_name] = []
            }
            document.CPU.playlists[playlist_name].push(audiotag.id)
        }
    },
    is_audiotag_playing : function(audiotag) {
        return (document.CPU.current_audiotag_playing) && (audiotag.isEqualNode(document.CPU.current_audiotag_playing))
    },
    is_audiotag_global : function(audiotag) {
        return this.global_controller === null ? this.is_audiotag_playing(audiotag) : audiotag.isEqualNode(this.global_controller.audiotag)
    },

    'jumpIdAt' : function(hash, timecode, callback_fx) {

        function do_needle_move(event) {
            let audiotag = event.target;

            if (_isEvent(event)) {
                audiotag.removeEventListener('loadedmetadata', do_needle_move, true);
            }

            let secs = convert.TimeInSeconds(timecode);
            document.CPU.seekElementAt(audiotag, secs);

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
            do_needle_move({'target' : audiotag});
        }
        trigger.update({'target' : audiotag});
    },

    'find_interface' : function(child) {
        return child.closest(selector_interface);
    },
    'find_container' : function(child) {
        if ((child.tagName === CpuAudioTagName) 
            || ( child.tagName === CpuControllerTagName)) {
            return child.CPU
        }

        let closest_cpuaudio = child.closest(CpuAudioTagName);
        if (closest_cpuaudio) {
            return closest_cpuaudio.CPU
        }

        let _interface = document.CPU.find_interface(child);
        return _interface.parentNode.host.CPU;
    },
    'seekElementAt' : function (audiotag, seconds) {

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
    },
    'find_current_playlist' : function() {
        let current_audiotag = this.global_controller.audiotag;
        if (current_audiotag === null) {
            return null;
        }
        for (let playlist_name in this.playlists) {
            if (this.playlists[playlist_name].indexOf(current_audiotag.id) >= 0) {
                return this.playlists[playlist_name];
            }
        }
        return null;
    }

}