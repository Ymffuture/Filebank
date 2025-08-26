import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

const links = [
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about" },
  { name: "Services", url: "/services" },
  { name: "Pricing", url: "/pricing" },
  { name: "Contact", url: "/contact" },
  { name: "Blog", url: "/blog" },
  { name: "Dashboard", url: "/dashboard" },
];

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredLinks = useMemo(() => {
    return links.filter((link) =>
      link.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="relative">
      {/* Search Icon */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-full hover:bg-gray-200 transition"
      >
        {open ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </button>

      {/* AnimatePresence for smooth mount/unmount */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg p-4 z-50"
          >
            {/* Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search links..."
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            {/* Results */}
            <ul className="mt-3 max-h-60 overflow-y-auto">
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      className="block px-3 py-2 rounded-md hover:bg-blue-50 transition"
                    >
                      {link.name}
                    </a>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-sm mt-2">
                  No results for <strong>{query}</strong>
                </p>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
      <ul className="mt-6 w-full max-w-md space-y-2">
        {filteredLinks.length > 0 ? (
          filteredLinks.map((link) => (
            <li key={link.url}>
              <a
                href={link.url}
                className="block p-3 bg-white rounded-lg shadow hover:bg-blue-50 transition"
              >
                {link.name}
              </a>
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-4">
            No results found for <strong>{query}</strong>
          </p>
        )}
      </ul>
    </div>
  );
}

