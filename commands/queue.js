const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Start queue'),
  
  async execute(interaction, queueManager, config) {
    const { member, guild } = interaction;
    
    // Check permissions
    if (!member.roles.cache.has(config.queue.roleId)) {
      return interaction.reply({ 
        content: "You do not have the required role.", 
        flags: MessageFlags.Ephemeral 
      });
    }

    // Set tester if not already set
    if (!queueManager.testerID) {
      queueManager.setTester(member.id);
    }

    // Find queue channel
    const channel = guild.channels.cache.get(config.queue.channelId);
    if (!channel) {
      return interaction.reply({ 
        content: "Queue channel not found.", 
        flags: MessageFlags.Ephemeral 
      });
    }

    // Display queue
    await queueManager.displayQueue(channel);

    await interaction.reply({ 
      content: "Queue is active!", 
      flags: MessageFlags.Ephemeral 
    });
  }
};

