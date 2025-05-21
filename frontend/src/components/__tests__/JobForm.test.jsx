import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'; // Added act
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import JobForm from '../JobForm';
import * as api from '../../services/api'; // Import as namespace

// Mock the api module
vi.mock('../../services/api', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual, // Spread actual module to keep other exports if any
    addContact: vi.fn(), // Mock only addContact
  };
});

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
    localStorage.clear(); // Clear localStorage before each test
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

    // Use the mocked function from the imported namespace
    const mockedAddContact = vi.mocked(api.addContact);
    mockedAddContact.mockResolvedValueOnce(mockData);

    render(<JobForm onApplicationAdded={mockOnApplicationAdded} />);

    await act(async () => {
      await user.type(screen.getByLabelText(/entreprise/i), mockData.entreprise);
      await user.type(screen.getByLabelText(/poste/i), mockData.poste);
      
      const sourceSelect = screen.getByTestId('source-select');
      await user.selectOptions(sourceSelect, mockData.source);
      
      fireEvent.change(screen.getByLabelText(/date de postulation/i), { target: { value: mockData.datePostulation, name: 'datePostulation', type: 'date' } });
      
      const statutSelect = screen.getByLabelText(/statut/i);
      await user.selectOptions(statutSelect, mockData.statut);

      await user.click(screen.getByRole('button', { name: /ajouter/i }));
    });

    await waitFor(() => {
      expect(mockedAddContact).toHaveBeenCalledWith(expect.objectContaining({
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
      expect(vi.mocked(api.addContact)).not.toHaveBeenCalled();
    });
  });
});