import {passive_ev, once_passive_ev, selector_interface, CpuAudioTagName, CpuControllerTagName, is_decent_browser_for_webcomponents, onDebug, warn} from './utils.js'
import {convert} from './convert.js'
import {trigger} from './trigger.js'

/* @type {string|null} */
function get_default_title() {
	for (let domain of ['og', 'twitter']) {
		let header_element = document.querySelector(`meta[property="${domain}:title"]`);
		if (header_element !== null) {
			return header_element.content;
		}
	}
	let title = document.title;
	return title === '' ? null : title;
}

/* @type {string|null} */
function get_default_poster() {
	for (let attr of ['property="og:image"', 'name="twitter:image:src"']) {
		let header_element = document.querySelector(`meta[${attr}]`);
		if (header_element !== null) {
			return header_element.content;
		}
	}
	return null;
}

/* @type {string|null} */
function get_default_canonical() {
	let header_element = document.querySelector('link[rel="canonical"]');
	if (header_element !== null) {
		return header_element.href;
	}
	return location.href.split('#')[0];
}

/* @type {string|null} */
function get_default_twitter() {
	let header_element = document.querySelector('meta[name="twitter:creator"]');
	if ((header_element !== null) && (header_element.content.length>1)) {
		return header_element.content;
	}
	return null;
}

