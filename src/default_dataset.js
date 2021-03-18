export const default_dataset = {
	get title() {
		for (let domain of ['og', 'twitter']) {
			let header_element = document.querySelector(`meta[property="${domain}:title"]`);
			if (header_element !== null) {
				return header_element.content;
			}
		}
		let title = document.title;
		return title === '' ? null : title;
	},
	get poster() {
		for (let attr of ['property="og:image"', 'name="twitter:image:src"']) {
			let header_element = document.querySelector(`meta[${attr}]`);
			if (header_element !== null) {
				return header_element.content;
			}
		}
		return null;
	},
	get canonical() {
		let header_element = document.querySelector('link[rel="canonical"]');
		if (header_element !== null) {
			return header_element.href;
		}
		return location.href.split('#')[0];
	},
	get twitter() {
		let header_element = document.querySelector('meta[name="twitter:creator"]');
		if ((header_element !== null) && (header_element.content.length>1)) {
			return header_element.content;
		}
		return null;
	},
	playlist : null,
	waveform : null,
	duration : null,
	download : null
};