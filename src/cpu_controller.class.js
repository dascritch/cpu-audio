import {CpuAudioTagName, acceptable_selector, selector_interface, not_screen_context, warn, querySelector_apply, element_prevent_link_on_same_page} from './utils.js';
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
			{ glow : this.hasAttribute('glow') }
		);

		querySelector_apply('#canonical', element_prevent_link_on_same_page, this.shadowRoot);

		this.CPU.attach_audiotag_to_controller(this.CPU.audiotag);

		// mode="" attribute, on general aspect
		let mode = null;
		if (this.hasAttribute('mode')) {
			mode = this.getAttribute('mode');
			// in case of a mode="still,play" declaration
			let [mode_still, mode_play] = mode.split(',');
			if (mode_play) {
				mode = this.CPU.audiotag.paused ? mode_still : mode_play;
				this.CPU.mode_when_play = mode_play;
			}
		}
		this.CPU.set_mode_container(mode);

		// hide="" attribute, space separated elements to hide
		if (this.hasAttribute('hide')) {
			this.CPU.set_hide_container(this.getAttribute('hide').split(' '));
		}

	}

	disconnectedCallback() {
	}

}
