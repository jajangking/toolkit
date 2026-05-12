"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] p-4 bg-white text-black',
      },
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="neo-border neo-shadow bg-white">
      <div className="flex flex-wrap gap-2 p-2 border-b border-black bg-gray-100">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 font-bold neo-border text-black ${editor.isActive('bold') ? 'bg-yellow-400' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 italic neo-border text-black ${editor.isActive('italic') ? 'bg-yellow-400' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-3 py-1 line-through neo-border text-black ${editor.isActive('strike') ? 'bg-yellow-400' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          S
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1 font-black neo-border text-black ${editor.isActive('heading', { level: 2 }) ? 'bg-yellow-400' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1 font-bold neo-border text-black ${editor.isActive('heading', { level: 3 }) ? 'bg-yellow-400' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1 neo-border text-black ${editor.isActive('bulletList') ? 'bg-yellow-400' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1 neo-border text-black ${editor.isActive('orderedList') ? 'bg-yellow-400' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1 font-mono neo-border text-black ${editor.isActive('codeBlock') ? 'bg-yellow-400' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {'</>'}
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`px-3 py-1 neo-border text-black ${editor.isActive('link') ? 'bg-yellow-400' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Link
        </button>
        <button
          type="button"
          onClick={addImage}
          className="px-3 py-1 neo-border bg-gray-200 hover:bg-gray-300 text-black"
        >
          Image
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
