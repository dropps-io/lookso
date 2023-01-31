import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import SubComments from './SubComments';

describe('<SubComments />', () => {
  test('it should mount', () => {
    render(<SubComments />);

    const subComments = screen.getByTestId('SubComments');

    expect(subComments).toBeInTheDocument();
  });
});
