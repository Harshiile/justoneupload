import { v4 } from "uuid"
import { drive } from "../../utils/screats"
import Busboy from "busboy";
import { NextRequest, NextResponse } from "next/server";
import { JOUError } from "@/lib/error";
import { VideoTable } from "@/db/schema";
import { db } from "@/db";
import { IncomingHttpHeaders } from "http";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";
import { getSocket } from "../../utils/socket";
import { Server as IOServer } from "socket.io";
import { getUser } from "../../utils/getUser";
import { SendApprovalMail } from "@/app/mails/templates/approval";

interface FileName {
    filename: string,
    encoding: string,
    mimeType: string
}
type VideoType = 'public' | 'private' | 'unlisted'

const parseFieldData = (data: string) => {
    if (data == 'true') return true
    else if (data === 'null' || data === 'undefined' || data === '') return null
    return data
}

const DriveUpload = (file: object, filename: FileName, headers: IncomingHttpHeaders) => {
    const [fileName, fileExt] = filename.filename.split('.')
    // Drive Uploading
    return drive.files.create({
        requestBody: {
            name: `${fileName}-${v4()}.${fileExt}`,
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
                // io.to(headers['socket']!).emit('uploading-progress', { percentage: percent })
                console.log(`Uploading -- ${percent}%`);
            }
        }
    })
}


export async function POST(req: NextRequest) {
    const io = getSocket()
    const headers: IncomingHttpHeaders = {};
    const user = getUser(req);

    req.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
    });

    if (!headers['socket']) return JOUError(404, "Socket is not connected")

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

    const fileIds: {
        fileId: null | string,
        thumbnailId: null | string
    } = {
        fileId: null,
        thumbnailId: null
    }

    const bb = Busboy({ headers });
    const uploadPromises: Promise<any>[] = [];


    const reader = req.body?.getReader();
    const nodeStream = Readable.fromWeb(new ReadableStream({
        async start(controller) {
            if (!reader) {
                controller.error('No reader');
                return;
            }
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
            }
            controller.close();
        },
    }));

    nodeStream.pipe(bb);

    const result = await new Promise((resolve) => {

        bb.on('field', (fieldname, val) => {
            if (val) fields[fieldname] = parseFieldData(val)!
        });

        bb.on('file', async (fieldname: string, file: NodeJS.ReadableStream, filename: FileName) => {
            const uploadPromise = DriveUpload(file, filename, headers)
                .then(res => {
                    if (fieldname === 'video') fileIds.fileId = res.data.id!;
                    else if (fieldname === 'thumbnail') fileIds.thumbnailId = res.data.id!;
                })
                .catch(err => {
                    console.error('Upload Error:', err);
                    throw JOUError(400, "Uploading Failed, Please Try Again");
                });

            uploadPromises.push(uploadPromise);

        });

        bb.on('finish', async () => {
            try {
                await Promise.all(uploadPromises);

                console.log('Video Uploaded, Now Inserting in DB');

                const mailInput = {
                    title: fields.title?.toString()!,
                    desc: fields.desc?.toString()!,
                    videoType: fields.videoType?.toString() as VideoType,
                    duration: fields.duration?.toString()!,
                    isMadeForKids: fields.isMadeForKids == null ? false : true,
                    willUploadAt: fields.willUploadAt?.toString()!,
                    editor: user.id,
                    workspace: fields.workspace?.toString()!,
                    thumbnail: fileIds.thumbnailId,
                    fileId: fileIds.fileId!,
                };


                // DB Insertion
                await db.insert(VideoTable).values({
                    ...mailInput,
                    status: 'reviewPending',
                })
                    .catch(_ => JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1004`));

                console.log('Video Inserted in DB');

                // Send mail to youtuber - workspaceId
                await SendApprovalMail(mailInput)


                resolve({});
            } catch (err) {
                console.error('One or more uploads failed:', err);
                resolve(JOUError(400, 'Upload failed'));
            }
        });
    })
    return NextResponse.json({ message: "Video Uploaded" })
}