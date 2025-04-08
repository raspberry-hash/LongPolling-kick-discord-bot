const { SlashCommandBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE = 'https://longpolling-kick-discord-bot-production.up.railway.app';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewservers')
    .setDescription('View a list of server UUIDs'),

  async execute(interaction) {
    // Step 1: Just send the hello reply for now
    interaction.reply("Hello!");
  }
};
