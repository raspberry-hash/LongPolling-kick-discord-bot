const express = require('express');
const { randomUUID } = require('crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = 3000;

app.use(express.json());

const clients = {}; // { uuid: [res, res, ...] }
const queues = {};  // Queue system: { uuid: Promise[] }

// Function to process queue items sequentially
const processQueue = async (uuid) => {
  while (queues[uuid] && queues[uuid].length > 0) {
    const nextCommand = queues[uuid].shift(); // Get the next command
    await nextCommand(); // Process it
  }
};

app.post('/connect', (req, res) => {
  const uuid = randomUUID();
  clients[uuid] = [];
  queues[uuid] = [];  // Initialize an empty queue for this UUID
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
    delete queues[uuid];  // Clear the queue for the UUID
  }
  res.send("All UUIDs have been cleared.");
});

app.get('/', (req, res) => {
  res.send("hi")
});

app.get('/disconnect/:uuid', (req, res) => {
  const { uuid } = req.params;
  if (clients[uuid]) {
    delete clients[uuid];
    delete queues[uuid];  // Remove the queue when disconnecting
    res.send(`UUID ${uuid} disconnected`);
  } else {
    res.status(404).send("UUID not found");
  }
});

// Queue the poll request and process it sequentially
app.get('/poll/:uuid', (req, res) => {
  const { uuid } = req.params;

  if (!clients[uuid]) {
    return res.status(404).json({ error: 'UUID not found' });
  }

  // Add the poll request to the queue for this UUID
  queues[uuid].push(async () => {
    clients[uuid].push(res); // Add the response to the list of waiting clients

    // Set a timeout for handling the client response
    setTimeout(() => {
      // Ensure that clients[uuid] is defined and has entries before proceeding
      if (clients[uuid]) {
        const index = clients[uuid].indexOf(res);
        if (index !== -1) {
          clients[uuid].splice(index, 1); // Remove client from the list after timeout
          res.status(204).end(); // No Content
        }
      }
    }, 30000); // Timeout after 30 seconds if no response
  });

  // Process the queue if it's not already processing
  if (queues[uuid].length === 1) {
    processQueue(uuid);
  }

  // No immediate response, we let the queue handle the actual response.
});

// Send message to all waiting clients for the given UUID
app.post('/send/:uuid', (req, res) => {
  const { uuid } = req.params;
  const message = req.body.message || "Default message";

  if (!clients[uuid] || clients[uuid].length === 0) {
    return res.status(404).send(`No waiting clients for UUID: ${uuid}`);
  }

  // Add the command to the queue for processing
  queues[uuid].push(async () => {
    // Process the send operation
    clients[uuid].forEach(clientRes => {
      clientRes.json({ message });
    });
    clients[uuid] = []; // Clear the clients once the message is sent
  });

  // Process the queue if it's not already processing
  if (queues[uuid].length === 1) {
    processQueue(uuid);
  }

  res.send(`Message queued for UUID: ${uuid}`);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Discord bot code
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});
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

// Dynamically load commands from the "commands" folder
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Log in to Discord with your client's token
client.login(process.env['token']);
