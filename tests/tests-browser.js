
var audiotag = document.getElementById('track');

QUnit.test( "Checking browser abilities for WebComponents", function( assert ) {
	assert.ok( window.customElements !== undefined, "window.customElements" );
});

QUnit.test( "<audio> tag API, fallback suite for seekElementAt()", function( assert ) {
	assert.ok( audiotag.fastSeek !== undefined, "seekElementAt can use audiotag.fastSeek" );
	assert.ok( audiotag.currentTime !== undefined, "seekElementAt can use audiotag.currentTime" );
});


