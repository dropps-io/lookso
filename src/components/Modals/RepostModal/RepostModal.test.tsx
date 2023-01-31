import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import RepostModal from './RepostModal';

describe('<RepostModal />', () => {
  test('it should mount', () => {
    render(<RepostModal />);

    const repostModal = screen.getByTestId('RepostModal');

    expect(repostModal).toBeInTheDocument();
  });
});
