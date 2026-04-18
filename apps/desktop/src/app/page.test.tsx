import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from './page';

describe('Home page', () => {
  it('renders the starter heading and links', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /to get started, edit the page\.tsx file\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /templates/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /documentation/i }),
    ).toBeInTheDocument();
  });
});
