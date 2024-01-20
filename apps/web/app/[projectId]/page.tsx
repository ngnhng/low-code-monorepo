"use client";

import { redirect } from "next/navigation";

export default function Page({ params }: { params: { "projectId": string } }) {
   redirect(`/${params["projectId"]}/edit`);
}
