import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FollowModal from './FollowModal';

describe('<FollowModal />', () => {
  test('it should mount', () => {
    render(<FollowModal />);
    
    const followModal = screen.getByTestId('FollowModal');

    expect(followModal).toBeInTheDocument();
  });
});