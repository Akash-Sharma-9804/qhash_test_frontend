// import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";
// import Prism from "prismjs";
// import "prismjs/themes/prism-okaidia.css";
// import { CheckCircle, Copy } from "lucide-react";

// // Load languages
// import "prismjs/components/prism-javascript";
// import "prismjs/components/prism-python";
// import "prismjs/components/prism-json";
// import "prismjs/components/prism-markdown";

// const ChatbotMarkdown = forwardRef(({ content }, ref) => {
//   const [copied, setCopied] = useState(false);
//   const containerRef = useRef(null);

//   const handleCopyCode = (code) => {
//     navigator.clipboard.writeText(code);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1000);
//   };

//   // Function to extract formatted text from the rendered DOM
//   const getFormattedText = () => {
//     if (!containerRef.current) return content;

//     const element = containerRef.current;
//     let formattedText = '';

//     // Function to recursively extract text with formatting
//     const extractText = (node) => {
//       if (node.nodeType === Node.TEXT_NODE) {
//         return node.textContent;
//       }

//       if (node.nodeType === Node.ELEMENT_NODE) {
//         const tagName = node.tagName.toLowerCase();
//         let childText = '';
        
//         // Get text from all child nodes
//         for (let child of node.childNodes) {
//           childText += extractText(child);
//         }

//         // Format based on the element type
//         switch (tagName) {
//           case 'h1':
//           case 'h2':
//           case 'h3':
//           case 'h4':
//           case 'h5':
//           case 'h6':
//             return `${childText}\n\n`;
          
//           case 'p':
//             return `${childText}\n\n`;
          
//           case 'strong':
//           case 'b':
//             return childText; // Keep the text as is, it's already bold in rendering
          
//           case 'em':
//           case 'i':
//             return childText; // Keep the text as is, it's already italic in rendering
          
//           case 'code':
//             if (node.parentElement?.tagName.toLowerCase() === 'pre') {
//               return childText; // Block code
//             }
//             return childText; // Inline code
          
//           case 'pre':
//             return `${childText}\n\n`;
          
//           case 'li':
//             const listParent = node.parentElement?.tagName.toLowerCase();
//             if (listParent === 'ol') {
//               const index = Array.from(node.parentElement.children).indexOf(node) + 1;
//               return `${index}. ${childText}\n`;
//             } else {
//               return `• ${childText}\n`;
//             }
          
//           case 'ul':
//           case 'ol':
//             return `${childText}\n`;
          
//           case 'blockquote':
//             return `${childText}\n\n`;
          
//           case 'a':
//             return `${childText}`;
          
//           case 'br':
//             return '\n';
          
//           case 'hr':
//             return '---\n\n';
          
//           case 'table':
//             return `${childText}\n`;
          
//           case 'tr':
//             return `${childText}\n`;
          
//           case 'th':
//           case 'td':
//             return `${childText}\t`;
          
//           default:
//             return childText;
//         }
//       }

//       return '';
//     };

//     formattedText = extractText(element);
    
//     // Clean up excessive whitespace while preserving structure
//     formattedText = formattedText
//       .replace(/\n\s*\n\s*\n/g, '\n\n') // Max 2 consecutive newlines
//       .replace(/\t+/g, ' ') // Replace tabs with spaces
//       .trim();

//     return formattedText;
//   };

//   // Expose the function to parent component
//   useImperativeHandle(ref, () => ({
//     getFormattedText
//   }));

//   return (
//     <div ref={containerRef} className="w-full max-w-full overflow-hidden">
//       <ReactMarkdown
//         children={content}
//         remarkPlugins={[remarkGfm]}
//         rehypePlugins={[rehypeRaw]}
//         components={{
//           code({ inline, className, children }) {
//             const match = /language-(\w+)/.exec(className || "");
//             const lang = match?.[1];
//             const codeContent = String(children).trim();

//             if (!inline && lang) {
//               return (
//                 <div className="relative w-full my-3 sm:my-4">
//                   <pre className="rounded-lg overflow-x-auto p-2 sm:p-3 md:p-4 text-xs sm:text-sm bg-gray-600 dark:bg-[#272822] text-black dark:text-white border border-gray-200 dark:border-none transition-colors duration-200 max-w-full">
//                     <code
//                       className={`language-${lang} block whitespace-pre`}
//                       dangerouslySetInnerHTML={{
//                         __html: Prism.highlight(codeContent, Prism.languages[lang] || Prism.languages.markup, lang),
//                       }}
//                     />
//                   </pre>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleCopyCode(codeContent);
//                     }}
//                     className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 p-1 sm:p-1.5 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition text-xs sm:text-sm"
//                   >
//                     {copied ? (
//                       <span className="flex items-center">
//                         <CheckCircle size={14} className="sm:w-4 sm:h-4" color="#4cd327" />
//                         <span className="ml-1 sm:ml-2 hidden sm:inline">Copied!</span>
//                       </span>
//                     ) : (
//                       <span className="flex items-center">
//                         <Copy size={14} className="sm:w-4 sm:h-4" />
//                         <span className="ml-1 sm:ml-2 hidden sm:inline">Copy</span>
//                       </span>
//                     )}
//                   </button>
//                 </div>
//               );
//             }

