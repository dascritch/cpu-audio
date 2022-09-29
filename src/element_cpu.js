import { adjacentArrayValue, findCPU, selectorAudioInComponent, querySelectorDo, passiveEvent } from './primitives/utils.js';
import { absolutizeUrl, escapeHtml, removeHtml } from './primitives/filters.js';
import { error } from './primitives/console.js';
import {__} from './i18n.js';
import {defaultDataset} from './default_dataset.js';
import { secondsInColonTime, secondsInTime, durationIso } from './primitives/convert.js';
import {translateVTT} from './translate_vtt.js';
import {trigger, timecodeStart, timecodeEnd} from './trigger.js';
import {isAudiotagStreamed, audiotagDuration, uncertainDuration, addIdToAudiotag, audiotagPreloadMetadata} from './media_element_extension.js';
import {switchControllerTo} from './cpu_controller.class.js';
import {buildInterface} from './build_interface.js';
import {cuechange_event} from './build_chapters.js';

// Acceptables attributes values for hide="" parameter on webcomponent
const acceptableHideAtttributes = ['poster', 'actions', 'timeline', 'chapters', 'panels', 'panels-title', 'panels-except-play'];

// should be put in CPU-controller ?
const previewClassname = 'with-preview';
export const activecueClassname = 'active-cue';
const hidingClassname = 'no';

const planeNameBorders = '_borders';

// Regex used to validate planes, points and injected css names
// NOTE : [\w-] === [a-zA-Z0-9_\-]
const validId = /^[\w-]+$/;

// Regex for extracting plane and point names from an id
const planePointNamesFromId = /^[\w-]+_«([\w-]+)(»_.*_«([\w-]+))?»$/;

/**
 * @summary Gets the plane point names from an id on a ShadowDOM element.
 * @package

 * repeated in the class for testing purposes
 *
 * @param      {string}  element_id  	The element identifier
 * @return     {Object}    				An object with two strings : planeName and pointName
 */
export function planeAndPointNamesFromId(element_id) {
	let  planeName, pointName;
	if (typeof element_id == 'string') {
		[, planeName, , pointName] = element_id?.match(planePointNamesFromId) || [];
	}
	return {
		planeName : planeName??'',
		pointName : pointName??''
	};
}

/**
 * @summary    Highlight the playable positions when hovering a marked link
 *
 * @param      {Object}  event   An hover event
 */
function previewContainerHover({target}) {
	if (!target.id) {
		target = target.closest('[id]');
	}
	if (!target) {
		return;
	}

	const {planeName, pointName} = planeAndPointNamesFromId(target.id);
	findCPU(target).highlightPoint(planeName, pointName);
}

/**
 * @summary Gets the point track identifier
 *
 * @param      {string}  planeName  The plane name
 * @param      {string}  pointName  The point name
 * @param      {boolean} panel       Is panel (true) or track (false)
 * @return     {string}  The point track identifier.
 */
function getPointId(planeName, pointName, panel) {
	return `${ panel?'panel':'track' }_«${planeName}»_point_«${pointName}»`;
}

/**
 * @summary Show or hide an element
 *
 * @param      {Element} element  	The element to show or hide
 * @param      {boolean} show 		Show if true, hide if false
 */
function showElement({classList}, show) {
	if (show) {
		classList.remove(hidingClassname);
	} else {
		classList.add(hidingClassname);
	}
}

/**
 * @summary Clean up DOM elements of any annotations, before rebuild them
 * @private
 *
 * @param      {Element} container  The webcontainer to clean-up
 */
function undrawAllPlanes(container) {
	querySelectorDo('aside, details.panel', (element) => { element.remove(); }, container);
}

/**
 * @summary Check acceptance of a pointData for insertion
 *
 * @param      {Object} pointData  	normalized pointData to check
 * @return     boolean 				true is ok
 */
function checkPointData({start, end}) {
	return (((start == null) || (start >= 0)) && ((end == null) || (end >= start)));
}

export class CPU_element_api {
	/**
	 *
	 * @summary Constructs the object.
	 * @public
	 *
	 * @param      {Element}  element              The DOMelement
	 */
	constructor(element) {
		// I hate this style. I rather prefer the object notation
		this.element = element;  
		this.shadow = element.shadowRoot;
		this.audiotag = /* @type {HTMLAudioElement} */ element.audiotag;
		this.container = this.shadowId('interface');
		this.mode_when_play = null;
		this.glowBeforePlay = !! element.hasAttribute('glow');
		this.current_playlist = [];
		this._activecue_id = null;
		this.mode_was = null;
		this.act_was = null;
		this.isController = false;

		element.CPU = this;

		if ( (this.audiotag) && (! this.audiotag._CPU_planes)) {
			this.audiotag._CPU_planes = {};
		}

		// only used for CPU-CONTROLLER, for playlist
		this._planes = {};

		const globalController = document.CPU.globalController;
		if ((this.audiotag) && (globalController) && (!globalController.audiotag)) {
			// CPU-Controller was intancied before any audiotag was available
			switchControllerTo(this.audiotag);
		}

		if (!this.audiotag) { // Implicitely a CPU-CONTROLLER
			this.isController = true;
			this.container.classList.add('controller');
			document.CPU.globalController = this;
			this.audiotag = document.querySelector(selectorAudioInComponent);
			audiotagPreloadMetadata(this.audiotag);
		}

		buildInterface(this);
		this.attachAudiotagToInterface(this.audiotag);
		this.attributesChanges();
	}

