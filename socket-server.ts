import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";

const port = 3001;
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for simplicity in dev
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  // Join a room (e.g. table_1, admin)
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  // Client emits 'order_placed' -> Server broadcasts to 'admin' and 'printer'
  socket.on("order_placed", (data) => {
    console.log("Order placed:", data);
    // Notify Admin
    io.to("admin").emit("new_order", data);
    // Notify Printer (broadcast to everyone or specific room)
    io.emit("print_order", data); 
  });

  // Admin emits 'reset_table' -> Server broadcasts to 'table_{id}'
  socket.on("reset_table", (data) => {
      console.log("Resetting table:", data);
      const tableRoom = `table_${data.tableId}`;
      io.to(tableRoom).emit("force_refresh", data);
      // Also notify admin to refresh
      io.to("admin").emit("refresh_admin", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`> Socket Server ready on http://localhost:${port}`);
});
