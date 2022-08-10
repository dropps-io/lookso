import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PostInput from './PostInput';

describe('<PostInput />', () => {
  test('it should mount', () => {
    render(<PostInput />);
    
    const postInput = screen.getByTestId('PostInput');

    expect(postInput).toBeInTheDocument();
  });
});