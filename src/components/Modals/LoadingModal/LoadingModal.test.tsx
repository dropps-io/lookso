import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import LoadingModal from './LoadingModal';

describe('<LoadingModal />', () => {
  test('it should mount', () => {
    render(<LoadingModal />);

    const loadingModal = screen.getByTestId('LoadingModal');

    expect(loadingModal).toBeInTheDocument();
  });
});
