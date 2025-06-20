// import React, {
//   useState,
//   useRef,
//   useImperativeHandle,
//   forwardRef,
// } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";
// import { CheckCircle, Copy } from "lucide-react";

// const ChatbotMarkdown = forwardRef(
//   ({ content, onLinkClick, onCopyClick, messageId }, ref) => {
//     const [copied, setCopied] = useState(false);
//     const [codeCopied, setCodeCopied] = useState(false);
//     const containerRef = useRef(null);

//     const handleCopyCode = (content, messageId) => {
//       if (onCopyClick) {
//         onCopyClick(content, messageId);
//       } else {
//         navigator.clipboard.writeText(content);
//       }
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1000);
//     };

//     const handleCopyCodeBlock = (codeContent) => {
//       navigator.clipboard.writeText(codeContent);
//       setCodeCopied(true);
//       setTimeout(() => setCodeCopied(false), 1000);
//     };

//     const setPendingUrl = (url) => {
//       if (onLinkClick) {
//         onLinkClick(url);
//       }
//     };

//     const setModalOpen = (state) => {
//       // This will be handled by parent component
//     };

//     const getFormattedText = () => {
//       return containerRef.current?.innerText || content;
//     };

//     useImperativeHandle(ref, () => ({
//       getFormattedText,
//     }));

//     return (
//       <div ref={containerRef}>
//         <style>
//           {`
//             .code-selectable pre,
//             .code-selectable code {
//               user-select: text !important;
//               -webkit-user-select: text !important;
//               -moz-user-select: text !important;
//               -ms-user-select: text !important;
//             }
//           `}
//         </style>

//         <div className="w-full mr-1 font-poppins relative code-selectable">
//           {/* Sticky Copy Button */}
//           <div className="sticky top-0 float-right z-20">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleCopyCode(content, messageId);
//               }}
//               className="p-1 rounded-md bg-gray-500/80 hover:bg-gray-600/90 text-white transition-all duration-200 shadow-lg backdrop-blur-sm">
//               {copied ? (
//                 <div className="flex justify-center items-center gap-1">
//                 <CheckCircle size={16} color="#4cd327" />
//                 <span className="hidden md:block text-xs">copied!</span>
//                 </div>
//               ) : (
//                 <div className="flex justify-center items-center gap-1">
//                 <Copy size={16} />
//                 <span className="hidden md:block text-xs">copy</span>
//                 </div>
//               )}
//             </button>
//           </div>

//           <ReactMarkdown
//             rehypePlugins={[rehypeRaw]}
//             remarkPlugins={[remarkGfm]}
//             components={{
//               code({ inline, className, children, ...props }) {
//                 const match = /language-(\w+)/.exec(className || "");
//                 const lang = match?.[1];
//                 const codeContent = String(children).replace(/\n$/, "");

//                 if (!inline && match) {
//                   return (
//                     <div className="relative w-full  my-3 sm:my-4 group">
//                       <div className="relative rounded-lg mr-3 md:mr-0 overflow-hidden bg-gray-600 dark:bg-[#272822] border border-gray-200 dark:border-gray-600">
//                         <div className="flex items-center justify-between px-3 py-2 bg-gray-700 dark:bg-gray-800 border-b border-gray-500 dark:border-gray-600">
//                           <span className="text-xs text-gray-300 font-medium uppercase">
//                             {lang}
//                           </span>
//                           <button
//                             onClick={() => handleCopyCodeBlock(codeContent)}
//                             className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-gray-600 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-colors duration-200">
//                             {codeCopied ? (
//                               <>
//                                 <CheckCircle size={12} color="#4cd327" />
//                                 <span>Copied!</span>
//                               </>
//                             ) : (
//                               <>
//                                 <Copy size={12} />
//                                 <span>Copy code</span>
//                               </>
//                             )}
//                           </button>
//                         </div>

