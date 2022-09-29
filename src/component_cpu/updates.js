import __ from '../primitives/i18n.js';
import { absolutizeUrl, escapeHtml, removeHtml } from '../primitives/filters.js';
import { secondsInColonTime, secondsInTime, durationIso } from '../primitives/convert.js';

import { isAudiotagStreamed, audiotagDuration, uncertainDuration } from '../mediatag/time.js';
import { timecodeStart, timecodeEnd } from '../mediatag/actions.js';

import { previewContainerHover, showElement } from '../component/show.js';

const planeNameBorders = '_borders';

export const updates = {


	/**
	 * @public
	 * @summary update play/pause button according to media status
	 */
	updatePlayButton: function() {
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
	},

	/**
	 * @summary Update time-line length
	 * @private
	 *
	 * @param      {number}  					seconds  The seconds
	 * @param      {number|undefined|null=}  	ratio    ratio position in case time position are still unknown
	 */
	updateLine: function(seconds, ratio = null) {
		const loadingline_element = this.shadowId('loadingline');
		if (!loadingline_element) {
			return;
		}
		const { duration } = this.audiotag;
		ratio = ratio ?? ( duration === 0 ? 0 : (100*seconds / duration) );
		loadingline_element.style.width = `${ratio}%`;
	},

	/**
	 * @summary update current timecode and related links
	 * @private
	 */
	updateTime: function() {
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
	},

	/**
	 * @summary Shows indicators for the limits of the playing position
	 * @private
	 */
	updateTimeBorders: function() {
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

	},

	/**
	 * @summary Show that the media is loading
	 * @private
	 *
	 * @param      {number}  seconds  The seconds
	 */
	updateLoading: function(seconds, ratio) {
		this.updateLine(seconds, ratio);
		this.setAct('loading');
	},

	/**
	 * @summary Show the current media error status. NOTE : this is not working, even on non supported media type
	 * Chrome logs an error « Uncaught (in promise) DOMException: Failed to load because no supported source was found. »
	 * but won't update message
	 *
	 * @private
	 *
	 * @return     {boolean}  True if an error is displayed
	 */
	updateError: function() {
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
	},


	/**
	 * @private
	 * still need to be public exposed for tests
	 *
	 * @summary Update links for sharing
	 */
	updateLinks : function() {
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
	},

	/**
	 * @summary Will refresh player interface at each time change (a lot)
	 *
	 * @private
	 */
	update: function() {
		if (!this.updateError()) {
			this.updatePlayButton();
			this.updateTime();
			this.updateTimeBorders();
		}
	}

}

export default updates;