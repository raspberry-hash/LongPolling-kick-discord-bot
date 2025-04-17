const express = require('express');
const { randomUUID } = require('crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, ActivityType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } = require('discord.js');

const app = express();
const PORT = 3000;

app.use(express.json());

const clients = {}; // { uuid: [res, res, ...] }
const queues = {};  // { uuid: Promise[] }
const lastSeen = {}; // { uuid: timestamp }

const processing = new Set(); // Queue
const processQueue = async (uuid) => {
  if (processing.has(uuid)) return; // Already processing
  processing.add(uuid);

  try {
    while (queues[uuid] && queues[uuid].length > 0) {
      const nextCommand = queues[uuid].shift();
      await nextCommand();
    }
  } catch (err) {
    console.error(`[QUEUE] Error processing ${uuid}:`, err);
  } finally {
    processing.delete(uuid);
  }
};

app.post('/connect', (req, res) => {
  const uuid = randomUUID();
  clients[uuid] = [];
  queues[uuid] = [];
  lastSeen[uuid] = Date.now();
  res.json({ uuid });
});

app.get('/uuids', (req, res) => {
  try {
    const allUUIDs = Object.keys(clients);
    if (!allUUIDs || allUUIDs.length === 0) {
      return res.status(404).json({ error: 'No UUIDs found' });
    }
    res.json({ uuids: allUUIDs });
  } catch (error) {
    console.error('Error fetching UUIDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/clear-all', (req, res) => {
  for (const uuid in clients) {
    if (clients[uuid]) {
      clients[uuid].forEach(clientRes => {
        clientRes.status(410).json({ error: 'Connection closed' });
      });
      delete clients[uuid];
    }
    if (lastSeen[uuid]) {
      delete lastSeen[uuid];
    }
    delete queues[uuid];
  }
  res.send("All UUIDs have been cleared.");
});

app.get('/', (req, res) => {
  res.send("hi");
});

app.get('/disconnect/:uuid', (req, res) => {
  const { uuid } = req.params;
  if (clients[uuid]) {
    delete clients[uuid];
    delete queues[uuid];
    res.send(`UUID ${uuid} disconnected`);
    if (lastSeen[uuid]) {
      delete lastSeen[uuid];
    }
  } else {
    res.status(404).send("UUID not found");
  }
});

app.get('/poll/:uuid', (req, res) => {
  const { uuid } = req.params;

  if (!clients[uuid]) {
    return res.status(404).json({ error: 'UUID not found' });
  }

  lastSeen[uuid] = Date.now();
  console.log(`[POLL] Updated lastSeen for ${uuid} to ${lastSeen[uuid]}`);

  // Add the response to the queue to keep the connection alive
  queues[uuid].push(async () => {
    clients[uuid].push(res);
  
    const timeout = setTimeout(() => {
      if (clients[uuid]) {
        const index = clients[uuid].indexOf(res);
        if (index !== -1) {
          clients[uuid].splice(index, 1);
  
          if (!res.headersSent) {
            res.json({ status: 'StayAlive' }); // Send only after waiting
          }
        }
      }
    }, 10000); // Wait 10 seconds before sending StayAlive
  
    res.on('close', () => {
      clearTimeout(timeout);
    });
  });

  // Trigger queue processing
  if (queues[uuid].length === 1) {
    processQueue(uuid);
  }
});

app.post('/send/:uuid', (req, res) => {
  const { uuid } = req.params;
  const message = req.body.message || "Default message";

  if (!clients[uuid] || clients[uuid].length === 0) {
    return res.status(404).send(`No waiting clients for UUID: ${uuid}`);
  }

  queues[uuid].push(async () => {
    clients[uuid].forEach(clientRes => {
      clientRes.json({ message });
    });
    clients[uuid] = [];
  });

  if (queues[uuid].length === 1) {
    processQueue(uuid);
  }

  res.send(`Message queued for UUID: ${uuid}`);
});

// Slash command registration via POST
const TOKEN = process.env['token'];
const APP_ID = process.env['appId'];
const GUILD_ID = process.env['guildId'];

let commandsRegistered = false;  // Track if commands are already registered

app.post('/updateCommands', async (req, res) => {
    if (commandsRegistered) {
    return res.status(403).json({ error: 'Commands already registered. This route can only be called once.' });
  }
  
  const data = req.body;

  // Check if the input is an array
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Input must be an array of command objects' });
  }

  // Map the incoming data to the expected command structure
  const commands = data.map(cmd => ({
    name: cmd.Name.toLowerCase(),
    description: cmd.Description,
    type: cmd.Type || 1,
    options: cmd.Options || [] // pass options if provided
  }));

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    // Attempt to register the commands with Discord's API
    const result = await rest.put(
      Routes.applicationGuildCommands(APP_ID, GUILD_ID),
      { body: commands }
    );

    // Log success and respond to the client
    console.log('✅ Slash commands registered:', result.map(r => r.name));
    commandsRegistered = true;  // Mark that commands have been registered
    res.json({ success: true, registered: result.map(r => r.name) });
  } catch (error) {
    // Log the detailed error and send the response to the client
    console.error('❌ Error registering commands:', error);
    console.error('Error Details:', error.response ? error.response.body : error.message);

    // If the error contains a response object, provide more detailed error info
    if (error.response) {
      return res.status(500).json({
        error: {
          message: error.message,
          details: error.response.body
        }
      });
    }

    // Fallback for general errors
    res.status(500).json({ error: error.message });
  }
});


// Discord bot setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let startTime = Date.now();  // When the bot starts

client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  updateBotStatus();
});

