const convert = {
	units : {
		'd' : 86400,
		'h' : 3600,
		'm' : 60,
		's' : 1
	},
	_is_only_numeric : /^\d+$/,
	_any_not_numeric : /\D*/g,


	/**
	 * @brief convert a string empty, with a number, with a colon-coded or an
	 * human-coded timecode in seconds
	 *
	 * @public
	 *
	 * @class      TimeInSeconds (name)
	 * @param      {string}  givenTime  The given time
	 * @return     {number}  time in seconds
	 */
	'TimeInSeconds' : function(givenTime) {
		let seconds = 0;
		if (givenTime !== '') {
			if (convert._is_only_numeric.test(givenTime)) {
				seconds = Number(givenTime);
			} else {
				seconds = (givenTime.indexOf(':') === -1) ? 
					this.SubunitTimeInSeconds(givenTime) : 
					this.ColonTimeInSeconds(givenTime) ;
			}
		}
		return seconds;
	},

	/**
	 * @brief convert a human-coded (`1h2m3s`) time in seconds
	 *
	 * @public
	 *
	 * @class      SubunitTimeInSeconds (name)
	 * @param      {string}  givenTime  The given time
	 * @return     {number}  seconds
	 */
	'SubunitTimeInSeconds' : function(givenTime) {
		let seconds = 0;
		for(let key in convert.units) {
			if ( (convert.units.hasOwnProperty(key)) && (givenTime.indexOf(key) !== -1) ) {
				let atoms = givenTime.split(key);
				seconds += Number(atoms[0].replace(convert._any_not_numeric,'' )) * convert.units[key];
				givenTime = atoms[1];
			}
		}
		return seconds;
	},

	/**
	 * @brief convert a colon-coded (`01:02:03`) time in seconds 
	 *
	 * @public
	 * 
	 * @class      ColonTimeInSeconds (name)
	 * @param      {string}             givenTime  The given time
	 * @return     {number}  { seconds }
	 */
	'ColonTimeInSeconds' : function(givenTime) {
		let seconds = 0;
		let atoms = givenTime.split(':');
		let convert = [1, 60, 3600, 86400];
		for (let pos = 0 ; pos < atoms.length ; pos++) {
			seconds += Number(atoms[pos]) * convert[((atoms.length-1) - pos)];
		}
		return seconds;
	},

	/**
	 * @brief convert a time in seconds in a human-coded time (`1h2m3s`). Zero is `0s`.
	 * 
	 * @public
	 *
	 * @class      SecondsInTime (name)
	 * @param      {number}   givenSeconds  The given seconds
	 * @return     {string}  { description_of_the_return_value }
	 */
	'SecondsInTime' : function(givenSeconds) {
		let converted = '';
		let inned = false;
		for(let key in convert.units) {
			if (convert.units.hasOwnProperty(key)) {
				let multiply = convert.units[key];
				if ((givenSeconds >= multiply) || (inned)) {
					inned = true;
					let digits = Math.floor(givenSeconds / multiply);
					converted += digits + key;
					givenSeconds -= digits * multiply;
				}
			}
		}
		return converted === '' ? '0s' : converted;
	},

	/**
	 * @brief convert a time in seconds in a colon-coded time (`1:02:03s`). Zero
	 * is `0:00`.
	 *
	 * @public
	 *
	 * @class      SecondsInColonTime (name)
	 * @param      {number}            givenSeconds  The given seconds
	 * @return     {boolean|string}  { description_of_the_return_value }
	 */
	'SecondsInColonTime' : function(givenSeconds) {
		let converted = '';
		let inned = false;
		for (let key in convert.units) {
			if (convert.units.hasOwnProperty(key)) {
				let multiply = convert.units[key];
				if ((givenSeconds >= multiply) || (inned)) {
					inned = true;
					let digits = Math.floor(givenSeconds / multiply);
					converted += (converted === '' ? '' : ':');
					converted += ( ((digits<10) && (converted !== '')) ? '0' : '') + digits ;
					givenSeconds -= digits * multiply;
				}
			}
		}
		if (converted.length === 1) {
			// between 0 and 9 seconds
			return '0:0' + converted;
		}
		if (converted.length === 2) {
			// between 10 and 59 seconds
			return '0:' + converted;
		} 
		
		return converted === '' ? '0:00' : converted;
	},

	/**
	 * @brief same as `SecondsInColonTime`, but suited for `<input type="time"
	 * />`. Zero is `00:00:00`.
	 *
	 * @public
	 *
	 * @class      SecondsInPaddledColonTime (name)
	 * @param      {number}  givenSeconds  The given seconds
	 * @return     {string}  { description_of_the_return_value }
	 */
	'SecondsInPaddledColonTime' : function(givenSeconds) {
		// principaly needed by <input type="time"> whom needs a really precise HH:MM:SS format
		let colon_time = convert.SecondsInColonTime(givenSeconds);
		return '00:00:00'.substr(0, 8 - colon_time.length ) + colon_time; 
	}
}