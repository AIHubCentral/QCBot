const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const env = require('dotenv').config();
const guildId = process.env.guildId;
const customEmojiName = process.env.customEmojiName;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription("Check the bot's ping"),
	async execute(interaction) {
		if (customEmojiName && interaction.inGuild() && interaction.guild.id == guildId) {
			const customEmoji = await interaction.guild.emojis.cache.find((emoji) => emoji.name == customEmojiName);
			await interaction.reply({ embeds: [new EmbedBuilder().setColor(`ffc0cb`).setDescription(`## Dunno :3\n# <:${customEmoji.name}:${customEmoji.id}> <:${customEmoji.name}:${customEmoji.id}> <:${customEmoji.name}:${customEmoji.id}>`)] });
		} else {
			await interaction.reply({ embeds: [new EmbedBuilder().setColor(`ffc0cb`).setDescription(`## Dunno :3 :cat: :cat: :cat:`)] });
		}
	}
};