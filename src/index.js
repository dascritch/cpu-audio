/** @license
Cpu-Audio: an extension to the hash system to address timecode into audio/video elements.
Version 6.7pre
Copyright (C) 2014-2021 Xavier "dascritch" Mouton-Dubosc & contributors.
License GNU GPL 3

- project mini-site https://dascritch.github.io/cpu-audio/
- project repository : https://github.com/dascritch/cpu-audio
- use case : http://cpu.pm
- blog post : https://dascritch.net/post/2018/11/06/Reconstruire-son-lecteur-audio-pour-le-web
**/

import {CpuAudioTagName, CpuControllerTagName, passive_ev, acceptable_selector, is_decent_browser_for_webcomponents, warn, querySelector_apply} from './utils.js'
import {trigger} from './trigger.js'
import {document_CPU} from './document_cpu.js'
import './media_element_extension.js'
import {CpuControllerElement} from './cpu_controller.class.js'
import {CpuAudioElement} from './cpu_audio.class.js'
import {insert_template} from '../tmp/insert_template.js'

export async function main() {
	insert_template();


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

