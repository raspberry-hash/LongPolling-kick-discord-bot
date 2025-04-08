const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE = 'https://longpolling-kick-discord-bot-production.up.railway.app';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewservers')
    .setDescription('View a list of server UUIDs'),

  async execute(interaction) {
    // Step 1: Fetch UUIDs from your backend
    const res = await fetch(`${API_BASE}/uuids`);
    const data = await res.json();

    if (!data.uuids || data.uuids.length === 0) {
      // If no UUIDs found, reply if not already acknowledged
      if (!interaction.replied && !interaction.deferred) {
        return interaction.reply('❌ No active servers found.');
      }
      return; // Don't do anything if already acknowledged
    }

    // Step 2: Create the list of UUIDs to display
    const uuidList = data.uuids.join('\n'); // No shortening of UUIDs

    // Step 3: Create the embed with the list of UUIDs
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Active Servers')
      .setDescription('Here are the active server UUIDs:')
      .addFields({ name: 'UUIDs', value: uuidList });

    // Step 4: Send the embed with the list
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '🔽 List of active servers:',
        embeds: [embed]
      });
    } else {
      // If already acknowledged, use followUp
      try {
        await interaction.followUp({
          content: '🔽 List of active servers:',
          embeds: [embed]
        });
      } catch (err) {
        console.error('Error during follow-up:', err);
      }
    }
  }
};
