/**
 * @vitest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { fireEvent, screen } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../test-utils/setupTests';
import userEvent from '@testing-library/user-event';
import Login from '../pages/auth/Login'
import { server } from '../test-utils/mocks/server'
import { HttpResponse, http } from "msw";
import renderWithUserProvider from '../test-utils/renderWithUserProvider';

setupTests()

const user = userEvent.setup()

const url = 'https://film-friends.onrender.com/data'

describe('RENDERING CORRECT ELEMENTS', () => {
    test('Image, form, login button, forgotten password and signup links should be rendered.', async () => {
        // Render component
        const history = renderWithUserProvider(<Login />, '/login')
        // Find image
        const image = screen.getByRole('img', {name: 'A film take board'})
        expect(image).toBeInTheDocument()
        // Find inputs
        const emailInput = screen.getByLabelText('Email address')
        expect(emailInput).toBeInTheDocument()
        const passwordInput = screen.getByLabelText('Password')
        expect(passwordInput).toBeInTheDocument()
        // Find button
        const button = screen.getByRole('button', {name:'Login'})
        expect(button).toBeInTheDocument()
        // Forgotten password link should be present
        const forgottenLink = screen.getByRole('button', {name: 'Forgotten password?'})
        expect(forgottenLink).toBeInTheDocument()
        // Signup link should be present
        const signupLink = screen.getByRole('button', {name:'Sign up'})
        expect(signupLink).toBeInTheDocument()
        // Forgotten password link should change url
        await user.click(forgottenLink)
        expect(history.location.pathname).toBe('/resetPassword/sendOTP/')
    })
})

describe('LOGIN / LOGOUT SUCCESS', () => {
    test('Submitting form with valid data takes user to home page, logout changes which links are displayed in navbar.', async () => {
        // Render component
        const history = renderWithUserProvider(<Login />, '/login')
        // Find inputs
        const emailInput = screen.getByLabelText('Email address')  
        const passwordInput = screen.getByLabelText('Password') 
        // Login button should be disabled
        const button = screen.getByRole('button', {name:'Login'}) 
        expect(button).toBeInTheDocument()
        expect(button.disabled).toBe(true)
        // Assert that the user can input data into form
        fireEvent.change(emailInput, {target: {value: 'user@email.com'}})
        fireEvent.change(passwordInput, {target: {value: 'mypwd12345'}})
        expect(emailInput.value).toBe('user@email.com')
        expect(passwordInput.value).toBe('mypwd12345')
        // Button should not be disabled
        expect(button.disabled).toBe(false)
        await user.click(button)
        expect(history.location.pathname).not.toContain('/login')
        // Clicking logout changes icons
        const avatar = screen.getByRole('button', {name: 'avatar'})
        await user.click(avatar)
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
        // Logo should be present
        const logo = screen.getByRole('link', {
            name: 'FILM A bag of popcorn FRIENDS'
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
        const history = renderWithUserProvider(<Login />, '/login')
        // Find login button
        const loginButton = screen.getByRole('button', {name: /Login/i})
        const user = userEvent.setup()
        // Enter data into form 
        const emailInput = screen.getByLabelText('Email address')  
        const passwordInput = screen.getByLabelText('Password')
        fireEvent.change(emailInput, {target: {value: 'user@email.com'}})
        fireEvent.change(passwordInput, {target: {value: 'mypwd12345'}})
        await user.click(loginButton)
        // Assert the correct error message is present
        const error = screen.getByText('Incorrect username or password.')
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
        const history = renderWithUserProvider(<Login />, '/login')
        // Find login button
        const loginButton = screen.getByRole('button', {name: /Login/i})
        // Enter data into form 
        const emailInput = screen.getByLabelText('Email address')  
        const passwordInput = screen.getByLabelText('Password')
        fireEvent.change(emailInput, {target: {value: 'user@email.com'}})
        fireEvent.change(passwordInput, {target: {value: 'mypwd12345'}})
        const user = userEvent.setup()
        await user.click(loginButton)
        // Assert the correct error message is present
        const error = screen.getByText('Currently unable to login. Please try again later.')
        expect(error).toBeInTheDocument()
        // Assert that user has not been redirected to home page
        expect(history.location.pathname).toContain('/login')
    })
})