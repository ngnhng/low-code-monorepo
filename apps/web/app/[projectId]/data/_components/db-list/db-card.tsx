import React from "react";
import Image from "next/image";

// import { Database } from 'lucide-react'
import { Button } from "@repo/ui";

import { OptionDialog } from "../table-list/options-cards";
import { SheetAddForm } from "./sheet-add-form";
import { DBAddForm } from "./db-add-form";

// import Icon from "./db-icon/mongodb.svg"

interface DBCardProps {
  name: string;
  img: string;
  // requiredFields: string[];
}

const DBCard = ({ name, img }: DBCardProps) => {
  return (
    <div className="group hover:shadow-sm transition overflow-hidden border rounded-lg p-2 h-full">
      <div className="relative w-full aspect-video rounded-md overflow-hidden ">
        <Image src={img} alt="Google logo" fill />
      </div>

      <div className="flex flex-col pt-2">
        <div className="flex justify-center items-center text-lg md:text-based font-medium align-middle pb-2">
          {name}
        </div>

        <OptionDialog
          trigger={
            <Button
              size={"sm"}
              variant={"outline"}
              onClick={() => console.log("Button Trigger")}
            >
              Add
            </Button>
          }
        >
          {addFormComponent(name)}
        </OptionDialog>
      </div>
    </div>
  );
};

const addFormComponent = (name: string) => {
  switch (name) {
    case "GoogleSheet": {
      return <SheetAddForm />;
    }

    default: {
      return <DBAddForm />;
    }
  }
};

export default DBCard;