//                         <div className="overflow-x-auto">
//                           <pre className="p-3 sm:p-4 text-xs sm:text-base text-white m-0 min-w-0">
//                             <code className={className} {...props}>
//                               {children}
//                             </code>
//                           </pre>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 }

//                 return (
//                   <code
//                     className="bg-gray-200  dark:bg-gray-700 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded text-xs sm:text-base font-poppins"
//                     {...props}>
//                     {children}
//                   </code>
//                 );
//               },

//               a({ href, children, ...props }) {
//                 return (
//                   <a
//                     className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300"
//                     href={href}
//                     onClick={(e) => {
//                       e.preventDefault();
//                       setPendingUrl(href);
//                       setModalOpen(true);
//                     }}
//                     {...props}>
//                     {children}
//                   </a>
//                 );
//               },

//               strong({ children }) {
//                 return (
//                   <strong className="font-bold text-base">
//                     {children}
//                   </strong>
//                 );
//               },
//             }}>
//             {content}
//           </ReactMarkdown>
//         </div>
//       </div>
//     );
//   }
// );

// ChatbotMarkdown.displayName = "ChatbotMarkdown";
// export default ChatbotMarkdown;

// import React, {
//   useState,
//   useRef,
//   useImperativeHandle,
//   forwardRef,
//   useEffect,
// } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";
// import { CheckCircle, Copy } from "lucide-react";

// const ChatbotMarkdown = forwardRef(
//   ({ content, onLinkClick, onCopyClick, messageId }, ref) => {
//     const [copied, setCopied] = useState(false);
//     const [codeCopiedStates, setCodeCopiedStates] = useState({});
//     const containerRef = useRef(null);

//     const handleCopyCode = (content, messageId) => {
//       if (onCopyClick) {
//         onCopyClick(content, messageId);
//       } else {
//         navigator.clipboard.writeText(content);
//       }
//       setCopied(true);
//       setTimeout(() => setCopied(false), 1000);
//     };

//     const handleCopyCodeBlock = (codeContent, blockId) => {
//       navigator.clipboard.writeText(codeContent);
//       setCodeCopiedStates(prev => ({ ...prev, [blockId]: true }));
//       setTimeout(() => {
//         setCodeCopiedStates(prev => ({ ...prev, [blockId]: false }));
//       }, 1000);
//     };

//     const setPendingUrl = (url) => {
//       if (onLinkClick) {
//         onLinkClick(url);
//       }
//     };

//     const setModalOpen = (state) => {
//       // This will be handled by parent component
//     };

//     const getFormattedText = () => {
//       return containerRef.current?.innerText || content;
//     };

//     useImperativeHandle(ref, () => ({
//       getFormattedText,
//     }));

//     // Add copy buttons to code blocks after render
//     useEffect(() => {
//       if (!containerRef.current) return;

//       const codeBlocks = containerRef.current.querySelectorAll('pre');

//       codeBlocks.forEach((pre, index) => {
//         // Skip if already has copy button
//         if (pre.querySelector('.code-copy-btn')) return;

//         const code = pre.querySelector('code');
//         if (!code) return;

//         const codeContent = code.textContent || '';
//         const className = code.className || '';
//         const match = /language-(\w+)/.exec(className);
//         const lang = match?.[1] || 'code';
//         const blockId = `code-${index}-${Math.random().toString(36).substr(2, 5)}`;

//         // Create header
//         const header = document.createElement('div');
//         header.className = 'code-header';
//         header.innerHTML = `
//           <span class="code-lang">${lang.toUpperCase()}</span>
//           <button class="code-copy-btn" data-block-id="${blockId}">
//             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
//               <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
//               <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
//             </svg>
//             <span>Copy code</span>
//           </button>
//         `;

//         // Insert header at the beginning of pre
//         pre.insertBefore(header, pre.firstChild);

//         // Add click handler
//         const copyBtn = header.querySelector('.code-copy-btn');
//         copyBtn.addEventListener('click', (e) => {
//           e.preventDefault();
//           e.stopPropagation();
//           handleCopyCodeBlock(codeContent, blockId);
//         });
//       });
//     }, [content]);

