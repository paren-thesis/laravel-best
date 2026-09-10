import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library only registers its own automatic cleanup when Vitest globals
// are enabled. This project keeps globals off, so unmount explicitly — without
// it, each test's DOM accumulates and queries match elements from earlier tests.
afterEach(() => {
  cleanup();
});
