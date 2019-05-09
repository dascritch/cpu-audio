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
 * [Live configurator](LIVE) can test waiting state and error state.
 * [Live chapters editor](CHAPTERS_ED) can preview edited chapers in the shown player.

Corrections
-----------

 * Timeline won't have any more round ends : Graphically inconsistent and not easy on small widths.
 * Less visible [graphic glitch](#61) on the loading line.
 * Error mode style correction.
 * Chapters now use [annotations API](#57).
 * Titles in chapters panel should use more space.
 * Boxed playing (with a end timecode) now uses [annotations API](#57).
 * DOM and CSS cleanups.
 * Graphic corrections on the alternative handheld navigation : buttons are centered, some are skiped on smallest screens.
 * Buttons in alternative handheld navigation now support longpresses for repeat action.
 * Panels (chapters and playlist) have a title.
 * Functions renamed for constistancy.

Back-end
--------

Nothing
