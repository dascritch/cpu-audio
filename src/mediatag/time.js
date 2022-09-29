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
 * - even if it is a finished file, its duration is still unknown (Chrome may be late)
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
	const _natural = Number(duration);
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
 * @summary Normalize a seeked time between limits of an audiotag
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
