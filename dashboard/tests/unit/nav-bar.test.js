import { describe, it, expect } from 'vitest';

const NAV_GROUPS = [
  { id: '1.1', label: 'Economic Machine', cells: 4, kind: 'live' },
  { id: '1.2', label: 'Short Cycle', cells: 4, kind: 'live' },
  { id: '1.3', label: 'Long Debt', cells: 4, kind: 'live' },
  { id: '1.4', label: 'Deleveragings', cells: 4, kind: 'live' },
  { id: '1.7', label: 'Inflation', cells: 4, kind: 'live' },
  { id: '1.5', label: 'Paradigms', cells: 3, kind: 'live' },
  { id: '1.6', label: 'World Order', cells: 4, kind: 'live' },
  { id: '2.2', label: 'All-Weather', cells: 4, kind: 'live' },
  { id: '2.5', label: 'Stress', cells: 4, kind: 'live' },
  { id: '2.4', label: 'Risk Parity', cells: 4, kind: 'live' },
  { id: '2.1', label: 'Holy Grail', cells: 3, kind: 'edu' },
  { id: '2.3', label: 'Alpha', cells: 3, kind: 'edu' }
];

describe('nav bar', () => {
  it('renders 12 groups in DAG order', async () => {
    const { renderNavBar } = await import('../../src/nav/nav-bar.js');
    document.body.innerHTML = '<nav id="n"></nav>';
    renderNavBar(document.getElementById('n'), NAV_GROUPS);
    const groups = document.querySelectorAll('.nav-group');
    expect(groups.length).toBe(12);
    expect(groups[0].dataset.groupId).toBe('1.1');
    expect(groups[11].dataset.groupId).toBe('2.3');
  });

  it('edu groups get dashed-line class', async () => {
    const { renderNavBar } = await import('../../src/nav/nav-bar.js');
    document.body.innerHTML = '<nav id="n"></nav>';
    renderNavBar(document.getElementById('n'), NAV_GROUPS);
    const eduGroup = document.querySelector('.nav-group[data-group-id="2.1"]');
    expect(eduGroup.dataset.kind).toBe('edu');
  });

  it('each group has cells matching count', async () => {
    const { renderNavBar } = await import('../../src/nav/nav-bar.js');
    document.body.innerHTML = '<nav id="n"></nav>';
    renderNavBar(document.getElementById('n'), NAV_GROUPS);
    const cells = document.querySelectorAll('.nav-group[data-group-id="1.1"] .nav-cell');
    expect(cells.length).toBe(4);
  });

  it('group has label visible only for current group OR on bar hover (managed via CSS)', async () => {
    const { renderNavBar } = await import('../../src/nav/nav-bar.js');
    document.body.innerHTML = '<nav id="n"></nav>';
    renderNavBar(document.getElementById('n'), NAV_GROUPS);
    expect(document.querySelector('.nav-group .nav-group-label')).not.toBeNull();
  });
});
