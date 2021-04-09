import {CpuAudioTagName, dynamicallyAllocatedIdPrefix, browserIsDecent, passiveEvent, oncePassiveEvent} from './utils.js';

import {trigger} from './trigger.js';
import {buildPlaylist} from './build_playlist.js';

// Indicate if media element was extended
HTMLAudioElement.prototype.CPU_connected = false;

/**
 * @summary At start, will start the last playing <audio> tag at its last known position
 *
 * @param      {Object}  event   The event
 */
function recallStoredPlay(event) {
	let audiotag = event.target;
	if ((document.CPU.currentAudiotagPlaying !== null) || (isAudiotagStreamed(audiotag))) {
		return;
	}
	let lasttimecode = Number(window.localStorage.getItem(audiotag.currentSrc));
	// TODO and no hashed time
	if ((lasttimecode > 0) && (!trigger._last_play_error)) {
		document.CPU.seekElementAt(audiotag, lasttimecode);
		trigger.play(null, audiotag);
	}
}

// used for addIdToAudiotag , when tag was not named in HTML or DOM
let	count_element = 0;

/**
 * @summary Adds an identifier to audiotag at build time.
 * @private
 */
export function	addIdToAudiotag(audiotag) {
	audiotag.id = audiotag.id || `${dynamicallyAllocatedIdPrefix}${count_element++}`;
}


/**
 * @summary Determines if audiotag source is streamed, and so unactivate reposition, position memory, length display…
 *
 * @param      {HTMLAudioElement|null}  audiotag  The audiotag
 * @return     {boolean}            	True if audiotag streamed, False otherwise.
 */
export function isAudiotagStreamed(audiotag) {
	return ((audiotag == null) || (audiotag.duration === Infinity) || (audiotag.dataset.streamed != null));
}


/**
 * @summary Checks if a time position is seekabe into an audiotag 
 * @private
 *
 * @param      {number|null}  	time   	Expected time to seek in an audiotag
 * @return     {boolean}       			Unusable time
 */
export function uncertainPosition(time) {

	return (time === Infinity) || (time === null) || (isNaN(time));
}


/**
 * @summary Checks if an audiotag's duration is suitable for ratio maths
 * A media may have unusable duration for ratio because 
 * - media is unreadable
 * - media is streamed
 * - even if it is a fishied file, its duration is still unknown (Chrome may be late)
 * @private
 *
 * @param      {number|null}  	duration   	`duration` of an audiotag, or result of `audiotagDuration(audiotag)`
 * @return     {boolean}       				Unusable duration
 */
export function uncertainDuration(duration) {

	return (duration === 0) || (uncertainPosition(duration));
}

/**
 * @summary Try to find audiotag duration, or its manually declared duration
 * @private
 *
 * @param      {HTMLAudioElement}  	audiotag   	Audio to check length
 * @return     {Number|null}       			Result in seconds. Null if non applicable
 */
export function audiotagDuration({duration, dataset}) {
	let out = null;
	let _natural = Number(duration);
	if (!isNaN(_natural)){
		out = _natural;
	} else {
		const _forced = Number(dataset.duration);
		if (_forced > 0) {
			out = _forced;
		}
	}
	return out;
}

/**
 * @summary Normalize  a seeked time  between limits of an audiotag
 * @private
 *
 * @param      {HTMLAudioElement}  	audiotag   		Audio to check length
 * @param      {Number}			  	time_seeked		Time position to check
 * @return     {Number}       		Result in seconds
 */
export function normalizeSeekTime(audiotag, time_seeked) {
	time_seeked = time_seeked < 0 ? 0 : time_seeked;
	const duration = audiotagDuration(audiotag);
	if (!uncertainDuration(duration)) {
		time_seeked = time_seeked < duration ? time_seeked :  duration ;
	}
	return time_seeked;
}


