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
app.get('/',(req,res)=>{
res.send("hi")
})
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
