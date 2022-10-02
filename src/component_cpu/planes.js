import { uncertainDuration } from '../mediatag/time.js';

import { validId, getPointId } from '../component/planename.js';


/**
 * @summary Check acceptance of a pointData for insertion
 *
 * @param      {Object} pointData  	normalized pointData to check
 * @return     boolean 				true is ok
 */
function checkPointData({start, end}) {
	return (((start == null) || (start >= 0)) && ((end == null) || (end >= start)));
}


export const planes = {
		/**
	 * @summary Gets an array of whole planes
	 * @private
	 *
	 * @return     {Array(string)}        array of planeNames
	 */
	planeNames : function() {
		// TODO : we need a way to order them, see #123 https://github.com/dascritch/cpu-audio/issues/123
		// BUG we may have duplicates, it can happens even with protections in addPlane() 
		// BUG will crash if no audiotag
		return Object.keys(this._planes).concat(Object.keys(this.audiotag?._CPU_planes ?? {}));
	},

	/**
	 * @summary Gets the plane info
	 * @private
	 *
	 * @param      {string}  planeName     The name
	 * @return     {Object}                 data of the plane
	 */
	plane: function(planeName) {
		return this._planes[planeName] ?? this.audiotag?._CPU_planes[planeName];
	},

	/**
	 * @summary Gets the plane track element
	 * @private but needed in tests
	 *
	 * @param      {string}  planeName   The name
	 * @return     {Element}    The <aside> track element from ShadowDom interface
	 */
	planeTrack: function(planeName) {
		return this.shadowId(`track_«${planeName}»`);
	},

	/**
	 * @summary Gets the plane panel element
	 * @private but needed in test
	 *
	 * @param      {string}  planeName   The name
	 * @return     {Element}    The panel element from ShadowDom interface
	 */
	planePanel: function(planeName) {
		return this.shadowId(`panel_«${planeName}»`);
	},

	/**
	 * @summary Gets the <nav><ul> plane panel element
	 * @private but needed in tests
	 *
	 * @param      {string}  planeName   The name
	 * @return     {Element}    The <ul> element from ShadowDom interface, null if inexisting
	 */
	planeNav: function(planeName) {
		return this.planePanel(planeName)?.querySelector(`ul`);
	},

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
	addPlane: function(planeName, planeData = {}) {
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
	},

	/**
	 * @summary Remove an annotation plane layer
	 * @public
	 *
	 * @param      {string}   planeName    A name in the range /[a-zA-Z0-9\-_]+/
	 *
	 * @return     {boolean}  success
	 */
	removePlane: function(planeName) {
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
	},

	/**
	 * @summary Shortcut to get  points data
	 * @private
	 *
	 * @param      {string}  planeName  The plane name
	 * @return     {Object}  Data
	 */
	planePoints: function(planeName) {
		return this.plane(planeName)?.points;
	},

	/**
	 * @summary Gets the point info
	 * @public
	 *
	 * @param      {string}  planeName  The plane name
	 * @param      {string}  pointName  The point name
	 * @return     {Object}  Data
	 */
	point: function(planeName, pointName) {
		return this.plane(planeName)?.points?.[pointName];
	},

	/**
	 * @summary Gets the point element in the track
	 * @private but needed in tests
	 *
	 * @param      {string}  planeName   The plane
	 * @param      {string}  pointName   The point
	 * @return     {Element}    The <div> point element into <aside> from ShadowDom interface
	 */
	pointTrack: function(planeName, pointName) {
		return this.shadowId(getPointId(planeName, pointName, false));
	},

	/**
	 * @summary Gets the point element in the panel
	 * @private but needed in tests
	 *
	 * @param      {string}  planeName   The plane
	 * @param      {string}  pointName   The point
	 * @return     {Element}    The <li> point element into panel from ShadowDom interface
	 */
	pointPanel: function(planeName, pointName) {
		return this.shadowId(getPointId(planeName, pointName, true));
	},

	/**
	 * @summary    Resort points of a plane by start-time. Should bne later renamed planePointSort , as we will need a planeSort ?
	 * @private
	 *
	 * @param      {string}   planeName     The plane name
	 */
	planeSort: function(planeName) {
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
	},

	/**
	 * @summary    get pointNames from a planeName
	 * @private may goes public later
	 *
	 * @param      {string}   planeName     The plane name
	 * @return     {[string]} points_names	 Array of pointNames
	 */
	planePointNames: function(planeName) {
		return Object.keys(this.planePoints(planeName));
	},

	/**
	 * @summary    Reorder panel of a plane by points order
	 * @private
	 *
	 * @param      {string}   planeName     The plane name
	 */
	panelReorder: function(planeName) {
		// TODO we may lose focused element. Store it to refocus it at the end
		this.planeSort(planeName);
		if (!this.planePanel(planeName)) {
			return;
		}
		let previous_element, element;
		for (const pointName of this.planePointNames(planeName)) {
			element = this.pointPanel(planeName, pointName);
			previous_element?.insertAdjacentElement('afterend', element);
			previous_element = element;
		}
	},

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
	addPoint: function(planeName, pointName, pointData={}) {
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
	},

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
	bulkPoints: function(planeName, pointDataGroup={}) {
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
	},


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
	editPoint: function(planeName, pointName, pointData) {
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
	},

	/**
	 * @summary Remove an annotation point
	 * @public
	 *
	 * @param      {string}   planeName  A name in the range /^[a-zA-Z0-9\-_$]+/
	 * @param      {string}   pointName  A name in the range /^[a-zA-Z0-9\-_$]+/
	 * @return     {boolean}  success
	 */
	removePoint: function(planeName, pointName) {
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
	},

	/**
	 * @summary Remove any points from an annotation plane
	 * @public
	 *
	 * @param      {string}  planeName  The plane name
	 */
	clearPlane: function(planeName) {
		const plane = this.plane(planeName);
		if (!plane) {
			return false;
		}

		for (const pointName of Object.keys(plane.points)) {
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
	},

	/**
	 * @summary Needed because Chrome can fire loadedmetadata before knowing audio duration. Fired at durationchange
	 *
	 * @private
	 */
	repositionTracks: function() {
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
	},


};

export default planes;