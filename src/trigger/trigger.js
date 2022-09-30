import { isAudiotagStreamed } from '../mediatag/time.js';
import { updateAudiotag } from '../mediatag/extension.js';
import { pause, playOnce, play, toggleplay, timecodeEnd } from '../mediatag/actions.js';

import fine_nav from './fine_nav.js';
import hash_order from './hash_order.js';
import throbber  from './throbber.js';
import trigger_key from './key.js';
import cue from './cue.js';
import track from './track.js';


export const trigger = {
	...hash_order,
	...fine_nav,
	...throbber,
	...trigger_key,
	...cue,
	...track,
	pause,
	playOnce,
	play,
	toggleplay,

	// @private   Needed for tests
	_end : () => timecodeEnd,


	/**
	 * @summary Updatting time position. Pause the playing element if a end position was defined
	 *
	 * @param      {Object}  event   The event
	 */
	update : function({target:audiotag}) {
		if ((timecodeEnd !== false) && (audiotag.currentTime > timecodeEnd)) {
			trigger.pause(undefined, audiotag);
		}

		updateAudiotag(audiotag);
		if ((!audiotag.paused) && (!isAudiotagStreamed(audiotag))) {
			window.localStorage.setItem(audiotag.currentSrc, String(audiotag.currentTime));
		}
	},

};

export default trigger;