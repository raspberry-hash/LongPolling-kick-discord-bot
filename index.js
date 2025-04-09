rasp.pi
rasp.pi
In a call





Direct Message

Christopher
AKA
KonekoKitten
Search

region
Automatic







chat
April 8, 2025

Christopher — 8:59 PM
so you can automate it

rasp.pi — 8:59 PM
automate adding new commands?

Christopher — 8:59 PM
yep
[8:59 PM]


rasp.pi — 8:59 PM
shit i might be able to

Christopher — 8:59 PM


rasp.pi — 8:59 PM
wait i cant

Christopher — 9:00 PM
how come

rasp.pi — 9:00 PM
i cant directly edit the files during runtime

Christopher — 9:00 PM
the commands are registered when the bot is logged into, so just automate it before logging in
[9:00 PM]
you dont need to edt them, just make it collect the data using variables
[9:00 PM]
for that session uptime

rasp.pi — 9:00 PM
you realize its connected to github

Christopher — 9:00 PM
yeah?
[9:00 PM]
ive done it before

rasp.pi — 9:00 PM
show me

Christopher — 9:00 PM
its in my ai bot
[9:01 PM]
or wait the other one sorry
[9:01 PM]
the uh
[9:01 PM]
the screenshare thing did it
[9:01 PM]
i had edited it to send a remote to the server, my client sent the remote back to the server

rasp.pi — 9:01 PM
oh?

Christopher — 9:01 PM
and the remote sent it to my localhost
[9:01 PM]
its entirely possible
[9:01 PM]
you just need to set it up in a weird way

rasp.pi — 9:01 PM
alright
[9:01 PM]
well here
[9:02 PM]
i wont be able to do anything for a little bit until my stepbrother is done playing basketball with me
[9:02 PM]
but while im gone find it

Christopher — 9:02 PM
no worries
[9:02 PM]
got it

rasp.pi — 9:02 PM
thank you
[9:02 PM]


Christopher — 9:04 PM
app.post('/updateCommands', async (req, res) => {
  const data = req.body;

  if (!data.Name || !data.Description) {
    return res.status(400).json({ error: 'Missing Name or Description' });
  }

  const commands = [
    {
      name: data.Name.toLowerCase(),
      description: data.Description,
      type: 1 // Slash command
    }
  ];

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  try {
    const result = await rest.put(
      Routes.applicationGuildCommands(APP_ID, GUILD_ID),
      { body: commands }
    );

    console.log('🔁 Slash command(s) updated:', result);
    res.json({ success: true, commands: result });
  } catch (error) {
    console.error('❌ Error registering command:', error);
    res.status(500).json({ error: error.message });
  }
});

client.login(TOKEN);
app.listen(3000, () => {
  console.log('Express server running on http://localhost:3000');
});
[9:04 PM]
thats it
[9:05 PM]
its just waiting for the server to send it data in json, it decodes it into command data that it can use to register the slash command
[9:06 PM]
you need to wait for the server to send over the commands and use a variable to set it, add a timer for the bot being logged into and when the commands are sent, log in

Christopher — 9:30 PM


@Christopher
Click to see attachment

rasp.pi — 9:37 PM
i like

Christopher — 9:39 PM
i dont think the bot likes
[9:39 PM]
when i constantly call connection to test
[9:39 PM]
im just getting 404 now unless u did smt

rasp.pi — 9:42 PM
lemme see
[9:43 PM]

[9:43 PM]
thats why
[9:43 PM]
odd
[9:43 PM]
im gonna shower and figure it out after
[9:43 PM]
brb

Christopher — 9:45 PM
alright
[9:45 PM]
yeah, idk its been working fien for like all day
[9:46 PM]
ive been testing it every now n then
[9:46 PM]
http://ip-api.com/json/ anyway i had to switch to this api instead
[9:46 PM]
the old one i was using was so slow it would sometimes cause my script ot jkust halt without error
[9:46 PM]
https://ipconfig.io/json this is the old
[9:52 PM]
ok well, i fixed it

[9:52 PM]
no more random halting thankfully

rasp.pi — 10:19 PM
hi
[10:19 PM]
im back
[10:19 PM]
error stopped?
[10:21 PM]
come online

Christopher — 10:22 PM
yto
[10:22 PM]
im here
[10:23 PM]
wanna vc
[10:26 PM]
errors stopped 

