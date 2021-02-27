import {CpuAudioTagName, CpuControllerTagName} from './utils.js'

// Extension on media element
HTMLAudioElement.prototype.CPU_connected = false;

/**
 * @summary Return the parent <cpu-audio> DOM element
 *
 * @class      CPU_controller (name)
 * @return     {Element}  <cpu-audio> DOM element
 */
HTMLAudioElement.prototype.CPU_controller = function() {
	return this.closest(CpuAudioTagName);
}

/**
 * @summary Trigger display updates in the interface
 *
 * @class      CPU_update (name)
 */
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