// src/components/SearchBar.jsx
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import api from "../api/fileApi";

const links = [
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about-us" },
  { name: "Files", url: "/files" },
  { name: "AI Assistant", url: "/full-screen-ai" },
  { name: "Change Plan", url: "/change-plan" },
  { name: "Blog", url: "/blog" },
  { name: "Dashboard", url: "/dashboard" },
  { name: "Login", url: "/login" },
  { name: "Register", url: "/register" },
  { name: "Profile", url: "/profile" },
  { name: "Settings", url: "/settings" },
  { name: "Support", url: "/support" },
  { name: "FAQ", url: "/faq" },
  { name: "Terms & Conditions", url: "/terms" },
  { name: "Privacy Policy", url: "/privacy" },
];

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const filteredLinks = useMemo(
    () =>
      links.filter((link) =>
        link.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const handleAIQuery = async () => {
    if (!query) return;
    setLoading(true);
    setAiResults([]);
    try {
      const res = await api.post("/chat/askme", { query });
      // Ensure consistent structure
      const results = Array.isArray(res.data)
        ? res.data
        : [{ title: "Invalid AI response", link: "#" }];
      setAiResults(results);
    } catch (err) {
      console.error(err);
      setAiResults([{ title: "AI: Oops something went wrong.", link: "#" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filteredLinks.length === 0 && query.length > 2) {
      const timer = setTimeout(handleAIQuery, 500);
      return () => clearTimeout(timer);
    } else {
      setAiResults([]);
    }
  }, [query, filteredLinks]);

  return (
    <div className="search absolute right-[25%]">
      {/* Toggle icon */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-white/10 transition"
        aria-label="Toggle search"
      >
        {open ? (
          <X
            style={{
              fontSize: 20,
              color: "#FF0000",
              background: "white",
              borderRadius: "50px",
            }}
          />
        ) : (
          <Search style={{ fontSize: 30, color: "#9CA3AF" }} />
        )}
      </button>

      {/* Search dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-1 mt-2 w-96 bg-white shadow-lg rounded-lg p-3 z-50"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAIQuery()}
              placeholder="Smart navigation..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              autoFocus
            />

            <ul className="mt-3 max-h-60 overflow-y-auto">
              {loading ? (
                <li className="px-3 py-2 text-gray-500 flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" /> Searching...
                </li>
              ) : filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      className="block px-3 py-2 rounded-md hover:bg-gray-100 transition text-gray-800"
                    >
                      {link.name}
                    </a>
                  </li>
                ))
              ) : aiResults.length > 0 ? (
                <>
                  {aiResults.map((item, idx) => (
                    <li key={idx}>
                      <a
                        href={item.link}
                        target={
                          item.link?.startsWith("http") ? "_blank" : "_self"
                        }
                        rel={
                          item.link?.startsWith("http")
                            ? "noopener noreferrer"
                            : ""
                        }
                        className="block px-3 py-2 rounded-md hover:bg-gray-100 transition text-gray-800"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}

                  {/* Debugging: Raw JSON */}
                  <li className="mt-4">
                    <h4 className="text-xs text-gray-500 mb-1">
                      AI JSON Response:
                    </h4>
                    <SyntaxHighlighter
                      language="json"
                      style={atomDark}
                      wrapLongLines
                      customStyle={{ borderRadius: "8px", fontSize: "12px" }}
                    >
                      {JSON.stringify(aiResults, null, 2)}
                    </SyntaxHighlighter>
                  </li>
                </>
              ) : (
                <li className="px-3 py-2 text-gray-500 text-sm">
                  No results for <strong>{query}</strong>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;

