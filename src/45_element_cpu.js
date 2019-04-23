let CPU_element_api = class {
    //
    // @brief Constructs the object.
    // @public
    //
    // @param      {<type>}  element              The DOMelement
    // @param      {<type>}  container_interface  The container interface
    //
    constructor(element, container_interface) {
        // I hate this style. I rather prefer the object notation
        this.element = element;
        this.elements = {};
        this.audiotag = element._audiotag;
        this.container = container_interface;
        this.mode_when_play = null;
        // record some related data on the <audio> tag, outside the dataset scheme
        if ( (this.audiotag) && (! this.audiotag._CPU_planes)) {
            this.audiotag._CPU_planes = {}
        }
    }

    //
    // @brief Used for `mode=""` attribute. 
    // @public
    //
    // @param      {string}  mode    Accepted are only in `/\w+/` format
    //
    set_mode_container(mode) {
        mode = mode !== null ? mode : 'default';
        this.container.classList.remove(`mode-${this.mode_was}`);
        this.mode_was = mode;
        this.container.classList.add(`mode-${mode}`);
    }
    //
    // @brief Change the presentation style reflecting the media tag status
    // @public
    //
    // @param      {string}  act     can be 'loading', 'pause' or 'play'
    //
    set_act_container(act) {
        this.container.classList.remove(
            'act-loading',
            'act-pause',
            'act-play'
            );
        this.container.classList.add(`act-${act}`);
    }
    //
    // @brief Hide some blocks in the interface, used for `hide=""` attribute
    // @public
    //
    // @param      {<string>}  hide_elements  Array of strings, may contains
    //                                        'actions' or 'chapters'
    //
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

    //
    // @brief update play/pause button according to media status
    // @private
    //
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

    //
    // @brief
    // @private
    //
    // @param      {string}  type     line to impact
    // @param      {number}  seconds  The seconds
    //
    update_line(type, seconds) {
        // type = 'elapsed', 'loading'
        let duration = this.audiotag.duration;
        this.elements[`${type}line`].style.width = duration === 0
                                                ? 0
                                                : `${100*seconds / duration}%`;
    }
    //
    // @brief
    // @private
    //
    update_buffered() {
        let end = 0;
        let buffered  = this.audiotag.buffered ;
        for (let segment=0 ; segment++; segment < buffered.length) {
            end = buffered.end(segment);
        }
        this.update_line('elapsed', end);
    }
    //
    // @brief
    // @private
    //
    // @param      {event object}  event   The event
    //
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
        elapse_element.innerHTML = `${colon_time}<span class="nosmaller">\u00a0/\u00a0${total_duration}</span>`;

        let inputtime_element = this.elements['inputtime'];
        // How to check a focused element ? document.activeElement respond the webcomponent tag :/ You must call shadowRoot.activeElement
        if (!inputtime_element.isEqualNode(this.element.shadowRoot.activeElement)) {
            inputtime_element.value = convert.SecondsInPaddledColonTime( audiotag.currentTime );  // yes, this SHOULD be in HH:MM:SS format precisely
        }
        inputtime_element.max = convert.SecondsInPaddledColonTime(audiotag.duration);
        this.update_line('loading', audiotag.currentTime);
        this.update_buffered();
    }
    //
    // @brief  Shows indicators for the limits of the playing position
    // @private
    //
    update_time_borders() {
        let audiotag = this.audiotag;
        if ((!document.CPU.is_audiotag_global(audiotag)) || (trigger._timecode_end === false)) {
            this.elements['points'].style.opacity = 0;
            return;
        }
        this.elements['points'].style.opacity = 1;
        // UGLY to rewrite
        this.elements['pointstart'].style.left = `calc(${100 * trigger._timecode_start / audiotag.duration}% - 4px)`;
        this.elements['pointend'].style.left = `${100 * trigger._timecode_end / audiotag.duration}%`;

    }
    //
    // @brief Show that the media is loading
    //
    // @private
    //
    // @param      {number}  seconds  The seconds
    //
    update_loading(seconds) {
        this.update_line('loading', seconds);
        this.set_act_container('loading');
    }
    //
    // @brief Show the current media error status
    //
    // @private
    //
    // @return     {boolean}  { description_of_the_return_value }
    //
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
    //
    // @brief Will refresh player interface at each time change (a lot)
    //
    // @private
    //
    update() {
        if (!this.update_error()) {
            this.update_playbutton();
            this.update_time();
            this.update_time_borders();
        }
    }

    //
    // @brief Shows the throbber at.
    //
    // @public
    //
    // @param      {number}  seeked_time  The seeked time
    //
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
        phylactere.dateTime = convert.SecondsInTime(seeked_time).toUpperCase();
    }
    //
    // @brief Hides immediately the throbber.
    //
    // @public
    //
    // @param      {<type>}  that    The that
    //
    hide_throbber(that) {
        that = that === undefined ? this : that;
        let phylactere = that.elements['popup'];
        phylactere.style.opacity = 0;
    }
    //
    // @brief Hides the throbber later. Will delay the hiding if recalled.
    // @public
    //
    hide_throbber_later() {
        let hide_throbber_delay = 1000
        let phylactere = this.elements['popup'];
        if (phylactere._hider) {
            window.clearTimeout(phylactere._hider);
        }
        phylactere._hider = window.setTimeout(this.hide_throbber, hide_throbber_delay, this);
    }


    //
    // @brief will get presentation data from <audio> or from parent document
    //
    // @private
    //
    // @return     {<type>}  { description_of_the_return_value }
    //
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

    // @private
    //
    // @brief Update links for sharing
    //
    //
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

    //
    // @brief Shows the interface.
    //
    // @public
    // @param      {string}  mode    The mode, can be 'main', 'share' or 'error'
    //
    show_interface(mode) {
        this.container.classList.remove('show-main', 'show-share', 'show-error');
        this.container.classList.add('show-'+mode);
    }
    //
    // @brief Shows the sharing panel, 
    //
    // @private
    // @param      {<type>}  event   The event
    //
    show_actions(event) {
        let container = (event !== undefined) ?
                document.CPU.find_container(event.target) :
                this;
        container.show_interface('share');
        container.update_links();
    }
    //
    // @brief Shows the main manel.
    //
    // @private
    //
    // @param      {<type>}  event   The event
    //
    show_main(event) {
        let container = (event !== undefined) ?
                document.CPU.find_container(event.target) :
                this;
        container.show_interface('main');
    }

    // @private not mature enough
    //
    // @brief Shows the handheld fine navigation.
    //
    // @param      {<type>}  event   The event
    //
    show_handheld_nav(event) {
        let container = (event !== undefined) ?
                document.CPU.find_container(event.target) :
                this;
        container.container.classList.toggle('show-handheld-nav');
        event.preventDefault();
    }

    //
    // @brief Adds an identifier to audiotag at build time.
    // @private
    //
    add_id_to_audiotag() {
        if (this.audiotag.id === '') {
            this.audiotag.id = document.CPU.dynamicallyAllocatedIdPrefix + String(document.CPU.count_element++);
        }
    }

    //
    // @brief Complete the interface at build time
    // @private
    //
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
        this.elements['time'].style.backgroundImage = (dataset.waveform === null) ? '' : `url(${dataset.waveform})`;
    }
    //
    // @brief Attach the audiotag to the API
    // @private
    //
    // @param      {<type>}  audiotag  The audiotag
    //
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


    /**
     * Gets the aside info
     *
     * @param      {string}  aside_name   The name
     * @return     {HTMLElement}    The <aside> element from ShadowDom interface
     */
    get_plane(aside_name) {
        return this.audiotag._CPU_planes[aside_name];
    }

    /**
     * Gets the aside track element
     *
     * @param      {string}  aside_name   The name
     * @return     {HTMLElement}    The <aside> element from ShadowDom interface
     */
    get_plane_track(aside_name) {
        return this.elements['line'].querySelector(`#aside_«${aside_name}»`);
    }

    /**
     * Gets the aside panel element
     *
     * @param      {string}  aside_name   The name
     * @return     {HTMLElement}    The panel element from ShadowDom interface
     */
    get_plane_panel(aside_name) {
        return this.container.querySelector(`#panel_«${aside_name}»`);
    }

    /**
     * Gets the <nav> aside panel element
     *
     * @param      {string}  aside_name   The name
     * @return     {HTMLElement}    The <nav> element from ShadowDom interface
     */
    get_plane_panel_nav(aside_name) {
        return this.get_plane_panel(aside_name).querySelector(`nav`);
    }

    /**
     * Draws a plane.
     *
     * @param      {<type>}  aside_name  The aside name
     */
    draw_plane(aside_name) {
        let data = this.get_plane(aside_name);
        let highlight_preview = trigger.preview_container_hover;
        let clear_previews_bind = this.clear_previews.bind(this);
        let aside_track = this.get_plane_track(aside_name);
        function assign_events(element) {
            element.addEventListener('mouseover', highlight_preview, passive_ev);
            element.addEventListener('focusin', highlight_preview, passive_ev);
            element.addEventListener('mouseleave', clear_previews_bind, passive_ev);
            element.addEventListener('focusout', clear_previews_bind, passive_ev);            
        }

        if (aside_track) {
            aside_track.remove();
        }

        if (data.aside !== false) {
            aside_track = document.createElement('aside');
            aside_track.id = `aside_«${aside_name}»`;
            if (data.aside !== true) {
                aside_track.classList.add(data.aside);
            }
            
            this.elements['line'].appendChild(aside_track);
            assign_events(aside_track);
        }

        let aside_panel = this.get_plane_panel(aside_name);
        if (aside_panel) {
            aside_panel.remove();
        }

        if (data.panel !== false) {
            aside_panel = document.createElement('div');
            aside_panel.id = `panel_«${aside_name}»`;
            if (data.panel !== true) {
                aside_panel.classList.add(data.panel);
            }

            aside_panel.classList.add('panel');
            let inner = '<nav></nav>';

            if (data['title'] !== undefined) {
                inner = `<h6>${escapeHTML(data['title'])}</h6>${inner}`;
            }
            aside_panel.innerHTML = inner;
            this.container.appendChild(aside_panel);

            assign_events(aside_panel);
        }

        if (
            (this.element.tagName !== CpuControllerTagName) &&
            (document.CPU.global_controller !== null) &&
            (this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
            ) {
            document.CPU.global_controller.draw_plane(aside_name);
        }

    }

    //
    // @brief Add an <aside> annotation layer
    // @public
    //
    // @param      {string}  aside_name     A name in the range /[a-zA-Z0-9\-_]+/
    // @param      {string}  title          The displayed title for the panel
    // @param      {object}  data           { aside : true/false/classname , panel : true/false/classname }
    // 
    // @return     {boolean} success
    //
    add_plane(aside_name, title, data) {

        if ((this.element.tagName === CpuControllerTagName) || (! aside_name.match(valid_id)) || (this.get_plane(aside_name) !== undefined)) {
            return false;
        }

        if (this.audiotag._CPU_planes === undefined) {
            this.audiotag._CPU_planes = {};
        }
        let default_values = {
            'aside' : true,
            'panel' : true,
            'title' : title,
            'points' : {}
        }
        if (data === undefined) {
            data = default_values;
        } else {
            for (let key in default_values) {
                if (data[key] === undefined) {
                    data[key] = default_values[key];
                }
            }
        }

        this.audiotag._CPU_planes[aside_name] = data;

        this.draw_plane(aside_name);

        // clone to eventual <cpu-controller>
        return true;
    }
    //
    // @brief Remove an <aside> annotation layer
    // @public
    //
    // @param      {string}  name   A name in the range /[a-zA-Z0-9\-_]+/
    // 
    // @return     {boolean} success
    //
    remove_plane(name) {
        if (! name.match(valid_id)) {
            return false;
        }
        if (this.audiotag) {
            // we are perhaps in <cpu-controller>
            delete this.audiotag._CPU_planes[name];
        }
        let remove_element = this.get_plane_track(name);
        if (remove_element) {
            remove_element.remove()
        }
        remove_element = this.get_plane_panel(name);
        if (remove_element) {
            remove_element.remove();
        }

        if (
            (this.element.tagName !== CpuControllerTagName) &&
            (document.CPU.global_controller !== null) &&
            (this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
            ) {
            document.CPU.global_controller.remove_plane(name);
        }

        return true;
    }

    /**
     * Gets the point track identifier.
     * @private
     *
     * @param      {string}  aside_name  The aside name
     * @param      {string}  point_name  The point name
     * @param      {boolean} panel       Is panel (true) or track (false)
     * @return     {string}  The point track identifier.
     */
    get_point_track_id(aside_name, point_name, panel) {
        return `${panel?'panel':'aside'}_«${aside_name}»_point_«${point_name}»`;
    }

    /**
     * Gets the point info
     *
     * @param      {string}  name   The name
     * @return     {HTMLElement}    The <aside> element from ShadowDom interface
     */
    get_plane_point(aside_name, point_name) {
        return this.audiotag._CPU_planes[aside_name].points[point_name];
    }

    /**
     * Gets the aside point element in the track
     *
     * @param      {string}  name   The name
     * @return     {HTMLElement}    The <div> point element into <aside> from ShadowDom interface
     */
    get_plane_point_track(aside_name, point_name) {
        return this.elements['line'].querySelector('#' + this.get_point_track_id(aside_name, point_name, false));
    }

    /**
     * Gets the aside point element in the panel
     *
     * @param      {string}  name   The name
     * @return     {HTMLElement}    The <li> point element into panel from ShadowDom interface
     */
    get_plane_point_panel(aside_name, point_name) {
        return this.container.querySelector('#' + this.get_point_track_id(aside_name, point_name, true));
    }

    /**
     * Draws a plane point.
     *
     * @param      {<type>}  aside_name  The aside name
     * @param      {<type>}  point_name  The point name
     */
    draw_plane_point(aside_name, point_name) {
        let plane_point_panel = this.get_plane_point_panel(aside_name, point_name);
        if (plane_point_panel) {
            plane_point_panel.remove();
        }
        let plane_point_track = this.get_plane_point_track(aside_name, point_name);
        if (plane_point_track) {
            plane_point_track.remove();
        }

        let data = this.get_plane_point(aside_name, point_name);
        let audiotag = this.audiotag ? this.audiotag : document.CPU.global_controller.audiotag;
        let audio_duration = audiotag.duration;
        let aside = this.get_plane_track(aside_name);
        let panel = this.get_plane_panel_nav(aside_name);

        let intended_aside_id = this.get_point_track_id(aside_name, point_name, false);
        let intended_panel_id = this.get_point_track_id(aside_name, point_name, true);

        if (aside) {
            let point_element = document.createElement('a');
            point_element.id = intended_aside_id;
            point_element.tabIndex = -1;

            if (data['link'] !== false) {
                point_element.href = `#${audiotag.id}&t=${data['start']}`;
            }
            point_element.title = data['text'];
            let inner = '';
            if (data['image']) {
                inner = `<img src="${data['image']}" alt="">`;
            }
            point_element.innerHTML = inner;

            aside.appendChild(point_element);
            
            point_element.style.left = `${100 * (data['start'] / audio_duration)}%`;
            point_element.dataset.cueStartTime = data['start'];
            point_element.dataset.cueId = point_name;

            if (data['end']) {
                point_element.style.right = `${100 - 100 *( data['end'] / audio_duration)}%`;
                point_element.dataset.cueEndTime = data['end'];
            }
        }
        
        if (panel) {
            let li = document.createElement('li');
            // li.id = intended_panel_id;
                        
            let inner = '';
            if (data['text']) {
                inner += `<strong>${data['text']}</strong>`;
            }

            // see valid duration time https://www.w3.org/TR/2014/REC-html5-20141028/infrastructure.html#valid-duration-string
            inner += `<time datetime="P${convert.SecondsInTime(data['start']).toUpperCase()}">${convert.SecondsInColonTime(data['start'])}</time>`; 

            if (data['link'] !== false) {
                if (data['link'] === true) {
                    // link to the audio tag.
                    // if the parameter is a string, use it as a simple link
                    data['link'] = `#${audiotag.id}&amp;t=${data['start']}`;
                }
                inner = `<a href="${data['link']}" class="cue" id="${intended_panel_id}">${inner}</a>`;
            } else {
                // no link to refer, put a tag for consistency
                inner = `<span class="cue" id="${intended_panel_id}">${inner}</span>`;
            }
            li.innerHTML = inner;
            // 
            let cue = li.querySelector('.cue');
            cue.dataset.cueStartTime = data['start'];
            cue.dataset.cueId = point_name;

            if (data['end']) {
                cue.dataset.cueEndTime = data['end'];
            }

            panel.appendChild(li);
        }

        if (
            (this.element.tagName !== CpuControllerTagName) &&
            (document.CPU.global_controller !== null) &&
            (this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
            ) {
            document.CPU.global_controller.draw_plane_point(aside_name, point_name) 
        }
    }

    //
    // @brief Add an annotation
    // @public
    //
    // @param      {string}  aside_name      The existing aside name
    // @param      {number}  timecode_start  The timecode start for this annotation
    // @param      {<string} point_name      The point name, in the range /[a-zA-Z0-9\-_]+/
    // @param      {<type>}  data            object : { 'image' : <url>, 'link' : <url>/true (in audio/false (none), 'text' : <text>, 'end' : <seconds> }
    // 
    // @return     {boolean} success
    //                        
    add_plane_point(aside_name, timecode_start, point_name, data) {
        data = data === undefined ? {} : data;
        
        if ( (this.element.tagName === CpuControllerTagName) || (this.get_plane(aside_name) === undefined) || (this.get_plane_point(aside_name, point_name) !== undefined) || (timecode_start < 0) || (!point_name.match(valid_id)) ) {
            return false;
        }

        data.start = timecode_start;
        this.audiotag._CPU_planes[aside_name].points[point_name] = data;
        this.draw_plane_point(aside_name, point_name);

        return true;
    }
    //
    // @brief Remove an point from an aside
    // @public
    //
    // @param      {string}   aside_name    A name in the range /[a-zA-Z0-9\-_]+/
    // @param      {string}   point_name    A name in the range /[a-zA-Z0-9\-_]+/
    // @return     {boolean}  success
    //
    remove_plane_point(aside_name, point_name) {
        let point_track_element = this.get_plane_point_track(aside_name, point_name);
        if (!point_track_element) {
            return false;
        }
        delete this.audiotag._CPU_planes[aside_name].points[point_name];
        point_track_element.remove();
        this.get_plane_point_panel(aside_name, point_name).remove();

        if (
            (this.element.tagName !== CpuControllerTagName) &&
            (document.CPU.global_controller !== null) &&
            (this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
            ) {
            document.CPU.global_controller.remove_plane_point(aside_name, point_name);
        }
        return true;
    }


    get_aside_point_names_from_id(element_id) {
        let aside_name = element_id.replace(aside_point_names_from_id,'$2');
        let point_name = element_id.replace(aside_point_names_from_id,'$4');
        return [aside_name, point_name];
    }

    /**
     * Remove any points from an aside
     * @public
     *
     * @param      {string}  aside_name  The aside name
     */
    clear_plane(aside_name) {
        let remove_from_data = this.get_plane(aside_name);
        if (!this.get_plane(aside_name)) {
            return false;   
        }

        for (let point_name of Object.keys(remove_from_data.points)) {
            this.remove_plane_point(aside_name, point_name);
        }
        return true;
    }

    undraw_all_planes() {
        querySelector_apply('aside , .panel', function(element) { element.remove(); }, this.container);
    }

    /**
     * Clear and redraw all planes, mainly when cpu-controller is changing
     * targeted audio tag
     * @public
     */
    redraw_all_planes() {
        this.undraw_all_planes()
        for (let aside_name of Object.keys(this.audiotag._CPU_planes)) {
            this.draw_plane(aside_name);
            for (let point_name of Object.keys(this.audiotag._CPU_planes[aside_name].points)) {
                this.draw_plane_point(aside_name, point_name);
            }
        }
    }

    /**
     * Remove any previewes on plane points
     * @public
     *
     * @param      {string}  class_name  Targeted class name, 'with-preview' by default
     */
    clear_previews(class_name) {
        class_name = (typeof class_name === 'string') ? class_name : preview_classname;
        querySelector_apply(`.${class_name}`,function (element) {
                element.classList.remove(class_name);
            },this.container);

        if (
            (this.element.tagName !== CpuControllerTagName) &&
            (document.CPU.global_controller !== null) &&
            (this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
            ) {
            document.CPU.global_controller.clear_previews(class_name);
        }
    }

    /**
     * Sets a preview on a plane point
     * @public
     *
     * @param      {string}  aside_name  The aside name
     * @param      {string}  point_name  The point name
     * @param      {string}  class_name  class name, 'with-preview' by default
     */
    set_preview_plane_point(aside_name, point_name, class_name) {
        class_name = (typeof class_name === 'string') ? class_name : preview_classname;
        this.clear_previews(class_name);

        let track_element = this.get_plane_track(aside_name, point_name);
        if (track_element) {
            let point_track = this.get_plane_point_track(aside_name, point_name);
            if (point_track) {
                point_track.classList.add(class_name);
            }
        }

        let panel_element = this.get_plane_panel(aside_name, point_name);
        if (panel_element) {
            let point_panel = this.get_plane_point_panel(aside_name, point_name);
            if (point_panel) {
                point_panel.classList.add(class_name);
            }
        }

        if (
            (this.element.tagName !== CpuControllerTagName) &&
            (document.CPU.global_controller !== null) &&
            (this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
            ) {
            document.CPU.global_controller.set_preview_plane_point(aside_name, point_name, class_name);
        }
    }

    //
    // @brief Call when a chapter is changed, to trigger the changes
    // @private
    //
    // @param      {<type>}  event   The event
    //
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
    //
    // @brief Builds or refresh chapters interface.
    // @public
    //
    // @param      {<type>}  event   The event
    //
    build_chapters(event, _forced_track) {
        let self = this;

        if (event !== undefined) {
            // Chrome load <track> afterwards, so an event is needed, and we need to recatch our CPU api to this event
            self = document.CPU.find_container(event.target);
            if (self === null) {
                // not yet ready, should not occurs
                error('Container CPU- not ready yet. WTF ?');
            }
        }

        let audiotag = self.audiotag;
        let has = false;
        let plane_name = '_chapters';

        function _build_from_track(tracks) {
            let _cuechange_event = self._cuechange_event.bind(self);
            tracks.removeEventListener('cuechange', _cuechange_event);
            // adding chapter changing event
            tracks.addEventListener('cuechange', _cuechange_event);

            for (let cue of tracks.cues) {
                let cuepoint = Math.floor(cue.startTime);
                // let cuetime = convert.SecondsInColonTime(cue.startTime);
                // let href = `#${audiotag.id}&t=${cuepoint}`;

                self.add_plane_point(plane_name, cuepoint, cue.id,  {
                    'text' : cue.text,
                    'link' : true,          // point the link to audio
                    'end'  : cue.endTime    // end timecode of the cue
                });
            }

            if (tracks.cues.length > 0) {
                has = true;
            }

        }

        if (audiotag) {
            if (_forced_track !== undefined) {
                _build_from_track(_forced_track)
            } else {

                if ((audiotag.textTracks) && (audiotag.textTracks.length > 0)) {
                    for (let tracks of audiotag.textTracks) {
                        // TODO : we have here a singular problem : how to NOT rebuild the chapter lists, being sure to have the SAME cues and they are loaded, as we may have FOUR builds.
                        // Those multiple repaint events doesn't seem to have so much impact, but they are awful, unwanted and MAY have an impact
                        // We must find a way to clean it up or not rebuild for SAME tracks, AND remove associated events 
                        // AND clean up the chapter list if a new chapter list is loaded and really empty
                        if (
                            (tracks.kind.toLowerCase() === 'chapters') &&
                            (tracks.cues !== null) /*&&
                            (!Object.is(self._chaptertracks, tracks))*/) {
                                self.add_plane(plane_name, __['chapters'], {'aside' : 'chapters'});
                                self.clear_plane(plane_name);
                                _build_from_track(tracks)
                        }
                    }
                }
            }
        }

        if (self.element.tagName === CpuAudioTagName) {
            let body_class = `cpu_tag_«${audiotag.id}»_chaptered`;
            if (has) {
                // indicate in host page that audio tag chapters are listed
                // see https://github.com/dascritch/cpu-audio/issues/36
                document.body.classList.add(body_class);
            } else {
                self.remove_plane(plane_name);
                document.body.classList.remove(body_class);
            }

        }

    }

    //
    // @brief Builds or refresh the playlist panel. Should be called only for
    // <cpu-controller>
    // @public
    //
    build_playlist() {
        // Note that ONLY the global controller will display the playlist. For now.

        let playlist_element = this.elements['playlist'];
        playlist_element.innerHTML = '';

        let current_playlist = document.CPU.find_current_playlist();
        if (current_playlist === null) {
            return;
        }

        playlist_element.innerHTML = `<h6>${__['playlist']}</h6>`;
        for (let audiotag_id of current_playlist) {
            let audiotag = document.getElementById(audiotag_id);
            
            let line = document.createElement('a');
            line.classList.add('cue');

            if (audiotag_id === this.audiotag.id) {
                line.classList.add('active-cue');
            }
            line.href = `#${audiotag.id}&t=0`;
            line.tabIndex = 0;
            line.innerHTML = `<strong>${audiotag.dataset.title}</strong>`;
            playlist_element.append(line);
        }

    }
    // @private, because at start
    //
    // @brief Builds the controller.
    //
    build_controller() {

        this.element.classList.add(this.classname);

        // the following mess is to simplify sub-element declaration and selection
        let controller = this;
        querySelector_apply('[id]', function (element) {
            controller.elements[element.id] = element;
        }, this.element.shadowRoot);
        this.elements['poster'].addEventListener('load', function () {
            controller.elements['interface'].classList.add('poster-loaded'); 
        });

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

        // keyboard management
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

    }
};