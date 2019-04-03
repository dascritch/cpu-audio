RELEASE NOTES Version 5.4
=========================

New features
------------
 
 * Expandable modes on first play [#50](https://github.com/dascritch/cpu-audio/issues/50)
 * Compact mode now shows poster
 * Poster is hideable
 * Configurable color transitions
 * Titles on the chapters line indicator (wide screens only)
 * Public API documented
 * Adding classes to `document.body`'s host
 * Chapter live editor now has a preview

Corrections
-----------

 * Reducing DOM elements, use more explicit tag names
 * Request to use 48px instead of 32px on small width, in respect with your thumb surface
 * Fix title height, better title presentation
 * Better CSS reset
 * Chapters changing events, limiting repaints
 * Old bugs in tests due to new autoplay policy in browsers
 * Minimal public API tests
 * Indicate source url filename in chapters editor
 * Public methods should have javadoc [#49](https://github.com/dascritch/cpu-audio/issues/49)
 * Adding CSS breakpoint demos
 * Missing and imprecisions in doc are cleaned

Back-end
--------

 * Use proper IIFE generator. Wrong side : Firefox doesn't read the map
