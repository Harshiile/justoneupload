import { NextRequest } from "next/server";
import {
  addUploadProgressListener,
  removeUploadProgressListener,
} from "./uploadProcess";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (percentage: number) => {
        controller.enqueue(encoder.encode(`data: ${percentage}\n\n`));
      };

      // Register the listener
      addUploadProgressListener(send);

      // Clean up when stream is closed
      const cleanup = () => {
        removeUploadProgressListener(send);
      };

      req.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
