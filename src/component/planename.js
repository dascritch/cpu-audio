
// Regex for extracting plane and point names from an id
export const planePointNamesFromId = /^[\w-]+_«([\w-]+)(»_.*_«([\w-]+))?»$/;

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
 * @summary Gets the point track identifier
 *
 * @param      {string}  planeName  The plane name
 * @param      {string}  pointName  The point name
 * @param      {boolean} panel       Is panel (true) or track (false)
 * @return     {string}  The point track identifier.
 */
export  function getPointId(planeName, pointName, panel) {
	return `${ panel?'panel':'track' }_«${planeName}»_point_«${pointName}»`;
}

