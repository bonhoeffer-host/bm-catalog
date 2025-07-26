"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [catalogs, setCatalogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    async function fetchCatalogs() {
      const res = await fetch("/api/catalogs");
      const data = await res.json();
      setCatalogs(data.catalog);
      setFiltered(data.catalog);
    }
    fetchCatalogs();
  }, []);

  useEffect(() => {
    setFiltered(
      catalogs.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, catalogs]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Catalog Viewer</h1>
      <input
        className="border rounded px-4 py-2 mb-8 w-full max-w-md text-lg"
        placeholder="Search catalogs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-500">No catalogs found.</div>
        )}
        {filtered.map((cat) => (
          <div key={cat.id} className="bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center">
            <img
              src={`/pages/${cat.slug}/${cat.slug}-1_1.webp`}
              alt={cat.title}
              className="w-40 h-56 object-cover rounded mb-4 border"
              loading="lazy"
            />
            <div className="font-semibold text-lg mb-2 text-center">{cat.title}</div>
            <a
              href={`/catalog/${cat.slug}`}
              className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              View
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
