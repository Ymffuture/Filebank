// src/components/SearchBar.jsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons"; // ✅ Ant Design Icons

const links = [
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about" },
  { name: "Files", url: "/services" },
  { name: "AI assistant", url: "/full-screen-ai" },
  { name: "Contact", url: "/change-plan" },
  { name: "Blog", url: "/blog" },
  { name: "Dashboard", url: "/dashboard" },
];

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredLinks = useMemo(
    () =>
      links.filter((link) =>
        link.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <div className="search">
      {/* Toggle icon */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-white/10 transition"
        aria-label="Toggle search"
      >
        {open ? (
          <CloseOutlined style={{ fontSize: 20, color: "#fff" }} />
        ) : (
          <SearchOutlined style={{ fontSize: 20, color: "#fff" }} />
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
            className="absolute right-0 mt-2 w-72 bg-[#202124] rounded-lg p-4 z-50"
          >
            {/* Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search links..."
              className="w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            {/* Results */}
            <ul className="mt-3 max-h-60 overflow-y-auto">
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      className="block px-8 py-2 rounded-md hover:bg-blue-50 transition"
                    >
                      {link.name}
                    </a>
                  </li>
                ))
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
