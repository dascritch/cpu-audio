import {dynamically_allocated_id_prefix, passive_ev, once_passive_ev, CpuControllerTagName, absolutize_url, escape_html, querySelector_apply, is_audiotag_streamed, error} from './utils.js';
import {__, prefered_language} from './i18n.js';
import {convert} from './convert.js';
import {trigger} from './trigger.js';
import {translate_vtt} from './translate_vtt.js';
import {finger_manager} from './finger_manager.js';


// Acceptables attributes values for hide="" parameter on webcomponent
const acceptable_hide_atttributes = ['poster', 'actions', 'timeline', 'chapters', 'panels', 'panels-title', 'panels-except-play'];

// should be put in CPU-controller ?
let preview_classname = 'with-preview';

// Regex used to validate planes, points and injected css names
const valid_id = /^[a-zA-Z0-9\-_]+$/;

// Regex for extracting plane and point names from an id
const plane_point_names_from_id = /^([a-zA-Z0-9\-_]+_«)([a-zA-Z0-9\-_]+)((»_.*_«)([a-zA-Z0-9\-_]+))?(»)$/;

export class CPU_element_api {
	/**
	 *
	 * @summary Constructs the object.
	 * @public
	 *
	 * @param      {Element}  element              The DOMelement
	 * @param      {Element}  container_interface  The container interface
	 */
	constructor(element, container_interface) {
		// I hate this style. I rather prefer the object notation
		this.element = element;
		this.elements = {};
		this.audiotag = /* @type {HTMLAudioElement} */ element._audiotag;
		this.container = container_interface;
		this.mode_when_play = null;
		this.glow_before_play = false;
		this.current_playlist = [];
		this._activecue = null;
		this.mode_was = null;
		this.act_was = null;
		this.elapse_was = null;

		if ( (this.audiotag) && (! this.audiotag._CPU_planes)) {
			this.audiotag._CPU_planes = {};
		}

		this.is_controller = this.element.tagName === CpuControllerTagName;
	}

	mirrored_in_controller() {
		return (document.CPU.global_controller !== null) && (this.audiotag.isEqualNode(document.CPU.global_controller.audiotag));
	}

	/**
	 * @summary    create and fire custom events for the global document.
	 * @private
	 *
	 * We async-ed it, to avoid ultra-probable performances issues
	 *
	 * @param      {string}            event_name  The event name, will be prefixed with CPU_
	 * @param      {Object|undefined}  detail      Specific public informations about the event
	 * @return     {Promise}           { description_of_the_return_value }
	 */
	async fire_event(event_name, detail = undefined) {
		/**
		 * Events to be created :
		 *  - plane CRUD
		 *  - point CRUD
		 */
		this.element.dispatchEvent(
			new CustomEvent(`CPU_${event_name}`, {
				target : this.element,
				bubbles : true,
				cancelable : false,
				composed : false,
				detail : detail
			})
		);
	}

	/**
	 * @summary Used for `mode=""` attribute. 
	 * @public
	 *
	 * @param      {string|null}  mode    Accepted are only in `/\w+/` format, 'default' by default
	 */
	set_mode_container(mode=null) {
		mode = mode !== null ? mode : 'default';
		if (this.mode_was === mode) {
			return;
		}
		this.container.classList.remove(`mode-${this.mode_was}`);
		this.container.classList.add(`mode-${mode}`);
		this.mode_was = mode;
	}
	/**
	 * @summary Change the presentation style reflecting the media tag status
	 * @public
	 *
	 * @param      {string}  act     can be 'loading', 'pause', 'glow' or 'play'
	 */
	set_act_container(act) {
		if (this.act_was === act) {
			return;
		}
		if ( (! document.CPU.had_played) && (this.act_was !== null) && (act === 'loading') ){
			return;
		}
		let classes = this.container.classList;
		classes.remove(
			'act-loading',
			'act-buffer',
			'act-pause',
			'act-play',
			'act-glow'
			);
		classes.add(`act-${act}`);
		if ((this.act_was === 'play') && (act === 'loading')) {
			classes.add(`act-buffer`);
		}
		this.act_was = act;
	}
	/**
	 * @public
	 * @summary Hide some blocks in the interface
	 * used for `hide=""` attribute
	 *
	 * @param      {Array<string>}  hide_elements  Array of strings, may contains
	 *                                        'actions' or 'chapters'
	 */
	set_hide_container(hide_elements) {
		for (let hide_this of acceptable_hide_atttributes) {
			this.container.classList.remove(`hide-${hide_this}`);
		}

		for (let hide_this of hide_elements) {
			hide_this = hide_this.toLowerCase();
			if (acceptable_hide_atttributes.indexOf(hide_this)>-1) {
				this.container.classList.add(`hide-${hide_this}`);
			}
		}
	}

	/**
	 * @public
	 * @summary update play/pause button according to media status
	 */
	update_playbutton() {
		let audiotag = this.audiotag;
		let _attr = audiotag.getAttribute('preload');
		let _preload = _attr ? (_attr.toLowerCase() !== 'none') : true ;
		if ( 
				(audiotag.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ) && 
				((_preload) || (audiotag._CPU_played)) 
			) {
			this.set_act_container('loading');
			return;
		}

		let will_act = 'play';
		if (audiotag.paused) {
			will_act = 'pause';
			if ((!audiotag._CPU_played) && (this.glow_before_play)) {
				// TODO check option
				will_act = 'glow';
			}
		}

		this.set_act_container(will_act);
		let hide_panels_except_play_mark = 'last-used';

		if (!audiotag.paused) {
			audiotag._CPU_played = true;
			this.container.classList.add(hide_panels_except_play_mark);
			if (this.mode_when_play !== null) {
				this.set_mode_container(this.mode_when_play);
				this.mode_when_play = null;
			}
		} else {
			if (! this.audiotag.isEqualNode(document.CPU.last_used)) {
				this.container.classList.remove(hide_panels_except_play_mark);
			}
		}
	}

