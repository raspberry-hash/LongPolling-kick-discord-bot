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
      return interaction.reply('❌ No active servers found.');
    }

    // Step 2: Create the list of UUIDs to display
    const uuidList = data.uuids.map((uuid, index) => {
      return `\`\`\`${index + 1}\`\`\``; // Show a shortened UUID (first 10 chars)
    }).join('\n');

    // Step 3: Create the embed with the list of UUIDs
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Active Servers')
      .setDescription('Here are the active server UUIDs:')
      .addFields({ name: 'UUIDs', value: uuidList });

    // Step 4: Send the embed with the list
    await interaction.reply({
      content: '🔽 List of active servers for u:',
      embeds: [embed]
    });
  }
};
