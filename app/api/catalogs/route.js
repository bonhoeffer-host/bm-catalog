import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const dataPath = path.join(process.cwd(), "data", "data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  return NextResponse.json(data);
} 