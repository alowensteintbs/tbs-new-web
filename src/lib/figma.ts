export function resolveFigmaImageUrl(
  images: Record<string, string>,
  nodeId: string
): string | undefined {
  const normalized = nodeId.replace(/-/g, ":");
  return images[normalized] ?? images[nodeId] ?? Object.values(images)[0];
}