//     return (
//       <div ref={containerRef}>
//         <style>
//           {`
//             .chatgpt-markdown {
//               user-select: text !important;
//               -webkit-user-select: text !important;
//               -moz-user-select: text !important;
//               -ms-user-select: text !important;
//               line-height: 1.6;
//               color: #374151;
//             }

//             .dark .chatgpt-markdown {
//               color: #d1d5db;
//             }

//             .chatgpt-markdown * {
//               user-select: text !important;
//               -webkit-user-select: text !important;
//               -moz-user-select: text !important;
//               -ms-user-select: text !important;
//             }

//             /* Headings */
//             .chatgpt-markdown h1 {
//               font-size: 1.875rem;
//               font-weight: 600;
//               margin: 1.5rem 0 0.75rem 0;
//               color: #111827;
//             }
//             .chatgpt-markdown h2 {
//               font-size: 1.5rem;
//               font-weight: 600;
//               margin: 1.25rem 0 0.75rem 0;
//               color: #111827;
//             }
//             .chatgpt-markdown h3 {
//               font-size: 1.25rem;
//               font-weight: 600;
//               margin: 1rem 0 0.5rem 0;
//               color: #111827;
//             }
//             .chatgpt-markdown h4 {
//               font-size: 1.125rem;
//               font-weight: 600;
//               margin: 1rem 0 0.5rem 0;
//               color: #111827;
//             }
//             .chatgpt-markdown h5 {
//               font-size: 1rem;
//               font-weight: 600;
//               margin: 0.75rem 0 0.5rem 0;
//               color: #111827;
//             }
//             .chatgpt-markdown h6 {
//               font-size: 0.875rem;
//               font-weight: 600;
//               margin: 0.75rem 0 0.5rem 0;
//               color: #111827;
//             }

//             .dark .chatgpt-markdown h1,
//             .dark .chatgpt-markdown h2,
//             .dark .chatgpt-markdown h3,
//             .dark .chatgpt-markdown h4,
//             .dark .chatgpt-markdown h5,
//             .dark .chatgpt-markdown h6 {
//               color: #f9fafb;
//             }

//             /* First heading has no top margin */
//             .chatgpt-markdown h1:first-child,
//             .chatgpt-markdown h2:first-child,
//             .chatgpt-markdown h3:first-child,
//             .chatgpt-markdown h4:first-child,
//             .chatgpt-markdown h5:first-child,
//             .chatgpt-markdown h6:first-child {
//               margin-top: 0;
//             }

//             /* Paragraphs */
//             .chatgpt-markdown p {
//               margin: 0 0 1rem 0;
//               line-height: 1.6;
//             }

//             /* Lists */
//             .chatgpt-markdown ul,
//             .chatgpt-markdown ol {
//               margin: 0 0 1rem 0;
//               padding-left: 1.5rem;
//             }
//             .chatgpt-markdown li {
//               margin: 0.25rem 0;
//               line-height: 1.5;
//             }

//             /* Blockquotes */
//             .chatgpt-markdown blockquote {
//               border-left: 3px solid #e5e7eb;
//               padding-left: 1rem;
//               margin: 1rem 0;
//               font-style: italic;
//               color: #6b7280;
//               background: #f9fafb;
//               padding: 0.75rem 1rem;
//               border-radius: 0 0.375rem 0.375rem 0;
//             }
//             .dark .chatgpt-markdown blockquote {
//               border-left-color: #4b5563;
//               color: #9ca3af;
//               background: #1f2937;
//             }

//             /* Links */
//             .chatgpt-markdown a {
//               color: #2563eb;
//               text-decoration: underline;
//               font-weight: 500;
//             }
//             .chatgpt-markdown a:hover {
//               color: #1d4ed8;
//             }
//             .dark .chatgpt-markdown a {
//               color: #60a5fa;
//             }
//             .dark .chatgpt-markdown a:hover {
//               color: #93c5fd;
//             }

