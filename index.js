const express = require('express');
const { randomUUID } = require('crypto');
const app = express();
const PORT = 3000;

app.use(express.json());

const clients = {}; // { uuid: [res, res, ...] }
app.post('/connect', (req, res) => {
  const uuid = randomUUID();

  // Set initial data with timeout cleanup
  const timeout = setTimeout(() => {
    delete clients[uuid];
    console.log(`⏱️ UUID expired and removed: ${uuid}`);
  }, 5 * 60 * 1000); // 5 minutes

  clients[uuid] = { queue: [], timeout };
  res.json({ uuid });
});
app.get('/uuids', (req, res) => {
  const allUUIDs = Object.keys(clients);
  res.json({ uuids: allUUIDs });
});

app.get('/',(req,res)=>{
res.send("hi")
})
app.get('/poll/:uuid', (req, res) => {
  const { uuid } = req.params;
  const client = clients[uuid];

  if (!client) {
    return res.status(404).json({ error: 'UUID not found' });
  }

  // Reset inactivity timer
  clearTimeout(client.timeout);
  client.timeout = setTimeout(() => {
    delete clients[uuid];
    console.log(`⏱️ UUID expired and removed: ${uuid}`);
  }, 5 * 60 * 1000); // Reset 5 minutes

  client.queue.push(res);

  setTimeout(() => {
    const index = client.queue.indexOf(res);
    if (index !== -1) {
      client.queue.splice(index, 1);
      res.status(204).end();
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
