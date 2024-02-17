const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { SubmissionsTable, StatsTable } = require('../../sequelcode');
const env = require('dotenv').config();
const myUserId = process.env.myUserId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cleardata')
		.setDescription('Clear a database')
        .addStringOption(option =>
            option.setName('database')
                .setDescription('Choose which database to clear')
                .addChoices(
					{ name: 'Submissions database', value: 'choiceSubmissions' },
					{ name: 'QC stats', value: 'choiceStats' },
                )
                .setRequired(true)),
	async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (interaction.user.id!=myUserId) {
            return await interaction.editReply(`You do not have permission to use this command.`);
        }

        const choice = await interaction.options.getString('database');

        let length;
        let selectedDatabase;

        switch (choice) {
            case 'choiceSubmissions':
                let dbSubmissionsIdList = [];
                const dbSubmissionsIdRaw = await SubmissionsTable.findAll({ attributes: ['dbSubmissionId'] });
                dbSubmissionsIdList.push(...dbSubmissionsIdRaw.map((tag) => tag.dbSubmissionId));
                length = dbSubmissionsIdList.length;
                selectedDatabase = 'submissions database';
                break;
            case 'choiceStats':
                let qcList = [];
                const qcListRaw = await StatsTable.findAll({ attributes: ['dbQcId'] });
                qcList.push(...qcListRaw.map((tag) => tag.dbQcId));
                length = qcList.length;
                selectedDatabase = 'QC stats';
                break;
        }

        if (length==0) {
            return await interaction.editReply(`Chosen database is already empty.`);
        }
        
        const confirmButton = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm')
			.setStyle(ButtonStyle.Danger);

		const cancelButton = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const sentMessage = await interaction.editReply({
			content: `Confirm ${selectedDatabase} wipe-off? This action cannot be undone.`,
			components: [new ActionRowBuilder().addComponents(cancelButton, confirmButton)],
        });

        try {
            const confirmation = await sentMessage.awaitMessageComponent({ time: 30_000 });

            if (confirmation.customId === 'confirm') {
                switch (choice) {
                    case 'choiceSubmissions':
                        await SubmissionsTable.destroy({ where: {}, truncate: true });
                        await confirmation.update({content: `Successfully removed all submissions in the dabatase.`, components: []});
                        break;
                    case 'choiceStats':
                        await StatsTable.destroy({ where: {}, truncate: true });
                        await confirmation.update({content: `Successfully removed all QC stats.`, components: []});
                        break;
                }
            } else if (confirmation.customId === 'cancel') {
                await confirmation.update({content: `Action cancelled.`, components: []});
            }
        } catch (error) {
            if (error.name == 'Error [InteractionCollectorError]') {
                await interaction.editReply({content: `Confirmation not received within 30 seconds, cancelling.`, components: []});
            } else {
                await interaction.editReply(`Error deleting entries! ${error}`);
            }
        }
    }
};