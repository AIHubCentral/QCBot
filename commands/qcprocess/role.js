const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const env = require('dotenv').config();
const myUserId = process.env.myUserId
const guildId =  process.env.guildId;
const qcRoleId = process.env.qcRoleId;
const modelRoleId = process.env.modelRoleId;
const modelBlacklistRoleId = process.env.modelBlacklistRoleId;
const approvalLogsId = process.env.approvalLogsId;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Manage the Model Maker role')
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Give the Model Maker role to someone')
                .addStringOption(option =>
                    option.setName('role')
                    .setDescription('The role to give')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Model Maker', value: 'modelRole' },
                        { name: 'mOdEl cOmPoSeR', value: 'modelBlacklistRole' },
                    ))
                .addUserOption(option =>
                    option.setName('member')
                        .setDescription('The member to give the role to')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                    .setDescription('Why did you give the role?')
                    .setRequired(true)
                    .setMaxLength(500)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove the Model Maker role from someone')
                .addStringOption(option =>
                    option.setName('role')
                    .setDescription('The role to give')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Model Maker', value: 'modelRole' },
                        { name: 'mOdEl cOmPoSeR', value: 'modelBlacklistRole' },
                    ))
                .addUserOption(option =>
                    option.setName('member')
                        .setDescription('The member to remove the role from')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Why did you remove the role?')
                        .setRequired(true)
                        .setMaxLength(500))),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        if (!await interaction.inGuild() || interaction.guild.id != guildId) {
            const validGuild = await interaction.client.guilds.fetch(guildId);
            return await interaction.editReply(`This command can only be used in **${validGuild.name}**.`);
        } else if (!interaction.member.roles.cache.has(qcRoleId)) {
            return await interaction.editReply(`You do not have permission to use this command. If you want to become a QC, you can apply for the role using the \`/jointeam\` command of the AI HUB bot.`);
        }

        const subcommand = await interaction.options.getSubcommand();
        const role = await interaction.options.getString('role');
        const user = await interaction.options.getUser('member');
        const reason = await interaction.options.getString('reason');

        const member = await interaction.guild.members.fetch(user.id);

        let roleToAdd;

        switch (role) {
            case 'modelRole':
                roleToAdd = await interaction.guild.roles.fetch(modelRoleId);
                break;
            case 'modelBlacklistRole':
                roleToAdd = await interaction.guild.roles.fetch(modelBlacklistRoleId);
                break;
        }

        switch (subcommand) {
            case 'give':
                try {
                    if (member.roles.cache.has(roleToAdd.id)) {
                        return await interaction.editReply(`<@${member.id}> already has the ${roleToAdd.name} role.`);
                    }

                    await member.roles.add(roleToAdd);
                    await interaction.editReply(`${roleToAdd.name} role successfully added to <@${member.id}>`);

                    if (approvalLogsId) {
                        const approvalLogsThread = await interaction.guild.channels.fetch(approvalLogsId);
                        await approvalLogsThread.send({content: `<@460577350900514837>`, embeds: [new EmbedBuilder().setColor(`e74c3c`).setTitle('Manual role update').setDescription(`<@${interaction.user.id}> has manually given the ${roleToAdd.name} role to <@${member.id}>.\n**Reason:** ${reason}`)]});
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

                    if (approvalLogsId) {
                        const approvalLogsThread = await interaction.guild.channels.fetch(approvalLogsId);
                        await approvalLogsThread.send({content: `<@460577350900514837>`, embeds: [new EmbedBuilder().setColor(`e74c3c`).setTitle('Manual role update').setDescription(`<@${interaction.user.id}> has manually removed the ${roleToAdd.name} role from <@${member.id}>.\n**Reason:** ${reason}`)]});
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