/** Helpers for AdveroWorkspace.setupState JSON blob. */

export function parseSetupState(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return { ...(raw as Record<string, unknown>) };
  }
  return {};
}

/** Strip secrets before sending setupState to the browser. */
export function sanitizeSetupStateForClient(raw: unknown): Record<string, unknown> {
  const setup = parseSetupState(raw);
  delete setup.gscRefreshToken;
  delete setup.googleAdsRefreshToken;
  return setup;
}
