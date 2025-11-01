"use strict";

const { 
		Client, GatewayIntentBits, Partials,
		ActionRowBuilder, ButtonBuilder, ButtonStyle,
		SlashCommandBuilder, EmbedBuilder,
		PermissionsBitField, MessageFlags
} = require("discord.js");

const client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
		partials: [Partials.Channel]
});

// ---- CONFIG ----
const QUEUE_ROLE_ID = "1432067571267666011"; // role to start queue
const QUEUE_CHANNEL_ID = "1431715341930860725"; // channel to show queue embed
let usersInQueue = [];
let queueMessage = null;
let top1Channel = null;
let testerID = null;

client.once("clientReady", async () => {
		console.log(`Logged in as ${client.user.tag}`);
		const guild = client.guilds.cache.first();
		if (!guild) return console.error("No guild found");

		// Register commands
		await guild.commands.set([
				new SlashCommandBuilder().setName("queue").setDescription("Start queue"),
				new SlashCommandBuilder().setName("stopqueue").setDescription("Stop the queue"),
				new SlashCommandBuilder().setName("remove").setDescription("Remove user from queue")
						.addStringOption(option => option.setName("user").setDescription("User ID or mention").setRequired(true)),
				new SlashCommandBuilder().setName("result").setDescription("Send test result")
						.addUserOption(option => option.setName("user").setDescription("User tested").setRequired(true))
						.addStringOption(option => option.setName("region").setDescription("Region").setRequired(true))
						.addStringOption(option => option.setName("username").setDescription("Username").setRequired(true))
						.addStringOption(option => option.setName("previous_rank").setDescription("Previous rank").setRequired(true))
						.addStringOption(option => option.setName("rank_earned").setDescription("New rank").setRequired(true))
		].map(cmd => cmd.toJSON()));

		console.log("Commands registered.");
});


function createQueueEmbed() {
		return new EmbedBuilder()
				.setTitle("Crystals Queue")
				.setDescription(
						`**Tester**: ${testerID ? `<@${testerID}>` : "None"}\n\n` +
						`**Queue**:\n` +
						(usersInQueue.length > 0 ? usersInQueue.map((id,i) => `${i+1}. <@${id}>`).join("\n") : "No one in queue yet.")
				)
				.setColor(0xFF0000) 
                .setFooter({ text: "Queue" });
}


