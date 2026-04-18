import { useMemo } from "react";
import Tree from "react-d3-tree";
import type { SyntaxTreeNode } from "../types";

type Props = {
  tree: SyntaxTreeNode;
};

export function SyntaxTreeView({ tree }: Props) {
  const data = useMemo(() => tree, [tree]);

  return (
    <div className="h-[420px] w-full rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <Tree
        data={data}
        orientation="vertical"
        translate={{ x: 280, y: 60 }}
        pathFunc="step"
        zoom={0.8}
        collapsible
        separation={{ siblings: 1.2, nonSiblings: 1.6 }}
      />
    </div>
  );
}
