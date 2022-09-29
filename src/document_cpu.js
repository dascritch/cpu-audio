import { findCPU } from './primitives/utils.js';
import { adjacentKey } from './primitives/operators.js';
import convert from './primitives/convert.js';
import head_parameters from './primitives/head_parameters.js';

import DefaultParametersDocumentCPU from './bydefault/parameters.js';
import defaultDataset from './bydefault/dataset.js';

import { isAudiotagPlaying } from './mediatag/status.js';
import jumpIdAt from './mediatag/jump.js';
import seekElementAt from './mediatag/seek.js';

import trigger from './trigger.js';


export const DocumentCPU = {
	// global object for global API

	// public, parameters
	...DefaultParametersDocumentCPU,
	// overrided parameters by integrator
	...head_parameters(),

	// public, actual active elements
	// @public
	// @type {HTMLAudioElement|null}
	currentAudiotagPlaying : null,
	// @type {CpuControllerElement|null}
	// @public
	globalController : null,

	// private, indicate a play already occured in the DOM, so we can start any play
	// @private
	// @type boolean
	hadPlayed : false,

	// private, indicate last used audiotag
	// @private
	// @type {HTMLAudioElement|null}
	lastUsed : null,

	// public, playlists
	// @public
	// @type Object
	playlists : {},

	// public, Exposing internals needed for tests
	// @public
	convert,
	// @public
	trigger,

	defaultDataset,

	// @public utilities to find CPU API
	findCPU,
	// @public utilities for manipulations
	adjacentKey,

	/**
	 * @public
	 * @summary Determines if audiotag is currently playing.
	 *
	 * @param      {HTMLAudioElement}   audiotag  The audiotag
	 * @return     {boolean}  True if audiotag playing, False otherwise.
	 */
	isAudiotagPlaying,
	/**
	 * @public
	 * @summary Determines if audiotag is displayed in <cpu-controller>
	 *
	 * @param      {HTMLAudioElement}   audiotag  The audiotag
	 * @return     {boolean}  True if audiotag global, False otherwise.
	 */
	isAudiotagGlobal : function(audiotag) {
		return this.globalController ? 
			audiotag.isEqualNode(this.globalController.audiotag) : 
			this.isAudiotagPlaying(audiotag);
	},

	/**
	 * @public
	 * @summary Position a timecode to a named audio tag
	 *
	 * @param      {string}   hash         The id="" of an <audio> tag
	 * @param      {string}   timecode     The timecode,
	 * @param      {Function|null|undefined}   callback_fx  Function to be called afterwards, for ending tests
	 */
	jumpIdAt,

	/**
	 * @summary Position a <audio> element to a time position
	 * @public
	 *
	 * @param      {HTMLAudioElement}  audiotag  <audio> DOM element
	 * @param      {number}  seconds   	Wanted position, in seconds
	 *
	 */
	seekElementAt,

	/**
	 * @summary Return the current playing playlist array
	 * @public
	 *
	 * @return     {Array}  Array with named id
	 */
	currentPlaylist : function() {

		const current_audiotag = this.globalController?.audiotag;
		if (!current_audiotag) {
			return [];
		}

		for (const playlist of Object.values(this.playlists)) {
			if (playlist.includes(current_audiotag.id)) {
				return playlist;
			}
		}

		return [];
	},

	/**
	 * @summary Return the current playing playlist ID
	 * @public
	 *
	 * @return     string|null		Named id
	 */
	currentPlaylistID : function() {
		const current_audiotag = this.globalController?.audiotag;
		if (!current_audiotag) {
			return [];
		}

		for (let playlist_name of Object.keys(this.playlists)) {
			if (this.playlists[playlist_name].includes(current_audiotag.id)) {
				return playlist_name;
			}
		}

		return null;
	}
};
