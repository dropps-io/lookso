import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ActionModal from './ActionModal';

describe('<ActionModal />', () => {
  test('it should mount', () => {
    render(<ActionModal />);
    
    const actionModal = screen.getByTestId('ActionModal');

    expect(actionModal).toBeInTheDocument();
  });
});