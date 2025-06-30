import { NextRequest, NextResponse } from "next/server";
import db from '../db';
 
export async function POST(request: NextRequest){
  const parameters = await request.json();  
  const user = await db.getUser(parameters.email , parameters.name , parameters.avatar);
  return NextResponse.json(user);
}