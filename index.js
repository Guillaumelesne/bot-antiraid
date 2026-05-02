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

// Charger la blacklist
let blacklist = [];

if (fs.existsSync('./blacklist.json')) {
    blacklist = JSON.parse(fs.readFileSync('./blacklist.json', 'utf8'));
}

// Quand le bot est prêt
client.once('clientReady', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
});

// Quand un membre rejoint
client.on('guildMemberAdd', async (member) => {
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