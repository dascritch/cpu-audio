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

/*
	let audiotag = document.getElementById('track');
	let interfacetag = document.getElementsByTagName('cpu-audio')[0].shadowRoot.querySelector('div');
	let playground = document.getElementById('playground');
	audiotag.volume = 0;
*/

	let cpu = document.CPU;

	function stopPlayer() {
		//audiotag.pause();
		playground.innerHTML = '';
	}
`
	<cpu-audio mode="hidden">
		<audio id="track" controls="controls"  preload="auto" muted="muted">
			<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
		</audio>
	</cpu-audio>

`



	QUnit.testDone(stopPlayer);
	stopPlayer();

	QUnit.start();

	QUnit.test( "Public API document.CPU default properties values", function( assert ) {
		// those public values are assumed to have a constant name
		let expected = {
		    'keymove' : 5,
		    'only_play_one_audiotag' : true,
		    'current_audiotag_playing' : null,
		    'global_controller' : null,
		    'playlists' : {},
		    'advance_in_playlist' : true
		};
		console.log(assert)
		for(let key in expected) {
			let expected_prop = document.CPU[key];
			if (typeof expected_prop === 'object') {
				assert.deepEqual(document.CPU[key], expected_prop, `document.CPU.${key} property instancied at ${expected_prop}`);
			} else {
				assert.equal(document.CPU[key], expected_prop, `document.CPU.${key} property instancied at ${expected_prop}`);
			}
		}
	});



});