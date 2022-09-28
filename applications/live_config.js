const form_html = document.getElementById('configurator_html');
const form_css = document.getElementById('configurator_css');
const form_paramtag = document.getElementById('configurator_paramtag');
let cpu_audio = document.querySelector('cpu-audio');

function input_changed(element) {
	if (element.type === 'checkbox') {
		return element.checked !== ( element.attributes.checked !== undefined );
	}
	return element.value !== element.attributes.value.value;
}

function configurator_html(event) {
	let cpu_audio_attributes = '';
	let audio_sources = '';
	let has_one_source = false;

	function esc(text) {
		let burn_after_reading = document.createElement('span');
		burn_after_reading.innerText = text;
		let out = burn_after_reading.innerHTML;
		burn_after_reading.remove();
		return out;
	}

	function adjust_attributes_cpu_audio() {
		for (let attr of ['mode', 'title', 'poster', 'waveform', 'canonical', 'duration', 'download', 'twitter']) {
			let value = form_html.querySelector(`[name="meta_${attr}"]`).value;
			if (value) {
				cpu_audio_attributes += ` ${attr}="${esc(value)}"`;
			}
		}
		values_hide = []
		for (let checkbox of Array.from(document.querySelectorAll('[name="meta_hide[]"]'))) {
			if (checkbox.checked) {
				values_hide.push(checkbox.value);
			}
		}
		if (values_hide.length > 0) {
			cpu_audio_attributes += ` hide="${values_hide.join(' ')}"`;
		}
		for (let attr of ['glow']) {
			if (form_html.querySelector(`[name="meta_${attr}"]`).checked) {
				cpu_audio_attributes += ` ${attr}`;
			}
		} 
	}
	function adjust_audio_sources() {
		for (let attr of ['1', '2', '3', 'vtt']) {
			let value = form_html.querySelector(`[name="source_${attr}"]`).value;
			if (value) {
				if (attr === 'vtt') {
					audio_sources += `\n\t\t<track src="${esc(value)}" kind="chapters" default />`;
				} else {
					let kind = form_html.querySelector(`[for="source_${attr}"] select`);
					has_one_source = true;
					audio_sources += `\n\t\t<source src="${esc(value)}" type="${esc(kind.value)}" />`;
				}
			}
		}
	}

	adjust_attributes_cpu_audio();
	adjust_audio_sources();

	if (!has_one_source) {
		// ajouter les erreurs
	}

	let audio_attribs = '';
	if (cpu_audio_attributes.includes(' duration="')) {
		audio_attribs = ' preload="none"';
	}
	if (form_html.querySelector(`[name="is_stream"]`).checked) {
		audio_attribs = ' data-streamed';
	}

	let code = `<cpu-audio${cpu_audio_attributes}>
	<audio controls id="sound"${audio_attribs}>${audio_sources}
\t</audio>
</cpu-audio>`;
	document.getElementById('demo').innerHTML = code;
	document.getElementById('code').innerText = code;
	//cpu_audio = document.querySelector('cpu-audio');
	
	event?.preventDefault();
}

function configurator_css(event) {



	let css = '';
	let attrs = ['font-family', 'inner-shadow' ,'color-transitions','background-transitions', 'line-height'];
	for (let key of ['','error-','playing-','focus-','popup-']) {
		for (let attr of ['color','background']) {
			attrs.push(`${key}${attr}`);
		}
	}

	for (const attr of attrs) {
		const element = form_css.querySelector(`[name="css_${attr}"]`);
		let value = element.value;
		if ((input_changed(element)) && (value !== '')) {

			// duration need unit
			if (['color-transitions', 'background-transitions'].includes(attr)) {
				value = value +'s';
			}

			css += `\n\t--cpu-${attr} : ${value};`;
		}
	}

	if (css !== '') {
		css = `body {\n${css}\n}`;
	}

	for (const level of ['0', '1', '2']) {
		let rules_breakpoint = '';
		for (let attr of ['elapse-width', 'font-size', 'font-small-size', 'height']) {
			const element = form_css.querySelector(`[name="css_${attr}[${level}]"]`);
			const { value } = element;
			if ((input_changed(element)) && (value !== '')) {
				rules_breakpoint += `\n\t\t--cpu-${attr} : ${value};`;
			}
		}

		if (rules_breakpoint !== '') {
			if (level === '0') {
				css += `\n\nbody, #interface {\n${rules_breakpoint}\n}`;
			} else {
				let max_width = form_css.querySelector(`[name="css_breakpoint[${level}]"]`).value;
				if (max_width !== '') {
					css += `\n\n@media (max-width: ${max_width}) , @element #interface and (max-width: ${max_width}) {\n\tbody, #interface {${rules_breakpoint}\n\t}\n} `;
				}
			}
		}
	}

	document.getElementById('style').innerHTML = css;
	
	event?.preventDefault();
}

