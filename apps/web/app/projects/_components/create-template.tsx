import React from "react";
import Image from "next/image";

import { Button } from "@repo/ui";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui";

export const CreateTemplate = () => {
  return (
    <div className="grid w-full grid-cols-3">
      <TemplateCard />
      <TemplateCard />
      <TemplateCard />
      <TemplateCard />
      <TemplateCard />
      <TemplateCard />
    </div>
  );
};

interface TemplateCardProps {
  img?: string;
  description?: string;
  title?: string;
}

const TemplateCard = ({ img, description, title }: TemplateCardProps) => {
  return (
    <Card className="w-auto m-2">
      <Image
        src={img ?? "/templates/charts-filters.jpg"}
        alt="template"
        width={250}
        height={170}
        className="mx-auto mt-4"
      />
      <CardHeader>
        <CardTitle className="text-lg">{title ?? "Template Title"}</CardTitle>
        <CardDescription className="text-xs">
          {description ?? "Template Description"}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Button>Create</Button>
      </CardFooter>
    </Card>
  );
};
