"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Youtube from '@tiptap/extension-youtube';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Typography from '@tiptap/extension-typography';
import DropCursor from '@tiptap/extension-dropcursor';
import GapCursor from '@tiptap/extension-gapcursor';
import Focus from '@tiptap/extension-focus';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { common, createLowlight } from 'lowlight';
import { useCallback, useEffect, useState } from 'react';

const lowlight = createLowlight(common);

const MenuBar = ({ editor, darkMode }) => {
  const buttonClass = `p-1.5 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`;
  const activeButtonClass = `p-1.5 rounded-lg transition-all duration-200 ${darkMode ? 'bg-gray-800 text-indigo-400' : 'bg-indigo-50 text-indigo-700'} shadow-sm`;
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Toggle dropdown visibility
  const toggleDropdown = useCallback((name) => {
    setOpenDropdown(prev => prev === name ? null : name);
  }, []);

  // Close dropdowns when clicking outside and handle window resize
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    // Check screen size
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setWindowWidth(width);
    };

    checkScreenSize();
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', checkScreenSize);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [openDropdown]);

  const addImage = useCallback(() => {
    if (editor) {
      const url = window.prompt('Enter the URL of the image:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  }, [editor]);

  const addYouTube = useCallback(() => {
    if (editor) {
      const url = window.prompt('Enter YouTube URL (supports youtube.com/watch, youtu.be, and embed URLs):');
      if (url) {
        // Extract video ID from various YouTube URL formats
        let videoId = '';
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
          /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];

        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) {
            videoId = match[1];
            break;
          }
        }

        if (videoId) {
          editor.commands.setYoutubeVideo({
            src: `https://www.youtube.com/watch?v=${videoId}`,
            width: Math.min(640, window.innerWidth - 100),
            height: Math.min(480, (window.innerWidth - 100) * 0.5625), // 16:9 aspect ratio
          });
        } else {
          alert('Please enter a valid YouTube URL');
        }
      }
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (editor) {
      const previousUrl = editor.getAttributes('link').href;
      const url = window.prompt('Enter the URL:', previousUrl);

      // cancelled
      if (url === null) {
        return;
      }

      // empty
      if (url === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        return;
      }

      // update link
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addTable = useCallback(() => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Function to render dropdown menu
  const renderDropdown = (name, icon, content) => {
    return (
      <div className="relative dropdown-container">
        <button
          onClick={() => toggleDropdown(name)}
          className={`flex items-center gap-1 ${openDropdown === name ? activeButtonClass : buttonClass}`}
          title={name}
        >
          {icon}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openDropdown === name && (
          <div
            className={`absolute top-full left-0 mt-1 p-2 rounded-lg shadow-lg grid grid-cols-2 gap-1 min-w-[180px] z-[9999] ${isMobile
              ? 'fixed left-1/2 transform -translate-x-1/2 w-[90vw] max-w-[280px]'
              : ''
              } ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
          >
            {content}
          </div>
        )}
      </div>
    );
  };

  // Common layouts for mobile and desktop
  const commonToolbarItems = (
    <>
      {/* Basic Formatting - Always visible */}
      <div className="flex items-center">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? activeButtonClass : buttonClass}
          title="Bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
            <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? activeButtonClass : buttonClass}
          title="Italic"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="4" x2="10" y2="4"></line>
            <line x1="14" y1="20" x2="5" y2="20"></line>
            <line x1="15" y1="4" x2="9" y2="20"></line>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? activeButtonClass : buttonClass}
          title="Underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
            <line x1="4" y1="21" x2="20" y2="21"></line>
          </svg>
        </button>
      </div>

      {/* Format Dropdown */}
      {renderDropdown("Format",
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7V4h16v3"></path>
          <path d="M9 20h6"></path>
          <path d="M12 4v16"></path>
        </svg>,
        <>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`flex items-center gap-1 ${editor.isActive('strike') ? activeButtonClass : buttonClass}`}
            title="Strikethrough"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <path d="M16 6c-.5-1.8-2.1-3-4-3-2.2 0-4 1.8-4 4 0 1.5.8 2.8 2 3.4"></path>
              <path d="M8 18c.5 1.8 2.1 3 4 3 2.2 0 4-1.8 4-4 0-1.5-.8-2.8-2-3.4"></path>
            </svg>
            <span className="text-xs">Strike</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`flex items-center gap-1 ${editor.isActive('highlight') ? activeButtonClass : buttonClass}`}
            title="Highlight"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11H1l6-6 6 6h-8"></path>
              <path d="M22 12L12 2l-3 3h18z"></path>
            </svg>
            <span className="text-xs">Highlight</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`flex items-center gap-1 ${editor.isActive('subscript') ? activeButtonClass : buttonClass}`}
            title="Subscript"
          >
            <span className="font-mono">X₁</span>
            <span className="text-xs">Subscript</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`flex items-center gap-1 ${editor.isActive('superscript') ? activeButtonClass : buttonClass}`}
            title="Superscript"
          >
            <span className="font-mono">X¹</span>
            <span className="text-xs">Superscript</span>
          </button>
          <div className="col-span-2">
            <input
              type="color"
              onInput={(event) => editor.chain().focus().setColor(event.target.value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
              className="w-full h-6 rounded cursor-pointer"
              title="Text Color"
            />
          </div>
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="flex items-center gap-1 col-span-2"
            title="Reset Color"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span className="text-xs">Reset Color</span>
          </button>
          <select
            onChange={(event) => editor.chain().focus().setFontFamily(event.target.value).run()}
            value={editor.getAttributes('textStyle').fontFamily || ''}
            className={`col-span-2 text-xs px-2 py-1 rounded border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-300 text-gray-700'
              }`}
          >
            <option value="">Default Font</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Helvetica, sans-serif">Helvetica</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Times New Roman, serif">Times</option>
            <option value="Courier New, monospace">Courier</option>
            <option value="Verdana, sans-serif">Verdana</option>
          </select>
        </>
      )}

      {/* Alignment */}
      {renderDropdown("Align",
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="21" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="18" x2="3" y2="18"></line>
        </svg>,
        <>
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`flex items-center gap-1 ${editor.isActive({ textAlign: 'left' }) ? activeButtonClass : buttonClass}`}
            title="Align Left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="11" y1="14" x2="3" y2="14"></line>
              <line x1="17" y1="18" x2="3" y2="18"></line>
            </svg>
            <span className="text-xs">Left</span>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`flex items-center gap-1 ${editor.isActive({ textAlign: 'center' }) ? activeButtonClass : buttonClass}`}
            title="Align Center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="17" y1="14" x2="7" y2="14"></line>
              <line x1="19" y1="18" x2="5" y2="18"></line>
            </svg>
            <span className="text-xs">Center</span>
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`flex items-center gap-1 ${editor.isActive({ textAlign: 'right' }) ? activeButtonClass : buttonClass}`}
            title="Align Right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="14" x2="13" y2="14"></line>
              <line x1="21" y1="18" x2="7" y2="18"></line>
            </svg>
            <span className="text-xs">Right</span>
          </button>
        </>
      )}

      {/* Headings */}
      {renderDropdown("Headings",
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 12h12"></path>
          <path d="M6 4v16"></path>
          <path d="M18 4v16"></path>
        </svg>,
        <>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`flex items-center gap-1 ${editor.isActive('heading', { level: 1 }) ? activeButtonClass : buttonClass}`}
            title="Heading 1"
          >
            <span className="font-bold">H1</span>
            <span className="text-xs">Heading 1</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`flex items-center gap-1 ${editor.isActive('heading', { level: 2 }) ? activeButtonClass : buttonClass}`}
            title="Heading 2"
          >
            <span className="font-bold">H2</span>
            <span className="text-xs">Heading 2</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`flex items-center gap-1 ${editor.isActive('heading', { level: 3 }) ? activeButtonClass : buttonClass}`}
            title="Heading 3"
          >
            <span className="font-bold">H3</span>
            <span className="text-xs">Heading 3</span>
          </button>
        </>
      )}

      {/* Lists */}
      {renderDropdown("Lists",
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>,
        <>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`flex items-center gap-1 ${editor.isActive('bulletList') ? activeButtonClass : buttonClass}`}
            title="Bullet List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span className="text-xs">Bullet</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`flex items-center gap-1 ${editor.isActive('orderedList') ? activeButtonClass : buttonClass}`}
            title="Numbered List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="10" y1="6" x2="21" y2="6"></line>
              <line x1="10" y1="12" x2="21" y2="12"></line>
              <line x1="10" y1="18" x2="21" y2="18"></line>
              <path d="M4 6h1v4"></path>
              <path d="M4 10h2"></path>
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
            </svg>
            <span className="text-xs">Numbered</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`flex items-center gap-1 ${editor.isActive('taskList') ? activeButtonClass : buttonClass}`}
            title="Task List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span className="text-xs">Tasks</span>
          </button>
        </>
      )}

      {/* Insert items */}
      {renderDropdown("Insert",
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>,
        <>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`flex items-center gap-1 ${editor.isActive('codeBlock') ? activeButtonClass : buttonClass}`}
            title="Code Block"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span className="text-xs">Code</span>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`flex items-center gap-1 ${editor.isActive('blockquote') ? activeButtonClass : buttonClass}`}
            title="Quote"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
            </svg>
            <span className="text-xs">Quote</span>
          </button>
          <button
            onClick={setLink}
            className={`flex items-center gap-1 ${editor.isActive('link') ? activeButtonClass : buttonClass}`}
            title="Link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            <span className="text-xs">Link</span>
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={`flex items-center gap-1 ${buttonClass}`}
            title="Horizontal Rule"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
            </svg>
            <span className="text-xs">Line</span>
          </button>
          <button
            onClick={addImage}
            className={`flex items-center gap-1 ${buttonClass}`}
            title="Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span className="text-xs">Image</span>
          </button>
          <button
            onClick={addYouTube}
            className={`flex items-center gap-1 ${buttonClass}`}
            title="YouTube Video"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
            <span className="text-xs">YouTube</span>
          </button>
          <button
            onClick={addTable}
            className={`flex items-center gap-1 ${buttonClass}`}
            title="Table"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path>
            </svg>
            <span className="text-xs">Table</span>
          </button>
        </>
      )}

      {/* Undo/Redo always visible on the right */}
      <div className="ml-auto flex items-center">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={`${buttonClass} ${!editor.can().undo() ? 'opacity-30' : ''}`}
          title="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6"></path>
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
          </svg>
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={`${buttonClass} ${!editor.can().redo() ? 'opacity-30' : ''}`}
          title="Redo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6"></path>
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
          </svg>
        </button>
      </div>
    </>
  );

  return (
    <div className={`flex flex-wrap gap-1 p-2 ${darkMode ? 'bg-gray-900/70' : 'bg-white/70'} backdrop-blur-sm shadow-sm border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} tiptap-menubar overflow-x-auto sticky top-0 z-[1050] ${isMobile ? 'justify-center' : 'w-full'}`}>
      {commonToolbarItems}
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder, darkMode }) {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing your note here...',
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Youtube.configure({
        controls: true,
        nocookie: false,
        HTMLAttributes: {
          class: 'mx-auto rounded-lg',
        },
        modestBranding: true,
        ccLoadPolicy: 1,
      }),
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      HorizontalRule,
      Typography,
      DropCursor.configure({
        color: '#3b82f6',
        width: 2,
      }),
      GapCursor,
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none ${darkMode ? 'prose-invert' : ''}`,
      },
    },
  });

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <div className={`flex flex-col h-full rounded-xl overflow-hidden ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <div className="editor-menubar-container">
        <MenuBar
          editor={editor}
          darkMode={darkMode}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className={`h-full ${darkMode ? 'bg-gray-900/70' : 'bg-white/70'} backdrop-blur-sm p-4 overflow-auto`}>
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </div>
  );
}