rasp.pi — 10:26 PM
yeah
[10:26 PM]
okay
rasp.pi started a call. — 10:26 PM

rasp.pi — 10:27 PM
yo

Christopher — 10:27 PM
hello?
[10:27 PM]
can u not hear me
[10:27 PM]
tf

rasp.pi — 10:27 PM
no
[10:27 PM]
loilk
[10:27 PM]
lol

Christopher — 10:28 PM
bruh
[10:28 PM]
wait

rasp.pi — 10:28 PM
ok

Christopher — 10:31 PM
Author
[10:31 PM]
@rasp.pi
[10:31 PM]
Author = "User who ran command"
[10:31 PM]
data
[10:33 PM]
https://www.youtube.com/watch?v=jOvU_rQCrBc&
YouTube
Wettmilk
party rock anthem low quality


rasp.pi — 10:38 PM
const express = require('express');
const { randomUUID } = require('crypto');
const app = express();
const PORT = 3000;

app.use(express.json());
Expand
message.txt
5 KB

Christopher — 10:39 PM
async function processQueue() {
    if (isProcessing || messageQueue.length === 0) return;

    isProcessing = true;

    const { message, isImageRequest } = messageQueue.shift();
    const contentWithoutMentions = message.content.replace(/<@!?(\d+)>/g, '').trim();

    let response;
    //const sentm = await message.reply(`## [Processing](https://tenor.com/view/processing-esmbot-discord-discord-bot-beetlejuice-gif-19970580)`); // ### • • •
    const sentm = await message.reply(`[Pending Response]`);
    let resorttodefault = false

    if (contentWithoutMentions.length == 0) {
        resorttodefault = true
    }
    
    if (contentWithoutMentions === '' || resorttodefault == true) {
        response = `## [Waddup](https://i.scdn.co/image/ab67616d00001e028386d2dffb3e43401bc083ca) ${message.author.displayName}! I am ${client.user.displayName}! I'm an unofficial re-make of the now discontinued discord **Ai chatbot** (**Clyde**)!\n### I am in no way whatsoever affiliated with discord or any specific discord server. As it stands, I am currently entirely free to use and in testing. \nDeveloped by **wikiipedia.** With help from **rasp.pi**\nTo get started, please reply to my message or ping me with a question and I will answer as soon as I can! You can also say **${cmdprefix}help** to activate my commands prompt!\n\n***Please keep in mind, my response times may be delayed and errors can occour! If an error is caught, I will let you know.***\n### Do not share personal, sensitive or private information regarding you or anyone else during conversation with this bot, the creator may use conversations and data collected to further improve the bot and conversations between can be read. Breaking any rules will result in your messages being reported directly to discord, this can differ in severity; in some cases resulting in Police Communication and/or account deletion. Be respectful & follow Discord [Terms of Service](https://discord.com/terms)/[Guidelines](https://discord.com/guidelines)`;
    } else {
        response = await sendMessageToCharacterAI(message.author.id, contentWithoutMentions, isImageRequest, message);
    }

    try {
        await sentm.delete()
        await message.reply(response);
    } catch (error) {
        console.error("Error sending reply:", error);
        await message.reply("Sorry, there was an error processing your request.");
    }

    isProcessing = false;
    processQueue();
}
[10:41 PM]
const queues = {};
[10:41 PM]
const processQueue = async (uuid) => {
  while (queues[uuid] && queues[uuid].length > 0) {
    const nextCommand = queues[uuid].shift(); // Get the next command
    await nextCommand(); // Process it
  }
};
[10:41 PM]
const express = require('express');
const { randomUUID } = require('crypto');
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

rasp.pi — 10:42 PM
// EXPRESS + DISCORD.JS COMPACT
const express = require('express'), { randomUUID } = require('crypto'), app = express(), fs = require('fs'), path = require('path'),
{ Client, Collection, Events, GatewayIntentBits } = require('discord.js'), PORT = 3000, clients = {}, client = new Client({ intents: [GatewayIntentBits.Guilds] });

app.use(express.json());
app.post('/connect', (req, res) => res.json({ uuid: (clients[randomUUID()] = [], Object.keys(clients).at(-1)) }));
Expand
message.txt
3 KB
[10:43 PM]
const e = require('express'), { randomUUID: u } = require('crypto'), a = e(), f = require('fs'), p = require('path'),
{ Client: C, Collection: L, Events: E, GatewayIntentBits: G } = require('discord.js'), s = 3000, c = {}, d = new C({ intents: [G.Guilds] });

