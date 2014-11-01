<!--
	@author=Phyks
	@date=07082014-2230
	@title=Synchroniser ses ordinateurs 1/2
	@tags=Autohébergement, Phyks, Libre, Linux
-->
## Étude des solutions disponibles

J'utilise quotidiennement au moins 2 ordinateurs&nbsp;: mon ordinateur portable et mon fixe. Tous les deux ont des gros disques durs (> 1 To) et je cherche depuis quelques temps à les synchroniser pour les utiliser de façon totalement transparente avec mes fichiers (et avec la configuration utilisateur de base, tel que mon `.vimrc`, mon thème pour `rxvt-unicode`, etc.).

J'ai également un gros disque dur externe, sur lequel je veux faire des _backups_ complets réguliers de certains fichiers.

Je dois donc maintenir en permanence 3 disques durs synchronisés&nbsp;: celui de mon ordinateur fixe, de mon portable et mon disque dur externe. Faire ça à la main, c'est très long et fastidieux (et potentiellement compliqué). Je cherche donc un moyen d'automatiser tout ça proprement. De plus, j'ai un serveur dédié, avec de l'espace disque disponible, sur lequel je voudrais stocker une partie des sauvegardes, pour avoir un _backup_ décentralisé en cas de pépin.

Les solutions à envisager doivent répondre aux critères suivants&nbsp;:

* Pouvoir facilement choisir les dossiers et les fichiers à synchroniser et être capable de synchroniser de gros fichiers sans problèmes et dans des temps décents. Je veux synchroniser tout mon _home_ entre mes deux ordinateurs et mon disque dur externe, mais je ne veux pas synchroniser toutes mes musiques et vidéos avec mon serveur, pour ne pas le saturer inutilement. J'ai pas mal de scripts déjà versionnés par Git également, que je veux pouvoir exclure facilement.
* Proposer une solution de sauvegarde chiffrée (transferts chiffrés entre les postes et chiffrement de mes données sur mes serveurs).
* Permettre une architecture décentralisée, pas besoin de repasser par mon serveur pour synchroniser mes postes quand ils sont sur le même réseau local.


J'ai également repéré trois solutions potentielles&nbsp;: [Unison](http://www.cis.upenn.edu/~bcpierce/unison/), [Syncthing](http://syncthing.net/) trouvé grâce à [cet article de tmos](http://tomcanac.com/blog/2014/07/14/syncthing-alternative-libre-btsync/) et [git-annex](http://git-annex.branchable.com/) trouvé par [cet article](http://flo.fourcot.fr/index.php?post/2013/07/19/J-ai-d%C3%A9couvert-git-annex). (Je cherche bien sûr une solution _opensource_ à installer sur mon serveur)


### Unison

