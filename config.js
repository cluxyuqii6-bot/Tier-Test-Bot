require('dotenv').config();

module.exports = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID
  },
  
  queue: {
    roleId: process.env.QUEUE_ROLE_ID || "1432067571267666011",
    channelId: process.env.QUEUE_CHANNEL_ID || "1431715341930860725"
  },
  
  embed: {
    color: parseInt(process.env.EMBED_COLOR || "0xFF0000", 16),
    title: process.env.EMBED_TITLE || "Crystals Queue",
    footer: process.env.EMBED_FOOTER || "Queue"
  },
  
  api: {
    skinUrl: process.env.SKIN_API_URL || "https://mc-heads.net"
  }
};

