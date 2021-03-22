import {selectorAcceptable, findContainer, info} from './utils.js';
import {CpuControllerElement} from './cpu_controller.class.js';
import {connectAudiotag} from './media_element_extension.js';
import {timeInSeconds} from './convert.js';
import {build_chapters} from './build_chapters.js';

/**
 * @summary Interprets if <cpu-audio> element is modified
 *
 * @param      {Object}  mutationsList  The mutations list
 */
function observer_cpuaudio([{target}]) {
	const container = findContainer(target);
	let media_tagname = 'audio';
	let audio_element = container.element.querySelector(media_tagname);
	if (!audio_element) {
		info(`<${media_tagname}> element was removed.`);
		container.element.remove();
		return;
	}
	container.element.copyAttributesToMediaDataset();
}

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
		this._audiotag = null;
		this.audiotag = null;
		this.observer_cpuaudio = null;
		this.observer_audio = null;
	}

	copyAttributesToMediaDataset() {
		// copying personalized data to audio tag
		for (let key in document.CPU.defaultDataset) {
			if (this.hasAttribute(key)) {
				let value = this.getAttribute(key);
				this._audiotag.dataset[key] = (key !== 'duration') ? value : timeInSeconds(value);
			}
		}
	}

	connectedCallback() {
		this._audiotag = this.querySelector(selectorAcceptable);
		if (!this._audiotag) {
			return;
		}

		this.copyAttributesToMediaDataset();

		super.connectedCallback();

		connectAudiotag(this.CPU.audiotag);

		this.observer_cpuaudio = new MutationObserver(observer_cpuaudio);
		this.observer_cpuaudio.observe(this, {
			childList 	: true,
			attributes	: true
		});

		this.observer_audio = new MutationObserver(observer_audio);
		this.observer_audio.observe(this, {
			childList	: true,
			attributes	: true,
			subtree		: true
		});

		// this.observer.disconnect();
	}
}
