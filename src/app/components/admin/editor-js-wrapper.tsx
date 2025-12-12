'use client';

import { useEffect, useRef, useState } from 'react';
import type { OutputData } from '@editorjs/editorjs';
import {
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code2,
  Quote,
  Minus,
  Image as ImageIcon,
  Copy,
  Trash2,
  GripVertical,
} from 'lucide-react';

interface EditorJSWrapperProps {
  value?: OutputData;
  onChange: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const BLOCK_TYPES = [
  {
    id: 'paragraph',
    name: 'Paragraph',
    icon: '¶',
    description: 'Start typing or paste text here',
  },
  {
    id: 'header',
    name: 'Heading',
    icon: Heading2,
    description: 'Add a section heading',
  },
  {
    id: 'list',
    name: 'Bullet List',
    icon: List,
    description: 'Create an unordered list',
  },
  {
    id: 'list-ordered',
    name: 'Numbered List',
    icon: ListOrdered,
    description: 'Create an ordered list',
  },
  {
    id: 'code',
    name: 'Code Block',
    icon: Code2,
    description: 'Add a code snippet',
  },
  {
    id: 'quote',
    name: 'Quote',
    icon: Quote,
    description: 'Add a blockquote',
  },
  {
    id: 'delimiter',
    name: 'Divider',
    icon: Minus,
    description: 'Add a horizontal line',
  },
  {
    id: 'image',
    name: 'Image',
    icon: ImageIcon,
    description: 'Insert an image with caption',
  },
];

export function EditorJSWrapper({
  value,
  onChange,
  placeholder = 'Write your blog post content here...',
  readOnly = false,
}: EditorJSWrapperProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [blockCount, setBlockCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const initializeEditor = async () => {
      try {
        // Dynamically import EditorJS and tools only on client side
        const EditorJSModule = await import('@editorjs/editorjs');
        const HeaderModule = await import('@editorjs/header');
        const ParagraphModule = await import('@editorjs/paragraph');
        const ListModule = await import('@editorjs/list');
        const CodeModule = await import('@editorjs/code');
        const QuoteModule = await import('@editorjs/quote');
        const DelimiterModule = await import('@editorjs/delimiter');
        const ImageModule = await import('@editorjs/image');

        const EditorJS = EditorJSModule.default;
        const Header = HeaderModule.default;
        const Paragraph = ParagraphModule.default;
        const List = ListModule.default;
        const Code = CodeModule.default;
        const Quote = QuoteModule.default;
        const Delimiter = DelimiterModule.default;
        const Image = ImageModule.default;

        const initialData = value || {
          blocks: [],
          version: '2.28.2',
          time: Date.now(),
        };

        editorRef.current = new EditorJS({
          holder: containerRef.current!,
          placeholder: placeholder,
          readOnly: readOnly,
          inlineToolbar: ['bold', 'italic', 'link'],
          data: initialData,
          onChange: async () => {
            if (editorRef.current) {
              const data = await editorRef.current.save();
              setBlockCount(data.blocks?.length || 0);
              onChange(data);
            }
          },
          tools: {
            header: {
              class: Header,
              config: {
                placeholder: 'Enter a heading',
                levels: [2, 3],
                defaultLevel: 2,
              },
            },
            paragraph: {
              class: Paragraph,
              config: {
                placeholder: 'Write your content here...',
              },
            },
            list: {
              class: List,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered',
              },
            },
            code: {
              class: Code,
              config: {
                placeholder: 'Enter your code here...',
              },
            },
            quote: {
              class: Quote,
              inlineToolbar: true,
              config: {
                quotePlaceholder: 'Enter a quote',
                captionPlaceholder: 'Quote author or source',
              },
            },
            delimiter: Delimiter,
            image: {
              class: Image,
              config: {
                endpoints: {
                  byFile: '/api/upload',
                  byUrl: '/api/upload?url=',
                },
                additionalRequestHeaders: {
                  'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                field: 'image',
                types: 'image/jpeg,image/gif,image/png,image/webp',
                captionPlaceholder: 'Add image caption (optional)',
                buttonText: 'Upload Image',
                errorMessage: 'Image upload failed',
              },
            },
          },
        });

        setBlockCount(initialData.blocks?.length || 0);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize EditorJS:', error);
      }
    };

    initializeEditor();

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === 'function') {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [onChange, placeholder, readOnly]);

  const addBlock = async (toolName: string) => {
    if (!editorRef.current) return;

    // Map UI names to actual tool names
    const toolMap: { [key: string]: string } = {
      'list-ordered': 'list',
    };

    const actualToolName = toolMap[toolName] || toolName;
    const config = actualToolName === 'list' ? { type: 'ordered' } : undefined;

    await editorRef.current.blocks.insert(actualToolName, config);
    editorRef.current.caret.setToBlock(editorRef.current.blocks.getBlocksCount() - 1, 'end');
  };

  return (
    <div className="editor-wrapper space-y-4">
      {/* Quick Add Toolbar */}
      {!readOnly && (
        <div className="editor-toolbar bg-slate-50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
            Quick Add Block
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BLOCK_TYPES.map((block) => {
              const Icon = typeof block.icon === 'string' ? null : block.icon;
              return (
                <button
                  key={block.id}
                  onClick={() => addBlock(block.id)}
                  type="button"
                  className="editor-block-btn group relative flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200 min-h-[80px]"
                  title={block.description}
                >
                  {Icon ? (
                    <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  ) : (
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {block.icon}
                    </span>
                  )}
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
                    {block.name}
                  </span>
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-b-lg scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </button>
              );
            })}
          </div>
          {blockCount > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
              {blockCount} {blockCount === 1 ? 'block' : 'blocks'} added
            </p>
          )}
        </div>
      )}