a.use(e.json());
a.post('/connect', (r, t) => { const i = u(); c[i] = []; t.json({ uuid: i }); });
a.get('/uuids', (r, t) => Object.keys(c).length ? t.json({ uuids: Object.keys(c) }) : t.status(404).json({ error: 'None' }));
Expand
message.txt
3 KB
[10:44 PM]

[10:44 PM]
const e = require('express')(), { randomUUID: u } = require('crypto'), c = {}, d = new (require('discord.js').Client)({ intents: [1] });

e.use(require('express').json());
e.post('/connect', (r, t) => (c[u()] = [], t.json({ uuid: Object.keys(c).at(-1) })));
e.get('/poll/:i', (r, t) => {
  if (!c[r.params.i]) return t.sendStatus(404);
  c[r.params.i].push(t);
  setTimeout(() => { const i = c[r.params.i].indexOf(t); if (i > -1) c[r.params.i].splice(i, 1), t.sendStatus(204); }, 3e4);
});
e.post('/send/:i', (r, t) => {
  const q = c[r.params.i]; q?.length ? (q.forEach(x => x.json({ message: r.body.message || 'msg' })), c[r.params.i] = [], t.send('ok')) : t.sendStatus(404);
});
e.listen(3000);

// Discord
d.commands = new (require('discord.js').Collection)();
d.once('ready', x => console.log(x.user.tag));
d.on('interactionCreate', async i => {
  const cmd = d.commands.get(i.commandName);
  if (i.isChatInputCommand() && cmd) try { await cmd.execute(i); } catch { i.reply({ content: 'err', ephemeral: 1 }); }
});
require('fs').readdirSync(require('path').join(__dirname, 'commands')).forEach(f => {
  const m = require('./commands/' + f); if (m.data && m.execute) d.commands.set(m.data.name, m);
});
d.login(process.env.token);
[10:45 PM]
OH MY GOD

Christopher — 10:48 PM
client.login(process.env['token'])

rasp.pi — 10:49 PM


Christopher — 10:49 PM


rasp.pi — 10:50 PM


Christopher — 10:54 PM
javascript
const express = require('express');
const { randomUUID } = require('crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
Expand
message.txt
6 KB
[10:55 PM]


rasp.pi — 10:59 PM
const x = require, a = x('express')(), u = x('crypto').randomUUID, c = {}, d = new (x('discord.js').Client)({ intents: [1] });

a.use(x('express').json());
a.post('/connect', (r, s) => (c[u()] = [], s.json({ uuid: Object.keys(c).at(-1) })));
a.get('/poll/:i', (r, s) => {
  let q = c[r.params.i]; if (!q) return s.sendStatus(404);
  q.push(s); setTimeout(() => { let i = q.indexOf(s); if (i > -1) q.splice(i, 1), s.sendStatus(204); }, 3e4);
});
a.post('/send/:i', (r, s) => {
  let q = c[r.params.i]; q?.length ? (q.forEach(z => z.json({ message: r.body.message || 'msg' })), c[r.params.i] = [], s.send()) : s.sendStatus(404);
});
a.listen(3e3);

d.commands = new (x('discord.js').Collection)();
d.once('ready', b => console.log(b.user.tag));
d.on('interactionCreate', async i => {
  let m = d.commands.get(i.commandName);
  if (i.isChatInputCommand() && m) try { await m.execute(i); } catch { i.reply({ content: 'err', ephemeral: 1 }) }
});
x('fs').readdirSync('./commands').forEach(f => {
  let m = x('path').join('./commands', f); m = require(m); if (m.data && m.execute) d.commands.set(m.data.name, m);
});
d.login(process.env.token);

Christopher — 11:00 PM
javascript
const express = require('express');
const { randomUUID } = require('crypto');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
Expand
message.txt
6 KB


Message @Christopher
﻿





;
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
      const index = clients[uuid].indexOf(res);
      if (index !== -1) {
        clients[uuid].splice(index, 1); // Remove client from the list after timeout
        res.status(204).end(); // No Content
      }
    }, 30000); // Timeout after 30 seconds if no response
  });

  // Process the queue if it's not already processing
  if (queues[uuid].length === 1) {
    processQueue(uuid);
  }

  res.send(`Poll request queued for UUID: ${uuid}`);
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
