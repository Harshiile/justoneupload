import { NextFunction, Request, Response } from 'express'
import { drive } from '../../lib/secrets'
import { JOUError } from '../../lib/error'
import { StreamMethodOptions } from 'googleapis/build/src/apis/abusiveexperiencereport';


// Video Delete
export const deleteOnDrive = async (fileId: string) => {
    await drive.files.delete({ fileId }).catch(err => { throw new JOUError(err.status, "Deletion Failed") })
}

// Fetch File From Drive
export const getFileFromDrive = async (fileId: string, RangeObject?: { start: number, end: number }) => {
    const responseOptions: StreamMethodOptions = RangeObject ? {
        responseType: 'stream',
        headers: {
            Range: `bytes=${RangeObject.start}-${RangeObject.end}`
        }
    } : {
        responseType: 'stream',
    }
    return drive.files.get(
        {
            fileId,
            fields: 'size',
            alt: 'media',
        }, responseOptions)
        .then(fileRes => fileRes.data)
        .catch(err => { throw new JOUError(404, "File not Found") })
}


export const getVideoFromDrive = async (req: Request, res: Response<APIResponse>, next: NextFunction) => {
    const fileId = req.query['id']
    const fileType = req.query['type']

    if (!fileId) throw new JOUError(404, "File id not found");
    if (!fileType) throw new JOUError(404, "File Type not found");

    let driveStream;
    if (fileType == 'image') {
        res.setHeader('Content-Type', 'image/*')
        driveStream = await getFileFromDrive(fileId!.toString());
    }

    else if (fileType == 'video') {
        const range = req.headers.range;
        if (range) {
            // If range - User can seek
            const metaRes = await drive.files.get({
                fileId: fileId!.toString(),
                fields: 'size,mimeType'
            })
            const totalSize = Number(metaRes.data.size)
            const mimeType = metaRes.data.mimeType

            const parts = range.split('bytes=')[1].split('-')

            const start = Number(parts[0]);
            const end = parts[1] ? Number(parts[1]) : totalSize - 1;
            const chunkSize = end - start + 1;

            res.status(206);
            res.setHeader('Content-Type', mimeType!);
            res.setHeader('Content-Length', chunkSize);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Range', `bytes ${start}-${end}/ ${totalSize}`);

            driveStream = await getFileFromDrive(fileId!.toString(), { start, end });
        }
        else {
            // Range header is null, means User only get video but unable to seek
            driveStream = await getFileFromDrive(fileId!.toString());
        }
    }
    driveStream ? driveStream.pipe(res) : res.json({
        message: "Video Loaded Failed"
    })
}