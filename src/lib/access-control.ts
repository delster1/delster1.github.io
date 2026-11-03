export function isAdminEmail(email: string, configuredAdminEmail?: string): boolean {
  if (!configuredAdminEmail?.trim()) return false;
  return email.trim().toLowerCase() === configuredAdminEmail.trim().toLowerCase();
}
