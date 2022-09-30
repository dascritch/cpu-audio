import { findCPU } from '../primitives/utils.js';

import { isAudiotagStreamed, audiotagDuration, uncertainDuration, normalizeSeekTime } from '../mediatag/time.js';
import { audiotagPreloadMetadata } from '../mediatag/extension.js';
import { pause, play } from '../mediatag/actions.js';


/**
 * @summary Change play position of a audio tag
 *
 * @param      {Object}  event   The calling event, may be mocked
 */
export function throbble(event) {
	const {target, offsetX, at} = event;
	const DocumentCPU = document.CPU;
	const elCPU = findCPU(target);
	const audiotag = elCPU.audiotag;
	// We know the media length, because the event is faked → normal execution. 
	if (at >= 0) {
		DocumentCPU.seekElementAt(audiotag, at);
		return;
	}
	// Else : normal trigger usage, via an event

	const ratio = offsetX / target.clientWidth;
	const duration = audiotagDuration(audiotag); // we get the real or supposed duration

	if ((DocumentCPU.currentAudiotagPlaying) && (!DocumentCPU.isAudiotagPlaying(audiotag))) {
		// Chrome needs to STOP any other playing tag before seeking
		//  Very slow seeking on Chrome #89
		pause(null, DocumentCPU.currentAudiotagPlaying);
	}

	// we may have improper duration due to a streamed media, so let's start directly !
	play(event, audiotag);
	if (uncertainDuration(duration)) {
		// Correct play from position on the timeline when metadata not preloaded #88
		// indicate we are loading something. We set a full width bar
		elCPU.updateLoading(undefined, 100);
		return;
	}
	DocumentCPU.seekElementAt(audiotag, ratio * duration);
}

/**
 * @summary Update throbber position when hovering the timeline interface
 *
 * @param      {Object}  event   The calling event
 */
export function hover(event) {
	const {target, clientX, targetTouches} = event;
	if (!target) {
		// pointerenter event may be fired without target. Strange for a pointer
		return;
	}
	const container = findCPU(target);
	const audiotag = container.audiotag;
	const duration = audiotagDuration(audiotag);
	if (uncertainDuration(duration)) {
		if (!isAudiotagStreamed(audiotag)) {
			audiotagPreloadMetadata(audiotag, hover, event);
		}
		return;
	}
	const {x, width} = container.shadowId('time').getBoundingClientRect();
	// clientX - x ⇒ x position of cursor in the #time element 
	// Xoffset / width ⇒ ratio in the timeline
	const ratio = ((clientX ?? targetTouches?.[0]?.clientX) - x) / width;
	// ratio * duration = time position in the audio
	container.showThrobberAt(normalizeSeekTime(audiotag, ratio * duration));
}

/**
 * @summary Hide the throbber when leaving the timeline interface
 *
 * @param      {Object}  event   The calling event
 */
function out({target}) {
	findCPU(target).hideThrobber();
}

export const throbber = {
	throbble,
	hover,
	out
};

export default throbber;