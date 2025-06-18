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

//     const setPendingUrl = (url) => {
//       if (onLinkClick) {
//         onLinkClick(url);
//       }
//     };

//     const setModalOpen = (state) => {
//       // This will be handled by parent component
//     };

//     // Function to extract formatted text from the rendered DOM
//     const getFormattedText = () => {
//       return containerRef.current?.innerText || content;
//     };

//     // Expose the function to parent component
//     useImperativeHandle(ref, () => ({
//       getFormattedText,
//     }));

//     return (
//       <div ref={containerRef}>
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
//                     <div className="relative w-full my-3 sm:my-4 group">
//                       <div className="relative rounded-lg mr-3 md:mr-0 overflow-hidden bg-gray-600 dark:bg-[#272822] border border-gray-200 dark:border-gray-600">
//                         <div className="flex items-center justify-between px-3 py-2 bg-gray-700 dark:bg-gray-800 border-b border-gray-500 dark:border-gray-600">
//                           <span className="text-xs text-gray-300 font-medium uppercase">
//                             {lang}
//                           </span>
//                           <button
//                             onClick={() => {
//                               navigator.clipboard.writeText(codeContent);
//                               setCopied(true);
//                               setTimeout(() => setCopied(false), 1000);
//                             }}
//                             className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-gray-600 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-colors duration-200">
//                             {copied ? (
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
//                 // Inline code - completely normal, no interference
//                 return (
//                   <code
//                     className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded text-xs sm:text-base font-poppins"
//                     {...props}>
//                     {children}
//                   </code>
//                 );
//               },
//               // Add paragraph component for better spacing
             


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
//                   <strong className="font-bold text-base  ">
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

import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CheckCircle, Copy } from "lucide-react";

const ChatbotMarkdown = forwardRef(
  ({ content, onLinkClick, onCopyClick, messageId }, ref) => {
    const [copied, setCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
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
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1000);
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

    return (
      <div ref={containerRef}>
        <style>
          {`
            .code-selectable pre,
            .code-selectable code {
              user-select: text !important;
              -webkit-user-select: text !important;
              -moz-user-select: text !important;
              -ms-user-select: text !important;
            }
          `}
        </style>
        
        <div className="w-full mr-1 font-poppins relative code-selectable">
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

          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const lang = match?.[1];
                const codeContent = String(children).replace(/\n$/, "");
                
                if (!inline && match) {
                  return (
                    <div className="relative w-full my-3 sm:my-4 group">
                      <div className="relative rounded-lg mr-3 md:mr-0 overflow-hidden bg-gray-600 dark:bg-[#272822] border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-700 dark:bg-gray-800 border-b border-gray-500 dark:border-gray-600">
                          <span className="text-xs text-gray-300 font-medium uppercase">
                            {lang}
                          </span>
                          <button
                            onClick={() => handleCopyCodeBlock(codeContent)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs bg-gray-600 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 text-white transition-colors duration-200">
                            {codeCopied ? (
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

                        <div className="overflow-x-auto">
                          <pre className="p-3 sm:p-4 text-xs sm:text-base text-white m-0 min-w-0">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return (
                  <code
                    className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded text-xs sm:text-base font-poppins"
                    {...props}>
                    {children}
                  </code>
                );
              },

              a({ href, children, ...props }) {
                return (
                  <a
                    className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-300"
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
              
              strong({ children }) {
                return (
                  <strong className="font-bold text-base">
                    {children}
                  </strong>
                );
              },
            }}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }
);

ChatbotMarkdown.displayName = "ChatbotMarkdown";
export default ChatbotMarkdown;

