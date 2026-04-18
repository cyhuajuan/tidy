import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { priority: _priority, ...rest } = props;
    return createElement('img', rest);
  },
}));
