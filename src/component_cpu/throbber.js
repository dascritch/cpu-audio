import { secondsInColonTime, secondsInTime } from '../primitives/convert.js';

import { isAudiotagStreamed, uncertainDuration } from '../mediatag/time.js';
import { audiotagPreloadMetadata } from '../mediatag/extension.js';

import trigger from '../trigger/trigger.js';

export const throbber = {

	/**
	 * @summary Position an element in the timeline, on its time
	 * @private
	 *
	 * @param      {Element} 			  		    element         Element to impact, should be in #time
	 * @param      {number|null|undefined}   	  	seconds_begin   Starts position in seconds, do not apply if undefined
	 * @param      {number|null|undefined|boolean}	seconds_end     Ends position in seconds, do not apply if NaN
	 */
	positionTimeElement: function(element, seconds_begin = null, seconds_end = null) {
		const { duration } = this.audiotag;

		if (uncertainDuration(duration)) {
			// duration still unkown ! We will need to redraw later the tracks
			return;
		}

		// completely ugly... but « WAT » ! as in https://www.destroyallsoftware.com/talks/wat
		const isSeconds = (sec) => ((sec != undefined) && (sec !== false));

		if (isSeconds(seconds_begin)) {
			element.style.left =  `${100 * (seconds_begin / duration)}%`;
		}
		if (isSeconds(seconds_end)) {
			element.style.right = `${100 * (1 - (seconds_end / duration))}%`;
		}

	},

	/**
	 * @summary Shows the throbber
	 *
	 * @public
	 *
	 * @param      {number}  seeked_time  The seeked time
	 */
	showThrobberAt: async function(seeked_time) {
		const audiotag = this.audiotag;
		if (audiotag.duration < 1) {
			// do not try to show if no metadata
			return;
		}
		if ((isNaN(audiotag.duration)) && (!isAudiotagStreamed(audiotag))) {
			// as we navigate on the timeline, we wish to know its total duration
			// yes, this is twice calling, as of trigger.throbble()
  			audiotag.setAttribute('preload', 'metadata');
			audiotagPreloadMetadata(audiotag, trigger.hover, event);
		}

		const phylactere = this.shadowId('popup');
		this.positionTimeElement(phylactere, seeked_time);
		phylactere.style.opacity = 1;
		phylactere.innerHTML = secondsInColonTime(seeked_time);
		phylactere.dateTime = secondsInTime(seeked_time).toUpperCase();
	},

	/**
	 * @summary Hides immediately the throbber.
	 * @public
	 */
	hideThrobber: function() {
		// we use opacity instead of a class change to permits opacity smooth transition via `--cpu-background-transitions`
		// well, in fact, i can use a class, and change opacity from the css.... facepalm.
		this.shadowId('popup').style.opacity = 0;
	},

	/**
	 * @summary Hides the throbber later. Will delay the hiding if recalled.
	 * @public
	 */
	hideThrobberLater: function() {
		const hideThrobber_delay = 1000;
		const phylactere = this.shadowId('popup');
		if (phylactere._hider) {
			window.clearTimeout(phylactere._hider);
		}
		phylactere._hider = window.setTimeout( () => { this.hideThrobber(); }, hideThrobber_delay);
	}	
};


export default throbber;