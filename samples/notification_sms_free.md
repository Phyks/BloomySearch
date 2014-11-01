<!--
	@author=Phyks
	@date=30072014-1500
	@title=Recevoir ses emails par SMS avec Free Mobile
	@tags=Dev, Phyks
-->

*Edit* : Cela fait bientôt une semaine que l'API Free me renvoie un 402, en boucle… je ne peux plus envoyer de SMS depuis l'API. Je ne sais pas combien de temps ça va durer, à suivre… mais du coup c'était pas forcément une super idée… soyez prévenus ! :)

Si vous êtes client Free Mobile (forfait à 2€ ou à 19€), sachez que Free met à disposition gratuitement une [API d'envoi de SMS](http://www.freenews.fr/spip.php?article14817). _Via_ un appel HTTP, vous pourrez désormais vous envoyer des notifications par SMS (uniquement à destination de votre numéro donc), ce qui fait le plus grand bonheur des utilisateurs de solutions domotiques.

Dans cet article, je vais l'utiliser dans un but différent : recevoir mes emails par SMS. Je pars d'ici peu pour une semaine à l'étranger (pas de connexion internet…) et ai besoin de relever mes emails régulièrement. Grâce à ce service, je vais pouvoir les recevoir par SMS.

_Note_ : Recevoir ses emails par SMS peut poser des problèmes de vie privée, votre opérateur voyant passer tous vos SMS notamment. Ça peut être d'autant plus gênant si vous recevez des rappels de mot de passe par email, qui vous seront transmis par SMS.

Je me suis grandement inspiré de [cet article](http://louis.jachiet.com/blog/?p=228) mais ai réécrit le script. Le script ci-dessous est donc en Python (que je maîtrise mieux que Perl), gère plusieurs serveurs et se connecte en IMAP à vos boîtes, pour pouvoir récupérer des emails chez Gmail and cie, pour lesquels on ne peut pas mettre de règles `procmail`. Dans mon script, les identifiants / mots de passe sont en clair pour pouvoir l'éxecuter _via_ une `crontask`. Si vous ne contrôlez pas le serveur sur lequel vous faites tourner ce script ou ne réglez pas correctement les permissions, attention à vos mots de passe !


Première étape, il faut aller activer l'option sur votre compte. Sur le site de Free, Gérer mon compte → Mes Options → Notifications par SMS → Activer. Vous pourrez alors récupérer votre clé d'API.

Deuxième étape, récupérer [ce script](https://github.com/Phyks/Emails_SMS_Free_Mobile_API) qui va vous permettre de vous connecter à vos boîtes IMAP.

Troisième étape, éditer le script pour correspondre à vos besoins. Tous les paramètres à modifier sont entre des commentaires `# EDIT BELOW ACCORDING TO YOUR NEEDS` et `# YOU SHOULD NOT HAVE TO EDIT BELOW`. Il vous faudra ajouter vos serveurs IMAP (serveur, login et mot de passe, et boîte à utiliser (par-défaut, INBOX)). Vous pouvez ajouter autant de serveurs que vous voulez en dupliquant les dictionnaires au sein de la liste `imap_servers`. Il vous faudra également éditer votre login pour l'API (`IDENT`, identifiant de connexion au compte) et la clé d'API à utiliser (`PASS`).

_Note_: L'URL ne devrait pas avoir besoin d'être modifiée, et `save_path` est le fichier JSON utilisé pour stocker les identifiants des emails relevés (et uniquement les identifiants), pour ne pas renvoyer la même notification plusieurs fois.

Finalement, il ne reste plus qu'à mettre ce script sur un de vos serveurs (ou une machine allumée suffisamment souvent), et à le lancer _via_ une `crontask`, par exemple `*/15 * * * * python3 ./mails_sms_free.py > .mails_sms_free.log` pour relever vos emails toutes les 15 minutes.

_Note_ : J'utilise ce script depuis une journée sans problèmes, mais il est sûrement imparfait. N'hésitez pas à [me signaler](https://phyks.me/contact.html) (ou _via_ les _issues_ Github) d'éventuels problèmes rencontrés.
