import {CpuAudioTagName, CpuControllerTagName, acceptable_selector, is_decent_browser_for_webcomponents, passive_ev, querySelectorDo, warn} from './utils.js';

import {CpuAudioElement} from './cpu_audio.class.js';
import {CpuControllerElement} from './cpu_controller.class.js';
import {attach_events_audiotag} from './media_element_extension.js';
import {DocumentCPU} from './document_cpu.js';
import {insert_template} from '../tmp/insert_template.js';
import {trigger} from './trigger.js';

/**
 * Entry point
 *
 * @return     {Promise}  No returned value
 */
async function main() {
	insert_template();

	if (!is_decent_browser_for_webcomponents()) {
		warn(`WebComponent may NOT behave correctly on this browser. Only timecode hash links are activated.\nSee https://github.com/dascritch/cpu-audio/ for details`);
		querySelectorDo(acceptable_selector, attach_events_audiotag);
		document.body.classList.add('cpu-audio-without-webcomponents');
	} else {
		window.customElements.define(CpuAudioTagName.toLowerCase(), CpuAudioElement);
		window.customElements.define(CpuControllerTagName.toLowerCase(), CpuControllerElement);
		document.body.classList.add('cpu-audio-with-webcomponents');
	}
	window.addEventListener('hashchange', trigger.hash_order, passive_ev);
	trigger.hash_order({ at_start : true });
}

if ((document.CPU) || (window.customElements.get(CpuAudioTagName.toLowerCase()))) {
	warn('cpu-audio is called twice');
} else {
	// Here comes document.CPU
	HTMLDocument.prototype.CPU = DocumentCPU;

	if (document.body !== null) {
		main();
	} else {
		// needed in cpu-audio.js context
		document.addEventListener('DOMContentLoaded', main, passive_ev);
	}
}
