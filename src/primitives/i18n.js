import fr from '../locales/fr.js';
import en from '../locales/en.js';

const sources_i18n = {
	fr, en
};

/**
 * @summary Guess usable language (returned in ISO 2 letters code) from browser preferences and host page mark-up
 * @private
 * 
 */
function guess_preferable_language() {
	// First, we'll try to guess the hosting page language
	const out = document.querySelector('html').lang;
	if ((out.length) && (out.toLowerCase() in sources_i18n)) {
		return out;
	}

	// trying to find the browser preferences
	const languages = window.navigator.languages ?? [(navigator.language || navigator.browserLanguage)];
	for (const line of languages) {
		if (line.split) {
			// we will only look (yes, this is bad) at the first level xx of any locale xx-YY code
			const [code] = line.split('-');
			if (code in sources_i18n) {
				// we still don't have a locale selected and this one is in our register, we can use it
				return code;
			}
		}
	}

	// Inexisting ? We will use english in last resort	
	return 'en';
}

export let prefered_language = guess_preferable_language();
export const __ = sources_i18n[prefered_language];
export default __;