	/**
	 * @summary Update time-line length
	 * @private
	 *
	 * @param      {number}  seconds  The seconds
	 * @param      {number|undefined=}  ratio    ratio position in case time position are still unknown
	 */
	update_line(seconds, ratio=undefined) {
		let duration = this.audiotag.duration;
		if (ratio === undefined) {
			ratio = duration === 0 ? 0 : (100*seconds / duration);
		}
		this.elements[`loadingline`].style.width = `${ratio}%`;
	}

	/**
	 * @summary update current timecode and related links
	 * @private
	 */
	update_time() {
		let audiotag = this.audiotag;
		let timecode = is_audiotag_streamed(audiotag) ? 0 : Math.floor(audiotag.currentTime);
		let canonical = audiotag.dataset.canonical;
		canonical = canonical === undefined ? '' : canonical;
		let _is_at = canonical.indexOf('#');
		let elapse_element = this.elements['elapse'];
		elapse_element.href = `${ absolutize_url(canonical) }#${ (_is_at === -1) ? audiotag.id : canonical.substr(_is_at+1) }&t=${timecode}`;

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
		let innerHTML = is_audiotag_streamed(audiotag) ? colon_time :`${colon_time}<span class="nosmaller">\u00a0/\u00a0${total_duration}</span>`;

		if (this.elapse_was !== innerHTML) {
			elapse_element.innerHTML = innerHTML;
			this.elapse_was = innerHTML;
		}

		this.update_line(audiotag.currentTime);
	}

	/**
	 * @summary Shows indicators for the limits of the playing position
	 * @private
	 */
	update_time_borders() {
		let audiotag = this.audiotag;
		let plane_name = '_borders';
		let point_name = 'play';
		if ((!document.CPU.is_audiotag_global(audiotag)) || (trigger._timecode_end === false)) {
			this.remove_plane(plane_name);
			return;
		}
		// verify if plane exists, and point is invariant
		if (this.get_plane(plane_name)) {
			let check = this.get_point(plane_name, point_name);
			if ((check) && (check.start === trigger._timecode_start) && (check.end === trigger._timecode_end)) {
				return;
			}
		}

		this.add_plane(plane_name,'',{ 
			track   : 'borders',
			panel   : false,
			highlight : false
		});
		this.add_point(plane_name, trigger._timecode_start, point_name, {
			link    : false,
			end     : trigger._timecode_end
		});

	}
	/**
	 * @summary Show that the media is loading
	 * @private
	 *
	 * @param      {number}  seconds  The seconds
	 */
	update_loading(seconds, ratio) {
		this.update_line(seconds, ratio);
		this.set_act_container('loading');
	}

