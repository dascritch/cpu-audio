
function launch() {

    if (!is_decent_browser_for_webcomponents()) {
        console.error(`<${CpuAudioTagName}> WebComponent may NOT behave correctly. Only timecode hash links are activated.\nSee https://github.com/dascritch/cpu-audio/blob/master/index.html for details`);
        querySelector_apply(acceptable_selector, document.CPU.recall_audiotag);
        document.body.classList.add('cpu-audio-without-webcomponents');
    } else {
        window.customElements.define(CpuAudioTagName.toLowerCase(), CpuAudioElement);
        window.customElements.define(CpuControllerTagName.toLowerCase(), CpuControllerElement); 
        document.body.classList.add('cpu-audio-with-webcomponents');
    }

    window.addEventListener('hashchange', trigger.hashOrder, false);
    trigger.hashOrder({ at_start : true });
}

if (document.body !== null) {
    launch();
} else {
    // needed in cpu-audio.js context
    document.addEventListener('DOMContentLoaded', launch, false);
}

