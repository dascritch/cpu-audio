import {once_passive_ev,  is_audiotag_streamed, warn, on_debug} from './utils.js';
import {convert} from './convert.js';

const KEY_LEFT_ARROW = 37;
const KEY_RIGHT_ARROW = 39;

let NotAllowedError = 'Auto-play prevented : Browser requires a manual interaction first.';
let NotSupportedError = 'The browser refuses the audio source, probably due to audio format.';

/**
 * @summary If audio position out of begin/end borders, remove borders
 * @private
 *
 * @param      {number}  at      timecode position
 */
function remove_timecode_outofborders(at) {
	if ( 
		(at < trigger._timecode_start)
		|| ((trigger._timecode_end !== false) && (at > trigger._timecode_end)) ) {
		trigger._timecode_start = 0;
		trigger._timecode_end = false;
	}
}

/**
 * @summary If playing media was prevented by browser due to missing focus, event on focus does unlock player
 * @private
 *
 * @param      {Object|undefined}  event   Unlocking event
 */
function play_once_unlock(event, audiotag) {
	trigger._last_play_error = false;
	if (document.CPU.autoplay) {
		trigger.play(event, audiotag);
	}
}


export const trigger = {

	// @private
	_timecode_start : 0,
	// @private
	_timecode_end : false,

	// @private
	_last_play_error : false,

	/**
	 * @summary    Interprets the hash part of the URL, when loaded or changed
	 *
	 * @package
	 *
	 * @param      {string|Object}  hashcode     Called hashcode
	 * @param      {Function}       callback_fx  When done, call a function to end the tests (optional).
	 */
	hash_order : async function(hashcode, callback_fx=undefined) {
		let at_start = true;
		if (typeof hashcode !== 'string') {
			at_start = 'at_start' in hashcode;
			hashcode = location.hash.substr(1);
		}
		let hash = '';
		let timecode = '';
		let segments = hashcode.split('&');
		let autoplay = false;

		for (let parameter of segments) {
			if ((parameter.indexOf('=') === -1) && (hash === '')) {
				// should reference to the ID of the element
				hash = parameter;
			} else {
				// should be a key=value parameter
				let atoms = parameter.split('=');
				let p_key = atoms[0];
				let p_value = atoms[1];
				switch (p_key) {
					case 't':
						// is a time index
						p_value = (p_value !== '') ? p_value : '0';
						timecode = p_value;
						// we make autoplay at requested timecode, simplier of the user
						autoplay = true;
						break;
					case 'autoplay':
						// is a card from a social network, run now
						autoplay =  p_value === '1';
						break;
					case 'auto_play':
						// is a card from a social network, run now
						autoplay = p_value === 'true';
						break;
				}
			}
		}

		if ((timecode === '') || ((at_start) && (!autoplay))) {
			// this is a normal anchor call. Go back to normal behaviour
			on_debug(callback_fx);
			return /* false */;
		}

		// we may have a begin,end notation
		let times = timecode.split(',');
		let timecode_start = times[0];
		trigger._timecode_start = convert.TimeInSeconds(timecode_start);
		trigger._timecode_end = times.length > 1 ? convert.TimeInSeconds(times[1]) : false;
		if (trigger._timecode_end !== false) {
			trigger._timecode_end = (trigger._timecode_end > trigger._timecode_start) ?
				trigger._timecode_end :
				false;
		}

		await document.CPU.jumpIdAt(hash, timecode_start, callback_fx);

		if (document.CPU.global_controller) {
			document.CPU.global_controller.build_playlist();
		}
		// scroll to the audio element. Should be reworked, or parametrable , see issue #60
		// window.location.hash = `#${hash}`;
	},

	/**
	 * @summary Update throbber position when hovering the timeline interface
	 *
	 * @param      {Object}  event   The event
	 */
	hover : function(event) {
		let target = event.target;
		let container = document.CPU.find_container(target);
		let ratio = event.offsetX / target.clientWidth;
		let seeked_time = ratio * container.audiotag.duration;
		container.show_throbber_at(seeked_time);
	},

	/**
	 * @summary Hide the throbber when leaving the timeline interface
	 *
	 * @param      {Object}  event   The event
	 */
	out : function(event) {
		let container = document.CPU.find_container(event.target);
		container.hide_throbber();
	},

	/**
	 * @summary    Highlight the playable positions when hovering a marked link
	 *
	 * @param      {Object}  event   The event
	 */
	preview_container_hover : function(event) {
		let target = event.target;
		if (!target.id) {
			target = target.closest('[id]');
		}
		if (target === null) {
			return;
		}

		let container = document.CPU.find_container(target);
		let names = container.get_point_names_from_id(target.id);
		container.highlight_point(names[0], names[1]);
	},


	/**
	 * @summary Change play position of a audio tag
	 *
	 * @param      {Object}  event   The event, may be mocked
	 */
	throbble : function(event) {
		let at = 0;
		let target = event.target;
		let container = document.CPU.find_container(target);
		let audiotag = container.audiotag;

		if (audiotag.duration === Infinity) {
			// CAVEAT : we may have improper duration due to a streamed media
			trigger.play(event);
			return ;
		}

		if ((document.CPU.current_audiotag_playing) && (!document.CPU.is_audiotag_playing(audiotag))) {
			// Chrome needs to STOP any other playing tag before seeking
			//  Very slow seeking on Chrome #89 
			trigger.pause(undefined, document.CPU.current_audiotag_playing);
		}

		if ((isNaN(audiotag.duration)) && (!is_audiotag_streamed(audiotag))) {
			// Correct play from position on the timeline when metadata not preloaded #88

			// indicate we are loading something
			let controller = audiotag.CPU_controller();
			if ((controller !== null) && (controller.update_loading)) {
				controller.update_loading(undefined, 100 * event.offsetX  / target.clientWidth);
			}

			let expected_event = 'loadedmetadata';
			let recreated_event = {
				// we are losing offsetX information
				'offsetX' : event.offsetX,
				'target'  : event.target
			};
			let recall_me = function() { 
				trigger.throbble(recreated_event);
			};
			audiotag.addEventListener(expected_event, recall_me, once_passive_ev);
			// loading metadata. May not work on Apples
			audiotag.setAttribute('preload', 'metadata'); 
			return ;
		}

		// We know the media length, normal execution
		if (event.at !== undefined) {
			at = event.at;
		} else {
			// normal usage, via an event
			let ratio = event.offsetX / target.clientWidth;
			at = ratio * audiotag.duration;
		}
		document.CPU.seekElementAt(audiotag, at);
		trigger.play(event);
	},

	/**
	 * @summary    Do pause
	 *
	 * @param      {Object|undefined}   event     The event, may be omitted
	 * @param      {Element|undefined}  audiotag  The audiotag, may be omitted
	 */
	pause : function(event=undefined, audiotag=undefined) {
		if (audiotag === undefined) {
			let target = event.target;
			audiotag = (target.tagName === 'AUDIO') ? target : document.CPU.find_container(target).audiotag;
		}
		audiotag.pause();
		document.CPU.current_audiotag_playing = null;
		window.localStorage.removeItem(audiotag.currentSrc);
	},

	/**
	 * @summary    Change referenced playing audio, pause the previous one
	 *
	 * @param      {Object}  event   The event
	 */
	play_once : function(event) {
		let audiotag = event.target;

		document.CPU.last_used = audiotag;

		if ( (document.CPU.only_play_one_audiotag) && (document.CPU.current_audiotag_playing) && (!document.CPU.is_audiotag_playing(audiotag)) ) {
			trigger.pause(undefined, document.CPU.current_audiotag_playing);

		}
		document.CPU.current_audiotag_playing = audiotag;
	},

	/**
	 * @summary    Do play an audio tag
	 *
	 * @param      {Object|undefined}   event     The event, may be mocked or ommitted
	 * @param      {Element|undefined}  audiotag  The audiotag
	 */
	play : function(event=undefined, audiotag=undefined) {

		if (audiotag === undefined) {
			audiotag = document.CPU.find_container(event.target).audiotag;
		}

		if ( (event === undefined) && (trigger._last_play_error)) {
			warn(`play() prevented because already waiting for focus`);
			return;
		}

		trigger._last_play_error = false;
		remove_timecode_outofborders(audiotag.currentTime);

		let promised = audiotag.play();


		if (promised !== undefined) {
			promised.then(
				() => {
					// we have a successful play occured, we can display wait event later
					document.CPU.had_played = true;
				} 
			).catch(
				error => {
					trigger._last_play_error = true;
					let unlock = play_once_unlock.bind(this, audiotag);
					switch (error.name) {
						case 'NotAllowedError':
							warn(NotAllowedError);
							document.addEventListener('focus', unlock, once_passive_ev);
							document.addEventListener('click', unlock, once_passive_ev);

							if (audiotag.CPU_connected) {
								let CPU_api = audiotag.CPU_controller().CPU;
								CPU_api.glow_before_play = true;
								CPU_api.set_act_container('glow');
							}
							break;
						case 'NotSupportedError':
							error(NotSupportedError);
							break;
					}
				}
			);
		}
		if (document.CPU.global_controller) {
			let global_controller = document.CPU.global_controller;
			if  (!audiotag.isEqualNode(global_controller.audiotag)) {
				global_controller.attach_audiotag_to_controller(audiotag);
				global_controller.audiotag = audiotag;
				global_controller.show_main();
				global_controller.redraw_all_planes();
				global_controller.set_mode_container(); 	// to switch back the display between streamed/not-str medias
			}
			global_controller.build_playlist();
		}
	},

	/**
	 * @summary Interprets pressed key
	 *
	 * @param      {Object}  event   The event
	 * @param      {number}  mult    Multiply the keypressed act, 1 by default
	 */
	key : function(event, mult=undefined) {

		// do not interpret key when there is a modifier, for not preventing browsers shortcurs
		if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
			return;
		}

		mult = mult === undefined ? 1 : mult;
		let container = document.CPU.find_container(event.target);
		let audiotag = container.audiotag;

		/** @param      {number}  seconds    Relative position fowards */
		function seek_relative(seconds) {
			event.at = container.audiotag.currentTime + seconds;
			container.show_throbber_at(event.at);
			trigger.throbble(event);
			container.hide_throbber_later();
		}

		switch (event.keyCode) {
			// can't use enter : standard usage
			case 27 : // esc
				trigger.restart(event);
				trigger.pause(undefined, audiotag);
				break;
			case 32 : // space
				audiotag.paused ?
					trigger.play(event, audiotag) :
					trigger.pause(undefined, audiotag);
				break;
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
			default:
				return ;
		}
		event.preventDefault();
	},

	/**
	 * @summary Interprets keypress on the play/pause button
	 *
	 * @param      {Object}  event   The event
	 */
	keydownplay : function(event) {
		if (event.keyCode !== 13 ) {
			return;
		} 
		let container = document.CPU.find_container(event.target);
		let audiotag = container.audiotag;

		audiotag.paused ?
			trigger.play(undefined, audiotag) :
			trigger.pause(undefined, audiotag);
		
		event.preventDefault();
	},

	/**
	 * @summary Pressing restart button, Rewind at start the audio tag
	 *
	 * @param      {Object}  event   The event
	 */
	restart : function(event) {
		let container = document.CPU.find_container(event.target);
		document.CPU.seekElementAt(container.audiotag, 0);
	},
	/**
	 * @summary Pressing reward button
	 *
	 * @param      {Object}  event   The event
	 */
	reward : function(event) {
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
		trigger.key(event, document.CPU.fast_factor);
	},
	/**
	 * @summary Pressing fastfoward button
	 * Function associated, see below, DO NOT RENAME
	 *
	 * @param      {Object}  event   The event
	 */
	fastfoward : function(event) {
		event.keyCode = KEY_RIGHT_ARROW;
		trigger.key(event, document.CPU.fast_factor);
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
		document.body.classList.remove(document.CPU.body_className_playing_cue);
		// giving a class to document.body, with a syntax according to https://www.w3.org/TR/CSS21/syndata.html#characters
		document.CPU.body_className_playing_cue = `cpu_playing_tag_«${audiotag.id}»_cue_«${active_cue.id}»`;
		document.body.classList.add(document.CPU.body_className_playing_cue);
	},


	/**
	 * @summary Updatting time position. Pause if a end position is defined
	 *
	 * @param      {Object}  event   The event
	 */
	update : function(event) {
		let audiotag = event.target;

		if ((trigger._timecode_end !== false) && (audiotag.currentTime > trigger._timecode_end)) {
			trigger.pause(undefined, audiotag);
		}

		audiotag.CPU_update();
		if ((!audiotag.paused) && (!is_audiotag_streamed(audiotag))) {
			window.localStorage.setItem(audiotag.currentSrc, String(audiotag.currentTime));
		}
	},

	/**
	 * @summary When an audiotag is ended, advance in playlist
	 *
	 * @param      {Object}  			event     The event
	 * @param      {HTMLAudioElement}  	audiotag  The audiotag
	 */
	ended : function(event, audiotag=undefined) {
		// the media element reached its end 
		if (audiotag === undefined) {
			audiotag = event.target;
		}
		if (!('playlist' in audiotag.dataset)) {
			return;
		}
		// and is in a declarated playlist
		let playlist_name = audiotag.dataset.playlist;
		let playlist = document.CPU.playlists[playlist_name];
		if (playlist === undefined) {
			warn(`Named playlist ${playlist_name} not created. WTF ?`);
			return;
		}
		let playlist_index = playlist.indexOf(audiotag.id);
		if (playlist_index === -1) {
			warn(`Audiotag ${audiotag.id} not in playlist ${playlist_name}. WTF ?`);
			return;
		}
		if ((playlist_index +1) === playlist.length) {
			// end of playlist
			return;
		}
		let next_id = playlist[playlist_index+1];

		let next_audiotag = /** @type {HTMLAudioElement} */ (document.getElementById(next_id));
		if (next_audiotag === null) {
			warn(`Audiotag #${next_id} doesn't exists. WTF ?`);
			return;
		}
		// Play the next media in playlist, starting at zero
		document.CPU.seekElementAt(next_audiotag, 0);
		trigger.play({}, next_audiotag);
	},

	/**
	 * @summary Interprets `navigator.share` native API
	 *
	 * @param      {Object}  event   The event
	 */
	native_share : function(event) {
		let dataset = document.CPU.find_container(event.target).fetch_audiotag_dataset();
		navigator.share({
			'title': dataset.title,
			'text': dataset.title,
			'url': dataset.canonical
		});
		event.preventDefault();
	},

};
