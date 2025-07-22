import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    // Construct the path to the root habits.json file
    const filePath = path.join(
      process.cwd(),
      "..",
      "..",
      "data",
      "habits.json"
    )

    // Read the file content
    const fileContent = await fs.readFile(filePath, "utf-8")

    // Parse the JSON data
    const data = JSON.parse(fileContent)

    // Send the data as a response
    return NextResponse.json(data)
  } catch (error) {
    console.error("API Error fetching habits data:", error)
    // In case of an error, send an appropriate response
    return new NextResponse(
      JSON.stringify({ message: "Failed to load habits data" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
} 