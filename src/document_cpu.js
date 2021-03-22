import {findInterface, findContainer, once_passive_ev, selector_audio_in_component, warn} from './utils.js';
import {DefaultParametersDocumentCPU} from './default_document_cpu_parameters.js';
import {defaultDataset} from './default_dataset.js';
import {convert, timeInSeconds} from './convert.js';
import {trigger} from './trigger.js';
import {is_audiotag_streamed} from './media_element_extension.js';

export const DocumentCPU = {
	// global object for global API

	// public, parameters
	...DefaultParametersDocumentCPU,

	// public, actual active elements
	// @public
	// @type {HTMLAudioElement|null}
	currentAudiotagPlaying : null,
	// @type {CpuControllerElement|null}
	// @public
	globalController : null,

	// private, indicate a play already occured in the DOM, so we can start any play
	// @private
	// @type boolean
	hadPlayed : false,

	// private, indicate last used audiotag
	// @private
	// @type {HTMLAudioElement|null}
	lastUsed : null,

	// public, playlists
	// @public
	// @type Object
	playlists : {},

	// public, Exposing internals needed for tests
	// @public
	convert,
	// @public
	trigger,

	defaultDataset,

	// @public utilities to find shadowRoot and CPU API
	findInterface,
	findContainer,

	/**
	 * @public
	 * @summary Determines if audiotag is currently playing.
	 *
	 * @param      {HTMLAudioElement}   audiotag  The audiotag
	 * @return     {boolean}  True if audiotag playing, False otherwise.
	 */
	isAudiotagPlaying : function(audiotag) {
		let currentAudiotagPlaying = document.CPU.currentAudiotagPlaying;
		return (currentAudiotagPlaying) && (audiotag.isEqualNode(currentAudiotagPlaying));
	},
	/**
	 * @public
	 * @summary Determines if audiotag is displayed in <cpu-controller>
	 *
	 * @param      {HTMLAudioElement}   audiotag  The audiotag
	 * @return     {boolean}  True if audiotag global, False otherwise.
	 */
	isAudiotagGlobal : function(audiotag) {
		return this.globalController ? 
			audiotag.isEqualNode(this.globalController.audiotag) : 
			this.isAudiotagPlaying(audiotag);
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
		function doNeedleMove({target:audiotag}) {
			// maybe we should add `timecode` in argument (timecode, event), and bind it to the event listener, moving the function upper
			let secs = timeInSeconds(timecode);
			document.CPU.seekElementAt(audiotag, secs);

			let mocked_event = {target : audiotag};
			if (audiotag.readyState >= audiotag.HAVE_FUTURE_DATA) {
				doElementPlay(mocked_event);
			} else {
				audiotag.addEventListener('canplay', doElementPlay, once_passive_ev);
			}
			trigger.update(mocked_event);
		}

		/**
		 * @param 	{Object}	event 	triggered event, or mockup
		 */
		function doElementPlay(event) {
			let tag = event.target;
			trigger.play(null, tag);
			callback_fx?.();
		}

		let audiotag = /** @type {HTMLAudioElement} */ ( (hash !== '') ? document.getElementById(hash)  :  document.querySelector(selector_audio_in_component) );

		if ((audiotag == null) || (audiotag.currentTime === undefined)) {
			warn(`Unknow audiotag ${hash}`);
			return;
		}

		let mocked_event = {target : audiotag};
		if (audiotag.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
			// WHHYYYY ??????
			audiotag.addEventListener('loadedmetadata', doNeedleMove , once_passive_ev);
			audiotag.load();
			trigger.update(mocked_event);
		} else {
			doNeedleMove(mocked_event);
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

		if (audiotag.fastSeek) {
			// HTMLAudioElement.fastSeek() is an experimental but really fast function.
			audiotag.fastSeek(seconds);
		} else {
			try {
				// Browsers may not have fastSeek but can set currentTime
				audiotag.currentTime = seconds;
			} catch(e) {
				// except sometimes, so you must use standard media fragment
				audiotag.src = `${audiotag.currentSrc.split('#')[0]}#t=${seconds}`;
			}
		}

		let controller = audiotag.CPU_controller();
		// it may be still constructing it, so be precautionous
		controller?.update_loading?.(seconds);
	},


	/**
>	 * @summary Return the current playing playlist array
	 * @public
	 *
	 * @return     {Array}  Array with named id
	 */
	findCurrentPlaylist : function() {

		let current_audiotag = this.globalController?.audiotag;
		if (!current_audiotag) {
			return [];
		}
		for (let playlist of this.playlists) {
			if (playlist.includes(current_audiotag.id)) {
				return playlist;
			}
		}
		return [];
	}
};
