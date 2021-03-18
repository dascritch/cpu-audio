import {CpuAudioTagName, CpuControllerTagName, is_audiotag_streamed, on_debug, once_passive_ev, selector_interface, warn} from './utils.js';
import {default_document_cpu_parameters} from './default_document_cpu_parameters.js';
import {default_dataset} from './default_dataset.js';
import {convert} from './convert.js';
import {trigger} from './trigger.js';

export const document_CPU = {
	// global object for global API

	// public, parameters
	...default_document_cpu_parameters,

	// public, actual active elements
	// @public
	// @type {HTMLAudioElement|null}
	current_audiotag_playing : null,
	// @type {CpuControllerElement|null}
	// @public
	global_controller : null,

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
	playlists : {},

	// public, Exposing internals needed for tests
	// @public
	convert,
	// @public
	trigger,

	// @package, not enough mature
	default_dataset,

	/**
	 * @public
	 * @summary Determines if audiotag is currently playing.
	 *
	 * @param      {HTMLAudioElement}   audiotag  The audiotag
	 * @return     {boolean}  True if audiotag playing, False otherwise.
	 */
	is_audiotag_playing : function(audiotag) {
		return (document.CPU.current_audiotag_playing) && (audiotag.isEqualNode(document.CPU.current_audiotag_playing));
	},
	/**
	 * @public
	 * @summary Determines if audiotag is displayed in <cpu-controller>
	 *
	 * @param      {HTMLAudioElement}   audiotag  The audiotag
	 * @return     {boolean}  True if audiotag global, False otherwise.
	 */
	is_audiotag_global : function(audiotag) {
		return this.global_controller === null ? this.is_audiotag_playing(audiotag) : audiotag.isEqualNode(this.global_controller.audiotag);
	},

	/**
	 * @public
	 * @summary Position a timecode to a named audio tag
	 *
	 * @param      {string}   hash         The id="" of an <audio> tag
	 * @param      {string}   timecode     The timecode,
	 * @param      {Function|null|undefined}   callback_fx  Function to be called afterwards, for ending tests
	 */
	jumpIdAt : async function(hash, timecode, callback_fx=undefined) {

		/**
		 * @param 	{Object}	event 	triggered event, or mockup
		 */
		function do_needle_move({target:audiotag}) {
			// maybe we should add `timecode` in argument (timecode, event), and bind it to the event listener, moving the function upper
			let secs = convert.TimeInSeconds(timecode);
			document.CPU.seekElementAt(audiotag, secs);

			let mocked_event = {target : audiotag};
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
			on_debug(callback_fx);
		}

		let selector_fallback = 'cpu-audio audio'; // should be 'audio[controls]' but PHRACK APPLE !

		let audiotag = /** @type {HTMLAudioElement} */ ( (hash !== '') ? document.getElementById(hash)  :  document.querySelector(selector_fallback) );

		if ((audiotag == null) || (audiotag.currentTime === undefined)) {
			warn(`Unknow audiotag ${hash}`);
			return;
		}

		let mocked_event = {target : audiotag};
		if (audiotag.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {  /*  WHHYYYY ?????? */
			audiotag.addEventListener('loadedmetadata', do_needle_move , once_passive_ev);
			audiotag.load();
			trigger.update(mocked_event);
		} else {
			do_needle_move(mocked_event);
		}
		// No problems
	},

	/**
	 * @summary Position a <audio> element to a time position
	 * @public
	 *
	 * @param      {HTMLAudioElement}  audiotag  <audio> DOM element
	 * @param      {number}  seconds   	Wanted position, in seconds
	 *
	 */
	seekElementAt : function (audiotag, seconds) {
		if ((isNaN(seconds)) || // may happens, if the audio track is not loaded/loadable
			(is_audiotag_streamed(audiotag))) { // never try to set a position on a streamed media
			return;
		}

		if (audiotag.fastSeek !== undefined) {
			// HTMLAudioElement.fastSeek() is an experimental but really fast function.
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
		// it may be still constructing it, so be precautionous
		controller?.update_loading?.(seconds);
	},

	/**
	 * @summary For any ShadowDOM element, will returns its parent interface container
 	 * @public
	 *
	 * @param      {Element}  child   The ShadowDOM child
	 * @return     {Element}  The #interface element
	 */
	find_interface : function(child) {
		return child.closest(selector_interface);
	},
	/**
	 * @summary For any <audio> tag or its child tag or shadowDOM element, returns the element `CPU` API
 	 * @public
	 *
	 * @param      {Element}  child   The child
	 * @return     {CPU_element_api}       Element.CPU
	 */
	find_container : function(child) {
		if ([CpuAudioTagName, CpuControllerTagName].includes(child.tagName)) {
			return child.CPU;
		}

		let closest_cpuaudio = child.closest(CpuAudioTagName);
		if (closest_cpuaudio) {
			return closest_cpuaudio.CPU;
		}

		let _interface = document.CPU.find_interface(child);
		return _interface.parentNode.host.CPU;
	},
	/**
>	 * @summary Return the current playing playlist array
	 * @public
	 *
	 * @return     {Array}  Array with named id
	 */
	find_current_playlist : function() {

		let current_audiotag = this.global_controller?.audiotag;
		if (!current_audiotag) {
			return [];
		}
		for (let playlist_name in this.playlists) {
			if (this.playlists[playlist_name].includes(current_audiotag.id)) {
				return this.playlists[playlist_name];
			}
		}
		return [];
	}
};
