import { findCPU } from '../primitives/utils.js';
import { warn } from '../primitives/console.js';

import { play } from '../mediatag/actions.js';


/**
 * @summary Common code for trigger.prevtrack and trigger.nexttrack
 *
 * @param      {HTMLAudioElement}  	audiotag  	The audiotag we're leaving
 * @param      {Number}			  	offset  	The offset to apply on the index
 */
function playRelativeTrackInPlaylist(audiotag, offset) {
	const {id} = audiotag;

	const playlist_name = audiotag.dataset.playlist;
	if (!playlist_name) {
		// should I test strict ? We may have a funnily 'undefined' named playlist ;)
		return;
	}

	// and is in a declarated playlist
	const playlist = document.CPU.playlists[playlist_name];
	if (!playlist) { 
		warn(`Named playlist ${playlist_name} not created. WTF ?`);
		return;
	}
	const playlist_index = playlist.indexOf(id);
	if (playlist_index < 0) {
		warn(`Audiotag ${id} not in playlist ${playlist_name}. WTF ?`);
		return;
	}

	const next_id = playlist[playlist_index + offset];
	if (!next_id) {
		// out of playlist
		return;
	}

	const next_audiotag = /** @type {HTMLAudioElement} */ (document.getElementById(next_id));
	if (!next_audiotag) {
		warn(`Audiotag #${next_id} doesn't exists. WTF ?`);
		return;
	}
	// Play the next media in playlist, starting at zero
	document.CPU.seekElementAt(next_audiotag, 0);
	play(null, next_audiotag);
}

export const track = {
	/**
	 * @summary When #prevtrack button is clicked, go back in playlist
	 *
	 * @param      {Object}  							event     The event
	 * @param      {HTMLAudioElement|null|undefined}  	audiotag  The audiotag, mays be omitted, will be calculated from event
	 */
	prevtrack : function({target}, audiotag = null) {
		playRelativeTrackInPlaylist(audiotag ?? findCPU(target).audiotag, -1);
	},

	/**
	 * @summary When an audiotag is ended, advance in playlist. Also when #nexttrack button clicked
	 *
	 * @param      {Object}  							event     The event
	 * @param      {HTMLAudioElement|null|undefined}  	audiotag  The audiotag, mays be omitted, will be calculated from event
	 */
	nexttrack : function({target}, audiotag = null) {
		playRelativeTrackInPlaylist(audiotag ?? findCPU(target).audiotag, +1);
	},	
};

export default track;