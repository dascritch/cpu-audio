FAQ
===

(Which means in French « Foire Aux Questions » and I think it's beautiful)

What means « CPU » in « CPU-Audio » ?
-------------------------------------

« CPU » Is the radio program I've started in 2015 with a bunch of friends for a local punk radio station (Radio FMR in Toulouse, France). « CPU » is the accronym for « Carré Petit Utile » (Square, Small, Useful).

This radio program was started with numerous projects, as some tools for producing, some liquid soap code for programming a radio feed with excerpts with tags and themes, and so, a rewrite for cpu-audio.js

In fact, the basis of cpu-audio.js are back from 2010, from my previous radio show, a weekly 2 hours program about comics and movies. And I wanted on my website to point some segments as link. I've started something, and a friend, [Thomas Parisot](https://github.com/oncletom) (which was working at BBC R&D at that moment) pointed me on [Media Fragment standard from the W3C](https://www.w3.org/TR/media-frags/) which was exactly what I was looking for.


Why using URL ?
---------------

Because URL is a standard, actually mesestimated. But it's universal, portable, for both local and internet usage. I wish people will start pointing some moment in an audio content of a webpage by giving a standard URL with a timecode in it.


Why have you done (x) choice ?
------------------------------

May be [I've written about it on my blog.](https://www.w3.org/TR/media-frags/) But It's in French. What is really fun with the web is the ability to remix webpages contents, so you can use any translator on it.

May be I didn't explained what is interesting you. Write me, I'll respond.


The player is ugly
------------------

Yes ! It is only a proof of concept. That why version 7 sports a theme system. I'm sure someone will do a very better looking one than mine !


You're talking about SoundClound in some code comments and tickets
------------------------------------------------------------------

It's true.

I'm piss of that musicians, benevolent radio producers and community reporters are using SoundCloud or (even worst) MixCloud. The main issue was commenting onsome time points. At this moment, Mastodon didn't start but we already have its decentralized system, and there also was a W3C standard written for comments in a webpage.


I want to use it in my (professionnal) service, but i'm needing help. Will you ?
--------------------------------------------------------------------------------

Yes, I can. And you can write me.


Is it portable to video ?
-------------------------

Yes.

In fact, most of standards used in cpu-audio.js are simply polyfills because the `<audio>` tag is less considerated than the `<video>` grand-brother. 

If someone needs it, I'm ready to work with him to complete.



Sincerely, Xavier Mouton-Dubosc
aka "Da Scritch"