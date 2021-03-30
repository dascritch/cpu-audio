TO DO list
==========

Todo for this release :
-----------------------

 - at start of press on time line, popup time display "0:00" ? Only on Chrome Android
 - Aria roles on fine position buttons
 - We still have a flashing chapters before the one clicked in panel. There is something to clean up, probable root cause is my (voluntary) 206 defaillant web server or bad seeking/caching by Chrome. Really hard to reduce, the only way to mitigate it correctly is using css transitions :/
 - [Chrome Android got a failing test #121](#121) 
 - [Automated example page generated for each theme from make.sh #124](#124)
 - Implement <kbd>↑</kbd> and <kbd>↓</kbd> keys to move on chapters and playlists ([#108](#108))
 - Create a square player with a very different layout


Planned evolutions
------------------

- [ ] Standards first
    - [ ] use standard [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) in `hashOrder`, instead of the custom code. We need a strategy to get the anchor, seen as a key without value
- [ ] add-ons packages
    - [ ] wordpress
- [ ] `<video>` support
- [ ] `<track>` support for subtitles
	- [ ] better `srclang=""` support
- [ ] Sharing service companion
    - [ ] [Create a real playlist service](https://github.com/dascritch/cpu-audio/issues/8)
    - [ ] [Supporting annotations à la SoundCloud](https://github.com/dascritch/cpu-audio/issues/10)
- [ ] [Prepare design and key bindings for RTL localizations](https://github.com/dascritch/cpu-audio/issues/26)
- [ ] Propose a code snippet in `examples/` to do a `ticker` plane track mode
- [ ] Example add-son with FFT analyzer, like in [webcammictester](https://webcammictest.com/check-mic.html)

<!-- {% include footer.html %} -->
