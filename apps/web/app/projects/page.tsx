"use client";

import { ProjectLists } from "./_components/project-list";
import "./styles.css";

import Title from "components/title/title";

export default function Page() {
  return (
    <>
      <Title
        name="Projects"
        description="Browse through your working projects or create a new one"
      />
      <div className="w-full bg-slate-50 p-5 rounded-md border-2 border-slate-200 flex flex-col gap-5">
        <ProjectLists />
      </div>
    </>
  );
}
