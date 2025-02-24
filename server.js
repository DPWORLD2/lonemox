const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" }
});

app.use(cors());
app.use(express.json());

let containers = [];

app.get("/api/container/list", (req, res) => {
  res.json({ containers });
});

app.post("/api/container/update", (req, res) => {
  const { id, name, cpu, memory } = req.body;
  containers = containers.map((c) => (c.id === id ? { ...c, name, cpu, memory } : c));
  io.emit("container-updated", { id, name, cpu, memory });
  res.json({ success: true });
});

app.post("/api/container/delete", (req, res) => {
  const { container_id } = req.body;
  containers = containers.filter((c) => c.id !== container_id);
  io.emit("container-deleted", container_id);
  res.json({ success: true });
});

server.listen(5000, () => console.log("Server running on port 5000"));
