// Load external libraries
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is alive" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
