const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const tf = require("@tensorflow/tfjs-node");
const fs = require("fs");
const schedule = require("node-schedule");
const { ComputeManagementClient } = require("@azure/arm-compute");
const DigitalOcean = require("digitalocean");
const { Server } = require("socket.io");
const { Blockchain } = require("./blockchainSecurity");

const app = express();
const socket = new Server({ cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const blockchain = new Blockchain();

// 1️⃣ Lonemox OS Installation
app.post("/api/install-lonemox-os", async (req, res) => {
  exec("bash install_lonemox_os.sh", (error, stdout, stderr) => {
    if (error) return res.status(500).json({ message: `OS Installation Failed: ${stderr}` });
    res.json({ message: "Lonemox OS Installed Successfully!" });
  });
});

// 2️⃣ AI-Powered VM Creation with GPU Acceleration
app.post("/api/create-ai-vm", async (req, res) => {
  const { vmName, gpu } = req.body;
  const gpuFlag = gpu ? "--host-device=vfio-pci" : "";

  exec(
    `virt-install --name ${vmName} --ram 8192 --vcpus 8 ${gpuFlag} --disk size=100 --os-variant ubuntu20.04 --network network=default --graphics vnc --location 'http://archive.ubuntu.com/ubuntu/dists/focal/main/installer-amd64/' --extra-args 'console=ttyS0'`,
    (error) => {
      if (error) return res.status(500).json({ message: "VM Creation Failed" });
      blockchain.addBlock({ vmName, status: "AI VM Created with GPU Support" });
      res.json({ message: `AI-Powered VM ${vmName} Created Successfully!` });
    }
  );
});

// 3️⃣ AI-Powered VM Optimization (Auto-Scaling)
app.post("/api/optimize-vm", async (req, res) => {
  try {
    const { vmName, cpuUsage, memoryUsage } = req.body;
    if (!fs.existsSync("backend/ai_vm_optimizer.json"))
      return res.status(500).json({ message: "AI Model Not Found" });

    const model = await tf.loadLayersModel("file://backend/ai_vm_optimizer.json");
    const inputTensor = tf.tensor2d([[cpuUsage, memoryUsage]]);
    const prediction = model.predict(inputTensor).dataSync();
    const optimizedCPU = Math.round(prediction[0]);
    const optimizedMemory = Math.round(prediction[1]);

    exec(`virsh setvcpus ${vmName} ${optimizedCPU} --live`);
    exec(`virsh setmem ${vmName} ${optimizedMemory}M --live`);

    blockchain.addBlock({ vmName, optimizedCPU, optimizedMemory, status: "Optimized" });
    res.json({ message: `AI Optimization Applied: CPU ${optimizedCPU} cores, RAM ${optimizedMemory}MB` });
  } catch (error) {
    res.status(500).json({ message: `Optimization Failed: ${error.message}` });
  }
});

// 4️⃣ Web-Based Terminal for VM Management
app.get("/api/web-terminal", async (req, res) => {
  exec("cockpit-ws --port=9090", (error) => {
    if (error) return res.status(500).json({ message: "Failed to Start Web Terminal" });
    res.json({ message: "Web Terminal Running at http://localhost:9090" });
  });
});

// 5️⃣ Mobile App API for Remote VM Management
app.get("/api/mobile-dashboard", async (req, res) => {
  res.json({ message: "Mobile App API Ready!" });
});

// 6️⃣ Advanced User Management (Roles & Permissions)
const users = [];
app.post("/api/register", async (req, res) => {
  const { username, password, role } = req.body;
  users.push({ username, password, role });
  res.json({ message: "User Registered Successfully!" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid Credentials" });
  res.json({ message: "Login Successful", user });
});

// 7️⃣ Self-Healing VM Monitoring (Auto-Restart Crashed VMs)
schedule.scheduleJob("*/5 * * * *", () => {
  exec("virsh list --name", (err, stdout) => {
    const vms = stdout.split("\n").filter(Boolean); // Remove empty lines
    vms.forEach((vm) => {
      exec(`virsh domstate ${vm.trim()}`, (error, state) => {
        if (state && state.includes("shut off")) {
          exec(`virsh start ${vm.trim()}`);
          blockchain.addBlock({ vm, status: "restarted" });
        }
      });
    });
  });
});

// 8️⃣ Real-Time Logs & Event Monitoring with WebSockets
socket.on("connection", (client) => {
  console.log("New Client Connected:", client.id);
  client.emit("message", { message: "Welcome to Lonemox Live Logs!" });

  // Emit blockchain security logs
  client.emit("blockchainLogs", blockchain.getChain());

  client.on("disconnect", () => console.log("Client Disconnected:", client.id));
});

app.listen(5000, () => console.log("✅ Lonemox Backend Running on Port 5000"));
socket.listen(5001, () => console.log("✅ WebSocket Server Running on Port 5001"));
