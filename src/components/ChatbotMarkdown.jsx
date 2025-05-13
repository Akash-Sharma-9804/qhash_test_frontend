// // ChatbotMarkdown.jsx
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import remarkFootnotes from "remark-footnotes";
// import rehypeRaw from "rehype-raw"; // Optional: Use rehype-sanitize for safety
// import Prism from "prismjs";
// import "prismjs/themes/prism-okaidia.css"; // Dark theme

// // Load common languages
// import "prismjs/components/prism-javascript";
// import "prismjs/components/prism-python";
// import "prismjs/components/prism-json";
// import "prismjs/components/prism-markdown";

// export default function ChatbotMarkdown({ content }) {
//   return (
//     <ReactMarkdown
//       children={content}
//       remarkPlugins={[remarkGfm, remarkFootnotes]}
//       rehypePlugins={[rehypeRaw]}
//       components={{
//         code({ inline, className, children }) {
//           const match = /language-(\w+)/.exec(className || "");
//           const lang = match?.[1];

//           return !inline && lang ? (
//             <pre className="rounded-lg overflow-x-auto my-2 p-4 text-sm bg-gray-100 dark:bg-[#272822] text-black dark:text-white">
//               <code
//                 className={`language-${lang}`}
//                 dangerouslySetInnerHTML={{
//                   __html: Prism.highlight(
//                     String(children).trim(),
//                     Prism.languages[lang] || Prism.languages.markup,
//                     lang
//                   ),
//                 }}
//               />
//             </pre>
//           ) : (
//             <code className="bg-gray-200 dark:bg-gray-700 dark:text-white px-1 py-0.5 rounded text-sm">
//               {children}
//             </code>
//           );
//         },

//         a({ node, ...props }) {
//           return (
//             <a
//               className="text-blue-600 dark:text-blue-400 underline break-all"
//               target="_blank"
//               rel="noopener noreferrer"
//               {...props}
//             />
//           );
//         },

//         li({ children }) {
//           return <li className="ml-4 list-disc">{children}</li>;
//         },

//         p({ children }) {
//           return <p className="mb-2 leading-relaxed">{children}</p>;
//         },

//         strong({ children }) {
//           return <strong className="font-semibold">{children}</strong>;
//         },

//         blockquote({ children }) {
//           return (
//             <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300 my-2">
//               {children}
//             </blockquote>
//           );
//         },

//         sup({ children }) {
//           return (
//             <sup className="text-xs cursor-help text-blue-500 dark:text-blue-300" title={children?.[0]}>
//               ⓘ
//             </sup>
//           );
//         },

//         // Footnote section at bottom
//         div({ node, ...props }) {
//           if (
//             node?.data?.hName === "div" &&
//             node?.data?.hProperties?.className?.includes("footnotes")
//           ) {
//             return (
//               <div className="mt-4 border-t pt-2 text-xs text-gray-500 dark:text-gray-400" {...props} />
//             );
//           }
//           return <div {...props} />;
//         },
//       }}
//     />
//   );
// }


// ChatbotMarkdown.jsx
// import React, { useEffect, useState } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import rehypeRaw from "rehype-raw";
// import Prism from "prismjs";
// import "prismjs/themes/prism-okaidia.css";

// import "prismjs/components/prism-javascript";
// import "prismjs/components/prism-python";
// import "prismjs/components/prism-json";
// import "prismjs/components/prism-markdown";

// export default function ChatbotMarkdown({ content }) {
//   const [remarkFootnotes, setRemarkFootnotes] = useState(null);

//   useEffect(() => {
//     import("remark-footnotes").then((mod) => {
//       setRemarkFootnotes(() => mod.default || mod);
//     });
//   }, []);

//   if (!remarkFootnotes) return null; // Or add a loader/spinner here