	/**
	 * @summary Show the current media error status. NOTE : this is not working, even on non supported media type
	 * Chrome logs an error « Uncaught (in promise) DOMException: Failed to load because no supported source was found. »
	 * but don't update message
	 *
	 * @private
	 *
	 * @return     {boolean}  True if an error is displayed
	 */
	update_error() {
		let audiotag = this.audiotag;
		if (audiotag === null) {
			return true;
		}
		let error_object = audiotag.error;
		if (error_object !== null) {
			let error_message;
			let pageerror = this.elements['pageerror'];
			this.show_interface('error');
			switch (error_object.code) {
				case MediaError.MEDIA_ERR_ABORTED:
					error_message = __.media_err_aborted;
					break;
				case MediaError.MEDIA_ERR_NETWORK:
					error_message = __.media_err_network;
					break;
				case MediaError.MEDIA_ERR_DECODE:
					error_message = __.media_err_decode;
					break;
				case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
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

	/**

	has_ticker_planes() {
		return this.elements['about'].querySelector('.ticker')
	}

	 @summary Displays a text in the infoline or hide it
	 * @public
	 *
	 * @param      {string} 			text     	HTML text to display. Or hide it if empty
	 * @param      {boolean} 			priority   	If set to true, will hide any track, else, will not be displayed if there is a track

	flash(text='') {
		// I still need to complete https://codepen.io/GoOz/pen/QWGGgOo
		let indication_classname = 'flash';
		let indicate_on = this.elements['about'];
		if (text) {
			indicate_on.classList.add(indication_classname);
			if (this.has_ticker_planes()) {
				// window.setTimeout(() => {this.flash()}, 2000, this);
			}
		} else {
			indicate_on.classList.remove(indication_classname);
			text = '';
		}
		this.elements['infoline'].innerHTML = text;
	}
	*/

	/**
	 * @summary Will refresh player interface at each time change (a lot)
	 *
	 * @private
	 */
	update() {
		if (!this.update_error()) {
			this.update_playbutton();
			this.update_time();
			this.update_time_borders();
		}
	}

	/**
	 * @summary Position an element in the timeline, on its time
	 * @private
	 *
	 * @param      {Element} 			      element         Element to impact, should be in #time
	 * @param      {number|undefined}   	  seconds_begin   Starts position in seconds, do not apply if undefined
	 * @param      {number|undefined|boolean} seconds_end     Ends position in seconds, do not apply if undefined or false
	 */	
	position_time_element(element, seconds_begin=undefined, seconds_end=undefined) {

		/**
          * @param  {number|undefined|boolean} sec  Is it a "seconds" value ?
          * @return {boolean}
          */
		function is_seconds(sec) {
			// completely ugly... but « WAT » ! as in https://www.destroyallsoftware.com/talks/wat
			return ((sec !== undefined) && (sec !== false));
		}
		let duration = this.audiotag.duration;

		if ((duration === 0) || (isNaN(duration))) {
			return;
			// duration still unkonw ! We will need to redraw later the tracks
		}

		if (is_seconds(seconds_begin)) {
			element.style.left =  `${100 * (seconds_begin / duration)}%`;
		}
		if (is_seconds(seconds_end)) {
			element.style.right = `${100 - (100 * (seconds_end / duration))}%`;
		}
		
	}

	/**
	 * @summary Shows the throbber
	 *
	 * @public
	 *
	 * @param      {number}  seeked_time  The seeked time
	 */
	async show_throbber_at(seeked_time) {
		let audiotag = this.audiotag;
		if (audiotag.duration < 1) {
			// do not try to show if no metadata
			return;
		}
		if ((isNaN(audiotag.duration)) && (!is_audiotag_streamed(audiotag))) {
			// as we navigate on the timeline, we wish to know its total duration
			// yes, this is twice calling, as of trigger.throbble() 
  			audiotag.setAttribute('preload', 'metadata'); 
		}

		let phylactere = this.elements['popup'];
		phylactere.style.opacity = 1;
		this.position_time_element(phylactere, seeked_time);
		phylactere.innerHTML = convert.SecondsInColonTime(seeked_time);
		phylactere.dateTime = convert.SecondsInTime(seeked_time).toUpperCase();
	}

	/**
	 * @summary Hides immediately the throbber.
	 * @public
	 */
	hide_throbber() {
		let phylactere = this.elements['popup'];
		phylactere.style.opacity = 0;
	}

	/**
	 * @summary Hides the throbber later. Will delay the hiding if recalled.
	 * @public
	 */
	hide_throbber_later() {
		let hide_throbber_delay = 1000;
		let phylactere = this.elements['popup'];
		if (phylactere._hider) {
			window.clearTimeout(phylactere._hider);
		}
		phylactere._hider = window.setTimeout(this.hide_throbber.bind(this), hide_throbber_delay);
	}

	/**
	 * @summary Will get presentation data from <audio> or from parent document
	 *
	 * @package
	 *
	 * @return     {Object}  dataset
	 */
	fetch_audiotag_dataset() {
		let dataset = {};
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

	/**
	 * @private
	 * still need to be public exposed for tests
	 *
	 * @summary Update links for sharing
	 */
	update_links() {
		let container = this;
		let audiotag = this.audiotag;

		/**
		 * @summary Assign an url to a link
		 *
		 * @param      {string}  category  The category
		 * @param      {string}  href      The link
		 */
		function ahref(category, href) {
			container.elements[category].href = href;
		}

		let dataset = this.fetch_audiotag_dataset();
		let canonical = absolutize_url( (dataset.canonical === null) ? '' : dataset.canonical );
		let timepos = (audiotag.currentTime === 0)  ? '' : `&t=${Math.floor(audiotag.currentTime)}`;
		// watch out : we should put the ID only if canonical URL is strictly identical to this page 
		let tag_id =  canonical === absolutize_url(window.location.href) ? audiotag.id : '';
		let _url = encodeURIComponent(`${canonical}#${tag_id}${timepos}`);
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
		let download_link = audiotag.currentSrc;
		if (dataset.download) {
			download_link = dataset.download;
		}
		let prerefed_audio_src = audiotag.querySelector('source[data-downloadable]');
		if (prerefed_audio_src) {
			download_link = prerefed_audio_src.src;
		}
		ahref('link', download_link);
	}

	/**
	 * @summary Shows the interface
	 *
	 * @public
	 * @param      {string}  mode    The mode, can be 'main', 'share' or 'error'
	 */
	show_interface(mode) {
		let classlist = this.container.classList;
		classlist.remove('show-no', 'show-main', 'show-share', 'show-error', 'media-streamed');
		if (is_audiotag_streamed(this.audiotag)) {
			classlist.add('media-streamed');
		}
		classlist.add(`show-${mode}`);
	}

	/**
	 * @summary Shows the sharing panel
	 *
	 * @private
	 * @param      {Object}  event   The event
	 */
	show_actions(/* event */) {
		this.show_interface('share');
		this.update_links();
	}

	/**
	 * @summary Shows the main manel
	 *
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	show_main(/* event */) {
		this.show_interface('main');
	}

	/**
	 * @package not mature enough
	 *
	 * @summary Shows the handheld fine navigation
	 *
	 * @param      {Object}  event   The event
	 */
	show_handheld_nav(event) {
		if (is_audiotag_streamed(this.audiotag)) {
			return;
		}
		this.container.classList.toggle('show-handheld-nav');
		if ((event) && (event.preventDefault)) {
			event.preventDefault();
		}
	}

	/**
	 * @summary Inject a <style> into the shadowDom
	 *
	 * @public
	 *
	 * @param 	{string}  style_key   	A name in the range /[a-zA-Z0-9\-_]+/, key to tag the created <style>
	 * @param 	{string}  css 			inline CSS to inject
	 */
	inject_css(style_key, css) {
		if (!style_key.match(valid_id)) {
			error(`inject_css invalid key "${style_key}"`);
			return;
		}

		this.remove_css(style_key);
		let element = document.createElement('style');
		element.id = `style_${style_key}`;
		element.innerHTML = css;
		this.container.appendChild(element);
	}

	/**
	 * @summary Remove an injected <style> into the shadowDom
	 *
	 * @public
	 *
	 * @param 	{string}  style_key   	Key of the created <style> , /[a-zA-Z0-9\-_]+/
	 */
	remove_css(style_key) {
		let element = this.container.querySelector(`#style_${style_key}`);
		if (element) {
			element.remove();
		}
	}

	/**
	 * @summary Adds an identifier to audiotag at build time.
	 * @private
	 */
	add_id_to_audiotag() {
		if (this.audiotag.id === '') {
			this.audiotag.id = dynamically_allocated_id_prefix + String(document.CPU.count_element++);
		}
	}

	/**
	 * @summary Complete the interface at build time
	 * @package
	 */
	complete_template() {
		let dataset = this.fetch_audiotag_dataset();
		let element_canonical = this.elements['canonical'];

		element_canonical.href = dataset.canonical;

		if (dataset.title === null) {
			element_canonical.classList.add('untitled');
			dataset.title = __.untitled;
		} else {
			element_canonical.classList.remove('untitled');
		}
		element_canonical.innerText = dataset.title;
		if (this.element.title !== dataset.title) {
			this.element.title = dataset.title; // WATCHOUT ! May goes recursive with observers
		}
		this.elements['poster'].src = dataset.poster === null ? '' : dataset.poster;
		this.elements['time'].style.backgroundImage = (dataset.waveform === null) ? '' : `url(${dataset.waveform})`;
	}
	/**
	 * @summary Attach the audiotag to the API
	 * @package
	 *
	 * @param      {Element}  audiotag  The audiotag
	 */
	attach_audiotag_to_controller(audiotag) {
		if (!audiotag) {
			return;
		}
		this.audiotag = audiotag;
		this.add_id_to_audiotag();
		this.complete_template();

		// throw simplified event
		trigger.update({target : audiotag});
	}


	/**
	 * @summary Gets the plane info
	 * @private
	 *
	 * @param      {string}  plane_name     The name
	 * @return     {Object}                 data of the plane
	 */
	get_plane(plane_name) {
		return this.audiotag._CPU_planes[plane_name];
	}

	/**
	 * @summary Gets the plane track element
	 * @private
	 *
	 * @param      {string}  plane_name   The name
	 * @return     {Element}    The <aside> track element from ShadowDom interface
	 */
	get_plane_track(plane_name) {
		return this.elements['line'].querySelector(`#track_«${plane_name}»`);
	}

	/**
	 * @summary Gets the plane panel element
	 * @private
	 *
	 * @param      {string}  plane_name   The name
	 * @return     {Element}    The panel element from ShadowDom interface
	 */
	get_plane_panel(plane_name) {
		return this.container.querySelector(`#panel_«${plane_name}»`);
	}

	/**
	 * @summary Gets the <nav><ul> plane panel element
	 * @private
	 *
	 * @param      {string}  plane_name   The name
	 * @return     {Element}    The <ul> element from ShadowDom interface, null if inexisting
	 */
	get_plane_nav(plane_name) {
		let panel = this.get_plane_panel(plane_name);
		return panel ? panel.querySelector(`ul`) : null;
	}

	/**
	 * @summary Draws a plane
	 * @private
	 *
	 * @param      {string}  plane_name  The plane name
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

		/**
		 * @param      {Element}  element  Impacted element
		 */
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
				plane_track.classList.add(data.track.split(' '));
			}
			
			this.elements['line'].appendChild(plane_track);
			assign_events(plane_track);
		}

		if (data.panel !== false) {
			plane_panel = document.createElement('div');
			plane_panel.id = `panel_«${plane_name}»`;
			if (data.panel !== true) {
				plane_panel.classList.add(data.panel.split(' '));
			}

			plane_panel.classList.add('panel');
			let inner = '<nav><ul></ul></nav>';

			if (data['title'] !== undefined) {
				inner = `<h6>${escape_html(data['title'])}</h6>${inner}`;
			}
			plane_panel.innerHTML = inner;
			this.container.appendChild(plane_panel);
			assign_events(plane_panel);
		}

		if ( (!this.is_controller) && (this.mirrored_in_controller()) ) {
			document.CPU.global_controller.draw_plane(plane_name);
		}

	}

