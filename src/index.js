import {CpuAudioTagName, CpuControllerTagName, passive_ev, acceptable_selector, is_decent_browser_for_webcomponents, warn, querySelector_apply} from './utils.js'
import {trigger} from './trigger.js'
import {document_CPU} from './document_cpu.js'
import {attach_events_audiotag} from './media_element_extension.js'
import {CpuControllerElement} from './cpu_controller.class.js'
import {CpuAudioElement} from './cpu_audio.class.js'
import {insert_template} from '../tmp/insert_template.js'

async function main() {
	insert_template();

	if (!is_decent_browser_for_webcomponents()) {
		warn(`WebComponent may NOT behave correctly on this browser. Only timecode hash links are activated.\nSee https://github.com/dascritch/cpu-audio/ for details`);
		querySelector_apply(acceptable_selector, attach_events_audiotag);
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
	// TODO install document.CPU here
	HTMLDocument.prototype.CPU = document_CPU;

	if (document.body !== null) {
		main();
	} else {
		// needed in cpu-audio.js context
		document.addEventListener('DOMContentLoaded', main, passive_ev);
	}
}

