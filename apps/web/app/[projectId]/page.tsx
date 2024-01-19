"use client";

import { redirect } from "next/navigation";

export default function Page({ params }: { params: { "project-id": string } }) {
   redirect(`/${params["project-id"]}/edit`);
}
