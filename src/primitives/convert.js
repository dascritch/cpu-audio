const units_scale = {
	d : 86400,
	h : 3600,
	m : 60,
	s : 1
};
const scale = [1, 60, 3600, 86400]; 

const _is_only_numeric = /^\d+$/;
const _any_not_numeric = /\D*/g;

// How Inifity (streamed live media with unspecified duration) should be humanly expressed
const Infinity_representation = '?';

/**
 * @summary convert a string empty, with a number, with a colon-coded or an human-coded timecode in seconds
 * @public
 *
 * @class      timeInSeconds (name)
 * @param      {string}  givenTime  The given time
 * @return     {number}  time in seconds
 */
export const timeInSeconds = (givenTime) => {
	let seconds = 0;
	if (givenTime !== '') {
		if (_is_only_numeric.test(givenTime)) {
			seconds = Number(givenTime);
		} else {
			seconds = givenTime.includes(':') ?
				convert.colontimeInSeconds(givenTime) :
				convert.subunittimeInSeconds(givenTime) ;
		}
	}
	return seconds;
};

/**
 * @summary convert a human-coded (`1h2m3s`) time in seconds
 * @public
 *
 * @class      subunittimeInSeconds (name)
 * @param      {string}  givenTime  The given time
 * @return     {number}  seconds
 */
export const subunittimeInSeconds = (givenTime) => {
	let seconds = 0;
	let atom;
	for(const key in units_scale) {
		if ( (units_scale.hasOwnProperty(key)) && (givenTime.includes(key)) ) {
			[atom, givenTime] = givenTime.split(key);
			seconds += Number(atom.replace(_any_not_numeric,'' )) * units_scale[key];
		}
	}
	return seconds;
};

/**
 * @summary    convert a colon-coded (`01:02:03`) time in seconds
 * @public
 *
 * @class      colontimeInSeconds (name)
 * @param      {string}  givenTime  The given time
 * @return     {number}  Time in seconds
 */
export const colontimeInSeconds = (givenTime) => {
	let seconds = 0;
	const atoms = givenTime.split(':');
	for (let pos = 0 ; pos < atoms.length ; pos++) {
		seconds += Number(atoms[pos]) * scale[((atoms.length-1) - pos)];
	}
	return seconds;
};

/**
 * @summary convert a time in seconds in a human-coded time (`1h2m3s`). Zero is `0s`.
 * @public
 *
 * @class      secondsInTime (name)
 * @param      {number}   givenSeconds  The given seconds
 * @return     {string}   Converted time
 */
export const secondsInTime = (givenSeconds) => {
	if (givenSeconds === Infinity) {
		return Infinity_representation;
	}
	let converted = '';
	let inned = false;
	for (const key in units_scale) {
		if (units_scale.hasOwnProperty(key)) {
			const multiply = units_scale[key];
			if ((givenSeconds >= multiply) || (inned)) {
				inned = true;
				const digits = Math.floor(givenSeconds / multiply);
				converted += digits + key;
				givenSeconds -= digits * multiply;
			}
		}
	}
	return converted === '' ? '0s' : converted;
};

/**
 * @summary    convert a time in seconds in a colon-coded time (`1:02:03s`). Zero is `0:00`.
 * @public
 *
 * @class      secondsInColonTime (name)
 * @param      {number}          givenSeconds  The given seconds
 * @return     {string}  Converted time
 */
export const secondsInColonTime = (givenSeconds) => {
	if (givenSeconds === Infinity) {
		return Infinity_representation;
	}
	let converted = '';
	let inned = false;
	for (const key in units_scale) {
		if (units_scale.hasOwnProperty(key)) {
			const multiply = units_scale[key];
			if ((givenSeconds >= multiply) || (inned)) {
				inned = true;
				const digits = Math.floor(givenSeconds / multiply);
				converted += (converted === '' ? '' : ':');
				converted += ( ((digits<10) && (converted !== '')) ? '0' : '') + digits ;
				givenSeconds -= digits * multiply;
			}
		}
	}
	if (converted.length === 1) {
		// between 0 and 9 seconds
		return `0:0${converted}`;
	}
	if (converted.length === 2) {
		// between 10 and 59 seconds
		return `0:${converted}`;
	}

	return converted === '' ? '0:00' : converted;
};

/**
 * @summary same as `secondsInColonTime`, but suited for `<input type="time"
 * />`. Zero is `00:00:00`.
 *
 * @public
 *
 * @class      secondsInPaddledColonTime (name)
 * @param      {number}  givenSeconds  The given seconds
 * @return     {string}  Converted time
 */
export const secondsInPaddledColonTime = (givenSeconds) => {
	if (givenSeconds === Infinity) {
		return Infinity_representation;
	}
	// principaly needed by <input type="time"> whom needs a really precise HH:MM:SS format
	const colon_time = convert.secondsInColonTime(givenSeconds);
	return '00:00:00'.substr(0, 8 - colon_time.length ) + colon_time;
};

/**
 * @summary convert a duration in an ISO 8601 string suitable for `datetime=""` attribute in <time>
 * See spec in https://www.w3.org/TR/html51/infrastructure.html#durations
 * @public
 *
 * @class      durationIso (name)
 * @param      {number}  givenSeconds  Duration, in seconds
 * @return     {string}  Converted duration
 */
export const durationIso = (givenSeconds) => {
	return `P${convert.secondsInTime(givenSeconds).toUpperCase()}`;
};

export const convert = {
	timeInSeconds,
	subunittimeInSeconds,
	colontimeInSeconds,
	secondsInTime,
	secondsInColonTime,
	secondsInPaddledColonTime,
	durationIso
};

export default convert;

