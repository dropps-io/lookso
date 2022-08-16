import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AssetTag from './AssetTag';

describe('<AssetTag />', () => {
  test('it should mount', () => {
    render(<AssetTag />);
    
    const assetTag = screen.getByTestId('AssetTag');

    expect(assetTag).toBeInTheDocument();
  });
});