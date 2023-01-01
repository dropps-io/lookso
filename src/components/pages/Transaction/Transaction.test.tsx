import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Transaction from './Transaction';

describe('<Transaction />', () => {
  test('it should mount', () => {
    render(<Transaction />);
    
    const transaction = screen.getByTestId('Transaction');

    expect(transaction).toBeInTheDocument();
  });
});