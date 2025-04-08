const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const API_BASE = 'https://longpolling-kick-discord-bot-production.up.railway.app';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewservers')
    .setDescription('Select a server UUID to view info'),

  async execute(interaction) {
    await interaction.deferReply();

    // Step 1: Fetch UUIDs from your backend
    const res = await fetch(`${API_BASE}/uuids`);
    const data = await res.json();

    if (!data.uuids || data.uuids.length === 0) {
      return interaction.editReply('❌ No active servers found.');
    }

    // Step 2: Build the dropdown (max 25 options)
    const options = data.uuids.slice(0, 25).map(uuid => ({
      label: uuid.slice(0, 10) + '...', // short label
      value: uuid
    }));

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_server')
        .setPlaceholder('Choose a server UUID...')
        .addOptions(options
