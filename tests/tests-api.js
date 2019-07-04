QUnit.config.autostart = false;


function check_focus() {
	document.body.style.background = document.hasFocus() ? 'white' : 'grey';
}

check_focus();
document.addEventListener('focus', check_focus)
document.addEventListener('blur', check_focus)

if (!document.hasFocus()) {
	alert('Please click on the web view, giving focus, to autorize the audio tag. Else, numerous tests will fail. See issu 17 on our github for details : https://github.com/dascritch/cpu-audio/issues/17 .');
}

window.addEventListener('load', function() {
	QUnit.config.autostart = false;


	let audiotag = document.getElementById('track');
	let cpuaudio_tag = document.getElementsByTagName('cpu-audio')[0];
	/*
	let interfacetag = document.getElementsByTagName('cpu-audio')[0].shadowRoot.querySelector('div');
	let playground = document.getElementById('playground');
	*/

	let cpu = document.CPU;

	function stopPlayer() {
		//audiotag.pause();
		playground.innerHTML = '';
	}


	QUnit.testDone(stopPlayer);
	stopPlayer();

	QUnit.start();

	QUnit.test( "Public API document.CPU default properties values", function( assert ) {
		// those public values are assumed to have a constant name
		let expected = {
			'keymove' : 5,
			'alternate_delay' : 500,
			'fast_factor' : 4,
			'repeat_delay' : 400,
			'repeat_factor' : 100,
			'only_play_one_audiotag' : true,
			'current_audiotag_playing' : null,
			'global_controller' : null,
			'playlists' : {},
			'advance_in_playlist' : true
		};
		for(let key in expected) {
			let expected_prop = document.CPU[key];
			assert.ok(document.CPU[key] !== undefined, `document.CPU.${key} property exists`);
			if (typeof expected_prop === 'object') {
				assert.deepEqual(document.CPU[key], expected_prop, `document.CPU.${key} property instancied at ${expected_prop}`);
			} else {
				assert.equal(document.CPU[key], expected_prop, `document.CPU.${key} property instancied at ${expected_prop}`);
			}
		}
	});

	QUnit.test( "Public API document.CPU maps public methods", function( assert ) {
		// those public values are assumed to have a constant name
		let expected = [
			'is_audiotag_playing',
			'is_audiotag_global',
			'jumpIdAt',
			'seekElementAt',
			'find_interface',
			'find_container',
			'find_current_playlist'
		];
		for(let name of expected) {
			assert.equal(typeof document.CPU[name] , 'function', `document.CPU.${name} method is still a function`);
		}
	});


	QUnit.test( "Public API CpuAudioElement.CPU object properties", function( assert ) {
		assert.ok(cpuaudio_tag.CPU, 'CpuAudioElement.CPU exists');

		// those public values are assumed to have a constant name
		let expected = [
			'element', 
			'elements',
			'audiotag'
		];
		for(let key of expected) {
			let expected_prop = cpuaudio_tag.CPU[key];
			assert.equal(typeof expected_prop, 'object', `CpuAudioElement.CPU.${key} property in an object`);
		}
	});

	QUnit.test( "Public API CpuAudioElement.CPU maps public methods", function( assert ) {
		// those public values are assumed to have a constant name
		let expected = [
			'set_mode_container',
			'set_act_container',
			'set_hide_container',
			'show_throbber_at',
			'hide_throbber',
			'hide_throbber_later',
			'show_interface',
			'build_chapters',
			'build_playlist',
			'add_plane',
			'remove_plane',
			'add_point',
			'remove_point',
			'clear_plane',
			'redraw_all_planes',
			'highlight_point',
			'remove_highlights_points'
		];
		for(let name of expected) {
			assert.equal(typeof cpuaudio_tag.CPU[name] , 'function', `CpuAudioElement.CPU.${name} method is still a function`);
		}
	});


});