//             /* Strong/Bold */
//             .chatgpt-markdown strong {
//               font-weight: 600;
//               color: #111827;
//             }
//             .dark .chatgpt-markdown strong {
//               color: #f9fafb;
//             }

//             /* Emphasis/Italic */
//             .chatgpt-markdown em {
//               font-style: italic;
//             }

//             /* Horizontal Rule */
//             .chatgpt-markdown hr {
//               margin: 1.5rem 0;
//               border: none;
//               border-top: 1px solid #e5e7eb;
//             }
//             .dark .chatgpt-markdown hr {
//               border-top-color: #4b5563;
//             }

//             /* Tables */
//             .chatgpt-markdown table {
//               width: 100%;
//               border-collapse: collapse;
//               margin: 1rem 0;
//               font-size: 0.875rem;
//             }
//             .chatgpt-markdown th,
//             .chatgpt-markdown td {
//               border: 1px solid #e5e7eb;
//               padding: 0.5rem 0.75rem;
//               text-align: left;
//             }
//             .chatgpt-markdown th {
//               background-color: #f9fafb;
//               font-weight: 600;
//             }
//             .dark .chatgpt-markdown th,
//             .dark .chatgpt-markdown td {
//               border-color: #4b5563;
//             }
//             .dark .chatgpt-markdown th {
//               background-color: #374151;
//             }

//             /* Simple Code Blocks */
//             .chatgpt-markdown pre {
//               background: #1f2937;
//               border-radius: 0.5rem;
//               margin: 1rem 0;
//               overflow: hidden;
//               border: 1px solid #374151;
//               position: relative;
//             }
//             .dark .chatgpt-markdown pre {
//               background: #111827;
//               border-color: #1f2937;
//             }

//             /* Code Header */
//             .code-header {
//               display: flex;
//               justify-content: space-between;
//               align-items: center;
//               padding: 0.5rem 1rem;
//               background: #374151;
//               border-bottom: 1px solid #4b5563;
//               user-select: none !important;
//               -webkit-user-select: none !important;
//               -moz-user-select: none !important;
//               -ms-user-select: none !important;
//             }
//             .dark .code-header {
//               background: #1f2937;
//               border-bottom-color: #374151;
//             }

//             .code-lang {
//               font-size: 0.75rem;
//               font-weight: 500;
//               color: #d1d5db;
//               text-transform: uppercase;
//               letter-spacing: 0.05em;
//             }

//             .code-copy-btn {
//               display: flex;
//               align-items: center;
//               gap: 0.375rem;
//               padding: 0.25rem 0.5rem;
//               font-size: 0.75rem;
//               background: #4b5563;
//               color: white;
//               border: none;
//               border-radius: 0.25rem;
//               cursor: pointer;
//               transition: background-color 0.2s;
//             }
//             .code-copy-btn:hover {
//               background: #6b7280;
//             }
//             .dark .code-copy-btn {
//               background: #374151;
//             }
//             .dark .code-copy-btn:hover {
//               background: #4b5563;
//             }

//             .chatgpt-markdown pre code {
//               display: block;
//               background: transparent !important;
//               color: #e5e7eb !important;
//               padding: 1rem !important;
//               border: none !important;
//               font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
//               font-size: 0.875rem;
//               line-height: 1.5;
//               overflow-x: auto;
//               margin: 0;
//             }

//             /* Inline Code */
//             .chatgpt-markdown code:not(pre code) {
//               background: #f3f4f6;
//               color: #dc2626;
//               padding: 0.125rem 0.375rem;
//               border-radius: 0.25rem;
//               font-size: 0.875em;
//               font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
//               border: 1px solid #e5e7eb;
//             }
//             .dark .chatgpt-markdown code:not(pre code) {
//               background: #374151;
//               color: #fca5a5;
//               border-color: #4b5563;
//             }

