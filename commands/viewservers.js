const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE = 'https://longpolling-kick-discord-bot-production.up.railway.app';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewservers')
    .setDescription('View a list of server UUIDs'),

  async execute(interaction) {
    // Step 1: Defer the reply immediately to avoid timeout issues
    await interaction.deferReply();

    try {
      // Step 2: Fetch UUIDs from your backend
      const res = await fetch(`${API_BASE}/uuids`);
      const data = await res.json();

      if (!data.uuids || data.uuids.length === 0) {
        // If no UUIDs found, send a reply
        return interaction.editReply('❌ No active servers found.');
      }

      // Step 3: Create the list of UUIDs to display
      const uuidList = data.uuids.join('\n'); // No shortening of UUIDs

      // Step 4: Create the embed with the list of UUIDs
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Active Servers')
        .setDescription('Here are the active server UUIDs:')
        .addFields({ name: 'UUIDs', value: uuidList });

      // Step 5: Send the embed with the list
      await interaction.editReply({
        content: '🔽 List of active servers:',
        embeds: [embed]
      });
    } catch (err) {
      // Handle errors in fetching or replying
      console.error('Error occurred:', err);
      await interaction.editReply('❌ There was an error while executing this command!');
    }
  }
};
