import {CpuAudioTagName, CpuControllerTagName, passive_ev, acceptable_selector} from './src/00_prologue.js'
import {is_decent_browser_for_webcomponents, warn, querySelector_apply} from './src/11_utils.js'
import trigger from './src/30_trigger.js'
import document_CPU from './src/40_document_cpu.js'
import CpuControllerElement from './src/70_cpu_controller.class.js'
import CpuAudioElement from './src/71_cpu_audio.class.js'

export async function main() {
	document.CPU__template__installed = true;

	if (!is_decent_browser_for_webcomponents()) {
		warn(`WebComponent may NOT behave correctly on this browser. Only timecode hash links are activated.\nSee https://github.com/dascritch/cpu-audio/ for details`);
		querySelector_apply(acceptable_selector, document.CPU.attach_events_audiotag);
		document.body.classList.add('cpu-audio-without-webcomponents');
	} else {
		window.customElements.define(CpuAudioTagName.toLowerCase(), CpuAudioElement);
		window.customElements.define(CpuControllerTagName.toLowerCase(), CpuControllerElement); 
		document.body.classList.add('cpu-audio-with-webcomponents');
	}

	window.addEventListener('hashchange', trigger.hashOrder, passive_ev);
	trigger.hashOrder({ at_start : true });
}


if ((document.CPU) || (document.CPU__template__installed) || (window.customElements.get(CpuAudioTagName.toLowerCase()))) {
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

