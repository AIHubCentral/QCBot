const { SlashCommandBuilder, ActivityType } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
const env = require('dotenv').config();
const clientId = process.env.clientId;
const myUserId = process.env.myUserId;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Customize the bot further')
		.addStringOption(option =>
            option.setName('status')
                .setDescription('Set status')
                .addChoices(
					{ name: 'Online', value: 'online' },
					{ name: 'Idle', value: 'idle' },
					{ name: 'Do Not Disturb', value: 'dnd' },
					{ name: 'Invisible', value: 'invisible' },
                ))
		.addStringOption(option =>
            option.setName('presence')
                .setDescription('Set the activity type')
				.addChoices(
					{ name: 'Watching', value: 'watching' },
					{ name: 'Listening', value: 'listening' },
					{ name: 'Playing', value: 'playing'},
					{ name: 'Competing', value: 'competing'},
					{ name: 'Custom', value: 'custom'},
					{ name: 'Reset', value: 'reset'},
				))
		.addStringOption(option =>
            option.setName('activity')
                .setDescription('Set the activity name'))
		.addStringOption(option =>
            option.setName('nickname')
                .setDescription('Set the bot nickname'))
		.addAttachmentOption(option =>
            option.setName('avatar')
                .setDescription('Set the bot avatar')),
	async execute(interaction) {

		await interaction.deferReply({ ephemeral: true });
		
        if (interaction.user.id!=myUserId) {
            return await interaction.editReply(`https://tenor.com/bhOSD.gif`);
        }

        const status = await interaction.options.getString('status');
		const presence = await interaction.options.getString('presence');
        const activity = await interaction.options.getString('activity');
		const nickname = await interaction.options.getString('nickname');
        const avatar = await interaction.options.getAttachment('avatar');

		if (!status && !presence && !activity && !nickname && !avatar) {
            return await interaction.editReply(`Choose something to set!`);
        }

		const actions = [status, presence, activity, nickname, avatar];
		const total = actions.filter(element => element).length;
		let current = 0;

		await interaction.editReply(`Waiting for all actions to be executed (${current}/${total})`);
		await wait(2000);

		if (status) {
			try {
				await interaction.client.user.setStatus(status);
				current = current+1;
				await interaction.editReply(`Status successfully set.\nWaiting for all actions to be executed (${current}/${total})`);
				await wait(3000);
			} catch (a) {
				await interaction.editReply(`Unable to execute action. ${a}\nWaiting for all actions to be executed (${current}/${total})`);
				await wait(4000);
			}
		}

		if (activity && !presence) {
			await interaction.editReply(`Unable to execute action. Activity must be used with presence.\nWaiting for all actions to be executed (${current}/${total})`);
			await wait(4000);
		}

		if (presence) {
			if (presence == 'reset') {
				await interaction.client.user.setPresence({});
				current = current+1;
				await interaction.editReply(`Presence reset.\nWaiting for all actions to be executed (${current}/${total})`);
				await wait(3000);
			} else {
				try {
					switch (presence) {
						case 'watching':
							await interaction.client.user.setActivity({
								name: activity ?? `#get-model-maker`,
								type: ActivityType.Watching,
							});
							break;
						case 'listening':
							await interaction.client.user.setActivity({
								name: activity ?? `#get-model-maker`,
								type: ActivityType.Listening,
							});
							break;
						case 'playing':
							await interaction.client.user.setActivity({
								name: activity ?? `#get-model-maker`,
								type: ActivityType.Playing,
							});
							break;
						case 'competing':
							await interaction.client.user.setActivity({
								name: activity ?? `#get-model-maker`,
								type: ActivityType.Competing,
							});
							break;
						case 'custom':
							await interaction.client.user.setActivity({
								name: activity ?? `#get-model-maker`,
								type: ActivityType.Custom,
							});
							break;
					}

					if (activity) {
						current = current+2;
						await interaction.editReply(`Presence and activity successfully set.\nWaiting for all actions to be executed (${current}/${total})`);
					} else {
						current=current+1;
						await interaction.editReply(`Presence successfully set and activity defaulted.\nWaiting for all actions to be executed (${current}/${total})`);
					}
					await wait(3000);
				} catch (b) {
					await interaction.editReply(`Unable to execute action. ${b}\nWaiting for all actions to be executed (${current}/${total})`);
					await wait(4000);
				}
			}
		}

		if (nickname) {
			if (!await interaction.inGuild()) {
				await interaction.editReply(`Unable to execute action. Nickname can only be set in guilds.\nWaiting for all actions to be executed (${current}/${total})`);
				await wait(4000);
			} else {
				try {
					const botMember = await interaction.guild.members.fetch(clientId);
					if (nickname == '.null') {
						await botMember.setNickname(null);
						current = current+1;
						await interaction.editReply(`Nickname successfully reset for **${interaction.guild.name}**.\nWaiting for all actions to be executed (${current}/${total})`);
					} else {
						await botMember.setNickname(nickname);
						current = current+1;
						await interaction.editReply(`Nickname successfully set for **${interaction.guild.name}**.\nWaiting for all actions to be executed (${current}/${total})`);
					}
					await wait(3000);
				} catch (c) {
					await interaction.editReply(`Unable to execute action. ${c}\nWaiting for all actions to be executed (${current}/${total})`);
					await wait(4000);
				}
			}
		}

		if (avatar) {
			try {
				interaction.client.user.setAvatar(avatar.url);
				current = current+1;
				await interaction.editReply(`Avatar successfully set.\nWaiting for all actions to be executed (${current}/${total})`);
				await wait(3000);
			} catch (d) {
				await interaction.editReply(`Unable to execute action. ${d}\nWaiting for all actions to be executed (${current}/${total})`);
				await wait(4000);
			}
		}

		await interaction.editReply(`All actions executed (${current}/${total})`);
	}
};