/**
 * @summary Find adjacent key to a key in object, previous or next one
 * @public via document.CPU for tests purposes
 *
 * @param      	{object}              	object    	Object to analyze
 * @param       string 					key 		Key where to position
 * @param       number 					offset 		offset to reposition. -1 for previous, +1 for next
 * @return    	string|null|undefined          		found key, null or undefined if inapplicable
 */
export function adjacentKey(obj, key, offset) {
	if (!obj?.hasOwnProperty) {
		return null;
	}
	const keys = Object.keys(obj);
	return keys[keys.indexOf(key) + offset];
}

/**
 * @summary Find adjacent value to a value in an array, previous or next one
 *
 * @param      	array              		array    	Array to analyse
 * @param       string 					value 		Value where to position
 * @param       number 					offset 		offset to reposition. -1 for previous, +1 for next
 * @return    	string|null|undefined          		found key, null or undefined if inapplicable
 */
export function adjacentArrayValue(arr, value, offset) {
	if (!arr?.indexOf) {
		return null;
	}
	const index = arr.indexOf(value);
	if (index === -1) {
		return null;
	}
	return arr[index + offset];
}
