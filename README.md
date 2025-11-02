# Tier Test Bot

A Discord bot for managing tier test queues.

Made by Deanbeans & _zvo | Used by https://discord.gg/gArnEf6SY4

## Features

- Queue management for tier tests
- Automatic embed generation
- Role-based permissions
- Result tracking with Minecraft avatars
- Top1 channel management

## Installation

### Requirements

- Node.js 18.0.0 or higher
- A Discord bot token

### Setup

1. **Clone repository**
```bash
git clone https://github.com/cluxyuqii6-bot/Tier-Test-Bot.git
cd Tier-Test-Bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit the `.env` file and add your Discord bot token and IDs:
- `DISCORD_TOKEN`: Your Discord bot token
- `GUILD_ID`: Your Discord server ID (optional)
- `QUEUE_ROLE_ID`: ID of the role that can start the queue
- `QUEUE_CHANNEL_ID`: ID of the channel where the queue is displayed

4. **Start bot**
```bash
npm start
```

## Project Structure

```
Tier-Test-Bot/
├── index.js              # Main entry point
├── config.js             # Configuration file
├── package.json          # Dependencies & Scripts
├── .env.example          # Example environment variables
├── commands/             # Slash Commands
│   ├── queue.js         # Start queue
│   ├── stopqueue.js     # Stop queue
│   ├── remove.js        # Remove user
│   └── result.js        # Send test result
├── events/               # Discord Events
│   ├── ready.js         # Bot ready
│   └── interactionCreate.js  # Handle interactions
└── utils/                # Helper functions
    └── QueueManager.js   # Queue logic
```

## Commands

- `/queue` - Start the queue
- `/stopqueue` - Stop the queue (Admin only)
- `/remove [user]` - Remove a user from the queue (Admin only)
- `/result` - Send a test result

## Skin API

The bot uses [mc-heads.net](https://mc-heads.net/) for Minecraft avatars in result embeds.

## Credits

- **Developers**: Deanbeans & _zvo
- **Community**: https://discord.gg/gArnEf6SY4

## License

MIT License
