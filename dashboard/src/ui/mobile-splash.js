/* Mobile splash — Spec §4.10 FR-10.2.
 * <1024px portrait: render splash with "Best on desktop" + mailto-yourself link.
 */

export function isMobileBlocked() {
  return window.innerWidth < 1024 && window.innerHeight > window.innerWidth;
}

export function renderMobileSplash(container) {
  const url = window.location.href;
  container.innerHTML = `
    <div class="mobile-splash">
      <div class="eyebrow">DALIO · ANALYTICAL WORKFLOW</div>
      <h1>Best on <em>desktop</em>.</h1>
      <p>The full analysis — twelve frameworks, regime chips, navigation, charts —
      is designed for screens 1024px and wider. Open on a laptop or larger
      tablet in landscape for the full experience.</p>
      <a class="email-link" href="mailto:?subject=Dalio%20dashboard&body=Open%20on%20laptop%3A%20${encodeURIComponent(url)}">Email this link to yourself</a>
    </div>`;
}
