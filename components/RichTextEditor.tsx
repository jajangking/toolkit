"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useCallback, useState, useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [mode, setMode] = useState<'visual' | 'html'>('visual');
  const [htmlValue, setHtmlValue] = useState(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlValue(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[400px] p-4 bg-white text-black',
      },
    },
  });

  // Sync HTML → Visual saat switch ke visual mode
  const switchToVisual = () => {
    if (editor && htmlValue !== editor.getHTML()) {
      editor.commands.setContent(htmlValue, {});
    }
    setMode('visual');
  };

  // Sync Visual → HTML saat switch ke html mode
  const switchToHtml = () => {
    if (editor) {
      setHtmlValue(editor.getHTML());
    }
    setMode('html');
  };

  const handleHtmlChange = (val: string) => {
    setHtmlValue(val);
    onChange(val);
  };

  const addImage = useCallback(() => {
    const url = window.prompt('URL gambar:');
    if (url && editor) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const setLink = useCallback(() => {
    const prev = editor?.getAttributes('link').href;
    const url = window.prompt('URL link:', prev);
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const ToolbarBtn = ({ onClick, active, children, title }: any) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 text-sm font-bold neo-border transition-all hover:translate-x-0.5 hover:translate-y-0.5 text-black
        ${active ? 'bg-yellow-400 neo-shadow' : 'bg-gray-100 hover:bg-gray-200'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="neo-border neo-shadow bg-white">
      {/* Mode toggle */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b-2 border-black">
        <span className="text-xs font-black uppercase text-gray-500">Editor</span>
        <div className="flex neo-border overflow-hidden">
          <button
            type="button"
            onClick={switchToVisual}
            className={`px-4 py-1 text-xs font-black uppercase transition-colors ${mode === 'visual' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={switchToHtml}
            className={`px-4 py-1 text-xs font-black uppercase transition-colors border-l-2 border-black ${mode === 'html' ? 'bg-yellow-400 text-black' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
          >
            {'</> HTML'}
          </button>
        </div>
      </div>

      {/* Visual toolbar */}
      {mode === 'visual' && (
        <div className="flex flex-wrap gap-1 p-2 border-b-2 border-black bg-gray-50">
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Bold"><b>B</b></ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Italic"><i>I</i></ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')} title="Strikethrough"><s>S</s></ToolbarBtn>
          <div className="w-px bg-black/20 mx-1" />
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })} title="Heading 1">H1</ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarBtn>
          <div className="w-px bg-black/20 mx-1" />
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Bullet list">• List</ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Numbered list">1. List</ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Quote">" Quote</ToolbarBtn>
          <div className="w-px bg-black/20 mx-1" />
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleCodeBlock().run()} active={editor?.isActive('codeBlock')} title="Code block">{'</>'}</ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')} title="Inline code">`code`</ToolbarBtn>
          <div className="w-px bg-black/20 mx-1" />
          <ToolbarBtn onClick={setLink} active={editor?.isActive('link')} title="Insert link">🔗 Link</ToolbarBtn>
          <ToolbarBtn onClick={addImage} active={false} title="Insert image">🖼 Img</ToolbarBtn>
          <div className="w-px bg-black/20 mx-1" />
          <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} active={false} title="Undo">↩ Undo</ToolbarBtn>
          <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} active={false} title="Redo">↪ Redo</ToolbarBtn>
        </div>
      )}

      {/* Visual editor */}
      {mode === 'visual' && (
        <EditorContent editor={editor} />
      )}

      {/* HTML editor */}
      {mode === 'html' && (
        <div className="relative">
          <textarea
            value={htmlValue}
            onChange={e => handleHtmlChange(e.target.value)}
            rows={20}
            spellCheck={false}
            className="w-full p-4 font-mono text-sm bg-gray-950 text-green-400 outline-none resize-y leading-relaxed"
            placeholder="<p>Tulis HTML di sini...</p>"
          />
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-400 text-black text-xs font-black uppercase">
            HTML MODE
          </div>
        </div>
      )}

      {/* Preview HTML result */}
      {mode === 'html' && htmlValue && (
        <div className="border-t-2 border-black">
          <div className="px-3 py-1 bg-gray-100 border-b border-black">
            <span className="text-xs font-black uppercase text-gray-500">Preview</span>
          </div>
          <div
            className="prose prose-sm sm:prose max-w-none p-4 bg-white text-black min-h-[100px]"
            dangerouslySetInnerHTML={{ __html: htmlValue }}
          />
        </div>
      )}
    </div>
  );
}
