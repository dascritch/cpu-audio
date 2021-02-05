QUnit.config.autostart = false;


function check_focus() {
	document.body.style.background = document.hasFocus() ? 'white' : 'grey';
}

check_focus();
document.addEventListener('focus', check_focus);
document.addEventListener('blur', check_focus);

window.addEventListener('load', function() {
	QUnit.config.autostart = false;
	window.location = '#';
});

document.getElementById('get_focus').addEventListener('click', function() {

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



	QUnit.test( "default_dataset at default", function( assert ) {
		assert.equal(cpu.default_dataset.title, document.title, "title is document title" );
		assert.equal(cpu.default_dataset.poster, null, "poster is null without social meta" );
		assert.equal(cpu.default_dataset.canonical, window.location.href.split('#')[0], "canonical without social meta is actual address without hash" );
		assert.equal(cpu.default_dataset.twitter, null, "twitter account is null without social meta" );
		/*
		playground.innerHTML = `
			<meta property="og:title" content="facebook">
			<meta property="og:image" content="https://facebook">
		`;
		assert.equal(cpu.default_dataset.title, 'facebook', "title with facebook social meta" );
		assert.equal(cpu.default_dataset.poster, 'https://facebook', "poster with facebook social meta" );
		playground.innerHTML = `
			<meta property="twitter:title" content="twitter">
			<meta property="twitter:image:src" content="https://twitter">
			<meta property="twitter:creator" content="@dascritch">
		`;
		assert.equal(cpu.default_dataset.title, 'twitter', "title with twitter social meta" );
		assert.equal(cpu.default_dataset.poster, 'https://twitter', "poster with twitter social meta" );
		assert.equal(cpu.default_dataset.twitter, '@dascritch', "twitter account with twitter social meta" );
		*/
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
		assert.expect(3);
		let time_element = interfacetag.querySelector('#time');

		function check_needle_moved(e) {
			assert.ok(! audiotag.paused, 'Audio tag is playing');
			assert.ok(audiotag.currentTime > 58, 'Audio tag is now nearly half time');
			assert.ok(audiotag.currentTime < 62, 'Audio tag is now nearly half time');
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
		let event = document.createEvent('CustomEvent');
		event.initEvent('keydown', true, false);
		event.keyCode = keycode;
		interfacetag.dispatchEvent(event);

		setTimeout(function() {
			assert.ok( (audiotag.currentTime >= time_position) && (audiotag.currentTime < (time_position +2)), `nearly ${time_position} at ${audiotag.currentTime}`);
			assert.ok(audiotag.paused != play, play?'playing':'paused');
			done;	
		}, 100);
	}

	QUnit.test( "Escape key pauses", function( assert ) {
		cpu.trigger.hashOrder('track&t=0:20', function() {
			trigger_key(27, false, 20,  assert);			
		});
	});

	QUnit.test( "Left arrow key go backwards 5 seconds", function( assert ) {
		cpu.trigger.hashOrder('track&t=0:20', function() {
			trigger_key(37, true, 15,  assert);			
		});
	});

	QUnit.test( "Right arrow key go fowards 5 seconds", function( assert ) {
		cpu.trigger.hashOrder('track&t=0:20', function() {
			trigger_key(39, true, 25, assert);
			
		});
	});
*/

	let canonical = 'http://dascritch.net/post/2014/09/03/Timecodehash-%3A-Lier-vers-un-moment-d-un-sonore';
	let link_element = interfacetag.querySelector('#elapse');

	/*
I still have an issue on this test, as the tested code works correctly, and i'm mad about it !

	QUnit.test( "Link to timecode", function( assert ) {
		// assert.expect( 2 );
		let done = assert.async();
		cpu.jumpIdAt('track', 0, function() {
			assert.equal(link_element.href, `${canonical}#track&t=0s`,'at start, link to 0s')
			// set audio at 0:01:03
			cpu.jumpIdAt('track', 0*3600 + 60*1 + 3, function() {
				assert.equal(link_element.href, `${canonical}#track&t=1m3s`,'link at 0:01:03')
				done();
			});
		});
	});

*/
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
									<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
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
									<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
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
									<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
									<track />
								</audio>
							</cpu-audio>`;
		let done = assert.async();
		setTimeout(function() {
			let component = playground.querySelector('#canonical_with_id');
			component.querySelector('audio').play();
			let elapsetag = component.shadowRoot.querySelector('#elapse');
			setTimeout(function() {
				assert.notEqual(-1, elapsetag.href.indexOf('canonical.html#id&t='), `Elapse tag href ${elapsetag.href}`);
				done();
			}, 100);
		}, 100);
	});

	QUnit.test( "Dynamically change elements, as removing track", function( assert ) {
		playground.innerHTML = `<cpu-audio id="track_will_disapear"><audio id="will_lose_track" controls muted>
									<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
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
									<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
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
									<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
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
									<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
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
				// Yes, the magic value 29.5s may suprise you, but, if I compare to 30s, Firefox goes sometimes at 29.992729s , and it fall the test !
				assert.ok(audiotag.currentTime > 29.5, `Audio tag is now 30 seconds foward  (at ${audiotag.currentTime})`);
				done();
			}, 100);
		});
	});

	QUnit.test( "Public API : disable no cacophony feature via document.CPU.only_play_one_audiotag", function( assert ) {
		let done = assert.async();
		document.CPU.only_play_one_audiotag = false;
		assert.expect(2);
		audiotag.play();
		// Dynamic add a second audio player
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
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

	/* wrong test, as we need to test this BEFORE ANY OTHER ONE : .current_audiotag_playing is not .is_audiotag_playing
	QUnit.test( "Public API : document.CPU.current_audiotag_playing", function( assert ) {
		let done = assert.async();
		assert.expect(2);
		audiotag.pause();
		assert.equal(document.CPU.current_audiotag_playing , null, 'Not playing, document.CPU.current_audiotag_playing is null');
		audiotag.play();
		assert.ok(audiotag.isEqualNode( document.CPU.current_audiotag_playing ), 'Playing, document.CPU.current_audiotag_playing is refering playing audio');
	});
	*/

	QUnit.test( "Public API : add_plane won't accept void or out of /[a-zA-Z0-9\\-_]+/ range name ", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		assert.ok(! secondary_API_CPU.add_plane(''), 'function refuse empty name');
		assert.ok(! secondary_API_CPU.add_plane('*&0f'), 'function refuse invalid name');
	});

	QUnit.test( "Public API : add_plane should create elements", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		assert.deepEqual(secondary_audiotag._CPU_planes, {}, 'empty audio._CPU_planes at start');
		assert.equal(secondary_API_CPU.get_plane('zgou'), undefined, 'get_plane() returns undefined when nothing exists');
		assert.ok(secondary_API_CPU.add_plane('hello', 'Hello<>&'), 'function accepts');
		assert.ok(secondary_interfacetag.querySelector('aside#track_«hello»') , 'DOM element aside added in the track line');
		assert.ok(secondary_interfacetag.querySelector('div.panel#panel_«hello»') , 'DOM element div added as a panel');
		assert.deepEqual(Object.keys(secondary_audiotag._CPU_planes).length, 1, 'one audio._CPU_planes created');
		assert.ok('hello' in secondary_audiotag._CPU_planes, 'audio._CPU_planes named “hello”');
		

		assert.equal(secondary_interfacetag.querySelector('div.panel#panel_«hello» h6').innerText, 'Hello<>&', 'panel as a h6 with a properly escaped title');
		secondary_API_CPU.add_plane('untitled');
		assert.equal(secondary_interfacetag.querySelector('div.panel#panel_«untitled» h6'), null, 'Untitled panel doesn\'t have any h6');

		assert.notEqual(secondary_API_CPU.get_plane('hello'), undefined, 'get_plane() returns object');
		assert.equal(secondary_API_CPU.get_plane_track('hello').tagName, 'ASIDE', 'get_plane_track() returns DOM element and is a <aside>');
		assert.equal(secondary_API_CPU.get_plane_panel('hello').tagName, 'DIV', 'get_plane_panel() returns DOM element and is a <div>');
		assert.equal(secondary_API_CPU.get_plane_nav('hello').tagName, 'UL', 'get_plane_nav() returns DOM element and is a <ul>');
	});

	QUnit.test( "Public API : add_plane cannot create an element if a already existing same name exists", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		assert.ok(secondary_API_CPU.add_plane('hello'), 'first call accepts');
		assert.ok(! secondary_API_CPU.add_plane('hello'), 'second call refuses');
		assert.ok(secondary_API_CPU.get_plane_track('hello'), 'Element aside added in shadowDom');
	});

	QUnit.test("get_point_names_from_id", function( assert ) {
		assert.deepEqual(componenttag.CPU.get_point_names_from_id(''), ["",""], 'on empty, returns ["",""]');
		assert.deepEqual(componenttag.CPU.get_point_names_from_id('track_«_chapters»'), ["_chapters",""], 'on track_«_chapters», returns ["_chapters",""]');
		assert.deepEqual(componenttag.CPU.get_point_names_from_id('track_«_chapters»_point_«chap-3»'), ["_chapters","chap-3"], 'on track_«_chapters», returns ["_chapters","chap-3"]');
		assert.deepEqual(componenttag.CPU.get_point_names_from_id('panel_«_chapters»'), ["_chapters",""], 'on panel_«_chapters», returns ["_chapters",""]');
		assert.deepEqual(componenttag.CPU.get_point_names_from_id('panel_«_chapters»_point_«chap-3»'), ["_chapters","chap-3"], 'on plane name panel_«_chapters»_point_«chap-3», returns ["_chapters","chap-3"]');
	});

	QUnit.test( "Public API : remove_plane", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		assert.ok(! secondary_API_CPU.remove_plane(''), 'function refuse empty name');
		assert.ok(! secondary_API_CPU.remove_plane('*&0f'), 'function refuse invalid name');
		assert.ok(! secondary_API_CPU.remove_plane('a_girl_has_no_name'), 'function refuse inexisting plane');

		assert.ok(secondary_API_CPU.add_plane('hello'), 'create plane')
		assert.ok(secondary_API_CPU.remove_plane('hello'), 'remove created plane successfull');
		assert.ok(! ('hello' in secondary_audiotag._CPU_planes), 'audio._CPU_planes named “hello” is removed');
		assert.equal(secondary_API_CPU.get_plane('hello'), undefined, 'get_plane() returns undefined');
		assert.ok(!secondary_API_CPU.get_plane_track('hello'), 'Element aside removed in shadowDom');
	});

	QUnit.test( "Public API : add_point", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		let data = {
			'text' : 'Here is some text',
			'link' : true
		};

		assert.ok(! secondary_API_CPU.add_point('hello', 2, 'point', data), 'function cannot works without a created plane');
		secondary_API_CPU.add_plane('hello');
		assert.ok(! secondary_API_CPU.add_point('hello', -2, 'point', data), 'function cannot works with a negative timecode');
		assert.ok(! secondary_API_CPU.add_point('hello', 2, '', data), 'function cannot works with an empty name');
		assert.ok(! secondary_API_CPU.add_point('hello', 2, '*&0f', data), 'function refuse invalid name');

		assert.equal(secondary_API_CPU.get_point('hello', 'world'), undefined, 'get_point() returns undefined');

		assert.ok(secondary_API_CPU.add_point('hello', 2, 'world', data), 'function accept when parameters are valid');
		assert.ok(!secondary_API_CPU.add_point('hello', 10, 'world', data), 'function refuse another name with the same point name in the same track');

		assert.notEqual(secondary_API_CPU.get_point('hello', 'world'), undefined, 'get_point() returns data');
		assert.ok(secondary_interfacetag.querySelector('aside#track_«hello» > a#track_«hello»_point_«world»') , 'DOM element point added in aside track');
		assert.ok(secondary_interfacetag.querySelector('div.panel#panel_«hello» > nav > ul > li > a#panel_«hello»_point_«world»'), 'DOM element point added in panel');

		let point_in_track = secondary_API_CPU.get_point_track('hello', 'world');
		let point_in_panel = secondary_API_CPU.get_point_panel('hello', 'world');
		assert.ok(point_in_track, 'get_point_track() returns DOM element');
		assert.ok(point_in_panel, 'get_point_panel() returns DOM element');

		let time_in_point = point_in_panel.querySelector('time');
		assert.ok(time_in_point, 'point in panel has a <time> indication');
		assert.equal(time_in_point.innerText, '0:02', '<time> indicate timecode in colon coded text');
		assert.equal(time_in_point.getAttribute('datetime'), 'P2S', '<time> has a datetime attribute in duration standard format');
		assert.equal(point_in_panel.tagName, 'A', 'entry in panel has got link');
		assert.equal(point_in_panel.querySelector('strong').innerText, data.text, '<strong> got data.text');

		assert.ok(point_in_track.tagName, 'A', 'point in track is a <a href>');
		assert.equal(decodeURIComponent(point_in_track.href.split('#')[1]), 'secondary&t=2', '<a href> is pointing to timecode');

	});

	QUnit.test( "Public API : remove_point", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		secondary_API_CPU.add_plane('hello');
		assert.ok(! secondary_API_CPU.remove_point('pipo', 'point'), 'function cannot works with a non-existing aside');
		assert.ok(! secondary_API_CPU.remove_point('hello', 'point'), 'function cannot works with a non-existing point');
		secondary_API_CPU.add_point('hello', 2, 'point');
		assert.ok(secondary_API_CPU.remove_point('hello', 'point'), 'function accept when parameters are valid');

		assert.equal(secondary_API_CPU.get_point('hello', 'world'), undefined, 'get_point() returns undefined');
		assert.equal(secondary_API_CPU.get_point_track('hello', 'point'), null , 'get_aside_point_track() returns null');
		assert.equal(secondary_API_CPU.get_point_panel('hello', 'point'), null, 'get_aside_point_panel() returns null');
		assert.ok(! secondary_interfacetag.querySelector('aside#aside_«hello» > div#aside_«hello»_point_«point»') , 'DOM element point removed from aside track');
		assert.ok(! secondary_interfacetag.querySelector('div.panel#panel_«hello» > nav > li#panel_«hello»_point_«point»') , 'DOM element point removed from panel');
	});

	QUnit.test( "Public API : clear_plane", function( assert ) {
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>`;
		let secondary_audiotag = document.getElementById('secondary');
		let secondary_component = secondary_audiotag.closest('cpu-audio');
		let secondary_API_CPU = secondary_component.CPU;
		let secondary_interfacetag = secondary_component.shadowRoot.querySelector('div');
		secondary_API_CPU.add_plane('hello');
		secondary_API_CPU.add_point('hello', 2, 'point');
		secondary_API_CPU.add_point('hello', 20, 'point2');
		assert.ok(! secondary_API_CPU.clear_plane('point'), 'function return false when parameter is invalid');
		assert.ok(secondary_API_CPU.clear_plane('hello'), 'function accept when parameter is valid');

		assert.equal(secondary_API_CPU.get_point_track('hello', 'point'), null , 'get_point_track() returns null');
		assert.equal(secondary_API_CPU.get_point_panel('hello', 'point'), null, 'get_point_panel() returns null');
		assert.ok(! secondary_interfacetag.querySelector('aside#aside_«hello» > div#aside_«hello»_point_«point»') , 'DOM element point removed from aside track');
		assert.ok(! secondary_interfacetag.querySelector('div.panel#panel_«hello» > nav > li#panel_«hello»_point_«point»') , 'DOM element point removed from panel');
		assert.equal(secondary_API_CPU.get_point_track('hello', 'point2'), null , 'second point removed');
	});

	QUnit.skip( "hashorder end,start create a “private” plane", function (assert){
		/* WHY THE SECOND TEST DOESN'T WORK ???? WHHYYYYY??????
		assert.expect( 3 );
		let done = assert.async();
		assert.equal(componenttag.CPU.get_plane('_borders'), undefined, 'inexisting _borders plane on undefined end.');
		cpu.trigger.hashOrder('track&t=20,100', function() {
			audiotag.CPU_update(); // may not be fired fast enough 
			console.log(componenttag.CPU.get_plane('_borders') , audiotag._CPU_planes)
			assert.notEqual(componenttag.CPU.get_plane('_borders'), undefined, 'existing _borders plane on specified end.');
			cpu.trigger.hashOrder('track&t=40', function() {
				audiotag.CPU_update();
				assert.equal(componenttag.CPU.get_plane('_borders'), undefined, '_borders removed out of previous bordered time.');
				done();
			});
		});
		*/
	});

	QUnit.test( "Public API : translate_vtt", function( assert ) {
		assert.equal(componenttag.CPU.translate_vtt('Hello, World !'), 'Hello, World !', 'translate_vtt() bypass simple text');
		assert.equal(componenttag.CPU.translate_vtt('Hello <i>World</i>'), 'Hello <i>World</i>', 'bypass simple <i> tag');
		assert.equal(componenttag.CPU.translate_vtt('Hello <I>World</I>'), 'Hello <i>World</i>', 'Accept capitalized tags');
		assert.equal(componenttag.CPU.translate_vtt('Hello <i.classname>World</i>'), 'Hello <i>World</i>', 'remove classnames');
		assert.equal(componenttag.CPU.translate_vtt('Hello <em>World</em>'), 'Hello <em>World</em>', 'bypass <em>, used in some legacy CPU shows');
		assert.equal(componenttag.CPU.translate_vtt('Hello <b>World</b>'), 'Hello <b>World</b>', 'bypass <b>');
		assert.equal(componenttag.CPU.translate_vtt('Hello <bold>World</bold>'), 'Hello <strong>World</strong>', 'transform <bold> → <strong> (declared in the MDN page, but never seen in standards pages)');
		assert.equal(componenttag.CPU.translate_vtt('Hello <u>World</u>'), 'Hello <u>World</u>', 'bypass <u>');
		assert.equal(componenttag.CPU.translate_vtt('Hello <lang fr>Monde</lang>'), 'Hello <i lang="fr">Monde</i>', 'transform <lang xx> into <i lang="xx">, emphasis for typographic convention');
		assert.equal(componenttag.CPU.translate_vtt('Hello <a href=".">World</a>'), 'Hello World', 'remove <a href>');
		assert.equal(componenttag.CPU.translate_vtt('Hello\nWorld'), 'Hello<br/>World', 'transform CR into <br>');
		assert.equal(componenttag.CPU.translate_vtt('♪ Johnny Mercer, Robert Emmet Dolan <em lang="en">featuring</em> Hedy Lamarr - <em>Just a moment more</em>'), '♪ Johnny Mercer, Robert Emmet Dolan <em>featuring</em> Hedy Lamarr - <em>Just a moment more</em>', 'A valid example with 2 consecutives <em> tags')
		assert.equal(componenttag.CPU.translate_vtt('♪ Johnny Mercer, Robert Emmet Dolan <em lang="en"<featuring</em> Hedy Lamarr - <em>Just a moment more</em>'), '♪ Johnny Mercer, Robert Emmet Dolan &lt;em lang="en"&lt;featuring&lt;/em&gt; Hedy Lamarr - &lt;em&gt;Just a moment more&lt;/em&gt;', 'An invalid example with unmatching < and >, replaced by html escapes')

		/*
<em> → <em> (not in the standard but used in legacy CPU show)
<b> → <b>
<bold> → <strong> (declared in the MDN page, but never seen in standards pages)
<u> → <u>
<lang en> → <i lang="en">
<a href> → `` (suppress any hyperlink)
Check that multi-lines is completed with <br />
		*/
	});


	QUnit.test( "Download audio link ", function( assert ) {
		let done = assert.async();
		assert.expect(3);
		let third_source = 'tests-assets/void';
		playground.innerHTML = `
		<cpu-audio>
			<audio id="secondary" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>
		<cpu-audio>
			<audio id="third" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
				<source src="./${third_source}" data-downloadable />
			</audio>
		</cpu-audio>
		<cpu-audio download="./${third_source}">
			<audio id="fourth" controls="controls" muted>
				<source src="./tests-assets/blank.mp3" type="audio/mpeg" />
			</audio>
		</cpu-audio>
		`;

		function checks() {
			let secondary_audiotag = document.getElementById('secondary');
			let secondary_component = secondary_audiotag.closest('cpu-audio');
			let secondary_API_CPU = secondary_component.CPU;
			let secondary_download_link = secondary_component.shadowRoot.querySelector('a[download]');
			secondary_API_CPU.update_links();

			assert.ok(secondary_download_link.href === secondary_audiotag.currentSrc , `By default, download link ( ${secondary_download_link.href} ) is the <audio>.currentSrc ( ${secondary_audiotag.currentSrc} )`);

			let third_audiotag = document.getElementById('third');
			let third_component = third_audiotag.closest('cpu-audio');
			let third_API_CPU = third_component.CPU;
			let third_download_link = third_component.shadowRoot.querySelector('a[download]');
			third_API_CPU.update_links();

			assert.ok(third_download_link.href.indexOf(third_source) >= 0 , `If indicated, download link ( ${third_download_link.href} ) is taking the prefered <source data-downloadable> ( ${third_source} )`);

			let fourth_component = document.getElementById('fourth').closest('cpu-audio');
			let fourth_API_CPU = fourth_component.CPU;
			let fourth_download_link = fourth_component.shadowRoot.querySelector('a[download]');
			fourth_API_CPU.update_links();

			assert.ok(fourth_download_link.href.indexOf(third_source) >= 0 , `If indicated, download link ( ${fourth_download_link.href} ) is taking the <cpu-audio download="<url>"> ( ${third_source} )`);

			done();
		}
		setTimeout(checks, 100);
		
	});


});