/**
 * @summary Force <audio> to preload its metadata, and so its duration, then callback the event
 * @private
 *
 * @param       {HTMLAudioElement}	audiotag    The playing <audio> tag
 * @param       {function}			callback   	Once metadata loaded, function to callback
 * @param 		{any}				event 		...with it main parameter, usually an event
 */
export function audiotagPreloadMetadata(audiotag, callback=null, event=null) {
	audiotag.addEventListener(
		'loadedmetadata',
		() => {callback?.(event);},
		oncePassiveEvent);
	// loading metadata. May not work on Apples
	audiotag.setAttribute('preload', 'metadata');
}

/**
 * @summary Attach events on a <audio> tag
 *
 * @param      {HTMLAudioElement}  audiotag  The audiotag
 */
export function attach_events_audiotag(audiotag) {
	audiotag.addEventListener('loadedmetadata', recallStoredPlay, oncePassiveEvent);
	audiotag.addEventListener('play', trigger.playOnce, passiveEvent);
	audiotag.addEventListener('ended', trigger.nexttrack, passiveEvent);
	// those ↓ for PHRACKING SAFARI
	audiotag.addEventListener('ready', recallStoredPlay, passiveEvent);
	audiotag.addEventListener('canplay', recallStoredPlay, passiveEvent);

	// see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events for list of events
	[
		'ready', 'load', 'loadeddata', 'canplay', 'abort',
		'error', 'emptied',
		'play', 'playing', 'pause', 'ended',
		'durationchange',  'loadedmetadata', 'timeupdate', 'waiting'
	].forEach( (on) => {
		audiotag.addEventListener(on, trigger.update, passiveEvent);
	});

	if (!browserIsDecent()) {
		// in case we are in legacy mode
		[
			'pause', 'ended'
		].forEach( (on) => {
			audiotag.addEventListener(on, trigger.pause, passiveEvent);
		});
	}

	// ask ASAP metadata about media
	if (audiotag.getAttribute('preload') === '') {
		audiotagPreloadMetadata(audiotag);
	}
}

/**
 * @summary Connects an audiotag to CPU APIs, launched at start or when the webcomponent appears
 *
 * @param      {HTMLAudioElement}  audiotag  The audiotag
 */
export function connectAudiotag(audiotag) {
	if (audiotag.CPU_connected) {
		return;
	}
	audiotag.CPU_connected = true;

	attach_events_audiotag(audiotag);

	// hide native controls
	audiotag.hidden = true;
	// PHRACK SAFARI
	audiotag.removeAttribute('controls');

	// playlist
	if (typeof(audiotag.dataset.playlist) === 'string') {
		let playlist_name = audiotag.dataset.playlist;
		if (!(playlist_name in document.CPU.playlists)) {
			document.CPU.playlists[playlist_name] = [];
		}
		// TODO do not rerecord id if already in this playlist. Remove from other playlists
		// TODO LATER, remove id when cpu-audio or audiotag removed
		document.CPU.playlists[playlist_name].push(audiotag.id);

		// refresh controller playlist if any
		let globalController = document.CPU.globalController;
		if ((globalController) && (playlist_name === document.CPU.currentPlaylist())) {
			buildPlaylist();
		}
	}
}


/**
 * @summary Return the parent <cpu-audio> DOM element
 *
 * @class      CPU_controller (name)
 * @return     {Element}  <cpu-audio> DOM element
 */
HTMLAudioElement.prototype.CPU_controller = function() {
	return this.closest(CpuAudioTagName);
};

/**
 * @summary Trigger display updates in the interface
 *
 * @class      CPU_update (name)
 */
HTMLAudioElement.prototype.CPU_update = function() {
	let controller = this.CPU_controller();
	if (controller) {
		let api = controller.CPU;
		if ((api) && (api.update)) {
			// i don't like try catch
			api.update();
		}
	}
	if (document.CPU.globalController) {
		document.CPU.globalController.update();
	}
};
