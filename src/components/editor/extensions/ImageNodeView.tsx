import { NodeViewWrapper } from "@tiptap/react";
import { useEffect, useState } from "react";

export default function ImageNodeView({ node, editor, getPos, updateAttributes }: any) {
  const src = node.attrs.src;
  const fileId = node.attrs.fileId;
  const [alt, setAlt] = useState(node.attrs.alt || "");
  const isEditable = editor?.isEditable;


  useEffect(() => {
    setAlt(node.attrs.alt || "");
  }, [node.attrs.alt]);

  const handleRemove = () => {
  const pos = getPos();

  editor
    .chain()
    .focus()
    .deleteRange({ from: pos, to: pos + node.nodeSize })
    .run();

  editor.storage.imageWithRemove?.onImageRemoved?.(src, fileId);
};

  return (
    <NodeViewWrapper className="group w-full flex flex-col items-center relative my-6">
   <img
    src={src}
    alt={alt || ""}
    style={{
      maxWidth: "600px",
      maxHeight: "400px", // ✅ safe
      width: "100%",
      height: "auto",
      display: "block",
      margin: "0 auto",
      objectFit: "contain", // ⭐ highly recommended
    }}
  />

      {/* 🧠 Alt text input */}
      {isEditable && (
      <input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={() => updateAttributes({ alt })}
        placeholder="Alt text (describe this image)"
        className="mt-2 w-full max-w-75 text-xs border px-2 py-1 
                  text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />
    )}


  {isEditable && (
  <button
    type="button"
    onClick={handleRemove}
    className="absolute top-1 right-1 text-white bg-black/70 text-xs px-1 py-0.5 
               opacity-0 group-hover:opacity-100 transition-opacity"
  >
    ✕
  </button>
)}

    </NodeViewWrapper>
  );
}