//   return (
//     <ReactMarkdown
//       children={content}
//       remarkPlugins={[remarkGfm, remarkFootnotes]}
//       rehypePlugins={[rehypeRaw]}
//       components={{
//         code({ inline, className, children }) {
//           const match = /language-(\w+)/.exec(className || "");
//           const lang = match?.[1];
//           return !inline && lang ? (
//             <pre className="rounded-lg overflow-x-auto my-2 p-4 text-sm bg-gray-100 dark:bg-[#272822] text-black dark:text-white">
//               <code
//                 className={`language-${lang}`}
//                 dangerouslySetInnerHTML={{
//                   __html: Prism.highlight(
//                     String(children).trim(),
//                     Prism.languages[lang] || Prism.languages.markup,
//                     lang
//                   ),
//                 }}
//               />
//             </pre>
//           ) : (
//             <code className="bg-gray-200 dark:bg-gray-700 dark:text-white px-1 py-0.5 rounded text-sm">
//               {children}
//             </code>
//           );
//         },
//         a({ node, ...props }) {
//           return (
//             <a
//               className="text-blue-600 dark:text-blue-400 underline break-all"
//               target="_blank"
//               rel="noopener noreferrer"
//               {...props}
//             />
//           );
//         },
//         li({ children }) {
//           return <li className="ml-4 list-disc">{children}</li>;
//         },
//         p({ children }) {
//           return <p className="mb-2 leading-relaxed">{children}</p>;
//         },
//         strong({ children }) {
//           return <strong className="font-semibold">{children}</strong>;
//         },
//         blockquote({ children }) {
//           return (
//             <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300 my-2">
//               {children}
//             </blockquote>
//           );
//         },
//         sup({ children }) {
//           return (
//             <sup
//               className="text-xs cursor-help text-blue-500 dark:text-blue-300"
//               title={children?.[0]}
//             >
//               ⓘ
//             </sup>
//           );
//         },
//         div({ node, ...props }) {
//           if (
//             node?.data?.hName === "div" &&
//             node?.data?.hProperties?.className?.includes("footnotes")
//           ) {
//             return (
//               <div
//                 className="mt-4 border-t pt-2 text-xs text-gray-500 dark:text-gray-400"
//                 {...props}
//               />
//             );
//           }
//           return <div {...props} />;
//         },
//       }}
//     />
//   );
// }



import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css"; // You can remove this if only using Tailwind

// Load syntax languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";

export default function ChatbotMarkdown({ content }) {
  const [remarkFootnotes, setRemarkFootnotes] = useState(null);

  useEffect(() => {
    import("remark-footnotes").then((mod) => {
      setRemarkFootnotes(() => mod.default || mod);
    });
  }, []);

  if (!remarkFootnotes) return null;

  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm, remarkFootnotes]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ inline, className, children }) {
          const match = /language-(\w+)/.exec(className || "");
          const lang = match?.[1];

          if (!inline && lang) {
            return (
              <pre className="rounded-lg overflow-x-auto my-4 p-4 text-xs md:text-sm bg-gray-600 dark:bg-[#272822] text-black dark:text-white border border-gray-200 dark:border-none transition-colors duration-200">
                <code
                  className={`language-${lang}`}
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(
                      String(children).trim(),
                      Prism.languages[lang] || Prism.languages.markup,
                      lang
                    ),
                  }}
                />
              </pre>
            );
          }

          return (
            <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-300 px-1 py-0.5 rounded text-xs md:text-sm font-mono transition-colors duration-300">
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
          return <li className="ml-6 list-disc text-xs md:text-base">{children}</li>;
        },

        p({ children }) {
          return <p className="  leading-relaxed text-black text-xs md:text-base dark:text-gray-200">{children}</p>;
        },

        strong({ children }) {
          return <strong className="font-semibold text-xs md:text-base">{children}</strong>;
        },

        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300 my-4 transition-colors duration-300">
              {children}
            </blockquote>
          );
        },

        sup({ children }) {
          return (
            <sup
              className="text-xs text-blue-600 dark:text-blue-300 underline cursor-help hover:text-blue-800 dark:hover:text-blue-400 transition-colors duration-300"
              title={`Footnote: ${children?.[0]}`}
            >
              {children}
            </sup>
          );
        },

        div({ node, ...props }) {
          if (
            node?.data?.hName === "div" &&
            node?.data?.hProperties?.className?.includes("footnotes")
          ) {
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
  );
}
