"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Cookie,
  FileText,
  Scale,
  Download,
  Printer,
  Search,
  X,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  AlertCircle,
  Calendar,
  Hash,
  BookOpen,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import LogoDark from "@/public/zyloch_logo.webp";
import LogoLight from "@/public/zyloch-black-logo.png";
import styles from "../styles/LegalPage.module.css";

/**
 * Legal Pages Navigation Configuration
 */
const LEGAL_NAV_ITEMS = [
  {
    id: "terms",
    title: "Terms and Conditions",
    shortTitle: "Terms & Conditions",
    href: "/terms",
    icon: Scale,
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    shortTitle: "Privacy Policy",
    href: "/privacy",
    icon: FileText,
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    shortTitle: "Cookie Policy",
    href: "/cookies",
    icon: Cookie,
  },
];

/**
 * Robust Client-Side MDX Parser
 * Preserves 100% of original text, hierarchy, and wording
 */
function parseMDX(rawText) {
  if (!rawText) return { title: "", lastUpdated: "", intro: [], sections: [] };

  const lines = rawText.split(/\r?\n/);
  let title = "";
  let lastUpdated = "";
  const intro = [];
  const sections = [];
  let currentSection = null;
  let currentSubItem = null;
  let inIntro = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Extract Title #
    if (line.startsWith("# ")) {
      title = line.replace("# ", "").trim();
      continue;
    }

    // Extract Last Updated date
    if (line.toLowerCase().includes("**last updated:")) {
      const match = line.match(/\*\*Last Updated:\s*([^*]+)\*\*/i);
      if (match) {
        lastUpdated = match[1].trim();
      } else {
        lastUpdated = line.replace(/\*\*|Last Updated:/gi, "").trim();
      }
      continue;
    }

    // Extract Section Header ##
    if (line.startsWith("## ")) {
      inIntro = false;
      const sectionTitle = line.replace("## ", "").trim();
      const kebabId = sectionTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      currentSection = {
        id: kebabId || `section-${sections.length + 1}`,
        title: sectionTitle,
        items: [],
      };
      sections.push(currentSection);
      currentSubItem = null;
      continue;
    }

    if (inIntro) {
      intro.push(line);
      continue;
    }

    if (currentSection) {
      // Bullet list item
      if (line.startsWith("- ")) {
        const bulletText = line.replace(/^- /, "").trim();
        if (currentSubItem) {
          if (!currentSubItem.bullets) currentSubItem.bullets = [];
          currentSubItem.bullets.push(bulletText);
        } else {
          let lastItem = currentSection.items[currentSection.items.length - 1];
          if (!lastItem || lastItem.type !== "bullets") {
            lastItem = { type: "bullets", text: "", bullets: [] };
            currentSection.items.push(lastItem);
          }
          lastItem.bullets.push(bulletText);
        }
      } else {
        // Subsection content line
        currentSubItem = {
          type: "text",
          text: line,
          bullets: [],
        };
        currentSection.items.push(currentSubItem);
      }
    }
  }

  return { title, lastUpdated, intro, sections };
}

/**
 * Text renderer supporting live search highlighting (<mark>) and linkifying URLs & Emails
 */
function HighlightedText({ text, query }) {
  if (!text) return null;

  const renderFormattedText = (str) => {
    // URL and Email Regex
    const urlPattern = /(https?:\/\/[^\s]+|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)/gi;
    const parts = str.split(urlPattern);

    return parts.map((part, index) => {
      if (part.match(/^https?:\/\//i)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.inlineLink}
          >
            {part}
          </a>
        );
      }
      if (part.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i)) {
        return (
          <a
            key={index}
            href={`mailto:${part}`}
            className={styles.inlineLink}
          >
            {part}
          </a>
        );
      }

      // If search query is active, highlight matching tokens
      if (query && query.trim() !== "") {
        const subParts = part.split(
          new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
        );
        return subParts.map((sub, i) =>
          sub.toLowerCase() === query.toLowerCase() ? (
            <mark key={i}>{sub}</mark>
          ) : (
            sub
          )
        );
      }

      return part;
    });
  };

  return <>{renderFormattedText(text)}</>;
}

