import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { BinConfig } from "./models/BinConfig.js";
import { User } from "./models/User.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Different port for standalone backend

app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Shraddha:Shraddha123@cluster0.mongodb.net/smart-bin?retryWrites=true&w=majority";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Backend: Connected to MongoDB Atlas"))
  .catch(err => console.error("Backend: MongoDB connection error:", err));

// --- API Routes ---

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Smart Bin Backend is running" });
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });
    
    const newUser = new User({ email, password, name, role });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: { email, name, role } });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, password, role });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    
    res.json({ message: "Login successful", user: { email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Bin Config Routes
app.get("/api/bins", async (req, res) => {
  try {
    const configs = await BinConfig.find();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bin configs" });
  }
});

app.post("/api/bins", async (req, res) => {
  try {
    const { binId, name, channelId, readApiKey, writeApiKey } = req.body;
    const newConfig = new BinConfig({ binId, name, channelId, readApiKey, writeApiKey });
    await newConfig.save();
    res.status(201).json(newConfig);
  } catch (error) {
    res.status(500).json({ error: "Failed to save bin config" });
  }
});

app.delete("/api/bins/:id", async (req, res) => {
  try {
    await BinConfig.findByIdAndDelete(req.params.id);
    res.json({ message: "Bin config deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bin config" });
  }
});

// Send Command to Bin via ThingSpeak
app.post("/api/bins/:id/command", async (req, res) => {
  try {
    const { command } = req.body; // e.g., 'dry_open', 'wet_open'
    const config = await BinConfig.findById(req.params.id);
    if (!config || !config.writeApiKey) {
      return res.status(400).json({ error: "Bin not found or Write API Key missing" });
    }

    // Map command to ThingSpeak field value
    // Assuming field1 is used for commands on the ESP32 side
    let value = 0;
    if (command === 'dry_open') value = 1;
    if (command === 'wet_open') value = 2;

    const response = await axios.get(`https://api.thingspeak.com/update?api_key=${config.writeApiKey}&field1=${value}`);
    
    if (response.data === 0) {
      throw new Error("ThingSpeak update failed (returned 0)");
    }

    res.json({ message: `Command '${command}' sent successfully`, tsResponse: response.data });
  } catch (error) {
    console.error("Error sending command:", error);
    res.status(500).json({ error: "Failed to send command to bin" });
  }
});

// Proxy for ThingSpeak Data
app.get("/api/bins/live-data", async (req, res) => {
  try {
    const configs = await BinConfig.find();
    const liveData = await Promise.all(configs.map(async (config) => {
      try {
        const response = await axios.get(`https://api.thingspeak.com/channels/${config.channelId}/feeds.json?api_key=${config.readApiKey}&results=10`);
        const data = response.data;
        
        if (data && data.feeds.length > 0) {
          const latest = data.feeds[data.feeds.length - 1];
          return {
            id: config._id,
            name: config.name,
            binId: config.binId,
            location: {
              lat: parseFloat(latest.field5) || parseFloat(data.channel.latitude) || 0,
              lng: parseFloat(latest.field6) || parseFloat(data.channel.longitude) || 0
            },
            // All 8 fields from ThingSpeak
            field1: latest.field1, // usage/command
            field2: latest.field2, // dryCount
            field3: latest.field3, // wetCount
            field4: latest.field4, // distance
            field5: latest.field5, // lat
            field6: latest.field6, // lng
            field7: latest.field7, // dryPercent
            field8: latest.field8, // wetPercent
            
            // Mapped values for UI
            wet: parseInt(latest.field8) || 0,
            dry: parseInt(latest.field7) || 0,
            metal: 0, // Placeholder if not in fields
            usage: parseInt(latest.field1) || 0,
            dryCount: parseInt(latest.field2) || 0,
            wetCount: parseInt(latest.field3) || 0,
            distance: parseFloat(latest.field4) || 0,
            
            history: data.feeds.map((f: any) => parseInt(f.field1) || 0),
            lastUpdated: latest.created_at,
            status: 'online'
          };
        }
      } catch (e) {
        console.error(`Error fetching data for bin ${config.name}:`, e);
      }
      return {
        id: config._id,
        name: config.name,
        binId: config.binId,
        location: { lat: 0, lng: 0 },
        wet: 0,
        dry: 0,
        metal: 0,
        usage: 0,
        history: [],
        lastUpdated: new Date().toISOString(),
        status: 'offline'
      };
    }));
    res.json(liveData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch live data" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
