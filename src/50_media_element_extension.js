// Extension on media element

HTMLAudioElement.prototype.CPU_connected = false;

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
	if (document.CPU.global_controller !== null) {
		document.CPU.global_controller.update();
	}
}