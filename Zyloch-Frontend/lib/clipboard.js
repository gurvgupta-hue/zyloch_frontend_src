/**
 * Universal clipboard copy utility with fallback.
 * Works in both Secure Contexts (HTTPS / localhost via navigator.clipboard)
 * and Insecure Contexts (HTTP / remote VM IP addresses via document.execCommand).
 *
 * @param {string} value The string to copy to clipboard
 * @returns {Promise<boolean>} True if copied successfully, false otherwise
 */
export const copyToClipboard = async (value) => {
  const text = String(value || "");
  if (!text) return false;

  // 1. Try modern navigator.clipboard API
  if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Insecure context, permissions denied, or background tab - proceed to fallback
      console.warn("navigator.clipboard.writeText failed, attempting execCommand fallback:", err);
    }
  }

  // 2. Fallback for non-secure HTTP origins or older browsers
  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "-9999px";
      textArea.style.opacity = "0";
      textArea.style.pointerEvents = "none";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      return successful;
    } catch (err) {
      console.error("document.execCommand fallback copy failed:", err);
      return false;
    }
  }

  return false;
};
