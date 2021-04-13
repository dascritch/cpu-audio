import {__} from './i18n.js';
import {activecueClassname, planeAndPointNamesFromId} from './element_cpu.js';

// plane for _playlist. Only used in <CPU-Controller>
export const plane_playlist = '_playlist';

/**
 * @private
 */
export function rePointsPlaylist() {
// TODO check if focus in playlist pane
	const globalController = document.CPU.globalController;
	if (!globalController) {
		return;
	}
	const current_playlist = globalController.current_playlist;
	const pointDataGroup = {};
	globalController.clearPlane(plane_playlist);
	if (globalController.current_playlist.length === 0) {
		// remove plane to hide panel. Yes, overkill
		globalController.removePlane(plane_playlist);
		return;
	}

	for (let audiotag_id of current_playlist) {
		// TODO : when audiotag not here, do not add point
		/*container.addPoint(plane_playlist, audiotag_id, {
			text : document.getElementById(audiotag_id)?.dataset.title, 
			link : `#${audiotag_id}&t=0`
		});
		*/
		pointDataGroup[audiotag_id] = {
			text : document.getElementById(audiotag_id)?.dataset.title, // TODO "untitled"
			link : `#${audiotag_id}&t=0`
		};
	}
	globalController.bulkPoints(plane_playlist, pointDataGroup);
	// move _playlist on top. Hoping it will insert it RIGHT AFTER the main element.
	globalController.element.shadowRoot.querySelector('main').insertAdjacentElement(
		'afterend', globalController.planePanel(plane_playlist) );
// TODO restore focus if was in playlist pane
}

/**
 * @summary Builds or refresh the playlist panel.
 Should be called only for <cpu-controller>
 * @private was public
 *
 * @param       {Object}  	container  		<cpu-controller>.CPU
 */
export function buildPlaylist(wasFocusedId) {
	const globalController = document.CPU.globalController;
	if ((!globalController) || (!globalController.isController)) {
		// Note that ONLY the global controller will display the playlist. For now.
		return;
	}

	let previous_playlist = globalController.current_playlist;
	globalController.current_playlist = document.CPU.currentPlaylist();

	if (! globalController.plane(plane_playlist)) {
		globalController.addPlane(plane_playlist, {
			title 		: __['playlist'],
			track 		: false,
			panel 		: 'nocuetime',
			highlight 	: true,
			_comp 		: true 				// data stored on CPU-Controller ONLY
		});
	}

	if (previous_playlist !== globalController.current_playlist) {
		rePointsPlaylist();
	}

	globalController.highlightPoint(plane_playlist, globalController.audiotag.id, activecueClassname);

	if (wasFocusedId) {
		// we need to give back focus to the points, as they disapeared
		const [planeName, pointName] = planeAndPointNamesFromId(wasFocusedId);
		globalController.focusPoint(planeName, pointName);
	}
}