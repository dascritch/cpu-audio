import { timeInSeconds } from '../primitives/convert.js';
import { selectorAudioInComponent } from '../primitives/utils.js';
import { oncePassiveEvent } from '../primitives/events.js';
import { warn } from '../primitives/console.js';

import trigger from '../trigger.js';

/**
 * @public
 * @summary Position a timecode to a named audio tag
 *
 * @param      {string}   hash         The id="" of an <audio> tag
 * @param      {string}   timecode     The timecode,
 * @param      {Function|null|undefined}   callback_fx  Function to be called afterwards, for ending tests
 */
export const jumpIdAt = async function(hash, timecode, callback_fx=undefined) {

	/**
	 * @param 	{Object}	event 	triggered event, or mockup
	 */
	function doNeedleMove({target:audiotag}) {
		// maybe we should add `timecode` in argument (timecode, event), and bind it to the event listener, moving the function upper
		const secs = timeInSeconds(timecode);
		document.CPU.seekElementAt(audiotag, secs);

		const mocked_event = {target : audiotag};
		if (audiotag.readyState >= audiotag.HAVE_FUTURE_DATA) {
			doElementPlay(mocked_event);
		} else {
			audiotag.addEventListener('canplay', doElementPlay, oncePassiveEvent);
		}
		trigger.update(mocked_event);
	}

	/**
	 * @param 	{Object}	event 	triggered event, or mockup
	 */
	function doElementPlay(event) {
		trigger.play(null, event.target);
		callback_fx?.();
	}

	const audiotag = /** @type {HTMLAudioElement} */ ( (hash !== '') ? document.getElementById(hash)  :  document.querySelector(selectorAudioInComponent) );

	if ( ( audiotag?.currentTime ?? null ) == null ) {
		warn(`Unknow audiotag #${hash}`);
		return;
	}

	const mocked_event = {target : audiotag};
	if (audiotag.readyState < audiotag.HAVE_CURRENT_DATA) {
		// WHHYYYY ??????
		audiotag.addEventListener('loadedmetadata', doNeedleMove , oncePassiveEvent);
		audiotag.load();
		trigger.update(mocked_event);

		return;
	}

	doNeedleMove(mocked_event);
	// No problems
};

export default jumpIdAt;