import { findCPU } from '../primitives/utils.js';
import { adjacentArrayValue } from '../primitives/operators.js';

import { planeAndPointNamesFromId } from '../component/planename.js';


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
 * @summary Refresh document body when changing chapter
 *
 * @param      {Object}   active_cue         		The TextTrack actived
 * @param      {HTMLAudioElement}   audiotag        Audiotag relative to TextTrack
 *
 * To not warns on classList.remove()
 * @suppress {checkTypes}
 */
export function cuechange(active_cue, audiotag) {
	const { classList } = document.body;
	classList.remove(body_className_playing_cue);
	// giving a class to document.body, with a syntax according to https://www.w3.org/TR/CSS21/syndata.html#characters
	body_className_playing_cue = `cpu_playing_tag_«${audiotag.id}»_cue_«${active_cue.id}»`;
	classList.add(body_className_playing_cue);
}

export const cue = {

	cuechange,

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


};

export default cue;