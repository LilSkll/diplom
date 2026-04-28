import { useMemo } from "react";
import Tree from "react-d3-tree";
import type { SyntaxTreeNode } from "../types";

type Props = {
  tree: SyntaxTreeNode;
};

export function SyntaxTreeView({ tree }: Props) {
  const data = useMemo(() => tree, [tree]);

  return (
    <div className="h-[460px] w-full rounded-2xl border border-slate-200 bg-white/90 dark:border-slate-700 dark:bg-slate-900">
      <Tree
        data={data}
        orientation="vertical"
        translate={{ x: 360, y: 56 }}
        pathFunc="elbow"
        zoom={0.78}
        collapsible
        separation={{ siblings: 1.3, nonSiblings: 1.9 }}
        draggable
        nodeSize={{ x: 150, y: 95 }}
        renderCustomNodeElement={({ nodeDatum }) => (
          <g>
            <text
              x={0}
              y={0}
              textAnchor="middle"
              fill="currentColor"
              className="text-sm font-medium"
            >
              {nodeDatum.name}
            </text>
          </g>
        )}
      />
    </div>
  );
}
