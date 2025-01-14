import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EditJobForm from '../EditJobForm';
import { updateContact } from '../../services/api';

// Mock the api module
vi.mock('../../services/api', () => ({
  updateContact: vi.fn()
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

describe('EditJobForm', () => {
  const mockOnClose = vi.fn();
  const mockOnContactUpdated = vi.fn();
  const user = userEvent.setup();

  const mockContact = {
    _id: '123',
    entreprise: 'Test Company',
    poste: 'Developer',
    source: 'LinkedIn',
    datePostulation: '2024-02-20',
    statut: 'postulé',
    documents: ['CV', 'Lettre de motivation'],
    emailEmployeur: 'test@example.com',
    telephoneContact: '123-456-7890',
    commentaires: 'Test comment',
    tags: ['urgent', 'remote']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with initial contact data', () => {
    render(
      <EditJobForm
        contact={mockContact}
        onClose={mockOnClose}
        onContactUpdated={mockOnContactUpdated}
      />
    );

    expect(screen.getByDisplayValue(mockContact.entreprise)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockContact.poste)).toBeInTheDocument();
    expect(screen.getByTestId('source-select')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockContact.emailEmployeur)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockContact.telephoneContact)).toBeInTheDocument();
  });

  it('updates contact data successfully', async () => {
    updateContact.mockResolvedValueOnce({ ...mockContact, poste: 'Senior Developer' });

    render(
      <EditJobForm
        contact={mockContact}
        onClose={mockOnClose}
        onContactUpdated={mockOnContactUpdated}
      />
    );

    const posteInput = screen.getByLabelText(/poste/i);
    await user.clear(posteInput);
    await user.type(posteInput, 'Senior Developer');

    await user.click(screen.getByRole('button', { name: /sauvegarder/i }));

    await waitFor(() => {
      expect(updateContact).toHaveBeenCalledWith(mockContact._id, expect.objectContaining({
        poste: 'Senior Developer'
      }));
      expect(mockOnContactUpdated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('closes the modal when cancel is clicked', async () => {
    render(
      <EditJobForm
        contact={mockContact}
        onClose={mockOnClose}
        onContactUpdated={mockOnContactUpdated}
      />
    );

    await user.click(screen.getByRole('button', { name: /annuler/i }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles tag management', async () => {
    render(
      <EditJobForm
        contact={mockContact}
        onClose={mockOnClose}
        onContactUpdated={mockOnContactUpdated}
      />
    );

    // Add a new tag
    const tagInput = screen.getByPlaceholder(/ajouter un tag/i);
    await user.type(tagInput, 'nouveau tag{enter}');

    // Remove an existing tag
    const removeTagButton = screen.getByRole('button', { name: /supprimer urgent/i });
    await user.click(removeTagButton);

    await user.click(screen.getByRole('button', { name: /sauvegarder/i }));

    await waitFor(() => {
      expect(updateContact).toHaveBeenCalledWith(mockContact._id, expect.objectContaining({
        tags: expect.arrayContaining(['remote', 'nouveau tag'])
      }));
    });
  });
}); 