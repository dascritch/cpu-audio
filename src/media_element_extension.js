// Extension on media element

HTMLAudioElement.prototype.CPU_controller = function() {
    return this.closest(CpuAudioTagName);
}

HTMLAudioElement.prototype.CPU_update = function() {
    let controller = this.CPU_controller();
    if (controller) {
        let api = controller.CPU;
        if ((api) && (api.update)) {
            // i don't like try catch
            api.update();
        }
    }
    if (CPU_Audio.global_controller) {
        CPU_Audio.global_controller.update();
    }
}