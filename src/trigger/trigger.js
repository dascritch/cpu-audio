import { pause, playOnce, play, toggleplay, timecodeEnd } from '../mediatag/actions.js';

import fine_nav from './fine_nav.js';
import hash_order from './hash_order.js';
import throbber  from './throbber.js';
import trigger_key from './key.js';
import cue from './cue.js';
import track from './track.js';
import trigger_update from './update.js';


export const trigger = {
	...hash_order,
	...fine_nav,
	...throbber,
	...trigger_key,
	...trigger_update,
	...cue,
	...track,
	pause,
	playOnce,
	play,
	toggleplay,

	// @private   Needed for tests
	_end : () => timecodeEnd,

};

export default trigger;