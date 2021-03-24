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

	let audiotag = document.getElementById('track');
	let componenttag = document.getElementsByTagName('cpu-audio')[0];
	let interfacetag = componenttag.shadowRoot.querySelector('div');
	let playground = document.getElementById('playground');

	let cpu = document.CPU;

	function stopPlayer() {
		audiotag.pause();
		playground.innerHTML = '';
	}

	QUnit.testDone(stopPlayer);
	stopPlayer();
	QUnit.start();

	QUnit.test( "defaultDataset at default", function( assert ) {
		const temp_head = document.createElement('div');
		document.head.appendChild(temp_head);
		assert.equal(cpu.defaultDataset.title, document.title, "title is document title" );
		assert.equal(cpu.defaultDataset.poster, null, "poster is null without social meta" );
		assert.equal(cpu.defaultDataset.canonical, window.location.href.split('#')[0], "canonical without social meta is actual address without hash" );
		assert.equal(cpu.defaultDataset.twitter, null, "twitter account is null without social meta" );
		
		temp_head.innerHTML = `
			<meta property="og:title" content="facebook">
			<meta property="og:image" content="https://facebook">
		`;
		assert.equal(cpu.defaultDataset.title, 'facebook', "title with facebook social meta" );
		assert.equal(cpu.defaultDataset.poster, 'https://facebook', "poster with facebook social meta" );

		temp_head.innerHTML = `
			<meta name="twitter:title" content="twitter">
			<meta name="twitter:image:src" content="https://twitter">
			<meta name="twitter:creator" content="@dascritch">
		`;
		assert.equal(cpu.defaultDataset.title, 'twitter', "title with twitter social meta" );
		assert.equal(cpu.defaultDataset.poster, 'https://twitter', "poster with twitter social meta" );
		assert.equal(cpu.defaultDataset.twitter, '@dascritch', "twitter account with twitter social meta" );
		temp_head.remove();
		
	});



	QUnit.test( "All named elements in template needed in code, accessed via .shadowId()", function( assert ) {
		for (id of ['loadingline', 'elapse', 'pageerror', 'popup', 'twitter', 'facebook', 'email', 'nativeshare', 'canonical', 'poster', 'time', 'line', 'interface', 'poster', 'pause', 'play', 'actions', 'back', 'restart' , 'fastreward', 'reward', 'foward', 'fastfoward', 'control']) {
			assert.ok(componenttag.CPU.shadowId(id), `Component.CPU.shadowId('${id}')`);
		}
	});

	QUnit.test( "Press play to start", function( assert ) {
		assert.ok(audiotag.paused, "Player is paused at start" );
		interfacetag.querySelector('#pause').dispatchEvent(new Event('click'));
		assert.ok(! audiotag.paused, "Player plays after clicking on the play/pause button" );
	});

	QUnit.test( "Press play to start", function( assert ) {
		assert.ok(audiotag.paused, "Player is paused at start" );
		interfacetag.querySelector('#pause').dispatchEvent(new Event('click'));
		assert.ok(! audiotag.paused, "Player plays after clicking on the play/pause button" );
	});

	QUnit.test( "Press pause to stop", function( assert ) {
		audiotag.play();
		assert.ok(! audiotag.paused, "Player is playing" );
		interfacetag.querySelector('#play').dispatchEvent(new Event('click'));
		assert.ok(audiotag.paused, "Player paused" );
	});

	QUnit.test( "Click at the middle of the timeline ", function( assert ) {
		let done = assert.async();
		assert.expect(2);
		let time_element = interfacetag.querySelector('#time');

		function check_needle_moved(e) {
			assert.ok(! audiotag.paused, 'Audio tag is playing');
			assert.ok(nearlyEqual(audiotag.currentTime, 60, 2), `Audio tag is now nearly half time, 58 >  ${audiotag.currentTime}  > 62  `);
			audiotag.removeEventListener('play', check_needle_moved);
			done();
		}

		cpu.jumpIdAt('track', 0, function() {
			audiotag.pause()
			audiotag.addEventListener('play', check_needle_moved);
			let pos = time_element.getClientRects()[0];
			time_element.dispatchEvent(
				new MouseEvent('click', {
					bubbles: true,
					cancelable: true,
					clientX: pos.left + (time_element.clientWidth / 2),
					clientY: pos.top + 1
				})
			);
		})
	});


	// check keys 
