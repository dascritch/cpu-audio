// Controller without assigned audio element, i.e. global page controller

class CpuControllerElement extends HTMLElement {

    constructor() {
        // Always call super first in constructor
        super();

        if (not_screen_context()) {
            // I'm not in a screen context, as a braille surface
            // Sorry, but your browser's native controls are surely more accessible
            this.remove();
            return ;
        }

        if (this.tagName === CpuAudioTagName) {
            if (this.querySelector(acceptable_selector) === null) {
                // Graceful degradation : do not start if no media element OR no native controls
                console.warn(`Tag <${CpuAudioTagName}> without <audio controls>.\nSee https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md for a correct installation.`);
                this.remove();
                return;
            }
        }

        template =  thisDoc.querySelector('template');
        shadow_element = this.attachShadow({mode: 'open'});
        shadow_element.innerHTML = template.innerHTML;
    }

    connectedCallback() {
        if (not_screen_context()) {
            return ;
        }
        this.CPU = new CPU_element_api(
            this,
            this.shadowRoot.querySelector('.interface')
        );
        if (!this.CPU.audiotag) {
            CPU_Audio.global_controller = this.CPU;
            this.CPU.audiotag = window.document.querySelector('cpu-audio audio');
        }

        this.CPU.build_controller();
        querySelector_apply('.canonical', element_prevent_link_on_same_page);

        this.CPU.attach_audiotag_to_controller(this.CPU.audiotag);

        let mode = this.getAttribute('mode');
        mode = mode !== null ? mode : 'default'
        this.CPU.elements['interface'].classList.add(`mode-${mode}`)
    }

    disconnectedCallback() {
    }

}