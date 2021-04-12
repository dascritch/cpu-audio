QUnit.config.autostart = false;

function check_focus() {
	document.body.style.background = document.hasFocus() ? 'white' : 'grey';
}

check_focus();
document.addEventListener('focus', check_focus);
document.addEventListener('blur', check_focus);


function nearlyEqual(value_to_test, value_expected, precision = 1) {
	return ((value_expected - 1) <= value_to_test) && (value_to_test <= ((value_expected + 1)))
}

window.addEventListener('load', function() {
	QUnit.config.autostart = false;
	window.location = '#';

	document.getElementById('get_focus').closest('p').remove();

	const controllertag = document.querySelector('cpu-controller');
	const elInterface = controllertag.CPU.shadowId('interface');
	const playground = document.getElementById('playground');

	const cpu = document.CPU;

	function stopPlayer() {
		// audiotag.pause();
		playground.innerHTML = '';
	}

	QUnit.testDone(stopPlayer);
	stopPlayer();
	QUnit.start();

	
	QUnit.test( "CPU-Controller at start without player", function( assert ) {
		assert.ok(elInterface.classList.contains('no'), `#interface is in "no" class state`);
		assert.equal(controllertag.CPU.audiotag, null, 'audiotag is null');
		assert.deepEqual(controllertag.CPU.planeNames(), [], 'planeNames() should return an empty array');
	});

	QUnit.test( "Inserting a CPU-Audio made it replicated in the controller", function( assert ) {
		playground.innerHTML = `<cpu-audio title="Hello">
									<audio muted controls src="../tests-assets/blank.mp3">
								</audio>
							</cpu-audio>`;
		let player_element = playground.querySelector('cpu-audio');
		assert.ok(!elInterface.classList.contains('no'), `controller #interface doesn't have "no" class anymore`);
	});	

	// TODO : untitled audiotag in playlist should display "untitled" in <em>

});