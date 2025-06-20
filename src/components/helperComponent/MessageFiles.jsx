// import { useState } from "react";
// import FilePreviewModal from "./FilePreviewModal";
// import { File } from "lucide-react";
// import "./MessageFiles.css";
// import FileActionModal from "./FileActionModal";

// export default function MessageFiles({ files }) {
//   const [previewImage, setPreviewImage] = useState(null);

//   const getFileIcon = (fileType) => {
//     if (/^pdf$/i.test(fileType)) return "./icons/pdf.png";
//     if (/^(doc|docx)$/i.test(fileType)) return "./icons/doc-file.png";
//     if (/^(xls|xlsx)$/i.test(fileType)) return "./icons/excel-logo.png";
//     if (/^txt$/i.test(fileType)) return "./icons/file.png";
//     return <File className="w-8 h-8 text-white" />;
//   };

//   return (
//     <>
//       {previewImage && (
//         <FilePreviewModal
//           fileUrl={previewImage}
//           onClose={() => setPreviewImage(null)}
//         />
//       )}

//       <div className="flex flex-wrap gap-2 mt-2 justify-end max-w-2xl ml-auto">
//         {files.map((file, i) => {
//           const fileUrl = file.file_path || file.url;
//           // console.log("file path", fileUrl);
//           const fileName = file.file_name || file.name;
//           const fileType =
//             file.type ||
//             (fileName?.includes(".")
//               ? fileName.split(".").pop().toLowerCase()
//               : null);

//           // Show a loading skeleton if data isn't ready
//           if (!fileType || !fileUrl) {
//             return (
//               // <div
//               //   key={i}
//               //   className="w-[180px] h-[180px] bg-gray-300 dark:bg-gray-700 animate-pulse rounded-md"
//               // />
//               <div
//               key={i}
//               className="w-[180px] h-[100px] flex flex-col items-center justify-center animate-pulse   bg-gray-500 dark:bg-gray-500 rounded-md shadow-inner">
             
//               <div className="flex text-base font-bold gap-2 mt-2 font-centurygothic">
//                <span className="text-black ">Reading file</span>   <div className="loader2"></div>
//               </div>
//               <div className="loader"></div>
//             </div>
//             );
//           }

//           const isImage = /^(jpg|jpeg|png|gif|webp)$/i.test(fileType);

//           return (
//             <div key={i} className="relative group w-[180px]">
//               {isImage ? (
//                 <div
//                   onClick={() => setPreviewImage(fileUrl)}
//                   className="cursor-pointer">
//                   <img
//                     src={fileUrl}
//                     alt={fileName}
//                     className="rounded-md max-w-[180px] max-h-[180px] object-cover border shadow-md transition-transform group-hover:scale-105"
//                   />
//                   <div
//                     className="text-sm mt-1 font-medium truncate text-center"
//                     title={fileName}>
//                     {fileName}
//                   </div>
//                   <div className="text-xs text-center opacity-70">
//                     {fileType.toUpperCase()}
//                   </div>
//                 </div>
//               ) : (
//                 <a
//                   href={fileUrl}
//                   download={fileName}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="block bg-blue-600 dark:bg-indigo-700 text-white px-3 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all">
//                   <div className="flex items-center gap-2 truncate">
//                     <img
//                       src={getFileIcon(fileType)}
//                       alt={`${fileType} icon`}
//                       className="w-8 h-8"
//                     />
//                     <span
//                       className="text-sm font-medium truncate"
//                       title={fileName}>
//                       {fileName}
//                     </span>
//                   </div>
//                   <div className="text-xs opacity-80 mt-1">
//                     {fileType.toUpperCase()}
//                   </div>
//                 </a>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </>
//   );
// }

import { useState } from "react";
import FilePreviewModal from "./FilePreviewModal";
import FileActionModal from "./FileActionModal";
import { File } from "lucide-react";
import "./MessageFiles.css";

export default function MessageFiles({ files }) {
  const [previewImage, setPreviewImage] = useState(null);
  const [fileActionModal, setFileActionModal] = useState({ open: false, file: null });

  const getFileIcon = (fileType) => {
    if (/^pdf$/i.test(fileType)) return "./icons/pdf.png";
    if (/^(doc|docx)$/i.test(fileType)) return "./icons/doc-file.png";
    if (/^(xls|xlsx)$/i.test(fileType)) return "./icons/excel-logo.png";
    if (/^txt$/i.test(fileType)) return "./icons/file.png";
    return <File className="w-8 h-8 text-white" />;
  };

  const handleFileClick = (file, fileUrl, fileName, fileType) => {
    const isImage = /^(jpg|jpeg|png|gif|webp)$/i.test(fileType);
    
    if (isImage) {
      // For images, show preview modal directly
      setPreviewImage(fileUrl);
    } else {
      // For other files, show action modal
      setFileActionModal({
        open: true,
        file: {
          url: fileUrl,
          name: fileName,
          type: fileType
        }
      });
    }
  };

  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFileActionModal({ open: false, file: null });
  };

  const handleOpenNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setFileActionModal({ open: false, file: null });
  };

  const handleCloseModal = () => {
    setFileActionModal({ open: false, file: null });
  };

  return (
    <>
      {previewImage && (
        <FilePreviewModal
          fileUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      <FileActionModal
        open={fileActionModal.open}
        file={fileActionModal.file}
        onDownload={handleDownload}
        onOpenNewTab={handleOpenNewTab}
        onCancel={handleCloseModal}
      />

      <div className="flex flex-wrap gap-2 mt-2 justify-end max-w-2xl ml-auto">
        {files.map((file, i) => {
          const fileUrl = file.file_path || file.url;
          const fileName = file.file_name || file.name;
          const fileType =
            file.type ||
            (fileName?.includes(".")
              ? fileName.split(".").pop().toLowerCase()
              : null);

          // Show a loading skeleton if data isn't ready
          if (!fileType || !fileUrl) {
            return (
              <div
                key={i}
                className="w-[180px] h-[100px] flex flex-col items-center justify-center animate-pulse bg-gray-500 dark:bg-gray-500 rounded-md shadow-inner">
                <div className="flex text-base font-bold gap-2 mt-2 font-centurygothic">
                  <span className="text-black">Reading file</span>
                  <div className="loader2"></div>
                </div>
                <div className="loader"></div>
              </div>
            );
          }

          const isImage = /^(jpg|jpeg|png|gif|webp)$/i.test(fileType);

          return (
            <div key={i} className="relative group w-[180px]">
              {isImage ? (
                <div
                  onClick={() => handleFileClick(file, fileUrl, fileName, fileType)}
                  className="cursor-pointer">
                  <img
                    src={fileUrl}
                    alt={fileName}
                    className="rounded-md max-w-[180px] max-h-[180px] object-cover border shadow-md transition-transform group-hover:scale-105"
                  />
                  <div
                    className="text-sm mt-1 font-medium truncate text-center"
                    title={fileName}>
                    {fileName}
                  </div>
                  <div className="text-xs text-center opacity-70">
                    {fileType.toUpperCase()}
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => handleFileClick(file, fileUrl, fileName, fileType)}
                  className="cursor-pointer block bg-blue-600 dark:bg-indigo-700 text-white px-3 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={getFileIcon(fileType)}
                      alt={`${fileType} icon`}
                      className="w-8 h-8"
                    />
                    <span
                      className="text-sm font-medium truncate"
                      title={fileName}>
                      {fileName}
                    </span>
                  </div>
                  <div className="text-xs opacity-80 mt-1">
                    {fileType.toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
