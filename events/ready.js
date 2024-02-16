const { Events } = require('discord.js');
const { SubmissionsTable, StatsTable } = require('../sequelcode');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		SubmissionsTable.sync();
		StatsTable.sync();
	}
};