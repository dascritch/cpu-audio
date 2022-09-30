import { isAudiotagStreamed } from '../mediatag/time.js';

import { showElement } from '../component/show.js';

export const show = {
	/**
	 * @summary Shows the interface
	 *
	 * @public
	 * @param      {string}  mode    The mode, can be 'main', 'share' or 'error'
	 */
	show : function(mode) {
		const { classList } = this.container;
		classList.remove(
			'show-main',
			'show-share',
			'show-error',
			'media-streamed'
		);
		if (isAudiotagStreamed(this.audiotag)) {
			classList.add('media-streamed');
		}
		classList.add(`show-${mode}`);
	},

	/**
	 * @summary Shows the sharing panel
	 * @private
	 */
	showActions: function(/* event */) {
		this.show('share');
		this.updateLinks();
	},

	/**
	 * @summary Shows the main interface
	 * @private
	 */
	showMain: function(/* event */) {
		showElement(this.container, true);
		this.show('main');
	},

	/**
     * @summary Shows the handheld fine navigation
     * @private
	 *
	 * @param      {Object|undefined}  event   Triggering event
	 */
	showHandheldNav: function(event) {
		if (isAudiotagStreamed(this.audiotag)) {
			return;
		}
		// For resolving #180 , <details>.open != <details>.open will do the trick
		this.container.classList.toggle('show-handheld-nav');
		event?.preventDefault();
	}
};

export default show;