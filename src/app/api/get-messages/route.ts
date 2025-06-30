import { NextRequest, NextResponse } from "next/server";
import db from "../db";

export async function POST(request : NextRequest){
    const data = await request.json();
    const response = await db.getMessages(data.email1 , data.email2);
    return NextResponse.json({response});
}