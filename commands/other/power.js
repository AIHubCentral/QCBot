const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { Client } = require('undici');
const env = require('dotenv').config();
const myUserId = process.env.myUserId;
const adminRoleId = process.env.adminRoleId;
const powerUrl = process.env.powerUrl;
const powerApiKey = process.env.powerApiKey;
const powerId = process.env.powerId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('power')
		.setDescription("Manage the bot's power supply"),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		if (interaction.user.id!=myUserId && interaction.user.id!=adminRoleId) {
            return await interaction.editReply(`You do not have permission to use this command.`);
        }

        const confirmButton = new ButtonBuilder()
			.setCustomId('confirm')
			.setLabel('Confirm')
			.setStyle(ButtonStyle.Success);

		const cancelButton = new ButtonBuilder()
			.setCustomId('cancel')
			.setLabel('Cancel')
			.setStyle(ButtonStyle.Secondary);

		const sentMessage = await interaction.editReply({
			content: `Confirm server restart?`,
			components: [new ActionRowBuilder().addComponents(cancelButton, confirmButton)],
        });

        try {
            const confirmation = await sentMessage.awaitMessageComponent({ time: 30_000 });

            if (confirmation.customId === 'confirm') {
				const timestamp = Date.now() + 10000;
				await interaction.editReply({content: `Restart request will be sent <t:${timestamp}:R>`, components: []});

				const client = new Client(powerUrl);

				const { statusCode } = await client.request({
					path: `/api/client/servers/${powerId}/power`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${powerApiKey}`,
					},
					body: JSON.stringify({ signal: 'restart' }),
				});
		
				if (statusCode !== 204) {
					throw new Error(`Failed to restart server: ${statusCode}`);
				}
			
				client.close();
            } else if (confirmation.customId === 'cancel') {
                await confirmation.update({content: `Action cancelled.`, components: []});
            }
        } catch (error) {
            if (error.name == 'Error [InteractionCollectorError]') {
                await interaction.editReply({content: `Confirmation not received within 30 seconds, cancelling.`, components: []});
            } else {
				await interaction.editReply({content: `An error occured! ${error}`, components: []});
            }
        }
	}
};