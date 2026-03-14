import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const BoldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const ItalicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const BulletListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const OrderedListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
    <text x="1" y="8" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">1.</text>
    <text x="1" y="14" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">2.</text>
    <text x="1" y="20" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none">3.</text>
  </svg>
);

export default function RichTextEditor({ value, onChange, placeholder, minHeight = '80px' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-editor-content',
        style: `min-height: ${minHeight}; outline: none;`,
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`;

  return (
    <div className="mt-1 border border-gray-300 rounded-md overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 px-2 py-1 flex gap-1">
        <button
          type="button"
          title="Bold"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
          className={btnClass(editor.isActive('bold'))}
        >
          <BoldIcon />
        </button>
        <button
          type="button"
          title="Italic"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
          className={btnClass(editor.isActive('italic'))}
        >
          <ItalicIcon />
        </button>
        <button
          type="button"
          title="Bullet List"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
          className={btnClass(editor.isActive('bulletList'))}
        >
          <BulletListIcon />
        </button>
        <button
          type="button"
          title="Ordered List"
          onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
          className={btnClass(editor.isActive('orderedList'))}
        >
          <OrderedListIcon />
        </button>
      </div>
      {/* Editor area */}
      <style>{`
        .rich-editor-content { padding: 8px 12px; font-size: 14px; line-height: 1.6; }
        .rich-editor-content p { margin: 0; }
        .rich-editor-content ul { list-style-type: disc; padding-left: 20px; margin: 4px 0; }
        .rich-editor-content ol { list-style-type: decimal; padding-left: 20px; margin: 4px 0; }
        .rich-editor-content li { margin-bottom: 2px; }
        .rich-editor-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
}
