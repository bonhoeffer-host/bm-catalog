import fs from "fs";
import path from "path";
import dynamic from "next/dynamic";

export default async function CatalogViewer({ params, searchParams }) {
  const { slug } = await params;
  // Read catalog metadata
  const dataPath = path.join(process.cwd(), "data", "data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const catalog = data.catalog.find((c) => c.slug === slug);

  if (!catalog) {
    return <div className="p-8 text-center">Catalog not found.</div>;
  }

  // Read images from public/pages/[slug]
  const imagesDir = path.join(process.cwd(), "public", "pages", slug);
  let images = [];
  try {
    images = fs
      .readdirSync(imagesDir)
      .filter((f) => f.endsWith(".webp"))
      .sort((a, b) => {
        // Sort by page number
        const getNum = (name) => parseInt(name.split("-")[1]);
        return getNum(a) - getNum(b);
      });
  } catch (e) {
    images = [];
  }

  // Pass data to client component
  const Viewer = dynamic(() => import("./ViewerClient"), { ssr: true });
  return <Viewer catalog={catalog} images={images} searchParams={searchParams} />;
} 