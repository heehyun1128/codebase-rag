"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import ReactMarkdown from "react-markdown";

type Message = {
  role: string;
  content: string;
};

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [noInputErr, setNoInputErr] = useState<boolean>(false);
  const [codebaseURL, setCodebaseURL] = useState<string>("");
  useEffect(() => {
    const storedChats = localStorage.getItem("chatHistory");

    if (storedChats) {
      const parsed = JSON.parse(storedChats);
      if (Array.isArray(parsed)) {
        setMessages(parsed);
      }
    } else {
      setMessages([]);
    }
  }, []);
  const searching = async (): Promise<void> => {
    try {
      // error handling
      if (!searchTerm) {
        setNoInputErr(true);
        return;
      } else {
        setNoInputErr(false);
      }

      // update message history
      setMessages((messages: Message[]) => {
        const updatedMessages = [
          ...messages,
          { role: "user", content: searchTerm },
        ];
        localStorage.setItem("chatHistory", JSON.stringify(updatedMessages));
        return updatedMessages;
      });
      setLoading(true);
      setSearchTerm("");

      // call backend api for AI-generated responses
      const res = await axios.post(
        `http://127.0.0.1:5000/api/data/ai-response`,
        {
          userPrompt: searchTerm,
          repo_url: codebaseURL,
          
        }
      );
      console.log(res.data);
      // update message history
      setMessages((messages: Message[]) => {
        const updatedMessages = [
          ...messages,
          { role: "assistant", content: res.data },
        ];
        localStorage.setItem("chatHistory", JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error fetching data from the server:", error);
    } finally {
      console.log("JSON.stringify(messages)", JSON.stringify(messages));

      setLoading(false);
    }
  };

  const handleCloneRepo = async (): Promise<void> => {
    try {
      const res = await axios.post(`http://127.0.0.1:5000/api/data/clone-repo`, {
        codebaseURL: codebaseURL,
      });
      console.log(res.data);
    } catch (error) {
      console.error("Error cloning repository:", error);
    }
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center relative z-10 ">
      {!searchTerm && noInputErr && (
        // alert message when search input is empty
        <div
          id="alert-2"
          className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
          role="alert"
        >
          <svg
            className="flex-shrink-0 w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div className="ms-3 text-sm font-medium">
            Search input cannot be empty!
          </div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
            data-dismiss-target="#alert-2"
            aria-label="Close"
            onClick={() => setNoInputErr(false)}
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      )}
      <div className="flex flex-col justify-center items-start">
        <p className="text-sm font-bold text-gray-500 mb-2">
          Add a codebase URL here (github repo)
        </p>
        <div className="flex  justify-center items-start">
          <input
            type="text"
            onChange={(e) => setCodebaseURL(e.target.value)}
            placeholder="Enter codebase URL"
            className="border border-[#56875a] border-opacity-20 rounded-md p-2 w-[70vw]"
          />
          <button
            onClick={handleCloneRepo}
            className="bg-[#56875a] text-white py-2 px-4 rounded-md ml-4"
          >
            Add Codebase
          </button>
        </div>
      </div>
      {messages.length ? (
        <div className=" flex justify-center">
          <div className="w-[80vw] flex justify-end">
            {/* <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-[#56875a] text-white py-2 px-4 rounded-md ml-4"
              onClick={() => {
                localStorage.clear();
                setMessages([]);
              }}
            >
              Start New Chat
            </motion.button> */}
          </div>
        </div>
      ) : (
        <></>
      )}

      <div className="overflow-y-auto border border-[#56875a] border-opacity-20 h-[68vh] mt-4 shadow p-8 rounded-xl flex flex-col ">
        <AnimatePresence>
          {messages?.map((chat, index) => (
            <motion.div
              key={index}
              className={`my-2 flex ${
                chat?.role === "user" ? "justify-end" : "justify-start"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div>
                {chat?.role === "user" ? (
                  <div
                    className={`items-center p-3 rounded-2xl shadow-md ml-36 min-w-[50px] bg-[#56875a] text-white`} // Simplified class assignment
                  >
                    {chat?.content}
                  </div>
                ) : (
                  <>
                    <div className=" flex justify-start items-start max-w-[80%]">
                      <div>
                        <i className="fa-solid fa-compass text-[#56875a] mr-2 fa-2xl"></i>
                      </div>
                      <ReactMarkdown className="prose prose-sm max-w-none overflow-hidden text-left ml-2">
                        {chat?.content}
                      </ReactMarkdown>
                    </div>
                    <div className="border-b border-[#56875a] border-opacity-50 border-dotted w-full mt-6 mb-6"></div>
                  </>
                )}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            searching...
          </motion.div>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className=" flex justify-center mt-4 "
      >
        <div className="relative w-[80vw] ">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            required
            placeholder="Search for something..."
            className="w-full h-[60px] py-3 px-4 pr-12 rounded-md border bg-[#609a65] bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={searching}
            className="bg-[#56875a] text-white p-2 absolute right-1 top-1/2 transform -translate-y-1/2 rounded-md"
          >
            send
          </button>
        </div>
      </motion.div>
    </main>
  );
};

export default Search;
