import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import AddressFeedDisplay from './AddressFeedDisplay';

describe('<AddressFeedDisplay />', () => {
  test('it should mount', () => {
    render(<AddressFeedDisplay />);

    const addressFeedDisplay = screen.getByTestId('AddressFeedDisplay');

    expect(addressFeedDisplay).toBeInTheDocument();
  });
});
