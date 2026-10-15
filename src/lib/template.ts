export type TemplateVars = Record<string, string>;

export function fillTemplate<T>(value: T, vars: TemplateVars): T {
  if (typeof value === "string") {
    return value.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "") as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => fillTemplate(item, vars)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = fillTemplate(item, vars);
    }
    return out as T;
  }
  return value;
}
