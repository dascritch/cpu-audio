import { dynamicallyAllocatedIdPrefix, findCPU } from '../primitives/utils.js';
import { passiveEvent, oncePassiveEvent } from '../primitives/events.js';
import { browserIsDecent } from '../primitives/checkers.js';

import { isAudiotagStreamed } from './time.js';
import { lastPlayError } from './actions.js';

import trigger from '../trigger.js';
import { addToPlaylist } from '../build_playlist.js';

// Indicate if media element was already played, and so is prone to re-autoplay later
// null or undefined if not yet connected to cpu-audio.js
// false if connected but not played yet
// true if connected and already played once
HTMLAudioElement.prototype._CPU_played = null;

// Support for planes and points. Changed to {} at webcomponent instantiation
HTMLAudioElement.prototype._CPU_planes = null;


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
	if ((lasttimecode > 0) && (!lastPlayError)) {
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
 * @summary Force <audio> to preload its metadata, and so its duration, then call the callback() with the event parameter
 * @private
 *
 * @param       {HTMLAudioElement}	audiotag    The playing <audio> tag
 * @param       {function}			callback   	Once metadata loaded, function to callback
 * @param 		{any}				event 		...with it main parameter, usually an event
 */
export function audiotagPreloadMetadata(audiotag, callback=null, event=null) {
	if (!audiotag) {
		return;
	}
	if (audiotag.readyState > audiotag.HAVE_NOTHING) {
		callback?.(event);
		return;
	}
	// loading metadata. May not work on Apples : 'loadedmetadata'
	if (callback) {
		audiotag.addEventListener(
			'loadedmetadata',
			() => callback?.(event),
			oncePassiveEvent
		);
	}
	
	//audiotag.setAttribute('preload', 'metadata');
	audiotag.load();
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
	for (let on of [
		'ready', 'load', 'loadeddata', 'canplay', 'abort',
		'error', 'emptied',
		'play', 'playing', 'pause', 'ended',
		'durationchange',  'loadedmetadata', 'timeupdate', 'waiting'
	]) {
		audiotag.addEventListener(on, trigger.update, passiveEvent);
	}

	if (!browserIsDecent) {
		// in case we are in legacy mode
		for (let on of ['pause', 'ended']) {
			audiotag.addEventListener(on, trigger.pause, passiveEvent);
		}
	}

	// ask ASAP metadata about media
	if (audiotag.getAttribute('preload') === '') {
		audiotagPreloadMetadata(audiotag);
	}
}

/**
 * @summary Trigger display updates in the interface
 * @private
 * @param      {HTMLAudioElement}  	audiotag   		Tag to refresh interface
 */
export function updateAudiotag(audiotag) {
	findCPU(audiotag)?.update();
	document.CPU.globalController?.update();
}

/**
 * @summary Connects an audiotag to CPU APIs, launched at start or when the webcomponent appears
 *
 * @param      {HTMLAudioElement}  audiotag  The audiotag
 */
export function connectAudiotag(audiotag) {
	if (audiotag._CPU_played != null) {
		return;
	}
	audiotag._CPU_played = false;

	attach_events_audiotag(audiotag);

	// hide native controls
	audiotag.hidden = true;  
	// PHRACK SAFARI // may be we should remove upper line ?
	audiotag.removeAttribute('controls');

	// playlist
	addToPlaylist(audiotag);
}

