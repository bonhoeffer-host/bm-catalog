"use client";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { MdZoomIn, MdZoomOut, MdFullscreen, MdFullscreenExit, MdPrint, MdDownload, MdShare, MdChevronLeft, MdChevronRight, MdGridView, MdClose, MdContentCopy } from "react-icons/md";
import { FaWhatsapp, FaXTwitter, FaFacebook, FaLinkedin, FaEnvelope, FaHouse } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import HTMLFlipBook from "react-pageflip";
import Link from "next/link";

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
  // const nextPage = useCallback(() => {
  //   if (!isMobileView && bookRef.current) {
  //     bookRef.current.pageFlip().flipNext();
  //   } else {
  //     setCurrentPage((p) => Math.min(p + (isMobileView ? 1 : 2), totalPages));
  //   }
  // }, [isMobileView, totalPages]);

  const nextPage = useCallback(()=>{
    bookRef.current.pageFlip().flipNext();
  }, []);

  const prevPage = useCallback(()=>{
    bookRef.current.pageFlip().flipPrev();
  }, []);

  // const prevPage = useCallback(() => {
  //   if (!isMobileView && bookRef.current) {
  //     bookRef.current.pageFlip().flipPrev();
  //   } else {
  //     setCurrentPage((p) => Math.max(p - (isMobileView ? 1 : 2), 1));
  //   }
  // }, [isMobileView]);

  const goToPage = (p) => {
    setCurrentPage(p);
    
    // If using flipbook, also update the flipbook position
    if (!isMobileView && bookRef.current) {
      try {
        bookRef.current.pageFlip().turnToPage(p - 1);
      } catch (error) {
        console.log('Flipbook navigation error:', error);
      }
    }
  };

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
    if (typeof window === "undefined") return "";
    let url = `${window.location.origin}/catalog/${catalog.slug}`;
    if (shareCurrent) url += `?page=${currentPage}`;
    return url;
  };
  const copyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  // Thumbnails
  const openThumbs = () => setShowThumbs(true);
  const closeThumbs = () => setShowThumbs(false);

  // Responsive: show 2 pages at a time on desktop, 1 on mobile
  const getPages = () => {
    if (isMobileView) return [currentPage];
    
    // For desktop, show 2 pages at a time
    if (currentPage === 1) return [1];
    if (currentPage === totalPages) return [totalPages];
    
    // Show current page and next page (if available)
    const nextPageNum = currentPage + 1 <= totalPages ? currentPage + 1 : currentPage;
    return currentPage % 2 === 0 ? [currentPage - 1, currentPage] : [currentPage, nextPageNum];
  };

  // Progress bar
  const progress = ((currentPage - 1) / (totalPages - 1)) * 100;
  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const page = Math.round(1 + pct * (totalPages - 1));
    const newPage = Math.max(1, Math.min(page, totalPages));
    
    // Update the page
    setCurrentPage(newPage);
    
    // If using flipbook, also update the flipbook position
    if (!isMobileView && bookRef.current) {
      try {
        bookRef.current.pageFlip().turnToPage(newPage - 1);
      } catch (error) {
        console.log('Flipbook navigation error:', error);
      }
    }
  };

  // Social share links
  const socialLinks = useMemo(() => {
    const url = shareUrl();
    if (!url) return [];
    
    return [
      {
        icon: <FaXTwitter />,
        label: "X",
        url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
      },
      {
        icon: <FaWhatsapp />,
        label: "WhatsApp",
        url: `https://wa.me/?text=${encodeURIComponent(url)}`,
      },
      {
        icon: <FaFacebook />,
        label: "Facebook",
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      },
      {
        icon: <FaLinkedin />,
        label: "LinkedIn",
        url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`,
      },
      {
        icon: <FaEnvelope />,
        label: "Email",
        url: `mailto:?subject=${encodeURIComponent(catalog.title)}&body=${encodeURIComponent(url)}`,
      },
    ];
  }, [catalog.slug, catalog.title, currentPage, shareCurrent]);

  return (
    <div ref={containerRef} className="h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col relative overflow-hidden">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center space-x-2 text-sm">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
          >
            <FaHouse className="h-4 w-4 mr-1" />
            Home
          </Link>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">
            {catalog.title.toUpperCase()}
          </span>
        </div>
      </div>
      {/* Header with title in top left */}
      {/* <div className="absolute top-8 left-4 z-10">
        <motion.h1
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl md:text-2xl font-bold text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg"
        >
          {catalog.title}
        </motion.h1>
      </div> */}

      {/* Main Viewer Area */}
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-6 w-full h-full"
        >
          {/* Navigation buttons - left/right on desktop, hidden on mobile */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevPage} 
            disabled={currentPage === 1} 
            className="hidden sm:flex bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-30 text-white p-4 rounded-full transition-all duration-200 shadow-lg flex-shrink-0 cursor-pointer"
          >
            <MdChevronLeft size={32} />
          </motion.button>
          
          {/* Book viewer container */}
          <div className="flex-1 flex flex-col items-center justify-center h-full w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl shadow-2xl p-4 w-full sm:w-[80%] 2xl:w-[70%] flex items-center justify-center"
            >
              {/* {isMobileView ? (
                <div className="flex justify-center">
                  {getPages().map((p) => (
                    <div
                      key={p}
                      className="flex items-center justify-center bg-white rounded-lg overflow-hidden mx-2"
                      style={{ 
                        width: 'auto', 
                        height: '50vh',
                        maxHeight: '70vh',
                        flexShrink: 0
                      }}
                    >
                      <img
                        src={`/pages/${catalog.slug}/${catalog.slug}_1.webp`}
                        alt={`Page ${p}`}
                        style={{ transform: `scale(${zoom})` }}
                        className="object-contain max-h-full max-w-full rounded-lg"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              ) : ( */}
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
                  onFlip={(e) => setCurrentPage(e.data + 1)}
                  className="mx-auto"
                  key={`flipbook-${catalog.slug}`} // Stable key based on catalog
                >
                  {images.map((img, i) => (
                    <div key={`page-${i}`} className="flex items-center justify-center ">
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
              {/* )} */}
            </motion.div>

            {/* Navigation buttons - below book on mobile */}
            <div className="sm:hidden flex items-center justify-center gap-6 mt-4">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevPage} 
                disabled={currentPage === 1} 
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-30 text-white p-4 rounded-full transition-all duration-200 shadow-lg flex-shrink-0 cursor-pointer"
              >
                <MdChevronLeft size={32} />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextPage} 
                disabled={currentPage >= totalPages} 
                className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-30 text-white p-4 rounded-full transition-all duration-200 shadow-lg flex-shrink-0 cursor-pointer"
              >
                <MdChevronRight size={32} />
              </motion.button>
            </div>
          </div>
          
          {/* Right navigation button - desktop only */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextPage} 
            disabled={currentPage >= totalPages} 
            className="hidden sm:flex bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-30 text-white p-4 rounded-full transition-all duration-200 shadow-lg flex-shrink-0 cursor-pointer"
          >
            <MdChevronRight size={32} />
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gray-800/90 backdrop-blur-sm border-t border-gray-700"
      >
        {/* Progress Bar for small screens - at top */}
        <div className="sm:hidden px-4 py-2 border-b border-gray-700">
          <div className="flex flex-col items-center gap-2">
            <div className="text-gray-300 text-sm font-medium">
              {getPages().length === 2
                ? `Pages ${getPages()[0]}-${getPages()[1]} of ${totalPages}`
                : `Page ${getPages()[0]} of ${totalPages}`}
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-3 cursor-pointer shadow-inner relative" onClick={handleProgressClick} title="Jump to page">
              <motion.div 
                className="h-3 bg-gradient-to-r from-[#989b2e] to-[#b8bb35] rounded-full shadow-sm relative pointer-events-none"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              >
                {/* Circle indicator at the tip */}
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md  pointer-events-none"></div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="mx-auto flex items-center justify-between gap-2">
            {/* Left - Zoom Controls */}
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={zoomOut} 
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer" 
                title="Zoom out"
              >
                <MdZoomOut size={18} />
                <span className="hidden lg:inline text-sm">Zoom Out</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={zoomIn} 
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer" 
                title="Zoom in"
              >
                <MdZoomIn size={18} />
                <span className="hidden lg:inline text-sm">Zoom In</span>
              </motion.button>
            </div>

            {/* Center - Page Info and Progress (hidden on small screens) */}
            <div className="hidden sm:flex flex-1 flex-col items-center gap-2 max-w-md">
              <div className="text-gray-300 text-sm font-medium">
                {getPages().length === 2
                  ? `Pages ${getPages()[0]}-${getPages()[1]} of ${totalPages}`
                  : `Page ${getPages()[0]} of ${totalPages}`}
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-3 cursor-pointer shadow-inner relative" onClick={handleProgressClick} title="Jump to page">
                <motion.div 
                  className="h-3 bg-gradient-to-r from-[#989b2e] to-[#b8bb35] rounded-full shadow-sm relative pointer-events-none"
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Circle indicator at the tip */}
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md  pointer-events-none"></div>
                </motion.div>
              </div>
            </div>

            {/* Right - Action Buttons */}
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFullscreen((f) => !f)} 
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer" 
                title="Fullscreen"
              >
                {fullscreen ? <MdFullscreenExit size={18} /> : <MdFullscreen size={18} />} <span className="hidden lg:inline text-sm">{fullscreen ? 'Exit' : 'Enter'} Full Screen</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={printPDF} 
                className="bg-[#989b2e] hover:bg-[#7a7c25] text-white p-2 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer" 
                title="Print"
              >
                <MdPrint size={18} /><span className="hidden lg:inline text-sm"> Print</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadPDF} 
                className="bg-[#989b2e] hover:bg-[#7a7c25] text-white p-2 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer" 
                title="Download"
              >
                <MdDownload size={18} /><span className="hidden lg:inline text-sm"> Download</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShareOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer" 
                title="Share"
              >
                <MdShare size={18} /><span className="hidden lg:inline text-sm"> Share</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openThumbs} 
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer" 
                title="Thumbnails"
              >
                <MdGridView size={18} /><span className="hidden lg:inline text-sm"> Pages</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Thumbnails Modal */}
      <AnimatePresence>
        {showThumbs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-700 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">All Pages</h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeThumbs} 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-200"
                >
                  <MdClose size={24} />
                </motion.button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {images.map((img, i) => (
                  <motion.div 
                    key={img} 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 group" 
                    onClick={() => { goToPage(i + 1); closeThumbs(); }}
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img 
                        src={`/pages/${catalog.slug}/${img}`} 
                        alt={`Page ${i + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <div className="text-center py-2 bg-gray-700 text-white text-sm font-medium">
                      Page {i + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full relative border border-gray-700 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Share Catalog</h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShareOpen(false)} 
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all duration-200"
                >
                  <MdClose size={24} />
                </motion.button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 text-sm mb-4">Share this catalog on social media or copy the link</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {socialLinks.map((s) => (
                    <motion.a 
                      key={s.label} 
                      href={s.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg transition-all duration-200 flex items-center gap-2 justify-center"
                    >
                      {s.icon} 
                      <span className="text-sm font-medium">{s.label}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center gap-3 text-gray-300 mb-4">
                  <input 
                    type="checkbox" 
                    checked={shareCurrent} 
                    onChange={e => setShareCurrent(e.target.checked)}
                    className="w-4 h-4 text-[#989b2e] bg-gray-700 border-gray-600 rounded focus:ring-[#989b2e] focus:ring-2"
                  />
                  <span className="text-sm">Share current page number</span>
                </label>
              </div>
              
              <div className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={shareUrl()} 
                  readOnly 
                  className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#989b2e]" 
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyLink} 
                  className="bg-[#989b2e] hover:bg-[#7a7c25] text-white p-2 rounded-lg transition-all duration-200" 
                  title="Copy link"
                >
                  <MdContentCopy size={20} />
                </motion.button>
              </div>
              
              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 text-center"
                >
                  <span className="text-green-400 text-sm font-medium">✓ Link copied to clipboard!</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 