/*
	function trigger_key(keycode, play, time_position,  assert) {
		let done = assert.async();
		assert.expect(2);


		interfacetag.dispatchEvent( 
			new Event('keydown', {
				target 		: this.element,
				bubbles 	: true,
				cancelable 	: false,
				composed 	: false,
				keyCode 	: keycode
			})
		);

		setTimeout(function() {
			assert.ok(nearlyEqual(audiotag.currentTime, time_position, 1), `nearly ${time_position} at ${audiotag.currentTime}`);
			assert.ok(audiotag.paused != play, play?'playing':'paused');
			done;	
		}, 100);
	}

	QUnit.test( "Escape key pauses", function( assert ) {
		cpu.trigger.hashOrder('track&t=0:20', () => {
			trigger_key(27, false, 20,  assert);			
		});
	});

	QUnit.test( "Left arrow key go backwards 5 seconds", function( assert ) {
		cpu.trigger.hashOrder('track&t=0:20', () => {
			trigger_key(37, true, 15,  assert);			
		});
	});

	QUnit.test( "Right arrow key go fowards 5 seconds", function( assert ) {
		cpu.trigger.hashOrder('track&t=0:20', () => {
			trigger_key(39, true, 25, assert);	
		});
	});

	// should also check that arrows with modifiers (shift, ctrl and alt) aren't interpreted
// */

	let canonical = 'https://dascritch.net/post/2014/09/03/Timecodehash-%3A-Lier-vers-un-moment-d-un-sonore';
	let link_element = interfacetag.querySelector('#elapse');

	QUnit.test( "Link to timecode", function( assert ) {
		assert.expect( 2 );
		let done = assert.async();
		// Yes I know, this test is really ugly. but hard to test an async'ed function of async'ed
		cpu.jumpIdAt('track', 0, function() {
			setTimeout(function() {
				assert.equal(link_element.href, `${canonical}#track&t=0`,'at start, link to 0s')
				// set audio at 0:01:03
				cpu.jumpIdAt('track',  63);
				setTimeout(function() {
					assert.equal(link_element.href, `${canonical}#track&t=63`,'link at 0:01:03')
					done();
				}, 100);
			}, 100);
		});
	});

