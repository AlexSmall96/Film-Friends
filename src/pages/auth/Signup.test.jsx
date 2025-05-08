/**
 * @vitest-environment jsdom
 */
import Signup from './Signup';
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { describe, test, expect } from 'vitest';
import { server } from '../../test-utils/mocks/server'
import { HttpResponse, http } from "msw";
import setupTests from '../../test-utils/setupTests'
import renderWithUserProvider from '../../test-utils/renderWithUserProvider';

const url = 'https://film-friends.onrender.com/data'

setupTests()

describe('RENDERING ELEMENTS', () => {
    test('Sign up form and image are rendered correctly', async () => {
        // Render component
        const history = renderWithUserProvider(<Signup />, '/signup')
        // Find image
        const image = screen.getByRole('img', {name: /A roll of film tape/i})
        expect(image).toBeInTheDocument()
        // Find inputs
        const emailInput = screen.getByRole('textbox', {name: /Email address/i})
        const usernameInput = screen.getByRole('textbox', {name: /Username/i})
        const passwordInput = screen.getByLabelText('Password')
        expect(usernameInput).toBeInTheDocument()
        expect(emailInput).toBeInTheDocument()
        expect(passwordInput).toBeInTheDocument()
        // Find submit button
        const signUpbutton = screen.getByRole('button', {name: /Sign Up/i})
        expect(signUpbutton).toBeInTheDocument()
        // Find text for login redirect
        const loginText = screen.getByText('Already have an account?')
        expect(loginText).toBeInTheDocument()
        // Find login button
        const loginButton = screen.getByRole('button', {name: /Login/i} )
        expect(loginButton).toBeInTheDocument()
        // Clicking login button redirects user to login page
        const user = userEvent.setup()
        await user.click(loginButton)
        expect(history.location.pathname).toContain('/login')
    })
})

describe('SIGN UP WITH VALID DATA', () => {
    test('Submitting form with valid data takes user to login page', async () => {
        // Render component
        const history = renderWithUserProvider(<Signup />, '/signup')
        // Find signup button
        const signUpbutton = screen.getByRole('button', {name: /Sign up/i})
        // Should be disabled
        expect(signUpbutton.disabled).toBe(true)
        // Find inputs
        const emailInput = screen.getByRole('textbox', {name: /Email address/i})
        const usernameInput = screen.getByRole('textbox', {name: /Username/i})
        const passwordInput = screen.getByLabelText('Password')
        // Assert that the user can input data into form
        fireEvent.change(usernameInput, {target: {value: 'user one'}})
        fireEvent.change(emailInput, {target: {value: 'user@email.com'}})
        fireEvent.change(passwordInput, {target: {value: 'mypwd12345'}})
        expect(usernameInput.value).toBe('user one')
        expect(emailInput.value).toBe('user@email.com')
        expect(passwordInput.value).toBe('mypwd12345')
        // Button be enabled
        expect(signUpbutton.disabled).toBe(false)
        // Assert that submitting form redirects user to login page
        const user = userEvent.setup()
        expect(history.location.pathname).not.toContain('/login')
        await user.click(signUpbutton)
        expect(history.location.pathname).toContain('/login')
    })
})

describe('SIGN UP WITH INVALID DATA', () => {
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
        // Render component
        const history = renderWithUserProvider(<Signup />, '/signup')
        // Find sign up button
        const signUpbutton = screen.getByRole('button', {name: /Sign up/i})
        const user = userEvent.setup()
        // Find inputs
        const emailInput = screen.getByRole('textbox', {name: /Email address/i})
        const usernameInput = screen.getByRole('textbox', {name: /Username/i})
        const passwordInput = screen.getByLabelText('Password')
        // Input data to make submit button enabled
        fireEvent.change(usernameInput, {target: {value: 'user one'}})
        fireEvent.change(emailInput, {target: {value: 'user@email.com'}})
        fireEvent.change(passwordInput, {target: {value: 'mypwd12345'}})
        await user.click(signUpbutton)
        // Assert the correct error messages are present
        const emailError = screen.getByText('Email is invalid')
        const passwordError = screen.getByText('Password cannot contain "password"')
        expect(emailError).toBeInTheDocument()
        expect(passwordError).toBeInTheDocument()
        // Assert that user has not been redirected to login page
        expect(history.location.pathname).not.toContain('/login')
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
        // Render component
        const history = renderWithUserProvider(<Signup />, '/signup')
        // Find inputs
        const emailInput = screen.getByRole('textbox', {name: /Email address/i})
        const usernameInput = screen.getByRole('textbox', {name: /Username/i})
        const passwordInput = screen.getByLabelText('Password')
        // Input data to make submit button enabled
        fireEvent.change(usernameInput, {target: {value: 'user one'}})
        fireEvent.change(emailInput, {target: {value: 'user@email.com'}})
        fireEvent.change(passwordInput, {target: {value: 'mypwd12345'}})
        // Find sign up button
        const signUpbutton = screen.getByRole('button', {name: /Sign up/i})
        const user = userEvent.setup()
        await user.click(signUpbutton)
        // Assert the correct error messages are present
        const usernameError = screen.getByText('Username taken.')
        expect(usernameError).toBeInTheDocument()
        // Assert that user has not been redirected to login page
        expect(history.location.pathname).not.toContain('/login')
    })
})