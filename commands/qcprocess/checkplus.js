const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { SubmissionsTable } = require('../../sequelcode');
const env = require('dotenv').config();
const guildId = process.env.guildId;
const qcRoleId = process.env.qcRoleId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkplus')
		.setDescription(`Get a list of all submissions in queue`),
	async execute(interaction) {
        if (!await interaction.inGuild() || interaction.guild.id != guildId) {
            const validGuild = await interaction.client.guilds.fetch(guildId);
            return await interaction.reply({content:`This command can only be used in **${validGuild.name}**.`, ephemeral: true });
        } else if (!interaction.member.roles.cache.has(qcRoleId)) {
            return await interaction.reply({content:`You do not have permission to review submissions. If you want to become a QC, you can apply for the role using the \`/jointeam\` command of the AI HUB bot.`, ephemeral: true });
        }

        const dbSubmissionsRaw = await SubmissionsTable.findAll({ attributes: ['dbSubmissionId', 'dbSubmissionLink'], order: [['createdAt', 'ASC']] });
        const dbSubmissionsList = dbSubmissionsRaw.map(t => `**${t.dbSubmissionId}**: ${t.dbSubmissionLink}`).join('\n') || 'No new submissions to check. Queue is empty.\nGood job QCs :saluting_face:';

        await interaction.reply({embeds: [new EmbedBuilder().setColor(`e74c3c`).setTitle(`Current submissions in queue`).setDescription(`${dbSubmissionsList}`)], ephemeral: true });

    }
};