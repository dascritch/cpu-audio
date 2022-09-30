import { isAudiotagStreamed } from '../mediatag/time.js';
import { pause, timecodeEnd } from '../mediatag/actions.js';

import { updateAudiotag } from '../mediatag/extension.js';

/**
 * @summary Updatting time position. Pause the playing element if a end position was defined
 *
 * @param      {Object}  event   The event
 */
export function update({target:audiotag}) {
	if ((timecodeEnd !== false) && (audiotag.currentTime > timecodeEnd)) {
		pause(undefined, audiotag);
	}

	updateAudiotag(audiotag);
	if ((!audiotag.paused) && (!isAudiotagStreamed(audiotag))) {
		window.localStorage.setItem(audiotag.currentSrc, String(audiotag.currentTime));
	}
}

export const trigger_update = {
	update
};


export default trigger_update;