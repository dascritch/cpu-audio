const sources_i18n = {
	'fr' : {
		'loading' : 'Chargement en cours…',
		'pause' : 'Pause',
		'play' : 'Lecture',
		'canonical' : 'Lien vers la fiche du sonore',
		'moment' : 'Lien vers ce moment',

		'untitled' : '(sans titre)',
		'cover' : 'pochette',
		'more' : 'Actions',
		'share' : 'Partager',
		'twitter' : 'Partager sur Twitter',
		'facebook' : 'Partager sur Facebook',
		'e_mail' : 'Partager par e-mail',
		'download' : 'Télécharger',
		'back' : 'Annuler',

		'chapters' : 'Chapitres',
		'playlist' : 'Playlist',

		'media_err_aborted' : 'Vous avez annulé la lecture.',
		'media_err_network' : 'Une erreur réseau a causé l\'interruption du téléchargement.',
		'media_err_decode' : 'La lecture du sonore a été annulée suite à des problèmes de corruption ou de fonctionnalités non supportés par votre navigateur.',
		'media_err_src_not_supported' : 'Le sonore n\'a pu être chargé, soit à cause de sourcis sur le serveur, le réseau ou parce que le format n\'est pas supporté.',
		'media_err_unknow' : 'Erreur due à une raison inconnue.'
	},
	'en' : {
		'loading' : 'Loading…',
		'pause' : 'Pause',
		'play' : 'Play',
		'canonical' : 'Link to the sound\'s page',
		'moment' : 'Link to this time',

		'untitled' : '(untitled)',
		'cover' : 'cover',
		'more' : 'Actions',
		'share' : 'Share',
		'twitter' : 'Share on Twitter',
		'facebook' : 'Share on Facebook',
		'e_mail' : 'Share via e-mail',
		'download' : 'Download',
		'back' : 'Back',

		'chapters' : 'Chapters',
		'playlist' : 'Playlist',

		'media_err_aborted' : 'You have aborted the play.',
		'media_err_network' : 'A network error broke the download.',
		'media_err_decode' : 'Play was canceled due to file corruption or a not supported function in your browser.',
		'media_err_src_not_supported' : 'The media cannot be downloaded due to server problems, network problems or unsupported by your browser.',
		'media_err_unknow' : 'Error of unknown cause.'
	},
};

/**
 * @summary Guess usable language (returned in ISO 2 letters code) from browser preferences and host page mark-up
 * @private
 * 
 */
function guess_preferable_language() {
	// First, we'll try to guess the hosting page language
	const out = document.querySelector('html').lang;
	if ((out.length) && (out.toLowerCase() in sources_i18n)) {
		return out;
	}

	// trying to find the browser preferences
	const languages = window.navigator.languages ?? [(navigator.language || navigator.browserLanguage)];
	for (const line of languages) {
		if (line.split) {
			// we will only look (yes, this is bad) at the first level xx of any locale xx-YY code
			const [code] = line.split('-');
			if (code in sources_i18n) {
				// we still don't have a locale selected and this one is in our register, we can use it
				return code;
			}
		}
	}

	// Inexisting ? We will use english in last resort	
	return 'en';
}

export let prefered_language = guess_preferable_language();
export const __ = sources_i18n[prefered_language];
