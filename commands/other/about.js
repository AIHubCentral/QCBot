const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Get general information about the bot'),
	async execute(interaction) {
		await interaction.reply({ embeds: [new EmbedBuilder().setColor(`Random`).setThumbnail(interaction.client.user.avatarURL()).setDescription(`## I'm QCBot. Nice to meet you!
		\n- Made by <@1037338320960761998>, with lots of help from the amazing AI Hub team!
		\n- Did you know I'm open source? [Well there you go.](https://github.com/AIHubCentral/QCBot)
		\n- Got a model to submit? Feel free to try out my commands!`)] });
	}
};
