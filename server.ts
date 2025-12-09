import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import express from "express";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    // Join a room (e.g. table_1, admin)
    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Client emits 'order_placed' -> Server broadcasts to 'admin'
    socket.on("order_placed", (data) => {
      console.log("Order placed:", data);
      io.to("admin").emit("new_order", data);
    });

    // Admin emits 'reset_table' -> Server broadcasts to 'table_{id}'
    socket.on("reset_table", (data) => {
        console.log("Resetting table:", data);
        const tableRoom = `table_${data.tableId}`;
        io.to(tableRoom).emit("force_refresh", data);
        // Also notify admin to refresh
        io.to("admin").emit("refresh_admin", data);
    });

    // General method to broadcast generic updates if needed
    socket.on("trigger_update", (room) => {
        io.to(room).emit("update_triggered");
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  server.all(/(.*)/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    return handle(req, res, parsedUrl);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port} (Custom Server)`);
  });
});
