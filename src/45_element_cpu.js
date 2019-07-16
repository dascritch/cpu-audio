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
		let _attr = audiotag.getAttribute('preload');
		let _preload = _attr ? (_attr.toLowerCase() !== 'none') : true ;
		if ( (audiotag.readyState < audiotag.HAVE_CURRENT_DATA ) && 
				((_preload) || (audiotag._CPU_played)) ) {
			this.set_act_container('loading');
			return;
		}

		this.set_act_container(audiotag.paused ? 'pause' : 'play');
		let hide_panels_except_play_mark = 'last-used';

		let previous_audiotag = document.CPU.last_used;

		if (!audiotag.paused) {
			audiotag._CPU_played = true;
			this.container.classList.add(hide_panels_except_play_mark);
			if (this.mode_when_play !== null) {
				this.set_mode_container(this.mode_when_play);
				this.mode_when_play = null;
			}
		} else {
			if (! this.audiotag.isEqualNode(previous_audiotag)) {
				this.container.classList.remove(hide_panels_except_play_mark);
			}
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
		let _is_at = canonical.indexOf('#'); 

		link_to += ((_is_at === -1) ? audiotag.id : canonical.substr(_is_at+1) )+'&t='+timecode;

		let elapse_element = this.elements['elapse'];
		elapse_element.href = link_to;

		let total_duration = '…';
		let _natural = Math.round(audiotag.duration);
		if (!isNaN(_natural)){
			total_duration = convert.SecondsInColonTime(_natural);
		} else {
			let _forced = Math.round(audiotag.dataset.duration);
			if (_forced > 0) {
				total_duration = convert.SecondsInColonTime(_forced);
			}
		}
		 
		let colon_time = convert.SecondsInColonTime(audiotag.currentTime);
		elapse_element.innerHTML = `${colon_time}<span class="nosmaller">\u00a0/\u00a0${total_duration}</span>`;

		/* see https://github.com/dascritch/cpu-audio/issues/63
		let inputtime_element = this.elements['inputtime'];
		// How to check a focused element ? document.activeElement respond the webcomponent tag :/ You must call shadowRoot.activeElement
		if (!inputtime_element.isEqualNode(this.element.shadowRoot.activeElement)) {
			inputtime_element.value = convert.SecondsInPaddledColonTime( audiotag.currentTime );  // yes, this SHOULD be in HH:MM:SS format precisely
		}
		inputtime_element.max = convert.SecondsInPaddledColonTime(audiotag.duration);
		*/
		this.update_line('loading', audiotag.currentTime);
		this.update_buffered();
	}
	//
	// @brief  Shows indicators for the limits of the playing position
	// @private
	//
	update_time_borders() {
		let audiotag = this.audiotag;
		let plane = '_borders';
		if ((!document.CPU.is_audiotag_global(audiotag)) || (trigger._timecode_end === false)) {
			this.remove_plane(plane);
			return;
		}
		if (this.get_plane(plane)) {
			// this.draw_plane(plane); /// bancal, ya surement mieux
			return;
		}
		this.add_plane(plane,'',{ 
			track   : 'borders',
			panel   : false,
			highlight : false
		});
		this.add_point(plane, trigger._timecode_start, 'play', {
			link    : false,
			end     : trigger._timecode_end
		});

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
		this.elements['poster'].src = dataset.poster === null ? '' : dataset.poster;
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
	 * Gets the plane info
	 * @private
	 *
	 * @param      {string}  plane_name     The name
	 * @return     {object}                 data of the plane
	 */
	get_plane(plane_name) {
		return this.audiotag._CPU_planes[plane_name];
	}

	/**
	 * Gets the plane track element
	 * @private
	 *
	 * @param      {string}  plane_name   The name
	 * @return     {HTMLElement}    The <aside> track element from ShadowDom interface
	 */
	get_plane_track(plane_name) {
		return this.elements['line'].querySelector(`#track_«${plane_name}»`);
	}

	/**
	 * Gets the plane panel element
	 * @private
	 *
	 * @param      {string}  plane_name   The name
	 * @return     {HTMLElement}    The panel element from ShadowDom interface
	 */
	get_plane_panel(plane_name) {
		return this.container.querySelector(`#panel_«${plane_name}»`);
	}

	/**
	 * Gets the <nav> plane panel element
	 * @private
	 *
	 * @param      {string}  plane_name   The name
	 * @return     {HTMLElement}    The <nav> element from ShadowDom interface, null if inexisting
	 */
	get_plane_nav(plane_name) {
		let panel = this.get_plane_panel(plane_name);
		return panel ? panel.querySelector(`nav`) : null;
	}

	/**
	 * Draws a plane
	 * @private
	 *
	 * @param      {<type>}  plane_name  The plane name
	 */
	draw_plane(plane_name) {
		let plane_track = this.get_plane_track(plane_name);
		if (plane_track) {
			plane_track.remove();
		}
		let plane_panel = this.get_plane_panel(plane_name);
		if (plane_panel) {
			plane_panel.remove();
		}

		let data = this.get_plane(plane_name);
		if (!data) {
			return ;
		}
		let highlight_preview = trigger.preview_container_hover;
		let remove_highlights_points_bind = this.remove_highlights_points.bind(this);
		function assign_events(element) {
			element.addEventListener('mouseover', highlight_preview, passive_ev);
			element.addEventListener('focusin', highlight_preview, passive_ev);
			element.addEventListener('mouseleave', remove_highlights_points_bind, passive_ev);
			element.addEventListener('focusout', remove_highlights_points_bind, passive_ev);            
		}

		if (data.track !== false) {
			plane_track = document.createElement('aside');
			plane_track.id = `track_«${plane_name}»`;
			if (data.track !== true) {
				plane_track.classList.add(data.track);
			}
			
			this.elements['line'].appendChild(plane_track);
			assign_events(plane_track);
		}

		if (data.panel !== false) {
			plane_panel = document.createElement('div');
			plane_panel.id = `panel_«${plane_name}»`;
			if (data.panel !== true) {
				plane_panel.classList.add(data.panel);
			}

			plane_panel.classList.add('panel');
			let inner = '<nav></nav>';

			if (data['title'] !== undefined) {
				inner = `<h6>${escapeHTML(data['title'])}</h6>${inner}`;
			}
			plane_panel.innerHTML = inner;
			this.container.appendChild(plane_panel);
			assign_events(plane_panel);
		}

		if (
			(this.element.tagName !== CpuControllerTagName) &&
			(document.CPU.global_controller !== null) &&
			(this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
			) {
			document.CPU.global_controller.draw_plane(plane_name);
		}

	}

	//
	// @brief Add an annotation plane layer
	// @public
	//
	// @param      {string}  plane_name     A name in the range /[a-zA-Z0-9\-_]+/
	// @param      {string}  title          The displayed title for the panel
	// @param      {object}  data           { track : true/false/classname , panel : true/false/classname , highlight : true/false }
	// 
	// @return     {boolean} success
	//
	add_plane(plane_name, title, data) {
		if ((this.element.tagName === CpuControllerTagName) || (! plane_name.match(valid_id)) || (this.get_plane(plane_name) !== undefined)) {
			return false;
		}

		if (data === undefined) {
			data = {};
		} 

		if (this.audiotag._CPU_planes === undefined) {
			this.audiotag._CPU_planes = {};
		}
		let default_values = {
			'track'     : true,
			'panel'     : true,
			'title'     : title,
			'highlight' : true,
			'points'    : {}
		}

		for (let key in default_values) {
			if (data[key] === undefined) {
				data[key] = default_values[key];
			}
		}

		this.audiotag._CPU_planes[plane_name] = data;
		this.draw_plane(plane_name);
		return true;
	}
	//
	// @brief Remove an annotation plane layer
	// @public
	//
	// @param      {string}  name   A name in the range /[a-zA-Z0-9\-_]+/
	// 
	// @return     {boolean} success
	//
	remove_plane(name) {
		if ( (this.element.tagName === CpuControllerTagName) || (! name.match(valid_id)) || (this.audiotag._CPU_planes[name] === undefined)) {
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
			// as plane data is removed, it will remove its aside and track 
			document.CPU.global_controller.draw_plane(name);
		}

		return true;
	}

	/**
	 * Gets the point track identifier.
	 * @private
	 *
	 * @param      {string}  plane_name  The plane name
	 * @param      {string}  point_name  The point name
	 * @param      {boolean} panel       Is panel (true) or track (false)
	 * @return     {string}  The point track identifier.
	 */
	get_point_id(plane_name, point_name, panel) {
		return `${panel?'panel':'track'}_«${plane_name}»_point_«${point_name}»`;
	}

	/**
	 * Gets the point info
	 * @private
	 *
	 * @param      {string}  plane_name  The plane name
	 * @param      {string}  point_name  The point name
	 * @return     {object}  Data
	 */
	get_point(plane_name, point_name) {
		return this.audiotag._CPU_planes[plane_name].points[point_name];
	}

	/**
	 * Gets the point element in the track
	 * @private
	 *
	 * @param      {string}  name   The name
	 * @return     {HTMLElement}    The <div> point element into <aside> from ShadowDom interface
	 */
	get_point_track(plane_name, point_name) {
		return this.elements['line'].querySelector('#' + this.get_point_id(plane_name, point_name, false));
	}

	/**
	 * Gets the point element in the panel
	 * @private
	 *
	 * @param      {string}  name   The name
	 * @return     {HTMLElement}    The <li> point element into panel from ShadowDom interface
	 */
	get_point_panel(plane_name, point_name) {
		return this.container.querySelector('#' + this.get_point_id(plane_name, point_name, true));
	}

	/**
	 * Transform VTT tag langage into HTML tags, filtering out some
	 *
	 * @param      {string}            vtt_taged  The vtt tagged
	 * @return     string                         HTML tagged string
	 */
	translate_vtt(vtt_taged) {
		// NEVER EVER BELIEVE you can parse HTML with regexes ! This function works because we just do minimalistic changes

		let acceptables = {
			'i'     : 'i',
			'em'    : 'em', // (not in the standard but used in legacy CPU.pm show)
			'b'     : 'b', 
			'bold'  : 'strong', // (declared in the MDN page, but never seen in standards pages)
			'u'     : 'u',
			'lang'  : 'i' // emphasis for typographic convention
		};

		function not_acceptable_tag(name) {
			return !(name in acceptables);
		}

		function opentag(tag, name, class_name, attribute) {
			name = name.toLowerCase();
			if (not_acceptable_tag(name)) {
				return '';
			}
			let $_attr = '';
			if (name === 'lang') {
				$_attr = ` lang="${attribute.trim()}"`;
			}
			return `<${acceptables[name]}${$_attr}>`;
		}

		function closetag(tag, name) {
			name = name.toLowerCase();
			if (not_acceptable_tag(name)) {
				return '';
			}
			return `</${acceptables[name]}>`;
		}

		if ((vtt_taged.match(/</g)||[]).length !== (vtt_taged.match(/>/g)||[]).length) {
			// unmatching < and >, probably badly written tags, or in full text
			return escapeHTML(vtt_taged);
		}

		return vtt_taged.
				replace(/<(\w+)(\.[^>]+)?( [^>]+)?>/gi, opentag).
				replace(/<\/(\w+)( [^>]*)?>/gi, closetag).
				replace(/\n/g, '<br/>');
	}

	/**
	 * Draws a plane point
	 * @private
	 *
	 * @param      {<type>}  plane_name  The plane name
	 * @param      {<type>}  point_name  The point name
	 */
	draw_point(plane_name, point_name) {
		let plane_point_panel = this.get_point_panel(plane_name, point_name);
		if (plane_point_panel) {
			plane_point_panel.remove();
		}
		let plane_point_track = this.get_point_track(plane_name, point_name);
		if (plane_point_track) {
			plane_point_track.remove();
		}

		let data = this.get_point(plane_name, point_name);
		let audiotag = this.audiotag ? this.audiotag : document.CPU.global_controller.audiotag;
		let audio_duration = audiotag.duration;
		let track = this.get_plane_track(plane_name);
		let panel = this.get_plane_nav(plane_name);

		let intended_track_id = this.get_point_id(plane_name, point_name, false);
		let intended_panel_id = this.get_point_id(plane_name, point_name, true);

		if (track) {
			let point_element = document.createElement('a');
			point_element.id = intended_track_id;
			point_element.tabIndex = -1;

			if (data['link'] !== false) {
				point_element.href = `#${audiotag.id}&t=${data['start']}`;
			}
			point_element.title = data['text'];
			let inner = '';
			if (data['image']) {
				inner = `<img src="${data['image']}" alt="">`;
			}
			inner += `<span>${data['text']}</span>`;
			point_element.innerHTML = inner;
			point_element.title = point_element.innerText;

			track.appendChild(point_element);
			
			point_element.style.left = `${100 * (data['start'] / audio_duration)}%`;
			if (data['end']) {
				point_element.style.right = `${100 - 100 *( data['end'] / audio_duration)}%`;
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
			panel.appendChild(li);
		}

		if (
			(this.element.tagName !== CpuControllerTagName) &&
			(document.CPU.global_controller !== null) &&
			(this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
			) {
			document.CPU.global_controller.draw_point(plane_name, point_name) 
		}
	}

	//
	// @brief Add an annotation
	// @public
	//
	// @param      {string}  plane_name      The existing plane name
	// @param      {number}  timecode_start  The timecode start for this annotation
	// @param      {<string} point_name      The point name, in the range /[a-zA-Z0-9\-_]+/
	// @param      {<type>}  data            object : { 'image' : <url>, 'link' : <url>/true (in audio/false (none), 'text' : <text>, 'end' : <seconds> }
	// 
	// @return     {boolean} success
	//                        
	add_point(plane_name, timecode_start, point_name, data) {
		data = data === undefined ? {} : data;
		
		if ( (this.element.tagName === CpuControllerTagName) || (this.get_plane(plane_name) === undefined) || (this.get_point(plane_name, point_name) !== undefined) || (timecode_start < 0) || (!point_name.match(valid_id)) ) {
			return false;
		}

		data.start = timecode_start;
		this.audiotag._CPU_planes[plane_name].points[point_name] = data;
		this.draw_point(plane_name, point_name);

		return true;
	}
	//
	// @brief Remove an point from an annotation plane
	// @public
	//
	// @param      {string}   plane_name    A name in the range /[a-zA-Z0-9\-_]+/
	// @param      {string}   point_name    A name in the range /[a-zA-Z0-9\-_]+/
	// @return     {boolean}  success
	//
	remove_point(plane_name, point_name) {
		let point_track_element = this.get_point_track(plane_name, point_name);
		if (!point_track_element) {
			return false;
		}
		delete this.audiotag._CPU_planes[plane_name].points[point_name];
		point_track_element.remove();
		this.get_point_panel(plane_name, point_name).remove();

		if (
			(this.element.tagName !== CpuControllerTagName) &&
			(document.CPU.global_controller !== null) &&
			(this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
			) {
			document.CPU.global_controller.remove_point(plane_name, point_name);
		}
		return true;
	}

	/**
	 * Gets the plane point names from an id on a ShadowDOM element.
	 * @private
	 *
	 * @param      {string}  element_id  The element identifier
	 * @return     {[string, string]}    An array with two string : plane name and point name.
	 */
	get_point_names_from_id(element_id) {
		let plane_name = element_id.replace(plane_point_names_from_id,'$2');
		let point_name = element_id.replace(plane_point_names_from_id,'$5');
		return [plane_name, point_name];
	}

	/**
	 * Remove any points from an annotation plane
	 * @public
	 *
	 * @param      {string}  plane_name  The plane name
	 */
	clear_plane(plane_name) {
		let remove_from_data = this.get_plane(plane_name);
		if (!this.get_plane(plane_name)) {
			return false;   
		}

		for (let point_name of Object.keys(remove_from_data.points)) {
			this.remove_point(plane_name, point_name);
		}
		return true;
	}


	/**
	 * Clean up DOM elements of any annotations, before rebuild them
	 * @private
	 */
	undraw_all_planes() {
		querySelector_apply('aside , div.panel', function(element) { element.remove(); }, this.container);
	}

	/**
	 * Clear and redraw all planes, mainly when cpu-controller is changing
	 * targeted audio tag
	 * @public
	 */
	redraw_all_planes() {
		this.undraw_all_planes()
		for (let plane_name of Object.keys(this.audiotag._CPU_planes)) {
			this.draw_plane(plane_name);
			for (let point_name of Object.keys(this.audiotag._CPU_planes[plane_name].points)) {
				this.draw_point(plane_name, point_name);
			}
		}
	}

	/**
	 * Remove any previewes on plane points
	 * @public
	 *
	 * @param      {string}  class_name  Targeted class name, 'with-preview' by default
	 * @param      {boolean} mirror     Also act on linked cpu-controller/cpu-audio
	 */
	remove_highlights_points(class_name, mirror) {
		mirror = mirror === undefined ? true : mirror;
		class_name = (typeof class_name === 'string') ? class_name : preview_classname;
		querySelector_apply(`.${class_name}`,function (element) {
				element.classList.remove(class_name);
			},this.container);

		if (
			(mirror) &&
			(document.CPU.global_controller !== null) &&
			(this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
			) {
			if (this.element.tagName !== CpuControllerTagName) {
				document.CPU.global_controller.remove_highlights_points(class_name, false);
			} else {
				document.CPU.find_container(document.CPU.global_controller.audiotag).remove_highlights_points(class_name, false);
			}
		}
	}

	/**
	 * Sets a preview on a plane point
	 * @public
	 *
	 * @param      {string}  plane_name  The plane name
	 * @param      {string}  point_name  The point name
	 * @param      {string}  class_name  class name, 'with-preview' by default
	 * @param      {boolean} mirror     Also act on linked cpu-controller/cpu-audio
	 */
	highlight_point(plane_name, point_name, class_name, mirror) {
		mirror = mirror === undefined ? true : mirror;
		class_name = (typeof class_name === 'string') ? class_name : preview_classname;
		this.remove_highlights_points(class_name, mirror);

		if (!this.get_plane(plane_name)['highlight']) {
			return;
		}

		let track_element = this.get_plane_track(plane_name, point_name);
		if (track_element) {
			let point_track = this.get_point_track(plane_name, point_name);
			if (point_track) {
				point_track.classList.add(class_name);
			}
		}

		let panel_element = this.get_plane_panel(plane_name, point_name);
		if (panel_element) {
			let point_panel = this.get_point_panel(plane_name, point_name);
			if (point_panel) {
				point_panel.classList.add(class_name);
			}
		}

		if (
			(mirror) &&
			(document.CPU.global_controller !== null) &&
			(this.audiotag.isEqualNode(document.CPU.global_controller.audiotag))
			) {
			if (this.element.tagName !== CpuControllerTagName) {
				document.CPU.global_controller.highlight_point(plane_name, point_name, class_name, false);
			} else {
				document.CPU.find_container(document.CPU.global_controller.audiotag).highlight_point(plane_name, point_name, class_name, false);
			}
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
		if (this.element.tagName === CpuControllerTagName) {
			// not your job, CPUController
			return;
		}
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

				self.add_point(plane_name, cuepoint, cue.id,  {
					'text' : self.translate_vtt(cue.text),
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
					let chapter_track = null;

					for (let tracks of audiotag.textTracks) {
						// TODO : we have here a singular problem : how to NOT rebuild the chapter lists, being sure to have the SAME cues and they are loaded, as we may have FOUR builds.
						// Those multiple repaint events doesn't seem to have so much impact, but they are awful, unwanted and MAY have an impact
						// We must find a way to clean it up or not rebuild for SAME tracks, AND remove associated events 
						// AND clean up the chapter list if a new chapter list is loaded and really empty
						if (
							(tracks.kind.toLowerCase() === 'chapters') &&
							(tracks.cues !== null) &&  // linked to default="" attribute, only one per set !
							( (chapter_track === null) /* still no active track */ || (tracks.language.toLowerCase() === prefered_language) /* correspond to <html lang> */ )
								) {
							chapter_track = tracks;
						}
					}

					if (chapter_track) {
						self.add_plane(plane_name, __['chapters'], {'track' : 'chapters'});
						//self.add_plane(plane_name, __['chapters'], {'track' : 'ticker'});
						self.clear_plane(plane_name);
						_build_from_track(chapter_track)
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
		if (this.element.tagName !== CpuControllerTagName) {
			// Note that ONLY the global controller will display the playlist. For now.
			return;
		}

		let previous_playlist = this.current_playlist;
		this.current_playlist = document.CPU.find_current_playlist();
		if (previous_playlist === this.current_playlist) {
			return;
		}

		let playlist_element = this.elements['playlist'];
		playlist_element.innerHTML = '';

		if (this.current_playlist === null) {
			return;
		}

		playlist_element.innerHTML = `<h6>${__['playlist']}</h6>`;
		for (let audiotag_id of this.current_playlist) {
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
			'restart'   : trigger.restart,
		};
		for (let that in cliquables) {
			this.elements[that].addEventListener('click', cliquables[that]);
		}

		// handheld nav to allow long press to repeat action
		let _buttons = ['fastreward', 'reward', 'foward', 'fastfoward'];
		let _actions = {
			'touchstart'    : true,
			'touchend'      : false,
			'touchcancel'   : false,
			/* PHRACKING IOS PHRACKING SAFARI PHRACKING APPLE */
			'mousedown'     : true,
			'mouseup'       : false,
			'mouseleave'    : false
		};
		let _press = trigger._press_button;
		let _release = trigger._release_button;
		for (let that of _buttons) {
			for (let _act in _actions) {
				this.elements[that].addEventListener(_act, _actions[_act] ? trigger._press_button : trigger._release_button);
			}
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
			/* see https://github.com/dascritch/cpu-audio/issues/63
			this.elements['inputtime'].addEventListener('input', trigger.input_time_change);
			this.elements['inputtime'].addEventListener('change', trigger.input_time_change);
			*/

		this.show_main();
		this.build_chapters();
		let this_build_chapters = this.build_chapters.bind(this);
		// sometimes, we MAY have loose loading
		this.audiotag.addEventListener('loadedmetadata', this_build_chapters, passive_ev);
		let track_element = this.audiotag.querySelector('track[kind="chapters"]');
		if (track_element) {
			track_element.addEventListener('load', this_build_chapters, passive_ev);
		}

		this.audiotag.addEventListener('loadedmetadata', this.redraw_all_planes.bind(this), passive_ev);

	}
};