	/**
	 * @summary Add an annotation plane layer
	 * @public
	 *
	 * @param      {string}   plane_name  A name in the range /[a-zA-Z0-9\-_]+/
	 * @param      {string}   title       The displayed title for the panel
	 * @param      {Object}   data        { track : true/false/classnames , 
	 * 										panel : true/false/classnames , 
	 * 										highlight : true/false }
	 *
	 * @return     {boolean}  success
	 */
	add_plane(plane_name, title, data) {
		if ((this.is_controller) || (! plane_name.match(valid_id)) || (this.get_plane(plane_name) !== undefined)) {
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
		};

		for (let key in default_values) {
			if (data[key] === undefined) {
				data[key] = default_values[key];
			}
		}

		this.audiotag._CPU_planes[plane_name] = data;
		this.draw_plane(plane_name);
		return true;
	}
	/**
	 * @summary Remove an annotation plane layer
	 * @public
	 *
	 * @param      {string}   name    A name in the range /[a-zA-Z0-9\-_]+/
	 *
	 * @return     {boolean}  success
	 */
	remove_plane(name) {
		if ( (this.is_controller) || (! name.match(valid_id)) || (this.audiotag._CPU_planes[name] === undefined)) {
			return false;
		}
		if (this.audiotag) {
			// we are perhaps in <cpu-controller>
			delete this.audiotag._CPU_planes[name];
		}
		let remove_element = this.get_plane_track(name);
		if (remove_element) {
			remove_element.remove();
		}
		remove_element = this.get_plane_panel(name);
		if (remove_element) {
			remove_element.remove();
		}

		if ( (!this.is_controller) && (this.mirrored_in_controller()) ) {
			// as plane data is removed, it will remove its aside and track 
			document.CPU.global_controller.draw_plane(name);
		}

		return true;
	}

	/**
	 * @summary Shortcut to get  points data
	 * @private
	 *
	 * @param      {string}  plane_name  The plane name
	 * @return     {Object}  Data
	 */
	plane_points(plane_name) {
		return this.audiotag._CPU_planes[plane_name].points;
	}

