const API_URL = 'http://localhost:5000/api';

export const getContacts = async () => {
  try {
    console.log('Fetching contacts...');
    const response = await fetch(`${API_URL}/contacts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Contacts fetched:', data);
    return data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
};

export const addContact = async (contactData) => {
  try {
    console.log('Adding contact:', contactData);
    const response = await fetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Contact added:', data);
    return data;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
};

export const updateContact = async (id, contactData) => {
  try {
    console.log('Updating contact:', id, contactData);
    const response = await fetch(`${API_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Contact updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

export const deleteContact = async (id) => {
  try {
    console.log('Deleting contact:', id);
    const response = await fetch(`${API_URL}/contacts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Contact deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

export const getSources = async () => {
  try {
    console.log('Fetching sources...');
    const response = await fetch(`${API_URL}/sources`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Sources fetched:', data);
    return data;
  } catch (error) {
    console.error('Error fetching sources:', error);
    return [];
  }
};

export const addSource = async (sourceData) => {
  try {
    console.log('Adding source:', sourceData);
    const response = await fetch(`${API_URL}/sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sourceData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Source added:', data);
    return data;
  } catch (error) {
    console.error('Error adding source:', error);
    throw error;
  }
};

export const incrementSourceUsage = async (sourceId) => {
  try {
    console.log('Incrementing source usage:', sourceId);
    const response = await fetch(`${API_URL}/sources/${sourceId}/increment`, {
      method: 'PUT'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Source usage incremented:', data);
    return data;
  } catch (error) {
    console.error('Error incrementing source usage:', error);
    throw error;
  }
};

export const deleteSource = async (sourceId) => {
  try {
    console.log('Deleting source:', sourceId);
    const response = await fetch(`${API_URL}/sources/${sourceId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Source deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting source:', error);
    throw error;
  }
}; 