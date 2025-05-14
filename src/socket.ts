import { Server } from 'socket.io'
import { createServer } from 'http'
import app from './app/app'

export const server = createServer(app)
export const io = new Server(server, {
    cors: { origin: "http://localhost:5173" }
})