	/**
	 * @summary Gets the point track identifier
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
	 * @summary Gets the point info
	 * @private
	 *
	 * @param      {string}  plane_name  The plane name
	 * @param      {string}  point_name  The point name
	 * @return     {Object}  Data
	 */
	get_point(plane_name, point_name) {
		return this.plane_points(plane_name)[point_name];
	}

	/**
	 * @summary Gets the point element in the track
	 * @private
	 *
	 * @param      {string}  plane_name   The plane
	 * @param      {string}  point_name   The point
	 * @return     {Element}    The <div> point element into <aside> from ShadowDom interface
	 */
	get_point_track(plane_name, point_name) {
		return this.elements['line'].querySelector(`#${this.get_point_id(plane_name, point_name, false)}`);
	}

	/**
	 * @summary Gets the point element in the panel
	 * @private
	 *
	 * @param      {string}  plane_name   The plane
	 * @param      {string}  point_name   The point
	 * @return     {Element}    The <li> point element into panel from ShadowDom interface
	 */
	get_point_panel(plane_name, point_name) {
		return this.container.querySelector(`#${this.get_point_id(plane_name, point_name, true)}`);
	}

	/**
	 * @summary Transform VTT tag langage into HTML tags, filtering out some
	 * (needed @public mainly for tests. Moving it up and do those tests in CLI will make it @private-izable)
	 *
	 * @param      {string}            vtt_taged  The vtt tagged
	 * @return     string                         HTML tagged string
     */
	translate_vtt(vtt_taged) {
		return translate_vtt(vtt_taged);
	}

	/**
	 * @summary    Resort points of a plane by start-time
	 * @private
	 * 
	 * ok, i found it on https://stackoverflow.com/questions/1069666/sorting-object-property-by-values#answer-1069840
	 *
	 * @param      {string}   plane_name     The plane name
	 */
	plane_resort(plane_name) {
		this.audiotag._CPU_planes[plane_name].points = Object.fromEntries(
		    Object.entries(this.plane_points(plane_name)).sort(
		    	(point_a, point_b) => {
		    		return point_a[1].start - point_b[1].start;
		    	}
		    )
		);
	}

	/**
	 * @summary    Reorder panel of a plane by points order
	 * @private
	 * 
	 * @param      {string}   plane_name     The plane name
	 */
	panel_reorder(plane_name) {
		this.plane_resort(plane_name); 
		if (!this.get_plane_panel(plane_name)) {
			return;
		}
		let previous_element, element;
		for (let point_name of Object.keys(this.plane_points(plane_name))) {

			element = this.get_point_panel(plane_name, point_name);
			if (previous_element) {
				previous_element.insertAdjacentElement('afterend', element); 
			}
			previous_element = element;
		}
	}

	/**
	 * @summary Draws a plane point
	 * @private
	 *
	 * @param      {string}  plane_name  The plane name
	 * @param      {string}  point_name  The point name
	 */
	draw_point(plane_name, point_name) {
		let data = this.get_point(plane_name, point_name);
		let audiotag = this.audiotag ? this.audiotag : document.CPU.global_controller.audiotag;

		let start = data['start'];
		let data_link = data['link'];
		let link = '#';
		let time_url = `#${audiotag.id}&t=${start}`;

		if (data_link === true) {
			// automated link to the audio tag.
			// if the parameter is a string, use it as a simple link
			link = time_url;
		}
		if (typeof(data_link) === 'string') {
			// Author of the page wants a specific url (hoping he know what he do with a "javascript:")
			link = data_link;
		}

		let track = this.get_plane_track(plane_name);
		let plane_point_track;
		if (track) {
			plane_point_track = this.get_point_track(plane_name, point_name);
			let intended_track_id = this.get_point_id(plane_name, point_name, false);
			if (!plane_point_track) {
				plane_point_track = document.createElement('a');
				plane_point_track.id = intended_track_id;
				plane_point_track.tabIndex = -1;
				track.appendChild(plane_point_track);
			}
			plane_point_track.href = link;

			plane_point_track.title = data['text'];
			let inner = '';
			if (data['image']) {
				inner = `<img src="${data['image']}" alt="">`;
			}
			inner += `<span>${data['text']}</span>`;
			plane_point_track.innerHTML = inner;
			this.position_time_element(plane_point_track, start, data['end']);
		}

		let panel = this.get_plane_nav(plane_name);
		let plane_point_panel;
		if (panel) {
			plane_point_panel = this.get_point_panel(plane_name, point_name);
			let intended_panel_id = this.get_point_id(plane_name, point_name, true);
			if (!plane_point_panel) {
				plane_point_panel = document.createElement('li');
				plane_point_panel.id = intended_panel_id;
				plane_point_panel.innerHTML='<a href="#" class="cue"><strong></strong><time></time></a>';
				panel.appendChild(plane_point_panel);
			}

			plane_point_panel.querySelector('strong').innerHTML = data['text'];
			// see string format for valid duration time https://www.w3.org/TR/2014/REC-html5-20141028/infrastructure.html#valid-duration-string
			let time_element = plane_point_panel.querySelector('time');
			time_element.dateTime = convert.IsoDuration(start);
			time_element.innerText = convert.SecondsInColonTime(start);

			let action_element = plane_point_panel.querySelector('a');
			action_element.href = link;
		}

		this.fire_event('draw_point', {
			plane : plane_name,
			point : point_name,
			data_point :  data,
			element_point_track : plane_point_track,
			element_point_panel : plane_point_panel,
		});

		if ( (!this.is_controller) && (this.mirrored_in_controller()) ) {
			document.CPU.global_controller.draw_point(plane_name, point_name);
		}
	}

