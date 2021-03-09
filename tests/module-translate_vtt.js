/**

Not working in CLI context, but only in Browser context.
should use https://github.com/trentmwillis/qunit-in-browser ?

import {translate_vtt} from '../src/translate_vtt.js';

QUnit.test( "Public API : translate_vtt", function( assert ) {
	assert.equal(translate_vtt('Hello, World !'), 'Hello, World !', 'translate_vtt() bypass simple text');
	assert.equal(translate_vtt('Hello <i>World</i>'), 'Hello <i>World</i>', 'bypass simple <i> tag');
	assert.equal(translate_vtt('Hello <I>World</I>'), 'Hello <i>World</i>', 'Accept capitalized tags');
	assert.equal(translate_vtt('Hello <i.classname>World</i>'), 'Hello <i>World</i>', 'remove classnames');
	assert.equal(translate_vtt('Hello <em>World</em>'), 'Hello <em>World</em>', 'bypass <em>, used in some legacy CPU shows');
	assert.equal(translate_vtt('Hello <b>World</b>'), 'Hello <b>World</b>', 'bypass <b>');
	assert.equal(translate_vtt('Hello <bold>World</bold>'), 'Hello <strong>World</strong>', 'transform <bold> → <strong> (declared in the MDN page, but never seen in standards pages)');
	assert.equal(translate_vtt('Hello <u>World</u>'), 'Hello <u>World</u>', 'bypass <u>');
	assert.equal(translate_vtt('Hello <lang fr>Monde</lang>'), 'Hello <i lang="fr">Monde</i>', 'transform <lang xx> into <i lang="xx">, emphasis for typographic convention');
	assert.equal(translate_vtt('Hello <a href=".">World</a>'), 'Hello World', 'remove <a href>');
	assert.equal(translate_vtt('Hello\nWorld\nHow are you ?'), 'Hello<br/>World<br/>How are you ?', 'transform CR into <br>');
	assert.equal(translate_vtt('♪ Johnny Mercer, Robert Emmet Dolan <em lang="en">featuring</em> Hedy Lamarr - <em>Just a moment more</em>'), '♪ Johnny Mercer, Robert Emmet Dolan <em>featuring</em> Hedy Lamarr - <em>Just a moment more</em>', 'A valid example with 2 consecutives <em> tags')
	assert.equal(translate_vtt('♪ Johnny Mercer, Robert Emmet Dolan <em lang="en"<featuring</em> Hedy Lamarr - <em>Just a moment more</em>'), '♪ Johnny Mercer, Robert Emmet Dolan &lt;em lang="en"&lt;featuring&lt;/em&gt; Hedy Lamarr - &lt;em&gt;Just a moment more&lt;/em&gt;', 'An invalid example with unmatching < and >, replaced by html escapes')
});

*/