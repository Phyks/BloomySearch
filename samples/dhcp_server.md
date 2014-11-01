<!--
	@author=Phyks
	@date=18102014-2240
	@title=Utiliser son PC sous Arch pour connecter un Raspberry Pi à Internet
	@tags=Arch, Dev, Linux
-->

J'ai un Raspberry Pi et mon portable sous Arch Linux, et je me promène pas mal avec les deux. Mais je n'ai pas toujours de routeur à disposition pour brancher les deux sur le même réseau et travailler facilement. Il est très simple de mettre en place en 5 minutes une configuration me permettant de connecter le Raspberry Pi sur mon portable, et de partager la connexion Internet issue du wifi de mon PC avec le Raspberry Pi. Comme ça, plus de problèmes, je peux bosser sur le Raspberry Pi n'importe où.

C'est parti !

*Note* : J'utilise cette configuration pour développer, et elle n'est donc pas forcément optimale et devrait sûrement être adaptée pour être utilisée en production.

## Installation d'un serveur dhcp sur le portable

Commençons par installer un serveur dhcp sur le PC avec Arch, pour éviter de devoir saisir une adresse IP fixe sur le Raspberry Pi. Comme ça, on peut utiliser n'importe quelle image sans réfléchir, comme si on avait un routeur qui va bien.

Le plus simple est de suivre [cette page de la documentation](https://wiki.archlinux.org/index.php/Dhcpd).

1. On attribue une adresse IP fixe à l'interface ethernet (ici 192.168.192.1, attention à ce que ça ne rentre pas en conflit avec votre configuration réseau).

<pre><code>ip link set up dev enp4s0f2
ip addr add 192.168.192.1/24 dev enp4s0f2
</code></pre>

2. Déplacer le fichier `/etc/dhcpd.conf` fourni par défaut vers `/etc/dhcpd.conf.example` pour pouvoir le modifier sereinement.

3. Éditer le fichier `/etc/dhcpd.conf`. À titre indicatif, voici le mien :

<pre><code>option domain-name-servers 8.8.8.8, 8.8.4.4;

option subnet-mask 255.255.255.0;
option routers 192.168.192.1;
subnet 192.168.192.0 netmask 255.255.255.0 {
    range 192.168.192.10 192.168.192.20;
}
</code></pre>

Je spécifie d'utiliser les serveurs DNS de Google (qui sont disponibles partout -si vous avez un serveur sur votre ordinateur, vous pouvez le mettre à la place), que le routeur est à l'adresse `192.168.192.1` et que j'attribue des adresses dans la gamme `192.168.192.10-192.168.192.20`.

4. Vous pouvez lancer le service dhcpd avec `systemctl start dhcpd4`. Je préfèrais restreindre l'interface sur laquelle le serveur DHCP tournait, pour ne l'utiliser que sur l'interface ethernet. Pour se faire, il suffit de suivre les instructions « Listening on only one interface - Service file » de la [documentation Arch Linux](https://wiki.archlinux.org/index.php/Dhcpd).


## Configuration du pare-feu et du noyau

Il faut ensuite configurer `iptables` et le noyau pour rediriger les paquets réseau vers le Raspberry Pi.

Pour ce faire,

<pre><code>iptables -A FORWARD -o wlp3s0 -i enp4s0f2 -s 192.168.192.1/24 -m conntrack --ctstate NEW -j ACCEPT
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A POSTROUTING -t nat -j MASQUERADE
</code></pre>

et on dit active le _forwarding_ dans le noyau :

<pre><code>echo 1 | tee /proc/sys/net/ipv4/ip_forward
</code></pre>


## Le script qui va bien

Une fois le serveur `dhcpd` configuré, [ce script](https://snippet.phyks.me/?snippet=5442cd90a8204) permet de tout démarrer / arrêter.

Attention, le _flush_ dans la fonction `stop` peut être trop brutal pour vous.
