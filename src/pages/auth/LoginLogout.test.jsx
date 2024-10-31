/**
 * @vitest-environment jsdom
 */
import Login from './Login';
import NavBar from '../../components/NavBar';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest';
import { HttpResponse, http } from "msw";
import { server } from '../../mocks/server'
import {CurrentUserProvider} from '../../contexts/CurrentUserContext'
import setupTests from '../../test-utils/setupTests'
import renderWithContext from '../../test-utils/renderWithContext';
const url = 'http://localhost:3001'
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { Route } from 'react-router-dom';

setupTests()

const globalHistory = createMemoryHistory({ initialEntries: ['/login'] })

const MockLogin = () => {
    return (
        <CurrentUserProvider>
            <Router history={globalHistory}>
                <NavBar />
                    <Route path={'/login'} render={() => <Login />} />
            </Router>
        </CurrentUserProvider>
    )
}
describe('RENDERING ELEMENTS', () => {
    test('Login form and image are rendered correctly', async () => {
        // Render component
        const { history } = renderWithContext(<Login />, null, 'login', null)
        // Find image
        const image = screen.getByRole('img', {name: /A film take board/i})
        expect(image).toBeInTheDocument()
        // Find inputs
        const emailInput = screen.getByRole('textbox', {name: /Email address/i})
        const passwordInput = screen.getByLabelText('Password')
        expect(emailInput).toBeInTheDocument()
        expect(passwordInput).toBeInTheDocument()
        // Find submit button
        const loginButton = screen.getByRole('button', {name: /Login/i})
        expect(loginButton).toBeInTheDocument()
        // Find text for signup redirect
        const signupText = screen.getByText("Don't have an account?")
        expect(signupText).toBeInTheDocument()
        // Find signup button
        const signupButton = screen.getByRole('button', {name: /Sign up/i})
        expect(signupButton).toBeInTheDocument()
        // Clicking signup button redirects user to sign up page
        const user = userEvent.setup()
        await user.click(signupButton)
        expect(history.location.pathname).toContain('/signup')
    })
})

describe('LOGIN / LOGOUT SUCCESS', () => {
    test('Submitting form with valid data takes user to home page, logout changes which links are displayed in navbar', async () => {
        // Render component
        render(<MockLogin />)
        // Find inputs
        const emailInput = screen.getByRole('textbox', {name: /Email address/i})
        const passwordInput = screen.getByLabelText('Password')
        // Assert that the user can input data into form
        fireEvent.change(emailInput, {target: {value: 'user@email.com'}})
        fireEvent.change(passwordInput, {target: {value: 'mypwd12345'}})
        expect(emailInput.value).toBe('user@email.com')
        expect(passwordInput.value).toBe('mypwd12345')
        // Assert that submitting form redirects user to home page
        const loginButton = screen.getByRole('button', {name: /Login/i})
        const user = userEvent.setup()
        await user.click(loginButton)
        expect(globalHistory.location.pathname).not.toContain('/login')
        // Clicking logout changes icons
        const logoutLink = screen.getByRole('link', {name: /Logout/i})
        expect(logoutLink).toBeInTheDocument()
        await user.click(logoutLink)
        const loggedOutNames = [/Sign up/i, /Login/i]
        const loggedInNames = [/My Films/i, /Profile/i, 'Friends', /Reccomendations/i]
        // Logged out links should be present
        loggedOutNames.map(
            linkName => expect(screen.getByRole('link', {
                name: linkName
            })).toBeInTheDocument()
        )
        // Logged in links should not be present
        loggedInNames.map(
            linkName => expect(screen.queryByRole('link', {
                name: linkName
            })).not.toBeInTheDocument()
        )
        // Logout list item should not be present
        const logout = screen.queryByText('Logout')
        expect(logout).not.toBeInTheDocument()
        // Logo should be present
        const logo = screen.getByRole('link', {
            name: 'Film Friends'
        })
        expect(logo).toBeInTheDocument()
    })
})

describe('LOGIN FAILURE', () => {
    test("Invalid email or password displays appropriate error message and doesn't redirect user to home page", async () => {
        // Reset handlers to return 400 error
        server.resetHandlers(
            http.post(`${url}/users/login`, () => {
                return HttpResponse.json(null, {status: 400})
            })
        )
        // Render component
        const { history } = renderWithContext(<Login />, null, 'login', null)
        // Find login button
        const loginButton = screen.getByRole('button', {name: /Login/i})
        const user = userEvent.setup()
        await user.click(loginButton)
        // Assert the correct error message is present
        const error = screen.getByText('Incorrect username or password')
        expect(error).toBeInTheDocument()
        // Assert that user has not been redirected to home page
        expect(history.location.pathname).toContain('/login')
    })
    test("System error displays appropriate error message and doesn't redirect user to home page", async () => {
        // Reset handlers to return 500 error
        server.resetHandlers(
            http.post(`${url}/users/login`, () => {
                return HttpResponse.json(null, {status: 500})
            })
        )
        // Render component
        const { history } = renderWithContext(<Login />, null, 'login', null)
        // Find login button
        const loginButton = screen.getByRole('button', {name: /Login/i})
        const user = userEvent.setup()
        await user.click(loginButton)
        // Assert the correct error message is present
        const error = screen.getByText('Currently unable to login. Please try again later.')
        expect(error).toBeInTheDocument()
        // Assert that user has not been redirected to home page
        expect(history.location.pathname).toContain('/login')
    })
})