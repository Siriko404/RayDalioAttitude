import { describe, it, expect } from 'vitest';

describe('slide shell', () => {
  it('renders eyebrow + one-point + caption + tab-group', async () => {
    const { renderSlideShell } = await import('../../src/ui/slide-shell.js');
    document.body.innerHTML = '<section id="s"></section>';
    renderSlideShell(document.getElementById('s'), {
      step: '03',
      section: '1.3 Long-Term Debt Cycle',
      onePoint: 'U.S. debt is at the *peak* of its 70-year long-term cycle.',
      caption: 'Total debt / GDP at <em>134%</em>; near zero-bound.',
      chartHtml: '<div class="chart-stub">[chart]</div>',
      notesHtml: '<p>Notes…</p>',
      sourcesHtml: '<p>Sources…</p>'
    });
    expect(document.querySelector('.eyebrow').textContent).toMatch(/STEP 03 OF 10/);
    expect(document.querySelector('.one-point').innerHTML).toContain('peak');
    expect(document.querySelector('.caption').innerHTML).toContain('134%');
    expect(document.querySelector('.tab-group')).not.toBeNull();
    expect(document.querySelector('.tab[data-tab="chart"]')).not.toBeNull();
    expect(document.querySelector('.tab[data-tab="notes"]')).not.toBeNull();
    expect(document.querySelector('.tab[data-tab="sources"]')).not.toBeNull();
  });

  it('Chart tab is open by default', async () => {
    const { renderSlideShell } = await import('../../src/ui/slide-shell.js');
    document.body.innerHTML = '<section id="s"></section>';
    renderSlideShell(document.getElementById('s'), {
      step: '01', section: 'X', onePoint: 'P', caption: 'C',
      chartHtml: '', notesHtml: '', sourcesHtml: ''
    });
    expect(document.querySelector('.tab-pane[data-pane="chart"]').dataset.open).toBe('true');
    expect(document.querySelector('.tab-pane[data-pane="notes"]').dataset.open).toBe('false');
  });
});
