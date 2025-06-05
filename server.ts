import next from 'next';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';

const port = Number(process.env.PORT) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer((req, res) => handler(req, res));

    const io = new IOServer(httpServer);

    io.on('connection', socket => {
        console.log('Client Connected : ', socket.id);
    })

    httpServer.listen(port, () => {
        console.log(`> Server running at http://localhost:${port}`);
    });
});