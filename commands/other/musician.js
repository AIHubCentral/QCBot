const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const env = require('dotenv').config();
const myUserId = process.env.myUserId
const guildId =  process.env.guildId;
const musicianRoleId = '1190973556004233257';
const musicianLogsId = '1191796861586120785';
const alexmurkoffId = '718415427994124351';
const realpikachuwuId = '524597272596578307';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('musician')
        .setDescription('Manage the Musician role')
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Give the Musician role to someone')
                .addUserOption(option =>
                    option.setName('member')
                        .setDescription('The member to give the role to')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove the Musician role from someone')
                .addUserOption(option =>
                    option.setName('member')
                        .setDescription('The member to remove the role from')
                        .setRequired(true))),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!await interaction.inGuild() || interaction.guild.id != guildId) {
            const validGuild = await interaction.client.guilds.fetch(guildId);
            return await interaction.editReply(`This command can only be used in **${validGuild.name}**.`);
        } else if (interaction.user.id!=alexmurkoffId && interaction.user.id!=realpikachuwuId) {
            return await interaction.editReply(`You do not have permission to use this command.`);
        }

        const subcommand = await interaction.options.getSubcommand();
        const user = await interaction.options.getUser('member');

        const member = await interaction.guild.members.fetch(user.id);

        const roleToAdd = await interaction.guild.roles.fetch(musicianRoleId);

        switch (subcommand) {
            case 'give':
                try {
                    if (member.roles.cache.has(roleToAdd.id)) {
                        return await interaction.editReply(`<@${member.id}> already has the ${roleToAdd.name} role.`);
                    }

                    await member.roles.add(roleToAdd);
                    await interaction.editReply(`${roleToAdd.name} role successfully added to <@${member.id}>`);

                    if (musicianLogsId) {
                        const approvalLogsThread = await interaction.guild.channels.fetch(musicianLogsId);
                        await approvalLogsThread.send({ embeds: [new EmbedBuilder().setColor(`${roleToAdd.hexColor}`).setTitle('Musician role update').setDescription(`<@${interaction.user.id}> has manually given the Musician role to <@${member.id}>.`)] });
                    }
                } catch (error) {
                    await interaction.editReply(`Something went wrong... Please try again and see if it works. If the error still persists, consider pinging <@${myUserId}>.`);
                    console.error(`New error report! Occured on ${new Date().toUTCString()} while executing '/${interaction.commandName}'`);
                    console.log(error);
                }
                break;
            case 'remove':
                try {
                    if (!member.roles.cache.has(roleToAdd.id)) {
                        return await interaction.editReply(`<@${member.id}> doesn't have the ${roleToAdd.name} role.`);
                    }

                    await member.roles.remove(roleToAdd);
                    await interaction.editReply(`${roleToAdd.name} role successfully removed from <@${member.id}>`);

                    if (musicianLogsId) {
                        const approvalLogsThread = await interaction.guild.channels.fetch(musicianLogsId);
                        await approvalLogsThread.send({ embeds: [new EmbedBuilder().setColor(`${roleToAdd.hexColor}`).setTitle('Musician role update').setDescription(`<@${interaction.user.id}> has manually removed the Musician role from <@${member.id}>.`)] });
                    }
                } catch (error) {
                    await interaction.editReply(`Something went wrong... Please try again and see if it works. If the error still persists, consider pinging <@${myUserId}>.`);
                    console.error(`New error report! Occured on ${new Date().toUTCString()} while executing '/${interaction.commandName}'`);
                    console.log(error);
                }
                break;
        }
    }
};