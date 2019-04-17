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
                warn(`Tag <${CpuAudioTagName}> without <audio controls>.\nSee https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md for a correct installation.`);
                this.remove();
                return;
            }
        }

        template =  thisDoc.querySelector('template#CPU__template');
        shadow_element = this.attachShadow({mode: 'open'});
        shadow_element.innerHTML = template.innerHTML;
    }

    connectedCallback() {
        if (not_screen_context()) {
            return ;
        }
        this.CPU = new CPU_element_api(
            this,
            this.shadowRoot.querySelector(selector_interface)
        );
        if (!this.CPU.audiotag) {
            document.CPU.global_controller = this.CPU;
            this.CPU.audiotag = document.querySelector('cpu-audio audio');
        }

        this.CPU.build_controller();
        querySelector_apply('#canonical', element_prevent_link_on_same_page, this.shadowRoot);

        this.CPU.attach_audiotag_to_controller(this.CPU.audiotag);

        // construct aspects
        let interface_classlist = this.CPU.elements['interface'].classList;

        let mode = this.getAttribute('mode');
        if (mode !== null) {
        // in case of a mode"still,play" declaration
            let modes = mode.split(',');
            if (modes.length > 1) {
                mode = this.CPU.audiotag.paused ? modes[0] : modes[1];
                this.CPU.mode_when_play = modes[1];
            }
        }
        this.CPU.set_mode_container(mode);

        let hide_those = this.getAttribute('hide');
        if (hide_those !== null) {
            this.CPU.set_hide_container(hide_those.split(','));
        }

        if (navigator.share) {
            interface_classlist.add('hasnativeshare');
            this.CPU.elements['nativeshare'].addEventListener('click', trigger.native_share);
        }
    }

    disconnectedCallback() {
    }
}