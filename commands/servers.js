const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, Discord } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('servers')
		.setDescription('check servers'),

	async execute(interaction) {
    interaction.reply("lit")
  }
};
