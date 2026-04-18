export type PreparedCustomTsx = {
  code: string;
  lucideNames: string[];
  error: string | null;
};

function parseLucideNamedImports(line: string): string[] {
  const t = line.trim();
  const m = t.match(
    /^import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]\s*;?$/,
  );
  if (!m?.[1]) return [];
  const names: string[] = [];
  for (const part of m[1].split(",")) {
    const p = part.trim();
    if (!p) continue;
    const [orig, aliasPart] = p.split(/\s+as\s+/).map((s) => s.trim());
    names.push(aliasPart && aliasPart.length > 0 ? aliasPart : orig);
  }
  return names;
}

function isStripImportLine(line: string): { lucideNames: string[] } | boolean {
  const t = line.trim();
  if (!/^import\s+/.test(t)) return false;
  if (/\bfrom\s+['"]react['"]/.test(t)) return true;
  if (/\bfrom\s+['"]react-dom(\/client)?['"]/.test(t)) return true;
  const lucideNames = parseLucideNamedImports(line);
  if (lucideNames.length > 0) return { lucideNames };
  if (/\bfrom\s+['"]lucide-react['"]/.test(t)) return { lucideNames: [] };
  return false;
}

/** Strip imports and wrap `export default` as react-live `noInline` output (no `require` in eval). */
export function prepareCustomTsxForLive(source: string): PreparedCustomTsx {
  const lines = source.split(/\r?\n/);
  const kept: string[] = [];
  const lucideNames: string[] = [];

  for (const line of lines) {
    const t = line.trim();
    if (
      /^import\s+type\b/.test(t) &&
      /from\s+['"](react|react-dom|lucide-react)['"]/.test(t)
    ) {
      continue;
    }
    const strip = isStripImportLine(line);
    if (strip === false) {
      kept.push(line);
      continue;
    }
    if (strip === true) continue;
    lucideNames.push(...strip.lucideNames);
  }

  let body = kept.join("\n").trim();
  if (/^\s*import\b/m.test(body)) {
    return {
      code: "",
      lucideNames: [],
      error:
        "Unsupported import in custom.tsx. Live preview only strips imports from react, react-dom, and lucide-react. Use HTML upload or simplify imports.",
    };
  }

  const exportFn = body.match(/export\s+default\s+function\s+(\w+)/);
  if (!exportFn?.[1]) {
    return {
      code: "",
      lucideNames: [],
      error:
        "Live preview needs `export default function YourName() { ... }`. Other default export shapes are not supported yet.",
    };
  }

  const componentName = exportFn[1];
  body = body.replace(/export\s+default\s+function\s+(\w+)/, "function $1");
  body += `\n\nrender(<${componentName} />);\n`;

  return {
    code: body,
    lucideNames: [...new Set(lucideNames)],
    error: null,
  };
}
