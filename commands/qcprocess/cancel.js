const { SlashCommandBuilder } = require('discord.js');
const { SubmissionsTable, StatsTable } = require('../../sequelcode');
const env = require('dotenv').config();
const guildId = process.env.guildId;
const qcRoleId = process.env.qcRoleId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cancel')
		.setDescription('Cancel your submission')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('Your submission ID')
                .setRequired(true)
                .setMaxValue(999)),
	async execute(interaction) {
        if (!await interaction.inGuild() || interaction.guild.id != guildId) {
            const validGuild = await interaction.client.guilds.fetch(guildId);
            return await interaction.reply({content:`This command can only be used in **${validGuild.name}**.`, ephemeral: true });
        }
        
        const inputSubmissionId = interaction.options.getInteger('id');
        const userId = interaction.user.id;
        
        const tag = await SubmissionsTable.findOne({ where: { dbSubmissionId: inputSubmissionId } });

        if (!tag) {
            return await interaction.reply({content:`No submission found with ID: ${inputSubmissionId}. Please check if your submission ID is correct.`, ephemeral: true });
        }

        const userCheck = tag.get('dbUserId');
    
        if (userId!=userCheck && !interaction.member.roles.cache.has(qcRoleId)) {
            return await interaction.reply({content:`You do not have permission to cancel this submission.`, ephemeral: true });
        }

        try {
            await SubmissionsTable.destroy({ where: { dbSubmissionId: inputSubmissionId } });

            if (interaction.member.roles.cache.has(qcRoleId)) {
                const tag2 = await StatsTable.findOne({ where: { dbQcId: interaction.user.id } });
    
                const qcName = interaction.member.nickname ?? interaction.member.displayName;
        
                if (!tag2) {
                    await StatsTable.create({
                        dbQcId: interaction.user.id,
                        dbQcCount: 1,
                        dbQcName: qcName,
                    });
                } else {
                    const currentCount = tag2.get('dbQcCount');
                    await StatsTable.update({ dbQcCount: currentCount+1, dbQcName: qcName }, { where: { dbQcId: interaction.user.id } });
                }
            }

            await interaction.reply(`<@${interaction.user.id}> Your submission (ID: ${inputSubmissionId}) has been successfully removed from queue.`);
		} catch (error) {
			console.error(`New error report! Occured on ${new Date().toUTCString()} while executing '/${interaction.commandName}'`);
			console.log(error);
		}
    }
};