import { Server as IOServer } from 'socket.io'
import { Server as HttpServer } from 'http'

let io: IOServer | null = null;

export const setSocket = (httpServer: HttpServer) => io = new IOServer(httpServer);

export const getSocket = () => io