/** One executed tool call in a project AI turn (safe to import from client). */
export type AiToolStep = {
  name: string;
  ok: boolean;
  summary: string;
};
