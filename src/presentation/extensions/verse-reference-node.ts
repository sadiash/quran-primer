import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { VerseReferenceChip } from "@/presentation/components/study/verse-reference-chip";

export interface VerseReferenceAttributes {
  verseKey: string;
  surahId: number;
}

export const VerseReferenceNode = Node.create({
  name: "verseReference",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      verseKey: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-verse-key") ?? "",
        renderHTML: (attributes) => ({
          "data-verse-key": attributes.verseKey as string,
        }),
      },
      surahId: {
        default: 0,
        parseHTML: (element) =>
          Number(element.getAttribute("data-surah-id")) || 0,
        renderHTML: (attributes) => ({
          "data-surah-id": String(attributes.surahId),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="verse-reference"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-type": "verse-reference" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VerseReferenceChip);
  },
});