	attributesChanges() {
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
	}

	/**
	 * @summary Check if the actual <cpu-audio> is mirrored in <cpu-controller>. False if no cpu-controller
	 * @private but next time public ?
	 *
	 * @return     boolean			False if no cpu-controller or not mirrored
     */
	mirroredInController() {
		const globalController = document.CPU.globalController;
		return (globalController) && (this.audiotag.isEqualNode(globalController.audiotag));
	}


	/**
	 * @summary Passthru there only for testing purposes.
	 * @private but needed in tests
	 *
	 * @param      {string}            vtt_taged  The vtt tagged
	 * @return     string                         HTML tagged string
     */
	translateVTT(vtt_taged, normal) {
		return translateVTT(vtt_taged, normal);
	}

	/**
	 * @summary Passthru there only for testing purposes. Perhaps may be on document.CPU as public method ?
	 * @public
	 */
	planeAndPointNamesFromId(element_id) {
		return planeAndPointNamesFromId(element_id);
	}

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
	async emitEvent(event_name, detail = undefined) {
		this.element.dispatchEvent(
			new CustomEvent(`CPU_${event_name}`, {
				target 		: this.element,
				bubbles 	: true,
				cancelable 	: false,
				composed 	: false,
				detail 		: detail
			})
		);
	}

	shadowId(id) {
		return this.shadow.getElementById(id);
	}  

	/**
	 * @summary Used for `mode=""` attribute.
	 * @public
	 *
	 * @param      {string|null}  mode    Accepted are only in `/\w+/` format, 'default' by default
	 */
	setMode(mode = null) {
		mode = mode ?? 'default';
		if (this.mode_was === mode) {
			return;
		}
		const classes = this.container.classList;
		classes.remove(`mode-${this.mode_was}`);
		classes.add(`mode-${mode}`);
		this.mode_was = mode;
	}
	/**
	 * @summary Change the presentation style reflecting the media tag status
	 * @public
	 *
	 * @param      {string}  act     can be 'loading', 'pause', 'glow' or 'play'
	 */
	setAct(act) {
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
	}
	/**
	 * @public
	 * @summary Hide some blocks in the interface
	 * used for `hide=""` attribute
	 *
	 * @param      {Array<string>}  hide_elements  Array of strings, may contains
	 *                                        'actions' or 'chapters'
	 */
	setHide(hide_elements) {
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
	}

	/**
	 * @public
	 * @summary update play/pause button according to media status
	 */
	updatePlayButton() {
		const audiotag = this.audiotag;
		const _attr = audiotag.getAttribute('preload');
		const control_button = this.shadowId('control');
		const aria = 'aria-label';
		let _preload = _attr ? (_attr.toLowerCase() !== 'none') : true ;
		if (
				(audiotag.readyState < audiotag.HAVE_CURRENT_DATA ) &&
				((_preload) || (audiotag._CPU_played))
			) {
			this.setAct('loading');
			control_button.setAttribute(aria, __.loading);
			return;
		}
 		// warning : play/pause still inverted in "__"
 		let label = 'pause';
		let will_act = 'play';
		if (audiotag.paused) {
			label = 'play';
			will_act = 'pause';
			if ((!audiotag._CPU_played) && (this.glowBeforePlay)) {
				// TODO check option
				will_act = 'glow';
			}
		}

		this.setAct(will_act);
		control_button.setAttribute(aria, __[label]);
		const hide_panels_except_play_mark = 'last-used';

		const container_class = this.container.classList;
		if (!audiotag.paused) {
			audiotag._CPU_played = true;
			container_class.add(hide_panels_except_play_mark);
			if (this.mode_when_play) {
				this.setMode(this.mode_when_play);
				this.mode_when_play = null;
			}
		} else {
			if (! this.audiotag.isEqualNode(document.CPU.lastUsed)) {
				container_class.remove(hide_panels_except_play_mark);
			}
		}
	}

	/**
	 * @summary Update time-line length
	 * @private
	 *
	 * @param      {number}  					seconds  The seconds
	 * @param      {number|undefined|null=}  	ratio    ratio position in case time position are still unknown
	 */
	updateLine(seconds, ratio = null) {
		const loadingline_element = this.shadowId('loadingline');
		if (!loadingline_element) {
			return;
		}
		const { duration } = this.audiotag;
		ratio = ratio ?? ( duration === 0 ? 0 : (100*seconds / duration) );
		loadingline_element.style.width = `${ratio}%`;
	}

