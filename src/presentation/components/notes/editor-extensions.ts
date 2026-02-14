import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { Extensions } from "@tiptap/core";

/** Extensions for the interactive note editor (includes placeholder). */
export function createNoteEditorExtensions(
  placeholder = "Write your note...",
): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: { openOnClick: false },
      codeBlock: false,
      code: false,
    }),
    Placeholder.configure({ placeholder }),
  ];
}

/** Extensions for read-only HTML rendering via generateHTML (no placeholder). */
export function createNoteRenderExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      link: { openOnClick: false },
      codeBlock: false,
      code: false,
    }),
  ];
}
