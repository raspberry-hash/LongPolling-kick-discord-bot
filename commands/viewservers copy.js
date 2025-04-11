const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE = 'https://longpolling-kick-discord-bot-production.up.railway.app';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('yeah'),

  async execute(interaction) {
    try {
      // Step 1: Fetch UUIDs from your backend
      const res = await fetch(`${API_BASE}/uuids`);
      const embed1 = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Error!')
        .setDescription('❌ Unable to grab server count!')
      // Step 2: Check if the response is valid
      if (!res.ok) {
        

      // Step 5: Send the embed as the reply
      return interaction.reply({ embeds: [embed1] });
      }

      const data = await res.json();

      // Step 3: Check if data contains UUIDs
      if (!data.uuids || data.uuids.length === 0) {
        return interaction.reply({ embeds: [embed1] });
      }

      // Step 4: Create the embed with the list of UUIDs
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Active Server UUIDs')
        .setDescription(`**${data.uuids.length}** active server(s) found!`)
        .addFields(
          { name: 'UUIDs', value: "```"+data.uuids.join('\n')+"```", inline: false }
        )


      // Step 5: Send the embed as the reply
      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.reply('❌ There was an error while executing this command.');
    }
  }
};
