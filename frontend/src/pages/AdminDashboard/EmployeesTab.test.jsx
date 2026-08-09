import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import EmployeesTab from './EmployeesTab';

// Mock axios to control API responses in tests
jest.mock('axios');

// Mock the AdminMetricsHeader component
jest.mock('../../components/AdminMetricsHeader', () => {
  return jest.fn(() => <div data-testid="admin-metrics-header"></div>);
});

const mockEmployees = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
    platformAccess: true,
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    department: 'Marketing',
    platformAccess: false,
  },
];

describe('EmployeesTab Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('should render loading state initially and then display employees', async () => {
    axios.get.mockResolvedValueOnce({ data: mockEmployees });

    render(<EmployeesTab />);

    // Check for loading state
    expect(screen.getByText('Loading employees...')).toBeInTheDocument();

    // Wait for the employee data to be displayed
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();

    // Check that loading state is gone
    expect(screen.queryByText('Loading employees...')).not.toBeInTheDocument();

    // Check for the access status buttons
    expect(screen.getByRole('button', { name: 'Revoke Access' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Grant Access' })).toBeInTheDocument();
  });

  test('should display an error message if fetching employees fails', async () => {
    const errorMessage = 'Failed to fetch employees';
    axios.get.mockRejectedValueOnce(new Error(errorMessage));

    render(<EmployeesTab />);

    // Wait for the error message to be displayed
    expect(await screen.findByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    expect(screen.queryByText('Loading employees...')).not.toBeInTheDocument();
  });

  test('should call the toggle access API and update the UI on button click', async () => {
    // Initial fetch
    axios.get.mockResolvedValueOnce({ data: mockEmployees });

    // Mock response for the PATCH request
    const updatedEmployee = { ...mockEmployees[0], platformAccess: false };
    axios.patch.mockResolvedValueOnce({
      data: {
        message: 'Access revoked successfully',
        employee: updatedEmployee,
      },
    });

    render(<EmployeesTab />);

    // Wait for initial data to load
    const revokeButton = await screen.findByRole('button', { name: 'Revoke Access' });
    expect(revokeButton).toBeInTheDocument();

    // Simulate user clicking the "Revoke Access" button for John Doe
    fireEvent.click(revokeButton);

    // Verify that the PATCH request was made to the correct endpoint
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        `/api/employees/${mockEmployees[0]._id}/access`,
        {} // The body is empty for this toggle endpoint
      );
    });

    // After the API call, the UI should update.
    // The button for John Doe should now say "Grant Access".
    // We find the button in the row that contains "John Doe".
    const johnsRow = screen.getByText('John Doe').closest('tr');
    const grantButton = await findByRole(johnsRow, 'button', { name: 'Grant Access' });
    expect(grantButton).toBeInTheDocument();

    // The original "Revoke Access" button for this user should be gone
    expect(queryByRole(johnsRow, 'button', { name: 'Revoke Access' })).not.toBeInTheDocument();
  });
});

// Helper to scope queries within an element
import { queryByRole, findByRole } from '@testing-library/react';