	/**
	 * @summary update current timecode and related links
	 * @private
	 */
	updateTime() {
		const audiotag = this.audiotag;
		const timecode = isAudiotagStreamed(audiotag) ? 0 : Math.floor(audiotag.currentTime);
		const canonical = audiotag.dataset.canonical ?? '' ;
		const _is_at = canonical.indexOf('#');
		const elapse_element = this.shadowId('elapse');
		if (elapse_element) {
			elapse_element.href = 
				`${ absolutizeUrl(canonical) }#${ (_is_at < 0) ?
					audiotag.id :
					canonical.substr(_is_at + 1) }&t=${timecode}`;
		}

		const currenttime_element = this.shadowId('currenttime');
		if (currenttime_element) {
			this.shadowId('currenttime').innerText = secondsInColonTime(audiotag.currentTime);
		}
		const duration_element = this.shadowId('totaltime');
		if (duration_element) {
			const duration = audiotagDuration(audiotag);
			duration_element.innerText = uncertainDuration(duration) ? '' : `\u00a0/\u00a0${secondsInColonTime(duration)}`;
			showElement(duration_element, duration);
		}
		this.updateLine(audiotag.currentTime);
	}

	/**
	 * @summary Shows indicators for the limits of the playing position
	 * @private
	 */
	updateTimeBorders() {
		const audiotag = this.audiotag;
		if ((!document.CPU.isAudiotagGlobal(audiotag)) || (timecodeEnd === false)) {
			this.removePlane(planeNameBorders);
			return;
		}
		// verify if plane exists, and point is invariant
		if (this.plane(planeNameBorders)) {
			const check = this.point(planeNameBorders, planeNameBorders);
			if (
				(check) &&
				(check.start === timecodeStart) &&
				(check.end === timecodeEnd)) {
				return;
			}
		}

		this.addPlane(planeNameBorders,{
			track   	: 'borders',
			panel   	: false,
			highlight 	: false
		});
		this.addPoint(planeNameBorders, planeNameBorders, {
			start 		: timecodeStart,
			link    	: false,
			end     	: timecodeEnd
		});

	}
	/**
	 * @summary Show that the media is loading
	 * @private
	 *
	 * @param      {number}  seconds  The seconds
	 */
	updateLoading(seconds, ratio) {
		this.updateLine(seconds, ratio);
		this.setAct('loading');
	}

	/**
	 * @summary Show the current media error status. NOTE : this is not working, even on non supported media type
	 * Chrome logs an error « Uncaught (in promise) DOMException: Failed to load because no supported source was found. »
	 * but won't update message
	 *
	 * @private
	 *
	 * @return     {boolean}  True if an error is displayed
	 */
	updateError() {
		const audiotag = this.audiotag;
		if (!audiotag) {
			return true;
		}
		const error_object = audiotag.error;
		if (error_object) {
			let error_message;
			this.show('error');
			const m = MediaError;
			switch (error_object.code) {
				case m.MEDIA_ERR_ABORTED:
					error_message = __.media_err_aborted;
					break;
				case m.MEDIA_ERR_NETWORK:
					error_message = __.media_err_network;
					break;
				case m.MEDIA_ERR_DECODE:
					error_message = __.media_err_decode;
					break;
				case m.MEDIA_ERR_SRC_NOT_SUPPORTED:
					error_message = __.media_err_src_not_supported;
					break;
				default:
					error_message = __.media_err_unknow;
					break;
			}
			const pageerror = this.shadowId('pageerror');
			if (pageerror) {
				pageerror.innerText = error_message;
			}
			return true;
		}
		return false;
	}

	/**
	 * @summary Will refresh player interface at each time change (a lot)
	 *
	 * @private
	 */
	update() {
		if (!this.updateError()) {
			this.updatePlayButton();
			this.updateTime();
			this.updateTimeBorders();
		}
	}

	/**
	 * @summary Position an element in the timeline, on its time
	 * @private
	 *
	 * @param      {Element} 			  		    element         Element to impact, should be in #time
	 * @param      {number|null|undefined}   	  	seconds_begin   Starts position in seconds, do not apply if undefined
	 * @param      {number|null|undefined|boolean}	seconds_end     Ends position in seconds, do not apply if NaN
	 */
	positionTimeElement(element, seconds_begin = null, seconds_end = null) {
		const { duration } = this.audiotag;

		if (uncertainDuration(duration)) {
			// duration still unkown ! We will need to redraw later the tracks
			return;
		}

		// completely ugly... but « WAT » ! as in https://www.destroyallsoftware.com/talks/wat
		const isSeconds = (sec) => ((sec != undefined) && (sec !== false));

		if (isSeconds(seconds_begin)) {
			element.style.left =  `${100 * (seconds_begin / duration)}%`;
		}
		if (isSeconds(seconds_end)) {
			element.style.right = `${100 * (1 - (seconds_end / duration))}%`;
		}

	}

