window.addEventListener('WebComponentsReady', function() {

	window.location = '#';
	var lock = false;
	var lockedAt = 0;
	var audiotag = document.getElementById('track');
	var playground = document.getElementById('playground');

	function stopPlayer() {
		window.location = '#';
		audiotag.pause();
		lock = false;
		playground.innerHTML = '';
	}

	function nowLock() {
		lock = true;
		lockedAt = Date.now();
	}

	function waitNoLock() {
		while (lock && (Date.now() < (lockedAt+10))) ;
		lock = false;
	}

	QUnit.testDone(stopPlayer);

	test( "hello CPU API", function() {
		ok( typeof document.CPU === "object", "Passed!" );
		ok(audiotag.paused, 'paused by defaults' );
	});

	let convert = document.CPU.convert;

	waitNoLock();
	nowLock();
	test( "document.CPU.convert.TimeInSeconds", function() {
		ok(convert.TimeInSeconds(0) === 0, 'got zero' );
		ok(convert.TimeInSeconds('1') === 1, 'got one' );
		ok(convert.TimeInSeconds('1s') === 1, 'got one second' );
		ok(convert.TimeInSeconds('20s') === 20, 'got twenty seconds' );
		ok(convert.TimeInSeconds('1m') === 60, 'got one minute' );
		ok(convert.TimeInSeconds('1m1s') === 61, 'got one minute and one second' );
		ok(convert.TimeInSeconds('2h4m2s') === 7442, 'got 2 hours, 4 minutes and 2 seconds' );
	});

	test( "document.CPU.convert.ColonTimeInSeconds", function() {
		ok(convert.ColonTimeInSeconds('0:01') === 1, 'got one second' );
		ok(convert.ColonTimeInSeconds('1:34') === 94, 'got one minute and 34 seconds' );
		ok(convert.ColonTimeInSeconds('2:01:34') === 7294, 'got two hours, one minute and 34 seconds' );
		ok(convert.ColonTimeInSeconds('1:02:01:34') === (7294 + 86400), 'got one day, two hours, one minute and 34 seconds' );
	});

	test( "document.CPU.convert.SecondsInTime", function() {
		ok(convert.SecondsInTime(0) === '0s', 'got zero' );
		ok(convert.SecondsInTime(1) === '1s', 'got one' );
		ok(convert.SecondsInTime(20) === '20s', 'got twenty seconds' );
		ok(convert.SecondsInTime(60) === '1m0s', 'got one minute' );
		ok(convert.SecondsInTime(61) === '1m1s', 'got one minute and one second' );
		ok(convert.SecondsInTime(7442) === '2h4m2s', 'got 2 hours, 4 minutes and 2 seconds' );
	});

	test( "document.CPU.convert.SecondsInColonTime", function() {
		ok(convert.SecondsInColonTime(0) === '0:00', 'got 0:00' );
		ok(convert.SecondsInColonTime(1) === '0:01', 'got 0:01' );
		ok(convert.SecondsInColonTime(20) === '0:20', 'got 0:20' );
		ok(convert.SecondsInColonTime(60) === '1:00', 'got 1:00' );
		ok(convert.SecondsInColonTime(61) === '1:01', 'got 1:01' );
		ok(convert.SecondsInColonTime(130) === '2:10', 'got 2:10' );
		ok(convert.SecondsInColonTime(7442) === '2:04:02', 'got 2:04:02' );
	});

	var cpu = document.CPU;


	waitNoLock();
	nowLock();
	QUnit.asyncTest( "document.CPU.jumpIdAt existing at start", function( assert ) {
		expect( 2 );
		cpu.jumpIdAt('track', 0, function() {
			assert.ok(audiotag.currentTime === 0, 'is at start' );
			assert.ok(!audiotag.paused, 'not paused afterwards' );
			QUnit.start();
			stopPlayer();
		});
	});

	waitNoLock();
	nowLock();
	QUnit.asyncTest( "document.CPU.jumpIdAt existing at 600 secs", function( assert ) {
		expect( 1 );
		cpu.jumpIdAt('track', 600, function() {
			assert.ok(audiotag.currentTime === 600, 'is at 10mn' );
			QUnit.start();
			stopPlayer();
		});
	});

	waitNoLock();
	nowLock();
	QUnit.asyncTest( "document.CPU.jumpIdAt unnamed at 300 secs", function( assert ) {
		expect( 1 );
		cpu.jumpIdAt('', 300, function() {
			assert.ok(audiotag.currentTime === 300, 'is at 5mn' );
			QUnit.start();
			stopPlayer();
		});
	});



	function hashOrder_test(expected_string, hash , expected_time)
	{
		waitNoLock();
		nowLock();
		QUnit.asyncTest( `document.CPU.trigger.hashOrder ${expected_string}`, function( assert ) {
			nowLock();
			expect( 1 );
			cpu.trigger.hashOrder(hash, function() {
				assert.ok(audiotag.currentTime === expected_time, expected_string);
				QUnit.start();
				stopPlayer();
			});
		});
	}
	hashOrder_test('is at 10 seconds', 'track&t=10', 10);
	hashOrder_test('is at one hour, 2 minutes and 4 seconds', 'track&t=1h2m4s', 3724);
	hashOrder_test('unnammed track is at 40 seconds', 't=40', 40);
	hashOrder_test('unnammed track is at 20 seconds', 't=20s', 20);
	hashOrder_test('track is at 02:04:02', 'track&t=01:04:02', 3842);
	hashOrder_test('unnamed track is at 1:02', '&t=1:02', 62);


	waitNoLock();
	nowLock();
	QUnit.asyncTest( "no cacophony feature : mute other player when another one starts to play", function( assert ) {
		expect(2);
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
		let check_only_one_play_this;

		function check_only_one_play() {
			assert.ok(! secondary_audiotag.paused, 'Second player should continue to play');
			assert.ok(audiotag.paused, 'First player should have been paused');
			QUnit.start();
			stopPlayer();
		}
		check_only_one_play_this = check_only_one_play.bind(this);
		setTimeout(check_only_one_play_this, 100);
		secondary_audiotag.play();
	});


	waitNoLock();
	nowLock();
	// Try trigger.hashOrder({ at_start : true }); with hash link
	QUnit.asyncTest( "Startup page with a hash link and without localStorage still played", function(assert) {
		expect(3);
		playground.innerHTML = `
			<cpu-audio>
				<audio id="secondary" controls="controls">
					<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/386-SupplementWeekEnd%2831-05-14%29.ogg" type="audio/ogg; codecs=vorbis" />
					<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/podcast/386-SupplementWeekEnd%2831-05-14%29.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		localStorage.clear();
		function check_onstart() {
			assert.ok(! secondary_audiotag.paused, 'Second player should have started');
			assert.ok(secondary_audiotag.currentTime = 10, 'Second player should be at 10s');
			assert.ok(audiotag.paused, 'First player should be paused');
			QUnit.start();
			stopPlayer();
		}
		// désactiver provisoirement le hashchange event ?
		window.location = '#secondary&t=10';
		cpu.trigger.hashOrder({ at_start : true });
		setTimeout(check_onstart, 100);
	});

	waitNoLock();
	nowLock();
	// Try trigger.hashOrder({ at_start : true }); with hash link
	QUnit.asyncTest( "Startup page without hash link and with a localStorage recalling", function(assert) {
		expect(3);
		playground.innerHTML = `
			<cpu-audio>
				<audio id="secondary" controls="controls">
					<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/386-SupplementWeekEnd%2831-05-14%29.ogg" type="audio/ogg; codecs=vorbis" />
					<source src="https://dascritch.net/vrac/Emissions/SuppWeekEnd/podcast/386-SupplementWeekEnd%2831-05-14%29.mp3" type="audio/mpeg" />
				</audio>
			</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		localStorage.setItem(secondary_audiotag.currentSrc, String(30));
		localStorage.clear();
		function check_onstart() {
			assert.ok(! secondary_audiotag.paused, 'Second player should have started');
			assert.ok(secondary_audiotag.currentTime = 30, 'Second player should be at 30s');
			assert.ok(audiotag.paused, 'First player should be paused');
			QUnit.start();
			stopPlayer();
		}
		// désactiver provisoirement le hashchange event ?
		window.location = '#';
		cpu.trigger.hashOrder({ at_start : true });
		setTimeout(check_onstart, 100);
	});


	// Try trigger.hashOrder({ at_start : true }); with in-memory interruptd play and without hash link
	// Try trigger.hashOrder({ at_start : true }); with in-memory interruptd play and with hash link (hash link should have priority)

});