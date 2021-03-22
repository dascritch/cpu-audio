import {error, oncePassiveEvent, passiveEvent} from './utils.js';
import {__, prefered_language} from './i18n.js';
import {trigger} from './trigger.js';
import {translateVTT} from './translate_vtt.js';
import {activecueClassname} from './element_cpu.js';

const plane_chapters = '_chapters';

/**
 * @summary Add listeners on tracks to build chapters when loaded
 * @private
 * 
 * @param      {Object}  container  <cpu-audio>.CPU
 */
export function build_chapters_loader(container) {
	build_chapters(container);
	let audiotag = container.audiotag;
	let this_build_chapters = build_chapters.bind(undefined, container);

	// sometimes, we MAY have loose loading
	audiotag.addEventListener('loadedmetadata', this_build_chapters, oncePassiveEvent);

	let track_element = audiotag.querySelector('track[kind="chapters"]');
	if ((track_element) && (!track_element._CPU_load_ev)) {
		track_element._CPU_load_ev = track_element.addEventListener('load', this_build_chapters, passiveEvent);
	}
}

/**
 * @summary Builds or refresh chapters interface.
 * @private was public
 *
 * @param      {Object}  			container  <cpu-audio>.CPU
 * @param      {Object|undefined}  	event          The event
 */
export async function build_chapters(container) {
	// this functions is called THREE times at load : at build, at loadedmetada event and at load event
	// and afterwards, we have to reposition track points on duractionchange

	if (container.is_controller) {
		// not your job, CPUController
		return;
	}

	let audiotag = container.audiotag;
	let has = false;

	if (audiotag) {
		if (audiotag.textTracks?.length > 0) {
			let chapter_track = null;

			for (let tracks of audiotag.textTracks) {
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

			if (chapter_track?.cues.length > 0) {
				container.addPlane(plane_chapters, __['chapters'], {track : 'chapters'});

				let cuechange_event_this = cuechange_event.bind(undefined, container);
				// ugly, but best way to catch the DOM element, as the `cuechange` event won't give it to you via `this` or `event`
				// adding/reinstall chapter changing event
				chapter_track.removeEventListener('cuechange', cuechange_event_this);
				chapter_track.addEventListener('cuechange', cuechange_event_this, passiveEvent);

				for (let cue of chapter_track.cues) {
					if (!container.point(plane_chapters, cue.id)) {
						// avoid unuseful redraw, again
						let cuepoint = Math.floor(cue.startTime);
						container.addPoint(plane_chapters, cue.id,  {
							start : cuepoint,
							text  : translateVTT(cue.text),
							link  : true,          // point the link to start time position
							end   : cue.endTime    // end timecode of the cue
						});
					}
				}
				if (chapter_track.cues.length > 0) {
					has = true;
				}
				cuechange_event(container, {
					target : {
						activeCues : chapter_track.cues
					}
				});
			}
		}
	}

	let body_class = `cpu_tag_«${audiotag.id}»_chaptered`;
	let body_classlist = document.body.classList;
	if (has) {
		// indicate in host page that audio tag chapters are listed
		// see https://github.com/dascritch/cpu-audio/issues/36
		body_classlist.add(body_class);
	} else {
		container.removePlane(plane_chapters);
		body_classlist.remove(body_class);
	}

	/*
	if ((active_cue) && (id_in_hash(this.audiotag.id)) ) {
		// shoud be set ONLY if audiotag is alone in page or if audiotag.id named in hash
		trigger.cuechange(active_cue, this.audiotag);
		this.emitEvent('chapterChanged', {
			cue : active_cue
		});
	}
	*/

}

/**
 * @summary Call when a chapter is changed, to trigger the changes
 * @private
 *
 * @param      {Object}  container  Element.CPU
 * @param      {Object}  event   	The event
 */
function cuechange_event(container, event) {
	let active_cue;
	try {
		// Chrome may put more than one activeCue. That's a stupid regression from them, but alas... I have to do with
		let _time = container.audiotag.currentTime;
		for (let cue of event.target.activeCues) {
			if ((cue.startTime <= _time) && (_time < cue.endTime)) {
				active_cue = cue;
			}
		}
		if (Object.is(active_cue, container._activecue)) {
			return ;
		}

		container._activecue = active_cue;
		// do NOT tell me this is ugly, i know this is ugly. I missed something. Teach me how to do it better
	} catch (oops) {
		error(oops);
	}

	container.removeHighlightsPoints(plane_chapters, activecueClassname);
	if (active_cue) {
		trigger.cuechange(active_cue, container.audiotag);
		container.emitEvent('chapterChanged', {
			cue : active_cue
		});
		container.highlightPoint(plane_chapters, active_cue.id, activecueClassname);
	}
}