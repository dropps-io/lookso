import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import PostBox from './PostBox';

describe('<PostBoxBox />', () => {
  test('it should mount', () => {
    render(<PostBox />);
    
    const feedPost = screen.getByTestId('Post');

    expect(feedPost).toBeInTheDocument();
  });
});