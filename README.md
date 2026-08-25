# Rubik's Cube

L'idée de ce projet vient de mon petit frère, passionné de Rubik's Cube. Il m'a fait découvrir ce casse-tête que j'ai appris à résoudre avant qu'il ne me dépasse à son tour. Fasciné par la complexité de sa résolution, j'ai voulu comprendre si j'étais capable de la recréer moi-même : j'ai donc reconstruit chaque algorithme à partir de mes souvenirs, sans vidéo, sans tutoriel et sans aucune aide extérieure, uniquement à partir de mes expériences de résolution du cube à la main.

Simulateur de Rubik's Cube 3D développé en HTML, CSS et JavaScript.

## Fonctionnalités

- [x] Rotation des faces
- [x] Rotation des couches internes (M, E, S)
- [x] Historique des mouvements
- [x] Mélange aléatoire
- [x] Contrôles de lecture
- [x] Personnalisation des couleurs
- [x] Personnalisation des stickers (peinture)
- [x] scan IRL
- [x] Résolution complète (7/7)
- [x] Chronomètre de résolution

## Performance de l'algorithme

- Mélange aléatoire : **20 mouvements**
- Résolution : **~150 mouvements en moyenne**
- Délai entre les mouvements : **0 s**
- Record observé : **1,91 s**

Ce test permet de mesurer la capacité de l'algorithme à résoudre rapidement le cube, sans délai artificiel entre les mouvements.

## Combat humain vs ordinateur

Test réalisé à armes égales contre mon petit frère.

Son record étant d'environ **20 à 35 secondes**, j'ai fixé un délai de **0,2 s entre chaque mouvement** pour l'ordinateur. Avec une résolution moyenne de ~150 mouvements, cela représente environ **30 secondes** de délai cumulé.

> Deux manches préliminaires à **0,3 s par mouvement** ont servi de **manches de chauffe** et à **calibrer la vitesse de l'ordinateur**.

| Participant | Victoires |
|-------------|-----------|
| 🤖 Ordinateur | **6** |
| 👤 Humain | **4** |

**Résultat : 6–4 pour l'ordinateur.**

## Performances du site

Le site a été testé avec **Google Lighthouse** afin d'évaluer ses performances, son accessibilité, ses bonnes pratiques et son référencement, sur mobile et ordinateur.

[Voir les résultats du test Lighthouse](https://pagespeed.web.dev/analysis/https-seyyko-github-io-rubicksCube/xx88dhxi6j?form_factor=mobile)

| Indicateur | 📱 Mobile | 🖥️ Ordinateur |
|:---|:---:|:---:|
| **Performances** | **99/100** | **100/100** |
| **Accessibilité** | **100/100** | **100/100** |
| **Bonnes pratiques** | **100/100** | **100/100** |
| **SEO** | **100/100** | **100/100** |
| First Contentful Paint | 1,0 s | 0,3 s |
| Largest Contentful Paint | 1,1 s | 0,3 s |
| Total Blocking Time | 0 ms | 0 ms |
| Cumulative Layout Shift | 0 | 0 |
| Speed Index | 3,6 s | 0,3 s |

### Configuration des tests

- **Mobile :** émulation d'un **Moto G Power** avec une connexion **4G lente**
- **Ordinateur :** émulation ordinateur avec une limitation réseau personnalisée
- **Lighthouse :** 13.4.1
- **Date :** 25 août 2026 à 20:28 (UTC+2)
- **Navigateur :** HeadlessChromium 151.0.7922.71
- **Session :** consultation d'une seule page
- **Chargement :** page initiale

> Les valeurs peuvent varier légèrement d'un test à l'autre. Le score de performance est calculé à partir des différentes métriques mesurées par Lighthouse.

## **[Découvrir le projet](https://seyyko.github.io/rubicksCube/)**

![Aperçu du Rubik's Cube](./img/rubicksCube.png)