const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connect.js");
const app = express();

// CREATE UPLOADS FOLDER IF NOT EXISTS //
const uploadDir = path.join(__dirname, "../backend/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

//////dotenv config/////////////////////
dotenv.config();


const PORT = process.env.PORT || 8001;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api/user', require('./routes/userRoutes.js'))
app.use('/api/admin', require('./routes/adminRoutes'))
app.use('/api/owner', require('./routes/ownerRoutes'))



app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});