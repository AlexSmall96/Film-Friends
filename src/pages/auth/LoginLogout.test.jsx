/**
 * @vitest-environment jsdom
 */
import App from '../../App';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { describe, test, expect, afterEach, beforeAll, afterAll, beforeEach } from 'vitest';
import { HttpResponse, http } from "msw";
import { server } from '../../mocks/server'
import { handlers } from '../../mocks/handlers';
import {CurrentUserProvider} from '../../contexts/CurrentUserContext'
import Login from './Login'
const url = 'http://localhost:3001'

beforeAll(() => {
    server.listen()
})

beforeEach(() => {
    server.resetHandlers(...handlers)
})
afterEach(() => {
    cleanup()
})
  
afterAll(() => {
    server.close()
})

describe('Login/logout success ', () => {
    test('User logs in and logs out successfully and is redirected to home page after each', async () => {
        // Render app
        render(<App />)
        // Find and click login link
        const login = screen.getByRole('link', {name: /Login/i})
        const user = userEvent.setup()
        await user.click(login)
        // Assert sign up heading is rendered
        const loginHeading = screen.getByRole('heading', {name: /Login/i})
        expect(loginHeading).toBeInTheDocument()
        // Assert that form inputs and submit button are rendered
        const emailInput = screen.getByRole('textbox', {name: /Email/i})
        const passwordInput = screen.getByLabelText('Password:')
        const submitButton = screen.getByRole('button')
        expect(emailInput).toBeInTheDocument()
        expect(passwordInput).toBeInTheDocument()
        expect(submitButton).toBeInTheDocument()
        // Assert that the user can input data into form
        fireEvent.change(emailInput, {target: {value: 'user@email.com'}})
        fireEvent.change(passwordInput, {target: {value: 'mypwd12345'}})
        expect(emailInput.value).toBe('user@email.com')
        expect(passwordInput.value).toBe('mypwd12345')
        // Assert only logged out nav links are showing
        const loggedOutNames = [/Sign up/i, /Login/i]
        const loggedInNames = [/My Films/i, /Profile/i, 'Friends', /Reccomendations/i, /Logout/i]
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
        // User submits form to log in
        await user.click(submitButton)
        // Assert that user has been redirected to home page
        const pageNames = ['signup', 'login', 'myfilms', 'profile', 'friends', 'reccomendations', 'logout']
        pageNames.map(pageName =>
            expect(global.window.location.href).not.toContain(pageName)
        )
        // Logged out links should not be present
        loggedOutNames.map(
            linkName => expect(screen.queryByRole('link', {
                name: linkName
            })).not.toBeInTheDocument()
        )
        // Logged in links should now be present
        loggedInNames.map(
            linkName => expect(screen.getByRole('link', {
                name: linkName
            })).toBeInTheDocument()
        )
        // Find and click logout link
        const logout = screen.getByRole('link', {name: /Logout/i})
        await user.click(logout)
        // Logged out links should now be present
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
        // Assert that user has been redirected to home page
        pageNames.map(pageName =>
            expect(global.window.location.href).not.toContain(pageName)
        )
    })
})

describe('Login failure', () => {
    test('Invalid login data shows appropriate error message', async () => {
        server.resetHandlers(
            http.post(`${url}/users/login`, () => {
                return HttpResponse.json(null, {status: 400})
            })
        )
        render(
            <CurrentUserProvider>
                <Login />
            </CurrentUserProvider>
        )
        const user = userEvent.setup()
        // Find and click login button
        const submitButton = screen.getByRole('button')
        // User submits form to log in
        await user.click(submitButton)
        const errorMessage = screen.getByText('Incorrect username or password')
        expect(errorMessage).toBeInTheDocument()
    })

    test('Any other error shows appropriate errror message', async () => {
        server.resetHandlers(
            http.post(`${url}/users/login`, () => {
                return HttpResponse.json(null, {status: 500})
            })
        )
        render(
            <CurrentUserProvider>
                <Login />
            </CurrentUserProvider>
        )
        const user = userEvent.setup()
        // Find and click login button
        const submitButton = screen.getByRole('button')
        // User submits form to log in
        await user.click(submitButton)
        const errorMessage = screen.getByText('Currently unable to login. Please try again later.')
        expect(errorMessage).toBeInTheDocument()
    })
})