	/**
	 * @summary Shows the throbber
	 *
	 * @public
	 *
	 * @param      {number}  seeked_time  The seeked time
	 */
	async showThrobberAt(seeked_time) {
		const audiotag = this.audiotag;
		if (audiotag.duration < 1) {
			// do not try to show if no metadata
			return;
		}
		if ((isNaN(audiotag.duration)) && (!isAudiotagStreamed(audiotag))) {
			// as we navigate on the timeline, we wish to know its total duration
			// yes, this is twice calling, as of trigger.throbble()
  			audiotag.setAttribute('preload', 'metadata');
			audiotagPreloadMetadata(audiotag, trigger.hover, event);
		}

		const phylactere = this.shadowId('popup');
		this.positionTimeElement(phylactere, seeked_time);
		phylactere.style.opacity = 1;
		phylactere.innerHTML = secondsInColonTime(seeked_time);
		phylactere.dateTime = secondsInTime(seeked_time).toUpperCase();
	}

	/**
	 * @summary Hides immediately the throbber.
	 * @public
	 */
	hideThrobber() {
		// we use opacity instead of a class change to permits opacity smooth transition via `--cpu-background-transitions`
		this.shadowId('popup').style.opacity = 0;
	}

	/**
	 * @summary Hides the throbber later. Will delay the hiding if recalled.
	 * @public
	 */
	hideThrobberLater() {
		const hideThrobber_delay = 1000;
		const phylactere = this.shadowId('popup');
		if (phylactere._hider) {
			window.clearTimeout(phylactere._hider);
		}
		phylactere._hider = window.setTimeout( () => { this.hideThrobber(); }, hideThrobber_delay);
	}

	/**
	 * @summary Will get presentation data from <audio> or from parent document
	 *
	 * @package
	 *
	 * @return     {Object}  dataset
	 */
	audiotagDataset() {
		return {...defaultDataset, ...this.audiotag.dataset};
	}

	/**
	 * @private
	 * still need to be public exposed for tests
	 *
	 * @summary Update links for sharing
	 */
	updateLinks() {
		const audiotag = this.audiotag;
		const dataset = this.audiotagDataset();
		const canonical = absolutizeUrl( dataset.canonical ?? '' );
		const timepos = (audiotag.currentTime === 0)  ? '' : `&t=${Math.floor(audiotag.currentTime)}`;
		// watch out : we should put the ID only if canonical URL is strictly identical to this page
		const tag_id = (canonical === absolutizeUrl(window.location.href)) ? audiotag.id : '';
		const _url = encodeURIComponent(`${canonical}#${tag_id}${timepos}`);
		/* why did I want an @ in the attribute if I cut it in my code ? to keep HTML readable and comprehensible, instead to develop attribute name into a "twitter-handler" */
		const _twitter = (dataset.twitter?.[0]!=='@') ? '' : `&via=${dataset.twitter.substring(1)}`;

		const link = audiotag.querySelector('source[data-downloadable]')?.src ||
					 dataset.download ||
					 audiotag.currentSrc;

		const title = dataset.title;
		const links = {
			twitter  : `https://twitter.com/share?text=${title}&url=${_url}${_twitter}`,
			facebook : `https://www.facebook.com/sharer.php?t=${title}&u=${_url}`,
			email    : `mailto:?subject=${title}&body=${_url}`,
			link
		};
		for (let key in links) {
			const element = this.shadowId(key);
			if (element) {
				element.href = links[key];
			}
		}
	}

	/**
	 * @summary Shows the interface
	 *
	 * @public
	 * @param      {string}  mode    The mode, can be 'main', 'share' or 'error'
	 */
	show(mode) {
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
	}

	/**
	 * @summary Shows the sharing panel
	 * @private
	 */
	showActions(/* event */) {
		this.show('share');
		this.updateLinks();
	}

	/**
	 * @summary Shows the main interface
	 * @private
	 */
	showMain(/* event */) {
		showElement(this.container, true);
		this.show('main');
	}

	/**
     * @summary Shows the handheld fine navigation
     * @private
	 *
	 * @param      {Object|undefined}  event   Triggering event
	 */
	showHandheldNav(event) {
		if (isAudiotagStreamed(this.audiotag)) {
			return;
		}
		// For resolving #180 , <details>.open != <details>.open will do the trick
		this.container.classList.toggle('show-handheld-nav');
		event?.preventDefault();
	}

	/**
	 * @summary Inject a <style> into the shadowDom.
	 * @public
	 *
	 * Usage example in applications/chapters_editor.js
	 *
	 * @param 	{string}  styleName   	A name in the range /[a-zA-Z0-9\-_]+/, key to tag the created <style>
	 * @param 	{string}  css 			inline CSS to inject
	 */
	injectCss(styleName, css) {
		if (!styleName.match(validId)) {
			error(`injectCss invalid key "${styleName}"`);
			return;
		}

		this.removeCss(styleName);
		const element = document.createElement('style');
		element.id = `style_${styleName}`;
		element.innerHTML = css;
		this.container.appendChild(element);
	}

