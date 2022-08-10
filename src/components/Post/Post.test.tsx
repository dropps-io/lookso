import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Post from './Post';

describe('<Post />', () => {
  test('it should mount', () => {
    render(<Post />);
    
    const feedPost = screen.getByTestId('Post');

    expect(feedPost).toBeInTheDocument();
  });
});