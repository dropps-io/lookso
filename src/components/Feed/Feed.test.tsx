import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Feed from './Feed';

describe('<Feed />', () => {
  test('it should mount', () => {
    render(<Feed />);
    
    const feed = screen.getByTestId('Feed');

    expect(feed).toBeInTheDocument();
  });
});