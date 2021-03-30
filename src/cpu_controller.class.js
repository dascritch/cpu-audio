import {CpuAudioTagName, CpuControllerTagName, selectorAcceptable, selectorInterface, notScreenContext, findContainer, info, warn, } from './utils.js';
import {CPU_element_api} from './element_cpu.js';


/**
 * @summary Interprets if <cpu-audio>/<cpu-controller> element is modified
 *
 * @param      {Object}  mutationsList  The mutations list
 */
function observer_component([{target}]) {
	const container = findContainer(target);
	let component = container.element;
	let media_tagname = 'audio';
	let audio_element = component.querySelector(media_tagname);
	if ((!audio_element) && (component.tagName !== CpuControllerTagName)) {
		info(`<${media_tagname}> element was removed.`);
		component.remove();
		return;
	}

	component.copyAttributesToMediaDataset?.();
	container.attributesChanges();
}

/**
 * Controller without assigned audio element, i.e. global page controller
 *
 * @class      CpuControllerElement (name)
 */
export class CpuControllerElement extends HTMLElement {

	constructor() {
		super();
		this.CPU = null;
		this.observer_component = null;

		if (notScreenContext()) {
			// I'm not in a screen context, as a braille surface
			// Sorry, but your browser's native controls are surely more accessible
			this.remove();
			return ;
		}

		/// TODO if a CPU-Controller is still there, do not create

		if (this.tagName === CpuAudioTagName) {
			if (!this.querySelector(selectorAcceptable)) {
				// Graceful degradation : do not start if no media element OR no native controls
				warn(`Tag <${CpuAudioTagName}> without <audio controls>.\nSee https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md for a correct installation.`);
				this.remove();
				return;
			}
		}

		if ((this.tagName === CpuControllerTagName) && (document.CPU.globalController)) {
			// called twice ????
			warn(`<${CpuControllerTagName}> tag instancied twice.`);
			this.remove();
			return ;
		}

		let template =  document.querySelector('template#CPU__template');
		let shadow_element = this.attachShadow({mode: 'open'});
		shadow_element.innerHTML = template.innerHTML;
	}

	connectedCallback() {
		if (notScreenContext()) {
			return ;
		}

		if (!this.shadowRoot) {
			return;
		}

		new CPU_element_api(this, this.shadowRoot.querySelector(selectorInterface));

		this.observer_component = new MutationObserver(observer_component);
		this.observer_component.observe(this, {
			childList 	: true,
			attributes	: true
		});
	}

	disconnectedCallback() {
		if ((this.tagName === CpuControllerTagName) && (document.CPU.globalController)) {
			document.CPU.globalController = null;
		}
	}

}
