const { SlashCommandBuilder } = require('discord.js');
const { request } = require('undici');
const nasaApiKey = process.env.nasaApiKey;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nasa')
        .setDescription('Use the official NASA API')
        .addSubcommand(subcommand =>
            subcommand
                .setName('apod')
                .setDescription('Get the astronomy picture of the day')),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const subcommand = await interaction.options.getSubcommand();

        switch (subcommand) {
            case 'apod':
                try {
                    const fetchedData = await request(`https://api.nasa.gov/planetary/apod?thumbs=true&api_key=${nasaApiKey}`);
              
                    const apod = await fetchedData.body.json();
              
                    await interaction.editReply({content: `## ${apod.title}\n${apod.explanation}\n\n**Link:** <${apod.url}>`, files: [apod.thumbnail_url ?? apod.url]});
                } catch (error) {
                    await interaction.editReply(`An error occurred while fetching APOD.`);
                    console.error(`New error report! Occured on ${new Date().toUTCString()} while executing '/${interaction.commandName}'`);
                    console.log(error);
                }
                break;
        }
    }
};