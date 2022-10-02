import defaultDataset from '../bydefault/dataset.js';


export const utils = {

	attributesChanges : function() {
		// mode="" attribute, on general aspect. may be coma separated
		let mode = null;
		if (this.element.hasAttribute('mode')) {
			mode = this.element.getAttribute('mode');
			// in case of a mode="still,play" declaration
			const [mode_still, mode_play] = mode.split(',');
			if (mode_play) {
				mode = this.audiotag.paused ? mode_still : mode_play;
				this.mode_when_play = mode_play;
			}
		}
		this.setMode(mode);

		// hide="" attribute, space separated elements to hide
		if (this.element.hasAttribute('hide')) {
			this.setHide(this.element.getAttribute('hide').split(' '));
		}

		// TODO : waveform, poster, title, mirroring it to audiotag
	},

	/**
	 * @summary Will get presentation data from <audio> or from parent document
	 *
	 * @package
	 *
	 * @return     {Object}  dataset
	 */
	audiotagDataset : function () {
		return {...defaultDataset, ...this.audiotag.dataset};
	},

	/**
	 * @summary Check if the actual <cpu-audio> is mirrored in <cpu-controller>. False if no cpu-controller
	 * @private but next time public ?
	 *
	 * @return     boolean			False if no cpu-controller or not mirrored
     */
	mirroredInController: function() {
		const globalController = document.CPU.globalController;
		return (globalController) && (this.audiotag.isEqualNode(globalController.audiotag));
	},

	/**
	 * @summary    create and fire custom events for the global document.
	 * @private
	 *
	 * We async-ed it, to avoid ultra-probable performances issues
	 *
	 * @param      {string}            event_name  The event name, will be prefixed with CPU_
	 * @param      {Object|undefined}  detail      Specific public informations about the event
	 * @return     {Promise}           { description_of_the_return_value }
	 */
	emitEvent:async function(event_name, detail = undefined) {
		this.element.dispatchEvent(
			new CustomEvent(`CPU_${event_name}`, {
				target 		: this.element,
				bubbles 	: true,
				cancelable 	: false,
				composed 	: false,
				detail 		: detail
			})
		);
	},

	/**
	 * @summary    et an Element from the shadowDOM by its id
	 * @private
	 *
	 * @param      {string}            id 	identification name of the element
	 * @return     {HTMLElement}       { The expected element }
	 */
	shadowId: function(id) {
		return this.shadow.getElementById(id);
	},
	
};

export default utils;