	/**
	 * @summary Remove an injected <style> into the shadowDom
	 * @public
	 *
	 * @param 	{string}  styleName   	Key of the created <style> , /[a-zA-Z0-9\-_]+/
	 */
	removeCss(styleName) {
		this.shadowId(`style_${styleName}`)?.remove();
	}


	/**
	 * @summary Complete the interface at build time
	 * @package
	 */
	completeTemplate() {
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
	}

	/**
	 * @summary Attach the audiotag to the API
	 * @package
	 *
	 * @param      {Element}  audiotag  The audiotag
	 */
	attachAudiotagToInterface(audiotag) {
		if (!audiotag) {
			return;
		}
		this.audiotag = audiotag;
		addIdToAudiotag(audiotag);
		this.completeTemplate();

		// throw simplified event
		trigger.update({target : audiotag});
	}

	/**
	 * @summary Gets an array of whole planes
	 * @private
	 *
	 * @return     {Array(string)}        array of planeNames
	 */
	planeNames() {
		// TODO : we need a way to order them, see #123 https://github.com/dascritch/cpu-audio/issues/123
		// BUG we may have duplicates, it can happens even with protections in addPlane() 
		// BUG will crash if no audiotag
		return Object.keys(this._planes).concat(Object.keys(this.audiotag?._CPU_planes ?? {}));
	}

	/**
	 * @summary Gets the plane info
	 * @private
	 *
	 * @param      {string}  planeName     The name
	 * @return     {Object}                 data of the plane
	 */
	plane(planeName) {
		return this._planes[planeName] ?? this.audiotag?._CPU_planes[planeName];
	}

	/**
	 * @summary Gets the plane track element
	 * @private but needed in tests
	 *
	 * @param      {string}  planeName   The name
	 * @return     {Element}    The <aside> track element from ShadowDom interface
	 */
	planeTrack(planeName) {
		return this.shadowId(`track_«${planeName}»`);
	}

	/**
	 * @summary Gets the plane panel element
	 * @private but needed in test
	 *
	 * @param      {string}  planeName   The name
	 * @return     {Element}    The panel element from ShadowDom interface
	 */
	planePanel(planeName) {
		return this.shadowId(`panel_«${planeName}»`);
	}

	/**
	 * @summary Gets the <nav><ul> plane panel element
	 * @private but needed in tests
	 *
	 * @param      {string}  planeName   The name
	 * @return     {Element}    The <ul> element from ShadowDom interface, null if inexisting
	 */
	planeNav(planeName) {
		return this.planePanel(planeName)?.querySelector(`ul`);
	}

	/**
	 * @summary Draws a plane
	 * @private
	 *
	 * @param      {string}  planeName  The plane name
	 */
	drawPlane(planeName) {
		this.planeTrack(planeName)?.remove();
		this.planePanel(planeName)?.remove();

		const planeData = this.plane(planeName);
		if (!planeData) {
			return ;
		}
		const { track, panel, title } = planeData;
		const doRemoveHighlightsPoints = () => { 
			this.removeHighlightsPoints(planeName, previewClassname, true);
		};
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

	}

	/**
	 * @summary Add an annotation plane layer
	 * @public
	 *
	 * @param      {string}   planeName   A name in the range /[a-zA-Z0-9\-_]+/
	 * @param      {Object}   planeData   { 
	 										title : The displayed title for the panel,
	 										track : true/false/classnames ,
	 * 										panel : true/false/classnames ,
	 * 										highlight : true/false,
	 *										_comp : true/false // only stored in component, private use only
	  }
	 *
	 * @return     {boolean}  success
	 */
	addPlane(planeName, planeData = {}) {
		if ((! planeName.match(validId)) || (this.plane(planeName))) {
			return false;
		}

		// I don't understand (yet) why, when I move this declaration at the top of this source file, tests will fail
		const planeDataDefault = {
			track       : true,
			panel       : true,
			title       : '',
			highlight   : true,
			points      : {},
			_comp		: false
		};

		planeData = { ...planeDataDefault, ...planeData};

		if (!planeData._comp) {
			if (this.isController) {
				return false;
			}
			this.audiotag._CPU_planes = this.audiotag._CPU_planes ?? {};
			this.audiotag._CPU_planes[planeName] = planeData;
		} else {
			this._planes[planeName] = planeData;
		}
		this.drawPlane(planeName);
		return true;
	}

	/**
	 * @summary Remove an annotation plane layer
	 * @public
	 *
	 * @param      {string}   planeName    A name in the range /[a-zA-Z0-9\-_]+/
	 *
	 * @return     {boolean}  success
	 */
	removePlane(planeName) {
		if ( (! planeName.match(validId)) || (! this.plane(planeName)) || (this.isController && (!this._planes[planeName])) ) {
			return false;
		}

		delete (this._planes[planeName] ? this._planes : this.audiotag._CPU_planes)[planeName];

		this.planeTrack(planeName)?.remove();
		this.planePanel(planeName)?.remove();

		if ( (!this.isController) && (this.mirroredInController()) ) {
			// as plane data is removed, it will remove its aside and track
			document.CPU.globalController.drawPlane(planeName);
		}

		return true;
	}