async function updateTop1Channel(guild) {
		if (top1Channel) {
				await top1Channel.delete().catch(() => {});
				top1Channel = null;
		}
		if (usersInQueue.length === 0) return;

		const top1 = usersInQueue[0];
		const everyone = guild.roles.everyone;

		top1Channel = await guild.channels.create({
				name: `${client.users.cache.get(top1)?.username || "Top1"}-top1`,
				type: 0, // text channel
				permissionOverwrites: [
						{ id: everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
						{ id: top1, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
						...(testerID ? [{ id: testerID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }] : [])
				]
		});

		await top1Channel.send({ content: `@everyone` });
}

// ---- SLASH COMMAND HANDLER ----
client.on("interactionCreate", async interaction => {
		if (!interaction.isChatInputCommand()) return;
		const { commandName, member, guild } = interaction;

		if (commandName === "queue") {
				if (!member.roles.cache.has(QUEUE_ROLE_ID))
						return interaction.reply({ content: "You do not have the required role.", flags: MessageFlags.Ephemeral });

				if (!testerID) testerID = member.id;

				const channel = guild.channels.cache.get(QUEUE_CHANNEL_ID);
				if (!channel) return interaction.reply({ content: "Queue channel not found.", flags: MessageFlags.Ephemeral });

				const embed = createQueueEmbed();
				const row = new ActionRowBuilder().addComponents(
						new ButtonBuilder().setCustomId("joinQueue").setLabel("Join Queue").setStyle(ButtonStyle.Primary),
						new ButtonBuilder().setCustomId("leaveQueue").setLabel("Leave Queue").setStyle(ButtonStyle.Secondary)
				);

				if (!queueMessage) {
						queueMessage = await channel.send({ embeds: [embed], components: [row] });
				} else {
						await queueMessage.edit({ embeds: [embed], components: [row] });
				}

				await interaction.reply({ content: "Queue is active!", flags: MessageFlags.Ephemeral });
		}

		else if (commandName === "stopqueue") {
				if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
						return interaction.reply({ content: "You do not have permissions.", flags: MessageFlags.Ephemeral });

				await interaction.reply({ content: "Queue stopped.", flags: MessageFlags.Ephemeral });

				usersInQueue = [];
				testerID = null;

				if (queueMessage) await queueMessage.delete().catch(() => {});
				queueMessage = null;

				if (top1Channel) await top1Channel.delete().catch(() => {});
				top1Channel = null;
		}

		else if (commandName === "remove") {
				if (!member.permissions.has(PermissionsBitField.Flags.Administrator))
						return interaction.reply({ content: "You do not have permissions.", flags: MessageFlags.Ephemeral });

				let user = interaction.options.getString("user").replace(/\D/g, "");
				if (!usersInQueue.includes(user)) return interaction.reply({ content: "User is not in queue.", flags: MessageFlags.Ephemeral });

				usersInQueue = usersInQueue.filter(u => u !== user);
				if (queueMessage) await queueMessage.edit({ embeds: [createQueueEmbed()] });
				await updateTop1Channel(guild);

				return interaction.followUp({ content: "User removed.", flags: MessageFlags.Ephemeral });
		}

		else if (commandName === "result") {
				const user = interaction.options.getUser("user");
				const region = interaction.options.getString("region");
				const username = interaction.options.getString("username");
				const previousRank = interaction.options.getString("previous_rank");
				const rankEarned = interaction.options.getString("rank_earned");

				const avatarUrl = `https://mc-heads.net/avatar/${username}`;
				const embed = new EmbedBuilder()
						.setTitle(`${user.username}'s Test Results 🏆`)
						.setThumbnail(avatarUrl)
						.addFields(
								{ name: "Tester", value: `<@${interaction.user.id}>`, inline: true },
								{ name: "Region", value: region, inline: true },
								{ name: "Username", value: username, inline: true },
								{ name: "Previous Rank", value: previousRank, inline: true },
								{ name: "Rank Earned", value: rankEarned, inline: true }
						)
						.setColor(0xFF0000); 

				await interaction.reply({ embeds: [embed] });
		}
});

// ---- BUTTON HANDLER ----
client.on("interactionCreate", async interaction => {
		if (!interaction.isButton()) return;

		if (interaction.customId === "joinQueue") {
				if (interaction.user.id === testerID) return interaction.reply({ content: "Tester cannot join the queue.", flags: MessageFlags.Ephemeral });
				if (usersInQueue.includes(interaction.user.id)) return interaction.reply({ content: "You are already in queue!", flags: MessageFlags.Ephemeral });

				usersInQueue.push(interaction.user.id);
				if (queueMessage) await queueMessage.edit({ embeds: [createQueueEmbed()] });
				await updateTop1Channel(interaction.guild);
				return interaction.reply({ content: "You joined the queue!", flags: MessageFlags.Ephemeral });
		}

		else if (interaction.customId === "leaveQueue") {
				if (!usersInQueue.includes(interaction.user.id)) return interaction.reply({ content: "You are not in queue!", flags: MessageFlags.Ephemeral });

				usersInQueue = usersInQueue.filter(u => u !== interaction.user.id);
				if (queueMessage) await queueMessage.edit({ embeds: [createQueueEmbed()] });
				await updateTop1Channel(interaction.guild);
				return interaction.reply({ content: "You left the queue.", flags: MessageFlags.Ephemeral });
		}
});

client.login(process.env.token); // if you dont use replit change it to something else just use gpt if you dont know how to!
