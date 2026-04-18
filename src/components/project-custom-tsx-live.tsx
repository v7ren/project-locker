"use client";

import * as React from "react";
import {
  createContext,
  Fragment,
  startTransition,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { LiveError, LivePreview, LiveProvider } from "react-live";
import * as Lucide from "lucide-react";
import { transform as sucraseTransform } from "sucrase";
import { prepareCustomTsxForLive } from "@/lib/prepare-custom-tsx-live";

/** Pre-transform so react-live’s second pass sees production-style JSX (no __self → no React 19 dev warning). */
function preTransformReactLiveCode(code: string): string {
  return sucraseTransform(code, {
    transforms: ["typescript", "jsx", "imports"],
    production: true,
    filePath: "custom-home-live.tsx",
  }).code;
}

type Props = {
  source: string;
  /** `fullscreen` = project home only (no chrome, full viewport). */
  variant?: "fullscreen" | "panel";
};

function buildScope(lucideNames: string[]): Record<string, unknown> {
  const icons: Record<string, unknown> = {};
  for (const name of lucideNames) {
    const Icon = (Lucide as Record<string, unknown>)[name];
    // lucide-react icons are forwardRef exotic components (typeof "object"), not plain functions
    if (Icon != null) {
      icons[name] = Icon;
    }
  }
  return {
    React,
    Fragment,
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
    useContext,
    useId,
    useLayoutEffect,
    useReducer,
    useSyncExternalStore,
    useInsertionEffect,
    useImperativeHandle,
    useDebugValue,
    useDeferredValue,
    useTransition,
    startTransition,
    createContext,
    ...icons,
  };
}

export function ProjectCustomTsxPreview({
  source,
  variant = "panel",
}: Props) {
  const { code, error, scope } = useMemo(() => {
    const prepared = prepareCustomTsxForLive(source);
    if (prepared.error) {
      return { code: "", error: prepared.error, scope: null as Record<string, unknown> | null };
    }
    return {
      code: prepared.code,
      error: null as string | null,
      scope: buildScope(prepared.lucideNames),
    };
  }, [source]);

  if (error) {
    return (
      <section
        className={
          variant === "fullscreen"
            ? "min-h-screen w-full bg-amber-50 p-6 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-50"
            : "rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
        }
      >
        <p className="font-medium">Custom TSX</p>
        <p className="mt-1">{error}</p>
      </section>
    );
  }

  if (!scope) return null;

  if (variant === "fullscreen") {
    return (
      <div className="min-h-screen w-full text-zinc-950 dark:text-zinc-950">
        <LiveProvider
          code={code}
          scope={scope}
          noInline
          enableTypeScript
          language="tsx"
          transformCode={preTransformReactLiveCode}
        >
          <LivePreview className="min-h-screen w-full [&>*]:min-h-screen" />
          <LiveError className="fixed bottom-20 left-4 right-4 z-[150] max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-red-200 bg-red-50 p-3 font-mono text-xs text-red-900 shadow-lg dark:border-red-900 dark:bg-red-950/90 dark:text-red-100" />
        </LiveProvider>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Custom TSX (live preview)
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Rendered in your browser via react-live. Supported:{" "}
          <span className="font-mono">react</span> (default + common hooks),{" "}
          <span className="font-mono">lucide-react</span> named icons, and{" "}
          <span className="font-mono">export default function Name()</span>.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="border-b border-zinc-100 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Preview
        </p>
        <div className="min-h-[min(70vh,720px)] w-full overflow-auto bg-white p-2 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-950">
          <LiveProvider
            code={code}
            scope={scope}
            noInline
            enableTypeScript
            language="tsx"
            transformCode={preTransformReactLiveCode}
          >
            <LivePreview className="min-h-[200px] w-full" />
            <LiveError className="mt-2 block whitespace-pre-wrap rounded-lg bg-red-50 p-3 font-mono text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200" />
          </LiveProvider>
        </div>
      </div>
    </section>
  );
}
