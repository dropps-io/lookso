import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import ProfileDropdown from './ProfileDropdown';

describe('<ProfileDropdown />', () => {
  test('it should mount', () => {
    render(<ProfileDropdown />);

    const profileDropdown = screen.getByTestId('ProfileDropdown');

    expect(profileDropdown).toBeInTheDocument();
  });
});
