const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const socket = require("socket.io");
const socketIo = require("./socket");
const cors = require("cors");
dotenv.config();

const userRouter = require("./routes/userRoutes");
const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: "https://harshal-chat-app-frontend.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

//middleware
app.use(cors({
  origin: "https://harshal-chat-app-frontend.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

//connect to db
mongoose
  .connect(process.env.MONGOOSE_URL)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

//socket initialize
socketIo(io);

//route
app.use("/api/user", userRouter);
app.use("/api/group", groupRouter);
app.use("/api/message", messageRouter);

//start server
const PORT = process.env.PORT || 3000;
server.listen(
  PORT,
  console.log(`Server running on port http://localhost:${PORT}`)
);
