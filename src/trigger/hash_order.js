import { timeInSeconds } from '../primitives/convert.js';

import { setTimecodes } from '../mediatag/actions.js';

import { buildPlaylist } from '../build_playlist.js';


/**
 * @summary    Interprets the hash part of the URL, when loaded or changed
 * @package
 *
 * still exposed in public for tests
 *
 * @param      {string|Object}  hashcode     Called hashcode
 * @param      {Function|null}  callback_fx  When done, call a function (optional, to end the tests).
 */
export async function hashOrder(hashcode, callback_fx = null) {
	let at_start = true;
	if (typeof hashcode !== 'string') {
		at_start = 'at_start' in hashcode;
		hashcode = location.hash.substr(1);
	}
	let hash = null;
	let timecode = '';
	let autoplay = false;

	/*
	// watch out to NOT use URLSearchParams too fast ! 
	for (const [p_key, p_value] of URLSearchParams.searchParams.entries(hashcode) ) {
		if (p_value === '') {
			// should reference to the ID of the element
			hash = hash ?? p_key;
		} else {
			switch (p_key.toLowerCase()) {
				case 't':
					// is a time index
					timecode = p_value || '0';
					// we make autoplay at requested timecode, simplier of the user
					autoplay = true;
					break;
				case 'autoplay':
					// is a card from a social network, run now
					autoplay = p_value === '1';
					break;
				case 'auto_play':
					// is a card from a social network, run now
					autoplay = p_value.toLowerCase() === 'true';
					break;
			}
		}
	}
	*/
	
	// legacy
	for (const parameter of hashcode.split('&')) {
		if (!parameter.includes('=')) {
			// should reference to the ID of the element
			hash = hash ?? parameter;
		} else {
			// should be a key=value parameter
			const [p_key, p_value] = parameter.split('=');
			switch (p_key.toLowerCase()) {
				case 't':
					// is a time index
					timecode = p_value || '0';
					// we make autoplay at requested timecode, simplier of the user
					autoplay = true;
					break;
				case 'autoplay':
					// is a card from a social network, run now
					autoplay = p_value === '1';
					break;
				case 'auto_play':
					// is a card from a social network, run now
					autoplay = p_value.toLowerCase() === 'true';
					break;
			}
		}
	}

	if ((timecode === '') || ((at_start) && (!autoplay))) {
		// this is a normal anchor call. Go back to normal behaviour
		callback_fx?.();
		return /* false */;
	}

	// we may have a begin,end notation
	const [timecode_start, timecode_end] = timecode.split(',');
	let _timecodeStart = timeInSeconds(timecode_start);
	let _timecodeEnd = timecode_end !== undefined ? timeInSeconds(timecode_end) : false;
	if (_timecodeEnd !== false) {
		_timecodeEnd = (_timecodeEnd > _timecodeStart) ?
			_timecodeEnd :
			false;
	}
	setTimecodes(_timecodeStart, _timecodeEnd);

	// scroll to the audio element. Should be reworked, or parametrable , see issue #60
	if (document.CPU.scrollTo) {
		// if the hash was not found, rely on the actual player
		( 
			(hash?.length > 0) ? document.querySelector(`#${hash}`) : document.CPU.currentAudiotagPlaying
		)?.closest('cpu-audio, cpu-controller').scrollIntoView();
	}

	await document.CPU.jumpIdAt( hash??'', timecode_start, callback_fx);

	// not in document.CPU (yet) to avoid unuseful repaint
	buildPlaylist();
}

export const hash_order = {
	hashOrder
};

export default hash_order;