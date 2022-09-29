import { CpuAudioTagName, CpuControllerTagName, selectorAcceptable, findCPU } from './primitives/utils.js';
import { notScreenContext } from './primitives/checkers.js';
import { warn, info } from './primitives/console.js';
import {template} from '../tmp/insert_template.js';
import {CPU_element_api} from './element_cpu.js';
import {removeOfPlaylists, buildPlaylist, rePointsPlaylist} from './build_playlist.js';

/**
 * @summary When a <cpu-audio> plays, attach it to the eventual <cpu-controller>
 * @private
 *
 * @param      {audiotag}  HTMLAudioElement   The playing <audio> tag
 */
export function switchControllerTo(audiotag) {
	const globalController = document.CPU.globalController;
	if (!globalController) {
		return;
	}

	if (!audiotag.isEqualNode(globalController.audiotag)) {
		// remove previous orphan audio tag
		const previous_audiotag = document.CPU.globalController.element.querySelector('audio');
		if (previous_audiotag) {
			removeOfPlaylists(previous_audiotag);
			previous_audiotag.remove();
		}

		const wasFocused = globalController.focusedId();
		globalController.attachAudiotagToInterface(audiotag);
		// globalController.audiotag = audiotag; unuseful : done upper
		globalController.showMain();
		globalController.redrawAllPlanes();
		globalController.setMode(); 	// to switch back the display between streamed/not-str medias
		buildPlaylist(wasFocused);
	}
}

/**
 * @summary Interprets if <cpu-audio>/<cpu-controller> element is modified
 *
 * @param      {Object}  mutationsList  The mutations list
 */
function modifiedController([{target}]) {
	const elCPU = findCPU(target);
	const component = elCPU.element;
	const media_tagname = 'audio';
	const audio_element = component.querySelector(media_tagname);
	const globalController = document.CPU.globalController;
	if ((!audio_element) && (component.tagName !== CpuControllerTagName)) {
		info(`<${media_tagname}> element was removed.`);		
		component.remove();
		if (globalController) {
			rePointsPlaylist();
		}
		return;
	}
	component.copyAttributesToMediaDataset?.();
	elCPU.attributesChanges();

	if (document.CPU.currentPlaylistID() === audio_element?.dataset.playlist) {
		rePointsPlaylist();
	}
}

/**
 * Controller without assigned audio element, i.e. global page controller
 *
 * @class      CpuControllerElement (name)
 */
export class CpuControllerElement extends HTMLElement {

	constructor() {
		super();
		this.CPU = null;
		this.observer = null;

		if (notScreenContext) {
			// I'm not in a screen context, as a braille surface
			// Sorry, but your browser's native controls are surely more accessible
			this.remove();
			return ;
		}

		/// TODO if a CPU-Controller is still there, do not create

		if (this.tagName === CpuAudioTagName) {
			if (!this.querySelector(selectorAcceptable)) {
				// Graceful degradation : do not start if no media element OR no native controls
				warn(`Tag <${CpuAudioTagName}> without <audio controls>.\nSee https://github.com/dascritch/cpu-audio/blob/master/INSTALL.md for a correct installation.`);
				this.remove();
				return;
			}
		}

		if ((this.tagName === CpuControllerTagName) && (document.CPU.globalController)) {
			// called twice ????
			warn(`<${CpuControllerTagName}> tag instancied twice.`);
			this.remove();
			return ;
		}

		this.shadow = this.attachShadow({mode: 'open'});
		this.shadow.innerHTML = template();
	}

	connectedCallback() {
		if (notScreenContext) {
			return ;
		}

		if (!this.shadowRoot) {
			return;
		}

		new CPU_element_api(this);

		this.observer = new MutationObserver(modifiedController);
		this.observer.observe(this, {
			childList 	: true,
			attributes	: true
		});
		this.CPU.attributesChanges();
	}

	disconnectedCallback() {
		if (!this.observer) {
			// was already deleted because instancied twice
			return;
		}
		this.observer.disconnect();
		this.CPU.emitEvent('removed');
		if ((this.tagName === CpuControllerTagName) && (document.CPU.globalController)) {
			document.CPU.globalController = null;
		}
	}

}
