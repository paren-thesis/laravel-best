import { describe, expect, it } from 'vitest';
import { NAV_ITEMS, visibleNavItems } from './navigation';

const pathsFor = (roles: Parameters<typeof visibleNavItems>[0]) =>
  visibleNavItems(roles).map((item) => item.to);

describe('visibleNavItems', () => {
  it('shows a student their own pages and nothing staff-only', () => {
    expect(pathsFor(['student'])).toEqual(['/', '/proposals', '/team']);
  });

  it('shows a coordinator the staff pages but not the student team page', () => {
    const paths = pathsFor(['coordinator']);
    expect(paths).toContain('/supervision');
    expect(paths).toContain('/rubrics');
    expect(paths).toContain('/reports');
    expect(paths).not.toContain('/team');
  });

  it('gives a supervisor defense scoring and reports but not supervisor allocation', () => {
    const paths = pathsFor(['supervisor']);
    expect(paths).toContain('/defense');
    expect(paths).toContain('/reports');
    expect(paths).not.toContain('/supervision');
    expect(paths).not.toContain('/rubrics');
  });

  it('gives a panel member defense scoring only, beyond the shared pages', () => {
    expect(pathsFor(['panel_member'])).toEqual(['/', '/proposals', '/defense']);
  });

  it('unions the entries when a lecturer holds several roles at once', () => {
    const paths = pathsFor(['supervisor', 'coordinator']);
    expect(paths).toContain('/supervision');
    expect(paths).toContain('/defense');
    expect(paths).toContain('/rubrics');
  });

  it('never repeats an entry for a user holding overlapping roles', () => {
    const paths = pathsFor(['coordinator', 'admin']);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('always includes the entries that carry no role restriction', () => {
    const unrestricted = NAV_ITEMS.filter((item) => !item.roles).map((item) => item.to);
    expect(pathsFor(['student'])).toEqual(expect.arrayContaining(unrestricted));
    expect(pathsFor(['admin'])).toEqual(expect.arrayContaining(unrestricted));
  });
});
