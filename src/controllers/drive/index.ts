import { Request, response, Response } from 'express'
import { google } from 'googleapis'
import { v4 as uuidv4 } from 'uuid'
import busboy from 'busboy'
import fs from 'fs'
import { db } from '../../db'
import { io } from '../../socket';
import { Video } from '../../types/Video'
import { VideoTable } from '../../db/schema'
import { IncomingHttpHeaders } from 'http'
import path, { dirname } from 'path'
import { drive } from '../../lib/secrets'
import { JOUError } from '../../lib/error'

const parseFieldData = (data: string) => {
    if (data == 'true') return true
    else if (data === 'null' || data === 'undefined' || data === '') return null
    return data
}
type VideoType = 'public' | 'private' | 'unlisted'
const parseVideoType = (videoType: string): VideoType => {
    switch (videoType) {
        case 'public':
            return 'public'
            break;
        case 'private':
            return 'private'
            break;
        case 'unlisted':
            return 'unlisted'
            break;
        default:
            return 'unlisted'
            break;
    }
}

const DriveUpload = (file: object, filename: FileName, headers: IncomingHttpHeaders) => {
    const [fileName, fileExt] = filename.filename.split('.')

    return drive.files.create({
        requestBody: {
            name: `${fileName}-${uuidv4()}.${fileExt}`,
            parents: [filename.mimeType.includes('video') ? process.env.DRIVE_VIDEO_FOLDER_ID! : process.env.DRIVE_THUMBNAIL_FOLDER_ID!],
        },
        media: {
            mimeType: filename.mimeType,
            body: file,
        },
    }, {
        onUploadProgress: (progress) => {
            if (filename.mimeType.includes('video')) {
                const uploaded = progress.bytesRead || progress.loaded
                const percent = Math.round((Number(uploaded) / Number((headers['content-length']) || 1)) * 100);
                io.to(headers['socket']!).emit('uploading-progress', { percentage: percent })
            }
        }
    })
}

export const uploadOnDrive = async (req: Request, res: Response<APIResponse>) => {
    const fields: Record<string, string | boolean | null> = {
        title: null,
        desc: null,
        duration: null,
        videoType: null,
        willUploadAt: null,
        isMadeForKids: null,
        editor: null,
        workspace: null,
    };
    const uploadPromises: Promise<any>[] = [];

    if (req.headers['socket']) {
        const fileIds: {
            fileId: null | string,
            thumbnailId: null | string
        } = {
            fileId: null,
            thumbnailId: null
        }
        const bb = busboy({ headers: req.headers });
        req.pipe(bb);
        bb.on('field', (fieldname, val) => {
            if (val) fields[fieldname] = parseFieldData(val)!
        });

        bb.on('file', async (fieldname: string, file: NodeJS.ReadableStream, filename: FileName) => {
            uploadPromises.push(DriveUpload(file, filename, req.headers)
                .then(res => {
                    if (fieldname === 'video') fileIds.fileId = res.data.id!;
                    else if (fieldname === 'thumbnail') fileIds.thumbnailId = res.data.id!;
                })
                .catch(err => { throw new JOUError(err.status, "Uploading Failed") })
            )
        });

        bb.on('finish', () => {
            Promise.all(uploadPromises)
                .then(async (_) => {
                    console.log('Video Uploaded, Now Inserting in DB');

                    // DB Uploading
                    await db.insert(VideoTable).values({
                        title: fields.title?.toString()!,
                        desc: fields.desc?.toString()!,
                        videoType: parseVideoType(fields.videoType?.toString()!),
                        thumbnail: fileIds.thumbnailId,
                        fileId: fileIds.fileId!,
                        duration: fields.duration?.toString()!,
                        isMadeForKids: fields.isMadeForKids == null ? false : true,
                        status: 'reviewPending',
                        willUploadAt: fields.willUploadAt?.toString() ? new Date(fields.willUploadAt?.toString()) : null,
                        editor: fields.editor?.toString()!,
                        workspace: fields.workspace?.toString()!
                    }).then(_ => {
                        console.log('Video Inserted in DB');
                        // Send mail to youtuber - workspaceId

                        res.json({
                            message: "Video Uploaded"
                        })
                    }).catch(err => { throw new JOUError(err.status, "Video Insertion Failed") })
                })
                .catch(err => {
                    console.error('One or more uploads failed:', err);
                    res.json({ message: 'Upload failed' });
                });
        });
    }
    else throw new JOUError(404, "Socket is not connected")
}

export const deleteOnDrive = async (req: Request, res: Response<APIResponse>) => {
    const { fileId } = req.query
    if (fileId && typeof (fileId) == 'string') {
        drive.files.delete({ fileId })
            .then(_ => res.json({
                message: "File Deleted"
            }))
            .catch(err => { throw new JOUError(err.status, "Deletion Failed") })
    }

}

interface FileName {
    filename: string,
    encoding: string,
    mimeType: string
}

interface Header {
    'content-length': number,
    'socket': string
}