	/**
	 * @summary Shortcut to get  points data
	 * @private
	 *
	 * @param      {string}  planeName  The plane name
	 * @return     {Object}  Data
	 */
	planePoints(planeName) {
		return this.plane(planeName)?.points;
	}

	/**
	 * @summary Gets the point info
	 * @public
	 *
	 * @param      {string}  planeName  The plane name
	 * @param      {string}  pointName  The point name
	 * @return     {Object}  Data
	 */
	point(planeName, pointName) {
		return this.plane(planeName)?.points?.[pointName];
	}

	/**
	 * @summary Gets the point element in the track
	 * @private but needed in tests
	 *
	 * @param      {string}  planeName   The plane
	 * @param      {string}  pointName   The point
	 * @return     {Element}    The <div> point element into <aside> from ShadowDom interface
	 */
	pointTrack(planeName, pointName) {
		return this.shadowId(getPointId(planeName, pointName, false));
	}

	/**
	 * @summary Gets the point element in the panel
	 * @private but needed in tests
	 *
	 * @param      {string}  planeName   The plane
	 * @param      {string}  pointName   The point
	 * @return     {Element}    The <li> point element into panel from ShadowDom interface
	 */
	pointPanel(planeName, pointName) {
		return this.shadowId(getPointId(planeName, pointName, true));
	}

	/**
	 * @summary    Resort points of a plane by start-time
	 * @private
	 *
	 * @param      {string}   planeName     The plane name
	 */
	planeSort(planeName) {
		const old_points = this.planePoints(planeName);
		if (!old_points) {
			return ;
		}

		this.plane(planeName).points =  Object.fromEntries( 
								Object.entries(
									old_points							    	
								).sort(
							    	([, point_a], [, point_b]) => {
							    		return point_a.start - point_b.start;
							    	}
							    )
						    );
		const points = Object.values( this.plane(planeName).points );
		this.plane(planeName)._st_max = points[points.length - 1]?.start ?? 0;
	}

	/**
	 * @summary    get pointNames from a planeName
	 * @private may goes public later
	 *
	 * @param      {string}   planeName     The plane name
	 * @return     {[string]} points_names	 Array of pointNames
	 */
	planePointNames(planeName) {
		return Object.keys(this.planePoints(planeName));
	}

	/**
	 * @summary    Reorder panel of a plane by points order
	 * @private
	 *
	 * @param      {string}   planeName     The plane name
	 */
	panelReorder(planeName) {
		// TODO we may lose focused element. Store it to refocus it at the end
		this.planeSort(planeName);
		if (!this.planePanel(planeName)) {
			return;
		}
		let previous_element, element;
		for (let pointName of this.planePointNames(planeName)) {
			element = this.pointPanel(planeName, pointName);
			previous_element?.insertAdjacentElement('afterend', element);
			previous_element = element;
		}
	}

	/**
	 * @summary Draws a plane point
	 * @private
	 *
	 * @param      {string}  planeName  The plane name
	 * @param      {string}  pointName  The point name
	 */
	drawPoint(planeName, pointName) {
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
	}

	/**
	 * @summary Add an annotation point
	 * @public
	 *
	 * @param      {string}   planeName      The existing plane name
	 * @param      {string}   pointName      The point name, should conform to /^[a-zA-Z0-9\-_]+$/
	 * @param      {Object}   pointData      {
	 * 											start : <seconds>,
	 *										    image : <url>,
	 * 											link  : <url>/true (in audio)/false (none),
	 * 											text  : <text>,
	 * 											end   : <seconds> }
	 *
	 * @return     {boolean}  success
	 */
	addPoint(planeName, pointName, pointData={}) {
		const start = Number(pointData.start);

		if ( (!pointName.match(validId)) ||
			(!this.plane(planeName)) ||
			(this.point(planeName, pointName)) ||
			(!checkPointData(pointData)) ) {
			return false;
		}
		if ((!this._planes[planeName]) && (this.isController)) {
			// accept points adding on controller only for private planes
			return false;
		}
		
		pointData.start = start;
		this.plane(planeName).points[pointName] = pointData;

		this.emitEvent('addPoint', {
			planeName,
			pointName,
			pointData
		});

		if (this.plane(planeName)._st_max > start) {
			// we need to reorder the plane
			this.panelReorder(planeName);
		} else {
			this.drawPoint(planeName, pointName);
			this.plane(planeName)._st_max = start;
		}

		return true;
	}

