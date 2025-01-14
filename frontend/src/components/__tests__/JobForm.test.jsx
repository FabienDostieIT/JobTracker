import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import JobForm from '../JobForm';
import { addContact } from '../../services/api';

// Mock the api module
vi.mock('../../services/api', () => ({
  addContact: vi.fn()
}));

// Mock SourceSelect component
vi.mock('../SourceSelect', () => ({
  default: ({ value, onChange }) => (
    <select
      data-testid="source-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="LinkedIn">LinkedIn</option>
      <option value="Indeed">Indeed</option>
    </select>
  )
}));

describe('JobForm', () => {
  const mockOnApplicationAdded = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<JobForm onApplicationAdded={mockOnApplicationAdded} />);
    
    expect(screen.getByLabelText(/entreprise/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/poste/i)).toBeInTheDocument();
    expect(screen.getByTestId('source-select')).toBeInTheDocument();
    expect(screen.getByLabelText(/date de postulation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/statut/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    const mockData = {
      entreprise: 'Test Company',
      poste: 'Developer',
      source: 'LinkedIn',
      datePostulation: '2024-02-20',
      statut: 'postulé',
      documents: [],
      tags: []
    };

    addContact.mockResolvedValueOnce(mockData);

    render(<JobForm onApplicationAdded={mockOnApplicationAdded} />);

    await user.type(screen.getByLabelText(/entreprise/i), mockData.entreprise);
    await user.type(screen.getByLabelText(/poste/i), mockData.poste);
    
    const sourceSelect = screen.getByTestId('source-select');
    await user.selectOptions(sourceSelect, mockData.source);
    
    await user.type(screen.getByLabelText(/date de postulation/i), mockData.datePostulation);
    
    const statutSelect = screen.getByLabelText(/statut/i);
    await user.selectOptions(statutSelect, mockData.statut);

    await user.click(screen.getByRole('button', { name: /ajouter/i }));

    await waitFor(() => {
      expect(addContact).toHaveBeenCalledWith(expect.objectContaining({
        entreprise: mockData.entreprise,
        poste: mockData.poste,
        source: mockData.source,
        datePostulation: mockData.datePostulation,
        statut: mockData.statut
      }));
      expect(mockOnApplicationAdded).toHaveBeenCalled();
    });
  });

  it('shows validation errors for required fields', async () => {
    render(<JobForm onApplicationAdded={mockOnApplicationAdded} />);

    // Clear any default values
    const entrepriseInput = screen.getByLabelText(/entreprise/i);
    const posteInput = screen.getByLabelText(/poste/i);
    
    await user.clear(entrepriseInput);
    await user.clear(posteInput);

    await user.click(screen.getByRole('button', { name: /ajouter/i }));

    await waitFor(() => {
      expect(entrepriseInput).toBeInvalid();
      expect(posteInput).toBeInvalid();
      expect(addContact).not.toHaveBeenCalled();
    });
  });
}); 