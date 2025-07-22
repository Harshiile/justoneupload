import next from "next";
import { createServer } from "http";
import { Server as IOServer } from "socket.io";
import { setSocket } from "./src/app/api/utils/socket.ts";

const port = Number(process.env.PORT) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handler = app.getRequestHandler();

let io: IOServer | null = null;

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handler(req, res));

  setSocket(httpServer);

  httpServer.listen(port, () => {
    console.log(`> Server running at http://localhost:${port}`);
  });
});
