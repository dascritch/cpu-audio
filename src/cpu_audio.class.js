
// Controller with assigned audio element
class CpuAudioElement extends CpuControllerElement {

    connectedCallback() {

        this._audiotag = this.querySelector(acceptable_selector);
        if (this._audiotag === null) {
            return;
        }

        // copying personalized data to audio tag
        for (let key in CPU_Audio.default_dataset) {
            let value = this.getAttribute(key);
            if (value !== null) {
                this._audiotag.dataset[key] = value;
            }
        }
        super.connectedCallback();

        CPU_Audio.connect_audiotag(this.CPU.audiotag);

        // If we didn't have a timecode hash at loading document, try to recall previous interrupted player
        //CPU_Audio.recall_stored_play({target : this.CPU.audiotag});

    }

}