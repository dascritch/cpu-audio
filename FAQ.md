FAQ
===

(Which means in French « Foire Aux Questions » and I think it's beautiful)

What means « CPU » in « CPU-Audio » ?
-------------------------------------

[« CPU » is the radio program](http://cpu.pm) I've started in 2015 [with a bunch of friends](https://cpu.dascritch.net/pages/Dev-team) for a [notorious local punk radio station (Radio FMR in Toulouse, France)](http://www.radio-fmr.net). **« CPU » is the accronym for « Carré Petit Utile » (Square, Small, Useful)**.

This radio program was started with numerous projects, as some tools for producing, some liquid soap code for programming a radio feed with excerpts with tags and themes, and so, a rewrite for cpu-audio.js

In fact, the basis of cpu-audio.js are back from 2010, from my previous radio show, a weekly 2 hours program about comics and movies. And I wanted on my website to point some segments as link. I've started something, and a friend, [Thomas Parisot](https://github.com/oncletom) (which was working at BBC R&D at that moment) pointed me on [Media Fragment standard from the W3C](https://www.w3.org/TR/media-frags/) which was exactly what I was looking for.


Why using URL ?
---------------

**Because URL is a standard**, actually mesestimated. But it's universal, accessible, portable, for both local and internet usage. And there is [a W3C standard for pointing geometric or timestamp position : Media Fragments](https://www.w3.org/TR/media-frags/). I wish people will start pointing some moment in an audio content of a webpage by giving a standard URL with a timecode in it.


Why have you done (x) choice ?
------------------------------

May be [I've written about it on my blog.](https://dascritch.net/post/2018/11/06/Reconstruire-son-lecteur-audio-pour-le-web) But It's in French. What is really fun with the web is the ability to remix webpages contents, so you can use any translator on it.

May be I didn't explained what is interesting you. Write me, I'll respond.


Is it GDPR compliant ?
----------------------

**Yes.** 

cpu-audio is storing curently playing audio source and position, in order to set the same playing audio at the exact same position later. But that data is stored only in the client browser, is not nominative and never transmitted to a third-part service.

As I was involved to GDPR compliance in my day job and co-hosting some cryptoparties, It is an important point for me.


The player is ugly
------------------

Yes ! It is only a proof of concept and I'm only a coder. **That why version 7 sports a theme system.** I'm sure someone will do a very better looking one than mine !

If you wish to participate to this project, please have a look to [CONTRIBUTING.md](CONTRIBUTING.md).


You're talking about SoundCloud in some code comments and tickets
-----------------------------------------------------------------

**It's true.**

I'm piss of that musicians, benevolent radio producers and community reporters are using SoundCloud or (even worst) MixCloud. Why don't they are opening their websites with their graphical universe and without profiling web habits from their fans ?

The main issue was commenting on some time points to engage their community. At this moment, Mastodon didn't start but we already have its decentralized system, and there also was a W3C standard written for comments in a webpage.

At the beginning of version 3, we were also thinking about a really decentralized playlist system : The user should have a WebExtension companion, and can select some sounds among surfing.

**It's up to you** to make those projects alive ! See ([#8](#8)), ([#10](#10)), and ([#76](#76))


I want to use it in my (professionnal) service, but i'm needing help. Will you ?
--------------------------------------------------------------------------------

Yes, **I can.** And you can write me.


What happens is the client browser is a little old ?
----------------------------------------------------

If the client browser is old enough to not [support WebComponents](https://caniuse.com/custom-elementsv1) but still supports `<audio>` tag features, cpu-audio.js will run in [graceful degradation mode (even it was written in progressive enhancement fashion)](https://www.w3.org/wiki/Graceful_degradation_versus_progressive_enhancement) :

- The standard interface for the `<audio>` tag will be shown
- Hash timecoded URL will work
- Listening position will be stored and recalled

It is the case of Internet Explorer 11. Other browsers since the last 4 years must be enough. Yes, even for Safari.

The best practice is to write an informative message inside `<cpu-audio>` tag to ask visitors to update the software in their computers for their own security.


Is it portable to video ?
-------------------------

**Yes.**

In fact, most of standards used in cpu-audio.js are simply polyfills because the `<audio>` tag is less considerated than the `<video>` grand-brother. 

If someone needs it, I'm ready to work with him to complete.


Who are you ?
-------------

A web dev from Toulouse, France, in the quest for a better code, better practices and a better web.

Sincerely, Xavier Mouton-Dubosc, *aka* "Da Scritch".