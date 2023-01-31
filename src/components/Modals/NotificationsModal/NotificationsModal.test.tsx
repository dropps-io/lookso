import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';
import NotificationsModal from './NotificationsModal';

describe('<NotificationsModal />', () => {
  test('it should mount', () => {
    render(<NotificationsModal />);

    const notificationsModal = screen.getByTestId('NotificationsModal');

    expect(notificationsModal).toBeInTheDocument();
  });
});
