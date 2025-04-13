import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const filePath = path.join(process.cwd(), "public", "vinylList.json");

export async function POST(req: Request) {
  try {
    const { password, updatedVinylList } = await req.json();

    // Validate the password
    if (password !== process.env.EDIT_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate the incoming data
    if (!Array.isArray(updatedVinylList)) {
      return NextResponse.json({ error: "Invalid data format. Expected an array." }, { status: 400 });
    }

    // Write the updated data to the JSON file
    fs.writeFileSync(filePath, JSON.stringify(updatedVinylList, null, 2), "utf-8");
    return NextResponse.json({ message: "Vinyl list updated successfully." }, { status: 200 });
} catch (error) {
    return NextResponse.json({ error: "Failed to update the vinyl list.", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}