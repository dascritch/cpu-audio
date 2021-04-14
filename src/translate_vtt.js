import {escapeHtml} from './utils.js';

const acceptables_tags = {
	i     : 'i',
	em    : 'em', 	// (not in the standard but used in legacy CPU.pm show)
	b     : 'b',
	bold  : 'strong', // (declared in the MDN page, but never seen it in standard pages)
	u     : 'u',
	lang  : 'i' 		// emphasis for typographic convention
};

/**
 *
 * NEVER EVER BELIEVE you can parse HTML with regexes ! This function works because we just do minimalistic changes
 * By the way, regexes are really time consuming, both for you and your computer.
 * And, sincerely, I love playing on https://regexcrossword.com/
 */

// regexes used for WebVTT tag validation
const vtt_opentag = /<(\w+)(\.[^>]+)?( [^>]+)?>/gi;
const vtt_closetag = /<\/(\w+)( [^>]*)?>/gi;
const vtt_cr = /\n/gi;

/**
 * Checks if a WebVTT candidate tag name is acceptable or not
 *
 * @param      {string}  name    Tag name
 * @return     {boolean}  not accepted (inverted logic)
 */
function not_acceptable_tag(name) {
	return !(name in acceptables_tags);
}

/**
 * @param      {string}   		   tag 			Unused regex capture
 * @param      {string}   		   name 		Name of the tag
 * @param      {string}   		   class_name 	attribute key, unused
 * @param      {string}   		   attribute 	attribute value, may be language code
 * @return     {string}
 */
function opentag(tag, name, class_name, attribute) {
	name = name.toLowerCase();
	if (not_acceptable_tag(name)) {
		return '';
	}
	let $_attr = '';
	if (name == 'lang') {
		$_attr = ` lang="${attribute.trim()}"`;
	}
	return `<${acceptables_tags[name]}${$_attr}>`;
}

/**
 * @param      {string}   		   tag 			Unused regex capture
 * @param      {string}   		   name 		Name of the tag
 * @return     {string}
 */
function closetag(tag, name) {
	name = name.toLowerCase();
	if (not_acceptable_tag(name)) {
		return '';
	}
	return `</${acceptables_tags[name]}>`;
}

/**
 * @summary Transform WebVTT tag langage into HTML tags, filtering out some
 * (needed @public mainly for tests. Moving it up and do those tests in CLI will make it @private-izable)
 *
 * @param      {string}            vtt_taged  The vtt tagged
 * @return     string                         HTML tagged string
 */
export function translateVTT(vtt_taged) {

	if ((vtt_taged.split('<').length) !== (vtt_taged.split('>').length)) {
		// unmatching < and >, probably badly written tags, or in full text
		// unsurprisingly, (vtt_taged.split('<').length) is a lot faster than using regex. JS needs a standard property for counting substring occurences in a string
		return escapeHtml(vtt_taged);
	}

	return vtt_taged.
			replace(vtt_opentag, opentag).
			replace(vtt_closetag, closetag).
			replace(vtt_cr, '<br/>');
}