	/**
	 * @summary Add an annotation point
	 * @public
	 *
	 * @param      {string}   plane_name      The existing plane name
	 * @param      {number}   timecode_start  The timecode start for this annotation
	 * @param      {string}   point_name      The point name, should conform to /^[a-zA-Z0-9\-_]+$/
	 * @param      {Object}   data            { 'image' : <url>, 
	 * 											'link' : <url>/true (in audio)/false (none), 
	 * 											'text' : <text>, 
	 * 											'end'  : <seconds> }
	 *
	 * @return     {boolean}  success
	 */
	add_point(plane_name, timecode_start, point_name, data) {
		data = data === undefined ? {} : data;
		
		if ( (this.is_controller) || (this.get_plane(plane_name) === undefined) || (this.get_point(plane_name, point_name) !== undefined) || (timecode_start < 0) || (!point_name.match(valid_id)) ) {
			return false;
		}

		data['start'] = timecode_start;
		this.audiotag._CPU_planes[plane_name].points[point_name] = data;

		this.fire_event('add_point', {
			plane : plane_name,
			point : point_name,
			data_point :  data
		});

		if (this.audiotag._CPU_planes[plane_name]._st_max > timecode_start) {
			// we need to reorder the plane 
			this.panel_reorder(plane_name);
		} else {
			this.draw_point(plane_name, point_name);
			this.audiotag._CPU_planes[plane_name]._st_max = timecode_start;
		}

		return true;
	}

	/**
	 * @summary Edit an annotation point
	 * @public
	 *
	 * @param      {string}   plane_name      The existing plane name
	 * @param      {string}   point_name      The existing point name
	 * @param      {Object}   data            { 'image' : <url>, 
	 * 											'link'  : <url>/true (in audio)/false (none), 
	 * 											'text'  : <text>, 
	 * 											'start' : <seconds>, 
	 * 											'end'   : <seconds> }
	 *										  will only change keys in the list
	 */
	edit_point(plane_name, point_name, data) {
		let original_data = this.get_point(plane_name, point_name);
		let will_refresh = false;

		if (('start' in data) && (Number(data['start']) !== original_data['start'])) {
			will_refresh = true;
		}
		for (let key in original_data) {
			if (key in data) {
				original_data[key] = data[key];
			}
		}
		
		this.audiotag._CPU_planes[plane_name].points[point_name] = original_data;

		this.draw_point(plane_name, point_name);
		if (will_refresh) {
			this.panel_reorder(plane_name);
		}

		this.fire_event('edit_point', {
			plane : plane_name,
			point : point_name,
			data_point :  data
		});

		let start = Number(data['start']);
		if (this.audiotag._CPU_planes[plane_name]._st_max < start) {
			this.audiotag._CPU_planes[plane_name]._st_max = start;
		}

	}

	/**
	 * @summary Remove an annotation point
	 * @public
	 *
	 * @param      {string}   plane_name  A name in the range /^[a-zA-Z0-9\-_$]+/
	 * @param      {string}   point_name  A name in the range /^[a-zA-Z0-9\-_$]+/
	 * @return     {boolean}  success
	 */
	remove_point(plane_name, point_name) {
		let point_track_element = this.get_point_track(plane_name, point_name);
		if (!point_track_element) {
			return false;
		}

		this.fire_event('remove_point', {
			plane : plane_name,
			point : point_name
		});

		point_track_element.remove();
		this.get_point_panel(plane_name, point_name).remove();
		delete this.audiotag._CPU_planes[plane_name].points[point_name];

		//  recalc _start_max for caching repaints
		let _st_max = 0;
		for (let s of Object.values(this.plane_points(plane_name))) {
			let that_start = Number(s.start);
			_st_max = _st_max < that_start ? that_start : _st_max;
		}
		this.audiotag._CPU_planes[plane_name]._st_max = _st_max;

		if ( (!this.is_controller) && (this.mirrored_in_controller()) ) {
			document.CPU.global_controller.remove_point(plane_name, point_name);
		}
		return true;
	}

	/**
	 * @summary Gets the plane point names from an id on a ShadowDOM element.
	 * @package
	 *
	 * @param      {string}  element_id  The element identifier
	 * @return     {Array<string>}    An array with two strings : plane name and point name.
	 */
	get_point_names_from_id(element_id) {
		let plane_name = element_id.replace(plane_point_names_from_id,'$2');
		let point_name = element_id.replace(plane_point_names_from_id,'$5');
		return [plane_name, point_name];
	}

	/**
	 * @summary Remove any points from an annotation plane
	 * @public
	 *
	 * @param      {string}  plane_name  The plane name
	 */
	clear_plane(plane_name) {
		let remove_from_data = this.get_plane(plane_name);
		if (!remove_from_data) {
			return false;   
		}

		for (let point_name of Object.keys(remove_from_data.points)) {
			this.remove_point(plane_name, point_name);
		}
		// need to repass in case of badly removed / malformed entries
		let nav = this.get_plane_nav(plane_name);
		if (nav !== null) {
			nav.innerHTML = '';	
		}
		// purge repaint flag to redraw
		this.audiotag._CPU_planes[plane_name]._st_max = 0;

		return true;
	}

	/**
	 * @summary Refresh a plane. a panel_reorder may be enough
	 * @public
	 *
	 * @param      {string}  plane_name  The plane name
	 */
	refresh_plane(plane_name) {
		this.plane_resort(plane_name);
		for (let point_name of Object.keys(this.plane_points(plane_name))) {
			this.draw_point(plane_name, point_name);
		}
	}


	/**
	 * @summary Clean up DOM elements of any annotations, before rebuild them
	 * @private
	 */
	undraw_all_planes() {
		querySelector_apply('aside, div.panel', (element) => { element.remove(); }, this.container);
	}

