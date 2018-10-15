function check_focus() {
    console.info('check_focus ', document.hasFocus())
    document.body.style.background = document.hasFocus() ? 'white' : 'grey';
}

check_focus();
document.addEventListener('focus', check_focus)
document.addEventListener('blur', check_focus)


if (!document.hasFocus()) {
    alert('Please click on the web view, giving focus, to autorize the audio tag. Else, numerous tests will fail. See issu 17 on our github for details : https://github.com/dascritch/cpu-audio/issues/17 .');
}



var audiotag = document.getElementById('track');

QUnit.test( "Checking browser abilities for WebComponents", function( assert ) {
	assert.ok( window.customElements !== undefined, "window.customElements" );
});

QUnit.test( "<audio> tag API, fallback suite for seekElementAt()", function( assert ) {
	assert.ok( audiotag.fastSeek !== undefined, "seekElementAt can use audiotag.fastSeek" );
	assert.ok( audiotag.currentTime !== undefined, "seekElementAt can use audiotag.currentTime" );
});


