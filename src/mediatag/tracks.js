import { prefered_language } from '../primitives/i18n.js';

/**
 * @summary Extract usable chapter tracks from audiotag
 * @private
 *
 * @param      {HTMLAudioElement} 	audiotag	The <audio> supposed to have a chapter tracj
 * @return     {TextTrack|null}  				The TextTrack, or null if not applicable
 */
export function get_chapter_tracks(audiotag) {
	if (!audiotag) {
		return null;
	}

	let chapter_track = null;
	if (audiotag.textTracks?.length > 0) {
		for (const tracks of audiotag.textTracks) {
			if (
					(tracks.kind.toLowerCase() === 'chapters') &&
					(tracks.cues) &&  // linked to default="" attribute, only one per set !
					(
						(!chapter_track) /* still no active track */
						|| (tracks.language.toLowerCase() === prefered_language) /* correspond to <html lang> */
					)
				) {
				chapter_track = tracks;
			}
		}
	}
	return chapter_track;
}