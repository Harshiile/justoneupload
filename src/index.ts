import { server } from "./socket"

const port = process.env.PORT
port ? server.listen(port, () => { console.log(`Server Runs on ${port}`) }) : console.log('Can\'t find any entry point')