import { useMemo } from "react";
import type { SyntaxTreeNode } from "../types";

type Props = {
  tree: SyntaxTreeNode;
};

export function SyntaxTreeView({ tree }: Props) {
  const layout = useMemo(() => buildLayout(tree), [tree]);
  const width = Math.max(880, layout.leafCount * 120);
  const height = Math.max(360, (layout.depth + 1) * 110);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Constituency Tree</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Drag to scroll horizontally</p>
      </div>
      <div className="overflow-auto rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
        <svg width={width} height={height} role="img" aria-label="Syntax tree">
          {layout.edges.map((edge, index) => (
            <path
              key={`${edge.from.id}-${edge.to.id}-${index}`}
              d={`M ${edge.from.x} ${edge.from.y + 10} V ${(edge.from.y + edge.to.y) / 2} H ${edge.to.x} V ${edge.to.y - 18}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.35}
              strokeWidth={1.4}
            />
          ))}

          {layout.nodes.map((node) => (
            <g key={node.id}>
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                className="fill-slate-900 text-[14px] font-semibold dark:fill-slate-100"
              >
                {node.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

type PositionedNode = {
  id: string;
  name: string;
  x: number;
  y: number;
  depth: number;
};

type PositionedEdge = {
  from: PositionedNode;
  to: PositionedNode;
};

type LayoutResult = {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  leafCount: number;
  depth: number;
};

function buildLayout(root: SyntaxTreeNode): LayoutResult {
  const nodes: PositionedNode[] = [];
  const edges: PositionedEdge[] = [];
  let leafIndex = 0;
  let maxDepth = 0;

  function walk(node: SyntaxTreeNode, depth: number, parent?: PositionedNode): PositionedNode {
    maxDepth = Math.max(maxDepth, depth);
    const children = node.children ?? [];
    const y = depth * 100 + 28;

    if (children.length === 0) {
      const positioned: PositionedNode = {
        id: `${node.name}-${depth}-${leafIndex}`,
        name: node.name,
        x: leafIndex * 120 + 70,
        y,
        depth,
      };
      leafIndex += 1;
      nodes.push(positioned);
      if (parent) {
        edges.push({ from: parent, to: positioned });
      }
      return positioned;
    }

    const childNodes = children.map((child) => walk(child, depth + 1));
    const minX = Math.min(...childNodes.map((item) => item.x));
    const maxX = Math.max(...childNodes.map((item) => item.x));
    const positioned: PositionedNode = {
      id: `${node.name}-${depth}-${minX}-${maxX}`,
      name: node.name,
      x: (minX + maxX) / 2,
      y,
      depth,
    };
    nodes.push(positioned);
    if (parent) {
      edges.push({ from: parent, to: positioned });
    }
    childNodes.forEach((child) => {
      const edgeExists = edges.some((edge) => edge.from.id === positioned.id && edge.to.id === child.id);
      if (!edgeExists) {
        edges.push({ from: positioned, to: child });
      }
    });
    return positioned;
  }

  walk(root, 0);
  return { nodes, edges, leafCount: Math.max(leafIndex, 1), depth: maxDepth };
}
