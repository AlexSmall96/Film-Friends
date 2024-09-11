/**
 * @jest-environment jsdom
 */
import App from './App'
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom'

describe('All elements are rendered correctly', () => {
  test('Logo, logged out nav icons and friend search bar should be present', () => {
    render(<App />);
    // Assert navbar, home page text and film search bar are present
    const logo = screen.getByRole("link", {
      name: /Film Friends/i,
    });
    const signUp = screen.getByRole('link', {
      name: /Sign up/i
    })
    const login = screen.getByRole('link', {
      name: /login/i
    })
    const friendSearch = screen.getByLabelText('Find your friends')
    expect(logo).toBeInTheDocument()
    expect(signUp).toBeInTheDocument()
    expect(login).toBeInTheDocument()
    expect(friendSearch).toBeInTheDocument()
  });
  
  test('Home page text and film search bar should be present', () => {
    render(<App />);
    const home = screen.getByRole('heading', {
      name: /Home Page/i
    })
    const filmSearch = screen.getByLabelText('Search for a film')
    expect(home).toBeInTheDocument()
    expect(filmSearch).toBeInTheDocument()
  })
})







