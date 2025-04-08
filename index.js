const express = require('express');
const { randomUUID } = require('crypto');
const app = express();
const PORT = 3000;

app.use(express.json());

const clients = {}; // { uuid: [res, res, ...] }
app.post('/connect', (req, res) => {
  const uuid = randomUUID();
  clients[uuid] = [];
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
  // Clear the 'clients' object which holds all UUIDs and their associated responses
  for (const uuid in clients) {
    if (clients[uuid]) {
      clients[uuid].forEach(clientRes => {
        clientRes.status(410).json({ error: 'Connection closed' });
      });
      delete clients[uuid];  // Remove the UUID from the clients list
    }
  }
  res.send("All UUIDs have been cleared.");
});

app.get('/',(req,res)=>{
res.send("hi")
})
app.get('/disconnect/:uuid', (req, res) => {
  const { uuid } = req.params;
  if (clients[uuid]) {
   
    delete clients[uuid];
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

  clients[uuid].push(res);

  setTimeout(() => {
    const index = clients[uuid].indexOf(res);
    if (index !== -1) {
      clients[uuid].splice(index, 1);
      res.status(204).end(); // No Content
    }
  }, 30000);
});


app.post('/send/:uuid', (req, res) => {
  const { uuid } = req.params;
  const message = req.body.message || "Default message";

  if (clients[uuid] && clients[uuid].length > 0) {
    clients[uuid].forEach(clientRes => {
      clientRes.json({ message });
    });
    clients[uuid] = [];
    res.send(`Message sent to ${uuid}`);
  } else {
    res.status(404).send(`No waiting clients for UUID: ${uuid}`);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

//DJS

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
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
client.login(process.env['token'])
