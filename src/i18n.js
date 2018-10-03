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
        'e-mail' : 'Share via e-mail',
        'download' : 'Download',
        'back' : 'Back',

        'media_err_aborted' : 'You have aborted the play.',
        'media_err_network' : 'A network error broke the download.',
        'media_err_decode' : 'Play was canceled due to file corruption or a not supported function in your browser.',
        'media_err_src_not_supported' : 'The media cannot be downloaded due to server problems, network problems or unsupported by your browser.',
        'media_err_unknow' : 'Error of unknown cause.'
    },
};


let prefered_language = 'fr';
let languages = window.navigator.languages ;
languages = (languages !== undefined) ? 
            languages : 
            [(navigator.language || navigator.browserLanguage)];
let added = false;
for (let entry in languages) {
    let line = languages[entry];
        if (line.split) {
            // on extrait le code générique xx de xx-YY 
            let code = line.split('-')[0];
            if ((!added) && (typeof i18n_source === 'object') && (i18n_source !== null) && (    i18n_source[code] !== undefined)) {
            prefered_language = code;
        }
    }
}

const __ = sources_i18n[prefered_language];