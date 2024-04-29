const Chat = require("../models/chat"); // Import the chat model
const User = require("../models/user")

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("socket connected... id  : " + socket.id);

    // Function to send a chat message
    socket.on("sendChat", async (data) => {
      console.log("data is", data);
      try {
        // Create a new chat document in MongoDB
        const newChat = new Chat({
          sender: data.sender,
          receiver: data.receiver,
          message: data.message,
        });
        await newChat.save(); // Save the chat to MongoDB

        // Emit the chat message to the receiver
        io.to(data.receiver).emit("receiveChat", newChat);
      } catch (error) {
        console.error("Error sending chat:", error);
      }
    });

   
// Function to get all users with whom a person has chatted, along with their last chat
socket.on("getChattedUsers", async (personId) => {
  try {
    // Find distinct sender IDs where the person ID matches the receiver
    const senders = await Chat.distinct("sender", { receiver: personId });
    // Find distinct receiver IDs where the person ID matches the sender
    const receivers = await Chat.distinct("receiver", { sender: personId });

    // Create a Set to store unique user IDs
    const chattedUsersSet = new Set([...senders, ...receivers]);

    // Convert the Set back to an array
    const chattedUsersArray = Array.from(chattedUsersSet);

    // Populate the sender and receiver fields
    const populatedUsers = await User.find({ _id: { $in: chattedUsersArray } })
      .populate("sender")
      .populate("receiver");

    let chats = []

    // Retrieve the last chat for each user
    for (let user of populatedUsers) {
      // Find the last chat where the user is either sender or receiver
      let lastChat = await Chat.findOne({
        $or: [
          { sender: user._id },
          { receiver: user._id }
        ]
      }).sort({ createdAt: -1 });

      // Attach the last chat to the user object
      chats.push(
        {user_id: user._id,
          name: user.name,
          image: user.image,
          chat: lastChat.message,
          date: lastChat.date})
      user.lastChat = lastChat;
      console.log(lastChat, "user", chats)
    }

    // Emit the populated chatted users to the client
    socket.emit("chattedUsers", chats);
  } catch (error) {
    console.error("Error retrieving chatted users:", error);
  }
});




    // Function to get all chats for a specific person (sender or receiver)
    socket.on("getChats", async (personId) => {
      try {
        // Retrieve all chats where the person ID matches either the sender or receiver ID
        const chats = await Chat.find({
          $or: [{ sender: personId }, { receiver: personId }],
        }).populate("sender");
        // Emit the chats to the client
        socket.emit("allChats", chats);
      } catch (error) {
        console.error("Error retrieving chats:", error);
      }
    });

    // Function to handle disconnection
    socket.on("disconnect", () => {
      console.log("socket disconnected... id: " + socket.id);
    });
  });
}

module.exports = initSocket;
