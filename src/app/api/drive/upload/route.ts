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
import { Transform } from "stream";
import mime from "mime";

interface FileName {
    filename: string,
    encoding: string,
    mimeType: string
}
type VideoType = 'public' | 'private' | 'unlisted'

const parseFieldData = (data: string) => {
    if (data == 'true') return true
    else if (data == 'false') return false
    else if (data === 'null' || data === 'undefined' || data === '') return null
    return data
}

function webReadableStreamToNodeReadable(webStream: globalThis.ReadableStream<Uint8Array>, chunkSize = 64 * 1024) {
    const reader = webStream.getReader();

    return new Readable({
        async read() {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    this.push(null);
                    break;
                }

                // Simulate smaller chunks
                for (let i = 0; i < value.length; i += chunkSize) {
                    const chunk = value.slice(i, i + chunkSize);
                    this.push(chunk);
                }
            }
        }
    });
}
function createProgressStream(totalBytes: number) {
    let uploaded = 0;
    return new Transform({
        transform(chunk, encoding, callback) {
            uploaded += chunk.length;
            callback(null, chunk);
        }
    });
}


const DriveUpload = async (file: File) => {
    const mimeType = mime.getType(file.name);

    const fileMetadata = {
        name: file.name,
        parents: [mimeType?.includes('video') ? process.env.DRIVE_VIDEO_FOLDER_ID! : process.env.DRIVE_THUMBNAIL_FOLDER_ID!],
        mimeType: mimeType,
    };

    const fileBuffer = file.stream()
    const totalSize = file.size;
    const progressStream = createProgressStream(totalSize);
    const nodeStream = webReadableStreamToNodeReadable(fileBuffer);

    const finalStream = nodeStream.pipe(progressStream);
    const response = await drive.files.create({
        requestBody: fileMetadata,
        media: {
            mimeType: mimeType!,
            body: finalStream,
        },
        fields: "id", // only return the file ID, we don't need all the other information
    }, {
        onUploadProgress(progress) {
            if (mimeType?.includes('video')) {
                const uploaded = progress.bytesRead || progress.loaded
                const percent = Math.round((Number(uploaded) / Number(totalSize)) * 100);
                console.log(`${mimeType} - Uploading -- ${percent}%`);
                // io.to(headers['socket']!).emit('uploading-progress', { percentage: percent })
            }
        },
    }).catch(err => { throw JOUError(400, "Video Upload Failed, Try Again") });

    return response.data.id!;
}


export async function POST(req: NextRequest) {
    const { id: editorId } = getUser(req)
    const form = await req.formData();
    const videoMetadata: Record<string, string | boolean | null> = {
        title: null,
        desc: null,
        duration: null,
        videoType: null,
        willUploadAt: null,
        isMadeForKids: null,
        workspace: null,
    };
    const fileIds: {
        video: null | string,
        thumbnail: null | string
    } = {
        video: null,
        thumbnail: null
    }
    const fileStream = {
        thumbnail: form.get('thumbnail') == 'null' ? null : form.get('thumbnail') as File,
        video: form.get('video') == 'null' ? null : form.get('video') as File
    }
    form.forEach((value, key) => {
        if (typeof (value) == 'string')
            videoMetadata[key] = parseFieldData(value)
    })

    const uploadPromises: Array<Promise<void>> = []
    if (!fileStream.video) throw JOUError(404, "Video Not Found");

    // Video Upload
    const uploadVideoPromise = DriveUpload(fileStream.video)
        .then(res => {
            fileIds.video = res;
        })
        .catch(err => {
            console.error('Upload Error:', err);
            throw JOUError(400, "Uploading Failed, Please Try Again");
        });
    uploadPromises.push(uploadVideoPromise)

    if (fileStream.thumbnail) {
        const uploadThumbnailPromise = DriveUpload(fileStream.thumbnail)
            .then(res => {
                fileIds.thumbnail = res;
            })
            .catch(err => {
                console.error('Upload Error:', err);
                throw JOUError(400, "Uploading Failed, Please Try Again");
            });
        uploadPromises.push(uploadThumbnailPromise);
    }

    try {
        await Promise.all(uploadPromises);

        console.log('Video Uploaded, Now Inserting in DB');

        const mailInput = {
            title: videoMetadata.title as string,
            desc: videoMetadata.desc as string,
            videoType: videoMetadata.videoType as VideoType,
            duration: videoMetadata.duration as string,
            isMadeForKids: videoMetadata.isMadeForKids as boolean,
            willUploadAt: videoMetadata.willUploadAt as string | null,
            editor: editorId,
            workspace: videoMetadata.workspace as string,
            thumbnail: fileIds.thumbnail,
            fileId: fileIds.video as string,
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

        // resolve();
        return NextResponse.json({ message: "Video Uploaded" });
    } catch (err) {
        console.error('One or more uploads failed:', err);
        return JOUError(400, 'Upload failed');
    }
}