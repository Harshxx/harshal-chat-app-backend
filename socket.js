const socketIo = (io) => {
  //store connected users with their room info using socket.id
  const connectedUsers = new Map();
  //handle new socket connections
  io.on("connection", (socket) => {
    //get user authentication
    const user = socket.handshake.auth.user;
    console.log(`User connected: ${user.username}`);
    //!start: Join room handler
    socket.on("join room", (groupId) => {
      //add socket to the room
      socket.join(groupId);
      //store user and room info in connectedUsers
      connectedUsers.set(socket.id, { user, room: groupId });
      //get list of all users currently in room
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);
      // emit updated user list to all users in room
      io.in(groupId).emit("user in room", usersInRoom);
      //broadcast join message to all users in room
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} joined the room!`,
        user: user,
      });
    });
    //!end: Join room handler

    //!start: leave room handler
    // triggered when user manually leaves group
    socket.on("leave room", (groupId) => {
      console.log(`User left room: ${user.username}`);
      //remove socket from the room
      socket.leave(groupId);
      if (connectedUsers.has(socket.id)) {
        //remove user from connected users and notify others
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left", user?._id);
      }
    });
    //!end: leave room handler

    //!start: new message handler
    // triggered when user sends a new message
    socket.on("new message", (message) => {
      console.log(`New message from ${user.username}: ${message.content}`);
      //broadcast new message to all users in room
      socket.to(message.groupId).emit("message received", message);
    });

    //!end: new message handler

    //!start: disconnect handler
    // triggered when user disconnects
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${user.username}`);
      //remove user from connected users and notify others
      if (connectedUsers.has(socket.id)) {
        // get user's room info  before leaving
        const userData = connectedUsers.get(socket.id);
        //notify others in the room about users departure
        socket.to(userData.room).emit("user left", user._id);
        // remove user from connected users
        connectedUsers.delete(socket.id);
      }
    });
    //!end: disconnect handler

    //!start: typing handler
    // triggered when user starts typing
    socket.on("typing", ({ groupId, username }) => {
      //broadcast typing status to all users in room
      socket.to(groupId).emit("user typing", { username });
    });

    socket.on("stop typing", ({ groupId }) => {
      //broadcast stop typing status to all users in room
      socket.to(groupId).emit("user stop typing", { username: user?.username });
    });
  });
};

module.exports = socketIo;
