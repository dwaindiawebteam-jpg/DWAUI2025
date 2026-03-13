import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import React from "react";

// React component for the spinner
// React component for spinner + remove button
const LoadingSpinner = ({ node, editor, getPos }: NodeViewProps) => {

  const removeNode = () => {
    if (typeof getPos !== "function") return;

    const pos = getPos?.();

    if (typeof pos !== "number") return;

    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .run();
  };

  return (
    <NodeViewWrapper className="group relative flex items-center justify-center py-6 border rounded bg-gray-50">
      <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />

      <button
        type="button"
        onClick={removeNode}
        className="absolute top-1 right-1 text-white bg-black/70 text-xs px-1 py-0.5 
                  opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </NodeViewWrapper>
  );
};

export const ImageLoading = Node.create({
  name: "imageLoading",

  group: "block",
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "image-loading" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-loading", mergeAttributes(HTMLAttributes)];
  },

  // ✅ Correct: wrap your React component with ReactNodeViewRenderer
  addNodeView() {
    return ReactNodeViewRenderer(LoadingSpinner);
  },
});
