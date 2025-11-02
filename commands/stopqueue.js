const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stopqueue')
    .setDescription('Stop the queue'),
  
  async execute(interaction, queueManager) {
    const { member } = interaction;
    
    // Check admin permissions
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ 
        content: "You do not have permissions.", 
        flags: MessageFlags.Ephemeral 
      });
    }

    await interaction.reply({ 
      content: "Queue stopped.", 
      flags: MessageFlags.Ephemeral 
    });

    await queueManager.stopQueue();
  }
};

