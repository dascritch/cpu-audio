import { findCPU } from './primitives/utils.js';
import { adjacentArrayValue } from './primitives/operators.js';
import { warn } from './primitives/console.js';
import { timeInSeconds } from './primitives/convert.js';

import { isAudiotagStreamed, audiotagDuration, uncertainDuration, normalizeSeekTime } from './mediatag/time.js';
import { updateAudiotag, audiotagPreloadMetadata } from './mediatag/extension.js';
import { pause, playOnce, play, toggleplay, timecodeEnd, setTimecodes } from './mediatag/actions.js';

import { planeAndPointNamesFromId } from './component/planename.js';

import { buildPlaylist } from './build_playlist.js';

const KEY_LEFT_ARROW = 37;
const KEY_RIGHT_ARROW = 39;

// actual active elements
// @type {string|null}
let	body_className_playing_cue = null;


/**
 * @summary Common code for trigger.prevcue and trigger.nextcue
 *
 * @param      {HTMLAudioElement}  	audiotag  	The audiotag we're leaving
 * @param      {Number}			  	offset  	The offset to apply on the index
 */
function playRelativeCueInPlayer(container, offset) {
	const audiotag = container.audiotag;
	const points = container.planePoints('_chapters');
	if (!points) {
		return;
	}
	const {pointName} = planeAndPointNamesFromId( body_className_playing_cue );
	let go = adjacentArrayValue(points, pointName, offset);
	let pointList = Object.values(points);
	if (offset < 0) {
		pointList = pointList.reverse();
	}
	const {currentTime} = audiotag;
	if (!go) {
		for (const cue of pointList) {
			if ( (!go) && (
				((offset < 0) && (cue.end <= currentTime))  || 
				(((offset > 0) && (cue.start >= currentTime)) )
			) ) {
				go = cue;
			}
		}
	}
	if (go) {
		document.CPU.jumpIdAt(audiotag.id, go.start);
	}
}

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
	trigger.play(null, next_audiotag);
}

