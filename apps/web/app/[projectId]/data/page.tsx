"use client";

import { useParams, useRouter } from "next/navigation";
import { TableEditor } from "./components/table-editor";

export default function Page() {
	const params = useParams();
	const router = useRouter();
	if (params["project-id"]) {
		return (
			<TableEditor
				projectId={params["project-id"].toString()}
				tableId={params["table-id"]?.toString()}
			/>
		);
	} else {
		router.push("/projects");
	}
}
