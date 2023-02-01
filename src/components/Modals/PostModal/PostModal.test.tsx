import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import PostModal from './PostModal';

describe('<PostModal />', () => {
  test('it should mount', () => {
    render(<PostModal />);

    const repostModal = screen.getByTestId('PostModal');

    expect(repostModal).toBeInTheDocument();
  });
});
