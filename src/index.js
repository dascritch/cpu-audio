import {CpuAudioTagName, CpuControllerTagName, selectorAcceptable, browserIsDecent, passiveEvent, querySelectorDo, warn} from './utils.js';

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

	if (!browserIsDecent()) {
		warn(`WebComponent may NOT behave correctly on this browser. Only timecode hash links are activated.\nSee https://github.com/dascritch/cpu-audio/ for details`);
		querySelectorDo(selectorAcceptable, attach_events_audiotag);
		document.body.classList.add('cpu-audio-without-webcomponents');
	} else {
		window.customElements.define(CpuAudioTagName.toLowerCase(), CpuAudioElement);
		window.customElements.define(CpuControllerTagName.toLowerCase(), CpuControllerElement);
		document.body.classList.add('cpu-audio-with-webcomponents');
	}
	window.addEventListener('hashchange', trigger.hashOrder, passiveEvent);
	trigger.hashOrder({ at_start : true });
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
		document.addEventListener('DOMContentLoaded', main, passiveEvent);
	}
}
