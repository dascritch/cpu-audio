import { findCPU } from '../primitives/utils.js';

import { normalizeSeekTime } from '../mediatag/time.js';
import { pause, toggleplay } from '../mediatag/actions.js';

import { throbble } from './throbber.js';
import { restart } from './fine_nav.js';


export const KEY_LEFT_ARROW = 37;
export const KEY_RIGHT_ARROW = 39;

/**
 * @summary Interprets pressed key
 *
 * @param      {Object}  event   The event
 * @param      {number}  mult    Multiply the keypressed act, 1 by default
 */
export function key(event, mult=1) {
	// do not interpret key when there is a modifier, for not preventing browsers shortcuts
	if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
		return;
	}

	const container = findCPU(event.target);
	const { audiotag } = container;
	/** @param      {number}  seconds    Relative position fowards */
	function seek_relative(seconds) {
		event.at = normalizeSeekTime(audiotag, audiotag.currentTime + seconds);
		container.showThrobberAt(event.at);
		throbble(event);
		container.hideThrobberLater();
	}

	switch (event.keyCode) {
		case 13 : // enter : standard usage, except if focus is #control
			if (container.focused()?.id.toLowerCase() !== 'control') {
				return;
			}
			toggleplay(event);
			break;
		case 27 : // esc
			restart(event);
			pause(null, audiotag);
			break;
		case 32 : // space
			toggleplay(event);
			break;
		// pageUp 33
		// pageDown 34
		case 35 : // end
			document.CPU.seekElementAt(audiotag, audiotag.duration);
			break;
		case 36 : // home
			restart(event);
			break;
		case KEY_LEFT_ARROW : // ←
			seek_relative(- (document.CPU.keymove * mult));
			break;
		case KEY_RIGHT_ARROW : // →
			seek_relative(+ (document.CPU.keymove * mult));
			break;
		case 38 : // ↑
			container.prevFocus(); // ≠  trigger.prevcue(event);
			break;
		case 40 : // ↓ 
			container.nextFocus(); // ≠ trigger.nextcue(event);
			break;
		default:
			return ;
	}
	event.preventDefault?.();
}


export const trigger_key = { key };

export default trigger_key;