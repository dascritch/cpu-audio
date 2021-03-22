import {__} from './i18n.js';
import {activecue_classname} from './element_cpu.js';

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

	if (! container.get_plane(plane_playlist)) {
		container.add_plane(plane_playlist, __['playlist'], {
			track 		: false,
			panel 		: 'nocuetime',
			highlight 	: true,
			_comp 		: true 				// data stored on CPU-Controller ONLY
		});
	}

	if (previous_playlist !== container.current_playlist) {
		container.clear_plane(plane_playlist);

		if (container.current_playlist.length === 0) {
			// remove plane to hide panel. Yes, overkill
			container.remove_plane(plane_playlist);
			return;
		}

		for (let audiotag_id of container.current_playlist) {
			// TODO : when audiotag not here, do not add point
			container.add_point(plane_playlist, 0, audiotag_id, {
				text : document.getElementById(audiotag_id)?.dataset.title, 
				link : `#${audiotag_id}&t=0`
			});
		}
	}

	container.highlight_point(plane_playlist, container.audiotag.id, activecue_classname);

	// move _playlist on top. Hoping it will insert it RIGHT AFTER the main element.
	container.element.shadowRoot.querySelector('main').insertAdjacentElement(
		'afterend', container.get_plane_panel(plane_playlist) );
}