import type { AiToolStep } from "@/lib/ai-tool-step";

/** Emitted while the agent runs (also serialized over NDJSON to the client). */
export type AgentStreamProgress =
  | { kind: "model" }
  | {
      kind: "tool";
      tool: string;
      path?: string;
      file?: string;
      fromPath?: string;
      toPath?: string;
      query?: string;
      pattern?: string;
    };

export type AgentStreamLine =
  | { type: "progress"; payload: AgentStreamProgress }
  | { type: "delta"; text: string }
  | { type: "done"; reply: string; steps: AiToolStep[] }
  | { type: "error"; message: string };
