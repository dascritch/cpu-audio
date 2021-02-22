
async function main() {

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

if (document.body !== null) {
	main();
} else {
	// needed in cpu-audio.js context
	document.addEventListener('DOMContentLoaded', main, passive_ev);
}

