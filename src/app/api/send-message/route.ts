import { NextRequest, NextResponse } from "next/server";
import db from "../db";

export async function POST(request : NextRequest){
    const data = await request.json();
    const response = db.sendMessage(data.email1 , data.email2 , data.content);
    return NextResponse.json({response});
}