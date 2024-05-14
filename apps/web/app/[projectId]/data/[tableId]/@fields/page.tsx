"use client";

import useSWR from "swr";
import { useMobxStore } from "lib/mobx/store-provider";
import { useEffect } from "react";

import ReactFlow, {
  useEdgesState,
  useNodesState,
  Background,
  Controls,
  Handle,
  Position,
} from "reactflow";

import "reactflow/dist/style.css";
import { cn } from "lib/shadcn/utils";

const nodeTypes = {
  entity: EntityNode,
};

type NodeType = {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
};

export default function Page({ params: { tableId } }) {
  const {
    tableData: { fetchRelationalTables },
  } = useMobxStore();

  const { data: relationalTables, isLoading } = useSWR(
    `relational-tables-${tableId}`,
    () => fetchRelationalTables(tableId),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    }
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  useEffect(() => {
    console.log("RELATIONAL TABLES", relationalTables);

    const displayNodes: NodeType[] = [];
    const displayEdges: any[] = [];
    let sourceNodeId;

    if (!relationalTables) {
      return;
    }

    for (const table of relationalTables) {
      const isSource = table.id === tableId;

      const newNode = {
        id: table.id,
        type: "entity",
        data: {
          fields: table,
          isSource: isSource,
        },
        position: isSource ? { x: 300, y: 100 } : { x: 600, y: 100 },
      };

      displayNodes.push(newNode);

      if (newNode.data.isSource) {
        sourceNodeId = newNode.id;
      }
    }

    for (const node of displayNodes) {
      if (node.data.isSource === true) {
        continue;
      }
      const edge = {
        id: `${sourceNodeId}-${node.id}`,
        source: sourceNodeId,
        target: node.id,
      };

      displayEdges.push(edge);
    }

    console.log("EGED", displayEdges);

    setNodes(displayNodes);
    setEdges(displayEdges);
  }, [relationalTables, isLoading]);

  if (!relationalTables || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

function EntityNode({ data }: { data }) {
  return (
    <div>
      {data.isSource ? (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-teal-500"
        />
      ) : (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-teal-500"
        />
      )}
      <table className="bg-accent rounded-md">
        <thead className="bg-primary text-white border border-solid border-blue-700">
          <tr>
            <th
              className={cn(
                "p-4",
                data.isSource ? "text-rose-700" : "text-white"
              )}
            >
              {data.fields.label}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.fields.columns.map((field, index) => (
            <tr key={index} className="border border-solid border-blue-700">
              <td className="p-2">{field.label}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ! Notes for the foreign key, primary key:

// * has one more fields called "Foreign key" contains field_id and table_id

// * Edge for this case

// if (relationalTables) {
//   for (let i = 0; i < relationalTables.length; i++) {
//     for (let j = i + 1; j < displayNodes.length; j++) {
//       if (
//         relationalTables[i]?.referenceTables?.includes(
//           relationalTables[j]?.id as string
//         )
//       ) {
//         const edge = {
//           id: `${relationalTables[i]?.id}-${relationalTables[j]?.id}`,
//           source: relationalTables[i]?.id,
//           target: relationalTables[j]?.id,
//         };

//         displayEdges.push(edge);
//       }
//     }
//   }
// }
