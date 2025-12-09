
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

socket.on("connect", () => {
    console.log("Test client connected");
    
    const mockOrder = {
        tableId: 1,
        items: [
            { productId: 101, quantity: 2 },
            { productId: 202, quantity: 1 }
        ]
    };
    
    console.log("Emitting order_placed...");
    socket.emit("order_placed", mockOrder);
    
    // Allow time for transmission then exit
    setTimeout(() => {
        socket.disconnect();
        process.exit(0);
    }, 1000);
});
