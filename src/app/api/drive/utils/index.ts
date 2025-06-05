import A from "googleapis-common";
import { drive } from "../../utils/screats.ts";

// Fetch File From Drive
export const getFileFromDrive = async (fileId: string, RangeObject?: { start: number, end: number }) => {
    const responseOptions: A.StreamMethodOptions = RangeObject ? {
        responseType: 'stream',
        headers: {
            Range: `bytes=${RangeObject.start}-${RangeObject.end}`
        }
    } : {
        responseType: 'stream',
    }
    try {
        return drive.files.get(
            {
                fileId,
                fields: 'size',
                alt: 'media',
            }, responseOptions)
            .then(fileRes => fileRes.data)
            .catch(_ => { throw new Error(_.message) });
    }
    catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown Error While Fetching Stream'
        throw new Error(errMsg)
    }
}