const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Client, ClientApplication, ActionRowBuilder, ButtonBuilder,ButtonStyle} = require('discord.js');
const appTools = require('../appTools.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription("Donne les informations d'un utilisateur")
        .addUserOption(option => option.setName('utilisateur').setDescription('Utilisateur cible').setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('utilisateur') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        const userInfo = {
            username: user.username,
            id: user.id,
            joinedAt: member.joinedAt,
        };
        const embed = new EmbedBuilder()
            .setTitle(`Informations sur l'utilisateur : ${userInfo.username}`)
            .addFields(
                { name: 'Username', value: userInfo.username, inline: true },
                { name: 'ID', value: userInfo.id, inline: true },
                { name: 'Joined At', value: userInfo.joinedAt.toLocaleDateString('fr-FR',{
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }), inline: true },
            );
        let row = null;
        const userBanner = await user.fetch().then(u => u.bannerURL({ dynamic: true, size: 1024 }));
        if(userBanner) {
            row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('show_avatar')
                        .setLabel('Afficher l\'avatar de l\'utilisateur')
                        .setStyle(ButtonStyle.Primary),

                    new ButtonBuilder()
                        .setCustomId('show_banner')
                        .setLabel('Afficher la bannière')
                        .setStyle(ButtonStyle.Primary)
                )
        }else {
            row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('show_avatar')
                        .setLabel('Afficher l\'avatar de l\'utilisateur')
                        .setStyle(ButtonStyle.Primary)
                )
        }
        await interaction.reply({ embeds: [embed], components: [row], ephemeral : true });

        const filter = i => i.customId === 'show_avatar' || i.customId === 'show_banner';
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            const date = Date.now()
            const logger = appTools.CreateLogger();
            logger.info(`Interaction started\n  -User: ${interaction.user.tag} (${interaction.commandName})[${i.customId}]`);
            if(i.customId === 'show_avatar') {
                await i.reply({ content: user.displayAvatarURL({ dynamic: true, size: 1024 }), ephemeral : true});
            }else if (i.customId === 'show_banner') {
                await i.reply({ content: userBanner, ephemeral : true});
            }
            logger.info(`interaction ended\n  -User: ${interaction.user.tag} (${interaction.commandName})[${i.customId}], took ${Date.now() - date}ms`);
        })

    },
};
