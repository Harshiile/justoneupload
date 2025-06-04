import { NextResponse } from "next/server";

export const JOUError = (statusCode: number, message: string): NextResponse => {
    return NextResponse.json(
        { error: message },
        { status: statusCode }
    )
}
