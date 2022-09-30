import translateVTT from '../primitives/translate_vtt.js';
import { selectorAudioInComponent } from '../primitives/utils.js';

import { planeAndPointNamesFromId } from '../component/planename.js';
import { audiotagPreloadMetadata } from '../mediatag/extension.js';

import { switchControllerTo } from '../cpu_controller.class.js';
import buildInterface from '../build_interface.js';

import status from './status.js';
import updates from './updates.js';
import throbber from './throbber.js';
import show from './show.js';
import planes from './planes.js';
import planes_focus from './planes_focus.js';


/**
*
* @summary Constructs the api .CPU object for the component
* @public
*
* @param      {Element}  element              The DOMelement
*/
export function	constructor(element) {

	const { audiotag, shadowRoot } = element;

	const self = {
		element,
		shadow : shadowRoot,
		audiotag,
		mode_when_play : null,
		glowBeforePlay : !! element.hasAttribute('glow'),
		current_playlist : [],
		_activecue_id : null,
		mode_was : null,
		act_was : null,
		isController : false,

		// integration of segments per features
		...status,
		...updates,
		...throbber,
		...show,
		...planes,
		...planes_focus,

		// Passthru there only for testing purposes.
		translateVTT, 
		planeAndPointNamesFromId, 
	};

	self.container = self.shadowId('interface');

	element.CPU = self;

	if ( (audiotag) && (! audiotag._CPU_planes)) {
		audiotag._CPU_planes = {};
	}

	// only used for CPU-CONTROLLER, for playlist
	self._planes = {};

	const globalController = document.CPU.globalController;
	if ((audiotag) && (globalController) && (!globalController.audiotag)) {
		// CPU-Controller was intancied before any audiotag was available
		switchControllerTo(audiotag);
	}

	if (!audiotag) { // Implicitely a CPU-CONTROLLER
		self.isController = true;
		self.container.classList.add('controller');
		document.CPU.globalController = self;
		self.audiotag = document.querySelector(selectorAudioInComponent);
		audiotagPreloadMetadata(self.audiotag);
	}

	buildInterface(self);
	self.attachAudiotagToInterface(self.audiotag);
	self.attributesChanges();
}

export default constructor;