QUnit.config.autostart = false;

window.addEventListener('load', function() {

	let cpu = document.CPU;
	let convert = cpu.convert;

	window.location = '#';
	let audiotag = document.getElementById('track');
	let playground = document.getElementById('playground');
	audiotag.volume = 0;

	function stopPlayer() {
		audiotag.pause();
		playground.innerHTML = '';
	}

	QUnit.testDone(stopPlayer);

	// before starting the tests, I must be assured the browser autorise playing
	// see https://bugzilla.mozilla.org/show_bug.cgi?id=1476853

	QUnit.start();

	QUnit.test( "hello CPU API", function( assert ) {
		assert.equal( typeof document.CPU, "object", "Passed!" );
		assert.ok(audiotag.paused, 'paused by defaults' );
	});


	QUnit.test( "document.CPU.convert.TimeInSeconds", function( assert ) {
		assert.equal(convert.TimeInSeconds(0), 0, 'got zero' );
		assert.equal(convert.TimeInSeconds('1'), 1, 'got one' );
		assert.equal(convert.TimeInSeconds('1s'), 1, 'got one second' );
		assert.equal(convert.TimeInSeconds('20s'), 20, 'got twenty seconds' );
		assert.equal(convert.TimeInSeconds('1m'), 60, 'got one minute' );
		assert.equal(convert.TimeInSeconds('1m1s'), 61, 'got one minute and one second' );
		assert.equal(convert.TimeInSeconds('2h4m2s'), 7442, 'got 2 hours, 4 minutes and 2 seconds' );
	});

	QUnit.test( "document.CPU.convert.ColonTimeInSeconds", function( assert ) {
		assert.equal(convert.ColonTimeInSeconds('0:01'), 1, 'got one second' );
		assert.equal(convert.ColonTimeInSeconds('1:34'), 94, 'got one minute and 34 seconds' );
		assert.equal(convert.ColonTimeInSeconds('2:01:34'), 7294, 'got two hours, one minute and 34 seconds' );
		assert.equal(convert.ColonTimeInSeconds('1:02:01:34'), (7294 + 86400), 'got one day, two hours, one minute and 34 seconds' );
	});

	QUnit.test( "document.CPU.convert.SecondsInTime", function( assert ) {
		assert.equal(convert.SecondsInTime(0), '0s', 'got zero' );
		assert.equal(convert.SecondsInTime(1), '1s', 'got one' );
		assert.equal(convert.SecondsInTime(20), '20s', 'got twenty seconds' );
		assert.equal(convert.SecondsInTime(60), '1m0s', 'got one minute' );
		assert.equal(convert.SecondsInTime(61), '1m1s', 'got one minute and one second' );
		assert.equal(convert.SecondsInTime(7442), '2h4m2s', 'got 2 hours, 4 minutes and 2 seconds' );
	});

	QUnit.test( "document.CPU.convert.SecondsInColonTime", function( assert ) {
		assert.equal(convert.SecondsInColonTime(0), '0:00', 'got 0:00' );
		assert.equal(convert.SecondsInColonTime(1), '0:01', 'got 0:01' );
		assert.equal(convert.SecondsInColonTime(20), '0:20', 'got 0:20' );
		assert.equal(convert.SecondsInColonTime(60), '1:00', 'got 1:00' );
		assert.equal(convert.SecondsInColonTime(61), '1:01', 'got 1:01' );
		assert.equal(convert.SecondsInColonTime(130), '2:10', 'got 2:10' );
		assert.equal(convert.SecondsInColonTime(7442), '2:04:02', 'got 2:04:02' );
	});

	QUnit.test( "document.CPU.jumpIdAt existing at start", function( assert ) {
		assert.expect( 2 );
		let done = assert.async();
		cpu.jumpIdAt('track', 0, function() {
			assert.equal(audiotag.currentTime, 0, 'is at start' );
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
		QUnit.test( `document.CPU.trigger.hashOrder ${expected_string}`, function( assert ) {
			assert.expect( 1 );
			let done = assert.async();
			cpu.trigger.hashOrder(hash, function() {
				assert.equal(audiotag.currentTime, expected_time, expected_string);
				done();
			});
		});
	}
	hashOrder_test('is at 10 seconds', 'track&t=10', 10);
	hashOrder_test('is at one minute and 2 seconds', 'track&t=1m2s', 62);
	hashOrder_test('unnammed track is at 40 seconds', 't=40', 40);
	hashOrder_test('unnammed track is at 20 seconds', 't=20s', 20);
	hashOrder_test('track is at 00:01:42', 'track&t=00:01:42', 102);
	hashOrder_test('unnamed track is at 1:02', '&t=1:02', 62);
	
	QUnit.test( "hashorder starts,end , mixed notation", function (assert){
		assert.expect( 2 );
		let done = assert.async();
		cpu.trigger.hashOrder('track&t=0:10,20', function() {
			assert.equal(audiotag.currentTime , 10, 'starts at 10 seconds');
			assert.equal(cpu.trigger._timecode_end, 20, 'ends at 20 seconds');
			done();
		});
	});
/*
	QUnit.test( "hashorder ,end ", function (assert){
		assert.expect( 2 );
		let done = assert.async();
		cpu.trigger.hashOrder('track&t=,20', function() {
			assert.ok(audiotag.currentTime === 0, 'starts at 0 second');
			assert.ok(cpu.trigger._timecode_end === 20, 'ends at 20 seconds');
			done();
		});
	});

	QUnit.test( "hashorder start, ", function (assert){
		assert.expect( 2 );
		let done = assert.async();
		cpu.trigger.hashOrder('track&t=20,', function() {
			assert.ok(audiotag.currentTime === 20, 'starts at 0 second');
			assert.ok(cpu.trigger._timecode_end === false, 'natural end');
			done();
		});
	});

	QUnit.test( "hashorder start,end with erroneous entries ", function (assert){
		assert.expect( 2 );
		let done = assert.async();
		cpu.trigger.hashOrder('track&t=a1r,\v0', function() {
			assert.ok(audiotag.currentTime === 0, 'starts at 0 second');
			assert.ok(cpu.trigger._timecode_end === false, 'natural end');
			done();
		});
	});

*/
	QUnit.test( "no cacophony feature : mute other player when another one starts to play", function( assert ) {
		let done = assert.async();
		assert.expect(2);
		audiotag.play();
		// Dynamic add a second audio player
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls">
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		secondary_audiotag.volume = 0;
		let check_only_one_play_this;

		function check_only_one_play() {
			assert.ok(! secondary_audiotag.paused, 'Second player should continue to play');
			assert.ok(audiotag.paused, 'First player should have been paused');
			done();
		}
		check_only_one_play_this = check_only_one_play.bind(this);
		setTimeout(check_only_one_play_this, 100);
		secondary_audiotag.play();
	});

	// Try trigger.hashOrder({ at_start : true }); with hash link
	QUnit.test( "Startup page with a hash link and without localStorage still played", function(assert) {
		let done = assert.async();
		assert.expect(1);
		// assert.expect(3);
		playground.innerHTML = `
			<cpu-audio>
				<audio id="secondary" controls="controls">
					<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		secondary_audiotag.volume = 0;
		localStorage.clear();
		function check_onstart() {
			// won't work because missing querySelector_apply('audio[controls]', CPU_Audio.recall_audiotag);
			// assert.ok(! secondary_audiotag.paused, 'Second player should have started');
			// assert.ok(audiotag.paused, 'First player should be paused');
			assert.ok(secondary_audiotag.currentTime = 10, 'Second player should be at 10s');
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

	// Try trigger.hashOrder({ at_start : true }); with hash link
	QUnit.test( "Startup page without hash link and with a localStorage recalling", function(assert) {
		let done = assert.async();
		assert.expect(1);
		// assert.expect(3);
		playground.innerHTML = `
			<cpu-audio>
				<audio id="secondary" controls="controls">
					<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		secondary_audiotag.volume = 0;
		localStorage.setItem(secondary_audiotag.currentSrc, String(30));
		localStorage.clear();
		function check_onstart() {
			// won't work because missing querySelector_apply('audio[controls]', CPU_Audio.recall_audiotag);
			// assert.ok(! secondary_audiotag.paused, 'Second player should have started');
			// assert.ok(audiotag.paused, 'First player should be paused');
			assert.ok(secondary_audiotag.currentTime = 30, 'Second player should be at 30s');
			window.location = '#';
			// restore hashchange event
			window.addEventListener('hashchange', cpu.trigger.hashOrder, false);
			done();
		}
		// désactiver provisoirement le hashchange event
		window.removeEventListener('hashchange', cpu.trigger.hashOrder);
		window.location = '#';
		cpu.trigger.hashOrder({ at_start : true }, check_onstart);
	});

	// Try trigger.hashOrder({ at_start : true }); with in-memory interruptd play and with hash link (hash link should have priority)
	QUnit.test( "Startup page with a hash link and with a localStorage recalling", function(assert) {
		let done = assert.async();
		assert.expect(3);
		playground.innerHTML = `
			<cpu-audio>
				<audio id="secondary" controls="controls">
					<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		secondary_audiotag.volume = 0;
		localStorage.setItem(secondary_audiotag.currentSrc, String(30));
		localStorage.clear();
		function check_onstart() {
			// won't work because missing querySelector_apply('audio[controls]', CPU_Audio.recall_audiotag);
			assert.ok(! audiotag.paused, 'First player should be playing');
			assert.ok(audiotag.currentTime = 10, 'First player should be at 10s');
			// assert.ok(! secondary_audiotag.paused, 'Second player should have started');
			assert.ok(secondary_audiotag.currentTime = 30, 'Second player should be at 30s');
			window.location = '#';
			// restore hashchange event
			window.addEventListener('hashchange', cpu.trigger.hashOrder, false);
			done();
		}
		// désactiver provisoirement le hashchange event
		window.removeEventListener('hashchange', cpu.trigger.hashOrder);
		window.location = '#track&t=10';
		cpu.trigger.hashOrder({ at_start : true }, check_onstart);
	});


	// Try trigger.hashOrder({ at_start : true }); with in-memory interruptd play and with hash link (hash link should have priority)


	QUnit.test( "Playlist features", function(assert) {
		let done = assert.async();
		assert.expect(5);
		playground.innerHTML = `
			<cpu-audio playlist="plname">
				<audio id="pl1" controls="controls">
					<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>
			<cpu-audio playlist="plname">
				<audio id="pl2" controls="controls">
					<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>
			`;
		assert.ok('plname' in cpu.playlists, 'Playlist “plname” created');
		assert.equal(cpu.playlists.plname.length, 2 , 'Playlist “plname” with 2 items');
		assert.equal(JSON.stringify(cpu.playlists.plname),
					JSON.stringify(['pl1', 'pl2']), 'Playlist “plname” with "pl1" and "pl2"');
		cpu.jumpIdAt('pl1', 119);
		setTimeout(function() {
			let audiotag_pl1 = document.getElementById('pl1');
			let audiotag_pl2 = document.getElementById('pl2');
			assert.ok(audiotag_pl1.paused, '#pl1 paused');
			assert.ok(!audiotag_pl2.paused, '#pl2 playing');
			done();
		}, 2000);
	});


});