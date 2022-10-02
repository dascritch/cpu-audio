/**
 * @public
 * @summary Determines if audiotag is currently playing.
 *
 * @param      {HTMLAudioElement}   audiotag  The audiotag
 * @return     {boolean}  True if audiotag playing, False otherwise.
 */
export const isAudiotagPlaying = function(audiotag) {
	const currentAudiotagPlaying = document.CPU.currentAudiotagPlaying;
	return (currentAudiotagPlaying) && (audiotag.isEqualNode(currentAudiotagPlaying));
};

