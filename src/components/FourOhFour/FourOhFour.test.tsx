import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import FourOhFour from './FourOhFour';

describe('<FourOhFour />', () => {
  test('it should mount', () => {
    render(<FourOhFour />);

    const fourOhFour = screen.getByTestId('FourOhFour');

    expect(fourOhFour).toBeInTheDocument();
  });
});
