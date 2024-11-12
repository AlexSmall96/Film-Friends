import React, { useEffect, useState } from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { Card, Container, Row, Col, Form } from 'react-bootstrap';
import User from '../components/User';

const Friends = () => {
    // Contexts
    const { currentUser } = useCurrentUser()
    // Initialize state variables
    const [requests, setRequests] = useState([])
    const [sentRequests, setSentRequests] = useState([])
    const [recievedRequests, setRecievedRequests] = useState([])
    const [requestIds, setRequestIds] = useState([])
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])

    useEffect(() => {
        // Gets all the current users sent or recieved friend requests
        // Creates a request ids array to be used to determine text in search results
        const fetchRequests = async () => {
            try {
                const response = await axiosReq.get('/requests', {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setRequests(response.data)
                setSentRequests(
                    response.data.filter(request => request.sender._id === currentUser.user._id )
                )
                setRecievedRequests(
                    response.data.filter(request => request.reciever._id === currentUser.user._id )
                )
                setRequestIds(
                    response.data.map(request => request.reciever._id).concat(response.data.map(request => request.sender._id))
                )
            } catch (err) {
                console.log(err)
            }

        }
        // Gets all the users that match the criteria provided by search
        const fetchUsers = async () => {
            try {
                const response = await axiosReq.get(`/users/?username=${search}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setSearchResults(response.data)
            } catch (err) {
                console.log(err)
            }
        }
        fetchRequests()
        fetchUsers()
    }, [search, currentUser.user._id, currentUser.token])

    // Handle change for search bar
    const handleChange = (event) => {
        setSearch(event.target.value)
        if (event.target.value === '') {    
            setSearch('')
        }
    }
    
    // Updates the status of the friend request to accepted or declined
    const updateRequest = async (accepted, _id) => {
        const body = accepted? {accepted: true} : {decline: true}
        try {
            await axiosReq.patch(`/requests/${_id}`, body, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
        } catch (err) {
            console.log(err)
        }
    }

    // Sends a friend request to reciever
    const sendRequest = async (reciever) => {
        try {
            await axiosReq.post('/requests', {reciever}, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
        } catch (err) {
            console.log(err)
        }
    }

    // Takes in id and uses requests array to determine what component should appear next to username
    const getStatus = (id) => {
        if (!requestIds.includes(id)) {
            return null
        }
        const sentFromId = requests.filter(request => request.sender._id === id)
        const sentToId = requests.filter(request => request.reciever._id === id)
        const request = sentFromId.length? sentFromId[0]: sentToId[0]
        return request.accepted ? 'accepted' : sentToId.length? 'sent' : 'recieved'
    }

    return (
        <Container>
            <Row>
                <Col md={6}>
                    {/* CURRENT USERS FRIEND REQUESTS */}
                    {sentRequests.map(request =>
                        <User key={request._id} user={request.reciever} id={request._id} status={request.accepted ? 'accepted':'sent'} />
                    )}
                    {recievedRequests.map(request =>
                        <User key={request._id} user={request.sender} id={request._id} status={request.accepted ? 'accepted':'recieved'} updateRequest={updateRequest} />
                    )}                    
                </Col>
                <Col md={6}>
                    {/* SEARCH FOR USERS BOX */}
                    <Form>
                        <Form.Control onChange={handleChange} type='text' placeholder='Find your friends'></Form.Control>
                    </Form>
                    {/* SEARCH RESULTS */}
                    {searchResults.length && search !== '' ? (
                        <Card>
                            {searchResults.map(result => 
                                <User key={result._id} user={result} sendRequest={sendRequest} status={getStatus(result._id)} />
                            )}
                        </Card> 
                    ):('')}                    
                </Col>
            </Row>
        </Container>
    )
}
export default Friends;