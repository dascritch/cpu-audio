window.addEventListener('WebComponentsReady', function() {

	window.location = '#';
	var lock = false;
	var lockedAt = 0;

	function stopPlayer() {
		window.location = '#';
		document.getElementById('track').pause();
		lock = false;
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

		var $track = document.getElementById('track');
		ok($track.paused, 'paused by defaults' );
	});

	let convert = document.CPU.convert;

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

	var cpu = document.CPU;
	var $track = document.getElementById('track');

	nowLock();
	QUnit.asyncTest( "document.CPU.jumpIdAt existing at start", function( assert ) {
		expect( 2 );
		
		cpu.jumpIdAt('track', 0, function() {
			assert.ok($track.currentTime === 0, 'is at start' );
			assert.ok(!$track.paused, 'not paused afterwards' );
			QUnit.start();
			stopPlayer();
		});
	});

	waitNoLock();
	nowLock();
	QUnit.asyncTest( "document.CPU.jumpIdAt existing at 600 secs", function( assert ) {
		expect( 1 );
		
		cpu.jumpIdAt('track', 600, function() {
			assert.ok($track.currentTime === 600, 'is at 10mn' );
			QUnit.start();
			stopPlayer();
		});
	});

	function hashOrder_test(expected_string, hash , expected_time)
	{
		waitNoLock();
		nowLock();
		QUnit.asyncTest( "document.CPU.trigger.hashOrder "+expected_string, function( assert ) {
			nowLock();
			expect( 1 );
			cpu.trigger.hashOrder(hash, function() {
				assert.ok($track.currentTime === expected_time, expected_string);
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
	hashOrder_test('unnamed track is at 1:02', 't=1:02', 62);

	function hashtest(hash,expects,describ) {
		waitNoLock();
		// nowLock();
		var $track = document.getElementById('track');
		QUnit.asyncTest('on hash change : '+describ, function(assert) {
			nowLock();
			expect(1);
			window.location = hash;
			function event_callback() {
				assert.ok($track.currentTime === expects);
				window.removeEventListener( 'hashchange', event_callback,false);
				stopPlayer();
				QUnit.start();
			}
			window.addEventListener( 'hashchange', event_callback,false);
		});
	}
	function test_finaux() {
		waitNoLock();
		nowLock();
		hashtest('#track&t=30',			30,		'named is at 30 seconds' );
		hashtest('#track&t=25s',		25,		'named is at 25 seconds' );
		hashtest('#track&t=10m10s',		610,	'is at 10 minutes and 10 seconds');
		hashtest('#&t=10s',				10,		'unnamed is at 10 seconds');
		hashtest('#&t=01:01:01',		3661,	'unnamed is at 01:01:01');
		hashtest('#track&t=00:10:00',	600,	'named is at 00:10:00');
	}

});