// */
	QUnit.test( "Cannot start if no <audio> tag included", function( assert ) {
		playground.innerHTML = '<cpu-audio id="no_check"></cpu-audio>';
		let done = assert.async();
		setTimeout(function() {
			let no_check_element = playground.querySelector('#no_check');
			assert.ok(null === no_check_element, 'webcomponent not inserted');
			done();
		}, 100);
	});

	QUnit.test( "Media tag without controls attribute. The component must not start", function( assert ) {
		playground.innerHTML = `<cpu-audio id="no_check"><audio id="emission_fail" muted>
									<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
								</audio>
							</cpu-audio>`;
		let done = assert.async();
		setTimeout(function() {
			let no_check_element = playground.querySelector('#no_check');
			assert.ok(null === no_check_element, 'webcomponent not inserted');
			done();
		}, 100);
	});

	/**

	↓ Bad media call. Alas, Chrome won't crash it until any interaction, Firefox never display any error.

	<cpu-audio title="This player must crash" poster="https://cpu.dascritch.net/public/Images/Emissions/.1804-Ex0080-Pizza_m.jpg" canonical="https://dascritch.net/">
		<!-- pour des raisons  de compatibilité arrière, il faut garder la balise audio dans la déclaration -->
		<audio controls id="oups">
			<source src="https://cpu.dascritch.net/public/Images/Emissions/.1804-Ex0080-Pizza_m.jpg"  type="audio/mpeg" />
		</audio>
	</cpu-audio>
	
	**/

	QUnit.test( "Audio without an ID gets an ID", function( assert ) {
		playground.innerHTML = `<cpu-audio id="tag_without_id"><audio controls muted>
									<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
									<track />
								</audio>
							</cpu-audio>`;
		let done = assert.async();
		setTimeout(function() {
			let component = playground.querySelector('#tag_without_id');
			let audiotag = component.querySelector('audio');
			assert.notEqual(audiotag.id, '', `Generated id ${audiotag.id}`);
			done();
		}, 100);
	});

	QUnit.test( "Canonical with an ID keeps the ID", function( assert ) {
		playground.innerHTML = `<cpu-audio id="canonical_with_id" canonical="./canonical.html#id"><audio controls muted>
									<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
									<track />
								</audio>
							</cpu-audio>`;
		let done = assert.async();
		setTimeout(function() {
			let component = playground.querySelector('#canonical_with_id');
			component.querySelector('audio').play();
			let elapsetag = component.shadowRoot.querySelector('#elapse');
			setTimeout(function() {
				assert.ok(elapsetag.href.includes('canonical.html#id&t='), `Elapse tag href ${elapsetag.href}`);
				done();
			}, 100);
		}, 100);
	});

	QUnit.test( "Dynamically change elements, as removing track", function( assert ) {
		playground.innerHTML = `<cpu-audio id="track_will_disapear"><audio id="will_lose_track" controls muted>
									<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
									<track />
								</audio>
							</cpu-audio>`;
		let done = assert.async();
		setTimeout(function() {
			let component = playground.querySelector('#track_will_disapear');
			let secondary_audiotag = playground.querySelector('#will_lose_track');
			let chapters = component.shadowRoot.querySelector('#chapters');
			component.querySelector('track').remove();
			setTimeout(function() {
				assert.equal(secondary_audiotag._CPU_planes['_chapters'], undefined, 'chapters purged');
				done();
			}, 100);
		}, 100);
	});

	QUnit.test( "Dynamically change attribute, as component title", function( assert ) {
		playground.innerHTML = `<cpu-audio title="hello" id="will_change"><audio id="void" controls muted>
									<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
								</audio>
							</cpu-audio>`;
		let done = assert.async();
		setTimeout(function() {
			let component = playground.querySelector('#will_change');
			component.setAttribute('title', 'world');

			setTimeout(function() {
				assert.equal(component.shadowRoot.querySelector('#canonical').innerText, 'world', 'Display title changed');
				done();
			}, 100);
		}, 100);
	});

	QUnit.test( "Dynamically change attribute, as audio tag dataset", function( assert ) {
		playground.innerHTML = `<cpu-audio title="hello" id="will_change"><audio id="void" controls muted>
									<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
								</audio>
							</cpu-audio>`;
		let done = assert.async();
		setTimeout(function() {
			let component = playground.querySelector('#will_change');
			component.querySelector('audio').dataset.title = 'world';

			setTimeout(function() {
				assert.equal(component.shadowRoot.querySelector('#canonical').innerText, 'world', 'Display title changed');
				done();
			}, 100);
		}, 100);
	});

	QUnit.test( 'mode="button,default" makes cpu-audio changing mode on first play', function( assert ) {
		playground.innerHTML = `<cpu-audio mode="button,default">
								<audio id="change_show_on_play" controls muted>
									<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
								</audio>
							</cpu-audio>`;
		let done = assert.async();
		setTimeout(function() {
			let audiotag = playground.querySelector('#change_show_on_play');
			let interface = audiotag.closest('cpu-audio').CPU.container;
			assert.ok(interface.classList.contains('mode-button'), 'Interface appears as a button before playing');
			audiotag.play();
			setTimeout(function() {
				assert.ok(interface.classList.contains('mode-default'), 'Interface appears in full "default" when play starts');
				done();
			}, 100);

		}, 100);
	});

	QUnit.test( "Public API : Changing document.CPU.keymove value", function( assert ) {
		let done = assert.async();
		cpu.jumpIdAt('track', 0, function() {
			cpu.keymove = 30;
			cpu.trigger.foward({target : interfacetag, preventDefault:function(){} });
			setTimeout(function() {
				// Yes, the magic value 29.5s may suprise you, but, if I compare to 30s, Firefox goes sometimes at 29.992729s , and it fall the test ! Chrome may be at... 30.5 !
				assert.ok(nearlyEqual(audiotag.currentTime, 30, 0.5), `Audio tag is now 30 seconds foward  (at ${audiotag.currentTime})`);
				done();
			}, 100);
		});
	});

	QUnit.test( "Public API : disable no cacophony feature via document.CPU.playStopOthers", function( assert ) {
		let done = assert.async();
		document.CPU.playStopOthers = false;
		assert.expect(2);
		audiotag.play();
		// Dynamic add a second audio player
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		secondary_audiotag.volume = 0;
		let check_only_one_play_this;

		function check_only_one_play() {
			assert.ok(! secondary_audiotag.paused, 'Second player should play');
			assert.ok(! audiotag.paused, 'First player should have NOT been paused');
			done();
		}
		check_only_one_play_this = check_only_one_play.bind(this);
		setTimeout(check_only_one_play_this, 100);
		secondary_audiotag.play();
	});


	QUnit.test( "Can only have one and only one <cpu-controller> ", function( assert ) {
		let control1 = document.createElement('cpu-controller');
		control1.id='control1';
		playground.appendChild(control1);
		assert.equal(document.CPU.globalController.element.id, 'control1' , `document.CPU.globalController is connected to the controller`);
		let control2 = document.createElement('cpu-controller');
		control2.id='control2';
		playground.appendChild(control2);
		assert.equal(document.CPU.globalController.element.id, 'control1' , `document.CPU.globalController retain only first instancied controller`);

	});

	/* wrong test, as we need to test this BEFORE ANY OTHER ONE : .currentAudiotagPlaying is not .isAudiotagPlaying
	QUnit.test( "Public API : document.CPU.currentAudiotagPlaying", function( assert ) {
		let done = assert.async();
		assert.expect(2);
		audiotag.pause();
		assert.equal(document.CPU.currentAudiotagPlaying , null, 'Not playing, document.CPU.currentAudiotagPlaying is null');
		audiotag.play();
		assert.ok(audiotag.isEqualNode( document.CPU.currentAudiotagPlaying ), 'Playing, document.CPU.currentAudiotagPlaying is refering playing audio');
	});
	*/

	QUnit.test( "Public API : addPlane won't accept void or out of /[a-zA-Z0-9\\-_]+/ range name ", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		assert.ok(! secondary_API_CPU.addPlane(''), 'function refuse empty name');
		assert.ok(! secondary_API_CPU.addPlane('*&0f'), 'function refuse invalid name');
	});

	QUnit.test( "Public API : addPlane should create elements", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		assert.deepEqual(secondary_audiotag._CPU_planes, {}, 'empty audio._CPU_planes at start');
		assert.equal(secondary_API_CPU.plane('zgou'), undefined, 'plane() returns undefined when nothing exists');
		assert.ok(secondary_API_CPU.addPlane('hello', {title : 'Hello<>&' }), 'function accepts raw text');
		assert.ok(secondary_interfacetag.querySelector('aside#track_«hello»') , 'DOM element aside added in the track line');
		assert.ok(secondary_interfacetag.querySelector('div.panel#panel_«hello»') , 'DOM element div added as a panel');
		assert.deepEqual(Object.keys(secondary_audiotag._CPU_planes).length, 1, 'one audio._CPU_planes created');
		assert.ok('hello' in secondary_audiotag._CPU_planes, 'audio._CPU_planes named “hello”');
		

		assert.equal(secondary_interfacetag.querySelector('div.panel#panel_«hello» h6').innerText, 'Hello<>&', 'panel as a h6 with a properly escaped title');
		secondary_API_CPU.addPlane('untitled');
		assert.ok(secondary_interfacetag.querySelector('div.panel#panel_«untitled» h6').classList.contains('no'), 'Untitled panel have an hidden h6');

		assert.notEqual(secondary_API_CPU.plane('hello'), undefined, 'plane() returns object');
		assert.equal(secondary_API_CPU.planeTrack('hello').tagName, 'ASIDE', 'planeTrack() returns DOM element and is a <aside>');
		assert.equal(secondary_API_CPU.planePanel('hello').tagName, 'DIV', 'planePanel() returns DOM element and is a <div>');
		assert.equal(secondary_API_CPU.planeNav('hello').tagName, 'UL', 'planeNav() returns DOM element and is a <ul>');
	});

	QUnit.test( "Public API : addPlane on <CPU-CONTROLLER> ", function( assert ) {
		playground.innerHTML = `<cpu-controller id="control"></cpu-controller>`;
		let controller_API_CPU = document.querySelector('#control').CPU;
		assert.ok(! controller_API_CPU.addPlane('test_plane'), 'function refuse to add plane on a <CPU-CONTROLLER>');
		assert.ok(! controller_API_CPU.plane('test_plane'), 'plane not created');
		assert.ok(controller_API_CPU.addPlane('test_plane', {_comp : true}), 'function accept to add plane on a <CPU-CONTROLLER> when special parameter _comp is true');
		assert.ok(controller_API_CPU.plane('test_plane'), 'plane not created');
	});

	QUnit.test( "Public API : addPlane cannot create an element if a already existing same name exists", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		assert.ok(secondary_API_CPU.addPlane('hello'), 'first call accepts');
		assert.ok(! secondary_API_CPU.addPlane('hello'), 'second call refuses');
		assert.ok(secondary_API_CPU.planeTrack('hello'), 'Element aside added in shadowDom');
	});

	QUnit.test("planeAndPointNamesFromId", function( assert ) {
		assert.deepEqual(componenttag.CPU.planeAndPointNamesFromId(''), ["",""], 'on empty, returns ["",""]');
		assert.deepEqual(componenttag.CPU.planeAndPointNamesFromId('track_«_chapters»'), ["_chapters",""], 'on track_«_chapters», returns ["_chapters",""]');
		assert.deepEqual(componenttag.CPU.planeAndPointNamesFromId('track_«_chapters»_point_«chap-3»'), ["_chapters","chap-3"], 'on track_«_chapters», returns ["_chapters","chap-3"]');
		assert.deepEqual(componenttag.CPU.planeAndPointNamesFromId('panel_«_chapters»'), ["_chapters",""], 'on panel_«_chapters», returns ["_chapters",""]');
		assert.deepEqual(componenttag.CPU.planeAndPointNamesFromId('panel_«_chapters»_point_«chap-3»'), ["_chapters","chap-3"], 'on plane name panel_«_chapters»_point_«chap-3», returns ["_chapters","chap-3"]');
	});

	QUnit.test( "Public API : removePlane", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		assert.ok(! secondary_API_CPU.removePlane(''), 'function refuse empty name');
		assert.ok(! secondary_API_CPU.removePlane('*&0f'), 'function refuse invalid name');
		assert.ok(! secondary_API_CPU.removePlane('a_girl_has_no_name'), 'function refuse inexisting plane');

		assert.ok(secondary_API_CPU.addPlane('hello'), 'create plane')
		assert.ok(secondary_API_CPU.removePlane('hello'), 'remove created plane successfull');
		assert.ok(! ('hello' in secondary_audiotag._CPU_planes), 'audio._CPU_planes named “hello” is removed');
		assert.equal(secondary_API_CPU.plane('hello'), undefined, 'plane() returns undefined');
		assert.ok(!secondary_API_CPU.planeTrack('hello'), 'Element aside removed in shadowDom');
	});

	QUnit.test( "Public API : addPoint", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		let data = {
			start : 2,
			text : 'Here is some text',
			link : true
		};

		assert.ok(! secondary_API_CPU.addPoint('hello', 'point', data), 'function cannot works without a created plane');
		secondary_API_CPU.addPlane('hello');
		assert.ok(secondary_API_CPU.addPoint('hello', 'zeo0', {...data , start : 0}), 'function accepts a zero timecode');
		assert.ok(! secondary_API_CPU.addPoint('hello', 'point', {...data , start : -2}), 'function cannot works with a negative timecode');
		assert.ok(secondary_API_CPU.addPoint('hello', 'false', {...data , start : false}), 'function accept false start timecode');
		assert.ok(secondary_API_CPU.addPoint('hello', 'null', {...data , start : null}), 'function accept false start timecode');
		assert.ok(secondary_API_CPU.addPoint('hello', 'undef', {...data , start : undefined}), 'function accept undefined start timecode');
		assert.ok(! secondary_API_CPU.addPoint('hello', 'point', {...data , start : 25, end : 1}), 'function cannot works with a start timecode later than its end');
		assert.ok(! secondary_API_CPU.addPoint('hello', '', data), 'function cannot works with an empty name');
		assert.ok(! secondary_API_CPU.addPoint('hello', '*&0f', data), 'function refuse invalid name');

		assert.equal(secondary_API_CPU.point('hello', 'world'), undefined, 'point() returns undefined');

		assert.ok(secondary_API_CPU.addPoint('hello', 'world', data), 'function accept when parameters are valid');
		assert.ok(!secondary_API_CPU.addPoint('hello', 'world', {...data, start : 10}), 'function refuse another name with the same point name in the same track');

		assert.notEqual(secondary_API_CPU.point('hello', 'world'), undefined, 'point() returns data');
		assert.ok(secondary_interfacetag.querySelector('aside#track_«hello» > a#track_«hello»_point_«world»') , 'DOM element point added in aside track');
		assert.ok(secondary_interfacetag.querySelector('div.panel#panel_«hello» > nav > ul > li#panel_«hello»_point_«world»'), 'DOM element point added in panel');

		let point_in_track = secondary_API_CPU.pointTrack('hello', 'world');
		let point_in_panel = secondary_API_CPU.pointPanel('hello', 'world');
		assert.ok(point_in_track, 'pointTrack() returns DOM element');
		assert.ok(point_in_panel, 'pointPanel() returns DOM element');

		let time_in_point = point_in_panel.querySelector('time');
		assert.ok(time_in_point, 'point in panel has a <time> indication');
		assert.equal(time_in_point.innerText, '0:02', '<time> indicate timecode in colon coded text');
		assert.equal(time_in_point.getAttribute('datetime'), 'P2S', '<time> has a datetime attribute in duration standard format');
		assert.ok(point_in_panel.querySelector('a[href]'), 'entry in panel has got link');
		assert.equal(point_in_panel.querySelector('strong').innerText, data.text, '<strong> got data.text');

		assert.ok(point_in_track.tagName, 'A', 'point in track is a <a href>');
		assert.equal(decodeURIComponent(point_in_track.href.split('#')[1]), 'secondary&t=2', '<a href> is pointing to timecode');

	});

	QUnit.test( "Public API : bulkPoints", function( assert ) {
		let data = {
			start : 0,
			text : 'Here is some text',
			link : false
		};
		let planeName = 'hello_bulk';
		let points;

		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_component = document.getElementById('secondary').closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;

		assert.ok(! secondary_API_CPU.bulkPoints('not_existing_plane'), 'Cannot work on an inexisting plane');

		assert.ok(secondary_API_CPU.addPlane(planeName), 'create plane');
		assert.ok(secondary_API_CPU.plane(planeName), 'plane created, ready to add and remove');
		assert.ok(secondary_API_CPU.addPoint(planeName,'point_1', data), 'point 1 created');
		assert.ok(secondary_API_CPU.addPoint(planeName,'point_7', {...data , end : 75}), 'point 7 created');
		assert.equal(secondary_API_CPU.planePointNames(planeName).length, 2, 'At start, plane has 2 points');

		pointDataGroup = { hello : data , hi : {a:1 , b:2}}
		assert.ok(! secondary_API_CPU.bulkPoints('not_existing_plane', pointDataGroup), 'Cannot work on an inexisting plane');

		pointDataGroup = { '#hello' : data  , hi : {a:1 , b:2} }
		assert.ok(! secondary_API_CPU.bulkPoints(planeName, pointDataGroup), 'Cannot accept a bulk of points where a pointName is not valid');

		pointDataGroup = { hello : data , hi : {start : 0 , a:1 , b:2} , point_1 : {start : 100}}
		assert.ok(secondary_API_CPU.bulkPoints(planeName, pointDataGroup), 'Works on qualifiable data');
		assert.equal(secondary_API_CPU.planePointNames(planeName).length, 4, 'Plane should have 4 points : 2 created, one updated');
		console.log(secondary_API_CPU.plane(planeName))
		assert.equal(secondary_API_CPU.point(planeName, 'point_1').start, 100, 'Value of point_1 updated (old values are all erased, instead of editPoint())');
		assert.equal(secondary_API_CPU.plane(planeName)._st_max, 100, 'plane proxy _st_max is updated');
	});

	QUnit.test( "Public API : removePoint", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		assert.ok(secondary_API_CPU.addPlane('hello'), 'creating plane');
		assert.ok(! secondary_API_CPU.removePoint('pipo', 'point'), 'function cannot works with a non-existing plane');
		assert.ok(! secondary_API_CPU.removePoint('hello', 'point'), 'function cannot works with a non-existing point');
		assert.ok(secondary_API_CPU.plane('hello'), 'plane created, ready to add and remove');
		secondary_API_CPU.addPoint('hello', 'point', {start : 2});
		assert.ok(secondary_API_CPU.removePoint('hello', 'point'), 'function accept when parameters are valid');

		assert.equal(secondary_API_CPU.point('hello', 'world'), undefined, 'point() returns undefined');
		assert.equal(secondary_API_CPU.pointTrack('hello', 'point'), null , 'get_aside_pointTrack() returns null');
		assert.equal(secondary_API_CPU.pointPanel('hello', 'point'), null, 'get_aside_pointPanel() returns null');
		assert.ok(! secondary_interfacetag.querySelector('aside#aside_«hello» > div#aside_«hello»_point_«point»') , 'DOM element point removed from aside track');
		assert.ok(! secondary_interfacetag.querySelector('div.panel#panel_«hello» > nav > li#panel_«hello»_point_«point»') , 'DOM element point removed from panel');
	});

	QUnit.test( "Public API : clearPlane", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		secondary_API_CPU.addPlane('hello');
		secondary_API_CPU.addPoint('hello', 'point' , {start : 2});
		secondary_API_CPU.addPoint('hello', 'point2', {start : 20});
		assert.ok(! secondary_API_CPU.clearPlane('point'), 'function return false when parameter is invalid');
		assert.ok(secondary_API_CPU.clearPlane('hello'), 'function accept when parameter is valid');

		assert.equal(secondary_API_CPU.pointTrack('hello', 'point'), null , 'pointTrack() returns null');
		assert.equal(secondary_API_CPU.pointPanel('hello', 'point'), null, 'pointPanel() returns null');
		assert.ok(! secondary_interfacetag.querySelector('aside#aside_«hello» > div#aside_«hello»_point_«point»') , 'DOM element point removed from aside track');
		assert.ok(! secondary_interfacetag.querySelector('div.panel#panel_«hello» > nav > li#panel_«hello»_point_«point»') , 'DOM element point removed from panel');
		assert.equal(secondary_API_CPU.pointTrack('hello', 'point2'), null , 'second point removed');
	});

