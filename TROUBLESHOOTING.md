Troubleshooting
---------------

Those are the most frequents problems you will encounters after installing our player :

- [Chrome, Chromium and Safari aren't firing any error messages](https://github.com/dascritch/cpu-audio/issues/24) if the audio source cannot be loaded. It may come from a bad declaration, from CSP/CORS situation. Check your devtools on your browser (usually by pressing <kbd>F12</kbd>). If your player stays indefinetively in “loading” mode, please try with Firefox.

- Audio and track files may not be able to download if served from another server : See your CORS, or [add a `crossorigin=""` attribute on `<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes)

- Hide an element only if the chapter track of a player is properly displayed. This one is tricky.

- You've put the script in your page, linked to another website, but there is no player, and it won't start at the desired timestamp : You need to have the script installed also in the target web page.

- Sometimes, a chapter WebVTT file will load but won't be displayed. You can check its conformity with <https://quuz.org/webvtt/>