//             return (
//               <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-300 px-1 py-0.5 rounded text-xs sm:text-sm font-mono transition-colors duration-300 break-words">
//                 {children}
//               </code>
//             );
//           },

//           p({ children }) {
//             return (
//               <p className="leading-relaxed text-black text-sm sm:text-base mt-5 dark:text-gray-200 mb-2 sm:mb-3 break-words">
//                 {children}
//               </p>
//             );
//           },

//           strong({ children }) {
//             return (
//               <strong className="font-semibold text-sm sm:text-base">
//                 {children}
//               </strong>
//             );
//           },

//           em({ children }) {
//             return (
//               <em className="italic text-sm sm:text-base">
//                 {children}
//               </em>
//             );
//           },

//           a({ node, ...props }) {
//             return (
//               <a
//                 className="text-blue-600 dark:text-blue-400 underline break-all hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 text-sm sm:text-base"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 {...props}
//               />
//             );
//           },

//           li({ children }) {
//             return (
//               <li className="ml-4 sm:ml-6 list-disc text-sm sm:text-base mb-1 break-words">
//                 {children}
//               </li>
//             );
//           },

//           ul({ children }) {
//             return (
//               <ul className="list-disc ml-4 sm:ml-6 mb-3 sm:mb-4 space-y-1">
//                 {children}
//               </ul>
//             );
//           },

//           ol({ children }) {
//             return (
//               <ol className="list-decimal ml-4 sm:ml-6 mb-3 sm:mb-4 space-y-1">
//                 {children}
//               </ol>
//             );
//           },

//           h1({ children }) {
//             return (
//               <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-black dark:text-white break-words">
//                 {children}
//               </h1>
//             );
//           },

//           h2({ children }) {
//             return (
//               <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-black dark:text-white break-words">
//                 {children}
//               </h2>
//             );
//           },

//           h3({ children }) {
//             return (
//               <h3 className="text-base sm:text-lg font-bold mb-2 text-black dark:text-white break-words">
//                 {children}
//               </h3>
//             );
//           },

//           h4({ children }) {
//             return (
//               <h4 className="text-sm sm:text-base font-bold mb-2 text-black dark:text-white break-words">
//                 {children}
//               </h4>
//             );
//           },

//           h5({ children }) {
//             return (
//               <h5 className="text-sm font-bold mb-1 sm:mb-2 text-black dark:text-white break-words">
//                 {children}
//               </h5>
//             );
//           },

//           h6({ children }) {
//             return (
//               <h6 className="text-xs sm:text-sm font-bold mb-1 sm:mb-2 text-black dark:text-white break-words">
//                 {children}
//               </h6>
//             );
//           },

//           blockquote({ children }) {
//             return (
//               <blockquote className="border-l-2 sm:border-l-4 border-gray-400 dark:border-gray-600 pl-2 sm:pl-4 italic text-gray-700 dark:text-gray-300 my-3 sm:my-4 transition-colors duration-300 text-sm sm:text-base break-words">
//                 {children}
//               </blockquote>
//             );
//           },

//           table({ children }) {
//             return (
//               <div className="overflow-x-auto my-3 sm:my-4 -mx-2 sm:mx-0">
//                 <div className="inline-block min-w-full align-middle px-2 sm:px-0">
//                   <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-xs sm:text-sm">
//                     {children}
//                   </table>
//                 </div>
//               </div>
//             );
//           },

//           th({ children }) {
//             return (
//               <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left text-xs sm:text-sm break-words">
//                 {children}
//               </th>
//             );
//           },

//           td({ children }) {
//             return (
//               <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm break-words">
//                 {children}
//               </td>
//             );
//           },

//           hr({ children }) {
//             return (
//               <hr className="border-gray-300 dark:border-gray-600 my-4 sm:my-6" />
//             );
//           },

//           img({ src, alt, ...props }) {
//             return (
//               <img
//                 src={src}
//                 alt={alt}
//                 className="max-w-full h-auto rounded-lg my-2 sm:my-4 mx-auto block"
//                 loading="lazy"
//                 {...props}
//               />
//             );
//           },
//         }}
//       />
//     </div>
//   );
// });

// ChatbotMarkdown.displayName = 'ChatbotMarkdown';

// export default ChatbotMarkdown;
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
import RedirectModal from "./RedirectModal"; // Make sure the path is correct



