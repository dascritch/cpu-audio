import {CpuAudioTagName, dynamically_allocated_id_prefix, is_decent_browser_for_webcomponents, passive_ev} from './utils.js';

import {trigger} from './trigger.js';

// Indicate if media element was extended
HTMLAudioElement.prototype.CPU_connected = false;

/**
 * @summary At start, will start the last playing <audio> tag at its last known position
 *
 * @param      {Object}  event   The event
 */
function recall_stored_play(event) {
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
	audiotag.id = audiotag.id || `${dynamically_allocated_id_prefix}${count_element++}`;
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
 * @summary Attach events on a <audio> tag
 *
 * @param      {HTMLAudioElement}  audiotag  The audiotag
 */
export function attach_events_audiotag(audiotag) {
	audiotag.addEventListener('loadedmetadata', recall_stored_play, passive_ev);
	audiotag.addEventListener('play', trigger.play_once, passive_ev);
	audiotag.addEventListener('ended', trigger.ended, passive_ev);
	// those ↓ for PHRACKING SAFARI
	audiotag.addEventListener('ready', recall_stored_play, passive_ev);
	audiotag.addEventListener('canplay', recall_stored_play, passive_ev);

	// see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Media_events for list of events
	[
		'ready', 'load', 'loadeddata', 'canplay', 'abort',
		'error', 'emptied',
		'play', 'playing', 'pause', 'ended',
		'durationchange',  'loadedmetadata', 'timeupdate', 'waiting'
	].forEach( (on) => {
		audiotag.addEventListener(on, trigger.update, passive_ev);
	});

	if (!is_decent_browser_for_webcomponents()) {
		// in case we are in legacy mode
		[
			'pause', 'ended'
		].forEach( (on) => {
			audiotag.addEventListener(on, trigger.pause, passive_ev);
		});
	}

	// ask ASAP metadata about media
	if (audiotag.getAttribute('preload') === '') {
		audiotag.preload = 'metadata';
		audiotag.load();
	}
}

/**
 * @summary Connects an audiotag to CPU APIs, launched at start or when the webcomponent appears
 *
 * @param      {HTMLAudioElement}  audiotag  The audiotag
 */
export function connect_audiotag(audiotag) {
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
	if (document.CPU.globalController !== null) {
		document.CPU.globalController.update();
	}
};
