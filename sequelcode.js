const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const SubmissionsTable = sequelize.define('SubmissionsTable', {
	dbSubmissionId: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		unique: true,
	},
	dbUserId: Sequelize.STRING,
	dbSubmissionLink: Sequelize.STRING,
});

const StatsTable = sequelize.define('StatsTable', {
	dbQcId: {
		type: Sequelize.STRING,
		primaryKey: true,
		unique: true,
	},
	dbQcCount: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
	dbQcName: Sequelize.STRING,
});

module.exports = {
    SubmissionsTable,
    StatsTable,
};