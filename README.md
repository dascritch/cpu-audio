WebComponent version of CPU-Audio
=================================

Évolution de ondemiroir-audio-tag vers les WebComponents
Basé sur https://github.com/webcomponents/webcomponentsjs

Développé comme proof of concept dans une furie de code en matinée. D'où la perte de l'historique.

Page de démo : https://dascritch.net/vrac/.projets/audiowc/index.html

Attention, pour l'instant, n'a été testé que sur :

* Google Chrome
* Firefox Nightly (ne marche pas sur 61)

À tester sur :

* Safari iOS
* Edge
* Safari Mac

Bugs restants :

- Une erreur media n'est pas de suite remontée dans son `<cpu-audio>`. Il faut cliquer dessus pour qu'il aie effectiement lieu sur Chrome, Firefo ne le voit jamais.
- Pour que le polyfill webcomponents.js marche bien, Firefox a besoin que le CSP autorise `data:`

Fonctions à ajouter :

- ajouter des tests TDD/BDD  ... via une page de tests ?
- mode lecture auto de la playlist paramétrable (API au niveau du DOM)
- affichage de la playlist au niveau du player global
- regrouper les fonctions en dehors du niveau de l'élément (en sub genre `domobject.CPU.fx()`)
- native chapters via `<tracks>`
- support des multimedia keys, au niveau de la base DOM de la page support
- `<cpu-audio>` caché, pour playlist de `<cpu-controller>` (si son `<audio controls>` est caché par défaut ?)
- ajout dynamique d'un `<cpu-audio>`
- suppression dynamique d'un `<cpu-audio>`


Fonctions retirées :

- playlist offline
- i18n


Documentation :

* https://engineering.mixpanel.com/2018/06/12/making-web-components-work/
