import { CpuAudioTagName, CpuControllerTagName, selectorAcceptable, querySelectorDo } from './primitives/utils.js';
import { passiveEvent } from './primitives/events.js';
import { browserIsDecent } from './primitives/checkers.js';
import { warn } from './primitives/console.js';

import {CpuAudioElement} from './cpu_audio.class.js';
import {CpuControllerElement} from './cpu_controller.class.js';
import {attach_events_audiotag} from './media_element_extension.js';
import {DocumentCPU} from './document_cpu.js';
import {insert_style} from '../tmp/insert_template.js';
import {trigger} from './trigger.js';

/**
 * Entry point
 *
 * @return     {Promise}  No returned value
 */
async function main() {
	// TO DO : Try to load here global parameters, cf #185

	let global_class_indicator;
	if (!browserIsDecent) {
		warn(`WebComponent may NOT behave correctly on this browser. Only timecode hash links are activated.\nSee https://github.com/dascritch/cpu-audio/ for details`);
		querySelectorDo(selectorAcceptable, attach_events_audiotag);
		global_class_indicator = 'without-webcomponents';
	} else {
		// TO DO : do not run it if not permited #181
		insert_style();
		global_class_indicator = 'with-webcomponents';
		window.customElements.define(CpuAudioTagName.toLowerCase(), CpuAudioElement);
		window.customElements.define(CpuControllerTagName.toLowerCase(), CpuControllerElement);
	}
	document.body.classList.add(`cpu-audio-${global_class_indicator}`);
	window.addEventListener('hashchange', trigger.hashOrder, passiveEvent);
	trigger.hashOrder({ at_start : true });
}

if ((document.CPU) || (window.customElements.get(CpuAudioTagName.toLowerCase()))) {
	warn('cpu-audio is called twice');
} else {
	// Here comes document.CPU
	HTMLDocument.prototype.CPU = DocumentCPU;

	document.addEventListener('DOMContentLoaded', main, passiveEvent);
//	if (document.body) {
	if ( document.readyState !== 'loading' ) {
		// document may already be loaded and DOMContentLoaded fired.
		main();
	}
}