//             /* Mobile Responsive */
//             @media (max-width: 768px) {
//               .chatgpt-markdown h1 { font-size: 1.5rem; }
//               .chatgpt-markdown h2 { font-size: 1.25rem; }
//               .chatgpt-markdown h3 { font-size: 1.125rem; }
//               .chatgpt-markdown h4 { font-size: 1rem; }
//               .chatgpt-markdown { font-size: 0.875rem; }
//               .chatgpt-markdown ul,
//               .chatgpt-markdown ol { padding-left: 1.25rem; }

//               .code-header {
//                 padding: 0.375rem 0.75rem;
//               }
//               .chatgpt-markdown pre code {
//                 padding: 0.75rem !important;
//                 font-size: 0.75rem;
//               }
//               .code-copy-btn {
//                 padding: 0.25rem 0.375rem;
//                 font-size: 0.625rem;
//               }
//             }
//           `}
//         </style>

//         <div className="w-full mr-1 font-poppins relative">
//           {/* Sticky Copy Button */}
//           <div className="sticky top-0 float-right z-20">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 handleCopyCode(content, messageId);
//               }}
//               className="p-1 rounded-md bg-gray-500/80 hover:bg-gray-600/90 text-white transition-all duration-200 shadow-lg backdrop-blur-sm">
//               {copied ? (
//                 <div className="flex justify-center items-center gap-1">
//                   <CheckCircle size={16} color="#4cd327" />
//                   <span className="hidden md:block text-xs">copied!</span>
//                 </div>
//               ) : (
//                 <div className="flex justify-center items-center gap-1">
//                                     <Copy size={16} />
//                   <span className="hidden md:block text-xs">copy</span>
//                 </div>
//               )}
//             </button>
//           </div>

//           <div className="chatgpt-markdown">
//             <ReactMarkdown
//               rehypePlugins={[rehypeRaw]}
//               remarkPlugins={[remarkGfm]}
//               components={{
//                 // Custom link handler only
//                 a({ href, children, ...props }) {
//                   return (
//                     <a
//                       href={href}
//                       onClick={(e) => {
//                         e.preventDefault();
//                         setPendingUrl(href);
//                         setModalOpen(true);
//                       }}
//                       {...props}>
//                       {children}
//                     </a>
//                   );
//                 },
//               }}>
//               {content}
//             </ReactMarkdown>
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// ChatbotMarkdown.displayName = "ChatbotMarkdown";
// export default ChatbotMarkdown;

import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CheckCircle, Copy } from "lucide-react";
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css'; // VS Code dark theme