[Unison](http://www.cis.upenn.edu/~bcpierce/unison/) est un programme de synchronisation de fichier multiplateforme, écrit en Ocaml. Il gère les conflits automatiquement si possible, et avec intervention de l'utilisateur si besoin. Il prend un grand soin à laisser les systèmes en état fonctionnel à chaque instant, pour pouvoir récupérer facilement en cas de problèmes. Par contre, le projet était un projet de recherche initialement, et avait donc un développement très actif. Ce n'est plus le cas, et le développement est beaucoup moins actif, comme expliqué [sur la page du projet](http://www.seas.upenn.edu/~bcpierce/unison//status.html).

Autre limitation&nbsp;: il n'est possible de synchroniser que des *paires* de machines avec Unison. Cela veut dire que pour synchroniser mes 3 machines, je vais devoir utiliser une configuration en étoiles, en passant forcément par mon serveur. C'est pas top car mon portable et mon ordinateur fixe étant très souvent sur le même réseau, il peut être intéressant de s'affranchir du serveur dans ce cas, pour avoir des taux de transfert plus élevés.

Enfin, il semble assez non trivial d'avoir un chiffrement des données synchronisées, et ce n'est pas implémenté directement par Unison. Il faut donc rajouter une couche d'Encfs ou autre. [Une discussion sur le forum archlinux](https://bbs.archlinux.org/viewtopic.php?pid=1317177#p1317177) (en anglais) évoque cette possibilité, et [un post](http://www.mail-archive.com/encfs-users@lists.sourceforge.net/msg00164.html) sur la mailing-list [Encfs-users] donne quelques détails supplémentaires.


### Syncthing

(Je reprends les informations du [site officiel](http://syncthing.net/) et de [l'article de Tom](http://tomcanac.com/blog/2014/07/14/syncthing-alternative-libre-btsync/).)

Syncthing est écrit en Go. Toutes les communications sont chiffrées par TLS et chaque nœud est authentifié et doit être explicitement ajouté pour pouvoir accéder aux fichiers. Syncthing utilise donc son propre protocole, et sa propre authentification. Il est multiplateforme, a une très jolie interface et ne requiert aucune configuration particulière (il est censé fonctionner _out of the box_, en utilisant uPnP si besoin pour ne pas avoir besoin de mettre en place de translation de port).

Chaque machine peut échanger avec toutes les machines avec lesquelles il y a eu un échange d'identifiants. On peut donc très facilement choisir de construire une architecture centralisée ou décentralisée (dans le premier cas, toutes les machines n'auront que l'identifiant du serveur central, dans le deuxième cas toutes les machines auront les identifiants de toutes les autres).

Toute la configuration se fait par une jolie interface web, protégée par mot de passe. Vous pouvez partager chaque dossier comme bon vous semble, et vous pouvez même partager certains dossiers avec des personnes extérieures, à la dropbox, sans dropbox&nbsp;:). Et de par l'architecture du logiciel, il n'y a pas de _serveur_ ni de _client_ mais un seul logiciel qui tourne partout.

![La jolie interface de Syncthing](@article_path/syncthing.png)

Le code est disponible sur [Github](https://github.com/syncthing/syncthing), le dépôt est actif et les tags sont signés.

Il satisfait donc a priori la plupart de mes besoins. Il faut juste que je trouve un moyen de chiffrer mes documents sur mon serveur (mes disques sont déjà chiffrés, mais je voudrais avoir un gros conteneur déchiffré à chaque synchronisation, et verrouillé après idéalement). Apparemment, c'est [en cours de discussion](https://github.com/syncthing/syncthing/issues/109).

Concernant la gestion des conflits, elle n'a pas l'air parfaite, comme le montre [cette _issue_](https://github.com/syncthing/syncthing/issues/220) sur Github. Il semblerait que la politique actuelle soit _newest wins_ ce qui peut causer des pertes de données (une copie de sauvegarde est peut être réalisée, car SyncThing peut versionner les fichiers, mais je ne suis pas sûr de ce point, à tester).


### Git-annex

[Git-annex](http://git-annex.branchable.com/) est un programme permettant de synchroniser ses fichiers en utilisant Git. En fait, il est vu comme un plugin pour Git, et il va stocker les fichiers dans un dépôt Git, mais ne pas versionner leur contenu. Du coup, on évite de devoir versionner des gros fichiers et donc les problèmes habituels de Git avec des gros fichiers potentiellement binaires.

C'est certainement le programme le plus abouti des trois présentés ici, son développement est actif, il y a une communauté derrière (et du monde sur IRC !) et le développeur a réussi une campagne Kickstarter l'an dernier pour se financer pour travailler sur le logiciel pendant un an. Il a notamment implémenté un assistant web dernièrement, permettant de gérer ses synchronisations _via_ une interface web fort jolie à la Syncthing, en s'affranchissant de la ligne de commande. Je pense quand même que Syncthing est plus _user friendly_.

Les possibilités du logiciel, listées sur [la page du projet](http://git-annex.branchable.com) sont assez impressionnantes. Parmi les fonctionnalités avancées&nbsp;:

* Possibilité d'avoir tous les fichiers listés partout, même si leur contenu n'est pas effectivement présent sur le disque. Du coup, git-annex sait où aller chercher chaque fichier pour nous aider à nous y retrouver avec plusieurs supports de stockage (plusieurs disques durs externes de _backup_ par exemple)

* Git-annex utilise des dépôts standards, ce qui permet d'avoir un dépôt toujours utilisable, même si Git et Git-annex tombent dans l'oubli.

* Il peut gérer autant de clones qu'on veut, et peut donc servir à synchroniser selon l'architecture qu'on veut. Il est capable d'attribuer des poids différents à chaque source, ce qui veut dire que je peux synchroniser mes ordinateurs _via_ mon serveur, et si jamais ils sont sur le même réseau local, je peux synchroniser directement sans passer par mon serveur.

* Il gère plusieurs possibilités de chiffrement, pour chiffrer les copies distantes, sur mon serveur par exemple. Et il permet de chiffrer tout en partageant entre plusieurs utilisateurs. Il peut utiliser d'office un serveur distant tel qu'un serveur sur lequel on a un accès SSH (et les transferts sont immédiatement chiffrés par SSH du coup) ou encore un serveur Amazon S3.

* Possibilité de partager des fichiers avec des amis en utilisant un serveur tampon. Ce serveur stocke uniquement les fichiers en cours de transfert et n'a donc pas besoin d'un espace disque considérable.

* Il gère les conflits.

* Il peut utiliser des _patterns_ pour exclure des fichiers, ou les inclure au contraire. On peut faire des requêtes complètes telles que "que les MP3 et les fichiers de moins de N Mo".

* Bonus&nbsp;: il peut être utilisé pour servir un dossier semblable à mon [pub.phyks.me](http://pub.phyks.me), que j'implémenterai sûrement du coup, pour permettre de cloner tout mon `pub` directement.

Plusieurs _screencasts_ sont disponibles dans la [documentation](http://git-annex.branchable.com/assistant/) et un retour en français est disponible [ici](http://flo.fourcot.fr/index.php?post/2013/07/19/J-ai-d%C3%A9couvert-git-annex).

Ses points forts ont vraiment l'air d'être ses fonctions avancées et la possibilité de gérer finement la localisation des fichiers. Git-annex ne se contente pas de vous permettre de synchroniser des fichiers, mais aussi de les déplacer géographiquement, partager et sauvegarder.



## Conclusion (temporaire)

J'ai repéré trois solutions envisageables pour l'instant&nbsp;: Unison, SyncThing et git-annex, par ordre de fonctionnalités. Les informations précédentes sont uniquement issues des articles, documentations et retours d'utilisateurs. SyncThing a l'air le plus _user friendly_ de tous, et il a des fonctionnalités intéressantes et avancées. git-annex est clairement celui qui a le plus de fonctionnalités, mais il est donc également plus compliqué à prendre en main.

Après cette analyse, je pense donc partir sur git-annex pour mettre en place mes sauvegardes. Rendez-vous bientôt pour la deuxième partie de cet article, avec un retour complet sur ma procédure de synchronisation (dans quelques temps quand même… faut que je réfléchisse à mon truc et que je dompte git-annex =).


## Notes

* Après réflexion, utiliser le disque dur externe en plus fait beaucoup de redondance. Du coup, si je ne peux synchroniser qu'une partie de mes fichiers sur celui-ci, c'est encore mieux (par exemple que ma bibliothèque de musiques / films).

* Une autre solution qui pourrait vous intéresser est [Tahoe-LAFS](https://tahoe-lafs.org/trac/tahoe-lafs) qui distribue vos fichiers sur plusieurs serveurs de sorte qu'aucun serveur ne puisse connaître vos données, et que si un serveur est en panne, vous puissiez toujours les récupérer (par défaut il utilise 10 nœuds pour le stockage et ne nécessite que 3 nœuds pour reconstituer les données, si j'ai bien compris). Voir aussi [cette vidéo sur rozoFS](http://numaparis.ubicast.tv/videos/rozofs/) à PSES 2014, pour avoir une idée de comment cela fonctionne.

* Un `rsync` basique ne me suffit pas, car je dois pouvoir gérer des modifications des deux côtés de la connexion à la fois, et pouvoir gérer les conflits.
