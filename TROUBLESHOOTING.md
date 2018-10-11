Troubleshoots
-------------

- A broken image / "cover" text appears instead of the cover : You didn't provide a cover and there is no fallback declared image. Add a `poster="<url>"` attribute with a valid image url on `<cpu-audio>`
- Audio and track files may not be able to download if served from another server : See your CORS, or [add a `crossorigin=""` attribute on `<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_settings_attributes)

- Hide an element only if the chapter track of a player is properly displayed. This one is tricky.

- I've put the script in my page, linked to another website, but there is no player, and it won't start at the desired timestamp : You need to have the script installed also in the target web page.

- Sometimes, a chapter file will load but won't be displayed. You can check with <https://quuz.org/webvtt/>

{% include footer.html %}