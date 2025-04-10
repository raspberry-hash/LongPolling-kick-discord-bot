const express = require('express');
const { randomUUID } = require('crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, ActivityType } = require('discord.js');

const app = express();
const PORT = 3000;

app.use(express.json());

const clients = {}; // { uuid: [res, res, ...] }
const queues = {};  // { uuid: Promise[] }

const processQueue = async (uuid) => {
  while (queues[uuid] && queues[uuid].length > 0) {
    const nextCommand = queues[uuid].shift();
    await nextCommand();
  }
};

app.post('/connect', (req, res) => {
  const uuid = randomUUID();
  clients[uuid] = [];
  queues[uuid] = [];
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
  } else {
    res.status(404).send("UUID not found");
  }
});

app.get('/poll/:uuid', (req, res) => {
  const { uuid } = req.params;

  if (!clients[uuid]) {
    return res.status(404).json({ error: 'UUID not found' });
  }

  queues[uuid].push(async () => {
    clients[uuid].push(res);

    setTimeout(() => {
      if (clients[uuid]) {
        const index = clients[uuid].indexOf(res);
        if (index !== -1) {
          clients[uuid].splice(index, 1);
          res.status(204).end();
        }
      }
    }, 30000);
  });

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

app.post('/updateCommands', async (req, res) => {
  const data = req.body;

  // Check if the input is an array
  if (!Array.isArray(data)) {
    return res.status(400).json({ error: 'Input must be an array of command objects' });
  }

  // Map the incoming data to the expected command structure
  const commands = data.map(cmd => ({
    name: cmd.Name.toLowerCase(),
    description: cmd.Description,
    type: cmd.Type || 1
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
  const uptime = Date.now() - startTime;  // Get uptime in milliseconds
  const hours = Math.floor(uptime / (1000 * 60 * 60));
  const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

  const statusMessage = `Up for ${hours}h ${minutes}m`;
  client.user.setActivity(statusMessage, {
    type: ActivityType.Watching,  // Set the activity type to "watching"
  });
}

// Update the bot's status every minute (60000ms)
setInterval(updateBotStatus, 60000);

client.commands = new Collection();

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
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
