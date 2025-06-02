


import React, { useState, useEffect, useRef } from "react";
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

export default function ChatbotMarkdown({ content, messageId, isNewMessage = false }) {
  const [typedContent, setTypedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const typingIntervalRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  useEffect(() => {
    if (!content) return;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const shouldType = isNewMessage || (messageId && messageId !== lastMessageIdRef.current);
    if (shouldType) {
      lastMessageIdRef.current = messageId;
      setTypedContent("");
      setIsTyping(true);
      let i = 0;
      typingIntervalRef.current = setInterval(() => {
        i++;
        setTypedContent(content.slice(0, i));
        if (i >= content.length) {
          clearInterval(typingIntervalRef.current);
          setIsTyping(false);
        }
      }, 10);
    } else {
      setTypedContent(content);
      setIsTyping(false);
    }

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [content, messageId, isNewMessage]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="relative select-text" style={{ userSelect: "text", WebkitUserSelect: "text" }}>
      <ReactMarkdown
        children={typedContent}
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
                  <pre className="rounded-lg overflow-x-auto my-4 p-4 text-xs md:text-sm bg-gray-600 dark:bg-[#272822] text-black dark:text-white border border-gray-200 dark:border-none transition-colors duration-200 select-text">
                    <code
                      className={`language-${lang} select-text`}
                      style={{ userSelect: "text", WebkitUserSelect: "text" }}
                      dangerouslySetInnerHTML={{
                        __html: Prism.highlight(codeContent, Prism.languages[lang] || Prism.languages.markup, lang),
                      }}
                    />
                  </pre>
                  <button
                    onClick={() => handleCopyCode(codeContent)}
                    className="absolute top-2 right-2 z-10 p-1 rounded-md bg-gray-500 hover:bg-gray-600 text-white transition select-none"
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
              <code
                className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-300 px-1 py-0.5 rounded text-xs md:text-sm font-mono transition-colors duration-300 select-text"
                style={{ userSelect: "text", WebkitUserSelect: "text" }}
              >
                {children}
              </code>
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
            return <li className="ml-6 list-disc text-xs md:text-base select-text">{children}</li>;
          },

          p({ children }) {
            return (
              <p className="leading-relaxed text-black text-xs md:text-base dark:text-gray-200 select-text">
                {children}
                {isTyping && <span className="animate-pulse text-gray-500 ml-1">|</span>}
              </p>
            );
          },

          strong({ children }) {
            return <strong className="font-semibold text-xs md:text-base select-text">{children}</strong>;
          },

          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300 my-4 transition-colors duration-300 select-text">
                {children}
              </blockquote>
            );
          },

          sup({ children }) {
            return (
              <sup
                className="text-xs text-blue-600 dark:text-blue-300 underline cursor-help hover:text-blue-800 dark:hover:text-blue-400 transition-colors duration-300"
                title={Array.isArray(children) && children.length ? `Footnote: ${children[0]}` : ""}
              >
                {children}
              </sup>
            );
          },

          div({ node, ...props }) {
            if (node?.data?.hName === "div" && node?.data?.hProperties?.className?.includes("footnotes")) {
              return (
                <div
                  className="mt-6 border-t pt-4 text-xs leading-relaxed text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#1e1e1e] rounded-md px-4 py-2 transition-colors duration-300"
                  {...props}
                />
              );
            }
            return <div {...props} />;
          },
        }}
      />
    </div>
  );
}



// import React, { useState } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";
// import Prism from "prismjs";
// import { Copy, CheckCircle } from "lucide-react";
// import "prismjs/themes/prism-okaidia.css";
// import "prismjs/components/prism-javascript";
// import "prismjs/components/prism-python";
// import "prismjs/components/prism-json";
// import "prismjs/components/prism-markdown";

// export default function ChatbotMarkdown({ content }) {
//   const [copiedCode, setCopiedCode] = useState(null);

//   const handleCopy = (code, index) => {
//     navigator.clipboard.writeText(code);
//     setCopiedCode(index);
//     setTimeout(() => setCopiedCode(null), 1500);
//   };

//   return (
//     <div className="prose dark:prose-invert max-w-none select-text">
//       <ReactMarkdown
//         children={content}
//         remarkPlugins={[remarkGfm]}
//         rehypePlugins={[rehypeRaw]}
//         components={{
//           code({ node, inline, className, children, ...props }) {
//             const match = /language-(\w+)/.exec(className || "");
//             const lang = match?.[1];
//             const codeText = String(children).trim();
//             const codeIndex = props["data-index"] || Math.random();

//             if (!inline && lang) {
//               return (
//                 <div className="relative">
//                   <pre className="rounded-md my-4 p-4 text-sm overflow-x-auto bg-gray-900 text-white border border-gray-700">
//                     <code
//                       className={`language-${lang}`}
//                       dangerouslySetInnerHTML={{
//                         __html: Prism.highlight(codeText, Prism.languages[lang] || Prism.languages.markup, lang),
//                       }}
//                     />
//                   </pre>
//                   <button
//                     onClick={() => handleCopy(codeText, codeIndex)}
//                     className="absolute top-2 right-2 z-10 p-1 rounded-md bg-gray-600 hover:bg-gray-700 text-white flex items-center text-xs"
//                   >
//                     {copiedCode === codeIndex ? (
//                       <>
//                         <CheckCircle size={16} color="#4cd327" />
//                         <span className="ml-1">Copied</span>
//                       </>
//                     ) : (
//                       <>
//                         <Copy size={16} />
//                         <span className="ml-1">Copy</span>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               );
//             }

//             return (
//               <code className="select-text bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-300 px-1 py-0.5 rounded text-sm font-mono">
//                 {children}
//               </code>
//             );
//           },

//           p({ children }) {
//             return (
//               <p className="my-2 text-base leading-relaxed text-gray-900 dark:text-gray-200">
//                 {children}
//               </p>
//             );
//           },

//           a({ href, children }) {
//             return (
//               <a
//                 href={href}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
//               >
//                 {children}
//               </a>
//             );
//           },

//           li({ children }) {
//             return <li className="ml-6 list-disc text-base">{children}</li>;
//           },

//           blockquote({ children }) {
//             return (
//               <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300 my-4">
//                 {children}
//               </blockquote>
//             );
//           },
//         }}
//       />
//     </div>
//   );
// }






 



 
