import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders home page content', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );
  // Adjust this to match something in your Home component
  const homeElement = screen.getByText(/welcome/i); // Example: "Welcome to Doc On Go"
  expect(homeElement).toBeInTheDocument();
});