const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, Discord } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('kicks specified ammount of players')
		.addNumberOption(option =>
			option.setName('ammount')
				.setDescription('Number of players to kick.')),

	async execute(interaction) {
    const { connection } = require('../index.js')
    connection.send("welcome","hi")
  }
};
