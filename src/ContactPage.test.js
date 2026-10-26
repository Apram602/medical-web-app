import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import ContactPage from './ContactPage';

// Mock axios
jest.mock('axios');

describe('ContactPage', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue('mock-token'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders ContactPage component correctly', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    // Check if the heading and description are rendered
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText("We're here to assist you. Fill out the form below!")).toBeInTheDocument();

    // Check if form inputs are rendered
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contact No.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Subject')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

    // Check if static content is rendered
    expect(screen.getByText('Connect with Care')).toBeInTheDocument();
    expect(screen.getByText('Your health journey matters to us. Reach out for support and guidance.')).toBeInTheDocument();
    expect(screen.getByText('Contact us at')).toBeInTheDocument();
    expect(screen.getByText('docongo@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Follow Us On Social Media')).toBeInTheDocument();
  });

  test('submits the form successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Message sent successfully!' } });

    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    // Fill out the form
    await userEvent.type(screen.getByPlaceholderText('Name'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('Contact No.'), '1234567890');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'john.doe@example.com');
    await userEvent.type(screen.getByPlaceholderText('Subject'), 'Test Subject');
    await userEvent.type(screen.getByPlaceholderText('Message'), 'This is a test message.');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for the success message
    await waitFor(() => {
      expect(screen.getByText('Message sent successfully!')).toBeInTheDocument();
    });

    // Verify axios.post was called with the correct data
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:3001/api/contact',
      {
        name: 'John Doe',
        contactNo: '1234567890',
        email: 'john.doe@example.com',
        subject: 'Test Subject',
        message: 'This is a test message.',
      },
      {
        headers: {
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        },
      }
    );

    // Verify form fields are cleared after submission
    expect(screen.getByPlaceholderText('Name').value).toBe('');
    expect(screen.getByPlaceholderText('Contact No.').value).toBe('');
    expect(screen.getByPlaceholderText('Email').value).toBe('');
    expect(screen.getByPlaceholderText('Subject').value).toBe('');
    expect(screen.getByPlaceholderText('Message').value).toBe('');
  });

  test('displays error message on form submission failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to send message'));

    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    // Fill out the form
    await userEvent.type(screen.getByPlaceholderText('Name'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('Contact No.'), '1234567890');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'john.doe@example.com');
    await userEvent.type(screen.getByPlaceholderText('Subject'), 'Test Subject');
    await userEvent.type(screen.getByPlaceholderText('Message'), 'This is a test message.');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('Failed to send message. Please try again.')).toBeInTheDocument();
    });
  });

  test('displays error message if user is not authenticated', async () => {
    // Mock localStorage to return no token
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    // Fill out the form
    await userEvent.type(screen.getByPlaceholderText('Name'), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('Contact No.'), '1234567890');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'john.doe@example.com');
    await userEvent.type(screen.getByPlaceholderText('Subject'), 'Test Subject');
    await userEvent.type(screen.getByPlaceholderText('Message'), 'This is a test message.');

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('Failed to send message. Please try again.')).toBeInTheDocument();
    });
  });
});