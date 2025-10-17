// src/components/AdminRequired.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminRequired from './AdminRequired';
import { supabase } from '../lib/supabaseClient';

// Mock the components that would be rendered
const AdminPage = () => <div>Admin Dashboard</div>;
const HomePage = () => <div>Homepage</div>;

// Mock the session object
const mockSession = {
  user: { id: 'user-123' },
};

// This tells Jest to use the mock we created
jest.mock('../lib/supabaseClient');

describe('AdminRequired Component', () => {

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  test('should render the admin page if the user is an admin', async () => {
    // MOCK a successful response from our server-side function
    supabase.functions.invoke.mockResolvedValue({
      data: { isAdmin: true },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<AdminRequired session={mockSession} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Wait for the component to finish loading and check if "Admin Dashboard" is visible
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });

  test('should redirect to the homepage if the user is not an admin', async () => {
    // MOCK a failure response from our server-side function
    supabase.functions.invoke.mockResolvedValue({
      data: { isAdmin: false },
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<AdminRequired session={mockSession} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Wait for the component to finish loading and check if "Homepage" is visible
    await waitFor(() => {
      expect(screen.getByText('Homepage')).toBeInTheDocument();
    });
  });

  test('should redirect to the homepage if the function call fails', async () => {
    // --- START OF NEW CODE ---
    // Temporarily silence the expected console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // --- END OF NEW CODE ---

    // MOCK a network error or function failure
    supabase.functions.invoke.mockRejectedValue(new Error('Function invocation failed'));
    
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<AdminRequired session={mockSession} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Wait for the redirect to happen and check if "Homepage" is visible
    await waitFor(() => {
      expect(screen.getByText('Homepage')).toBeInTheDocument();
    });

    // --- START OF NEW CODE ---
    // Restore the original console.error function after the test
    consoleErrorSpy.mockRestore();
    // --- END OF NEW CODE ---
  });

});