	/**
	 * @summary Clear and redraw all planes
	 * Mainly when cpu-controller is changing targeted audio tag
	 * @public
	 */
	redraw_all_planes() {
		this.undraw_all_planes();
		for (let plane_name of Object.keys(this.audiotag._CPU_planes)) {
			this.draw_plane(plane_name);
			this.refresh_plane(plane_name);
		}
	}


	/**
	 * @summary Needed because Chrome can fire loadedmetadata before knowing audio duration. Fired at durationchange
	 * 
	 * @private
	 */
	reposition_tracks() {
		let duration = this.audiotag.duration;
		if ((duration === 0) || (isNaN(duration))) {
			// duration still unkown
			return ;
		}

		for (let plane_name in this.audiotag._CPU_planes) {
			let plane_data = this.get_plane(plane_name);
			if (plane_data.track !== false) {
				for (let point_name of Object.keys(this.plane_points(plane_name))) {
					let point_data = this.get_point(plane_name, point_name);
					let element = this.get_point_track(plane_name, point_name);
					this.position_time_element(element, point_data.start, point_data.end);
				}
			}
		}
	}

	/**
	 * @summary Remove any previewes on plane points
	 * @public
	 *
	 * @param      {string}  class_name  Targeted class name, 'with-preview' by default
	 * @param      {boolean} mirror     Also act on linked cpu-controller/cpu-audio
	 */
	remove_highlights_points(class_name=undefined, mirror=undefined) {
		mirror = mirror === undefined ? true : mirror;
		class_name = (typeof class_name === 'string') ? class_name : preview_classname;
		querySelector_apply(`.${class_name}`,(element) => { element.classList.remove(class_name); },this.container);
		// this.flash(''); // we have a change : redisplay the playing cue text. Not so easy
		if ( (mirror) && (this.mirrored_in_controller()) ) {
			if (!this.is_controller) {
				document.CPU.global_controller.remove_highlights_points(class_name, false);
			} else {
				document.CPU.find_container(document.CPU.global_controller.audiotag).remove_highlights_points(class_name, false);
			}
		}
	}

	/**
	 * @summary Sets a preview on a plane point
	 * @public
	 *
	 * @param      {string}  plane_name  The plane name
	 * @param      {string}  point_name  The point name
	 * @param      {string}  class_name  class name, 'with-preview' by default
	 * @param      {boolean} mirror     Also act on linked cpu-controller/cpu-audio, true by default
	 */
	highlight_point(plane_name, point_name, class_name=undefined, mirror=undefined) {
		mirror = mirror === undefined ? true : mirror;
		class_name = (typeof class_name === 'string') ? class_name : preview_classname;
		this.remove_highlights_points(class_name, mirror);

		let check_plane = this.get_plane(plane_name);

		if ((!check_plane) || (!check_plane['highlight'])) {
			return;
		}

		let track_element = this.get_plane_track(plane_name);
		if (track_element) {
			let point_track = this.get_point_track(plane_name, point_name);
			if (point_track) {
				point_track.classList.add(class_name);
			}
		}

		let panel_element = this.get_plane_panel(plane_name);
		if (panel_element) {
			let point_panel = this.get_point_panel(plane_name, point_name);
			if (point_panel) {
				point_panel.classList.add(class_name);
			}
		}

		/* we need to keep the actual flash message, to recall it
		let point = this.get_point(plane_name, point_name);
		if (point) {
			this.flash(point['text']); 
		}
		*/

		if ( (mirror) && (this.mirrored_in_controller()) ) {
			if (!this.is_controller) {
				document.CPU.global_controller.highlight_point(plane_name, point_name, class_name, false);
			} else {
				document.CPU.find_container(document.CPU.global_controller.audiotag).highlight_point(plane_name, point_name, class_name, false);
			}
		}
	}

