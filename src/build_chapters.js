import { oncePassiveEvent, passiveEvent } from './primitives/events.js';
import __ from './primitives/i18n.js';
import translateVTT from './primitives/translate_vtt.js';

import { normalizeSeekTime } from './mediatag/time.js';
import { get_chapter_tracks } from './mediatag/tracks.js';

import { cuechange } from './trigger/cue.js';
import { activecueClassname } from './component_cpu/planes_draw.js';

const plane_chapters = '_chapters';

/**
 * @summary Add listeners on tracks to build chapters when loaded
 * @private
 * 
 * @param      {Object}  elCPU  <cpu-audio>.CPU
 */
export function buildChaptersLoader(elCPU) {
	const this_build_chapters = () => { build_chapters(elCPU); };
	this_build_chapters();
	const { audiotag } = elCPU;

	// sometimes, we MAY have loose loading
	audiotag.addEventListener('loadedmetadata', this_build_chapters, oncePassiveEvent);

	const track_element = audiotag.querySelector('track[kind="chapters"]');
	if ((track_element) && (!track_element._CPU_load_ev)) {
		track_element._CPU_load_ev = track_element.addEventListener('load', this_build_chapters, passiveEvent);
	}
}

/**
 * @summary Builds or refresh chapters interface.
 * @private was public
 *
 * @param      {Object}  			elCPU  <cpu-audio>.CPU
 * @param      {Object|undefined}  	event          The event
 */
export async function build_chapters(elCPU) {
	// this functions is called THREE times at load : at build, at loadedmetada event and at load event
	// and afterwards, we have to reposition track points on duractionchange

	if (elCPU.isController) {
		// not your job, CPUController
		return;
	}

	const audiotag = elCPU.audiotag;
	let has = false;
	const pointDataGroup = {};

	if (audiotag) {
		const chapter_track = get_chapter_tracks(audiotag);

		if (chapter_track?.cues.length > 0) {
			elCPU.addPlane(plane_chapters, {
				title : __['chapters'],
				track : 'chapters'
			});

			const cuechange_event_this = () => {cuechange_event(elCPU);};
			// ugly, but best way to catch the DOM element, as the `cuechange` event won't give it to you via `this` or `event`
			// adding/reinstall chapter changing event
			chapter_track.removeEventListener('cuechange', cuechange_event_this);
			chapter_track.addEventListener('cuechange', cuechange_event_this, passiveEvent);

			for (const cue of chapter_track.cues) {
				if (!elCPU.point(plane_chapters, cue.id)) {
					pointDataGroup[cue.id] = {
						start : normalizeSeekTime(audiotag, Math.floor(cue.startTime)),
						text  : translateVTT(cue.text),
						link  : true,          								// point the link to start time position
						end   : normalizeSeekTime(audiotag, Math.floor(cue.endTime))    // end timecode of the cue
					};
				}
			}
			if (chapter_track.cues.length > 0) {
				has = true;
			}
			elCPU.bulkPoints(plane_chapters, pointDataGroup);
			cuechange_event(elCPU, {
				target : {
					activeCues : chapter_track.cues
				}
			});
		}
	}

	const body_class = `cpu_tag_«${audiotag.id}»_chaptered`;
	const body_classlist = document.body.classList;
	if (has) {
		// indicate in host page that audio tag chapters are listed
		// see https://github.com/dascritch/cpu-audio/issues/36
		body_classlist.add(body_class);
	} else {
		elCPU.removePlane(plane_chapters);
		body_classlist.remove(body_class);
	}

	/*
	if ((active_cue) && (id_in_hash(this.audiotag.id)) ) {
		// shoud be set ONLY if audiotag is alone in page or if audiotag.id named in hash
		cuechange(active_cue, this.audiotag);
		this.emitEvent('chapterChanged', {
			cue : active_cue
		});
		// and so, shall we scroll ?
	}
	*/

}

/**
 * @summary Call when a chapter is changed, to trigger the changes
 * @private
 *
 * @param      {Object}  elCPU  Element.CPU
 * @param      {Object}  event   	The event
 */
export function cuechange_event(elCPU, event = null) {
	// TODO : if not event, based on '_chapters' information from audio

	const activeCues = event ? event.target.activeCues : get_chapter_tracks(elCPU.audiotag)?.activeCues;
	
	let cue;
	// Chrome may put more than one activeCue. That's a stupid regression from them, but alas… I have to deal with it
	const currentTime = elCPU.audiotag.currentTime;
	
	if (activeCues?.length > 0) {
		for (const cue_line of activeCues) {
			if ((cue_line.startTime <= currentTime) && (currentTime < cue_line.endTime)) {
				cue = cue_line;
			}
		}
	}

	if (cue?.id === elCPU._activecue_id) {
		return ;
	}

	elCPU.removeHighlightsPoints(plane_chapters, activecueClassname);
	elCPU._activecue_id = cue?.id;

	if (cue) {
		cuechange(cue, elCPU.audiotag);
		elCPU.emitEvent('chapterChanged', { cue });
		elCPU.highlightPoint(plane_chapters, cue.id, activecueClassname);
	}
}