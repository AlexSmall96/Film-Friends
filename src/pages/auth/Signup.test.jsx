/**
 * @vitest-environment jsdom
 */
import App from '../../App';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { describe, test, expect, afterEach, beforeAll, afterAll } from 'vitest';
import { HttpResponse, http } from "msw";
import { server } from '../../mocks/server'
const url = 'http://localhost:3001'

beforeAll(() => {
    server.listen()
})
  
afterEach(() => {
    cleanup()
})
  
afterAll(() => {
    server.close()
})

describe('Signing up with valid data', () => {
    test('Submitting form with valid data takes user to login page', async () => {
        // Render app
        render(<App />)
        // Find and click sign up link
        const signup = screen.getByRole('link', {name: /Sign up/i})
        const user = userEvent.setup()
        await user.click(signup)
        // Assert sign up heading is rendered
        const signupHeading = screen.getByRole('heading', {name: /Sign up/i})
        expect(signupHeading).toBeInTheDocument()
        // Assert that form inputs and submit button are rendered
        const usernameInput = screen.getByRole('textbox', {name: /Username/i})
        const emailInput = screen.getByRole('textbox', {name: /Email/i})
        const passwordInput = screen.getByLabelText('Password:')
        const submitButton = screen.getByRole('button')
        expect(usernameInput).toBeInTheDocument()
        expect(emailInput).toBeInTheDocument()
        expect(passwordInput).toBeInTheDocument()
        expect(submitButton).toBeInTheDocument()
        // Assert that the user can input data into form
        fireEvent.change(usernameInput, {target: {value: 'user one'}})
        fireEvent.change(emailInput, {target: {value: 'user@email.com'}})
        fireEvent.change(passwordInput, {target: {value: 'mypwd12345'}})
        expect(usernameInput.value).toBe('user one')
        expect(emailInput.value).toBe('user@email.com')
        expect(passwordInput.value).toBe('mypwd12345')
        // Assert that submitting form redirects user to login page
        /* 
        Since sign up data validation is handled by the backend, 
        the default mock server returns with a 201 status, regardless of input.
        */
        await user.click(submitButton)
        expect(global.window.location.href).toContain('login')
    })
})

describe('Signing up with invalid data', () => {
    test("Missing data displays appropriate error message and doesn't redirect user to login page", async () => {
        // Reset http response to assume empty form data was sent
        server.resetHandlers(
            http.post(`${url}/users`, () => {
                return HttpResponse.json({
                errors: {
                    username: {
                    message: 'Path `username` is required.'
                    },
                    email: {
                    message: 'Path `email` is required.'
                    },
                    password: {
                    message: 'Path `password` is required.'
                    }
                }
                }, {status: 400
                })
            })
        )
        // Render app
        render(<App />)
        // Find sign up link
        const signup = screen.getByRole('link', {name: /Sign up/i})
        const user = userEvent.setup()
        await user.click(signup)
        // Submit sign up form to replicate empty input being sent
        const submitButton = screen.getByRole('button')
        await user.click(submitButton)
        // Assert the correct error messages are present
        const usernameError = screen.getByText('Path `username` is required.')
        const emailError = screen.getByText('Path `email` is required.')
        const passwordError = screen.getByText('Path `password` is required.')
        expect(usernameError).toBeInTheDocument()
        expect(emailError).toBeInTheDocument()
        expect(passwordError).toBeInTheDocument()
        // Assert that user has not been redirected to login page
        expect(global.window.location.href).toContain('signup')
    })
    test("Invalid email or password displays appropriate error message and doesn't redirect user to login page", async () => {
        // Reset http response to assume form data was sent with invalid username and password
        /* 
        The password error that is sent from the server may also be 
        'Path `password` (`123`) is shorter than the minimum allowed length (7).'
        However, since we are mocking the server response, testing this case in addition is unecessary.
        */
        server.resetHandlers(
            http.post(`${url}/users`, () => {
                return HttpResponse.json({
                errors: {
                    email: {
                    message: 'Email is invalid'
                    },
                    password: {
                    message: 'Password cannot contain "password"'
                    }
                }
                }, {status: 400})
            })
        )
        // Render app
        render(<App />)
        // Find and click sign up link
        const signup = screen.getByRole('link', {name: /Sign up/i})
        const user = userEvent.setup()
        await user.click(signup)
        // Submit sign up form to replicate invalid input being sent
        const submitButton = screen.getByRole('button')
        await user.click(submitButton)
        // Assert the correct error messages are present
        const emailError = screen.getByText('Email is invalid')
        const passwordError = screen.getByText('Password cannot contain "password"')
        expect(emailError).toBeInTheDocument()
        expect(passwordError).toBeInTheDocument()
        // Assert that user has not been redirected to login page
        expect(global.window.location.href).toContain('signup')
    })
    test("Taken username displays appropriate error message and doesn't redirect user to login page", async () => {
        /* 
        The equivalent error for email may also be sent from the server, however, only one error is sent at a time.
        Since, we are mocking the server response, testing this case in addition is unecessary.
        */
        server.resetHandlers(
            http.post(`${url}/users`, () => {
                return HttpResponse.json({
                errorResponse: {
                    keyValue: {
                        username: 'error',
                    }
                }
                }, {status: 400})
            })
        )
        // Render app
        render(<App />)
        // Find and click sign up link
        const signup = screen.getByRole('link', {name: /Sign up/i})
        const user = userEvent.setup()
        await user.click(signup)
        // Submit sign up form to replicate invalid input being sent
        const submitButton = screen.getByRole('button')
        await user.click(submitButton)
        // Assert the correct error messages are present
        const usernameError = screen.getByText('Username taken.')
        expect(usernameError).toBeInTheDocument()
        // Assert that user has not been redirected to login page
        expect(global.window.location.href).toContain('signup')
    })
})