	/**
	 * @summary Call when a chapter is changed, to trigger the changes
	 * @private
	 *
	 * @param      {Object}  event   The event
	 */
	cuechange_event(event) {
		let active_cue;
		let class_name = 'active-cue';
		let plane_name = '_chapters';
		try {
			// Chrome may put more than one activeCue. That's a stupid regression from them, but alas... I have to do with
			let _time = this.audiotag.currentTime;
			for (let cue of event.target.activeCues) {
				if ((cue.startTime <= _time) && (_time < cue.endTime)) {
					active_cue = cue;
				}
			}
			if (Object.is(active_cue, this._activecue)) {
				return ;
			}

			this._activecue = active_cue;
			//this.flash(activecue['text']);
			// do NOT tell me this is ugly, i know this is ugly. I missed something. Teach me how to do it better
		} catch (oops) {
			window.console.error(oops);
		}

		this.remove_highlights_points(class_name);
		if (active_cue) {
			trigger.cuechange(active_cue, this.audiotag);
			this.fire_event('chapter_changed', {
				cue : active_cue
			});
			this.highlight_point(plane_name, active_cue.id, class_name);
		}
	}
	/**
	 * @summary Builds or refresh chapters interface.
	 * @public
	 *
	 * @param      {Object|undefined}  event          The event
	 */
	async build_chapters(/* event = undefined */) {
		// this functions is called THREE times at load : at build, at loadedmetada event and at load event
		// and afterwards, we have to reposition track points on duractionchange

		if (this.is_controller) {
			// not your job, CPUController
			return;
		}

		let audiotag = this.audiotag;
		let has = false;
		let plane_name = '_chapters';

		if (audiotag) {
			if ((audiotag.textTracks) && (audiotag.textTracks.length > 0)) {
				let chapter_track = null;

				for (let tracks of audiotag.textTracks) {
					if (
							(tracks.kind.toLowerCase() === 'chapters') &&
							(tracks.cues !== null) &&  // linked to default="" attribute, only one per set !
							( 
								(chapter_track === null) /* still no active track */ 
								|| (tracks.language.toLowerCase() === prefered_language) /* correspond to <html lang> */ 
							)
						) {
						chapter_track = tracks;
					}
				}

				if ((chapter_track) && (chapter_track.cues.length > 0)) {
					this.add_plane(plane_name, __['chapters'], {'track' : 'chapters'});

					let cuechange_event = this.cuechange_event.bind(this);
					// ugly, but best way to catch the DOM element, as the `cuechange` event won't give it to you via `this` or `event`
					// adding/reinstall chapter changing event
					chapter_track.removeEventListener('cuechange', cuechange_event, passive_ev);
					chapter_track.addEventListener('cuechange', cuechange_event, passive_ev);

					for (let cue of chapter_track.cues) {
						if (!this.get_point(plane_name, cue.id)) {
							// avoid unuseful redraw, again
							let cuepoint = Math.floor(cue.startTime);
							this.add_point(plane_name, cuepoint, cue.id,  {
								'text' : this.translate_vtt(cue.text),
								'link' : true,          // point the link to start time position
								'end'  : cue.endTime    // end timecode of the cue
							});
						}
					}
					if (chapter_track.cues.length > 0) {
						has = true;
					}
					this.cuechange_event({target : {activeCues : chapter_track.cues}});
				}
			}
		}

		if (!this.is_controller) {
			let body_class = `cpu_tag_«${audiotag.id}»_chaptered`;
			if (has) {
				/**
				 * indicate in host page that audio tag chapters are listed see
				 * https://github.com/dascritch/cpu-audio/issues/36 
				 */
				document.body.classList.add(body_class);
			} else {
				this.remove_plane(plane_name);
				document.body.classList.remove(body_class);
			}

			/*
			info(`active_cue ${active_cue} && id_in_hash(this.audiotag.id) ${id_in_hash(this.audiotag.id)}`)
			if ((active_cue) && (id_in_hash(this.audiotag.id)) ) {
				// shoud be set ONLY if audiotag is alone in page or if audiotag.id named in hash
				trigger.cuechange(active_cue, this.audiotag);
				this.fire_event('chapter_changed', {
					cue : active_cue
				});
			}
			*/
		}

	}

	/**
	 * @summary Add listeners on tracks to build chapters when loaded
	 * @private
	 */
	build_chapters_loader() {
		this.build_chapters();
		let this_build_chapters = this.build_chapters.bind(this);

		// sometimes, we MAY have loose loading
		this.audiotag.addEventListener('loadedmetadata', this_build_chapters, once_passive_ev);

		let track_element = this.audiotag.querySelector('track[kind="chapters"]');
		if ((track_element) && (!track_element._CPU_load_ev)) {
			track_element._CPU_load_ev = track_element.addEventListener('load', this_build_chapters, passive_ev);
		}
	}

	/**
	 * @summary Builds or refresh the playlist panel. 
	 Should be called only for <cpu-controller>
	 * @public
	 */
	build_playlist() {
		if (!this.is_controller) {
			// Note that ONLY the global controller will display the playlist. For now.
			return;
		}

		// let previous_playlist = this.current_playlist;
		this.current_playlist = document.CPU.find_current_playlist();

		// Later, we will try to remove this specific code, and use plane/point arch, with data hosted on <CPU-CONTROLLER>
		let playlist_element = this.elements['playlist'];
		playlist_element.innerHTML = '';

		if (this.current_playlist.length === 0) {
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
	/**
	 * @package, because at start
	 *
	 * @summary Builds the controller.
	 */
	build_controller() {

		// the following mess is to simplify sub-element declaration and selection
		let controller = this;
		querySelector_apply('[id]', (element) => { controller.elements[element.id] = element; }, this.element.shadowRoot);
		let interface_classlist = this.elements['interface'].classList;

		// hide broken image while not loaded
		this.elements['poster'].addEventListener('load', () => {
			interface_classlist.add('poster-loaded'); 
		}, passive_ev);

		let show_main = this.show_main.bind(this);

		let cliquables = {
			'pause'     : trigger.play,
			'play'      : trigger.pause,
			'time'      : trigger.throbble,
			'actions'   : this.show_actions.bind(this),
			'back'      : show_main,
			'poster'    : show_main,
			'restart'   : trigger.restart,
		};
		for (let that in cliquables) {
			this.elements[that].addEventListener('click', cliquables[that], passive_ev);
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

		for (let that of _buttons) {
			for (let _act in _actions) {
				this.elements[that].addEventListener(_act, _actions[_act] ? finger_manager.press : finger_manager.release);
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
		};
		for (let event_name in do_events) {
			timeline_element.addEventListener(
				event_name,
				do_events[event_name] ? trigger.hover : trigger.out, passive_ev);
		}
		// alternative fine navigation for handhelds
		timeline_element.addEventListener('touchstart', finger_manager.touchstart, passive_ev);
		timeline_element.addEventListener('touchend', finger_manager.touchcancel, passive_ev);
		timeline_element.addEventListener('contextmenu', finger_manager.rmb, passive_ev);

		
		if (navigator.share) {
			interface_classlist.add('hasnativeshare');
			this.elements['nativeshare'].addEventListener('click', trigger.native_share, passive_ev);
		}

		if (!this.audiotag)  {
			// <cpu-controller> without <cpu-audio> , see https://github.com/dascritch/cpu-audio/issues/91
			return;
		}

		this.audiotag.addEventListener('durationchange', this.reposition_tracks.bind(this), passive_ev);

		this.show_main();
		this.build_chapters_loader();
		this.fire_event('ready');
	}
}