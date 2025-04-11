const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('Help Info')
    .setDescription('Shows how to use the bot'),

  async execute(interaction) {
    try {
      const helpEmbed = new EmbedBuilder()
        .setColor(0x00AEFF)
        .setTitle('Bot Help')
        .setDescription('Please look below for your answers.')
        .addFields(
          {
            name: '.1 Commands',
            value: 'Commands are registered as soon as a roblox Server is active and can fetch commands. \nOnce Registered all commands are registered for the up-time of the bot, ensuring all is updated',
          },
          {
            name: '.2 Builtin Commands',
            value: 'Preset commands can be used the same exact way with the exception of not needing a Roblox server',
          },
          {
            name: '.3 UUIDs',
            value: 'UUIDs are what define each server from another, linking the servers to your discord server. \nTo view all active servers, you can run "/getservers"',
          },
          {
            name: 'Need more help? Commands not working?',
            value: 'Developers are always here for you! \nContact <@886894966025097236> or <@1020614574250152029> with an issue/question and one will reply at their convenience.',
          }
        )
        .setFooter({ text: 'Help Info' })
        .setTimestamp();

      await interaction.reply({ embeds: [helpEmbed], ephemeral: true });

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