function configurator_paramtag(event) {
	let attrs_values = ['scrollTo', 'autoplay', 'keymove', 'playStopOthers', 'alternateDelay', 'fastFactor', 'repeatDelay', 'repeatFactor', 'advanceInPlaylist'];
	let out = {};
	let mutated = false;
	for (const attr of attrs_values) {
		const element = form_paramtag.querySelector(`[name="global_${attr}"]`);
		let { value } = element;
		if ((input_changed(element)) && (value !== '')) {
			if (element.type.toLowerCase() === 'number') {
				value = Number(value);
			}
			if (['true', 'false'].indexOf(value) > -1) {
				value = (element.checked || value === 'false');
			}
			out[attr] = value;
			document.CPU[attr] = value;
			mutated = true;
		}
	}
	document.querySelector('#generated_paramtag pre').innerText = mutated ? `<script type="application/json" data-cpu-audio>\n\t${JSON.stringify(out, 4)}\n</script>` : '';
	event?.preventDefault();
}

function noop(event) {
	document.location.hash = '#' + event.target.action.split('#')[1];
	event.preventDefault();
}

function reset(event) {
	const event_change = new Event('change');
	setTimeout( () => event.target.dispatchEvent(event_change), 100);
}

document.addEventListener('CPU_ready', () => {
	cpu_audio = document.querySelector('cpu-audio');	
});

document.addEventListener('DOMContentLoaded', function(){
	for (const event of ['input', 'change']) {
		form_html.addEventListener(event, configurator_html);
		form_css.addEventListener(event, configurator_css);
		form_paramtag.addEventListener(event, configurator_paramtag);
	}
	for (const form_element of [form_html, form_css, form_paramtag]) {
		form_element.addEventListener('reset', reset);
		form_element.addEventListener('submit', noop);		
	}
	configurator_html();
	configurator_paramtag();
	document.location.hash = '#'+form_html.id; 

	let in_error = false;
	function leave_in_error_mode() {
		if (in_error) {
			cpu_audio.CPU.show('main');
			cpu_audio.CPU.shadowId('pageerror').innerText = '';
			in_error = false;
		}
	}

	document.querySelector('#do_fine').addEventListener('click', function() {
		leave_in_error_mode();
		cpu_audio.CPU.showHandheldNav();
	});
	document.querySelector('#do_waiting').addEventListener('click', function() {
		leave_in_error_mode();
		cpu_audio.CPU.audiotag.pause();
		document.CPU.hadPlayed = true;
		cpu_audio.CPU.setAct('loading');
	});
	document.querySelector('#do_glow').addEventListener('click', function() {
		leave_in_error_mode();
		cpu_audio.CPU.audiotag.pause();
		cpu_audio.CPU.setAct('glow');
	});	
	document.querySelector('#do_error').addEventListener('click', function() {
		if (!in_error) {
			cpu_audio.CPU.show('error');
			cpu_audio.CPU.shadowId('pageerror').innerText = 'This is an error message.';
			in_error = true;
		} else {
			leave_in_error_mode();
		}
	});
}, false);

