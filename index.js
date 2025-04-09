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
client.login(process.env['token'])
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

