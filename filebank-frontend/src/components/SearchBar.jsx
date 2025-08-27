import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import api from "../api/fileApi"; // your axios/fetch wrapper

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
      const res = await api.post("/chat", { query }); // returns array of {name, url}
      setAiResults(res.data || []);
    } catch (err) {
      console.error(err);
      setAiResults([{ name: "AI: Oops something went wrong. ", url: "#" }]);
    } finally {
      setLoading(false);
    }
  };


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
            className="absolute right-8 mt-2 w-75 bg-[whitesmoke] shadow-lg rounded-lg p-3 z-50"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setAiResults([]);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleAIQuery()}
              placeholder="Smart navigation..."
              className="w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              autoFocus
            />

            <ul className="mt-3 max-h-60 overflow-y-auto text-white">
              {filteredLinks.length > 0
                ? filteredLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        style={{ color: "#202124" }}
                        href={link.url}
                        className="block px-3 py-2 rounded-md hover:bg-blue-50 transition text-gray-400"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))
                : loading
                ? (
                    <li className="px-3 py-2 text-gray-500 flex items-center gap-2">
                      <Loader2 className="animate-spin w-4 h-4" /> Searching AI...
                    </li>
                  )
                : aiResults.length > 0
                ? aiResults.map((link) => (
                    <li key={link.url}>
                      <a
                        style={{ color: "#202124" }}
                        href={link.url}
                        className="block px-8 py-2 rounded-md hover:bg-blue-50 transition text-gray-400"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))
                : (
                    <li className="px-3 py-2 text-gray-500 text-sm flex items-center gap-3">
                      No results for <strong>{query}</strong>{" "}
                      <button
                        onClick={handleAIQuery}
                        style={{color:'royalblue'}} 
                        className="ml-2 text-blue-500 hover:underline "
                      >
                        Go smart
                      </button>
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

