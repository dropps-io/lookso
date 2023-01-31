import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import CustomModal from './CustomModal';

describe('<CustomModal />', () => {
  test('it should mount', () => {
    render(<CustomModal />);

    const customModal = screen.getByTestId('CustomModal');

    expect(customModal).toBeInTheDocument();
  });
});
