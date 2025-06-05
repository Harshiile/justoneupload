import { Server as IOServer } from 'socket.io'

let io: IOServer | null = null;

export const setSocket = (_io: IOServer) => io = _io;

export const getSocket = () => io as IOServer