/**
 * The domain for admin accounts that sign in with a plain username.
 *
 * The backend authenticates by email only. The admin asked to sign in as "kazemi.mst", so an
 * identifier without "@" is taken to be a username and becomes `<username>@asanrezerve.ir` — the
 * account's actual email. A full email is sent as typed. (Decision recorded 2026-09-19; domain
 * moved from nahalkmi.ir to asanrezerve.ir 2026-09-26 — see
 * docs/DEPLOYMENT_RUNBOOK.md's "Domain cutover" note: the production admin user's email must be
 * updated to match *before* this build is deployed, or the username shorthand stops resolving.)
 */
export const ADMIN_EMAIL_DOMAIN = 'asanrezerve.ir'

export function toLoginEmail(identifier: string): string {
  const value = identifier.trim().toLowerCase()
  if (value === '' || value.includes('@')) return value
  return `${value}@${ADMIN_EMAIL_DOMAIN}`
}
