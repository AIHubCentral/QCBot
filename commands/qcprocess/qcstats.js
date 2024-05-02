const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { StatsTable } = require('../../sequelcode');
const env = require('dotenv').config();
const guildId = process.env.guildId;
const modRoleId = process.env.modRoleId;
const leadQcRoleId = process.env.leadQcRoleId;
const adminRoleId = process.env.adminRoleId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('qcstats')
		.setDescription(`Check the QCs activity`),
	async execute(interaction) {
        if (!await interaction.inGuild() || interaction.guild.id != guildId) {
            const validGuild = await interaction.client.guilds.fetch(guildId);
            return await interaction.reply({content:`This command can only be used in **${validGuild.name}**.`, ephemeral: true });
        } else if (!interaction.member.roles.cache.has(modRoleId) && !interaction.member.roles.cache.has(leadQcRoleId) && !interaction.member.roles.cache.has(adminRoleId)) {
            return await interaction.reply({content:`You do not have permission to use this command.`, ephemeral: true });
        }

        const qcDataRaw = await StatsTable.findAll({ attributes: ['dbQcId', 'dbQcCount', 'dbQcName'], order: [['dbQcCount', 'DESC']] });
        const qcList = qcDataRaw.map(t => `**${t.dbQcName}** (${t.dbQcId}): **${t.dbQcCount}**`).join('\n') || 'Database is empty.';

        const saveButton = new ButtonBuilder()
            .setCustomId('save')
            .setLabel('Save stats')
            .setEmoji('💾')
            .setStyle(ButtonStyle.Secondary);

        const sentMessage = await interaction.reply({
            embeds: [new EmbedBuilder().setColor(`e74c3c`).setTitle(`Current QC stats`).setDescription(`${qcList}`)],
            components: [new ActionRowBuilder().addComponents(saveButton)],
            ephemeral: true,

        });

        try {
            confirmation = await sentMessage.awaitMessageComponent({ time: 30_000 });

            if (confirmation.customId === 'save') {
                await interaction.user.send({embeds: [new EmbedBuilder().setColor(`e74c3c`).setTitle(`Current QC stats`).setDescription(`${qcList}`).setFooter({text: `Requested by ${interaction.user.displayName} • ${new Date().toDateString()}`})]});
                
                await confirmation.update({
                    embeds: [new EmbedBuilder().setColor(`Green`).setTitle(`Current QC stats`).setDescription(`${qcList}`).setFooter({text: `Current QC stats successfully sent to ${interaction.user.displayName}`})],
                    components: [],
                });
            }
        } catch (error) {
            if (error.name == 'Error [InteractionCollectorError]') {      
                const saveButtonExpired = new ButtonBuilder()
                    .setCustomId('expired')
                    .setLabel('Expired')
                    .setEmoji('💾')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true);

                await interaction.editReply({
                    embeds: [new EmbedBuilder().setColor(`e74c3c`).setTitle(`Current QC stats`).setDescription(`${qcList}`)],
                    components: [new ActionRowBuilder().addComponents(saveButtonExpired)],
                });
            } else if (error.code === 50007) {
                await confirmation.update({
                    embeds: [new EmbedBuilder().setColor(`Yellow`).setTitle(`Current QC stats`).setDescription(`${qcList}`).setFooter({text: `Bot is unable to DM ${interaction.user.displayName}. Please check if your DMs are open.`})],
                    components: [],
                });
            } else {
                await confirmation.update({
                    embeds: [new EmbedBuilder().setColor(`Yellow`).setTitle(`Current QC stats`).setDescription(`${qcList}`).setFooter({text: `An unexpected error has occured. Could not save QC stats.`})],
                    components: [],
                });

                console.error(`New error report (unhandled)! Occured on ${new Date().toUTCString()} while executing '/${interaction.commandName}'`);
                console.log(error);
            }
        }
    }
};