export let document_CPU = {
	// global object for global API

	// public, parameters
	// @public
	// @type boolean
	'autoplay' : false,

	// @public 
	// @type number
	'keymove' : 5,
	// @public
	// @type boolean
	'only_play_one_audiotag' : true,
	// @public
	// @type number
	// why 500ms ? Because Chrome will trigger a touchcancel event at 800ms to show a context menu
	'alternate_delay' : 500, 

	// @public
	// @type number
	'fast_factor' : 4,
	// @public
	// @type number
	'repeat_delay' : 400,
	// @public
	// @type number
	'repeat_factor' : 100,

	// public, actual active elements
	// @public
	// @type {HTMLAudioElement|null}
	'current_audiotag_playing' : null,
	// @type {CpuControllerElement|null}
	// @public
	'global_controller' : null,

	// private, actual active elements
	// @private
	// @type {string|null}
	body_className_playing_cue : null,

	// private,to add attributes for unnamed <audio>
	// @private
	// @type string
	dynamicallyAllocatedIdPrefix : 'CPU-Audio-tag-',
	// @private
	// @type number
	count_element : 0,

	// private, indicate a play already occured in the DOM, so we can start any play
	// @private
	// @type boolean
	had_played : false,

	// private, indicate last used audiotag
	// @private
	// @type {HTMLAudioElement|null}
	last_used : null,

	// public, playlists
	// @public
	// @type Object
	'playlists' : {},
	// @public
	// @type boolean
	'advance_in_playlist' : true,

	// public, Exposing internals needed for tests
	// @public
	'convert' : convert,
	// @public
	'trigger' : trigger,

	// @package, not enough mature
	// NOTE : we need to refresh this when the <head> of the host page changes
	default_dataset : {
		'title' : get_default_title(), 
		'poster' : get_default_poster(),
		'canonical' : get_default_canonical(),
		'twitter' : get_default_twitter(),
		'playlist' : null,
		'waveform' : null,
		'duration' : null,
		'download' : null	
	},

	/**
	 * @package
	 * @summary Determines if audiotag source is streamed, and so unactivate reposition, position memory, length display…
	 *
	 * @param      {HTMLAudioElement|null}  audiotag  The audiotag
	 * @return     {boolean}            	True if audiotag streamed, False otherwise.
	 */
	is_audiotag_streamed : function(audiotag) {
		return ((audiotag === null) || (audiotag.duration === Infinity) || (audiotag.dataset.streamed !== undefined));
	},

	/**
	 * @package
	 * @summary At start, will start the last playing <audio> tag at its last known position
	 *
	 * @param      {Object}  event   The event
	 */
	recall_stored_play : function(event) {
		let audiotag = event.target;
		if ((document.CPU.current_audiotag_playing !== null) || (document.CPU.is_audiotag_streamed(audiotag))) {
			return;
		} 
		let lasttimecode = Number(window.localStorage.getItem(audiotag.currentSrc));
		// TODO and no hashed time
		if ((lasttimecode > 0) && (!trigger._last_play_error)) {
			document.CPU.seekElementAt(audiotag, lasttimecode);
			trigger.play(undefined, audiotag);
		}
	},
	/**
	 * @package, because at start
	 * @summary Attach events on a <audio> tag
	 *
	 * @param      {HTMLAudioElement}  audiotag  The audiotag
	 */
	attach_events_audiotag : function(audiotag) {
		audiotag.addEventListener('loadedmetadata', document.CPU.recall_stored_play, passive_ev);
		audiotag.addEventListener('play', trigger.play_once, passive_ev);
		audiotag.addEventListener('ended', trigger.ended, passive_ev);
		// those ↓ for PHRACKING SAFARI
		audiotag.addEventListener('ready', document.CPU.recall_stored_play, passive_ev);
		audiotag.addEventListener('canplay', document.CPU.recall_stored_play, passive_ev);

		// see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events for list of events
		[
			'ready', 'load', 'loadeddata', 'canplay', 'abort', 
			'error', 'emptied',
			'play', 'playing', 'pause', 'ended',
			'durationchange',  'loadedmetadata', 'timeupdate', 'waiting'
		].forEach( (on) => { 
			audiotag.addEventListener(on, trigger.update); 
		});

		if (!is_decent_browser_for_webcomponents()) {
			// in case we are in legacy mode
			[
				'pause', 'ended'
			].forEach( (on) => { 
				audiotag.addEventListener(on, trigger.pause); 
			});
		}
  
		// ask ASAP metadata about media
		if (audiotag.getAttribute('preload') === '') {
			audiotag.preload = 'metadata';
			audiotag.load();
		}
	},

	/**
	 * @package, launched at start or when the webcomponent appears
	 * @summary Connects an audiotag to CPU APIs
	 *
	 * @param      {HTMLAudioElement}  audiotag  The audiotag
	 */
	connect_audiotag : function(audiotag) {
		if (audiotag.CPU_connected) {
			return;
		}
		audiotag.CPU_connected = true;

		document.CPU.attach_events_audiotag(audiotag);

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

	/**
	 * @public
	 * @summary Determines if audiotag is currently playing.
	 *
	 * @param      {HTMLAudioElement}   audiotag  The audiotag
	 * @return     {boolean}  True if audiotag playing, False otherwise.
	 */
	'is_audiotag_playing' : function(audiotag) {
		return (document.CPU.current_audiotag_playing) && (audiotag.isEqualNode(document.CPU.current_audiotag_playing))
	},
	/**
	 * @public
	 * @summary Determines if audiotag is displayed in <cpu-controller>
	 *
	 * @param      {HTMLAudioElement}   audiotag  The audiotag
	 * @return     {boolean}  True if audiotag global, False otherwise.
	 */
	'is_audiotag_global' : function(audiotag) {
		return this.global_controller === null ? this.is_audiotag_playing(audiotag) : audiotag.isEqualNode(this.global_controller.audiotag)
	},

	/**
	 * @public
	 * @summary Position a timecode to a named audio tag
	 *
	 * @param      {string}   hash         The id="" of an <audio> tag
	 * @param      {string}   timecode     The timecode, 
	 * @param      {Function|null|undefined}   callback_fx  Function to be called afterwards, for ending tests
	 */
	'jumpIdAt' : async function(hash, timecode, callback_fx=undefined) {

		/**
		 * @param 	{Object}	event 	triggered event, or mockup
		 */
		function do_needle_move(event) {
			let audiotag = event.target;
			let secs = convert.TimeInSeconds(timecode);
			document.CPU.seekElementAt(audiotag, secs);

			let mocked_event = {'target' : audiotag};
			if (audiotag.readyState >= audiotag.HAVE_FUTURE_DATA) {
				do_element_play(mocked_event);
			} else {
				audiotag.addEventListener('canplay', do_element_play, once_passive_ev);
			}
			trigger.update(mocked_event);
		}

		/**
		 * @param 	{Object}	event 	triggered event, or mockup
		 */
		function do_element_play(event) {
			let tag = event.target;
			trigger.play(undefined, tag);
			onDebug(callback_fx);
		}

		let selector_fallback = 'cpu-audio audio'; // should be 'audio[controls]' but PHRACK APPLE !

		let audiotag = /** @type {HTMLAudioElement} */ ( (hash !== '') ? document.getElementById(hash)  :  document.querySelector(selector_fallback) );

		if ((audiotag === undefined) || (audiotag === null) || (audiotag.currentTime === undefined)) {
			warn(`Unknow audiotag ${hash}`);
			return;
		}

		let mocked_event = {'target' : audiotag};
		if (audiotag.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {  /*  WHHYYYY ?????? */
			audiotag.addEventListener('loadedmetadata', do_needle_move , once_passive_ev);
			audiotag.load();
			trigger.update(mocked_event);
		} else {
			do_needle_move(mocked_event);
		}
		// No problems
		return;
	},
	/**
	 * @public
	 *
	 * @summary Position a <audio> element to a time position
	 *
	 * @param      {HTMLAudioElement}  audiotag  <audio> DOM element
	 * @param      {number}  seconds   	Wanted position, in seconds
	 *
	 * HTMLAudioElement.fastSeek() is an experimental but really fast function. Google Closure doesn't like it in ADVANCED mode
	 * @suppress {missingProperties} */
	'seekElementAt' : function (audiotag, seconds) {
		if ((isNaN(seconds)) || // may happens, if the audio track is not loaded/loadable
			(document.CPU.is_audiotag_streamed(audiotag))) { // never try to set a position on a streamed media
			return;
		}

		if (audiotag.fastSeek !== undefined) {
			audiotag.fastSeek(seconds);
		} else {
			try {
				// Browsers may not have fastSeek but can set currentTime
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

	/**
	 * @public
	 * 
	 * @summary For any ShadowDOM element, will returns its parent interface container
	 *
	 * @param      {Element}  child   The ShadowDOM child
	 * @return     {Element}  The #interface element
	 */
	'find_interface' : function(child) {
		return child.closest(selector_interface);
	},
	/**
	 * @public
	 *
	 * @summary For any <audio> tag or its child tag or shadowDOM element, returns the element `CPU` API
	 *
	 * @param      {Element}  child   The child
	 * @return     {CPU_element_api}       Element.CPU
	 */
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
	/**
	 * @public
	 *
	 * @summary Return the current playing playlist array
	 *
	 * @return     {Array}  Array with named id
	 */
	'find_current_playlist' : function() {
		if (this.global_controller === null)
			return [];
		let current_audiotag = this.global_controller.audiotag;
		if (current_audiotag === null) {
			return [];
		}
		for (let playlist_name in this.playlists) {
			if (this.playlists[playlist_name].indexOf(current_audiotag.id) >= 0) {
				return this.playlists[playlist_name];
			}
		}
		return [];
	}

}