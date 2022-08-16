import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserTag from './UserTag';

describe('<UserTag />', () => {
  test('it should mount', () => {
    render(<UserTag />);
    
    const userTag = screen.getByTestId('UserTag');

    expect(userTag).toBeInTheDocument();
  });
});