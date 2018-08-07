window.addEventListener('WebComponentsReady', function() {

	window.location = '#';
	var lock = false;
	var lockedAt = 0;
	var audiotag = document.getElementById('track');

	function stopPlayer() {
		window.location = '#';
		audiotag.pause();
		lock = false;
	}

	QUnit.testDone(stopPlayer);


});