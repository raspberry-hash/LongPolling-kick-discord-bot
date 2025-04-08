const { SlashCommandBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE = 'https://longpolling-kick-discord-bot-production.up.railway.app';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewservers')
    .setDescription('View a list of server UUIDs'),

  async execute(interaction) {
    try {
      // Step 1: Fetch UUIDs from the backend
      const res = await fetch(`${API_BASE}/uuids`);
      
      // Step 2: Check if the response is valid
      if (!res.ok) {
        return interaction.reply('❌ Failed to fetch server UUIDs.');
      }

      const data = await res.json();

      // Step 3: Check if data contains UUIDs
      if (!data.uuids || data.uuids.length === 0) {
        return interaction.reply('❌ No active servers found.');
      }

      // Step 4: Send the UUIDs as plain text
      return interaction.reply(`Here are the active server UUIDs:\n${data.uuids.join('\n')}`);
    } catch (error) {
      console.error(error);
      interaction.reply('❌ There was an error while executing this command.');
    }
  }
};
