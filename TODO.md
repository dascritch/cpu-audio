TO DO list
==========

For release 7.1
---------------

 - On-the-fly generated spectrogram, as add-on and on the chapters_editor ([#117](#117))
 - Alternative fine browsing mode on Safari ([#150](#150))
 - Focus outline of WebComponent on Safari ([#151](#151))
 - Aria roles on fine position buttons
 - [Automated example page generated for each theme from make.sh #124](#124)
 - Full test comparing campaign of all available platforms ([#138](#138)), ([#113](#113))
 - Udpate dotclear addon companion ([#67](#67))
 - Resolve failing test only on Chrome Android ([#121](#121)) may be linked to event engine on this very specific software
 - Resolve specific autostart issue on Safari iPhone #149

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
- [ ] Example add-on with FFT analyzer, like in [webcammictester](https://webcammictest.com/check-mic.html)

