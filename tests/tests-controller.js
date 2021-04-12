QUnit.config.autostart = false;

function check_focus() {
	document.body.style.background = document.hasFocus() ? 'white' : 'grey';
}

check_focus();
document.addEventListener('focus', check_focus);
document.addEventListener('blur', check_focus);

if (!document.hasFocus()) {
	alert('Please click on the web view, giving focus, to autorize the audio tag. Else, numerous tests will fail. See issue 17 on our github for details : https://github.com/dascritch/cpu-audio/issues/17 .');
}

function nearlyEqual(value_to_test, value_expected, precision = 1) {
	return ((value_expected - 1) <= value_to_test) && (value_to_test <= ((value_expected + 1)))
}

window.addEventListener('load', function() {
	if (navigator.userAgent === 'puppeteer') {
		// Tests fails on Chrome browszer is this button is not humanly clicked, except in puppeteer /o\
		document.querySelector('#get_focus').click();
	}
});

document.querySelector('#get_focus').addEventListener('click', function() {
	QUnit.config.autostart = false;
	window.location = '#';

	document.getElementById('get_focus').closest('p').remove();

	let controllertag = document.querySelector('cpu-controller');
	let playground = document.getElementById('playground');

	let cpu = document.CPU;

	function stopPlayer() {
		// audiotag.pause();
		playground.innerHTML = '';
	}

	QUnit.testDone(stopPlayer);
	stopPlayer();
	QUnit.start();

	QUnit.test( "CPU-Controller at start without player", function( assert ) {
		const elInterface = controllertag.CPU.shadowId('interface');
		assert.ok(! elInterface.classList.has('no'), `#interface is in "no" class state`);
	});


});