const ChatbotMarkdown = forwardRef(({ content, onLinkClick  }, ref) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);
const [modalOpen, setModalOpen] = useState(false);
const [pendingUrl, setPendingUrl] = useState("");

 // popup links
  const handleConfirmRedirect = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
    setModalOpen(false);
    setPendingUrl("");
  };

  const handleCancelRedirect = () => {
    setModalOpen(false);
    setPendingUrl("");
  };


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
    <div ref={containerRef} className="w-full  max-w-full overflow-hidden">
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
                <div className="relative w-full  my-3 sm:my-4 group">
                  {/* Code Block Container */}
                  <div className="relative rounded-lg mr-3 md:mr-0 overflow-hidden bg-gray-600 dark:bg-[#272822] border border-gray-200 dark:border-gray-600">
                    {/* Language Label */}
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-700 dark:bg-gray-800 border-b border-gray-500 dark:border-gray-600">
                      <span className="text-xs text-gray-300 font-medium uppercase">
                        {lang}
                      </span>
                      {/* Sticky Copy Button - Always visible like ChatGPT */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(codeContent);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-gray-600 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-colors duration-200"
                      >
                        {copied ? (
                          <>
                            <CheckCircle size={12} color="#4cd327" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy code</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Code Content */}
                    <div className="overflow-x-auto">
                      <pre className="p-3 sm:p-4 text-xs sm:text-sm text-white m-0 min-w-0">
                        <code
                          className={`language-${lang} block whitespace-pre`}
                          dangerouslySetInnerHTML={{
                            __html: Prism.highlight(codeContent, Prism.languages[lang] || Prism.languages.markup, lang),
                          }}
                        />
                      </pre>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono transition-colors duration-300 break-words">
                {children}
              </code>
            );
          },

          p({ children }) {
            return (
              <p className="leading-relaxed text-black mr-2 text-sm sm:text-base mt-5 dark:text-gray-200 mb-2 sm:mb-3 break-words">
                {children}
              </p>
            );
          },

          strong({ children }) {
            return (
              <strong className="font-semibold text-sm sm:text-base">
                {children}
              </strong>
            );
          },

          em({ children }) {
            return (
              <em className="italic text-sm sm:text-base">
                {children}
              </em>
            );
          },

          a({ node, ...props }) {
             const handleClick = (e) => {
    e.preventDefault();
    if (typeof onLinkClick === "function") {
      onLinkClick(props.href);
    }
  };
            return (
              <a
                className="text-blue-600  dark:text-blue-400 underline break-all hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300 text-sm sm:text-base"
                href={props.href}
      onClick={handleClick}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            );
          },

          li({ children }) {
            return (
              <li className="ml-4 sm:ml-6 mr-2 md:mr-0 list-disc text-sm sm:text-base mb-1 break-words">
                {children}
              </li>
            );
          },

          ul({ children }) {
            return (
              <ul className="list-disc  mr-2 md:mr-0 ml-4 sm:ml-6 mb-3 sm:mb-4 space-y-1">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="list-decimal ml-4 sm:ml-6 mb-3 sm:mb-4 space-y-1">
                {children}
              </ol>
            );
          },

          h1({ children }) {
            return (
              <h1 className="text-xl sm:text-2xl  mr-2 md:mr-0 font-bold mb-3 sm:mb-4 text-black dark:text-white break-words">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="text-lg sm:text-xl  mr-2 md:mr-0 font-bold mb-2 sm:mb-3 text-black dark:text-white break-words">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="text-base sm:text-lg  mr-2 md:mr-0 font-bold mb-2 text-black dark:text-white break-words">
                {children}
              </h3>
            );
          },

          h4({ children }) {
            return (
              <h4 className="text-sm sm:text-base  mr-2 md:mr-0 font-bold mb-2 text-black dark:text-white break-words">
                {children}
              </h4>
            );
          },

          h5({ children }) {
            return (
              <h5 className="text-sm font-bold  mr-2 md:mr-0 mb-1 sm:mb-2 text-black dark:text-white break-words">
                {children}
              </h5>
            );
          },

          h6({ children }) {
            return (
              <h6 className="text-xs sm:text-sm  mr-2 md:mr-0 font-bold mb-1 sm:mb-2 text-black dark:text-white break-words">
                {children}
              </h6>
            );
          },

          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 sm:border-l-4  border-gray-400 dark:border-gray-600 pl-2 sm:pl-4 italic text-gray-700 dark:text-gray-300 my-3 sm:my-4 transition-colors duration-300 text-sm sm:text-base break-words">
                {children}
              </blockquote>
            );
          },

          table({ children }) {
            return (
              <div className="overflow-x-auto my-3 sm:my-4 w-full">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 text-xs sm:text-sm">
                    {children}
                  </table>
                </div>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left text-xs sm:text-sm break-words">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm break-words">
                {children}
              </td>
            );
          },

          hr({ children }) {
            return (
              <hr className="border-gray-300 dark:border-gray-600 my-4 sm:my-6" />
            );
          },

          img({ src, alt, ...props }) {
            return (
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-lg my-2 sm:my-4 mx-auto block"
                loading="lazy"
                {...props}
              />
            );
          },
        }}
      />
      
    </div>
  );
});

ChatbotMarkdown.displayName = 'ChatbotMarkdown';

export default ChatbotMarkdown;
