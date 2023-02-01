import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import CommentModal from './CommentModal';

describe('<CommentModal />', () => {
  test('it should mount', () => {
    render(<CommentModal />);

    const modalsCommentModal = screen.getByTestId('CommentModal');

    expect(modalsCommentModal).toBeInTheDocument();
  });
});
