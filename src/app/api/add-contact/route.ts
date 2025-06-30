import { NextRequest, NextResponse } from "next/server";
import db from "../db";

export async function POST(request : NextRequest){
    const data = await request.json();
    const response = await db.addContact(data.email , data.contactMail);
    return NextResponse.json(response);
}