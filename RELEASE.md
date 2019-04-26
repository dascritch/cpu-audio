RELEASE NOTES Version 5.5
=========================

New features
------------
 
 * Add a [waveform in the time-line](#6)
 * [Annotations API](#57)
 * A handle on the time-line is apperaing when hovering with a pointer
 * On small screens, time-line now goes out of button space, using the full WC width to [have more precisions on small screens](#58).
 * Chapters time-line are displayed on small screens, but won't be clickable.
 * All panels can be hidden via parameters, even future ones.

Corrections
-----------

 * Timeline won't have any more round ends : Graphically inconsistent and not easy on small widths.
 * Chapters now use [annotations API](#57).
 * Boxed playing (with a end timecode) now uses [annotations API](#57)
 * Simplified DOM
 * Panels (chapters and playlist) have a title
 * Functions renamed for constistancy

Back-end
--------

Nothing
