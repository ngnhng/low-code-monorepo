import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

// [GET:] https://localhost:8080/
export async function GET (
  request: Request,
  { params }:  { params: {projectId: string, tableId: string}}
) {
  const databasePath = path.join(
    process.cwd(),
    `app/api/mock/[projectId]/data/[tableId]/${params.projectId}-${params.tableId}.json`,
  );

  const database = JSON.parse(await fs.readFile(databasePath, "utf-8"));
  
  console.log("Database: ", database);

  return NextResponse.json(database.columns); 
}