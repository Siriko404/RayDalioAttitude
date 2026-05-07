/* Settings link — Spec §4.1 FR-1.5.
 * Header link that triggers wizard re-edit + clears localStorage.
 */
import { clearWizard } from './persistence.js';

export function renderSettingsLink(container, onClick) {
  const btn = document.createElement('button');
  btn.className = 'settings-link';
  btn.style.cssText = 'background:transparent;border:0;color:var(--fg);font-family:var(--font-mono);font-size:9px;font-weight:500;letter-spacing:3px;text-transform:uppercase;padding:8px 12px;cursor:pointer;margin-left:auto';
  btn.textContent = 'Settings';
  btn.addEventListener('click', () => {
    clearWizard();
    onClick();
  });
  container.appendChild(btn);
}
