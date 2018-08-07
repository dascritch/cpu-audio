
var audiotag = document.getElementById('track');

test( "Checking browser abilities for WebComponents", function() {
	ok( window.customElements !== undefined, "window.customElements" );
});

test( "<audio> tag API, fallback suite for seekElementAt()", function() {
	ok( audiotag.fastSeek !== undefined, "seekElementAt can use audiotag.fastSeek" );
	ok( audiotag.currentTime !== undefined, "seekElementAt can use audiotag.currentTime" );
});


