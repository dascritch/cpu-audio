export const DefaultParametersDocumentCPU = {
	// those values may be later modified via loading parameters

	// @public
	// @type boolean
	autoplay : false,

	// @public
	// @type number
	keymove : 5,
	// @public
	// @type boolean
	playStopOthers : true,
	// @public
	// @type number
	// why 500ms ? Because Chrome will trigger a touchcancel event at 800ms to show a context menu
	alternateDelay : 500,

	// @public
	// @type number
	fastFactor : 4,
	// @public
	// @type number
	repeatDelay : 400,
	// @public
	// @type number
	repeatFactor : 100,

	// @public
	// @type boolean
	advanceInPlaylist : true,

};