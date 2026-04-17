/**
 * PDF URL for <iframe src> with open-parameter hash so common embedded viewers
 * (Chrome/Edge PDFium, etc.) open in “fit whole page in view” mode.
 *
 * @see Adobe “Parameters for Opening PDF Files” (PDF open parameters)
 */
export function pdfIframeSrc(fileUrl: string): string {
  const base = fileUrl.split("#")[0] ?? fileUrl;
  return `${base}#page=1&view=Fit`;
}
