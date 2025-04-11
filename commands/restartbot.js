const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the bot (owner only)'),

  async execute(interaction) {
    const ownerIds = ['1020614574250152029', '886894966025097236']; // ✅ Both owner IDs

    try {
      if (!ownerIds.includes(interaction.user.id)) {
        return await interaction.reply({
          content: '❌ You are not authorized to restart the bot.',
          ephemeral: true
        });
      }

      const restartEmbed = new EmbedBuilder()
        .setColor(0xff5555)
        .setTitle('♻️ Restarting Bot...')
        .setDescription('The bot is shutting down and will restart shortly.')
        .setFooter({ text: 'Manual Restart Requested' })
        .setTimestamp();

      await interaction.reply({ embeds: [restartEmbed] });

      // Give the message time to send before exiting

    } catch (error) {
      console.error('❌ Error in restart command:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ There was an error executing the restart command.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: '❌ There was an error executing the restart command.',
          ephemeral: true
        });
      }
    }
  }
};