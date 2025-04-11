const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows how to use the bot'),

  async execute(interaction) {
    try {
      const helpEmbed = new EmbedBuilder()
        .setColor(0x00AEFF)
        .setTitle('Bot Help')
        .setDescription('Please look below for your answers.')
        .addFields(
          {
            name: '📘 Commands',
            value: 'Commands are registered once a Roblox server connects...',
          },
          {
            name: '🧠 Built-in Commands',
            value: 'These can be used without an active Roblox server.',
          },
          {
            name: '🔗 UUIDs',
            value: 'Each server has a unique UUID. Use `/getservers` to view them.',
          },
          {
            name: '❓ Need help? Commands not working?',
            value: 'Developers are always here for you! \nContact <@886894966025097236> or <@1020614574250152029> with an issue/question and one will reply at their convenience.',
          }
        )
        .setFooter({ text: 'Help Info' })
        .setTimestamp();

      await interaction.reply({ embeds: [helpEmbed] }); // ephemeral: true

    } catch (error) {
      console.error('❌ Error in help command:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: '❌ There was an error executing this command.', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ There was an error executing this command.', ephemeral: true });
      }
    }
  }
};
