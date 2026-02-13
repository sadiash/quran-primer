import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ScriptureClipBlock } from "@/presentation/components/study/scripture-clip-block";

export type ScriptureClipSourceType = "tafsir" | "hadith" | "crossref";

export interface ScriptureClipAttributes {
  sourceType: ScriptureClipSourceType;
  sourceLabel: string;
  text: string;
  verseKey: string;
}

export const ScriptureClipNode = Node.create({
  name: "scriptureClip",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      sourceType: {
        default: "tafsir",
        parseHTML: (element) =>
          (element.getAttribute("data-source-type") as ScriptureClipSourceType) ??
          "tafsir",
        renderHTML: (attributes) => ({
          "data-source-type": attributes.sourceType as string,
        }),
      },
      sourceLabel: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("data-source-label") ?? "",
        renderHTML: (attributes) => ({
          "data-source-label": attributes.sourceLabel as string,
        }),
      },
      text: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-text") ?? "",
        renderHTML: (attributes) => ({
          "data-text": attributes.text as string,
        }),
      },
      verseKey: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-verse-key") ?? "",
        renderHTML: (attributes) => ({
          "data-verse-key": attributes.verseKey as string,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="scripture-clip"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "scripture-clip" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ScriptureClipBlock);
  },
});
