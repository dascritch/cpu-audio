import {acceptable_selector, info} from './utils.js';
import {CpuControllerElement} from './cpu_controller.class.js';
import {connect_audiotag} from './media_element_extension.js';
import {TimeInSeconds} from './convert.js';
import {build_chapters} from './build_chapters.js';

/**
 * @summary Interprets if <cpu-audio> element is modified
 *
 * @param      {Object}  mutationsList  The mutations list
 */
function observer_cpuaudio([{target}]) {
	const container = document.CPU.find_container(target);
	let media_tagname = 'audio';
	let audio_element = container.element.querySelector(media_tagname);
	if (!audio_element) {
		info(`<${media_tagname}> element was removed.`);
		container.element.remove();
		return;
	}
	container.element.copy_attributes_to_media_dataset();
}

/**
 * @summary Interprets if <audio> element is modified or removed
 * TODO : act when a child change as <source> or <track>
 *
 * @param      {Object}  mutationsList  The mutations list
 */
function observer_audio([{target}]) {
	const container = document.CPU.find_container(target);

	// in case <track> changed/removed
	build_chapters(container);

	// in case attributes changed
	container.complete_template();

	const global_controller = document.CPU.global_controller;
	if (container.audiotag.isEqualNode(global_controller?.audiotag)) {
		build_chapters(global_controller);
		global_controller.complete_template();
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

	copy_attributes_to_media_dataset() {
		// copying personalized data to audio tag
		/**
		not working because of null returned values, and because dataset in a setter
			let def = document.CPU.default_dataset;
			this._audiotag.dataset = {...def, duration : TimeInSeconds(def.duration || 0)};
		**/

		for (let key in document.CPU.default_dataset) {
			let value = this.getAttribute(key);
			if (value !== null) {
				this._audiotag.dataset[key] = (key !== 'duration') ? value : TimeInSeconds(value);
			}
		}
	}

	connectedCallback() {
		this._audiotag = this.querySelector(acceptable_selector);
		if (!this._audiotag) {
			return;
		}

		this.copy_attributes_to_media_dataset();

		super.connectedCallback();

		connect_audiotag(this.CPU.audiotag);

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
