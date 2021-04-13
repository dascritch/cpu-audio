import {selectorAcceptable, findCPU} from './utils.js';
import {CpuControllerElement} from './cpu_controller.class.js';
import {connectAudiotag} from './media_element_extension.js';
import {timeInSeconds} from './convert.js';
import {build_chapters} from './build_chapters.js';
import {rePointsPlaylist} from './build_playlist.js';


/**
 * @summary Interprets if <audio> element is modified or removed
 * TODO : act when a child change as <source> or <track>
 *
 * @param      {Object}  mutationsList  The mutations list
 */
function modifiedAudio([{target}]) {
	const elCPU = findCPU(target);

	// in case <track> changed/removed
	build_chapters(elCPU);

	// in case attributes changed
	elCPU.completeTemplate();

	const globalController = document.CPU.globalController;
	if (elCPU.audiotag.isEqualNode(globalController?.audiotag)) {
		build_chapters(globalController);
		globalController.completeTemplate();
	}
}

/**
 * Controller with assigned audio element
 *
 * @class      CpuAudioElement (name)
 */
export class CpuAudioElement extends CpuControllerElement {

	constructor() {
		super();
		this.audiotag = this.querySelector(selectorAcceptable);
		if (!this.audiotag) {
			this.remove();
			return ;
		}
		this.observer = null;
	}

	copyAttributesToMediaDataset() {
		if (!this.audiotag) {
			this.remove();
			return ;
		}
		// copying personalized data to audio tag for persistence
		for (let key in document.CPU.defaultDataset) {
			if (this.hasAttribute(key)) {
				const value = this.getAttribute(key);
				this.audiotag.dataset[key] = (key !== 'duration') ? value : timeInSeconds(value);
			}
		}
	}

	connectedCallback() {
		if (!this.audiotag) {
			return;
		}
		
		this.copyAttributesToMediaDataset();

		super.connectedCallback();

		connectAudiotag(this.CPU.audiotag);

		this.observer = new MutationObserver(modifiedAudio);
		this.observer.observe(this, {
			childList	: true,
			attributes	: true,
			subtree		: true
		});

		if (document.CPU.currentPlaylistID() === this.audiotag.dataset.playlist) {
			rePointsPlaylist();
		}
	}

	disconnectedCallback() {
		const globalController = document.CPU.globalController;
		const playlist_id = this.audiotag.dataset.playlist;
		if ((this.audiotag) && (globalController) && (this.audiotag.isEqualNode(globalController.audiotag))) {
			// we mode the audiotag into the global controller to keep the continuity status.
			// This audiotag will be released at the next switchControllerTo() call
			globalController.element.appendChild(this.audiotag);
		} else {
			if (playlist_id) {
				// Is it the good place to remove the playlist reference ?
				const playlists = document.CPU.playlists;
				// remove reference in playlists
				for (let index in playlists) {
					const out = playlists[index].filter(entry_id => entry_id !== this.audiotag.id);
					document.CPU.playlists[index] = out;
					if (out.length === 0) {
						delete document.CPU.playlists[index];
					}
				}
			}
		}
		if (document.CPU.currentPlaylistID() === playlist_id) {
			rePointsPlaylist();
		}
		super.disconnectedCallback();
	}
}
