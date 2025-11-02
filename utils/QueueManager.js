const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const config = require('../config');

class QueueManager {
  constructor() {
    this.usersInQueue = [];
    this.queueMessage = null;
    this.top1Channel = null;
    this.testerID = null;
  }

  createQueueEmbed() {
    const embed = new EmbedBuilder()
      .setTitle(config.embed.title)
      .setDescription(
        `**Tester**: ${this.testerID ? `<@${this.testerID}>` : "None"}\n\n` +
        `**Queue**:\n` +
        (this.usersInQueue.length > 0 
          ? this.usersInQueue.map((id, i) => `${i + 1}. <@${id}>`).join("\n") 
          : "No one in queue yet.")
      )
      .setColor(config.embed.color)
      .setFooter({ text: config.embed.footer });
    
    return embed;
  }

  createQueueButtons() {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("joinQueue")
        .setLabel("Join Queue")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("leaveQueue")
        .setLabel("Leave Queue")
        .setStyle(ButtonStyle.Secondary)
    );
    
    return row;
  }

  async updateTop1Channel(guild, client) {
    // Delete old channel if exists
    if (this.top1Channel) {
      await this.top1Channel.delete().catch(() => {});
      this.top1Channel = null;
    }
    
    // If queue is empty, do nothing
    if (this.usersInQueue.length === 0) return;

    const top1 = this.usersInQueue[0];
    const everyone = guild.roles.everyone;

    // Create new Top1 channel
    this.top1Channel = await guild.channels.create({
      name: `${client.users.cache.get(top1)?.username || "Top1"}-top1`,
      type: 0, // text channel
      permissionOverwrites: [
        { id: everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: top1, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        ...(this.testerID ? [{ 
          id: this.testerID, 
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] 
        }] : [])
      ]
    });

    await this.top1Channel.send({ content: `@everyone` });
  }

  async displayQueue(channel) {
    const embed = this.createQueueEmbed();
    const row = this.createQueueButtons();

    if (!this.queueMessage) {
      this.queueMessage = await channel.send({ embeds: [embed], components: [row] });
    } else {
      await this.queueMessage.edit({ embeds: [embed], components: [row] });
    }
  }

  joinQueue(userId) {
    if (this.usersInQueue.includes(userId)) return false;
    this.usersInQueue.push(userId);
    return true;
  }

  leaveQueue(userId) {
    const index = this.usersInQueue.indexOf(userId);
    if (index === -1) return false;
    this.usersInQueue.splice(index, 1);
    return true;
  }

  removeUser(userId) {
    return this.leaveQueue(userId);
  }

  clearQueue() {
    this.usersInQueue = [];
    this.testerID = null;
  }

  async stopQueue() {
    this.clearQueue();
    
    if (this.queueMessage) {
      await this.queueMessage.delete().catch(() => {});
      this.queueMessage = null;
    }
    
    if (this.top1Channel) {
      await this.top1Channel.delete().catch(() => {});
      this.top1Channel = null;
    }
  }

  setTester(userId) {
    this.testerID = userId;
  }

  isTester(userId) {
    return this.testerID === userId;
  }

  get hasQueue() {
    return this.usersInQueue.length > 0;
  }

  get queueLength() {
    return this.usersInQueue.length;
  }
}

module.exports = QueueManager;

