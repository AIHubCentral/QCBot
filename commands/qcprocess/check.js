const { SlashCommandBuilder } = require('discord.js');
const { SubmissionsTable } = require('../../sequelcode');
const env = require('dotenv').config();
const guildId = process.env.guildId;
const qcRoleId = process.env.qcRoleId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('check')
		.setDescription(`Review a submission`),
	async execute(interaction) {
        if (!await interaction.inGuild() || interaction.guild.id != guildId) {
            const validGuild = await interaction.client.guilds.fetch(guildId);
            return await interaction.reply({content:`This command can only be used in **${validGuild.name}**.`, ephemeral: true });
        } else if (!interaction.member.roles.cache.has(qcRoleId)) {
            return await interaction.reply({content:`You do not have permission to review submissions. If you want to become a QC, you can apply for the role using the \`/jointeam\` command of the AI HUB bot.`, ephemeral: true });
        }
        
        let dbSubmissionsIdList = [];

        const dbSubmissionsIdRaw = await SubmissionsTable.findAll({ attributes: ['dbSubmissionId'], order: [['createdAt', 'ASC']] });
        dbSubmissionsIdList.push(...dbSubmissionsIdRaw.map((tag) => tag.dbSubmissionId));

        const length = dbSubmissionsIdList.length;
        
        if (length==0) {
            return await interaction.reply({content:`No new submissions to check. Queue is empty.\nGood job QCs :saluting_face:`, ephemeral: true });
        }

        const tag = await SubmissionsTable.findOne({ where: { dbSubmissionId: dbSubmissionsIdList[0] } });
        const dbSubmissionLink = tag.get('dbSubmissionLink');

        if (length==1) {
            await interaction.reply({content:`1 submission is awaiting to be reviewed.\n**ID:** ${dbSubmissionsIdList[0]}\n**Link:** ${dbSubmissionLink}`, ephemeral: true });
        } else {
            await interaction.reply({content:`${length} submissions are awaiting to be reviewed. Here's the least recent one:\n**ID:** ${dbSubmissionsIdList[0]}\n**Link:** ${dbSubmissionLink}`, ephemeral: true });
        }
    }
};