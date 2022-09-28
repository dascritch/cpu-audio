const expected_json_data = {
	"keymove" : 100,
	"hadPlayed" : "faked"
};

QUnit.test( "Check the host HTML for the test still have a JSON", function( assert ) {
	const tag = document.head.querySelector('script[data-cpu-audio]') 
	assert.ok( document.head.querySelector('script[data-cpu-audio]'), "We have a <script data-cpu-audio>");
	assert.equal( JSON.stringify(JSON.parse(tag.innerHTML)), JSON.stringify(expected_json_data), "JSON data is as expected");
});

QUnit.test( "Checking a permitted value modified in the tag (keymove) is overloading document.CPU", function( assert ) {
	assert.equal( document.CPU.keymove, 100 );
});

QUnit.test( "Checking a non-permitted value modified in the tag (hadPlayed) is still at default for document.CPU", function( assert ) {
	assert.equal( document.CPU.hadPlayed, false );
});
