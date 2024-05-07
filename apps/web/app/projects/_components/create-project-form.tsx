import React from "react";

import { Button } from "@repo/ui";
import { PlusCircle } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui";

import {
  Dialog,
  DialogContent,
  // DialogDescription,
  // DialogFooter,
  // DialogHeader,
  // DialogTitle,
  DialogTrigger,
} from "@repo/ui";
import { CreateSratch } from "./create-sratch";
import { CreateTemplate } from "./create-template";

export const CreateProjectForm = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <div className="flex gap-[10px]">
            <PlusCircle size={20} />
            Create new project
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[1000px] max-h-[90vh] overflow-y-scroll">
        <Tabs defaultValue="scratch">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scratch">From Scratch</TabsTrigger>
            <TabsTrigger value="template">From Template</TabsTrigger>
          </TabsList>
          <TabsContent value="scratch">
            <CreateSratch />
          </TabsContent>
          <TabsContent value="template">
            <CreateTemplate />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