      {/* Editor Container */}
      <div
        className="editor-container bg-white border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden transition-shadow hover:shadow-sm"
        style={{
          backgroundColor: 'white',
          boxShadow: isReady ? 'none' : '0 0 0 1px rgba(0,0,0,0.1)',
        }}
      >
        <div
          ref={containerRef}
          id="editorjs"
          className="editor-js-container prose dark:prose-invert max-w-none"
          style={{
            minHeight: '400px',
          }}
        />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-slate-300 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Loading editor...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="editor-help text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <p className="flex items-start gap-2">
          <span className="inline-block w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
          <span>
            <strong>Tip:</strong> Use the toolbar above to add different content blocks, or click the <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">+</code> icon in the editor
          </span>
        </p>
        <p className="flex items-start gap-2">
          <span className="inline-block w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
          <span>
            <strong>Drag to reorder:</strong> Click and drag the handle icon next to each block
          </span>
        </p>
        <p className="flex items-start gap-2">
          <span className="inline-block w-1 h-1 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
          <span>
            <strong>Format text:</strong> Select text and use <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-xs">Ctrl</kbd>+<kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-xs">B</kbd> for bold, <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-xs">Ctrl</kbd>+<kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 rounded text-xs">I</kbd> for italic
          </span>
        </p>
      </div>

