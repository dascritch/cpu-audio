RELEASE NOTES Version 5.5
=========================

New features
------------
 
 * Add a [waveform in the time-line](#6).
 * [Annotations API](#57).
 * A handle on the time-line is appearing when hovering with a pointer.
 * On small screens, time-line now goes out of between-buttons space, using the full WC width to [gain precision on small screens](#58).
 * Chapters time-line are displayed on small screens, but won't be clickable.
 * All panels can be hidden via parameters, even future ones.
 * Panels can be displayed only if the media is playing.
 * [Live configurator](LIVE) can test waiting state and error state.
 * [Live configurator](LIVE) have placeholders in attribute fields.
 * [Live chapters editor](CHAPTERS_ED) can preview edited chapers in the shown player.
 * Can avoid to [not force preloading metadata](#70) and indicates an estimation instead.
 * Panels (chapters and playlist) have a hide-able title.
 * [Translating specific VTT markup into HTML tags](#59)
 * Media title is now in bold

Corrections
-----------

 * Use SPACE instead of COMMA as separators for the `hide=""` attribute (You may do changes in your previous installation)
 * Time-line won't have round ends anymore : Graphically inconsistent and not easy on small widths.
 * Less visible [graphic glitch](#61) on the loading line.
 * Error mode style correction.
 * Chapters now use [annotations API](#57).
 * Texts in chapters panel should use more space.
 * Texts in chapters panel [should not accept embeded links](#59)
 * Boxed playing (with a end timecode) now uses [annotations API](#57).
 * DOM and CSS cleanups.
 * Regression in CSS, mainly on playing mode
 * Graphic corrections on the alternative handheld navigation : buttons are centered, some are skiped on smallest screens.
 * Buttons in alternative handheld navigation now support longpresses for repeat action.
 * Functions renamed for constistancy.
 * Chapters live editor don't use anymore `<input type="time">` as [it is not a duration input, nor correctly working in 12-hours locale](#63) à la Américaine Way

Back-end
--------

Nothing
