/* Welcome screen — Spec §4.1 FR-1.1.
 * 1-page entry with title + 30-sec context + single Begin button.
 */

export function renderWelcome(container, { onBegin }) {
  container.innerHTML = `
    <div class="welcome">
      <div class="eyebrow">DALIO · ANALYTICAL WORKFLOW</div>
      <h1 class="welcome-title">Where are we, what does it mean,<br><em>what should I do?</em></h1>
      <p class="welcome-context">
        This dashboard walks you through Ray Dalio's twelve frameworks for understanding
        the economy and markets, applied to live data. It ends in one suggestion derived
        from his published recipes — not financial advice, not a forecast, just where
        Dalio's lens points today. Roughly two minutes to read end-to-end.
      </p>
      <button class="begin-btn">Begin →</button>
    </div>
  `;
  container.querySelector('.begin-btn').addEventListener('click', onBegin);
}
