export const default_document_cpu_parameters = {
	// those values may be later modified via loading parameters

	// @public
	// @type boolean
	autoplay : false,

	// @public
	// @type number
	keymove : 5,
	// @public
	// @type boolean
	only_play_one_audiotag : true,
	// @public
	// @type number
	// why 500ms ? Because Chrome will trigger a touchcancel event at 800ms to show a context menu
	alternate_delay : 500,

	// @public
	// @type number
	fast_factor : 4,
	// @public
	// @type number
	repeat_delay : 400,
	// @public
	// @type number
	repeat_factor : 100,

	// @public
	// @type boolean
	advance_in_playlist : true,

};