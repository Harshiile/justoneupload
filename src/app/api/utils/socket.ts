import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";
let io: IOServer | null = null;

export const setSocket = (server: HTTPServer) => {
  if (!io) {
    io = new IOServer(server);

    io.on("connection", (socket) => {
      console.log("Client Connected : ", socket.id);
    });
  }
  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error("Socket not initialized");
  }
  return io;
};
