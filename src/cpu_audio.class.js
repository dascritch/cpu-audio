import {selectorAcceptable, findContainer} from './utils.js';
import {CpuControllerElement} from './cpu_controller.class.js';
import {connectAudiotag} from './media_element_extension.js';
import {timeInSeconds} from './convert.js';
import {build_chapters} from './build_chapters.js';


/**
 * @summary Interprets if <audio> element is modified or removed
 * TODO : act when a child change as <source> or <track>
 *
 * @param      {Object}  mutationsList  The mutations list
 */
function observer_audio([{target}]) {
	const container = findContainer(target);

	// in case <track> changed/removed
	build_chapters(container);

	// in case attributes changed
	container.completeTemplate();

	const globalController = document.CPU.globalController;
	if (container.audiotag.isEqualNode(globalController?.audiotag)) {
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
		this.observer_audio = null;
	}

	copyAttributesToMediaDataset() {
		if (!this.audiotag) {
			this.remove();
			return ;
		}
		// copying personalized data to audio tag
		for (let key in document.CPU.defaultDataset) {
			if (this.hasAttribute(key)) {
				let value = this.getAttribute(key);
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

		this.observer_audio = new MutationObserver(observer_audio);
		this.observer_audio.observe(this, {
			childList	: true,
			attributes	: true,
			subtree		: true
		});
	}

	disconnectedCallback() {
		if (this.audiotag?.id)  {
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
}
