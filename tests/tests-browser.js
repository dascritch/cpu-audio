function check_focus() {
    document.body.style.background = document.hasFocus() ? 'white' : 'grey';
}

check_focus();
document.addEventListener('focus', check_focus)
document.addEventListener('blur', check_focus)


if (!document.hasFocus()) {
    alert('Please click on the web view, giving focus, to autorize the audio tag. Else, numerous tests will fail. See issue 17 on our github for details : https://github.com/dascritch/cpu-audio/issues/17 .');
}



const audiotag = document.getElementById('track');

QUnit.test( "Checking browser abilities for WebComponents", function( assert ) {
	assert.ok( window.customElements !== undefined, "window.customElements" );
});

QUnit.test( "Checking browser can use ECMA 2019", function( assert ) {
	assert.ok( Object.fromEntries !== undefined, "Object.fromEntries" );
});


QUnit.test( "<audio> tag API, fallback suite for seekElementAt()", function( assert ) {
	assert.ok( audiotag.fastSeek !== undefined, "seekElementAt can use audiotag.fastSeek" );
	assert.ok( audiotag.currentTime !== undefined, "seekElementAt can use audiotag.currentTime" );
});

// Check ECMA 2019 : Object.from*

// Check ECMA 2020