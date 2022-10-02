const head = document.head;

export const defaultDataset = {
	get title() {
		for (const domain of ['property="og:title"', 'name="twitter:title"']) {
			const header_element = head.querySelector(`meta[${domain}]`);
			if (header_element) {
				return header_element.content;
			}
		}
		const title = document.title;
		return title === '' ? null : title;
	},
	get poster() {
		for (const attr of ['property="og:image"', 'name="twitter:image:src"']) {
			const header_element = head.querySelector(`meta[${attr}]`);
			if (header_element) {
				return header_element.content;
			}
		}
		return null;
	},
	get canonical() {
		const header_element = head.querySelector('link[rel="canonical"]');
		if (header_element) {
			return header_element.href;
		}
		return location.href.split('#')[0];
	},
	get twitter() {
		const header_element = head.querySelector('meta[name="twitter:creator"]');
		if ((header_element) && (header_element.content.length > 1)) {
			return header_element.content;
		}
		return null;
	},
	playlist : null,
	waveform : null,
	duration : null,
	download : null
};

export default defaultDataset;