function updateBotStatus() {
  const uptime = Date.now() - startTime; // Get uptime in milliseconds
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

  const statusMessage = `server for ${days}:${hours}:${minutes}`;
  client.user.setActivity(statusMessage, {
    type: ActivityType.Listening, // Set the activity type to "listening"
  });
}

// Update the bot's status every minute (60000ms)
setInterval(updateBotStatus, 60000);

// Handle old uuids that arent pinging
const TIMEOUT = 30000; // 30 seconds
const CLEANUP_INTERVAL = 7000; // 15 seconds
function cleanupStaleClients() {
  const now = Date.now();
  // console.log("Running cleanup at", new Date(now).toISOString());
  // yeah

  for (const uuid in lastSeen) {
    const diff = now - lastSeen[uuid];
    console.log(`Checking ${uuid}, last seen ${diff}ms ago`);
    
    if (diff > TIMEOUT) {
      console.log(`Removing stale client: ${uuid}`);
      delete lastSeen[uuid];

      if (clients[uuid]) {
          delete clients[uuid];
          delete queues[uuid];
          console.log(`Deleted client and queue for ${uuid}`);
      } else {
        console.log(`No client data found for ${uuid}`);
      }
    }
  }
}
setInterval(cleanupStaleClients, CLEANUP_INTERVAL);

const ranksData = JSON.parse(fs.readFileSync('./stupidfuckingranksthatchatgptcouldeasiallydo.json', 'utf8'));
console.log(ranksData);

client.commands = new Collection();

const commandOptionsMap = new Map(); // Store original command options

client.on(Events.InteractionCreate, async interaction => {
  // Handle slash command
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    const limits = ranksData[interaction.commandName] || ranksData["default"];
    const userId = interaction.user.id;
    const userHasDirectAccess = limits.ranks.includes(userId);

    const memberRoles = interaction.member.roles.cache.map(role => role.name.toLowerCase());
    const requiredRoles = limits.roles.map(role => role.toLowerCase());
    const userHasRoleAccess = memberRoles.some(role => requiredRoles.includes(role));
    const isEveryoneCommand = limits.everyone === true;

    if (!isEveryoneCommand && !userHasDirectAccess && !userHasRoleAccess) {
      return await interaction.reply({
        content: "❌**Womp Womp**... You're lacking permissions for this command.",
        ephemeral: false // true usally but set to false to clown others in general who attempt to use lol? idk
      });
    }
    
    if (!command || !command.execute) {
      console.log(`Handling manual response for command: ${interaction.commandName}`);

      try {
        await interaction.deferReply({ ephemeral: false });

        const compiledOptions = {};
        for (const opt of interaction.options.data) {
          compiledOptions[opt.name] = opt.value;
        }

        // Store options by interaction ID
        commandOptionsMap.set(interaction.id, compiledOptions);

        const uuidOptions = Object.keys(clients).map(uuid =>
          new StringSelectMenuOptionBuilder()
            .setLabel(`UUID: ${uuid.slice(0, 8)}...`)
            .setDescription(`Send to UUID: ${uuid}`)
            .setValue(uuid)
        );

        if (uuidOptions.length === 0) {
          return await interaction.followUp({
            content: '⚠️ No active UUIDs found.',
            ephemeral: true
          });
        }

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`http_uuid_select_${interaction.commandName}_${interaction.id}`)
          .setPlaceholder('Select a UUID to send the command to')
          .addOptions(uuidOptions.slice(0, 25)); // Max 25 options

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.followUp({
          content: `This command was registered via HTTP. Select a UUID to dispatch it to:`,
          components: [row]
        });

      } catch (error) {
        console.error('Error handling interaction without execute:', error);
        await interaction.followUp({
          content: 'There was an error processing your command. Please try again later.',
          ephemeral: true
        });
      }

    } else {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Error executing command:', error);
        await interaction.reply({
          content: 'There was an error executing this command!',
          ephemeral: true
        });
      }
    }

  // Handle dropdown UUID selection
  } else if (interaction.isStringSelectMenu() && interaction.customId.startsWith('http_uuid_select_')) {
    const customIdParts = interaction.customId.split('_');
    const commandName = customIdParts[3];
    const originalInteractionId = customIdParts.slice(4).join('_');
    const selectedUuid = interaction.values[0];

    const compiledOptions = commandOptionsMap.get(originalInteractionId) || {};

    if (clients[selectedUuid]) {
      queues[selectedUuid].push(async () => {
        clients[selectedUuid].forEach(clientRes => {
          clientRes.json({
            arguments: compiledOptions,
            command: commandName,
            message: `If you're seeing this, something went wrong on your end!`,
            author: `@${interaction.user.username}`
          });
        });
        clients[selectedUuid] = [];

        // Clean up
        commandOptionsMap.delete(originalInteractionId);
      });

      if (queues[selectedUuid].length === 1) {
        processQueue(selectedUuid);
      }

      const embed = new EmbedBuilder()
        .setTitle('Command Sent')
        .setDescription(`\n\`${selectedUuid}\``)
        .setColor(0x00FF00)
        .setTimestamp();

      await interaction.update({
        content: `${interaction.user}`,
        embeds: [embed],
        components: []
      });

    } else {
      await interaction.reply({
        content: `❌ UUID not found or expired.`,
        ephemeral: true
      });
    }
  }
});



// Load command files dynamically
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Start server and login bot
app.listen(PORT, () => {
  console.log(`✅ Express server running on http://localhost:${PORT}`);
});
client.login(TOKEN);