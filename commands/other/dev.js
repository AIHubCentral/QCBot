const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const env = require('dotenv').config();
const myUserId = process.env.myUserId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Make the bot say something')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Enter text')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('id')
                .setDescription('Enter message ID'))
        .addBooleanOption(option =>
            option.setName('ping')
                .setDescription('True or false'))
        .addBooleanOption(option =>
            option.setName('reaction')
                .setDescription('True or false'))
        .addBooleanOption(option =>
            option.setName('edit')
                .setDescription('True or false')),
    async execute(interaction) {

        await interaction.deferReply({ ephemeral: true });

        if (!await interaction.inGuild()) {
            return await interaction.editReply(`This command can only be used in guilds.`);
        } else if (interaction.user.id!=myUserId) {
            return await interaction.editReply(`https://tenor.com/bItJt.gif`);
        }

        const text = await interaction.options.getString('text');
        const tartgetMessageId = await interaction.options.getString('id');
        const replyPing = await interaction.options.getBoolean('ping') ?? true;
        const addReaction = await interaction.options.getBoolean('reaction') ?? false;
        const editMessage = await interaction.options.getBoolean('edit') ?? false;

        const pattern = /<:[^<>]+:[^<>]+>/g;
        const matches = text.match(pattern);
        let emojiLength = 0;

		if (matches) {
			const result = matches.join('');
			emojiLength = result.length;
		}

        const ms = text.length*150-emojiLength*150;

        try {
            if (!tartgetMessageId) {
                await interaction.channel.sendTyping();
                await wait(ms);

                await interaction.channel.send(`${text}`);

                await interaction.editReply(`Message sent!`);
            } else if (editMessage) {
                const targetMessage = await interaction.channel.messages.fetch(tartgetMessageId);

                await targetMessage.edit(`${text}`);

                await interaction.editReply(`Message edited!`);
            } else if (!addReaction) {
                const targetMessage = await interaction.channel.messages.fetch(tartgetMessageId);
            
                await interaction.channel.sendTyping();
                await wait(ms);
            
                await targetMessage.reply({content:`${text}`, allowedMentions:{repliedUser:replyPing}});
            
                await interaction.editReply(`Message sent!`);
            } else {
                const targetMessage = await interaction.channel.messages.fetch(tartgetMessageId);
            
                await targetMessage.react(`${text}`);
            
                await interaction.editReply(`Reaction added!`);
            }
        } catch (error) {
            await interaction.editReply(`Failed to execute! ${error}`);
        }
    }
};