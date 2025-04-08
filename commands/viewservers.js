const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE = 'https://longpolling-kick-discord-bot-production.up.railway.app';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewservers')
    .setDescription('View a list of server UUIDs'),

  async execute(interaction) {
    // Step 1: Fetch UUIDs from your backend
    interaction.reply("Hello!")
        
    }

    // Step 2: Create the list of UUIDs to display
    
  }