      <style jsx>{`
        :global(.editor-js-container .ce-editor) {
          background-color: white !important;
        }

        :global(.editor-js-container .ce-editor__redactor) {
          padding: 2rem;
          min-height: 400px;
          background-color: white !important;
          color: rgb(30, 41, 59);
        }

        :global(.editor-js-container .ce-block) {
          margin-bottom: 1.5rem;
          position: relative;
        }

        :global(.editor-js-container .ce-block:hover) {
          background-color: rgba(59, 130, 246, 0.03);
          border-radius: 0.375rem;
          transition: background-color 0.15s;
        }

        :global(.editor-js-container .ce-block__content) {
          max-width: 100%;
          margin-left: 0;
        }

        :global(.editor-js-container .ce-paragraph) {
          font-size: 0.9375rem;
          line-height: 1.6;
          color: inherit;
        }

        :global(.editor-js-container .ce-paragraph[data-placeholder]:empty::before) {
          color: rgb(148, 163, 184);
          opacity: 0.6;
          font-style: italic;
        }

        :global(.editor-js-container .ce-header) {
          font-weight: 700;
          margin: 1.5rem 0 0.75rem 0;
          letter-spacing: -0.01em;
        }

        :global(.editor-js-container .ce-header[data-level="2"]) {
          font-size: 1.875rem;
          line-height: 2.25rem;
        }

        :global(.editor-js-container .ce-header[data-level="3"]) {
          font-size: 1.5rem;
          line-height: 2rem;
        }

        :global(.editor-js-container .ce-header[data-level="4"]) {
          font-size: 1.25rem;
          line-height: 1.75rem;
        }

        :global(.editor-js-container .ce-code) {
          font-family: 'Fira Code', 'Courier New', monospace;
          background-color: rgb(248, 250, 252);
          color: rgb(30, 41, 59);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          border: 1px solid rgb(203, 213, 225);
          font-size: 0.875rem;
          line-height: 1.6;
          margin: 1rem 0;
        }

        :global(.editor-js-container .ce-code__textarea) {
          font-family: 'Fira Code', 'Courier New', monospace;
          background-color: transparent;
          color: inherit;
          padding: 0;
          border: none;
          resize: vertical;
          tab-size: 2;
        }

        :global(.editor-js-container .ce-quote) {
          border-left: 4px solid rgb(59, 130, 246);
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: rgb(71, 85, 105);
        }

        :global(.editor-js-container .ce-quote__text) {
          font-size: 1.125rem;
          line-height: 1.75;
        }

        :global(.editor-js-container .ce-quote__caption) {
          font-size: 0.875rem;
          font-style: normal;
          margin-top: 0.5rem;
          color: rgb(100, 116, 139);
        }

        :global(.editor-js-container .ce-list) {
          margin: 1rem 0;
        }

        :global(.editor-js-container .ce-list__item) {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }

        :global(.editor-js-container .ce-list--unordered .ce-list__item::before) {
          margin-right: 0.75rem;
          color: rgb(59, 130, 246);
        }

        :global(.editor-js-container .ce-list--ordered) {
          counter-reset: item;
          list-style-type: none;
        }

        :global(.editor-js-container .ce-list--ordered .ce-list__item) {
          counter-increment: item;
          margin-left: 1.5rem;
        }

        :global(.editor-js-container .ce-list--ordered .ce-list__item::before) {
          content: counter(item) '.';
          position: absolute;
          left: 0;
          font-weight: 600;
          color: rgb(59, 130, 246);
        }

        :global(.editor-js-container .ce-image) {
          margin: 1.5rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid rgb(226, 232, 240);
        }

        :global(.editor-js-container .ce-image figcaption) {
          background-color: rgb(248, 250, 252);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: rgb(100, 116, 139);
          border-top: 1px solid rgb(226, 232, 240);
          font-style: italic;
        }

        :global(.editor-js-container .ce-image img) {
          display: block;
          max-width: 100%;
          height: auto;
        }

        :global(.editor-js-container .ce-delimiter) {
          border: none;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgb(203, 213, 225),
            transparent
          );
          margin: 2rem 0;
        }

        :global(.editor-js-container .ce-toolbar__plus) {
          width: 2.75rem;
          height: 2.75rem;
          background: linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235));
          color: white;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          border: none;
          cursor: pointer;
        }

        :global(.editor-js-container .ce-toolbar__plus:hover) {
          background: linear-gradient(135deg, rgb(37, 99, 235), rgb(29, 78, 216));
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
          transform: translateY(-2px);
        }

        :global(.editor-js-container .ce-toolbar__plus:active) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }

        :global(.editor-js-container .ce-toolbar__settings-btn) {
          width: 2.5rem;
          height: 2.5rem;
          background-color: rgb(226, 232, 240);
          color: rgb(71, 85, 105);
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        :global(.editor-js-container .ce-toolbar__settings-btn:hover) {
          background-color: rgb(203, 213, 225);
          color: rgb(30, 41, 59);
        }

        :global(.editor-js-container .ce-popover) {
          background-color: white;
          border: 1px solid rgb(226, 232, 225);
          border-radius: 0.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }

        :global(.editor-js-container .ce-popover__item) {
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: rgb(71, 85, 105);
          transition: all 0.15s;
        }

        :global(.editor-js-container .ce-popover__item:hover) {
          background-color: rgb(248, 250, 252);
          color: rgb(59, 130, 246);
        }

        :global(.editor-js-container .ce-popover__item--active) {
          background-color: rgb(59, 130, 246);
          color: white;
        }

        :global(.editor-js-container .ce-inline-toolbar) {
          background-color: white;
          border-radius: 0.375rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgb(226, 232, 240);
        }

        :global(.editor-js-container .ce-inline-toolbar__button) {
          color: rgb(71, 85, 105);
          transition: all 0.15s;
        }

        :global(.editor-js-container .ce-inline-toolbar__button:hover) {
          background-color: rgb(59, 130, 246);
          color: white;
        }

        :global(.editor-js-container .ce-inline-toolbar__button--active) {
          background-color: rgb(59, 130, 246);
          color: white;
        }

        :global(.dark .editor-js-container .ce-editor) {
          background-color: white !important;
        }

        :global(.dark .editor-js-container .ce-editor__redactor) {
          background-color: white !important;
          color: rgb(30, 41, 59);
        }

        :global(.dark .editor-js-container .ce-code) {
          background-color: rgb(30, 41, 59);
          color: rgb(226, 232, 240);
          border-color: rgb(71, 85, 105);
        }

        :global(.dark .editor-js-container .ce-inline-toolbar) {
          background-color: rgb(30, 41, 59);
          border-color: rgb(71, 85, 105);
        }

        :global(.dark .editor-js-container .ce-inline-toolbar__button) {
          color: rgb(203, 213, 225);
        }

        :global(.dark .editor-js-container .ce-popover) {
          background-color: rgb(30, 41, 59);
          border-color: rgb(71, 85, 105);
        }

        :global(.dark .editor-js-container .ce-popover__item) {
          color: rgb(226, 232, 240);
        }

        :global(.dark .editor-js-container .ce-popover__item:hover) {
          background-color: rgb(51, 65, 85);
          color: rgb(59, 130, 246);
        }

        :global(.dark .editor-js-container .ce-image figcaption) {
          background-color: rgb(51, 65, 85);
          border-top-color: rgb(71, 85, 105);
          color: rgb(148, 163, 184);
        }

        :global(.dark .editor-js-container .ce-quote) {
          color: rgb(148, 163, 184);
        }

        :global(.dark .editor-js-container .ce-list) {
          color: rgb(226, 232, 240);
        }
      `}</style>
    </div>
  );
}
