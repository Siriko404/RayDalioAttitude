import { vi } from 'vitest';
vi.mock('gsap', () => ({
  gsap: {
    timeline: () => ({
      set: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis()
    }),
    set: vi.fn()
  }
}));