const ChatbotMarkdown = forwardRef(
  ({ content, onLinkClick, onCopyClick, messageId }, ref) => {
    const [copied, setCopied] = useState(false);
    const containerRef = useRef(null);

    const handleCopyCode = (content, messageId) => {
      if (onCopyClick) {
        onCopyClick(content, messageId);
      } else {
        navigator.clipboard.writeText(content);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    };

    const handleCopyCodeBlock = (codeContent) => {
      navigator.clipboard.writeText(codeContent);
    };

    const setPendingUrl = (url) => {
      if (onLinkClick) {
        onLinkClick(url);
      }
    };

    const setModalOpen = (state) => {
      // This will be handled by parent component
    };

    const getFormattedText = () => {
      return containerRef.current?.innerText || content;
    };

    useImperativeHandle(ref, () => ({
      getFormattedText,
    }));

    // Highlight code blocks after render
    useEffect(() => {
      if (!containerRef.current) return;

      const codeBlocks = containerRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        // Skip if already highlighted
        if (block.classList.contains('hljs')) return;
        
        hljs.highlightElement(block);
      });

      // Add copy buttons to code blocks
      const preBlocks = containerRef.current.querySelectorAll('pre');
      preBlocks.forEach((pre, index) => {
        // Skip if already has copy button
        if (pre.querySelector('.code-copy-btn')) return;

        const code = pre.querySelector('code');
        if (!code) return;

        const codeContent = code.textContent || '';
        const className = code.className || '';
        const match = /language-(\w+)/.exec(className);
        const lang = match?.[1] || hljs.highlightAuto(codeContent).language || 'code';

        // Create header
        const header = document.createElement('div');
        header.className = 'code-header';
        
        // Create language span
        const langSpan = document.createElement('span');
        langSpan.className = 'code-lang';
        langSpan.textContent = lang.toUpperCase();
        
        // Create button
        const button = document.createElement('button');
        button.className = 'code-copy-btn';
        
        // Function to update button content
        const updateButtonContent = (isCopied) => {
          button.innerHTML = `
            <div class="flex items-center gap-1.5">
              ${isCopied 
                ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4cd327" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"></polyline></svg>`
                : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
              }
              <span style="color: ${isCopied ? '#4cd327' : 'inherit'}">${isCopied ? 'Copied!' : 'Copy code'}</span>
            </div>
          `;
        };

        // Initial button content
        updateButtonContent(false);
        
        // Add click handler
        button.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Immediately update button to show copied state
          updateButtonContent(true);
          
          // Copy to clipboard
          handleCopyCodeBlock(codeContent);
          
          // Reset button after 1 second
          setTimeout(() => {
            updateButtonContent(false);
          }, 1000);
        });
        
        // Assemble header
        header.appendChild(langSpan);
        header.appendChild(button);
        
        // Insert header
        pre.insertBefore(header, pre.firstChild);
      });
    }, [content]);

    return (
      <div ref={containerRef}>
        <style>
          {`
            .chatgpt-markdown {
              user-select: text !important;
              -webkit-user-select: text !important;
              -moz-user-select: text !important;
              -ms-user-select: text !important;
              line-height: 1.6;
              color: #374151;
              width: 100%;
            }

            .dark .chatgpt-markdown {
              color: #d1d5db;
            }
            
            .chatgpt-markdown * {
              user-select: text !important;
              -webkit-user-select: text !important;
              -moz-user-select: text !important;
              -ms-user-select: text !important;
            }

            /* Headings */
            .chatgpt-markdown h1 {
              font-size: 1.875rem;
              font-weight: 600;
              margin: 1.5rem 0 0.75rem 0;
              color: #111827;
            }
            .chatgpt-markdown h2 {
              font-size: 1.5rem;
              font-weight: 600;
              margin: 1.25rem 0 0.75rem 0;
              color: #111827;
            }
            .chatgpt-markdown h3 {
              font-size: 1.25rem;
              font-weight: 600;
              margin: 1rem 0 0.5rem 0;
              color: #111827;
            }
            .chatgpt-markdown h4 {
              font-size: 1.125rem;
              font-weight: 600;
              margin: 1rem 0 0.5rem 0;
              color: #111827;
            }
            .chatgpt-markdown h5 {
              font-size: 1rem;
              font-weight: 600;
              margin: 0.75rem 0 0.5rem 0;
              color: #111827;
            }
            .chatgpt-markdown h6 {
              font-size: 0.875rem;
              font-weight: 600;
              margin: 0.75rem 0 0.5rem 0;
              color: #111827;
            }

            .dark .chatgpt-markdown h1,
            .dark .chatgpt-markdown h2,
            .dark .chatgpt-markdown h3,
            .dark .chatgpt-markdown h4,
            .dark .chatgpt-markdown h5,
            .dark .chatgpt-markdown h6 {
              color: #f9fafb;
            }

            /* First heading has no top margin */
            .chatgpt-markdown h1:first-child,
            .chatgpt-markdown h2:first-child,
            .chatgpt-markdown h3:first-child,
            .chatgpt-markdown h4:first-child,
            .chatgpt-markdown h5:first-child,
            .chatgpt-markdown h6:first-child {
              margin-top: 0;
            }

            /* Paragraphs */
            .chatgpt-markdown p {
              margin: 0 0 1rem 0;
              line-height: 1.6;
            }

            /* Lists */
            .chatgpt-markdown ul,
            .chatgpt-markdown ol {
              margin: 0 0 1rem 0;
              padding-left: 1.5rem;
            }
            .chatgpt-markdown li {
              margin: 0.25rem 0;
              line-height: 1.5;
            }

            /* Blockquotes */
            .chatgpt-markdown blockquote {
              border-left: 3px solid #e5e7eb;
              padding-left: 1rem;
              margin: 1rem 0;
              font-style: italic;
              color: #6b7280;
              background: #f9fafb;
              padding: 0.75rem 1rem;
              border-radius: 0 0.375rem 0.375rem 0;
            }
            .dark .chatgpt-markdown blockquote {
              border-left-color: #4b5563;
              color: #9ca3af;
              background: #1f2937;
            }

            /* Links */
            .chatgpt-markdown a {
              color: #2563eb;
              text-decoration: underline;
              font-weight: 500;
            }
            .chatgpt-markdown a:hover {
              color: #1d4ed8;
            }
            .dark .chatgpt-markdown a {
              color: #60a5fa;
            }
            .dark .chatgpt-markdown a:hover {
              color: #93c5fd;
            }

            /* Strong/Bold */
            .chatgpt-markdown strong {
              font-weight: 600;
              color: #111827;
            }
            .dark .chatgpt-markdown strong {
              color: #f9fafb;
            }

            /* Emphasis/Italic */
            .chatgpt-markdown em {
              font-style: italic;
            }

            /* Horizontal Rule */
            .chatgpt-markdown hr {
              margin: 1.5rem 0;
              border: none;
              border-top: 1px solid #e5e7eb;
            }
            .dark .chatgpt-markdown hr {
              border-top-color: #4b5563;
            }

            /* Tables */
            .chatgpt-markdown table {
              width: 100%;
              border-collapse: collapse;
              margin: 1rem 0;
              font-size: 0.875rem;
            }
            .chatgpt-markdown th,
            .chatgpt-markdown td {
              border: 1px solid #e5e7eb;
              padding: 0.5rem 0.75rem;
              text-align: left;
            }
            .chatgpt-markdown th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            .dark .chatgpt-markdown th,
            .dark .chatgpt-markdown td {
              border-color: #4b5563;
            }
            .dark .chatgpt-markdown th {
              background-color: #374151;
            }

            /* Code Blocks - Full width within container */
            .chatgpt-markdown pre {
              background: #1e1e1e;
              border-radius: 0.5rem;
              margin: 1rem 0;
              overflow: hidden;
              border: 1px solid #374151;
              position: relative;
              width: 100%;
              box-sizing: border-box;
            }
            .dark .chatgpt-markdown pre {
              background: #1e1e1e;
              border-color: #1f2937;
            }

            /* Code Header */
            .code-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 0.5rem 1rem;
              background: #374151;
              border-bottom: 1px solid #4b5563;
              user-select: none !important;
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
              width: 100%;
              box-sizing: border-box;
            }
            .dark .code-header {
              background: #2d2d2d;
              border-bottom-color: #404040;
            }

            .code-lang {
              font-size: 0.75rem;
              font-weight: 500;
              color: #d1d5db;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .code-copy-btn {
              display: flex;
              align-items: center;
              padding: 0.25rem 0.5rem;
              font-size: 0.75rem;
              background: #4b5563;
              color: white;
              border: none;
              border-radius: 0.25rem;
              cursor: pointer;
              transition: all 0.2s;
            }
            .code-copy-btn:hover {
              background: #6b7280;
            }
            .dark .code-copy-btn {
              background: #404040;
            }
            .dark .code-copy-btn:hover {
              background: #4b5563;
            }

            /* Override highlight.js styles for better integration */
            .chatgpt-markdown pre code.hljs {
              display: block;
              background: transparent !important;
              padding: 1rem !important;
              border: none !important;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
              font-size: 0.875rem !important;
              line-height: 1.5 !important;
              overflow-x: auto;
              margin: 0;
              width: 100%;
              box-sizing: border-box;
              white-space: pre;
              user-select: text !important;
              -webkit-user-select: text !important;
              -moz-user-select: text !important;
              -ms-user-select: text !important;
            }

            /* Ensure all code content is selectable */
            .chatgpt-markdown pre code.hljs * {
              user-select: text !important;
              -webkit-user-select: text !important;
              -moz-user-select: text !important;
              -ms-user-select: text !important;
            }

            /* Inline Code */
            .chatgpt-markdown code:not(pre code) {
              background: #f3f4f6;
              color: #dc2626;
              padding: 0.125rem 0.375rem;
              border-radius: 0.25rem;
              font-size: 0.875em;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              border: 1px solid #e5e7eb;
            }
                     .dark .chatgpt-markdown code:not(pre code) {
              background: #374151;
              color: #fca5a5;
              border-color: #4b5563;
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
              .chatgpt-markdown h1 { font-size: 1.5rem; }
              .chatgpt-markdown h2 { font-size: 1.25rem; }
              .chatgpt-markdown h3 { font-size: 1.125rem; }
              .chatgpt-markdown h4 { font-size: 1rem; }
              .chatgpt-markdown { font-size: 0.875rem; }
              .chatgpt-markdown ul,
              .chatgpt-markdown ol { padding-left: 1.25rem; }
              
              .code-header {
                padding: 0.375rem 0.75rem;
                flex-wrap: wrap;
                gap: 0.5rem;
              }
              .chatgpt-markdown pre code.hljs {
                padding: 0.75rem !important;
                font-size: 0.75rem !important;
              }
              .code-copy-btn {
                padding: 0.25rem 0.375rem;
                font-size: 0.625rem;
              }
              .code-lang {
                font-size: 0.625rem;
              }
            }

            /* Scrollbar styling for code blocks */
            .chatgpt-markdown pre code.hljs::-webkit-scrollbar {
              height: 8px;
            }

            .chatgpt-markdown pre code.hljs::-webkit-scrollbar-track {
              background: #2d2d2d;
              border-radius: 4px;
            }

            .chatgpt-markdown pre code.hljs::-webkit-scrollbar-thumb {
              background: #404040;
              border-radius: 4px;
            }

            .chatgpt-markdown pre code.hljs::-webkit-scrollbar-thumb:hover {
              background: #4b5563;
            }

            /* Ensure flex utility classes work */
            .flex {
              display: flex;
            }
            .items-center {
              align-items: center;
            }
            .gap-1\.5 {
              gap: 0.375rem;
            }
          `}
        </style>
        
        <div className="w-full font-poppins relative">
          {/* Sticky Copy Button */}
          <div className="sticky top-0 float-right z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyCode(content, messageId);
              }}
              className="p-1 rounded-md bg-gray-500/80 hover:bg-gray-600/90 text-white transition-all duration-200 shadow-lg backdrop-blur-sm">
              {copied ? (
                <div className="flex justify-center items-center gap-1">
                  <CheckCircle size={16} color="#4cd327" />
                  <span className="hidden md:block text-xs">copied!</span>
                </div>
              ) : (
                <div className="flex justify-center items-center gap-1">
                  <Copy size={16} />
                  <span className="hidden md:block text-xs">copy</span>
                </div>
              )}
            </button>
          </div>

          <div className="chatgpt-markdown">
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom link handler only
                a({ href, children, ...props }) {
                  return (
                    <a
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        setPendingUrl(href);
                        setModalOpen(true);
                      }}
                      {...props}>
                      {children}
                    </a>
                  );
                },
              }}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }
);

ChatbotMarkdown.displayName = "ChatbotMarkdown";
export default ChatbotMarkdown;


