import {dynamicallyAllocatedIdPrefix, browserIsDecent, findCPU, passiveEvent, oncePassiveEvent} from './utils.js';
import {trigger, lastPlayError} from './trigger.js';
import {addToPlaylist} from './build_playlist.js';

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
	if (!uncertainDuration(_natural)) {
		out = _natural;
	} else {
		const _forced = Number(dataset.duration);
		if (!uncertainDuration(_forced)) {  // yes, because isNaN(Number('Infinity')) !
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
 * @return     {Number|null} 	  		    		Result in seconds, null if totally innaplicable
 */
export function normalizeSeekTime(audiotag, time_seeked) {
	if (uncertainPosition(time_seeked)) {
		return null;
	}
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
			() => {callback?.(event);},
			oncePassiveEvent);
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
	addToPlaylist(audiotag);
}

// Indicate if media element was extended
HTMLAudioElement.prototype.CPU_connected = false;

// Indicate if media element was already played, and so is prone to re-autoplay later
HTMLAudioElement.prototype._CPU_played = false;
