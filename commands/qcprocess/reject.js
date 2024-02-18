const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { SubmissionsTable, StatsTable } = require('../../sequelcode');
const env = require('dotenv').config();
const myUserId = process.env.myUserId
const guildId =  process.env.guildId;
const qcRoleId = process.env.qcRoleId;
const qcChannelId = process.env.qcChannelId;
const approvalLogsId = process.env.approvalLogsId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reject')
		.setDescription('Reject a submission')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The submission ID')
                .setRequired(true)
                .setMaxValue(999))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Why did you reject the submission?')
                .setRequired(true)
                .setMaxLength(500)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!await interaction.inGuild() || interaction.guild.id != guildId) {
            const validGuild = await interaction.client.guilds.fetch(guildId);
            return await interaction.editReply(`This command can only be used in **${validGuild.name}**.`);
        } else if (interaction.channel.id != qcChannelId) {
            return await interaction.editReply(`This command can only be used in the https://discord.com/channels/${guildId}/${qcChannelId} channel.`);
        } else if (!interaction.member.roles.cache.has(qcRoleId)) {
            return await interaction.editReply(`You do not have permission to reject submissions. If you want to become a QC, you can apply for the role using the \`/jointeam\` command of the AI HUB bot.`);
        }
        
        const inputSubmissionId = await interaction.options.getInteger('id');
        const reason = await interaction.options.getString('reason');
        
        const tag = await SubmissionsTable.findOne({ where: { dbSubmissionId: inputSubmissionId } });

        if (!tag) {
            return await interaction.editReply(`No submission found with ID: ${inputSubmissionId}. Please check if your submission ID is correct.`);
        }

        const userId = tag.get('dbUserId');
        const submissionLink = tag.get('dbSubmissionLink');

        const qcName = interaction.member.nickname ?? interaction.member.displayName;

        try {
            await SubmissionsTable.destroy({ where: { dbSubmissionId: inputSubmissionId } });

            const tag2 = await StatsTable.findOne({ where: { dbQcId: interaction.user.id } });
    
            if (!tag2) {
                await StatsTable.create({
                    dbQcId: interaction.user.id,
                    dbQcCount: 1,
                    dbQcName: qcName,
                });
            } else {
                const currentQcCount = tag2.get('dbQcCount');
                await StatsTable.update({ dbQcCount: currentQcCount+1, dbQcName: qcName }, { where: { dbQcId: interaction.user.id } });
            }

            const splitSubmissionLink = submissionLink.split('/');
            const submissionMessageId = splitSubmissionLink[splitSubmissionLink.length - 1];

            const submissionMessage = await interaction.channel.messages.fetch(submissionMessageId);
            await submissionMessage.reply(`<@${userId}> Your submission (ID: ${inputSubmissionId}) has been rejected by **${qcName}**.\nReason: *${reason}*\nPlease apply these changes and try again.`);

            await interaction.editReply(`Submission successfully rejected.\nYou may now dismiss this message.`);
		} catch (error) {
            if (error.message.includes('Unknown message')) {
                await interaction.channel.send(`<@${userId}> Your submission (ID: ${inputSubmissionId}) has been rejected by **${qcName}**.\nReason: *${reason}*\nPlease apply these changes and try again.`);

                await interaction.editReply(`Submission successfully rejected.\nYou may now dismiss this message.`);
            } else {
                await interaction.editReply(`Something went wrong... Please try again and see if it works. If the error still persists, consider pinging <@${myUserId}>.`);            
                console.error(`New error report! Occured on ${new Date().toUTCString()} while executing '/${interaction.commandName}'`);
                console.log(error);
            }
		}

        if (approvalLogsId) {
            try {
                const approvalLogsThread = await interaction.guild.channels.fetch(approvalLogsId);
                await approvalLogsThread.send({ content: `<@460577350900514837>`, embeds: [new EmbedBuilder().setColor(`e74c3c`).setTitle('New voice model rejected').setDescription(`**ID:** ${inputSubmissionId}\n**Submitted by:** <@${userId}>\n**Link:** ${submissionLink}\n\n**Rejected by:** <@${interaction.user.id}>\n**Reason:** *${reason}*`)] });
            } catch (error) {
                console.error(`New error report! Occured on ${new Date().toUTCString()} while executing '/${interaction.commandName}'`);
                console.log(error);
            }
        }
    } 
};