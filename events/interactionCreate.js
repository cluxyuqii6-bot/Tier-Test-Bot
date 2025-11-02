const fs = require('fs');
const path = require('path');
const { MessageFlags } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  
  async execute(interaction, queueManager, config) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;
      
      // Load command
      const commandPath = path.join(__dirname, '../commands', `${commandName}.js`);
      
      if (!fs.existsSync(commandPath)) {
        console.error(`Command not found: ${commandName}`);
        return;
      }

      const command = require(commandPath);

      try {
        // Execute command
        await command.execute(interaction, queueManager, config);
      } catch (error) {
        console.error(`Error executing ${commandName}:`, error);
        
        const replyContent = { 
          content: 'There was an error executing this command!', 
          flags: MessageFlags.Ephemeral 
        };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(replyContent);
        } else {
          await interaction.reply(replyContent);
        }
      }
      return;
    }

    // Handle button interactions
    if (interaction.isButton()) {
      const { customId, user, guild } = interaction;

      // Join Queue Button
      if (customId === "joinQueue") {
        if (queueManager.testerID === user.id) {
          return interaction.reply({ 
            content: "Tester cannot join the queue.", 
            flags: MessageFlags.Ephemeral 
          });
        }
        
        if (queueManager.usersInQueue.includes(user.id)) {
          return interaction.reply({ 
            content: "You are already in queue!", 
            flags: MessageFlags.Ephemeral 
          });
        }

        queueManager.joinQueue(user.id);
        
        if (queueManager.queueMessage) {
          await queueManager.queueMessage.edit({ 
            embeds: [queueManager.createQueueEmbed()] 
          });
        }
        
        await queueManager.updateTop1Channel(guild, interaction.client);
        
        return interaction.reply({ 
          content: "You joined the queue!", 
          flags: MessageFlags.Ephemeral 
        });
      }

      // Handle leave queue button
      if (customId === "leaveQueue") {
        if (!queueManager.usersInQueue.includes(user.id)) {
          return interaction.reply({ 
            content: "You are not in queue!", 
            flags: MessageFlags.Ephemeral 
          });
        }

        queueManager.leaveQueue(user.id);
        
        if (queueManager.queueMessage) {
          await queueManager.queueMessage.edit({ 
            embeds: [queueManager.createQueueEmbed()] 
          });
        }
        
        await queueManager.updateTop1Channel(guild, interaction.client);
        
        return interaction.reply({ 
          content: "You left the queue.", 
          flags: MessageFlags.Ephemeral 
        });
      }
    }
  }
};

