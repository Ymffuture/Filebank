// src/components/SearchBar.jsx
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import api from '../api/apiFile';
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

  // 🔹 Call AI only if no results
  useEffect(() => {
    const fetchAI = async () => {
      if (query && filteredLinks.length === 0) {
        setLoading(true);
        try {
          // Replace with your backend or AI API call
          const res = await api.get(`/api?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setAiResults(data.results || []);
        } catch (err) {
          console.error("AI search failed:", err);
          setAiResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setAiResults([]);
      }
    };

    const delayDebounce = setTimeout(fetchAI, 600); // debounce
    return () => clearTimeout(delayDebounce);
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
            className="absolute right-0 mt-2 w-70 bg-[whitesmoke] shadow rounded-lg p-3 z-50"
          >
            {/* Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Smart navigation... "
              className="w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 p-2"
              autoFocus
            />

            {/* Results */}
            <ul className="mt-3 max-h-60 overflow-y-auto">
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      style={{ color: "#202124" }}
                      href={link.url}
                      className="block px-8 py-2 rounded-md hover:bg-blue-50 transition text-gray-700"
                    >
                      {link.name}
                    </a>
                  </li>
                ))
              ) : loading ? (
                <li className="px-3 py-2 text-gray-500 text-sm">Searching AI...</li>
              ) : aiResults.length > 0 ? (
                <>
                  <li className="px-3 py-2 text-xs text-gray-400">AI Suggestions:</li>
                  {aiResults.map((item, idx) => (
                    <li key={idx}>
                      <a
                        style={{ color: "#202124" }}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-8 py-2 rounded-md hover:bg-green-50 transition text-gray-700"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
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

