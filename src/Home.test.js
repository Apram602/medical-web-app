import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

describe('Home', () => {
  test('renders Home component correctly', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Check if key elements are rendered
    expect(screen.getByText('Welcome to Your Healthcare Solution')).toBeInTheDocument();
    expect(screen.getByText('Upload Medical Documents')).toBeInTheDocument();
    expect(screen.getByText('Book an Appointment')).toBeInTheDocument();
  });
});