import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SettingsTab from './SettingsTab';

// Mock the AdminMetricsHeader component to isolate the SettingsTab component during testing.
jest.mock('../../components/AdminMetricsHeader', () => {
  return jest.fn(() => <div data-testid="admin-metrics-header"></div>);
});

describe('SettingsTab Component', () => {
  // Mock window.alert before each test to spy on its calls.
  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  // Restore the original implementation after each test.
  afterEach(() => {
    window.alert.mockRestore();
  });

  test('should render the form with initial default values', () => {
    render(<SettingsTab />);

    // Verify that the form fields are rendered with their initial state values.
    expect(screen.getByLabelText('Company Name')).toHaveValue('Odoo Pvt. Ltd.');
    expect(screen.getByLabelText('Industry')).toHaveValue('Software');
    expect(screen.getByLabelText('Registered Address')).toHaveValue('Anandnagar, Ahmedabad');
    expect(screen.getByLabelText('Admin Contact Email')).toHaveValue('admin@odoo.com');
    expect(screen.getByLabelText('Fuel Cost / Liter (₹)')).toHaveValue(96.5);
    expect(screen.getByLabelText('Cost Per KM (₹)')).toHaveValue(8.0);
    expect(screen.getByLabelText('Travel Cost Operational (₹/km)')).toHaveValue(2.5);

    // Verify the mocked child component is present.
    expect(screen.getByTestId('admin-metrics-header')).toBeInTheDocument();
  });

  test('should update state correctly when a text input is changed', () => {
    render(<SettingsTab />);
    const companyNameInput = screen.getByLabelText('Company Name');

    // Simulate a user typing in the "Company Name" input field.
    fireEvent.change(companyNameInput, {
      target: { name: 'companyName', value: 'Rapido Corp' },
    });

    // Assert that the input's value has been updated.
    expect(companyNameInput).toHaveValue('Rapido Corp');
  });

  test('should update state and parse number when a number input is changed', () => {
    render(<SettingsTab />);
    const fuelCostInput = screen.getByLabelText('Fuel Cost / Liter (₹)');

    // Simulate a user changing the value of the "Fuel Cost" input.
    fireEvent.change(fuelCostInput, {
      target: { name: 'fuelCostPerLiter', value: '99.99', type: 'number' },
    });

    // Assert that the input's value has been updated to the new number.
    expect(fuelCostInput).toHaveValue(99.99);
  });

  test('should default to 0 if a number input is cleared', () => {
    render(<SettingsTab />);
    const travelCostInput = screen.getByLabelText('Cost Per KM (₹)');

    // Simulate clearing the input field.
    fireEvent.change(travelCostInput, {
      target: { name: 'travelCostPerKm', value: '', type: 'number' },
    });

    // The `handleChange` logic correctly coerces an empty string to 0 for number inputs.
    expect(travelCostInput).toHaveValue(0);
  });

  test('should call alert on form submission', () => {
    render(<SettingsTab />);
    const saveButton = screen.getByRole('button', { name: /Save Settings/i });

    fireEvent.click(saveButton);

    expect(window.alert).toHaveBeenCalledWith('Organization Carpooling configurations saved successfully!');
    expect(window.alert).toHaveBeenCalledTimes(1);
  });
});