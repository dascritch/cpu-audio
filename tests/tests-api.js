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

document.addEventListener('CPU_ready', function() {
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
			'alternateDelay' : 500,
			'fastFactor' : 4,
			'repeatDelay' : 400,
			'repeatFactor' : 100,
			'playStopOthers' : true,
			'currentAudiotagPlaying' : null,
			'globalController' : null,
			'playlists' : {},
			'advanceInPlaylist' : true
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
			'isAudiotagPlaying',
			'isAudiotagGlobal',
			'jumpIdAt',
			'seekElementAt',
			'findCPU',
			'currentPlaylist',
			'adjacentKey'
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
			'setMode',
			'setAct',
			'setHideContainer',
			'showThrobberAt',
			'hideThrobber',
			'hideThrobberLater',
			'showInterface',
			'addPlane',
			'removePlane',
			'addPoint',
			'point',
			'bulkPoints',
			'editPoint',
			'focusPoint',
			'focused',
			'focusedId',
			'removePoint',
			'clearPlane',
			'redrawAllPlanes',
			'highlightPoint',
			'removeHighlightsPoints',
			'injectCss',
			'removeCss'
		];
		for(let name of expected) {
			assert.equal(typeof cpuaudio_tag.CPU[name] , 'function', `CpuAudioElement.CPU.${name} method is still a function`);
		}
	});

	QUnit.test( "Check CPU_ custom events", function( assert ) {
		let was_done_CPU_drawPoint = false;
		let was_done_CPU_addPoint = false;
		let was_done_CPU_editPoint = false;
		let was_done_CPU_removePoint = false;
		let done = assert.async();
		document.addEventListener('CPU_drawPoint',(e) => {
			was_done_CPU_drawPoint = true;
		});
		document.addEventListener('CPU_addPoint',(e) => {
			was_done_CPU_addPoint = true;
		});
		document.addEventListener('CPU_editPoint',(e) => {
			was_done_CPU_editPoint = true;
		});
		document.addEventListener('CPU_removePoint',(e) => {
			was_done_CPU_removePoint = true;
			done();
		});

		cpuaudio_tag.CPU.addPlane('testplane');
		cpuaudio_tag.CPU.addPoint('testplane','testpoint', {start : 0});
		cpuaudio_tag.CPU.editPoint('testplane','testpoint', {});
		cpuaudio_tag.CPU.removePoint('testplane','testpoint');

		assert.ok(true,'CPU_ready (was tested to instanciate those tests)');
		assert.ok(was_done_CPU_drawPoint,'CPU_drawPoint');
		assert.ok(was_done_CPU_addPoint,'CPU_addPoint');
		assert.ok(was_done_CPU_editPoint,'CPU_editPoint');
		assert.ok(was_done_CPU_removePoint,'CPU_removePoint');
		// missing : CPU_chapterChanged
	});

	QUnit.test( "test document.CPU.adjacentKey utility", function(assert) {
		const object_test = { a:1, b:2, c:3 };
		assert.equal(document.CPU.adjacentKey(null, '', -1), null, 'inexisting object gives a null');
		assert.equal(document.CPU.adjacentKey(5, '', -1), null, 'not an object gives a null');
		assert.equal(document.CPU.adjacentKey(object_test, 'inexist', -1), null, 'inexisting key in object gives a null');
		assert.equal(document.CPU.adjacentKey(object_test, 'a', -1), undefined, 'adjacentKey as previousKey,  if pointed key is at start, gives undefined');
		assert.equal(document.CPU.adjacentKey(object_test, 'b', -1), 'a', 'adjacentKey as previousKey,  returns an existing previous key in object');
		assert.equal(document.CPU.adjacentKey(object_test, 'c', 1), undefined, 'adjacentKey as nextKey,  if pointed key is at end, gives undefined');
		assert.equal(document.CPU.adjacentKey(object_test, 'b', 1), 'c', 'adjacentKey as nextKey,  returns an existing next key in object');
	});

});