import React from "react";
import { useState } from "react";
import { MessageSquare , MoreVertical} from "lucide-react";

const ChatItem = ({ chat, selectedChat, handleChatSelect, handleDeleteChat, handleRenameChat }) => {
    const [openMenu, setOpenMenu] = useState(null);
  
    return (
      <div
        key={chat.id}
        onClick={() => handleChatSelect(chat.id)}
        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between ${
          selectedChat === chat.id
            ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            : "hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <MessageSquare size={16} />
          <span className="truncate text-sm">{chat.message || "Untitled Chat"}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === chat.id ? null : chat.id);
            }}
            className="opacity-60 hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <MoreVertical size={16} />
          </button>
  
          {openMenu === chat.id && (
            <div className="absolute right-6 -top-3 w-24 bg-white dark:bg-gray-900 shadow-md rounded-lg py-1 text-xs">
              <button
                className="block w-full text-left px-3 hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(e, chat.id);
                  setOpenMenu(null);
                }}
              >
                Delete
              </button>
              <button
                className="block w-full text-left px-3 py-1 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRenameChat(chat.id);
                  setOpenMenu(null);
                }}
              >
                Rename
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default ChatItem;