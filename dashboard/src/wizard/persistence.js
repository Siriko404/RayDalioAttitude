/* localStorage persistence for wizard inputs. Spec §4.1 FR-1.5. */
const KEY = 'dalio_dashboard_wizard_v1';

export function saveWizard(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch (e) { console.warn('saveWizard failed', e); }
}

export function loadWizard() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearWizard() { localStorage.removeItem(KEY); }
