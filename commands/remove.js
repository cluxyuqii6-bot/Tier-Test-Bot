const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove user from queue')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('User ID or mention')
        .setRequired(true)
    ),
  
  async execute(interaction, queueManager) {
    const { member, guild, options } = interaction;
    
    // Check admin permissions
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ 
        content: "You do not have permissions.", 
        flags: MessageFlags.Ephemeral 
      });
    }

    // Extract user ID
    let userId = options.getString('user').replace(/\D/g, "");
    
    // Check if user is in queue
    if (!queueManager.usersInQueue.includes(userId)) {
      return interaction.reply({ 
        content: "User is not in queue.", 
        flags: MessageFlags.Ephemeral 
      });
    }

    // Remove user
    queueManager.removeUser(userId);
    
    // Update queue
    if (queueManager.queueMessage) {
      await queueManager.queueMessage.edit({ 
        embeds: [queueManager.createQueueEmbed()] 
      });
    }
    
    await queueManager.updateTop1Channel(guild, interaction.client);

    return interaction.followUp({ 
      content: "User removed.", 
      flags: MessageFlags.Ephemeral 
    });
  }
};

