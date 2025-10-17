import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HowItWorks from './HowItWorks';

describe('HowItWorks Component', () => {
  test('renders the main heading', () => {
    render(
      <MemoryRouter>
        <HowItWorks />
      </MemoryRouter>
    );
    
    // Check if the heading "How It Works" is in the document
    const headingElement = screen.getByText(/How It Works/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders all three steps with their titles', () => {
    render(
      <MemoryRouter>
        <HowItWorks />
      </MemoryRouter>
    );

    // Check for the titles of each step
    expect(screen.getByText(/Pick a Plan You Want/i)).toBeInTheDocument();
    expect(screen.getByText(/Join a Verified Group/i)).toBeInTheDocument();
    expect(screen.getByText(/Enjoy Premium & Save/i)).toBeInTheDocument();
  });
});