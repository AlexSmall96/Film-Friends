/**
 * @vitest-environment jsdom
 */
import FriendRequestButtons from './FriendRequestButtons'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen, render } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../../test-utils/setupTests';
import { FriendDataProvider } from '../../contexts/FriendDataContext';
import { FriendActionContext } from '../../contexts/FriendActionContext';
import { CurrentUserContext } from '../../contexts/CurrentUserContext';
import { SaveFilmProvider } from '../../contexts/SaveFilmContext';
import { CurrentFilmContext } from '../../contexts/CurrentFilmContext';

// If request is accepted and user is sender, should display text with friends
// Should also display sharemodal and delete modal button (just test if they appear)
setupTests()

/* 
Render with FriendDataProvider to pass request data into component
All other contexts are rendered with empty data
*/
const renderWithContext = (request) => {
    return (
        render(
            <FriendActionContext.Provider value={{}}>
                <CurrentUserContext.Provider value={{}}>
                    <CurrentFilmContext.Provider value={{}}>
                        <SaveFilmProvider>
                            <FriendDataProvider request={request}>
                                <FriendRequestButtons />
                            </FriendDataProvider>
                        </SaveFilmProvider>
                    </CurrentFilmContext.Provider>
            </CurrentUserContext.Provider>
            </FriendActionContext.Provider>
        )
    )
}

describe('RENDERING CORRECT BUTTONS AND TEXT WHEN CURRENT USER IS SENDER', () => {
    test('If request has been accepted, "Friends" text should be displayed along with share modal and delete modal.', () => {
        // Define an accepted friend request where user is sender
        const request = {
            _id: 'req1_id',
            sender: {username:'user1', _id: 'user1id'},
            reciever: {username:'user2', _id: 'user2id'},
            accepted: true,
            declined: false,
            isSender: true
        }   
        // Render component
        renderWithContext(request)
        // Find text saying 'Friends'
        const friendsText = screen.getByText('Friends')
        expect(friendsText).toBeInTheDocument()
        // Assert modals are both present
        const shareModal = screen.getByRole('button', {name: 'Share'})
        expect(shareModal).toBeInTheDocument()
        const deleteModal = screen.getByRole('button', {name: 'Remove'})
        expect(deleteModal).toBeInTheDocument()
    })
    test('If request is pending, "Friend Request Pending" text should be displayed along with delete modal.', () => {
        // Define a pending friend request where user is sender
        const request = {
            _id: 'req1_id',
            sender: {username:'user1', _id: 'user1id'},
            reciever: {username:'user2', _id: 'user2id'},
            accepted: false,
            declined: false,
            isSender: true
        }         
        // Render component
        renderWithContext(request)
        // Find text saying 'Friend Request Pending'
        const pendingText = screen.getByText('Friend request pending')
        expect(pendingText).toBeInTheDocument()
        // Delete modal should be present
        const deleteModal = screen.getByRole('button', {name: 'Remove'})
        expect(deleteModal).toBeInTheDocument()
        // Share modal should not be present
        const shareModal = screen.queryByRole('button', {name: 'Share'})
        expect(shareModal).not.toBeInTheDocument()
    })
}) 

describe('RENDERING CORRECT BUTTONS AND TEXT WHEN CURRENT USER IS RECIEVER', () => {
    test('If request is pending, accept and decline buttons should be displayed, and neither modal should be present.', () => {
        // Define a pending friend request where user is reciever
        const request = {
            _id: 'req1_id',
            sender: {username:'user1', _id: 'user1id'},
            reciever: {username:'user2', _id: 'user2id'},
            accepted: false,
            declined: false,
            isSender: false
        }  
        // Render component
        renderWithContext(request)
        // Accept and decline buttons should be present
        const acceptBtn = screen.getByRole('button', {name: 'Accept'})
        expect(acceptBtn).toBeInTheDocument()
        const declineBtn = screen.getByRole('button', {name: 'Decline'})
        expect(declineBtn).toBeInTheDocument()
        // Neither modal should be present
        const shareModal = screen.queryByRole('button', {name: 'Share'})
        expect(shareModal).not.toBeInTheDocument()        
        const deleteModal = screen.queryByRole('button', {name: 'Remove'})
        expect(deleteModal).not.toBeInTheDocument()        
    })
})