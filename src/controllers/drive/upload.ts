import { IncomingHttpHeaders } from "http";
import { db } from "../../db";
import { VideoTable } from "../../db/schema";
import { JOUError } from "../../lib/error";
import { SendApprovalMail } from "../mail/templates/approval";
import { Request, Response } from 'express'
import { drive } from "../../lib/secrets";
import { v4 as uuidv4 } from 'uuid'
import { io } from "../../socket";
import busboy from "busboy";

interface FileName {
    filename: string,
    encoding: string,
    mimeType: string
}
type VideoType = 'public' | 'private' | 'unlisted'

// Paring Form Fields
const parseFieldData = (data: string) => {
    if (data == 'true') return true
    else if (data === 'null' || data === 'undefined' || data === '') return null
    return data
}

// Parsing Video type
const parseVideoType = (videoType: string): VideoType => {
    switch (videoType) {
        case 'public': return 'public'
        case 'private': return 'private'
        case 'unlisted': return 'unlisted'
        default: return 'unlisted'
    }
}

const DriveUpload = (file: object, filename: FileName, headers: IncomingHttpHeaders) => {
    const [fileName, fileExt] = filename.filename.split('.')

    // Drive Uploading
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

    // Fetching other fields
    const fields: Record<string, string | boolean | null> = {
        title: null,
        desc: null,
        duration: null,
        videoType: null,
        willUploadAt: null,
        isMadeForKids: null,
        workspace: null,
    };

    if (req.headers['socket']) {
        const fileIds: {
            fileId: null | string,
            thumbnailId: null | string
        } = {
            fileId: null,
            thumbnailId: null
        }

        const bb = busboy({ headers: req.headers });
        const uploadPromises: Promise<any>[] = [];
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

                    const mailInput = {
                        title: fields.title?.toString()!,
                        desc: fields.desc?.toString()!,
                        videoType: parseVideoType(fields.videoType?.toString()!),
                        duration: fields.duration?.toString()!,
                        isMadeForKids: fields.isMadeForKids == null ? false : true,
                        willUploadAt: fields.willUploadAt?.toString()!,
                        editor: req.user.id,
                        workspace: fields.workspace?.toString()!,
                        thumbnail: fileIds.thumbnailId,
                        fileId: fileIds.fileId!,
                    }
                    // DB Insertion
                    await db.insert(VideoTable).values({
                        ...mailInput,
                        status: 'reviewPending',
                    })
                        .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1004`) });

                    console.log('Video Inserted in DB');

                    // Send mail to youtuber - workspaceId
                    await SendApprovalMail(mailInput)

                    res.json({
                        message: "Video Uploaded"
                    })
                })
                .catch(err => {
                    console.error('One or more uploads failed:', err);
                    throw new JOUError(400, 'Upload failed')
                });
        });
    }
    else throw new JOUError(404, "Socket is not connected")
}
