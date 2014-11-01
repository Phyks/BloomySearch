<!--
	@author=Phyks
	@date=26102014-2240
	@title=Balancer le son de ses hauts-parleurs sur le réseau
	@tags=Arch, Linux
-->

J'ai un PC fixe et un portable, et je cherchais un moyen de balancer le son de mon portable sur les hauts-parleurs de bonne qualité branchés sur mon PC fixe, quand je suis sur le même réseau. Et en fait, c'est très simple à faire avec PulseAudio.


## La première méthode, simple, qui marche partout

S'assurer d'avoir `pulseaudio` configuré sur ses ordinateurs, et installer `paprefs`. Lancer `paprefs` et dans l'onglet `Multicast/RTP`, cocher la case _receiver_ sur le PC sur lequel les hauts-parleurs sont branchés, et la case _sender_ sur l'autre.

Sur le PC qui envoie la musique (_sender_), vous avez le choix entre trois options, dont seulement deux nous intéressent : `Send audio from local speakers` (qui enverra tout le son local sur les hauts-parleurs distants) et `Create separate audio device for Multicast/RTP` (qui vous rajoutera une sortie son `Multicast/RTP` que vous pourrez utiliser ou non, par application).

Si vous n'avez pas de pare-feu et que vous êtes bien sur le même réseau, c'est tout ce que vous avez à faire !

Par contre, vous remarquerez vite que la qualité n'est pas top (au moins chez moi) : un bon FLAC d'un côté ressort vite comme un MP3 64k d'il y a quelques années de l'autre côté…


## La deuxième solution, encore plus simple, qui marche mieux !

La deuxième solution consiste à utiliser les deux premiers onglets de `paprefs` : `Network Access` et `Network Server`.

Sur le PC qui envoie le son, cochez la case `Make discoverable PulseAudio network sound devices available locally` dans le premier onglet.

Sur le PC qui reçoit le son, cochez les trois premières cases (`Activer l'accès réseau aux périphériques de son locaux`).

Et c'est tout =) Vous aurez désormais les sorties audio de votre autre PC qui apparaîtront chez vous (par exemple dans `Audio -> Périphérique audio` dans VLC). Et pour le coup, plus aucun problème de qualité à signaler ! Testé en filaire, et aucun problème de débit / lag / son à signaler pour l'instant.

À noter cependant que chez moi, j'ai deux sorties qui sont disponibles, une appelée `Audio interne…` et l'autre appelée `Simultaneous output to Audio interne…`. Si j'utilise la deuxième, j'ai le son qui saute, et c'est inutilisable, mais la première fonctionne nickel.


## Références

Principalement un seul lien : [http://www.freedesktop.org/wiki/Software/PulseAudio/Documentation/User/Network/#index2h3](http://www.freedesktop.org/wiki/Software/PulseAudio/Documentation/User/Network/#index2h3). Mais ils font tout à coup de ligne de commande et c'est en fait bien plus simple de passer par paprefs.
