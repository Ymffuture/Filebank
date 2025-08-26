import React, { useState, useMemo } from "react";

const links = [
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about" },
  { name: "Services", url: "/services" },
  { name: "Pricing", url: "/pricing" },
  { name: "Contact", url: "/contact" },
  { name: "Blog", url: "/blog" },
  { name: "Dashboard", url: "/dashboard" },
];

export default function SearchLinks() {
  const [query, setQuery] = useState("");

  // Filter links based on search
  const filteredLinks = useMemo(() => {
    return links.filter((link) =>
      link.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">🔎 Live Search Links</h1>

      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search links..."
        className="w-full max-w-md p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Results */}
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

