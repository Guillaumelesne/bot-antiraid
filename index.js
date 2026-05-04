require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

// Création du client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// Fonction pour charger la blacklist dynamiquement
function loadBlacklist() {
    if (fs.existsSync('./blacklist.json')) {
        return JSON.parse(fs.readFileSync('./blacklist.json', 'utf8'));
    }
    return [];
}

// Quand le bot est prêt
client.once('clientReady', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

// Quand un membre rejoint
client.on('guildMemberAdd', async (member) => {
    const blacklist = loadBlacklist(); // recharge à chaque join

    if (blacklist.includes(member.id)) {
        try {
            await member.ban({ reason: 'Blacklist automatique' });
            console.log(`Banni automatiquement : ${member.user.tag}`);
        } catch (err) {
            console.error('Erreur ban :', err);
        }
    }
});

// Connexion du bot
client.login(process.env.TOKEN);