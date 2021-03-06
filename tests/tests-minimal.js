QUnit.config.autostart = false;


function check_focus() {
	document.body.style.background = document.hasFocus() ? 'white' : 'grey';
}

check_focus();
document.addEventListener('focus', check_focus)
document.addEventListener('blur', check_focus)

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

	let cpu = document.CPU;
	let convert = cpu.convert;
	let audiotag = document.getElementById('track');
	let playground = document.getElementById('playground');

	function stopPlayer() {
		audiotag.pause();
		playground.innerHTML = '';
	}

	QUnit.testDone(stopPlayer);

	// before starting the tests, I must be assured the browser autorise playing
	// see https://bugzilla.mozilla.org/show_bug.cgi?id=1476853 and https://developers.google.com/web/updates/2017/09/autoplay-policy-changes

	QUnit.start();

	QUnit.test( "hello CPU API", function( assert ) {
		assert.equal( typeof document.CPU, "object", "Passed!" );
		assert.ok(audiotag.paused, 'paused by defaults' );
	});


	QUnit.test( "document.CPU.convert.timeInSeconds", function( assert ) {
		assert.equal(convert.timeInSeconds(''), 0, 'empty string' );
		assert.equal(convert.timeInSeconds(0), 0, 'got zero' );
		assert.equal(convert.timeInSeconds('1'), 1, 'got one' );
		assert.equal(convert.timeInSeconds('1s'), 1, 'got one second' );
		assert.equal(convert.timeInSeconds('20s'), 20, 'got twenty seconds' );
		assert.equal(convert.timeInSeconds('1m'), 60, 'got one minute' );
		assert.equal(convert.timeInSeconds('1m1s'), 61, 'got one minute and one second' );
		assert.equal(convert.timeInSeconds('2h4m2s'), 7442, 'got 2 hours, 4 minutes and 2 seconds' );
	});

	QUnit.test( "document.CPU.convert.colontimeInSeconds", function( assert ) {
		assert.equal(convert.colontimeInSeconds('0:01'), 1, 'got one second' );
		assert.equal(convert.colontimeInSeconds('1:34'), 94, 'got one minute and 34 seconds' );
		assert.equal(convert.colontimeInSeconds('2:01:34'), 7294, 'got two hours, one minute and 34 seconds' );
		assert.equal(convert.colontimeInSeconds('1:02:01:34'), (7294 + 86400), 'got one day, two hours, one minute and 34 seconds' );
	});

	QUnit.test( "document.CPU.convert.secondsInTime", function( assert ) {
		assert.equal(convert.secondsInTime(0), '0s', 'got zero' );
		assert.equal(convert.secondsInTime(1), '1s', 'got one' );
		assert.equal(convert.secondsInTime(20), '20s', 'got twenty seconds' );
		assert.equal(convert.secondsInTime(60), '1m0s', 'got one minute' );
		assert.equal(convert.secondsInTime(61), '1m1s', 'got one minute and one second' );
		assert.equal(convert.secondsInTime(7442), '2h4m2s', 'got 2 hours, 4 minutes and 2 seconds' );
		assert.equal(convert.secondsInTime(Infinity), '?', `Infinity got “?”` );
	});

	QUnit.test( "document.CPU.convert.secondsInColonTime", function( assert ) {
		assert.equal(convert.secondsInColonTime(0), '0:00', 'got 0:00' );
		assert.equal(convert.secondsInColonTime(1), '0:01', 'got 0:01' );
		assert.equal(convert.secondsInColonTime(20), '0:20', 'got 0:20' );
		assert.equal(convert.secondsInColonTime(60), '1:00', 'got 1:00' );
		assert.equal(convert.secondsInColonTime(61), '1:01', 'got 1:01' );
		assert.equal(convert.secondsInColonTime(130), '2:10', 'got 2:10' );
		assert.equal(convert.secondsInColonTime(7442), '2:04:02', 'got 2:04:02' );
		assert.equal(convert.secondsInColonTime(Infinity), '?', `Infinity got “?”` );
	});

	QUnit.test( "document.CPU.convert.secondsInPaddledColonTime", function( assert ) {
		assert.equal(convert.secondsInPaddledColonTime(61), '00:01:01', 'got 00:01:01' );
		assert.equal(convert.secondsInPaddledColonTime(7442), '02:04:02', 'got 02:04:02' );
		assert.equal(convert.secondsInPaddledColonTime(Infinity), '?', `Infinity got convert.Infinity aka “?”` );
	});
	
	QUnit.test( "document.CPU.convert.durationIso", function( assert ) {
		assert.equal(convert.durationIso(61), 'P1M1S', 'got P1M1S' );
		assert.equal(convert.durationIso(7442), 'P2H4M2S', 'got P2H4M2S' );
	});

	QUnit.test( "document.CPU.jumpIdAt existing at start", function( assert ) {
		assert.expect( 2 );
		let done = assert.async();
		cpu.jumpIdAt('track', 0, function() {
			assert.ok(nearlyEqual(audiotag.currentTime, 0, 0.1), 'is at start' );
			assert.ok(!audiotag.paused, 'not paused afterwards' );
			done();
		});
	});

	QUnit.test( "document.CPU.jumpIdAt existing at 60 secs", function( assert ) {
		assert.expect( 1 );
		let done = assert.async();
		cpu.jumpIdAt('track', 60, function() {
			assert.equal(audiotag.currentTime, 60, 'is at 1mn' );
			done();
		});
	});

	QUnit.test( "document.CPU.jumpIdAt unnamed at 30 secs", function( assert ) {
		assert.expect( 1 );
		let done = assert.async();
		cpu.jumpIdAt('', 30, function() {
			assert.equal(audiotag.currentTime, 30, 'is at 30s' );
			done();
		});
	});

	function hashOrder_test(expected_string, hash , expected_time)
	{
		QUnit.test( `document.CPU.trigger.hashOrder ${expected_string} at ${audiotag.currentTime} expected near ${expected_time}`, function( assert ) {
			assert.expect( 1 );
			let done = assert.async();
			cpu.trigger.hashOrder(hash, function() {
				assert.ok(nearlyEqual( audiotag.currentTime, expected_time), expected_string);
				done();
			});
		});
	}
	hashOrder_test('is at start if empty', 'track&t=', 0);
	hashOrder_test('is at 10 seconds', 'track&t=10', 10);
	hashOrder_test('is at one minute and 2 seconds', 'track&t=1m2s', 62);
	hashOrder_test('unnammed track is at 40 seconds', 't=40', 40);
	hashOrder_test('unnammed track is at 20 seconds', 't=20s', 20);
	hashOrder_test('track is at 00:01:42', 'track&t=00:01:42', 102);
	hashOrder_test('unnamed track is at 1:02', '&t=1:02', 62);

	QUnit.test( "hashOrder starts,end , same notation", function (assert){
		assert.expect( 2 );
		let done = assert.async();
		cpu.trigger.hashOrder('track&t=0:20,0:30', function() {
			assert.ok(nearlyEqual( audiotag.currentTime , 20), 'starts at 20 seconds');
			assert.equal(cpu.trigger._end(), 30, 'ends at 30 seconds');
			done();
		});
	});

	
	QUnit.test( "hashOrder starts,end , mixed notation", function (assert){
		assert.expect( 2 );
		let done = assert.async();
		cpu.trigger.hashOrder('track&t=0:10,20', function() {
			assert.equal(audiotag.currentTime , 10, 'starts at 10 seconds');
			assert.equal(cpu.trigger._end(), 20, 'ends at 20 seconds');
			done();
		});
	});

	QUnit.test( "hashOrder ,end ", function (assert){
		assert.expect( 2 );
		let done = assert.async();
		cpu.trigger.hashOrder('track&t=,20', function() {
			assert.equal(audiotag.currentTime, 0, 'starts at 0 second');
			assert.equal(cpu.trigger._end(), 20, 'ends at 20 seconds');
			done();
		});
	});

	QUnit.test( "hashOrder start, ", function (assert){
		assert.expect( 2 );
		let done = assert.async();
		cpu.trigger.hashOrder('track&t=20,', function() {
			assert.ok(nearlyEqual(audiotag.currentTime, 20, 0.1), 'starts at 0 second');
			assert.equal(cpu.trigger._end(), false, 'natural end');
			done();
		});
	});

	QUnit.test( "hashOrder end,start ", function (assert){
		assert.expect( 2 );
		let done = assert.async();
		cpu.trigger.hashOrder('track&t=20,10', function() {
			assert.ok(nearlyEqual(audiotag.currentTime, 20, 0.1), 'starts at 0 second');
			assert.equal(cpu.trigger._end(), false, 'ignored end');
			done();
		});
	});


	QUnit.test( "hashOrder start,end with erroneous entries ", function (assert){
		assert.expect( 2 );
		let done = assert.async();
		cpu.trigger.hashOrder('track&t=a1r,\v0', function() {
			assert.equal(audiotag.currentTime, 0, 'starts at 0 second');
			assert.ok(cpu.trigger._end() === false, 'natural end');
			done();
		});
	});

	QUnit.test( "end timecode stops the play", function( assert ) {
		let done = assert.async();
		assert.expect(1);
		audiotag.play();

		function check_only_one_play() {
			assert.ok(audiotag.paused, 'Player should have been paused');
			done();
		}
		cpu.trigger.hashOrder('track&t=20,21', function() {
			setTimeout(check_only_one_play, 1500);
		});
	});


	QUnit.test( "no cacophony feature : mute other player when another one starts to play", function( assert ) {
		let done = assert.async();
		assert.expect(2);
		audiotag.play();
		// Dynamic add a second audio player
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted="muted">
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		secondary_audiotag.volume = 0;

		function check_only_one_play() {
			assert.ok(! secondary_audiotag.paused, 'Second player should continue to play');
			assert.ok(audiotag.paused, 'First player should have been paused');
			done();
		}
		setTimeout( check_only_one_play, 100);
		secondary_audiotag.play();
	});

	// Try trigger.hashOrder({ at_start : true }); with hash link
	QUnit.test( "Startup page with a hash link and without localStorage still played", function(assert) {
		let done = assert.async();
		assert.expect(1);
		// assert.expect(3);
		playground.innerHTML = `
			<cpu-audio>
				<audio id="secondary" controls="controls" muted="muted">
					<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		secondary_audiotag.volume = 0;
		localStorage.clear();
		function check_onstart() {
			// won't work because missing querySelectorDo('audio[controls]', CPU_Audio.recall_audiotag);
			// assert.ok(! secondary_audiotag.paused, 'Second player should have started');
			// assert.ok(audiotag.paused, 'First player should be paused');
			assert.ok(nearlyEqual(secondary_audiotag.currentTime, 10), 'Second player should be at 10s');
			window.location = '#';
			// restore hashchange event
			window.addEventListener('hashchange', cpu.trigger.hashOrder, false);
			done();
		}
		// désactiver provisoirement le hashchange event
		window.removeEventListener('hashchange', cpu.trigger.hashOrder);
		window.location = '#secondary&t=10';
		cpu.trigger.hashOrder({ at_start : true }, check_onstart);
	});

/*	Need a correct review

	// Try trigger.hashOrder({ at_start : true }); with hash link
	QUnit.test( "Startup page without hash link and with a localStorage recalling", function(assert) {
		let done = assert.async();
		assert.expect(1);
		// assert.expect(3);
		playground.innerHTML = `
			<cpu-audio>
				<audio id="secondary" controls="controls" muted="muted">
					<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		secondary_audiotag.volume = 0;
		localStorage.setItem(secondary_audiotag.currentSrc, String(30));
		localStorage.clear();
		function check_onstart() {
			// won't work because missing querySelectorDo('audio[controls]', CPU_Audio.recall_audiotag);
			// assert.ok(! secondary_audiotag.paused, 'Second player should have started');
			// assert.ok(audiotag.paused, 'First player should be paused');
			assert.equal(secondary_audiotag.currentTime , 30, 'Second player should be at 30s');
			window.location = '#';
			// restore hashchange event
			//window.addEventListener('hashchange', cpu.trigger.hashOrder);
			done();
		}
		// désactiver provisoirement le hashchange event
		//window.removeEventListener('hashchange', cpu.trigger.hashOrder);
		window.location = '#';
		cpu.trigger.hashOrder({ at_start : true }, check_onstart);
	});

	// Try trigger.hashOrder({ at_start : true }); with in-memory interruptd play and with hash link (hash link should have priority)
	QUnit.test( "Startup page with a hash link and with a localStorage recalling", function(assert) {
		let done = assert.async();
		assert.expect(3);
		playground.innerHTML = `
			<cpu-audio>
				<audio id="secondary" controls="controls" muted="muted">
					<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		secondary_audiotag.volume = 0;
		localStorage.setItem(secondary_audiotag.currentSrc, String(30));
		localStorage.clear();
		function check_onstart() {
			// won't work because missing querySelectorDo('audio[controls]', CPU_Audio.recall_audiotag);
			assert.ok(! audiotag.paused, 'First player should be playing');
			assert.equal(audiotag.currentTime, 10, 'First player should be at 10s');
			// assert.ok(! secondary_audiotag.paused, 'Second player should have started');
			assert.equal(secondary_audiotag.currentTime, 30, 'Second player should be at 30s');
			window.location = '#';
			// restore hashchange event
			//window.addEventListener('hashchange', cpu.trigger.hashOrder);
			done();
		}
		//  temporarily unactivate the usual hashchange event
		//window.removeEventListener('hashchange', cpu.trigger.hashOrder);
		window.location = '#track&t=10';
		cpu.trigger.hashOrder({ at_start : true }, check_onstart);
	});
*/

	QUnit.test( "Playlist features", function(assert) {
		let done = assert.async();
		assert.expect(5);
		playground.innerHTML = `
			<cpu-audio playlist="plname">
				<audio id="pl1" controls="controls" muted="muted">
					<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>
			<cpu-audio playlist="plname">
				<audio id="pl2" controls="controls" muted="muted">
					<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>
			`;
		const audiotag_pl1 = document.getElementById('pl1');
		const audiotag_pl2 = document.getElementById('pl2');
		assert.ok('plname' in cpu.playlists, 'Playlist “plname” created');
		assert.equal(cpu.playlists.plname.length, 2 , 'Playlist “plname” with 2 items');
		assert.equal(JSON.stringify(cpu.playlists.plname),
					JSON.stringify(['pl1', 'pl2']), 'Playlist “plname” with "pl1" and "pl2"');
//		setTimeout(() => {
			cpu.jumpIdAt('pl1', 119);
			setTimeout(() => {
				assert.ok(audiotag_pl1.paused, '#pl1 paused');
				assert.ok(!audiotag_pl2.paused, '#pl2 playing');
				done();
			}, 2000);
//		}, 100);
	});

	QUnit.test( "Playlist impact when removing a <CPU-audio>", function(assert) {
		assert.equal(
			JSON.stringify(document.CPU.playlists),
			JSON.stringify({}),
			'Playlists are empty at start');
		playground.innerHTML = `
			<cpu-audio playlist="plname">
				<audio id="pl1" controls="controls" muted="muted">
					<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>
			<cpu-audio playlist="plname" id="comp_to_remove">
				<audio id="pl2" controls="controls" muted="muted">
					<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>
			<cpu-audio playlist="plname" id="comp_to_remove">
				<audio id="pl3" controls="controls" muted="muted">
					<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>
			`;
		document.querySelector('#comp_to_remove').remove();
		assert.equal(
			JSON.stringify(document.CPU.playlists),
			JSON.stringify({plname : ['pl1', 'pl3'] }),
			'Removing a <CPU-audio> also clean it\'s audiotag ID from playlist');
	});



	playground.innerHTML = `<p><strong>Finished<strong></p>`;
});