	/**
	 * @summary Bulk push (add/modify) points
	 * @public
	 *
	 * @param      {string}   planeName      The existing plane name
	 * @param      {Object}   Object of pointData      {
	 	                                         point_1 : pointData_1,
	 	                                         point_2 : pointData_2,
	 * 											}
	 *
	 * @return     {boolean}  success
	 */
	bulkPoints(planeName, pointDataGroup={}) {
		if (!this.plane(planeName)) {
			return false;
		}

		if ((!this._planes[planeName]) && (this.isController)) {
			return false;
		}

		for (const [pointName, pointData] of Object.entries(pointDataGroup)) {
			if ((!pointName.match(validId)) || (!checkPointData(pointData))) {
				return false;
			}
		}

		pointDataGroup = {...this.plane(planeName).points, ...pointDataGroup};
		this.plane(planeName).points = pointDataGroup;

		this.emitEvent('bulkPoints', {
			planeName,
			pointDataGroup
		});
		const nav = this.planeNav(planeName);
		if (nav) {
			nav.innerHTML = '';
		}
		this.refreshPlane(planeName);
		return true;
	}


	/**
	 * @summary Edit an annotation point
	 * @public
	 *
	 * @param      {string}   planeName      The existing plane name
	 * @param      {string}   pointName      The existing point name
	 * @param      {Object}   data            { 'image' : <url>,
	 * 											'link'  : <url>/true (in audio)/false (none),
	 * 											'text'  : <text>,
	 * 											'start' : <seconds>,
	 * 											'end'   : <seconds> }
	 *										  will only change keys in the list
	 */
	editPoint(planeName, pointName, pointData) {
		const plane = this.plane(planeName);
		if (!plane) {
			return false;
		}

		const original_data = this.point(planeName, pointName);
		if (!original_data) {
			return false;	
		}

		let { start } = pointData;
		start = Number(start);
		const will_refresh = ((start != null) && (start !== original_data.start));

		pointData = {...original_data, ...pointData};

		if (!checkPointData(pointData)) {
			return false;
		}

		plane.points[pointName] = pointData;

		this.drawPoint(planeName, pointName);
		if (will_refresh) {
			this.panelReorder(planeName);
		}

		this.emitEvent('editPoint', {
			planeName,
			pointName,
			pointData
		});

		if (plane._st_max < start) {
			plane._st_max = start;
		}
	}

	/**
	 * @summary Remove an annotation point
	 * @public
	 *
	 * @param      {string}   planeName  A name in the range /^[a-zA-Z0-9\-_$]+/
	 * @param      {string}   pointName  A name in the range /^[a-zA-Z0-9\-_$]+/
	 * @return     {boolean}  success
	 */
	removePoint(planeName, pointName) {
		const plane = this.plane(planeName);
		if ((!plane) || (!this.point(planeName, pointName))) {
			return false;
		}

		this.emitEvent('removePoint', {
			planeName,
			pointName
		});

		this.pointTrack(planeName, pointName)?.remove();
		this.pointPanel(planeName, pointName)?.remove();

		//  recalc _start_max for caching repaints
		let _st_max = 0;
		for (const s of Object.values(this.planePoints(planeName))) {
			const that_start = Number(s.start);
			_st_max = _st_max < that_start ? that_start : _st_max;
		}
		plane._st_max = _st_max;

		if ( (!this.isController) && (this.mirroredInController()) ) {
			document.CPU.globalController.removePoint(planeName, pointName);
		}
		if (plane.points[pointName]) {
			delete plane.points[pointName];
		}
		return true;
	}

	/**
	 * @summary Remove any points from an annotation plane
	 * @public
	 *
	 * @param      {string}  planeName  The plane name
	 */
	clearPlane(planeName) {
		const plane = this.plane(planeName);
		if (!plane) {
			return false;
		}

		for (let pointName of Object.keys(plane.points)) {
			this.removePoint(planeName, pointName);
		}
		// need to repass in case of badly removed / malformed entries
		const nav = this.planeNav(planeName);
		if (nav) {
			nav.innerHTML = '';
		}
		// purge repaint flag to redraw
		plane._st_max = 0;

		return true;
	}

	/**
	 * @summary Refresh a plane. a panelReorder may be enough
	 * @public
	 *
	 * @param      {string}  planeName  The plane name
	 */
	refreshPlane(planeName) {
		this.planeSort(planeName);
		for (let pointName of this.planePointNames(planeName)) {
			this.drawPoint(planeName, pointName);
		}
	}

	/**
	 * @summary Clear and redraw all planes
	 * Mainly when cpu-controller is changing targeted audio tag
	 * @public
	 */
	redrawAllPlanes() {
		undrawAllPlanes(this.container);

		for (let planeName of Object.keys({...this._planes, ...this.audiotag._CPU_planes})) {
			this.drawPlane(planeName);
			this.refreshPlane(planeName);
		}

		// due to a Chrome glitch on chapters panel in cpu-controller while changing playing cpu-audio, we have to refresh a cuechange_event 
		cuechange_event(this);
	}

