import {CpuAudioTagName, acceptable_selector, selector_interface, not_screen_context, warn, } from './utils.js';
import {CPU_element_api} from './element_cpu.js';

/**
 * Controller without assigned audio element, i.e. global page controller
 *
 * @class      CpuControllerElement (name)
 */
export class CpuControllerElement extends HTMLElement {

	constructor() {
		super();
		this.CPU = null;

		if (not_screen_context()) {
			// I'm not in a screen context, as a braille surface
			// Sorry, but your browser's native controls are surely more accessible
			this.remove();
			return ;
		}

		if (this.tagName === CpuAudioTagName) {
			if (!this.querySelector(acceptable_selector)) {
				// Graceful degradation : do not start if no media element OR no native controls
				warn(`Tag <${CpuAudioTagName}> without <audio controls>.\nSee https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md for a correct installation.`);
				this.remove();
				return;
			}
		}

		let template =  document.querySelector('template#CPU__template');
		let shadow_element = this.attachShadow({mode: 'open'});
		shadow_element.innerHTML = template.innerHTML;
	}

	connectedCallback() {
		if (not_screen_context()) {
			return ;
		}
		this.CPU = new CPU_element_api(
			this,
			this.shadowRoot.querySelector(selector_interface),
			{
				glow : this.hasAttribute('glow'),
				mode : this.hasAttribute('mode') ? this.getAttribute('mode') : null,
				hide : this.hasAttribute('hide') ? this.getAttribute('hide') : false,
			}
		);
	}

	disconnectedCallback() {
	}

}
