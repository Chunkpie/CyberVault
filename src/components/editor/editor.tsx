'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { common } from 'lowlight';
import { createLowlight } from 'lowlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Code2,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const lowlight = createLowlight(common);

export default function Editor({ content, onChange, placeholder = 'Start writing...', className }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight,
      CodeBlockLowlight.configure({ lowlight }),
      Underline,
      Color,
      TextStyle,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL:');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const toolbarGroups = [
    { type: 'heading', items: [
      { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
      { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
      { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    ]},
    { type: 'format', items: [
      { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
      { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
      { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
      { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
      { icon: Code, action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
    ]},
    { type: 'list', items: [
      { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
      { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
      { icon: ListTodo, action: () => editor.chain().focus().toggleTaskList().run(), active: editor.isActive('taskList') },
    ]},
    { type: 'block', items: [
      { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
      { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
    ]},
    { type: 'insert', items: [
      { icon: LinkIcon, action: setLink, active: editor.isActive('link') },
      { icon: ImageIcon, action: addImage, active: false },
      { icon: TableIcon, action: addTable, active: false },
      { icon: Code2, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock') },
    ]},
    { type: 'history', items: [
      { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false },
      { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false },
    ]},
  ];

  return (
    <div className={cn('flex flex-col rounded-lg border border-border bg-panel/50', className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-2">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {gi > 0 && <div className="mx-1 h-5 w-px bg-border" />}
            {group.items.map((item, ii) => (
              <button
                key={ii}
                type="button"
                onClick={item.action}
                className={cn(
                  'rounded p-1.5 transition-colors hover:bg-accent',
                  item.active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        ))}
      </div>
      <EditorContent editor={editor} className="min-h-[300px] overflow-y-auto" />
    </div>
  );
}
