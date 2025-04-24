/**
 * @vitest-environment jsdom
 */
import FriendRequestButtons from './FriendRequestButtons'
import React from 'react';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';
import { test, expect, describe} from 'vitest';
import setupTests from '../../test-utils/setupTests';
import { FriendDataProvider } from '../../contexts/FriendDataContext';
import renderWithNullContext from '../../test-utils/renderWithNullContext';

setupTests()

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
        renderWithNullContext(
            <FriendDataProvider>
                <FriendRequestButtons  />
            </FriendDataProvider>, {request} 
        )
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
        renderWithNullContext(
            <FriendDataProvider>
                <FriendRequestButtons  />
            </FriendDataProvider>, {request} 
        )
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
        renderWithNullContext(
            <FriendDataProvider>
                <FriendRequestButtons  />
            </FriendDataProvider>, {request} 
        )
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