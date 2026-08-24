export function getInitials(name?: string): string {
  if (!name) return "ZI";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatUserName(name?: string): string {
  return name || "Utilisateur";
}
