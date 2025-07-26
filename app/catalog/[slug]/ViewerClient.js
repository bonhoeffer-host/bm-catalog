"use client";
import { useState, useRef, useEffect } from "react";
import { MdZoomIn, MdZoomOut, MdFullscreen, MdFullscreenExit, MdPrint, MdDownload, MdShare, MdChevronLeft, MdChevronRight, MdGridView, MdClose, MdContentCopy } from "react-icons/md";
import { FaWhatsapp, FaXTwitter, FaFacebook, FaLinkedin, FaEnvelope } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import HTMLFlipBook from "react-pageflip";

function isMobile() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 640;
}

export default function ViewerClient({ catalog, images, searchParams }) {
  const totalPages = images.length;
  const initialPage = parseInt(searchParams?.page) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showThumbs, setShowThumbs] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCurrent, setShareCurrent] = useState(false);
  const [copied, setCopied] = useState(false);
  const bookRef = useRef();
  const containerRef = useRef();
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 640;

  // Handle ?page=X in URL
  useEffect(() => {
    if (shareCurrent) {
      const url = new URL(window.location.href);
      url.searchParams.set("page", currentPage);
      window.history.replaceState({}, "", url.toString());
    }
  }, [currentPage, shareCurrent]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // Fullscreen API
  useEffect(() => {
    if (!containerRef.current) return;
    if (fullscreen) {
      if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
    } else {
      if (document.fullscreenElement) document.exitFullscreen();
    }
  }, [fullscreen]);

  // Zoom controls
  const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));

  // Navigation
  const nextPage = () => setCurrentPage((p) => Math.min(p + (isMobileView ? 1 : 2), totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - (isMobileView ? 1 : 2), 1));
  const goToPage = (p) => setCurrentPage(p);

  // Print/download
  const printPDF = () => window.open(catalog.pdf, "_blank");
  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = catalog.pdf;
    link.download = catalog.title + ".pdf";
    link.click();
  };

  // Share
  const shareUrl = () => {
    let url = `${window.location.origin}/catalog/${catalog.slug}`;
    if (shareCurrent) url += `?page=${currentPage}`;
    return url;
  };
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // Thumbnails
  const openThumbs = () => setShowThumbs(true);
  const closeThumbs = () => setShowThumbs(false);

  // Responsive: fallback to single page on mobile
  const getPages = () => {
    if (isMobileView || totalPages < 3) return [currentPage];
    if (currentPage === 1) return [1];
    if (currentPage === totalPages) return [totalPages];
    return [currentPage, currentPage + 1 <= totalPages ? currentPage + 1 : currentPage];
  };

  // Progress bar
  const progress = ((currentPage - 1) / (totalPages - 1)) * 100;
  const handleProgressClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const page = Math.round(1 + pct * (totalPages - 1));
    setCurrentPage(page);
  };

  // Book flip animation (react-pageflip)
  // Only show on desktop, fallback to fade on mobile
  const Book = ({ children }) => {
    if (isMobileView) return <div>{children}</div>;
    return (
      <HTMLFlipBook
        width={600 * zoom}
        height={800 * zoom}
        size="stretch"
        minWidth={300}
        maxWidth={1200}
        minHeight={400}
        maxHeight={1600}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        ref={bookRef}
        startPage={currentPage - 1}
        onFlip={(e) => setCurrentPage(e.data + 1)}
        className="mx-auto"
      >
        {images.map((img, i) => (
          <div key={img} className="flex items-center justify-center bg-white">
            <img
              src={`/pages/${catalog.slug}/${img}`}
              alt={`Page ${i + 1}`}
              style={{ transform: `scale(${zoom})` }}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        ))}
      </HTMLFlipBook>
    );
  };

  // Social share links
  const socialLinks = [
    {
      icon: <FaXTwitter />,
      label: "X",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl())}`,
    },
    {
      icon: <FaWhatsapp />,
      label: "WhatsApp",
      url: `https://wa.me/?text=${encodeURIComponent(shareUrl())}`,
    },
    {
      icon: <FaFacebook />,
      label: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`,
    },
    {
      icon: <FaLinkedin />,
      label: "LinkedIn",
      url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl())}`,
    },
    {
      icon: <FaEnvelope />,
      label: "Email",
      url: `mailto:?subject=${encodeURIComponent(catalog.title)}&body=${encodeURIComponent(shareUrl())}`,
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-white flex flex-col items-center py-4 px-2 relative">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="flex flex-wrap gap-2 mb-2 w-full justify-between items-center">
          <div className="font-bold text-xl mb-2">{catalog.title}</div>
          <div className="flex gap-2">
            <button onClick={zoomOut} className="p-2" title="Zoom out"><MdZoomOut size={22} /></button>
            <button onClick={zoomIn} className="p-2" title="Zoom in"><MdZoomIn size={22} /></button>
            <button onClick={() => setFullscreen((f) => !f)} className="p-2" title="Fullscreen">
              {fullscreen ? <MdFullscreenExit size={22} /> : <MdFullscreen size={22} />}
            </button>
            <button onClick={printPDF} className="p-2" title="Print"><MdPrint size={22} /></button>
            <button onClick={downloadPDF} className="p-2" title="Download"><MdDownload size={22} /></button>
            <button onClick={() => setShareOpen(true)} className="p-2" title="Share"><MdShare size={22} /></button>
            <button onClick={openThumbs} className="p-2" title="Thumbnails"><MdGridView size={22} /></button>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-2 w-full justify-center">
          <button onClick={prevPage} disabled={currentPage === 1} className="p-2 disabled:opacity-30"><MdChevronLeft size={28} /></button>
          <div className="flex-1 flex justify-center">
            <Book>
              {getPages().map((p) => (
                <motion.div
                  key={p}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center w-[300px] h-[400px] sm:w-[400px] sm:h-[600px] md:w-[600px] md:h-[800px] bg-white border shadow"
                >
                  <img
                    src={`/pages/${catalog.slug}/${catalog.slug}-${p}_1.webp`}
                    alt={`Page ${p}`}
                    style={{ transform: `scale(${zoom})` }}
                    className="object-contain max-h-full max-w-full"
                    draggable={false}
                  />
                </motion.div>
              ))}
            </Book>
          </div>
          <button onClick={nextPage} disabled={currentPage >= totalPages} className="p-2 disabled:opacity-30"><MdChevronRight size={28} /></button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-600 text-sm">
            {getPages().length === 2
              ? `${getPages()[0]}-${getPages()[1]} / ${totalPages}`
              : `${getPages()[0]} / ${totalPages}`}
          </span>
        </div>
        <div className="w-full max-w-2xl h-2 bg-gray-200 rounded mb-4 cursor-pointer" onClick={handleProgressClick} title="Jump to page">
          <div className="h-2 bg-blue-500 rounded" style={{ width: `${progress}%` }} />
        </div>
      </div>
      {/* Thumbnails Modal */}
      <AnimatePresence>
        {showThumbs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg p-4 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
              <button onClick={closeThumbs} className="absolute top-2 right-2 p-2"><MdClose size={22} /></button>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <div key={img} className="cursor-pointer border rounded overflow-hidden" onClick={() => { setCurrentPage(i + 1); closeThumbs(); }}>
                    <img src={`/pages/${catalog.slug}/${img}`} alt={`Page ${i + 1}`} className="w-full h-24 object-cover" />
                    <div className="text-xs text-center py-1">{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Share Modal */}
      <AnimatePresence>
        {shareOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg p-6 max-w-sm w-full relative">
              <button onClick={() => setShareOpen(false)} className="absolute top-2 right-2 p-2"><MdClose size={22} /></button>
              <div className="font-bold mb-2">Share</div>
              <div className="flex gap-2 mb-2 flex-wrap">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
                    {s.icon} <span className="text-xs">{s.label}</span>
                  </a>
                ))}
              </div>
              <label className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={shareCurrent} onChange={e => setShareCurrent(e.target.checked)} />
                Share current page
              </label>
              <div className="flex gap-2 items-center">
                <input type="text" value={shareUrl()} readOnly className="flex-1 border rounded px-2 py-1 text-xs" />
                <button onClick={copyLink} className="p-2 bg-gray-100 rounded hover:bg-gray-200" title="Copy link"><MdContentCopy size={18} /></button>
                {copied && <span className="text-green-600 text-xs">Copied!</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 