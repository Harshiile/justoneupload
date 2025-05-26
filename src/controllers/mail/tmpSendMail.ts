import { Request, Response } from 'express'
import { ApprovalInterface, SendApprovalMail } from './templates/approval';
import { AuthorizeInterface, SendAuthorizeMail } from './templates/authorize';
import { SendNotifyMail, VideoNofityMail } from './templates/notify';

export const sendMailTmp = async (req: Request, res: Response<APIResponse>) => {
    const approvalData: VideoNofityMail = {
        thumbnail: "https://i.ytimg.com/vi/p6L_xAEtAKk/hq720.jpg?sqp=-…GIgZSg7MA8=&rs=AOn4CLDMfvmB5kJlVifl7V7agm_YjNsV5g", // pretend it's an ID stored on your CDN or backend
        title: "Mastering Async/Await in JavaScript – A Beginner's Guide",
        publishedAt: "2025-05-24T14:30:00Z",
        videoType: "Tutorial",
        duration: "12:45",
        id: "p6L_xAEtAKk", // YouTube video ID
        uploadingStatus: "uploaded",
        editorId: "18471fbb-ef54-4e2d-8858-627cab8c54ff"
    }
    await SendNotifyMail(approvalData, 'UCHZ0UZ7PTrabekn_r-owSZg');
    res.json({
        message: "Mail Sent"
    })
}