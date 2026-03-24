"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Highlighter,
  Undo,
  Redo,
  Code,
} from "lucide-react";
import { useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

// Thin wrapper compatible with react-hook-form Controller:
//   <Controller name="summary" control={control} render={({ field }) =>
//     <RichTextEditorField value={field.value} onChange={field.onChange} />
//   } />
export interface RichTextEditorFieldProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

// ─── ToolbarButton ────────────────────────────────────────────────────────────

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-lg transition-all duration-150 ${
      active
        ? "bg-primary/80 text-white shadow-sm"
        : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-5 bg-white/10 mx-1 self-center" />
);

// ─── BubbleMenu Buttons ───────────────────────────────────────────────────────

const BubbleBtn = ({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded transition-all duration-100 ${
      active
        ? "bg-primary/90 text-white"
        : "text-foreground hover:bg-white/15"
    }`}
  >
    {children}
  </button>
);

// ─── Word count helper ────────────────────────────────────────────────────────

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

// ─── Main Editor ─────────────────────────────────────────────────────────────

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Commencez à écrire...",
  className = "",
  maxLength,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      if (maxLength && text.length > maxLength) return; // soft cap
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[180px] px-4 py-3 text-foreground",
      },
    },
  });

  const setLink = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = window.prompt("URL du lien :");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const charCount = editor.getText().length;
  const wordCount = countWords(editor.getText());
  const atLimit = maxLength ? charCount >= maxLength : false;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-colors ${
        atLimit
          ? "border-red-500/50"
          : "border-white/10 focus-within:border-primary"
      } bg-white/5 ${className}`}
    >
      {/* ── Floating Bubble Menu ── */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{ duration: 120, placement: "top" }}
        className="flex items-center gap-0.5 px-2 py-1.5 rounded-xl border border-white/15 shadow-2xl"
        style={{
          background: "oklch(0.15 0.04 250 / 0.95)",
          backdropFilter: "blur(16px)",
        }}
      >
        <BubbleBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Gras"
        >
          <Bold className="w-3.5 h-3.5" />
        </BubbleBtn>
        <BubbleBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italique"
        >
          <Italic className="w-3.5 h-3.5" />
        </BubbleBtn>
        <BubbleBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Souligné"
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </BubbleBtn>
        <BubbleBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Barré"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </BubbleBtn>
        <BubbleBtn
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          title="Surligner"
        >
          <Highlighter className="w-3.5 h-3.5" />
        </BubbleBtn>
        <div className="w-px h-4 bg-white/15 mx-0.5" />
        <BubbleBtn
          onClick={setLink}
          active={editor.isActive("link")}
          title="Insérer un lien"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </BubbleBtn>
      </BubbleMenu>

      {/* ── Static Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-white/10">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annuler">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Titre H2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Titre H3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Gras"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italique"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Souligné"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Barré"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          title="Surligner"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Code inline"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Liste à puces"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Liste numérotée"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Citation"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Aligné à gauche"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Centré"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Aligné à droite"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={setLink}
          active={editor.isActive("link")}
          title="Insérer un lien"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* ── Editor Content ── */}
      <EditorContent editor={editor} />

      {/* ── Footer: word + char count ── */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-white/5">
        <span className="text-xs text-muted-foreground">
          {wordCount} mot{wordCount !== 1 ? "s" : ""}
        </span>
        <span
          className={`text-xs transition-colors ${
            atLimit ? "text-red-400" : "text-muted-foreground"
          }`}
        >
          {charCount}
          {maxLength ? ` / ${maxLength}` : ""} caractères
        </span>
      </div>
    </div>
  );
}

// ─── RichTextEditorField (React Hook Form compatible) ─────────────────────────

/**
 * Drop-in replacement for a textarea inside a react-hook-form Controller.
 *
 * Usage:
 *   <Controller
 *     name="summary"
 *     control={control}
 *     render={({ field }) => (
 *       <RichTextEditorField value={field.value} onChange={field.onChange} />
 *     )}
 *   />
 */
export function RichTextEditorField({
  value,
  onChange,
  placeholder,
  className,
  maxLength,
}: RichTextEditorFieldProps) {
  return (
    <RichTextEditor
      content={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      maxLength={maxLength}
    />
  );
}
