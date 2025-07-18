import * as GoogleAPIs from "googleapis-common";
import { drive } from "../../utils/screats.ts";
// import { buffer } from "node:stream/consumers";
// import Redis from "ioredis";
import Stream from "node:stream";
// const { Readable } = require("stream");

// const redis = new Redis();

// Fetch File From Drive
export const getFileFromDrive = async (
  fileId: string,
  range?: string,
  RangeObject?: { start: number; end: number }
): Promise<Stream.Readable> => {
  /*
    See in cache
  */
  // const getCacheKey = `stream-${fileId}-${range}`;
  // const cached = await redis.getBuffer(getCacheKey);
  // if (cached) {
  //   console.log("Cached");

  //   return Readable(cached);
  // }

  const responseOptions: GoogleAPIs.StreamMethodOptions = RangeObject
    ? {
        responseType: "stream",
        headers: {
          Range: `bytes=${RangeObject.start}-${RangeObject.end}`,
        },
      }
    : {
        responseType: "stream",
      };
  try {
    return drive.files
      .get(
        {
          fileId,
          fields: "size",
          alt: "media",
        },
        responseOptions
      )
      .then(async (fileRes) => {
        // const cacheKey = `stream-${fileId}-${range}`;
        // redis.set(cacheKey, await buffer(fileRes.data));
        return fileRes.data;
      })
      .catch((_) => {
        throw new Error(_.message);
      });
  } catch (err) {
    const errMsg =
      err instanceof Error
        ? err.message
        : "Unknown Error While Fetching Stream";
    throw new Error(errMsg);
  }
};
