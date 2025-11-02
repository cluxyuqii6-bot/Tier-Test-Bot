const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ready',
  once: true,
  
  async execute(client, queueManager, config) {
    console.log(`Logged in as ${client.user.tag}`);
    
    const guild = client.guilds.cache.get(config.discord.guildId || client.guilds.cache.first()?.id);
    if (!guild) {
      return console.error("No guild found");
    }

    // Load commands from commands folder
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands'))
      .filter(file => file.endsWith('.js'));

    const commands = commandFiles.map(file => {
      const command = require(`../commands/${file}`);
      return command.data.toJSON();
    });

    // Register commands
    await guild.commands.set(commands);

    console.log(`Successfully registered ${commands.length} commands.`);
  }
};

