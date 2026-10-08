import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Unlink, ImagePlus, Undo2, Redo2, Eraser,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function ToolbarButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? "bg-primary-100 text-primary-800" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />;

function Toolbar({ editor }: { editor: Editor }) {
  const icon = "w-4 h-4";

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Masukkan URL", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const addImage = () => {
    const url = window.prompt("Masukkan URL gambar", "https://");
    if (url && url.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 rounded-t-lg">
      <ToolbarButton title="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Coret" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className={icon} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Judul" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Sub Judul" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className={icon} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Daftar" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Daftar Bernomor" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Kutipan" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Garis Pemisah" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className={icon} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Rata Kiri" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeft className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Rata Tengah" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignCenter className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Rata Kanan" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignRight className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Rata Kiri-Kanan" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <AlignJustify className={icon} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Sisipkan Link" active={editor.isActive("link")} onClick={setLink}>
        <LinkIcon className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Hapus Link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Unlink className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Sisipkan Gambar" onClick={addImage}>
        <ImagePlus className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Hapus Format" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <Eraser className={icon} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className={icon} />
      </ToolbarButton>
      <ToolbarButton title="Redo (Ctrl+Y)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className={icon} />
      </ToolbarButton>
    </div>
  );
}

export default function RichTextEditor({ value, onChange, placeholder = "Tulis konten di sini..." }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base max-w-none min-h-[250px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Sinkronkan kalau value diubah dari luar (mis. reset form)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(value === "" && editor.isEmpty)) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rich-editor border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
