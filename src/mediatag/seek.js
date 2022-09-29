import { findCPU } from '../primitives/utils.js';

import { isAudiotagStreamed, uncertainPosition, normalizeSeekTime } from './time.js';

/**
 * @summary Position a <audio> element to a time position
 * @public
 *
 * @param      {HTMLAudioElement}  audiotag  <audio> DOM element
 * @param      {number}  seconds   	Wanted position, in seconds
 *
 */
export const seekElementAt = function (audiotag, seconds) {
	if ((uncertainPosition(seconds)) || // may happens, if the audio track is not loaded/loadable
		(isAudiotagStreamed(audiotag))) { // never try to set a position on a streamed media
		return;
	}
	seconds = normalizeSeekTime(audiotag, seconds);

	if (audiotag.fastSeek) {
		// HTMLAudioElement.fastSeek() is an experimental but really fast function. Firefox only, alas
		// Note that since the writing of this part, Safari aslo knows fastSeek(). It may be the root cause of some of my issues, as #149
		audiotag.fastSeek(seconds);
	} else {
		try {
			const settime = () => {audiotag.currentTime = seconds;} ;
			// Browsers may not have fastSeek but can set currentTime
			if (audiotag.readyState >= audiotag.HAVE_CURRENT_DATA) {
				// Chrome, Edge, and any other webkit-like except Safari on iPhone
				settime();
			} else {
				// Safari on iPhone is totally incumbent on media throbbing
				// See https://github.com/dascritch/cpu-audio/issues/138#issuecomment-816526902
				// and https://stackoverflow.com/questions/18266437/html5-video-currenttime-not-setting-properly-on-iphone
				audiotag.load();
			    settime();
			    if (audiotag.currentTime < seconds){
			        audiotag.addEventListener("loadedmetadata", settime, { once: true });
			    }
			}
		} catch(e) {
			// except sometimes, so you must use standard media fragment
			audiotag.src = `${audiotag.currentSrc.split('#')[0]}#t=${seconds}`;
		}
	}

	// it may be still constructing it, so be precautionous
	findCPU(audiotag)?.updateLoading?.(seconds);
};

export default seekElementAt;