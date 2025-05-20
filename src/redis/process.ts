import { Worker } from 'bullmq'
import Redis from 'ioredis'
import uploadOnYoutube from '../controllers/youtube/uploadVideo';

const connection = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
})
const worker = new Worker('video-scheudler-queue', async job => {
    const { workspaceId, fileId } = job.data
    await uploadOnYoutube(workspaceId, fileId)
}, { connection });