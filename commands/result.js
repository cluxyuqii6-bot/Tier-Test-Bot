const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('result')
    .setDescription('Send test result')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User tested')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('region')
        .setDescription('Region')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Username')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('previous_rank')
        .setDescription('Previous rank')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('rank_earned')
        .setDescription('New rank')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const { options, user } = interaction;
    
    const testUser = options.getUser('user');
    const region = options.getString('region');
    const username = options.getString('username');
    const previousRank = options.getString('previous_rank');
    const rankEarned = options.getString('rank_earned');

    const avatarUrl = `${config.api.skinUrl}/avatar/${username}`;
    
    const embed = new EmbedBuilder()
      .setTitle(`${testUser.username}'s Test Results 🏆`)
      .setThumbnail(avatarUrl)
      .addFields(
        { name: "Tester", value: `<@${user.id}>`, inline: true },
        { name: "Region", value: region, inline: true },
        { name: "Username", value: username, inline: true },
        { name: "Previous Rank", value: previousRank, inline: true },
        { name: "Rank Earned", value: rankEarned, inline: true }
      )
      .setColor(config.embed.color);

    await interaction.reply({ embeds: [embed] });
  }
};

