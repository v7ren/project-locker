/** PDF open parameters: fit first page in the iframe (browser PDF viewers). */
export function pdfIframeSrc(fileUrl: string): string {
  const base = fileUrl.split("#")[0] ?? fileUrl;
  return `${base}#page=1&view=Fit`;
}
