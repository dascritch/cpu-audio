import {__} from './i18n.js';
import {activecueClassname} from './element_cpu.js';

// plane for _playlist. Only used in <CPU-Controller>
const plane_playlist = '_playlist';

/**
 * @summary Builds or refresh the playlist panel.
 Should be called only for <cpu-controller>
 * @private was public
 *
 * @param      {Object}  			container  <cpu-controller>.CPU
 *
 */
export function build_playlist(container) {
	if (!container.is_controller) {
		// Note that ONLY the global controller will display the playlist. For now.
		return;
	}

	let previous_playlist = container.current_playlist;
	container.current_playlist = document.CPU.findCurrentPlaylist();

	if (! container.plane(plane_playlist)) {
		container.addPlane(plane_playlist, __['playlist'], {
			track 		: false,
			panel 		: 'nocuetime',
			highlight 	: true,
			_comp 		: true 				// data stored on CPU-Controller ONLY
		});
	}

	if (previous_playlist !== container.current_playlist) {
		container.clearPlane(plane_playlist);

		if (container.current_playlist.length === 0) {
			// remove plane to hide panel. Yes, overkill
			container.removePlane(plane_playlist);
			return;
		}

		for (let audiotag_id of container.current_playlist) {
			// TODO : when audiotag not here, do not add point
			container.addPoint(plane_playlist, 0, audiotag_id, {
				text : document.getElementById(audiotag_id)?.dataset.title, 
				link : `#${audiotag_id}&t=0`
			});
		}
	}

	container.highlightPoint(plane_playlist, container.audiotag.id, activecueClassname);

	// move _playlist on top. Hoping it will insert it RIGHT AFTER the main element.
	container.element.shadowRoot.querySelector('main').insertAdjacentElement(
		'afterend', container.planePanel(plane_playlist) );
}