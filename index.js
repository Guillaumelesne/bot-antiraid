require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// Charger blacklist
function loadBlacklist() {
    if (fs.existsSync('./blacklist.json')) {
        return JSON.parse(fs.readFileSync('./blacklist.json', 'utf8'));
    }
    return [];
}

// Sauvegarder blacklist
function saveBlacklist(data) {
    fs.writeFileSync('./blacklist.json', JSON.stringify(data, null, 4));
}

// Bot prêt
client.once('clientReady', async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);

    // Création des commandes slash
    await client.application.commands.set([
        {
            name: 'blacklist_add',
            description: 'Ajouter un utilisateur à la blacklist',
            options: [
                {
                    name: 'user',
                    type: 6,
                    description: 'Utilisateur à blacklist',
                    required: true
                }
            ]
        },
        {
            name: 'blacklist_remove',
            description: 'Retirer un utilisateur de la blacklist',
            options: [
                {
                    name: 'user',
                    type: 6,
                    description: 'Utilisateur à retirer',
                    required: true
                }
            ]
        },
        {
            name: 'blacklist_list',
            description: 'Voir la blacklist'
        }
    ]);
});

// Quand quelqu’un rejoint
client.on('guildMemberAdd', async (member) => {
    const blacklist = loadBlacklist();

    if (blacklist.includes(member.id)) {
        await member.ban({ reason: 'Blacklist automatique' });
        console.log(`Banni automatiquement : ${member.user.tag}`);
    }
});

// Gestion des commandes
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // Vérification admin
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: "❌ Tu n'es pas admin.", ephemeral: true });
    }

    let blacklist = loadBlacklist();

    if (interaction.commandName === 'blacklist_add') {
        const user = interaction.options.getUser('user');

        if (!blacklist.includes(user.id)) {
            blacklist.push(user.id);
            saveBlacklist(blacklist);
            return interaction.reply(`✅ ${user.tag} ajouté à la blacklist`);
        } else {
            return interaction.reply(`⚠️ ${user.tag} est déjà blacklist`);
        }
    }

    if (interaction.commandName === 'blacklist_remove') {
        const user = interaction.options.getUser('user');

        blacklist = blacklist.filter(id => id !== user.id);
        saveBlacklist(blacklist);

        return interaction.reply(`✅ ${user.tag} retiré de la blacklist`);
    }

    if (interaction.commandName === 'blacklist_list') {
        if (blacklist.length === 0) {
            return interaction.reply("📭 La blacklist est vide.");
        }

        return interaction.reply(`📋 Blacklist:\n${blacklist.join('\n')}`);
    }
});

client.login(process.env.TOKEN);