/*  was working, but no more :/
	QUnit.test( "hashOrder end,start create a “private” plane", function (assert){
		assert.expect( 3 );
		let done = assert.async();
		assert.equal(componenttag.CPU.plane('_borders'), undefined, 'inexisting _borders plane on undefined end.');
		cpu.trigger.hashOrder('track&t=20,100', function() {
			audiotag.CPU_update(); // may not be fired fast enough 
			assert.notEqual(componenttag.CPU.plane('_borders'), undefined, 'existing _borders plane on specified end.');
			cpu.trigger.hashOrder('track&t=40', function() {
				audiotag.CPU_update();
				assert.equal(componenttag.CPU.plane('_borders'), undefined, '_borders removed out of previous bordered time.');
				done();
			});
		});
	});
*/

	QUnit.test( "Public API : translateVTT", function( assert ) {
		assert.equal(componenttag.CPU.translateVTT('Hello, World !'), 'Hello, World !', 'translateVTT() bypass simple text');
		assert.equal(componenttag.CPU.translateVTT('Hello <i>World</i>'), 'Hello <i>World</i>', 'bypass simple <i> tag');
		assert.equal(componenttag.CPU.translateVTT('Hello <I>World</I>'), 'Hello <i>World</i>', 'Accept capitalized tags');
		assert.equal(componenttag.CPU.translateVTT('Hello <i.classname>World</i>'), 'Hello <i>World</i>', 'remove classnames');
		assert.equal(componenttag.CPU.translateVTT('Hello <em>World</em>'), 'Hello <em>World</em>', 'bypass <em>, used in some legacy CPU shows');
		assert.equal(componenttag.CPU.translateVTT('Hello <b>World</b>'), 'Hello <b>World</b>', 'bypass <b>');
		assert.equal(componenttag.CPU.translateVTT('Hello <bold>World</bold>'), 'Hello <strong>World</strong>', 'transform <bold> → <strong> (declared in the MDN page, but never seen in standards pages)');
		assert.equal(componenttag.CPU.translateVTT('Hello <u>World</u>'), 'Hello <u>World</u>', 'bypass <u>');
		assert.equal(componenttag.CPU.translateVTT('Hello <lang fr>Monde</lang>'), 'Hello <i lang="fr">Monde</i>', 'transform <lang xx> into <i lang="xx">, emphasis for typographic convention');
		assert.equal(componenttag.CPU.translateVTT('Hello <a href=".">World</a>'), 'Hello World', 'remove <a href>');
		assert.equal(componenttag.CPU.translateVTT('Hello\nWorld\nHow are you ?'), 'Hello<br/>World<br/>How are you ?', 'transform CR into <br>');
		assert.equal(componenttag.CPU.translateVTT('♪ Johnny Mercer, Robert Emmet Dolan <em lang="en">featuring</em> Hedy Lamarr - <em>Just a moment more</em>'), '♪ Johnny Mercer, Robert Emmet Dolan <em>featuring</em> Hedy Lamarr - <em>Just a moment more</em>', 'A valid example with 2 consecutives <em> tags')
		assert.equal(componenttag.CPU.translateVTT('♪ Johnny Mercer, Robert Emmet Dolan <em lang="en"<featuring</em> Hedy Lamarr - <em>Just a moment more</em>'), '♪ Johnny Mercer, Robert Emmet Dolan &lt;em lang="en"&lt;featuring&lt;/em&gt; Hedy Lamarr - &lt;em&gt;Just a moment more&lt;/em&gt;', 'An invalid example with unmatching < and >, replaced by html escapes')
	});

	QUnit.test( "Download audio link ", function( assert ) {
		let done = assert.async();
		assert.expect(3);
		let third_source = 'tests-assets/void';
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>
		<cpu-audio>
			<audio id="third" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
				<source src="../${third_source}" data-downloadable />
			</audio>
		</cpu-audio>
		<cpu-audio download="../${third_source}">
			<audio id="fourth" controls="controls" muted>
				<source src="../tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>
		`;

		function checks() {
			let secondary_audiotag = document.getElementById('secondary');
			let secondary_component = secondary_audiotag.closest('cpu-audio');
			let secondary_API_CPU = secondary_component.CPU;
			let secondary_download_link = secondary_component.shadowRoot.querySelector('a[download]');
			secondary_API_CPU.updateLinks();

			assert.ok(secondary_download_link.href === secondary_audiotag.currentSrc , `By default, download link ( ${secondary_download_link.href} ) is the <audio>.currentSrc ( ${secondary_audiotag.currentSrc} )`);

			let third_audiotag = document.getElementById('third');
			let third_component = third_audiotag.closest('cpu-audio');
			let third_API_CPU = third_component.CPU;
			let third_download_link = third_component.shadowRoot.querySelector('a[download]');
			third_API_CPU.updateLinks();

			assert.ok(third_download_link.href.includes(third_source), `If indicated, download link ( ${third_download_link.href} ) is taking the prefered <source data-downloadable> ( ${third_source} )`);

			let fourth_component = document.getElementById('fourth').closest('cpu-audio');
			let fourth_API_CPU = fourth_component.CPU;
			let fourth_download_link = fourth_component.shadowRoot.querySelector('a[download]');
			fourth_API_CPU.updateLinks();

			assert.ok(fourth_download_link.href.includes(third_source), `If indicated, download link ( ${fourth_download_link.href} ) is taking the <cpu-audio download="<url>"> ( ${third_source} ) `);

			done();
		}
		setTimeout(checks, 100);
		
	});

	QUnit.test( "Style injection", function( assert ) {
		let css = `#interface { background : yellow; }`;
		componenttag.CPU.injectCss('injection',css);
		assert.ok(componenttag.shadowRoot.querySelector('style#style_injection'), 'injectCss injected <style>');
		componenttag.CPU.removeCss('injection');
		assert.ok(!componenttag.shadowRoot.querySelector('style#style_injection'), 'removeCss destroyed <style>');
	});

	playground.innerHTML = `<p><strong>Finished<strong></p>`;

});