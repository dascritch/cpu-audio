import {CpuControllerTagName, absolutize_url, error, escape_html, once_passive_ev, passive_ev, querySelector_apply} from './utils.js';
import {__, prefered_language} from './i18n.js';

import {default_dataset} from './default_dataset.js';
import {SecondsInColonTime, SecondsInTime, IsoDuration} from './convert.js';
import {press_manager, touch_manager} from './finger_manager.js';
import {translate_vtt} from './translate_vtt.js';
import {trigger} from './trigger.js';
import {is_audiotag_streamed, add_id_to_audiotag} from './media_element_extension.js';

// Acceptables attributes values for hide="" parameter on webcomponent
const acceptable_hide_atttributes = ['poster', 'actions', 'timeline', 'chapters', 'panels', 'panels-title', 'panels-except-play'];

// should be put in CPU-controller ?
let preview_classname = 'with-preview';
let activecue_classname = 'active-cue';

let plane_chapters = '_chapters';
// plane for _playlist. Only used in <CPU-Controller>
let plane_playlist = '_playlist';

// Regex used to validate planes, points and injected css names
const valid_id = /^[a-zA-Z0-9\-_]+$/;

// Regex for extracting plane and point names from an id
const plane_point_names_from_id = /^[a-zA-Z0-9\-_]+_«([a-zA-Z0-9\-_]+)(»_.*_«([a-zA-Z0-9\-_]+))?»$/;

/**
 * @summary Gets the plane point names from an id on a ShadowDOM element.
 * @package

 * repeated in the class for testing purposes
 *
 * @param      {string}  element_id  The element identifier
 * @return     {Array<string>}    An array with two strings : plane name and point name.
 */
function get_point_names_from_id(element_id) {
	const [,plane_name, , point_name] = element_id.match(plane_point_names_from_id) || [];
	return [plane_name??'', point_name??''];
}

/**
 * @summary    Highlight the playable positions when hovering a marked link
 *
 * @param      {Object}  event   An hover event
 */
function preview_container_hover({target}) {
	if (!target.id) {
		target = target.closest('[id]');
	}
	if (!target) {
		return;
	}

	let [plane_name, point_name] = get_point_names_from_id(target.id);
	document.CPU.find_container(target).highlight_point(plane_name, point_name);
}

/**
 * @summary Gets the point track identifier
 *
 * @param      {string}  plane_name  The plane name
 * @param      {string}  point_name  The point name
 * @param      {boolean} panel       Is panel (true) or track (false)
 * @return     {string}  The point track identifier.
 */
function get_point_id(plane_name, point_name, panel) {
	return `${ panel?'panel':'track' }_«${plane_name}»_point_«${point_name}»`;
}

/**
  * @param  {number|undefined|boolean} sec  Is it a "seconds" value ?
  * @return {boolean}
  */
function is_seconds(sec) {
	// completely ugly... but « WAT » ! as in https://www.destroyallsoftware.com/talks/wat
	return ((sec !== undefined) && (sec !== false));
}

/**
 * @summary Show or hide an element
 *
 * @param      {Element} element  	The element to show or hide
 * @param      {boolean} show 		Show if true, hide if false
 */
function show_element({classList}, show) {
	if (show) {
		classList.remove('no');
	} else {
		classList.add('no');
	}
}


/**
 * @summary Interprets `navigator.share` native API
 *
 * @param      {Object}  event   The event
 */
