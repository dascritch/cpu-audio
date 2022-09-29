import defaultDataset from '../bydefault/dataset.js';

import { error } from '../primitives/console.js';
import __ from '../primitives/i18n.js';

import { addIdToAudiotag, audiotagPreloadMetadata } from '../mediatag/extension.js';

import { validId, planeAndPointNamesFromId, getPointId } from '../component/planename.js';

import trigger from '../trigger.js';


// Acceptables attributes values for hide="" parameter on webcomponent
export const acceptableHideAtttributes = ['poster', 'actions', 'timeline', 'chapters', 'panels', 'panels-title', 'panels-except-play'];


export const status = {

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

	shadowId: function(id) {
		return this.shadow.getElementById(id)
	},

	/**
	 * @summary Used for `mode=""` attribute.
	 * @public
	 *
	 * @param      {string|null}  mode    Accepted are only in `/\w+/` format, 'default' by default
	 */
	setMode: function(mode = null)  {
		mode = mode ?? 'default';
		if (this.mode_was === mode) {
			return;
		}
		const { classList } = this.container;
		classList.remove(`mode-${this.mode_was}`);
		classList.add(`mode-${mode}`);
		this.mode_was = mode;
	},
	/**
	 * @summary Change the presentation style reflecting the media tag status
	 * @public
	 *
	 * @param      {string}  act     can be 'loading', 'pause', 'glow' or 'play'
	 */
	setAct : function(act) {
		if (this.act_was === act) {
			return;
		}
		if ( (! document.CPU.hadPlayed) && (act === 'loading') ){
			if (this.act_was !== null) {
				return;
			}
			// correction for iOS, stuck in "loading" state at the beginning, see #138
			act = 'glow';
		}
		const classes = this.container.classList;
		classes.remove(
			'act-loading',
			'act-buffer',
			'act-pause',
			'act-play',
			'act-glow'
			);
		classes.add(`act-${act}`);
		if ((this.act_was === 'play') && (act === 'loading')) {
			classes.add(`act-buffer`);
		}
		this.act_was = act;
	},
	/**
	 * @public
	 * @summary Hide some blocks in the interface
	 * used for `hide=""` attribute
	 *
	 * @param      {Array<string>}  hide_elements  Array of strings, may contains
	 *                                        'actions' or 'chapters'
	 */
	setHide : function(hide_elements) {
		const container_class = this.container.classList;

		for (let hide_this of acceptableHideAtttributes) {
			container_class.remove(`hide-${hide_this}`);
		}

		for (let hide_this of hide_elements) {
			hide_this = hide_this.toLowerCase();
			if (acceptableHideAtttributes.includes(hide_this)) {
				container_class.add(`hide-${hide_this}`);
			}
		}
	},

	/**
	 * @summary Complete the interface at build time
	 * @package
	 */
	completeTemplate: function() {
		const dataset = this.audiotagDataset();
		let { title, waveform } = dataset;
		const element_canonical = this.shadowId('canonical');
		if (element_canonical) {
			element_canonical.href = dataset.canonical;
			let classlist = element_canonical.classList;
			if (!title) {
				classlist.add('untitled');
				title = __.untitled;
			} else {
				classlist.remove('untitled');
			}
			element_canonical.innerText = title;
		}

		if (this.element.title !== title) {
			this.element.title = title; // WATCHOUT ! May goes recursive with observers on the wbecomponent
		}
		const poster = this.shadowId('poster');
		if (poster) {
			poster.src = dataset.poster || '';
		}
		const time_element = this.shadowId('time');
		if (time_element) {
			time_element.style.backgroundImage = waveform ? `url(${waveform})` : '';
		}
		this.showMain();
	},

	/**
	 * @summary Attach the audiotag to the API
	 * @package
	 *
	 * @param      {Element}  audiotag  The audiotag
	 */
	attachAudiotagToInterface: function(audiotag) {
		if (!audiotag) {
			return;
		}
		this.audiotag = audiotag;
		addIdToAudiotag(audiotag);
		this.completeTemplate();

		// throw simplified event
		trigger.update({target : audiotag});
	},

		/**
	 * @summary Inject a <style> into the shadowDom.
	 * @public
	 *
	 * Usage example in applications/chapters_editor.js
	 *
	 * @param 	{string}  styleName   	A name in the range /[a-zA-Z0-9\-_]+/, key to tag the created <style>
	 * @param 	{string}  css 			inline CSS to inject
	 */
	injectCss: function(styleName, css) {
		if (!styleName.match(validId)) {
			error(`injectCss invalid key "${styleName}"`);
			return;
		}

		this.removeCss(styleName);
		const element = document.createElement('style');
		element.id = `style_${styleName}`;
		element.innerHTML = css;
		this.container.appendChild(element);
	},

	/**
	 * @summary Remove an injected <style> into the shadowDom
	 * @public
	 *
	 * @param 	{string}  styleName   	Key of the created <style> , /[a-zA-Z0-9\-_]+/
	 */
	removeCss: function(styleName) {
		this.shadowId(`style_${styleName}`)?.remove();
	}
};

export default status;