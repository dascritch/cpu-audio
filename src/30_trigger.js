const KEY_LEFT_ARROW = 37;
const KEY_RIGHT_ARROW = 39;

const trigger = {

    _timecode_start : false,
    _timecode_end : false,

    // wrongly placed information. Should be in Element.CPU
    _remove_timecode_outofborders : function(at) {
        if ( ((trigger._timecode_start !== false) && (at < trigger._timecode_start)) 
            || ((trigger._timecode_end !== false) && (at > trigger._timecode_end)) ) {
            trigger._timecode_start = false;
            trigger._timecode_end = false;
        }
    },


    /**
     * @brief Interprets the hash part of the URL, when loaded or changed
     *
     * @private
     *
     * @param      {string}   hashcode     Called hashcode
     * @param      {function}   callback_fx  When done, call a function to end the tests
     * @return     {boolean}  understood
     */
    hashOrder : function(hashcode, callback_fx) {

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
                        p_value = (p_value !== '') ? p_value : '0';
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

        // we may have a begin,end notation
        let times = timecode.split(',');
        let timecode_start = times[0];
        trigger._timecode_start = convert.TimeInSeconds(timecode_start);
        trigger._timecode_end = times.length > 1 ? convert.TimeInSeconds(times[1]) : false;
        if (trigger._timecode_end !== false) {
            trigger._timecode_end = (trigger._timecode_end > trigger._timecode_start) ?
                trigger._timecode_end :
                false;
        }

        document.CPU.jumpIdAt(hash, timecode_start, callback_fx);

        if (document.CPU.global_controller) {
            document.CPU.global_controller.build_playlist();
        }
        // scroll to the audio element. Should be reworked, or parametrable
        // window.location.hash = `#${hash}`;
        return true;
    },

    /**
     * Update throbber position when hovering the timeline interface
     *
     * @param      {<type>}  event   The event
     */
    hover : function(event) {
        let target = event.target;
        let container = document.CPU.find_container(target);

        let target_rect = target.getClientRects()[0];
        let relLeft = target_rect.left;
        let ratio = event.offsetX / target.clientWidth;
        let seeked_time = ratio * container.audiotag.duration;

        container.show_throbber_at(seeked_time);
    },

    /**
     * Hide the throbber when leaving the timeline interface
     *
     * @param      {<type>}  event   The event
     */
    out : function(event) {
        let container = document.CPU.find_container(event.target);
        container.hide_throbber();
    },

    /*preview_hover : function(event) {

    },*/

    /**
     * Highlight the playable positions when hovering a marked link
     *
     * @param      {<type>}  event   The event
     */
    preview_container_hover : function(event) {
        let target = event.target;
        if (!target.id) {
            target = target.closest('[id]');
        }
        if (target === null) {
            return;
        }

        let container = document.CPU.find_container(target);
        let names = container.get_point_names_from_id(target.id);
        container.highlight_point(names[0], names[1]);
    },


    /**
     * Change play position of a audio tag
     *
     * @param      {<type>}  event   The event
     */
    throbble : function(event) {
        let at = 0;
        let target = event.target;
        let container = document.CPU.find_container(target);
        let audiotag = container.audiotag;
        if (event.at !== undefined) {
            at = event.at;
        } else {
            // normal usage
            let ratio = event.offsetX  / target.clientWidth;
            at = ratio * audiotag.duration;
        }

        trigger._remove_timecode_outofborders(at);

        document.CPU.seekElementAt(audiotag, at);
        trigger.play(event);
    },

    /**
     * Do pause
     *
     * @param      {<type>}  event     The event
     * @param      {<type>}  audiotag  The audiotag
     */
    pause : function(event, audiotag) {
        if (audiotag === undefined) {
            let target = event.target;
            audiotag = (target.tagName === 'AUDIO') ? target : document.CPU.find_container(target).audiotag;
        }
        audiotag.pause();
        document.CPU.current_audiotag_playing = null;
        window.localStorage.removeItem(audiotag.currentSrc);
    },

    /**
     * Change referenced playing audio, pause the previous one
     *
     * @param      {<type>}  event   The event
     */
    play_once : function(event) {
        let audiotag = event.target;

        if ( (document.CPU.only_play_one_audiotag) && (document.CPU.current_audiotag_playing) && (!document.CPU.is_audiotag_playing(audiotag)) ) {
            trigger.pause(undefined, document.CPU.current_audiotag_playing);
        }
        document.CPU.current_audiotag_playing = audiotag;
    },

    /**
     * Do play an audio tag
     *
     * @param      {<type>}  event     The event
     * @param      {<type>}  audiotag  The audiotag
     */
    play : function(event, audiotag) {
        if (audiotag === undefined) {
            audiotag = document.CPU.find_container(event.target).audiotag;
        }

        if ((document.CPU.global_controller) && (!audiotag.isEqualNode(document.CPU.global_controller.audiotag))) {
            let global_controller = document.CPU.global_controller;
            global_controller.attach_audiotag_to_controller(audiotag);
            global_controller.audiotag = audiotag;
            global_controller.show_main();
            global_controller.redraw_all_planes();
            global_controller.build_playlist();
        }
        try {
            trigger._remove_timecode_outofborders(audiotag.currentTime);            
            audiotag.play();
            trigger.update({target : audiotag});
        } catch (e) {

        }
    },

    /**
     * Interprets pressed key
     *
     * @param      {<type>}  event   The event
     * @param      {number}  mult    Multiply the keypressed act
     */
    key : function(event, mult) {
        mult = mult === undefined ? 1 : mult;
        let container = document.CPU.find_container(event.target);
        let audiotag = container.audiotag;

        function seek_relative(seconds) {
            event.at = container.audiotag.currentTime + seconds;
            container.show_throbber_at(event.at);
            trigger.throbble(event);
            container.hide_throbber_later();
        }

        switch (event.keyCode) {
            // can't use enter : standard usage
            case 27 : // esc
                trigger.restart(event);
                trigger.pause(undefined, audiotag);
                break;
            case 32 : // space
                audiotag.paused ?
                    trigger.play(undefined, audiotag) :
                    trigger.pause(undefined, audiotag);
                break;
            case 35 : // end
                document.CPU.seekElementAt(audiotag, audiotag.duration);
                break;
            case 36 : // home
                trigger.restart(event);
                break;
            case KEY_LEFT_ARROW : // ←
                seek_relative(- (document.CPU.keymove * mult));
                break;
            case KEY_RIGHT_ARROW : // →
                seek_relative(+ (document.CPU.keymove * mult));
                break;
            default:
                return ;
        }
        event.preventDefault();
    },

    /**
     * Interprets keypress on the play/pause button
     *
     * @param      {<type>}  event   The event
     */
    keydownplay : function(event) {
        if (event.keyCode !== 13 ) {
            return;
        } 
        let container = document.CPU.find_container(event.target);
        let audiotag = container.audiotag;

        audiotag.paused ?
            trigger.play(undefined, audiotag) :
            trigger.pause(undefined, audiotag);
        
        event.preventDefault();
    },

    /**
     * Pressing restart button, Rewind at start the audio tag
     *
     * @param      {<type>}  event   The event
     */
    restart : function(event) {
        let container = document.CPU.find_container(event.target);
        document.CPU.seekElementAt(container.audiotag, 0);
    },
    /**
     * Pressing reward button
     *
     * @param      {<type>}  event   The event
     */
    reward : function(event) {
        event.keyCode = KEY_LEFT_ARROW;
        trigger.key(event);
    },
    /**
     * Pressing foward button
     * Function associated, see below, DO NOT RENAME
     *
     * @param      {<type>}  event   The event
     */
    foward : function(event) {
        event.keyCode = KEY_RIGHT_ARROW;
        trigger.key(event);
    },
    /**
     * Pressing fastreward button
     * Function associated, see below, DO NOT RENAME
     *
     * @param      {<type>}  event   The event
     */
    fastreward : function(event) {
        event.keyCode = KEY_LEFT_ARROW;
        trigger.key(event, document.CPU.fast_factor);
    },
    /**
     * Pressing fastfoward button
     * Function associated, see below, DO NOT RENAME
     *
     * @param      {<type>}  event   The event
     */
    fastfoward : function(event) {
        event.keyCode = KEY_RIGHT_ARROW;
        trigger.key(event, document.CPU.fast_factor);
    },


    _hand_on : null, // Repeated event allocation
    /* Start handheld navigation button press */
    _press_button : function(event) {
        let target = event.target.id ? event.target : event.target.closest('button');
        let acceptable_actions = ['fastreward', 'reward', 'foward', 'fastfoward'];
        if ( (!target.id) || (acceptable_actions.indexOf(target.id) === -1)) {
            // we have been misleaded
            return;
        }
        // execute the associated function
        trigger[target.id](event);
        if (trigger._hand_on !== null) {
            window.clearTimeout(trigger._hand_on);
        }

        let mini_event = {
            target : target,
            preventDefault : onDebug
        };
        trigger._hand_on = window.setTimeout(trigger._repeat_button, document.CPU.repeat_delay, mini_event);
        event.preventDefault();
    },

    /* Repeat during pressing handheld navigation button */
    _repeat_button : function(event) {
        // 
        trigger[event.target.id](event);
        // next call : repetition are closest
        trigger._hand_on = window.setTimeout(trigger._repeat_button, document.CPU.repeat_factor, event);
    },

    /* Release handheld navigation button */
    _release_button : function(event) {
        window.clearTimeout(trigger._hand_on);
        trigger._hand_on = null;
        event.preventDefault();
    },


    /**
     * in fine-position handheld interface, changing the time field
     * INVALIDED, see https://github.com/dascritch/cpu-audio/issues/63
     *
     * @param      {<type>}  event   The event
     *
    input_time_change : function(event) {
        let target = event.target;
        let container = document.CPU.find_container(target);
        let seconds = convert.ColonTimeInSeconds(target.value);
        container.show_throbber_at(seconds);
        document.CPU.seekElementAt(container.audiotag, seconds);
    },
    */


    /**
     * Refresh the interface when changing chapter
     *
     * @param      {<type>}  event              The event
     * @param      {<type>}  element_interface  The element interface
     */
    cuechange : function(event, element_interface) {
        document.body.classList.remove(document.CPU.body_className_playing_cue);
        // when the position in a media element goes out of the current
        if (element_interface === undefined) {
            return;
        }
        let class_name = 'active-cue';
        let container = document.CPU.find_container(element_interface);
        let plane_name = '_chapters';
        container.remove_highlights_points(class_name);

        if (event.target.activeCues.length === 0) {
            // too early, we need to keep this case from Chrome
            return;
        }

        let cue_id = event.target.activeCues[0].id;
        // giving a class to document.body, with a syntax according to https://www.w3.org/TR/CSS21/syndata.html#characters
        let current_audiotag = document.CPU.current_audiotag_playing;
        if (current_audiotag !== null) {
            document.CPU.body_className_playing_cue = `cpu_playing_tag_«${document.CPU.current_audiotag_playing.id}»_cue_«${cue_id}»`;
            document.body.classList.add(document.CPU.body_className_playing_cue);
        }

        container.highlight_point(plane_name, cue_id, class_name);
    },


    /**
     * Updatting time position. Pause if a end position is defined
     *
     * @param      {<type>}  event   The event
     */
    update : function(event) {
        let audiotag = event.target;

        if ((trigger._timecode_end !== false) && (audiotag.currentTime > trigger._timecode_end)) {
            trigger.pause(undefined, audiotag);
        }

        audiotag.CPU_update();
        if (!audiotag.paused) {
            window.localStorage.setItem(audiotag.currentSrc, String(audiotag.currentTime));
        }
    },

    /**
     * When an audiotag is ended, advance in playlist
     *
     * @param      {<type>}  event     The event
     * @param      {string}  audiotag  The audiotag
     */
    ended : function(event, audiotag) {
        // the media element reached its end 
        if (audiotag === undefined) {
            audiotag = event.target;
        }
        if (!('playlist' in audiotag.dataset)) {
            return;
        }
        // and is in a declarated playlist
        let playlist_name = audiotag.dataset.playlist;
        let playlist = document.CPU.playlists[playlist_name];
        if (playlist === undefined) {
            warn(`Named playlist ${playlist_name} not created. WTF ?`);
            return;
        }
        let playlist_index = playlist.indexOf(audiotag.id);
        if (playlist_index === -1) {
            warn(`Audiotag ${audiotag.id} not in playlist ${playlist_name}. WTF ?`);
            return;
        }
        if ((playlist_index +1) === playlist.length) {
            // end of playlist
            return;
        }
        let next_id = playlist[playlist_index+1];
        let next_audiotag = document.getElementById(next_id);
        if (next_audiotag === null) {
            warn(`Audiotag #${next_id} doesn't exists. WTF ?`);
            return;
        }
        // Play the next media in playlist, starting at zero
        document.CPU.seekElementAt(next_audiotag, 0);
        trigger.play(undefined, next_audiotag);
    },

    /**
     * Interprets if <cpu-audio> element is modified 
     *
     * @param      {<type>}  mutationsList  The mutations list
     */
    observer_cpuaudio : function(mutationsList) {
        let container = document.CPU.find_container(mutationsList[0].target);

        let media_tagname = 'audio';
        let audio_element = container.element.querySelector(media_tagname)
        if (audio_element === null) {
            info(`<${media_tagname}> element was removed.`)
            container.element.remove();
            return;
        }
        container.element.copy_attributes_to_media_dataset();
    },
    /**
     * Interprets if <audio> element is modified or removed
     * TODO : act when a child change as <source> or <track>
     *
     * @param      {<type>}  mutationsList  The mutations list
     */
    observer_audio : function(mutationsList) {
        let container = document.CPU.find_container(mutationsList[0].target);

        // in case <track> changed/removed
        container.build_chapters();

        // in case attributes changed
        container.complete_template();

        let global_controller = document.CPU.global_controller;
        if ((global_controller !== null) && (container.audiotag.isEqualNode(global_controller.audiotag))) {
            global_controller.build_chapters();
            global_controller.complete_template();
        }
    },

    /**
     * Interprets navigator.share native API
     *
     * @param      {<type>}  event   The event
     */
    native_share : function(event) {
        let dataset = document.CPU.find_container(event.target).fetch_audiotag_dataset();;
        navigator.share({
            'title': dataset.title,
            'text': dataset.title,
            'url': dataset.canonical
        })

    },

    _show_alternate_nav : false,

    /**
     * Interprets long play on timeline for alternative fine position
     *
     * @param      {<type>}  event   The event
     */
    touchstart : function(event) {
        let container = document.CPU.find_container(event.target);
        trigger._show_alternate_nav = setTimeout(container.show_alternate_nav, document.CPU.alternate_delay, container);
        
    },

    touchcancel : function(event) {
        clearTimeout(trigger._show_handheld_nav);
    },

}