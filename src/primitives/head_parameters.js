import { warn } from './console.js';

const selector = 'script[data-cpu-audio]';

/**
 * @private
 * @summary Get the global parameters stored in the <head> of the host document, else returns {}
 *
 * @return     {object}  The content of the stored content, else an empty object
 */
export function head_parameters() {
	const tag = document.head.querySelector(selector);
	if (!tag) {
		return {};
	}
	try {
		return JSON.parse(tag.innerHTML);
	} catch {
		warn(`invalid ${selector} parameter tag`);
		return {};
	}
}

export default head_parameters;