	/**
	 * @summary Needed because Chrome can fire loadedmetadata before knowing audio duration. Fired at durationchange
	 *
	 * @private
	 */
	repositionTracks() {
		if (uncertainDuration(this.audiotag.duration)) {
			// duration still unkown
			return ;
		}

		for (const planeName in this.audiotag._CPU_planes) {
			const plane_data = this.plane(planeName);
			if (plane_data.track) {
				for (const pointName of this.planePointNames(planeName)) {
					const {start, end} = this.point(planeName, pointName);
					const pointTrack = this.pointTrack(planeName, pointName);
					if (pointTrack) {
						this.positionTimeElement(pointTrack, start, end);
					}
				}
			}
		}
	}

	/**
	 * @summary Remove any previewes on plane points
	 * @public
	 *
	 * @param			 {string}  planeName The plane name to operate
	 * @param      {string}  className Targeted class name, 'with-preview' by default
	 * @param      {boolean} mirror     Also act on linked cpu-controller/cpu-audio
	 */
	removeHighlightsPoints(planeName, className=previewClassname, mirror=true) {
		querySelectorDo(
			`#track_«${planeName}» .${className}, #panel_«${planeName}» .${className}`,
			(element) => { element.classList.remove(className); },
			this.container);
		if ( (mirror) && (this.mirroredInController()) ) {
			const globalController = document.CPU.globalController;
			const on = this.isController ? findCPU(globalController.audiotag) : globalController;
			on.removeHighlightsPoints(planeName, className, false);
		}
	}

	/**
	 * @summary Sets a preview on a plane point
	 * @public
	 *
	 * @param      {string}  planeName  The plane name
	 * @param      {string}  pointName  The point name
	 * @param      {string}  className  class name, 'with-preview' by default
	 * @param      {boolean} mirror     Also act on linked cpu-controller/cpu-audio, true by default
	 */
	highlightPoint(planeName, pointName, className=previewClassname, mirror=true) {
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
	}


	/**
	 * @summary Give focus on an annotation point
	 * @public
	 *
	 * @param      {string}   planeName      The existing plane name
	 * @param      {string}   pointName      The existing point name
	 * @return      boolean    has focus
	 */
	focusPoint(planeName, pointName) {
		// get element, first on the plane, and else on the plane
		const element = this.pointPanel(planeName, pointName)?.querySelector('a') ?? this.pointTrack(planeName, pointName);
		if (!element) {
			return false;
		}
		element.focus();
		return true;
	}

	/**
	 * @summary Get focused element in shadow
	 * @public
	 *
	 * @return      {Element|null}   		Focused element, or null
	 */
	focused() {
		return this.shadow.querySelector(':focus');
	}

	/**
	 * @summary Get ID of focused element in shadow
	 * @public
	 *
	 * @return      {string|null|undefined}   		Focused ID, or null or undefined
	 */
	focusedId() {
		const target = this.focused();
		if (!target) {
			return;
		}
		const out = target.id  != '' ? target.id : target.closest('[id]').id;
		return out == '' ? null : out;
	}

	/**
	 * @summary browse yo with focus in panels using ↑ key
	 * @private
	 */
	prevFocus() {
		relativeFocus(this, false);
	}

	/**
	 * @summary browse down with focus in panels using ↓ key
	 * @private
	 */
	nextFocus() {
		relativeFocus(this, true);
	}

}

/**
 * @summary relatively browse up or down with focus
 * @private
 */
function relativeFocus(self, go_foward) {
	const planeNames = self.planeNames();
	if (planeNames.length == 0) {
		return;
	}

	const validPlane = (id) => {
		const {track, panel, points} = self.plane(id);
		return (((track !== false) || (panel !== false))
				&& ((self.planePanel(id)?.clientHeight > 0) || (self.planeTrack(id)?.clientHeight > 0))
				&& (points)
				&& (Object.keys(points).length > 0));
	};
	const scanToPrevPlane = (fromPlane) => {
		for(let id = planeNames.indexOf(fromPlane) -1; id >= 0 ; id--) {
			const out = planeNames[id];
			if (validPlane(out)) {
				return out;
			}
		}
	};
	const scanToNextPlane = (fromPlane) => {
		for(let id = planeNames.indexOf(fromPlane) +1; id < planeNames.length ; id++) {
			const out = planeNames[id];
			if (validPlane(out)) {
				return out;
			}
		}
	};

	let planeName, pointName, planePointNames;
	let wasFocused = self.focused();
	if (wasFocused) {
		if (!wasFocused.id) {
			wasFocused = wasFocused.closest('[id]');
		}
		({planeName, pointName} = planeAndPointNamesFromId(wasFocused.id));
	}
	if (pointName != '') {  // NOTE : loosy comparison is important
		planePointNames = self.planePointNames(planeName);
		pointName = adjacentArrayValue(planePointNames, pointName, go_foward ? 1 : -1);
	}
	if (!pointName) {
		planeName = go_foward ? scanToNextPlane(planeName) : scanToPrevPlane(planeName);
		if (!planeName) {
			return;
		}
		const points = self.planePointNames(planeName);
		pointName = points[go_foward ? 0 : (points.length - 1)];
	}
	self.focusPoint(planeName, pointName);
}

