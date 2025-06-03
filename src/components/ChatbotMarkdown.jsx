import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";
import { CheckCircle, Copy } from "lucide-react";

// Load languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";

const ChatbotMarkdown = forwardRef(({ content }, ref) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  // Function to extract formatted text from the rendered DOM
  const getFormattedText = () => {
    if (!containerRef.current) return content;

    const element = containerRef.current;
    let formattedText = '';

    // Function to recursively extract text with formatting
    const extractText = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        let childText = '';
        
        // Get text from all child nodes
        for (let child of node.childNodes) {
          childText += extractText(child);
        }

        // Format based on the element type
        switch (tagName) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            return `${childText}\n\n`;
          
          case 'p':
            return `${childText}\n\n`;
          
          case 'strong':
          case 'b':
            return childText; // Keep the text as is, it's already bold in rendering
          
          case 'em':
          case 'i':
            return childText; // Keep the text as is, it's already italic in rendering
          
          case 'code':
            if (node.parentElement?.tagName.toLowerCase() === 'pre') {
              return childText; // Block code
            }
            return childText; // Inline code
          
          case 'pre':
            return `${childText}\n\n`;
          
          case 'li':
            const listParent = node.parentElement?.tagName.toLowerCase();
            if (listParent === 'ol') {
              const index = Array.from(node.parentElement.children).indexOf(node) + 1;
              return `${index}. ${childText}\n`;
            } else {
              return `• ${childText}\n`;
            }
          
          case 'ul':
          case 'ol':
            return `${childText}\n`;
          
          case 'blockquote':
            return `${childText}\n\n`;
          
          case 'a':
            return `${childText}`;
          
          case 'br':
            return '\n';
          
          case 'hr':
            return '---\n\n';
          
          case 'table':
            return `${childText}\n`;
          
          case 'tr':
            return `${childText}\n`;
          
          case 'th':
          case 'td':
            return `${childText}\t`;
          
          default:
            return childText;
        }
      }

      return '';
    };

    formattedText = extractText(element);
    
    // Clean up excessive whitespace while preserving structure
    formattedText = formattedText
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 consecutive newlines
      .replace(/\t+/g, ' ') // Replace tabs with spaces
      .trim();

    return formattedText;
  };

  // Expose the function to parent component
  useImperativeHandle(ref, () => ({
    getFormattedText
  }));

  return (
    <div ref={containerRef}>
      <ReactMarkdown
        children={content}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ inline, className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.[1];
            const codeContent = String(children).trim();

            if (!inline && lang) {
              return (
                <div className="relative">
                  <pre className="rounded-lg overflow-x-auto my-4 p-4 text-xs md:text-sm bg-gray-600 dark:bg-[#272822] text-black dark:text-white border border-gray-200 dark:border-none transition-colors duration-200">
                    <code
                      className={`language-${lang}`}
                      dangerouslySetInnerHTML={{
                        __html: Prism.highlight(codeContent, Prism.languages[lang] || Prism.languages.markup, lang),
                      }}
                    />
                  </pre>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(codeContent);
                    }}
                    className="absolute top-2 right-2 z-10 p-1 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition"
                  >
                    {copied ? (
                      <span className="flex items-center">
                        <CheckCircle size={16} color="#4cd327" />
                        <span className="ml-2">Copied!</span>
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Copy size={16} />
                        <span className="ml-2">Copy</span>
                      </span>
                    )}
                  </button>
                </div>
              );
            }

            return (
              <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-300 px-1 py-0.5 rounded text-xs md:text-sm font-mono transition-colors duration-300">
                {children}
              </code>
            );
          },

          p({ children }) {
            return (
              <p className="leading-relaxed text-black text-xs md:text-base dark:text-gray-200 mb-2">
                {children}
              </p>
            );
          },

          strong({ children }) {
            return (
              <strong className="font-semibold text-xs md:text-base">
                {children}
              </strong>
            );
          },

          em({ children }) {
            return (
              <em className="italic">
                {children}
              </em>
            );
          },

          a({ node, ...props }) {
            return (
              <a
                className="text-blue-600 dark:text-blue-400 underline break-all hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            );
          },

          li({ children }) {
            return (
              <li className="ml-6 list-disc text-xs md:text-base mb-1">
                {children}
              </li>
            );
          },

          ul({ children }) {
            return (
              <ul className="list-disc ml-6 mb-4">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="list-decimal ml-6 mb-4">
                {children}
              </ol>
            );
          },

          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="text-xl font-bold mb-3 text-black dark:text-white">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="text-lg font-bold mb-2 text-black dark:text-white">
                {children}
              </h3>
            );
          },

          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300 my-4 transition-colors duration-300">
                {children}
              </blockquote>
            );
          },

          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                  {children}
                </table>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                {children}
              </td>
            );
          },
        }}
      />
    </div>
  );
});

ChatbotMarkdown.displayName = 'ChatbotMarkdown';

export default ChatbotMarkdown;
