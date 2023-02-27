import { findCPU } from '../primitives/utils.js';
import { oncePassiveEvent } from '../primitives/events.js';
import { warn } from '../primitives/console.js';

import { switchControllerTo } from '../cpu_controller.class.js';

// @private
export let lastPlayError = false;
// @private
export let timecodeStart = 0;
// @private 
export let timecodeEnd = false;

const NotAllowedError = 'Auto-play prevented : Browser requires a manual interaction first.';
const NotSupportedError = 'The browser refuses the audio source, probably due to audio format.';

/**
 * @summary    Store last audiotag error
 */
export function setPlayError(message) {
	lastPlayError = message;
}

/**
 * @summary    Do pause
 *
 * @param      {Object|undefined|null}   event     The event, may be omitted
 * @param      {Element|undefined|null}  audiotag  The audiotag, if omitted, will be event's target
 */
export function pause(event = null, audiotag = null) {
	if (!audiotag) {
		const {target} = event;
		audiotag = (target.tagName == 'AUDIO') ? target : findCPU(target).audiotag;
	}
	audiotag.pause();
	document.CPU.currentAudiotagPlaying = null;
	window.localStorage.removeItem(audiotag.currentSrc);
}

/**
 * @summary    Change referenced playing audio, pause the previous one
 *
 * @param      {Object}  event   The event
 */
export function playOnce({target}) {
	const document_cpu = document.CPU;
	// target, aka audiotag
	document_cpu.lastUsed = target;

	if ( 
		(document_cpu.playStopOthers) && 
		(document_cpu.currentAudiotagPlaying) && 
		(!document_cpu.isAudiotagPlaying(target)) 
		) {
		pause(undefined, document_cpu.currentAudiotagPlaying);
	}
	document_cpu.currentAudiotagPlaying = target;
}

/**
 * @summary If playing media was prevented by browser due to missing focus, event on focus does unlock player
 * @private
 *
 * @param      {Object|undefined}  		event    	Unlocking event
 * @param      {HTMLAudioElement|null}  audiotag   	The audiotag to start playing, event's target if not defined
 */
function playOnceUnlock(event, audiotag) {
	lastPlayError = false;
	if (document.CPU.autoplay) {
		play(event, audiotag);
	}
}

/**
 * @summary    Do play an audio tag
 *
 * @param      {Object|undefined|null}   event     The event, may be mocked or ommitted
 * @param      {Element|undefined|null}  audiotag  The audiotag
 */
export function play(event=null, audiotag=null) {
	if ( (!event) && (lastPlayError)) {
		warn(`play() prevented because already waiting for focus`);
		return;
	}
	audiotag = audiotag ?? findCPU(event.target).audiotag;
	lastPlayError = false;
	removeTimecodeOutOfBorders(audiotag.currentTime);
	let promised = audiotag.play();
	if (promised) {
		promised.then(
			() => {
				// we have a successful play occured, we can display wait event later
				document.CPU.hadPlayed = true;
			}
		).catch(
			error => {
				lastPlayError = true;
				const unlock = () => { playOnceUnlock(event, audiotag); };
				switch (error.name) {
					case 'NotAllowedError':
						warn(NotAllowedError);
						document.addEventListener('focus', unlock, oncePassiveEvent);
						document.addEventListener('click', unlock, oncePassiveEvent);

						if (audiotag._CPU_played != null) {
							const CPU_api = findCPU(audiotag);
							CPU_api.glowBeforePlay = true;
							CPU_api.setAct('glow');
						}
						break;
					case 'NotSupportedError':
						error(NotSupportedError);
						break;
				}
			}
		);
	}
	switchControllerTo(audiotag);
}

/**
 * @summary Switch a mediatag between playing or paused
 * @private
 *
 * @param      {number}  at      timecode position
 */
export function toggleplay({target}) {
	const { audiotag } = findCPU(target);
	audiotag.paused ?
		play(null, audiotag) :
		pause(null, audiotag);
}

/**
 * @summary If audio position out of begin/end borders, remove borders
 * @private
 *
 * @param      {number}  at      timecode position
 */
function removeTimecodeOutOfBorders(at) {
	if (
		(at < timecodeStart)
		|| ((timecodeEnd !== false) && (at > timecodeEnd)) 
		) {
		timecodeStart = 0;
		timecodeEnd = false;
	}
}

/**
 * @summary Timecode border setter
 * @private
 *
 * @param      {number}  _timecodeStart      timecode start position
 * @param      {number}  _timecodeEnd        timecode end position
 */
export function setTimecodes(_timecodeStart, _timecodeEnd) {
	timecodeStart = _timecodeStart;
	timecodeEnd = _timecodeEnd;
}