export default function LegalPage({ content, type }) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionId, setActiveSectionId] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSectionNavOpen, setMobileSectionNavOpen] = useState(false);

  const mainContentRef = useRef(null);

  // Parse raw MDX content
  const parsedData = useMemo(() => parseMDX(content), [content]);

  // Determine Title & Breadcrumb text based on legal page type
  const getBreadcrumbTitle = () => {
    switch (type?.toLowerCase()) {
      case "cookies":
        return "Cookie Policy";
      case "privacy":
        return "Privacy Policy";
      case "terms":
        return "Terms and Conditions";
      default:
        return parsedData.title || "Legal Document";
    }
  };

  // Determine Previous & Next document for bottom pagination
  const { prevDoc, nextDoc } = useMemo(() => {
    const currentIndex = LEGAL_NAV_ITEMS.findIndex(
      (item) => item.id === type?.toLowerCase()
    );
    if (currentIndex === -1) return { prevDoc: null, nextDoc: null };
    const prev = currentIndex > 0 ? LEGAL_NAV_ITEMS[currentIndex - 1] : null;
    const next =
      currentIndex < LEGAL_NAV_ITEMS.length - 1
        ? LEGAL_NAV_ITEMS[currentIndex + 1]
        : null;
    return { prevDoc: prev, nextDoc: next };
  }, [type]);

  // Filter sections based on live search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return parsedData.sections;

    const q = searchQuery.toLowerCase();
    return parsedData.sections
      .map((section) => {
        const titleMatch = section.title.toLowerCase().includes(q);
        const filteredItems = section.items.filter((item) => {
          const textMatch = item.text?.toLowerCase().includes(q);
          const bulletMatch = item.bullets?.some((b) =>
            b.toLowerCase().includes(q)
          );
          return textMatch || bulletMatch;
        });

        if (titleMatch || filteredItems.length > 0) {
          return {
            ...section,
            items: titleMatch ? section.items : filteredItems,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [parsedData.sections, searchQuery]);

  // Prevent browser window from scrolling vertically while in 100vh docs mode
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleBeforePrint = () => {
      document.body.style.overflow = "visible";
      document.documentElement.style.overflow = "visible";
    };
    const handleAfterPrint = () => {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    };

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  // Set default active section
  useEffect(() => {
    if (parsedData.sections.length > 0 && !activeSectionId) {
      setActiveSectionId(parsedData.sections[0].id);
    }
  }, [parsedData.sections, activeSectionId]);

  // Real-time Scrollspy & Back to Top listener inside mainContent container
  useEffect(() => {
    const container = mainContentRef.current;
    if (!container || parsedData.sections.length === 0) return;

    const handleScroll = () => {
      // Toggle back to top button
      if (container.scrollTop > 350) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      // Calculate active section based on container scroll position
      const containerRect = container.getBoundingClientRect();
      const sections = parsedData.sections;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const elRect = el.getBoundingClientRect();
          // If top of section is within upper 40% of container viewport
          if (elRect.top <= containerRect.top + containerRect.height * 0.4) {
            setActiveSectionId(sections[i].id);
            break;
          }
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [parsedData.sections]);

  // Smooth scroll to target section inside the internal container
  const scrollToSection = useCallback((e, id) => {
    if (e) e.preventDefault();
    const container = mainContentRef.current;
    const element = document.getElementById(id);
    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const targetOffset = container.scrollTop + (elementRect.top - containerRect.top) - 16;
      container.scrollTo({
        top: Math.max(0, targetOffset),
        behavior: "smooth",
      });
      setActiveSectionId(id);
    }
  }, []);

  // Smooth scroll to top of main content
  const scrollToTop = () => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Copy anchor link
  const copySectionLink = (e, id) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(url);
        toast.success("Section link copied to clipboard");
      }
      scrollToSection(null, id);
    }
  };

  // PDF Download Handler with Toast Feedback & Fallback to window.print()
  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const toastId = toast.loading(
      `Preparing ${getBreadcrumbTitle()} PDF download...`
    );

    try {
      const res = await fetch(`/api/download?type=${type}`);

      if (!res.ok) {
        throw new Error(`PDF not available (Status: ${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${parsedData.title || getBreadcrumbTitle()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${getBreadcrumbTitle()} downloaded successfully!`, {
        id: toastId,
      });
    } catch (err) {
      console.warn(
        "Official PDF download unavailable, launching print view as fallback:",
        err
      );
      toast.error(
        `Official PDF unavailable. Launching high-fidelity print dialog...`,
        {
          id: toastId,
          duration: 3500,
        }
      );

      setTimeout(() => {
        window.print();
      }, 600);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.docsContainer}>
      <Toaster position="bottom-right" richColors />

      {/* 1. Fixed Top Documentation Header */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          {/* Mobile Sidebar Navigation Drawer Toggle */}
          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle legal documentation navigation"
            aria-expanded={mobileNavOpen}
          >
            <Menu size={18} />
          </button>

          {/* Brand Logo */}
          <Link href="/home" className={styles.brandLink} title="Zyloch Home">
            <div className={styles.logoWrapper}>
              <Image
                src={theme === "dark" ? LogoDark : LogoLight}
                alt="Zyloch"
                width={96}
                height={24}
                className={styles.brandLogo}
                priority
              />
            </div>
            <span className={styles.brandDivider}>/</span>
            <span className={styles.brandDocsBadge}>Legal</span>
          </Link>

          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <ChevronRight size={13} className={styles.breadcrumbChevron} />
            <span className={styles.breadcrumbCurrent}>{getBreadcrumbTitle()}</span>
          </nav>
        </div>

        {/* Header Right Actions */}
        <div className={styles.headerRight}>
          <div className={styles.actionButtons}>
            <button
              type="button"
              onClick={handlePrint}
              className={styles.actionBtn}
              title="Print document"
              aria-label="Print document"
            >
              <Printer size={14} />
              <span className={styles.actionBtnText}>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              disabled={isDownloading}
              title="Download PDF"
              aria-label="Download PDF"
            >
              <Download size={14} />
              <span className={styles.actionBtnText}>
                {isDownloading ? "Downloading..." : "PDF"}
              </span>
            </button>
          </div>

          <div className={styles.headerDivider} />

          {/* Theme Mode Switcher */}
          <div className={styles.themeToggleWrapper}>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 2. Main Documentation Body: Left Sidebar + Scrollable Content */}
      <div className={styles.docsBody}>
        {/* Left Sidebar: Document Switcher + Dedicated Section Navigation */}
        <aside
          className={`${styles.leftSidebar} ${
            mobileNavOpen ? styles.leftSidebarOpen : ""
          }`}
          aria-label="Legal document and section navigation"
        >
          <div className={styles.sidebarInner}>
            {/* Live In-Document Search Box */}
            <div className={styles.searchBox}>
              <Search size={14} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filter legal document content"
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Legal Documents Switcher */}
            <div className={styles.docSwitcherGroup}>
              <div className={styles.sidebarGroupTitle}>Legal Documents</div>
              <ul className={styles.docSwitcherList}>
                {LEGAL_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = type?.toLowerCase() === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`${styles.docSwitcherItem} ${
                          isActive ? styles.docSwitcherItemActive : ""
                        }`}
                        onClick={() => setMobileNavOpen(false)}
                      >
                        <Icon size={15} className={styles.docSwitcherIcon} />
                        <span className={styles.docSwitcherText}>
                          {item.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Dedicated Left-Side Section Navigation */}
            {parsedData.sections.length > 0 && (
              <div className={styles.sectionNavGroup}>
                <div className={styles.sidebarGroupTitle}>On This Page</div>
                <ul className={styles.sectionNavList}>
                  {parsedData.sections.map((sec) => {
                    const isActive = activeSectionId === sec.id;
                    return (
                      <li key={sec.id} className={styles.sectionNavItem}>
                        <a
                          href={`#${sec.id}`}
                          onClick={(e) => {
                            scrollToSection(e, sec.id);
                            setMobileNavOpen(false);
                          }}
                          className={`${styles.sectionNavLink} ${
                            isActive ? styles.sectionNavLinkActive : ""
                          }`}
                          title={sec.title}
                        >
                          {sec.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileNavOpen && (
          <div
            className={styles.sidebarBackdrop}
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Document Content: Scrolls independently inside 100vh with hidden scrollbars */}
        <main
          ref={mainContentRef}
          id="legal-content"
          className={styles.mainContent}
          tabIndex={-1}
        >
          <div className={styles.contentInner}>
            {/* Mobile Collapsible Section Navigation Bar */}
            {parsedData.sections.length > 0 && (
              <div className={styles.mobileSectionNav}>
                <button
                  type="button"
                  className={styles.mobileSectionNavToggle}
                  onClick={() =>
                    setMobileSectionNavOpen(!mobileSectionNavOpen)
                  }
                  aria-expanded={mobileSectionNavOpen}
                >
                  <span className={styles.mobileSectionNavLabel}>
                    Section:{" "}
                    <strong>
                      {parsedData.sections.find((s) => s.id === activeSectionId)
                        ?.title || "Jump to section"}
                    </strong>
                  </span>
                  <ChevronDown
                    size={15}
                    className={`${styles.mobileSectionNavChevron} ${
                      mobileSectionNavOpen
                        ? styles.mobileSectionNavChevronRotated
                        : ""
                    }`}
                  />
                </button>
                {mobileSectionNavOpen && (
                  <div className={styles.mobileSectionNavDropdown}>
                    {parsedData.sections.map((sec) => (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        onClick={(e) => {
                          scrollToSection(e, sec.id);
                          setMobileSectionNavOpen(false);
                        }}
                        className={`${styles.mobileSectionNavItem} ${
                          activeSectionId === sec.id
                            ? styles.mobileSectionNavItemActive
                            : ""
                        }`}
                      >
                        {sec.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Document Header (Clean & Minimal) */}
            <header className={styles.articleHeader}>
              <div className={styles.articleHeaderMeta}>
                <span className={styles.docBadge}>
                  <BookOpen size={12} style={{ marginRight: 5 }} />
                  Zyloch Legal Documentation
                </span>
                {parsedData.lastUpdated && (
                  <span className={styles.lastUpdatedBadge}>
                    <Calendar size={12} style={{ marginRight: 4 }} />
                    Last Updated: {parsedData.lastUpdated}
                  </span>
                )}
              </div>

              <h1 className={styles.articleTitle}>
                {parsedData.title || getBreadcrumbTitle()}
              </h1>
            </header>

            {/* Search Filter Notice */}
            {searchQuery && (
              <div className={styles.searchNotice}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Search size={15} />
                  <span>
                    Showing matches for <strong>&ldquo;{searchQuery}&rdquo;</strong> (
                    {filteredSections.length}{" "}
                    {filteredSections.length === 1 ? "section" : "sections"} found)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={styles.searchResetBtn}
                >
                  Clear filter
                </button>
              </div>
            )}

            {/* Introductory Content */}
            {!searchQuery && parsedData.intro.length > 0 && (
              <div className={styles.introBlock}>
                {parsedData.intro.map((pText, i) => (
                  <p key={i} className={styles.introParagraph}>
                    <HighlightedText text={pText} query={searchQuery} />
                  </p>
                ))}
              </div>
            )}

            {/* Document Sections: Minimal Clean Typography, No Cards */}
            {filteredSections.length > 0 ? (
              <div className={styles.sectionsContainer}>
                {filteredSections.map((sec) => (
                  <section
                    key={sec.id}
                    id={sec.id}
                    className={styles.sectionBlock}
                  >
                    <div className={styles.sectionHeadingRow}>
                      <h2 className={styles.sectionHeading}>
                        <HighlightedText text={sec.title} query={searchQuery} />
                      </h2>
                      <a
                        href={`#${sec.id}`}
                        className={styles.anchorLink}
                        onClick={(e) => copySectionLink(e, sec.id)}
                        title="Copy direct link to section"
                        aria-label={`Direct link to ${sec.title}`}
                      >
                        <Hash size={15} />
                      </a>
                    </div>

                    <div className={styles.sectionBody}>
                      {sec.items.map((item, idx) => (
                        <div key={idx} className={styles.contentItem}>
                          {item.text && (
                            <p className={styles.paragraph}>
                              <HighlightedText
                                text={item.text}
                                query={searchQuery}
                              />
                            </p>
                          )}
                          {item.bullets && item.bullets.length > 0 && (
                            <ul className={styles.bulletList}>
                              {item.bullets.map((bText, bIdx) => (
                                <li key={bIdx} className={styles.bulletItem}>
                                  <span className={styles.bulletDot} />
                                  <span className={styles.bulletText}>
                                    <HighlightedText
                                      text={bText}
                                      query={searchQuery}
                                    />
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <AlertCircle size={32} className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No matching clauses found</h3>
                <p className={styles.emptyText}>
                  No text in {getBreadcrumbTitle()} matched &ldquo;{searchQuery}
                  &rdquo;. Try searching for another keyword.
                </p>
                <button
                  type="button"
                  className={styles.resetSearchButton}
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search Filter
                </button>
              </div>
            )}

            {/* Previous / Next Document Pagination Cards */}
            <nav
              aria-label="Legal documents pagination"
              className={styles.paginationNav}
            >
              {prevDoc ? (
                <Link
                  href={prevDoc.href}
                  className={`${styles.paginationCard} ${styles.paginationPrev}`}
                >
                  <div className={styles.paginationSub}>
                    <ArrowLeft size={13} style={{ marginRight: 5 }} />
                    Previous Document
                  </div>
                  <div className={styles.paginationTitle}>{prevDoc.title}</div>
                </Link>
              ) : (
                <div className={styles.paginationSpacer} />
              )}

              {nextDoc && (
                <Link
                  href={nextDoc.href}
                  className={`${styles.paginationCard} ${styles.paginationNext}`}
                >
                  <div className={styles.paginationSub}>
                    Next Document
                    <ArrowRight size={13} style={{ marginLeft: 5 }} />
                  </div>
                  <div className={styles.paginationTitle}>{nextDoc.title}</div>
                </Link>
              )}
            </nav>

            {/* Document Footer */}
            <footer className={styles.docFooter}>
              <div className={styles.docFooterContent}>
                <div>
                  © {new Date().getFullYear()} Zyloch Security, Inc. / Secure Code LLC. All rights reserved.
                </div>
                <div className={styles.docFooterLinks}>
                  <Link href="/terms" className={styles.footerLink}>
                    Terms & Conditions
                  </Link>
                  <span className={styles.footerDot}>•</span>
                  <Link href="/privacy" className={styles.footerLink}>
                    Privacy Policy
                  </Link>
                  <span className={styles.footerDot}>•</span>
                  <Link href="/cookies" className={styles.footerLink}>
                    Cookie Policy
                  </Link>
                  <span className={styles.footerDot}>•</span>
                  <a
                    href="mailto:support@zyloch.com"
                    className={styles.footerLink}
                  >
                    Support
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Floating Back to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`${styles.floatingBackToTop} ${
          showBackToTop ? styles.floatingBackToTopVisible : ""
        }`}
        aria-label="Back to top"
        title="Back to top"
      >
        <ArrowUp size={16} />
      </button>
    </div>
  );
}