function native_share(event) {
	let {title, canonical} = document.CPU.find_container(event.target).fetch_audiotag_dataset();
	navigator.share({
		title,
		text	: title,
		url 	: canonical
	});
	event.preventDefault();
}


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
		this.audiotag = /* @type {HTMLAudioElement} */ element._audiotag;
		this.container = container_interface;
		this.mode_when_play = null;
		this.glow_before_play = false;
		this.current_playlist = [];
		this._activecue = null;
		this.mode_was = null;
		this.act_was = null;

		if ( (this.audiotag) && (! this.audiotag._CPU_planes)) {
			this.audiotag._CPU_planes = {};
		}

		this.is_controller = this.element.tagName === CpuControllerTagName;
		// only used for CPU-CONTROLLER, for playlist
		this._planes = {};
	}

	mirrored_in_controller() {
		let global_controller = document.CPU.global_controller;
		return (global_controller) && (this.audiotag.isEqualNode(global_controller.audiotag));
	}


	/**
	 * @summary Passthru there only for testing purposes.
	 *
	 * @param      {string}            vtt_taged  The vtt tagged
	 * @return     string                         HTML tagged string
     */
	translate_vtt(vtt_taged) {
		return translate_vtt(vtt_taged);
	}

	/**
	 * @summary Passthru there only for testing purposes. Perhaps may be on document.CPU as public method ?
	 * @public
	 */
	get_point_names_from_id(element_id) {
		return get_point_names_from_id(element_id);
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
				target 		: this.element,
				bubbles 	: true,
				cancelable 	: false,
				composed 	: false,
				detail 		: detail
			})
		);
	}

	shadowId(id) {
		return this.element.shadowRoot.getElementById(id);
	}  

	/**
	 * @summary Used for `mode=""` attribute.
	 * @public
	 *
	 * @param      {string|null}  mode    Accepted are only in `/\w+/` format, 'default' by default
	 */
	set_mode_container(mode=null) {
		mode = mode ?? 'default';
		if (this.mode_was === mode) {
			return;
		}
		let classes = this.container.classList;
		classes.remove(`mode-${this.mode_was}`);
		classes.add(`mode-${mode}`);
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
		let container_class = this.container.classList;

		for (let hide_this of acceptable_hide_atttributes) {
			container_class.remove(`hide-${hide_this}`);
		}

		for (let hide_this of hide_elements) {
			hide_this = hide_this.toLowerCase();
			if (acceptable_hide_atttributes.includes(hide_this)) {
				container_class.add(`hide-${hide_this}`);
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

		let container_class = this.container.classList;
		if (!audiotag.paused) {
			audiotag._CPU_played = true;
			container_class.add(hide_panels_except_play_mark);
			if (this.mode_when_play) {
				this.set_mode_container(this.mode_when_play);
				this.mode_when_play = null;
			}
		} else {
			if (! this.audiotag.isEqualNode(document.CPU.last_used)) {
				container_class.remove(hide_panels_except_play_mark);
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
		let { duration } = this.audiotag;
		ratio = ratio ?? ( duration === 0 ? 0 : (100*seconds / duration) );
		this.shadowId('loadingline').style.width = `${ratio}%`;
	}

	/**
	 * @summary update current timecode and related links
	 * @private
	 */
	update_time() {
		let audiotag = this.audiotag;
		let timecode = is_audiotag_streamed(audiotag) ? 0 : Math.floor(audiotag.currentTime);
		let canonical = audiotag.dataset.canonical ?? '' ;
		let _is_at = canonical.indexOf('#');
		let elapse_element = this.shadowId('elapse');
		elapse_element.href = 
			`${ absolutize_url(canonical) }#${ (_is_at < 0) ?
				audiotag.id :
				canonical.substr(_is_at + 1) }&t=${timecode}`;

		let total_duration = false;
		let _natural = Math.round(audiotag.duration);
		if (!isNaN(_natural)){
			total_duration = SecondsInColonTime(_natural);
		} else {
			let _forced = Math.round(audiotag.dataset.duration);
			if (_forced > 0) {
				total_duration = SecondsInColonTime(_forced);
			}
		}

		elapse_element.querySelector('span').innerText = SecondsInColonTime(audiotag.currentTime);
		let duration_element = elapse_element.querySelector('.nosmaller');
		duration_element.innerText = total_duration ? `\u00a0/\u00a0${total_duration}` : '…';
		show_element(duration_element, total_duration);

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
			if (
				(check) &&
				(check.start === trigger._timecode_start) &&
				(check.end === trigger._timecode_end)) {
				return;
			}
		}

		this.add_plane(plane_name,'',{
			track   	: 'borders',
			panel   	: false,
			highlight 	: false
		});
		this.add_point(plane_name, trigger._timecode_start, point_name, {
			link    	: false,
			end     	: trigger._timecode_end
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
		if (!audiotag) {
			return true;
		}
		let error_object = audiotag.error;
		if (error_object) {
			let error_message;
			let pageerror = this.shadowId('pageerror');
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
		let { duration } = this.audiotag;

		if ((duration === 0) || (isNaN(duration))) {
			return;
			// duration still unkonw ! We will need to redraw later the tracks
		}

		if (is_seconds(seconds_begin)) {
			element.style.left =  `${100 * (seconds_begin / duration)}%`;
		}
		if (is_seconds(seconds_end)) {
			element.style.right = `${100 * (1 - (seconds_end / duration))}%`;
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

		let phylactere = this.shadowId('popup');
		phylactere.style.opacity = 1;
		this.position_time_element(phylactere, seeked_time);
		phylactere.innerHTML = SecondsInColonTime(seeked_time);
		phylactere.dateTime = SecondsInTime(seeked_time).toUpperCase();
	}

	/**
	 * @summary Hides immediately the throbber.
	 * @public
	 */
	hide_throbber() {
		// we use opacity instead of a class change to permits opacity smooth transition via `--cpu-background-transitions`
		this.shadowId('popup').style.opacity = 0;
	}

	/**
	 * @summary Hides the throbber later. Will delay the hiding if recalled.
	 * @public
	 */
	hide_throbber_later() {
		let hide_throbber_delay = 1000;
		let phylactere = this.shadowId('popup');
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
		return {...default_dataset, ...this.audiotag.dataset};
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
		let dataset = this.fetch_audiotag_dataset();
		let canonical = absolutize_url( dataset.canonical ?? '' );
		let timepos = (audiotag.currentTime === 0)  ? '' : `&t=${Math.floor(audiotag.currentTime)}`;
		// watch out : we should put the ID only if canonical URL is strictly identical to this page
		let tag_id = (canonical === absolutize_url(window.location.href)) ? audiotag.id : '';
		let _url = encodeURIComponent(`${canonical}#${tag_id}${timepos}`);
		let _twitter = '';
		if (dataset.twitter?.[0]==='@') {
			 /* why did I want an @ in the attribute if I cut it in my code ? to keep HTML readable and comprehensible, instead to developpe attribute name into a "twitter-handler" */
			_twitter = `&via=${dataset.twitter.substring(1)}`;
		}
		let link = audiotag.querySelector('source[data-downloadable]')?.src ||
					 dataset.download ||
					 audiotag.currentSrc;

		let title = dataset.title;
		let links = {
			twitter  : `https://twitter.com/share?text=${title}&url=${_url}${_twitter}`,
			facebook : `https://www.facebook.com/sharer.php?t=${title}&u=${_url}`,
			email    : `mailto:?subject=${title}&body=${_url}`,
			link
		};
		for (let key in links) {
			container.shadowId(key).href = links[key];
		}
	}

	/**
	 * @summary Shows the interface
	 *
	 * @public
	 * @param      {string}  mode    The mode, can be 'main', 'share' or 'error'
	 */
	show_interface(mode) {
		let classlist = this.container.classList;
		classlist.remove(
			'show-no',
			'show-main',
			'show-share',
			'show-error',
			'media-streamed'
		);
		if (is_audiotag_streamed(this.audiotag)) {
			classlist.add('media-streamed');
		}
		classlist.add(`show-${mode}`);
	}

	/**
	 * @summary Shows the sharing panel
	 * @private
	 */
	show_actions(/* event */) {
		this.show_interface('share');
		this.update_links();
	}

	/**
	 * @summary Shows the main manel
	 * @private
	 */
	show_main(/* event */) {
		this.show_interface('main');
	}

	/**
	 * @package not mature enough
     * @summary Shows the handheld fine navigation
	 *
	 * @param      {Object}  event   The event
	 */
	show_handheld_nav(event) {
		if (is_audiotag_streamed(this.audiotag)) {
			return;
		}
		this.container.classList.toggle('show-handheld-nav');
		event?.preventDefault();
	}

	/**
	 * @summary Inject a <style> into the shadowDom.
	 * @public
	 *
	 * Usage example in applications/chapters_editor.js
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
	 * @public
	 *
	 * @param 	{string}  style_key   	Key of the created <style> , /[a-zA-Z0-9\-_]+/
	 */
	remove_css(style_key) {
		this.shadowId(`style_${style_key}`)?.remove();
	}


	/**
	 * @summary Complete the interface at build time
	 * @package
	 */
	complete_template() {
		let dataset = this.fetch_audiotag_dataset();
		let { title, waveform } = dataset;
		let element_canonical = this.shadowId('canonical');

		element_canonical.href = dataset.canonical;

		let classlist = element_canonical.classList;

		if (!title) {
			classlist.add('untitled');
			title = __.untitled;
		} else {
			classlist.remove('untitled');
		}
		element_canonical.innerText = title;
		if (this.element.title !== title) {
			this.element.title = title; // WATCHOUT ! May goes recursive with observers
		}
		this.shadowId('poster').src = dataset.poster || '';
		this.shadowId('time').style.backgroundImage = waveform ? `url(${waveform})` : '';
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
		add_id_to_audiotag(audiotag);
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
		return this._planes[plane_name] ?? this.audiotag._CPU_planes[plane_name];
	}

	/**
	 * @summary Gets the plane track element
	 * @private but needed in tests
	 *
	 * @param      {string}  plane_name   The name
	 * @return     {Element}    The <aside> track element from ShadowDom interface
	 */
	get_plane_track(plane_name) {
		return this.shadowId(`track_«${plane_name}»`);
	}

	/**
	 * @summary Gets the plane panel element
	 * @private but needed in test
	 *
	 * @param      {string}  plane_name   The name
	 * @return     {Element}    The panel element from ShadowDom interface
	 */
	get_plane_panel(plane_name) {
		return this.shadowId(`panel_«${plane_name}»`);
	}

	/**
	 * @summary Gets the <nav><ul> plane panel element
	 * @private but needed in tests
	 *
	 * @param      {string}  plane_name   The name
	 * @return     {Element}    The <ul> element from ShadowDom interface, null if inexisting
	 */
	get_plane_nav(plane_name) {
		return this.get_plane_panel(plane_name)?.querySelector(`ul`);
	}

	/**
	 * @summary Draws a plane
	 * @private
	 *
	 * @param      {string}  plane_name  The plane name
	 */
	draw_plane(plane_name) {
		this.get_plane_track(plane_name)?.remove();
		this.get_plane_panel(plane_name)?.remove();

		let data = this.get_plane(plane_name);
		if (!data) {
			return ;
		}
		let { track, panel, title } = data;
		let remove_highlights_points_bind = this.remove_highlights_points.bind(this, plane_name, preview_classname, true);

		/**
		 * @param      {Element}  element  Impacted element
		 */
		function assign_events_on_planes(element) {
			element.addEventListener('mouseover', preview_container_hover, passive_ev);
			element.addEventListener('focusin', preview_container_hover, passive_ev);
			element.addEventListener('mouseleave', remove_highlights_points_bind, passive_ev);
			element.addEventListener('focusout', remove_highlights_points_bind, passive_ev);
		}


		if (track !== false) {
			// we have to create the track timeline
			let plane_track = document.createElement('aside');
			plane_track.id = `track_«${plane_name}»`;
			if (track !== true) {
				// …with a class list
				plane_track.classList.add(track.split(' '));
			}

			this.shadowId('line').appendChild(plane_track);
			assign_events_on_planes(plane_track);
		}

		if (panel !== false) {
			// we have to create the panel area
			let plane_panel = document.createElement('div');
			plane_panel.id = `panel_«${plane_name}»`;
			if (panel !== true) {
				// …with a class list
				plane_panel.classList.add(panel.split(' '));
			}

			plane_panel.classList.add('panel');

			plane_panel.innerHTML = `<h6>${escape_html(title)}</h6><nav><ul></ul></nav>`;
			this.container.appendChild(plane_panel);
			show_element( plane_panel.querySelector('h6') , title);
			assign_events_on_planes(plane_panel);
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
	 * 										highlight : true/false,
	 *										_comp : true/false // only stored in component, private use only
	  }
	 *
	* TODO as parameter points : to bulk create points
	* TODO as parameter _comp : true/false // only stored in component, private use only

	 * @return     {boolean}  success
	 */
	add_plane(plane_name, title, data = {}) {
		if ((! plane_name.match(valid_id)) || (this.get_plane(plane_name))) {
			return false;
		}

		// I don't understand (yet) why, when I move this declaration at top of file, tests will fail
		const default_plane_data = {
			track       : true,
			panel       : true,
			title       : '',
			highlight   : true,
			points      : {},
			_comp		: false
		};

		data = { ...default_plane_data, ...data , title};

		if (!data._comp) {
			if (this.is_controller) {
				return false;
			}
			this.audiotag._CPU_planes = this.audiotag._CPU_planes ?? {};
			this.audiotag._CPU_planes[plane_name] = data;
		} else {
			this._planes[plane_name] = data;
		}
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
	remove_plane(plane_name) {
		if ( (this.is_controller) || (! plane_name.match(valid_id)) || (! this.get_plane(plane_name))) {
			return false;
		}

		delete (this._planes[plane_name] ? this._planes : this.audiotag._CPU_planes)[plane_name];

		this.get_plane_track(plane_name)?.remove();
		this.get_plane_panel(plane_name)?.remove();

		if ( (!this.is_controller) && (this.mirrored_in_controller()) ) {
			// as plane data is removed, it will remove its aside and track
			document.CPU.global_controller.draw_plane(plane_name);
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
		return this.get_plane(plane_name).points;
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
		return this.get_plane(plane_name).points[point_name];
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
		return this.shadowId(get_point_id(plane_name, point_name, false));
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
		return this.shadowId(get_point_id(plane_name, point_name, true));
	}

	/**
	 * @summary    Resort points of a plane by start-time
	 * @private
	 *
	 * @param      {string}   plane_name     The plane name
	 */
	plane_resort(plane_name) {
		let out = Object.fromEntries(
		    Object.entries(
		    	this.plane_points(plane_name)
			).sort(
		    	([, point_a], [, point_b]) => {
		    		return point_a.start - point_b.start;
		    	}
		    )
		);
		this.get_plane(plane_name).points = out;
	}

	/**
	 * @summary    get point_names from a plane_name
	 * @private
	 *
	 * @param      {string}   plane_name     The plane name
	 * @return     {[string]} points_names	 Array of point_names
	 */
	plane_pointsnames(plane_name) {
		return Object.keys(this.plane_points(plane_name));
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
		for (let point_name of this.plane_pointsnames(plane_name)) {
			element = this.get_point_panel(plane_name, point_name);
			previous_element?.insertAdjacentElement('afterend', element);
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
		let audiotag = this.audiotag ? this.audiotag : document.CPU.global_controller.audiotag;
		let data = this.get_point(plane_name, point_name);
		let {start, link, text, image, end} = data;

		let use_link = '#';
		if (link === true) {
			// automated link to the audio tag.
			use_link = `#${audiotag.id}&t=${start}`;
		}
		if (typeof(link) === 'string') {
			// Integrator of the page wants a specific url (hoping he know what he do with a "javascript:")
			use_link = link;
		}

		let track = this.get_plane_track(plane_name);
		let plane_point_track;
		if (track) {
			plane_point_track = this.get_point_track(plane_name, point_name);
			if (!plane_point_track) {
				plane_point_track = document.createElement('a');
				plane_point_track.id = get_point_id(plane_name, point_name, false);
				// TODO : how to do chose index of a point track if there is no link, or a panel but no track??
				plane_point_track.tabIndex = -1; 
				plane_point_track.innerHTML = '<img alt="" /><span></span>';
				track.appendChild(plane_point_track);
			}
			plane_point_track.href = use_link;
			plane_point_track.title = text;
			let track_img = plane_point_track.querySelector('img');
			show_element(track_img, image);
			track_img.src = image || '';
			plane_point_track.querySelector('img').innerHTML = text ;
			this.position_time_element(plane_point_track, start, end);
		}

		let panel = this.get_plane_nav(plane_name);
		let plane_point_panel;
		if (panel) {
			plane_point_panel = this.get_point_panel(plane_name, point_name);
			if (!plane_point_panel) {
				plane_point_panel = document.createElement('li');
				plane_point_panel.id = get_point_id(plane_name, point_name, true);
				plane_point_panel.innerHTML = '<a href="#" class="cue"><strong></strong><time></time></a>';
				panel.appendChild(plane_point_panel);
			}
			plane_point_panel.querySelector('a').href = use_link;
			plane_point_panel.querySelector('strong').innerHTML = text;
			let time_element = plane_point_panel.querySelector('time');
			time_element.dateTime = IsoDuration(start);
			time_element.innerText = SecondsInColonTime(start);
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
	add_point(plane_name, timecode_start, point_name, data={}) {
		// TODO major release : move timecode_start in data, add points argument for a bulk insertion

		if ( (!this.get_plane(plane_name)) || (this.get_point(plane_name, point_name)) || (timecode_start < 0) || (!point_name.match(valid_id)) ) {
			return false;
		}
		if ((!this._planes[plane_name]) && (this.is_controller)) {
			return false;
		}

		data.start = Number(timecode_start); // TO move into parameter
		let { start } = data;
		this.get_plane(plane_name).points[point_name] = data;

		this.fire_event('add_point', {
			plane : plane_name,
			point : point_name,
			data_point :  data
		});

		if (this.get_plane(plane_name)._st_max > start) {
			// we need to reorder the plane
			this.panel_reorder(plane_name);
		} else {
			this.draw_point(plane_name, point_name);
			this.get_plane(plane_name)._st_max = start;
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
		let plane = this.get_plane(plane_name);
		if (!plane) {
			return false;
		}

		let original_data = this.get_point(plane_name, point_name);
		if (!original_data) {
			return false;	
		}

		let { start } = data;
		start = Number(start);
		let will_refresh = ((start != null) && (start !== original_data.start));

		data = {...original_data, ...data};

		plane.points[point_name] = data;

		this.draw_point(plane_name, point_name);
		if (will_refresh) {
			this.panel_reorder(plane_name);
		}

		this.fire_event('edit_point', {
			plane : plane_name,
			point : point_name,
			data_point :  data
		});

		if (plane._st_max < start) {
			plane._st_max = start;
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
		let plane = this.get_plane(plane_name);
		if ((!plane) || (!this.get_point(plane_name, point_name))) {
			return false;
		}

		this.fire_event('remove_point', {
			plane : plane_name,
			point : point_name
		});

		this.get_point_track(plane_name, point_name)?.remove();
		this.get_point_panel(plane_name, point_name)?.remove();

		//  recalc _start_max for caching repaints
		let _st_max = 0;
		for (let s of Object.values(this.plane_points(plane_name))) {
			let that_start = Number(s.start);
			_st_max = _st_max < that_start ? that_start : _st_max;
		}
		plane._st_max = _st_max;

		if ( (!this.is_controller) && (this.mirrored_in_controller()) ) {
			document.CPU.global_controller.remove_point(plane_name, point_name);
		}
		if (plane.points[point_name]) {
			delete plane.points[point_name];
		}
		return true;
	}

	/**
	 * @summary Remove any points from an annotation plane
	 * @public
	 *
	 * @param      {string}  plane_name  The plane name
	 */
	clear_plane(plane_name) {
		let plane = this.get_plane(plane_name);
		if (!plane) {
			return false;
		}

		for (let point_name of Object.keys(plane.points)) {
			this.remove_point(plane_name, point_name);
		}
		// need to repass in case of badly removed / malformed entries
		let nav = this.get_plane_nav(plane_name);
		if (nav) {
			nav.innerHTML = '';
		}
		// purge repaint flag to redraw
		plane._st_max = 0;

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
		for (let point_name of this.plane_pointsnames(plane_name)) {
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

		for (let plane_name of Object.keys({...this._planes, ...this.audiotag._CPU_planes})) {
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
			if (plane_data.track) {
				for (let point_name of this.plane_pointsnames(plane_name)) {
					let element = this.get_point_track(plane_name, point_name);
					let {start, end} = this.get_point(plane_name, point_name);
					this.position_time_element(element, start, end);
				}
			}
		}
	}

	/**
	 * @summary Remove any previewes on plane points
	 * @public
	 *
	 * @param			 {string}  plane_name The plane name to operate
	 * @param      {string}  class_name Targeted class name, 'with-preview' by default
	 * @param      {boolean} mirror     Also act on linked cpu-controller/cpu-audio
	 */
	remove_highlights_points(plane_name, class_name=preview_classname, mirror=true) {
		querySelector_apply(
			`#track_«${plane_name}» .${class_name}, #panel_«${plane_name}» .${class_name}`,
			(element) => { element.classList.remove(class_name); },
			this.container);
		if ( (mirror) && (this.mirrored_in_controller()) ) {
			let global_controller = document.CPU.global_controller;

			let on;
			if (!this.is_controller) {
				on = global_controller;
			} else {
				on = document.CPU.find_container(global_controller.audiotag);
			}
			on.remove_highlights_points(plane_name, class_name, false);
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
	highlight_point(plane_name, point_name, class_name=preview_classname, mirror=true) {
		this.remove_highlights_points(plane_name, class_name, mirror);

		if (! this.get_plane(plane_name)?.highlight) {
			return;
		}

		this.get_point_track(plane_name, point_name)?.classList.add(class_name);
		this.get_point_panel(plane_name, point_name)?.classList.add(class_name);

		if ( (mirror) && (this.mirrored_in_controller()) ) {
			let document_CPU = document.CPU;
			let on;
			if (!this.is_controller) {
				on = document_CPU.global_controller;
			} else {
				on = document_CPU.find_container(document_CPU.global_controller.audiotag);
			}
			on.highlight_point(plane_name, point_name, class_name, false);
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
			// do NOT tell me this is ugly, i know this is ugly. I missed something. Teach me how to do it better
		} catch (oops) {
			window.console.error(oops);
		}

		this.remove_highlights_points(plane_chapters, activecue_classname);
		if (active_cue) {
			trigger.cuechange(active_cue, this.audiotag);
			this.fire_event('chapter_changed', {
				cue : active_cue
			});
			this.highlight_point(plane_chapters, active_cue.id, activecue_classname);
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

		if (audiotag) {
			if (audiotag.textTracks?.length > 0) {
				let chapter_track = null;

				for (let tracks of audiotag.textTracks) {
					if (
							(tracks.kind.toLowerCase() === 'chapters') &&
							(tracks.cues) &&  // linked to default="" attribute, only one per set !
							(
								(!chapter_track) /* still no active track */
								|| (tracks.language.toLowerCase() === prefered_language) /* correspond to <html lang> */
							)
						) {
						chapter_track = tracks;
					}
				}

				if (chapter_track?.cues.length > 0) {
					this.add_plane(plane_chapters, __['chapters'], {track : 'chapters'});

					let cuechange_event = this.cuechange_event.bind(this);
					// ugly, but best way to catch the DOM element, as the `cuechange` event won't give it to you via `this` or `event`
					// adding/reinstall chapter changing event
					chapter_track.removeEventListener('cuechange', cuechange_event);
					chapter_track.addEventListener('cuechange', cuechange_event, passive_ev);

					for (let cue of chapter_track.cues) {
						if (!this.get_point(plane_chapters, cue.id)) {
							// avoid unuseful redraw, again
							let cuepoint = Math.floor(cue.startTime);
							this.add_point(plane_chapters, cuepoint, cue.id,  {
								text : this.translate_vtt(cue.text),
								link : true,          // point the link to start time position
								end  : cue.endTime    // end timecode of the cue
							});
						}
					}
					if (chapter_track.cues.length > 0) {
						has = true;
					}
					this.cuechange_event({
						target : {
							activeCues : chapter_track.cues
						}
					});
				}
			}
		}

		let body_class = `cpu_tag_«${audiotag.id}»_chaptered`;
		let body_classlist = document.body.classList;
		if (has) {
			// indicate in host page that audio tag chapters are listed
			// see https://github.com/dascritch/cpu-audio/issues/36
			body_classlist.add(body_class);
		} else {
			this.remove_plane(plane_chapters);
			body_classlist.remove(body_class);
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

		let previous_playlist = this.current_playlist;
		this.current_playlist = document.CPU.find_current_playlist();

		if (! this.get_plane(plane_playlist)) {
			this.add_plane(plane_playlist, __['playlist'], {
				track 		: false,
				panel 		: 'nocuetime',
				highlight 	: true,
				_comp 		: true 				// data stored on CPU-Controller ONLY
			});
		}

		if (previous_playlist !== this.current_playlist) {
			this.clear_plane(plane_playlist);

			if (this.current_playlist.length === 0) {
				// remove plane to hide panel. Yes, overkill
				this.remove_plane(plane_playlist);
				return;
			}

			for (let audiotag_id of this.current_playlist) {
				// TODO : when audiotag not here, do not add point
				this.add_point(plane_playlist, 0, audiotag_id, {
					text : document.getElementById(audiotag_id)?.dataset.title, 
					link : `#${audiotag_id}&t=0`
				});
			}
		}

		this.highlight_point(plane_playlist, this.audiotag.id, activecue_classname);

		// move _playlist on top. Hoping it will insert it RIGHT AFTER the main element.
		this.element.shadowRoot.querySelector('main').insertAdjacentElement('afterend', this.get_plane_panel(plane_playlist) );
	}

	/**
	 * @package, because at start
	 *
	 * @summary Builds the controller.
	 */
	build_controller() {
		let interface_classlist = this.shadowId('interface').classList;

		// hide broken image while not loaded
		this.shadowId('poster').addEventListener('load', () => {
			interface_classlist.add('poster-loaded');
		}, passive_ev);

		let show_main = this.show_main.bind(this);

		let cliquables = {
			pause     : trigger.play,
			play      : trigger.pause,
			time      : trigger.throbble,
			actions   : this.show_actions.bind(this),
			back      : show_main,
			poster    : show_main,
			restart   : trigger.restart,
		};
		for (let that in cliquables) {
			this.shadowId(that).addEventListener('click', cliquables[that], passive_ev);
		}

		// handheld nav to allow long press to repeat action
		let _buttons = ['fastreward', 'reward', 'foward', 'fastfoward'];
		let _actions = {
			touchstart    : true,
			touchend      : false,
			touchcancel   : false,
			/* PHRACKING IOS PHRACKING SAFARI PHRACKING APPLE */
			mousedown     : true,
			mouseup       : false,
			mouseleave    : false
		};

		for (let that of _buttons) {
			const element_id = this.shadowId(that);
			for (let _act in _actions) {
				element_id.addEventListener(_act, _actions[_act] ? press_manager.press : press_manager.release);
			}
		}

		// keyboard management
		this.element.addEventListener('keydown', trigger.key);

		// not working correctly :/
		this.shadowId('control').addEventListener('keydown', trigger.keydownplay);
		// throbber management
		let timeline_element = this.shadowId('time');
		let do_events = {
			mouseover   : true,
			mousemove   : true,
			mouseout    : false,

			touchstart  : true,
			touchend    : false,
			touchcancel : false,
		};
		for (let event_name in do_events) {
			timeline_element.addEventListener(
				event_name,
				do_events[event_name] ? trigger.hover : trigger.out,
				passive_ev);
		}
		// alternative fine navigation for handhelds
		timeline_element.addEventListener('touchstart', touch_manager.start, passive_ev);
		timeline_element.addEventListener('touchend', touch_manager.cancel, passive_ev);
		timeline_element.addEventListener('contextmenu', this.show_handheld_nav.bind(this));

		if (navigator.share) {
			interface_classlist.add('hasnativeshare');
			this.shadowId('nativeshare').addEventListener('click', native_share, passive_ev);
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
