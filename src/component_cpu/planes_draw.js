import { passiveEvent } from '../primitives/events.js';
import { escapeHtml, removeHtml } from '../primitives/filters.js';
import { secondsInColonTime, durationIso } from '../primitives/convert.js';
import { findCPU, querySelectorDo } from '../primitives/utils.js';

import { getPointId } from '../component/planename.js';
import { previewContainerHover, showElement } from '../component/show.js';

import { cuechange_event } from '../build_chapters.js';


const previewClassname = 'with-preview';
export const activecueClassname = 'active-cue';


/**
 * @summary Clean up DOM elements of any annotations, before rebuild them
 * @private
 *
 * @param      {Element} container  The webcontainer to clean-up
 */
function undrawAllPlanes(container) {
	querySelectorDo('aside, details.panel', (element) => { element.remove(); }, container);
}

export const planes_draw = {

	/**
	 * @summary Draws a plane
	 * @private
	 *
	 * @param      {string}  planeName  The plane name
	 */
	drawPlane: function(planeName) {
		this.planeTrack(planeName)?.remove();
		this.planePanel(planeName)?.remove();

		const planeData = this.plane(planeName);
		if (!planeData) {
			return ;
		}
		const { track, panel, title } = planeData;
		const doRemoveHighlightsPoints = () => this.removeHighlightsPoints(planeName, previewClassname, true);

		const assignEventsOnPlanes = (element) => {
			element.addEventListener('mouseover', previewContainerHover, passiveEvent);
			element.addEventListener('focusin', previewContainerHover, passiveEvent);
			element.addEventListener('mouseleave', doRemoveHighlightsPoints, passiveEvent);
			element.addEventListener('focusout', doRemoveHighlightsPoints, passiveEvent);
		};

		if (track !== false) {
			// we have to create the track timeline
			const plane_track = document.createElement('aside');
			plane_track.id = `track_«${planeName}»`;
			if (track !== true) {
				// …with a class list, space separated
				plane_track.classList.add(track.split(' '));
			}

			this.shadowId('line').appendChild(plane_track);
			assignEventsOnPlanes(plane_track);
		}

		if (panel !== false) {
			// we have to create the panel area
			const plane_panel = document.createElement('details');
			// TODO  #180 : We may be able to hide by default, or have de details closed
			plane_panel.open = true;
			plane_panel.id = `panel_«${planeName}»`;
			if (panel !== true) {
				// …with a class list
				plane_panel.classList.add(panel.split(' '));
			}
			plane_panel.classList.add('panel');
			plane_panel.innerHTML = `<summary>${escapeHtml(title)}</summary><nav><ul></ul></nav>`;
			this.container.appendChild(plane_panel);
			showElement( plane_panel.querySelector('summary') , title);
			assignEventsOnPlanes(plane_panel);
		}

		if ( (!this.isController) && (this.mirroredInController()) ) {
			document.CPU.globalController.drawPlane(planeName);
		}

	},

		/**
	 * @summary Draws a plane point
	 * @private
	 *
	 * @param      {string}  planeName  The plane name
	 * @param      {string}  pointName  The point name
	 */
	drawPoint: function(planeName, pointName) {
		const audiotag = this.audiotag ?? document.CPU.globalController.audiotag;
		const pointData = this.point(planeName, pointName);
		const {start, link, text, image, end} = pointData;

		let use_link = '#';
		if (link === true) {
			// automated link to the audio tag.
			use_link = `#${audiotag.id}&t=${start}`;
		}
		if (typeof(link) === 'string') {
			// Integrator of the page wants a specific url (hoping he know what he do with a "javascript:")
			use_link = link;
		}

		const track = this.planeTrack(planeName);
		let elementPointTrack;
		if (track) {
			elementPointTrack = this.pointTrack(planeName, pointName);
			if (!elementPointTrack) {
				elementPointTrack = document.createElement('a');
				elementPointTrack.id = getPointId(planeName, pointName, false);
				// TODO : how to do chose index of a point track if there is no link, or a panel but no track??
				elementPointTrack.tabIndex = -1; 
				elementPointTrack.innerHTML = '<img alt="" /><span></span>';
				track.appendChild(elementPointTrack);
			}
			elementPointTrack.href = use_link;
			elementPointTrack.title = removeHtml(text);
			const track_img = elementPointTrack.querySelector('img');
			showElement(track_img, image);
			track_img.src = image || '';
			elementPointTrack.querySelector('img').innerHTML = text ;
			this.positionTimeElement(elementPointTrack, start, end);
		}

		const panel = this.planeNav(planeName);
		let elementPointPanel;
		if (panel) {
			elementPointPanel = this.pointPanel(planeName, pointName);
			if (!elementPointPanel) {
				elementPointPanel = document.createElement('li');
				elementPointPanel.id = getPointId(planeName, pointName, true);
				elementPointPanel.innerHTML = '<a href="#" class="cue"><strong></strong><time></time></a>';
				panel.appendChild(elementPointPanel);
			}
			elementPointPanel.querySelector('a').href = use_link;
			elementPointPanel.querySelector('strong').innerHTML = text;
			const time_element = elementPointPanel.querySelector('time');
			time_element.dateTime = durationIso(start);
			time_element.innerText = secondsInColonTime(start);
		}

		this.emitEvent('drawPoint', {
			planeName,
			pointName,
			pointData,
			elementPointTrack,
			elementPointPanel,
		});

		if ( (!this.isController) && (this.mirroredInController()) ) {
			document.CPU.globalController.drawPoint(planeName, pointName);
		}
	},

	/**
	 * @summary Refresh a plane. a panelReorder may be enough
	 * @public
	 *
	 * @param      {string}  planeName  The plane name
	 */
	refreshPlane: function(planeName) {
		this.planeSort(planeName);
		for (const pointName of this.planePointNames(planeName)) {
			this.drawPoint(planeName, pointName);
		}
	},

	/**
	 * @summary Clear and redraw all planes
	 * Mainly when cpu-controller is changing targeted audio tag
	 * @public
	 */
	redrawAllPlanes: function() {
		undrawAllPlanes(this.container);

		for (const planeName of Object.keys({...this._planes, ...this.audiotag._CPU_planes})) {
			this.drawPlane(planeName);
			this.refreshPlane(planeName);
		}

		// due to a Chrome glitch on chapters panel in cpu-controller while changing playing cpu-audio, we have to refresh a cuechange_event 
		cuechange_event(this);
	},

	/**
	 * @summary Remove any previewes on plane points
	 * @public
	 *
	 * @param			 {string}  planeName The plane name to operate
	 * @param      {string}  className Targeted class name, 'with-preview' by default
	 * @param      {boolean} mirror     Also act on linked cpu-controller/cpu-audio
	 */
	removeHighlightsPoints: function(planeName, className=previewClassname, mirror=true) {
		querySelectorDo(
			`#track_«${planeName}» .${className}, #panel_«${planeName}» .${className}`,
			(element) => { element.classList.remove(className); },
			this.container);
		if ( (mirror) && (this.mirroredInController()) ) {
			const globalController = document.CPU.globalController;
			const on = this.isController ? findCPU(globalController.audiotag) : globalController;
			on.removeHighlightsPoints(planeName, className, false);
		}
	},

	/**
	 * @summary Sets a preview on a plane point
	 * @public
	 *
	 * @param      {string}  planeName  The plane name
	 * @param      {string}  pointName  The point name
	 * @param      {string}  className  class name, 'with-preview' by default
	 * @param      {boolean} mirror     Also act on linked cpu-controller/cpu-audio, true by default
	 */
	highlightPoint: function(planeName, pointName, className=previewClassname, mirror=true) {
		this.removeHighlightsPoints(planeName, className, mirror);

		if (! this.plane(planeName)?.highlight) {
			return;
		}

		this.pointTrack(planeName, pointName)?.classList.add(className);
		this.pointPanel(planeName, pointName)?.classList.add(className);

		if ( (mirror) && (this.mirroredInController()) ) {
			const globalController = document.CPU.globalController;
			const on = this.isController ? findCPU(globalController.audiotag) : globalController;
			on.highlightPoint(planeName, pointName, className, false);
		}
	},

};

export default planes_draw;