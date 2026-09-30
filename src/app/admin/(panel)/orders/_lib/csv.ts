/** Escapa delimitadores y evita ejecutar fórmulas provenientes de texto del cliente. */
export function csvRow(values: (string | number | null | undefined)[]): string {
  return values.map((value) => {
    let text = String(value ?? "");
    if (typeof value === "string" && /^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  }).join(";") + "\r\n";
}