export const trigger = {
	// @private   Needed for tests
	_end : () => { return timecodeEnd; },


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

	/**
	 * @summary    Interprets the hash part of the URL, when loaded or changed
	 * @package
	 *
	 * still exposed in public for tests
	 *
	 * @param      {string|Object}  hashcode     Called hashcode
	 * @param      {Function|null}  callback_fx  When done, call a function (optional, to end the tests).
	 */
	hashOrder : async function(hashcode, callback_fx = null) {
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
	},

	/**
	 * @summary Update throbber position when hovering the timeline interface
	 *
	 * @param      {Object}  event   The calling event
	 */
	hover : function(event) {
		const {target, clientX, targetTouches} = event;
		if (!target) {
			// pointerenter event may be fired without target. Strange for a pointer
			return;
		}
		const container = findCPU(target);
		const audiotag = container.audiotag;
		const duration = audiotagDuration(audiotag);
		if (uncertainDuration(duration)) {
			if (!isAudiotagStreamed(audiotag)) {
				audiotagPreloadMetadata(audiotag, trigger.hover, event);
			}
			return;
		}
		const {x, width} = container.shadowId('time').getBoundingClientRect();
		// clientX - x ⇒ x position of cursor in the #time element 
		// Xoffset / width ⇒ ratio in the timeline
		const ratio = ((clientX ?? targetTouches?.[0]?.clientX) - x) / width;
		// ratio * duration = time position in the audio
		container.showThrobberAt(normalizeSeekTime(audiotag, ratio * duration));
	},

	/**
	 * @summary Hide the throbber when leaving the timeline interface
	 *
	 * @param      {Object}  event   The calling event
	 */
	out : function({target}) {
		findCPU(target).hideThrobber();
	},

	/**
	 * @summary Change play position of a audio tag
	 *
	 * @param      {Object}  event   The calling event, may be mocked
	 */
	throbble : function(event) {
		const {target, offsetX, at} = event;
		const DocumentCPU = document.CPU;
		const elCPU = findCPU(target);
		const audiotag = elCPU.audiotag;
		// We know the media length, because the event is faked → normal execution. 
		if (at >= 0) {
			DocumentCPU.seekElementAt(audiotag, at);
			return;
		}
		// Else : normal trigger usage, via an event

		const ratio = offsetX / target.clientWidth;
		const duration = audiotagDuration(audiotag); // we get the real or supposed duration

		if ((DocumentCPU.currentAudiotagPlaying) && (!DocumentCPU.isAudiotagPlaying(audiotag))) {
			// Chrome needs to STOP any other playing tag before seeking
			//  Very slow seeking on Chrome #89
			trigger.pause(null, DocumentCPU.currentAudiotagPlaying);
		}

		// we may have improper duration due to a streamed media, so let's start directly !
		trigger.play(event, audiotag);
		if (uncertainDuration(duration)) {
			// Correct play from position on the timeline when metadata not preloaded #88
			// indicate we are loading something. We set a full width bar
			elCPU.updateLoading(undefined, 100);
			return;
		}
		DocumentCPU.seekElementAt(audiotag, ratio * duration);
	},

	pause,
	playOnce,
	play,
	toggleplay,

	/**
	 * @summary Interprets pressed key
	 *
	 * @param      {Object}  event   The event
	 * @param      {number}  mult    Multiply the keypressed act, 1 by default
	 */
	key : function(event, mult=1) {
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
			trigger.throbble(event);
			container.hideThrobberLater();
		}

		switch (event.keyCode) {
			case 13 : // enter : standard usage, except if focus is #control
				if (container.focused()?.id.toLowerCase() !== 'control') {
					return;
				}
				trigger.toggleplay(event);
				break;
			case 27 : // esc
				trigger.restart(event);
				trigger.pause(null, audiotag);
				break;
			case 32 : // space
				trigger.toggleplay(event);
				break;
			// pageUp 33
			// pageDown 34
			case 35 : // end
				document.CPU.seekElementAt(audiotag, audiotag.duration);
				break;
			case 36 : // home
				trigger.restart(event);
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
	},

	/**
	 * @summary Pressing restart button, Rewind at start the audio tag
	 *
	 * @param      {Object}  event   The event
	 */
	restart : function({target}) {
		const container = findCPU(target);
		document.CPU.seekElementAt(container.audiotag, 0);
	},
	/**
	 * @summary Pressing reward button
	 *
	 * @param      {Object}  event   The event
	 */
	reward : function(event) {
		// NEVER try to use a {...event, keyCode:} notation for extending an event : it kills the event.target
		event.keyCode = KEY_LEFT_ARROW;
		trigger.key(event);
	},
	/**
	 * @summary Pressing foward button
	 * Function associated, see below, DO NOT RENAME
	 *
	 * @param      {Object}  event   The event
	 */
	foward : function(event) {
		event.keyCode = KEY_RIGHT_ARROW;
		trigger.key(event);
	},
	/**
	 * @summary Pressing fastreward button
	 * Function associated, see below, DO NOT RENAME
	 *
	 * @param      {Object}  event   The event
	 */
	fastreward : function(event) {
		event.keyCode = KEY_LEFT_ARROW;
		trigger.key(event, document.CPU.fastFactor);
	},
	/**
	 * @summary Pressing fastfoward button
	 * Function associated, see below, DO NOT RENAME
	 *
	 * @param      {Object}  event   The event
	 */
	fastfoward : function(event) {
		event.keyCode = KEY_RIGHT_ARROW;
		trigger.key(event, document.CPU.fastFactor);
	},

	/**
	 * @summary Pressing prevcue button
	 *
	 * @param      {Object}  event   The event
	 */
	prevcue : function({target}) {
		playRelativeCueInPlayer(findCPU(target), -1);
	},

	/**
	 * @summary Pressing nextcue button
	 *
	 * @param      {Object}  event   The event
	 */
	nextcue : function({target}) {
		playRelativeCueInPlayer(findCPU(target), 1);
	},

	/**
	 * @summary Refresh document body when changing chapter
	 *
	 * @param      {Object}   active_cue         		The TextTrack actived
	 * @param      {HTMLAudioElement}   audiotag        Audiotag relative to TextTrack
	 *
	 * To not warns on classList.remove()
	 * @suppress {checkTypes}
	 */
	cuechange : function(active_cue, audiotag) {
		const { classList } = document.body;
		classList.remove(body_className_playing_cue);
		// giving a class to document.body, with a syntax according to https://www.w3.org/TR/CSS21/syndata.html#characters
		body_className_playing_cue = `cpu_playing_tag_«${audiotag.id}»_cue_«${active_cue.id}»`;
		classList.add(body_className_playing_cue);
	},

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


export default trigger;