QUnit.config.autostart = false;

window.addEventListener('WebComponentsReady', function() {

	window.location = '#';
	let audiotag = document.getElementById('track');
	let playground = document.getElementById('playground');
	audiotag.volume = 0;

	function stopPlayer() {
		audiotag.pause();
		playground.innerHTML = '';
	}

	QUnit.testDone(stopPlayer);
	QUnit.start();

	QUnit.test( "hello CPU API", function( assert ) {
		assert.ok( typeof document.CPU === "object", "Passed!" );
		assert.ok(audiotag.paused, 'paused by defaults' );
	});

	let cpu = document.CPU;
	let convert = cpu.convert;

	QUnit.test( "document.CPU.convert.TimeInSeconds", function( assert ) {
		assert.ok(convert.TimeInSeconds(0) === 0, 'got zero' );
		assert.ok(convert.TimeInSeconds('1') === 1, 'got one' );
		assert.ok(convert.TimeInSeconds('1s') === 1, 'got one second' );
		assert.ok(convert.TimeInSeconds('20s') === 20, 'got twenty seconds' );
		assert.ok(convert.TimeInSeconds('1m') === 60, 'got one minute' );
		assert.ok(convert.TimeInSeconds('1m1s') === 61, 'got one minute and one second' );
		assert.ok(convert.TimeInSeconds('2h4m2s') === 7442, 'got 2 hours, 4 minutes and 2 seconds' );
	});

	QUnit.test( "document.CPU.convert.ColonTimeInSeconds", function( assert ) {
		assert.ok(convert.ColonTimeInSeconds('0:01') === 1, 'got one second' );
		assert.ok(convert.ColonTimeInSeconds('1:34') === 94, 'got one minute and 34 seconds' );
		assert.ok(convert.ColonTimeInSeconds('2:01:34') === 7294, 'got two hours, one minute and 34 seconds' );
		assert.ok(convert.ColonTimeInSeconds('1:02:01:34') === (7294 + 86400), 'got one day, two hours, one minute and 34 seconds' );
	});

	QUnit.test( "document.CPU.convert.SecondsInTime", function( assert ) {
		assert.ok(convert.SecondsInTime(0) === '0s', 'got zero' );
		assert.ok(convert.SecondsInTime(1) === '1s', 'got one' );
		assert.ok(convert.SecondsInTime(20) === '20s', 'got twenty seconds' );
		assert.ok(convert.SecondsInTime(60) === '1m0s', 'got one minute' );
		assert.ok(convert.SecondsInTime(61) === '1m1s', 'got one minute and one second' );
		assert.ok(convert.SecondsInTime(7442) === '2h4m2s', 'got 2 hours, 4 minutes and 2 seconds' );
	});

	QUnit.test( "document.CPU.convert.SecondsInColonTime", function( assert ) {
		assert.ok(convert.SecondsInColonTime(0) === '0:00', 'got 0:00' );
		assert.ok(convert.SecondsInColonTime(1) === '0:01', 'got 0:01' );
		assert.ok(convert.SecondsInColonTime(20) === '0:20', 'got 0:20' );
		assert.ok(convert.SecondsInColonTime(60) === '1:00', 'got 1:00' );
		assert.ok(convert.SecondsInColonTime(61) === '1:01', 'got 1:01' );
		assert.ok(convert.SecondsInColonTime(130) === '2:10', 'got 2:10' );
		assert.ok(convert.SecondsInColonTime(7442) === '2:04:02', 'got 2:04:02' );
	});

	QUnit.test( "document.CPU.jumpIdAt existing at start", function( assert ) {
		assert.expect( 2 );
		let done = assert.async();
		cpu.jumpIdAt('track', 0, function() {
			assert.ok(audiotag.currentTime === 0, 'is at start' );
			assert.ok(!audiotag.paused, 'not paused afterwards' );
			done();
		});
	});

	QUnit.test( "document.CPU.jumpIdAt existing at 600 secs", function( assert ) {
		assert.expect( 1 );
		let done = assert.async();
		cpu.jumpIdAt('track', 600, function() {
			assert.ok(audiotag.currentTime === 600, 'is at 10mn' );
			done();
		});
	});

	QUnit.test( "document.CPU.jumpIdAt unnamed at 300 secs", function( assert ) {
		assert.expect( 1 );
		let done = assert.async();
		cpu.jumpIdAt('', 300, function() {
			assert.ok(audiotag.currentTime === 300, 'is at 5mn' );
			done();
		});
	});

	function hashOrder_test(expected_string, hash , expected_time)
	{
		QUnit.test( `document.CPU.trigger.hashOrder ${expected_string}`, function( assert ) {
			assert.expect( 1 );
			let done = assert.async();
			cpu.trigger.hashOrder(hash, function() {
				assert.ok(audiotag.currentTime === expected_time, expected_string);
				done();
			});
		});
	}
	hashOrder_test('is at 10 seconds', 'track&t=10', 10);
	hashOrder_test('is at one hour, 2 minutes and 4 seconds', 'track&t=1h2m4s', 3724);
	hashOrder_test('unnammed track is at 40 seconds', 't=40', 40);
	hashOrder_test('unnammed track is at 20 seconds', 't=20s', 20);
	hashOrder_test('track is at 02:04:02', 'track&t=01:04:02', 3842);
	hashOrder_test('unnamed track is at 1:02', '&t=1:02', 62);

	QUnit.test( "no cacophony feature : mute other player when another one starts to play", function( assert ) {
		let done = assert.async();
		assert.expect(2);
		audiotag.play();
		// Dynamic add a second audio player
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls">
				<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/386-SupplementWeekEnd%2831-05-14%29.ogg" type="audio/ogg; codecs=vorbis" />
				<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/podcast/386-SupplementWeekEnd%2831-05-14%29.mp3" type="audio/mpeg" />
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
					<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/386-SupplementWeekEnd%2831-05-14%29.ogg" type="audio/ogg; codecs=vorbis" />
					<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/podcast/386-SupplementWeekEnd%2831-05-14%29.mp3" type="audio/mpeg" />
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
					<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/386-SupplementWeekEnd%2831-05-14%29.ogg" type="audio/ogg; codecs=vorbis" />
					<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/podcast/386-SupplementWeekEnd%2831-05-14%29.mp3" type="audio/mpeg" />
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
					<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/386-SupplementWeekEnd%2831-05-14%29.ogg" type="audio/ogg; codecs=vorbis" />
					<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/podcast/386-SupplementWeekEnd%2831-05-14%29.mp3" type="audio/mpeg" />
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


});