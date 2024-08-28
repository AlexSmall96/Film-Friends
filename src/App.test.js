/**
 * @jest-environment jsdom
 */
import App from './App'
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom'

test('Nav bar, home page text and film search should be present', () => {
  render(<App />);
  // Assert navbar, home page text and film search bar are present
  const NavBar = screen.getByTestId('nav-bar');
  const homePageText = screen.getByText(/Home Page/)
  const filmSearchLabel = screen.getByText(/Search for a film/)
  const filmSearchBar = screen.getByTestId('film-search');
  expect(NavBar).toBeInTheDocument();
  expect(homePageText).toBeInTheDocument()
  expect(filmSearchLabel).toBeInTheDocument()
  expect(filmSearchBar).toBeInTheDocument()
});




