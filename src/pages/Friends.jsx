import React, { useEffect, useState } from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { Card, Container, Dropdown, DropdownButton, Row, Col, Form, Spinner } from 'react-bootstrap';
import User from '../components/User';
import FriendRequestButtons from '../components/FriendRequestButtons'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import sortBy from 'array-sort-by'

const Friends = () => {
    // Hooks
    const history = useHistory()
    // Contexts
    const { currentUser } = useCurrentUser()
    // Initialize state variables
    const [requests, setRequests] = useState([])
    const [allRequests, setAllRequests] = useState([])
    const [requestIds, setRequestIds] = useState([])
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [filter, setFilter] = useState('All')
    const [sort, setSort] = useState('A-Z')
    const [updated, setUpdated] = useState(false)
    const [hasLoadedFriends, setHasLoadedFriends] = useState(false)
    const [hasLoadedSearch, setHasLoadedSearch] = useState(true)
    const [hasUpdated, setHasUpdated] = useState(true)

    const sortRequest = (req, sort) => {
        return sort === 'A-Z' ? req.isSender? req.reciever.username: req.sender.username: req.updatedAt
    }

    useEffect(() => {
        // Gets all the current users sent or recieved friend requests
        // Creates a request ids array to be used to determine text in search results
        const fetchRequests = async () => {
            try {
                const response = await axiosReq.get(`/requests/`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                const filteredResponse = response.data.filter(request => filter === 'Friends'? request.accepted : filter === 'Pending Requests'? !request.accepted : true)
                const sortedResponse = sortBy(filteredResponse, (req) => sortRequest(req, sort))
                setAllRequests(response.data)
                setRequests(sortedResponse)  
                setRequestIds(
                    response.data.map(request => request.reciever._id).concat(response.data.map(request => request.sender._id))
                )
                setHasLoadedFriends(true)
                setHasUpdated(true)
            } catch (err) {
                console.log(err)
            }
        }
        // Gets all the users that match the criteria provided by search
        const fetchUsers = async () => {
            try {
                const response = await axiosReq.get(`/users/?username=${search}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                setSearchResults(response.data)
                setHasLoadedSearch(true)
            } catch (err) {
                console.log(err)
            }
        }
        fetchRequests()
        fetchUsers()
    }, [search, filter, sort, currentUser.user._id, currentUser.token, updated])

    useEffect(() => {
        setHasUpdated(false)
    }, [filter, sort])

    // Handle change for search bar
    const handleChange = (event) => {
        if (event.target.value !== '') {
            setHasLoadedSearch(false)
        }
        setSearch(event.target.value)
        if (event.target.value === '') {    
            setSearch('')
        }
    }
    // Updates the status of the friend request to accepted or declined
    const updateRequest = async (accepted, id) => {
        const body = accepted? {accepted: true} : {declined: true}
        try {
            await axiosReq.patch(`/requests/${id}`, body, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(!updated)
        } catch (err) {
            console.log(err)
        }
    }

    // Sends a friend request to reciever
    const sendRequest = async (reciever) => {
        try {
            await axiosReq.post('/requests', {reciever}, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(!updated)
        } catch (err) {
            console.log(err)
        }
    }

    // Current user can delete a friend request 
    const deleteRequest = async (id) => {
        try {
            await axiosReq.delete(`/requests/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(!updated)
        } catch (err) {
            console.log(err)
        }
    }

    // Takes in id and uses requests array to determine status of friend request
    const getStatus = (id) => {
        if (!requestIds.includes(id)) {
            return {accepted: false, sent: false, recieved: false}
        }
        const sentFromId = requests.filter(request => request.sender._id === id)
        const sentToId = requests.filter(request => request.reciever._id === id)
        const request = sentFromId.length? sentFromId[0]: sentToId[0]
        return {
            accepted: request.accepted,
            sent: sentToId.length,
            recieved: !sentToId.length
        }
    }

    return (
        <Container style={{marginTop: '10px'}}>

            <Row>
            <Col md={2}>
            <Row>
                <Form>
                    <Form.Control onChange={handleChange} type='text' placeholder='Find your friends'></Form.Control>
                </Form>
            </Row>
                <Card>
                    {hasLoadedSearch ? 
                    searchResults.length && search !== '' ? searchResults.map(
                        result => 
                            <div key={result._id}>
                                <User data={result} searchResult={true} />
                                <FriendRequestButtons 
                                    status={getStatus(result._id)} 
                                    searchResult={true} 
                                    sendRequest={() => sendRequest(result._id)} 
                                />
                            </div>
                    ):(''):(<Spinner />)}

                </Card>
            </Col>
            <Col md={6}>
            {hasLoadedFriends?(
                <Card>
                    {allRequests.length?
                    <>
                        <DropdownButton style={{marginTop: '5px'}} variant='outline-secondary' id="dropdown-basic-button" title={filter}>
                            <Dropdown.Item onClick={() => setFilter('All')}>All</Dropdown.Item>
                            <Dropdown.Item onClick={() => setFilter('Friends')}>Friends</Dropdown.Item>
                            <Dropdown.Item onClick={() => setFilter('Pending Requests')}>Pending Requests</Dropdown.Item>
                        </DropdownButton>
                        <DropdownButton style={{marginTop: '5px'}} variant='outline-secondary' id="dropdown-basic-button" title={sort}>
                            <Dropdown.Item onClick={() => setSort('A-Z')}>A-Z</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSort('Last Updated')}>Last Updated</Dropdown.Item>
                        </DropdownButton>
                        {hasUpdated?
                            requests.length?   
                            requests.map(
                                request =>
                                    <Row key={request._id}>
                                        <Col>
                                            <User data={request.isSender? request.reciever : request.sender} searchResult={false}/>
                                        </Col>
                                        <Col>
                                            <FriendRequestButtons 
                                                status={{accepted: request.accepted, sent: request.isSender, recieved: !request.isSender}} 
                                                searchResult={false}
                                                handleShare={request.accepted? () => history.push(`reccomendations/send/users/${request.isSender? request.reciever._id : request.sender._id}`) : null}
                                                handleDelete={request.isSender || request.accepted ? () => deleteRequest(request._id) : null}
                                                handleUpdate={!request.accepted ? (accepted) => updateRequest(accepted, request._id) : null}
                                                user={request.isSender? request.reciever : request.sender}
                                            />
                                        </Col>
                                    </Row> )
                        : 'No requests matching current criteria'
                           : <Spinner />}
                    </> :"You don't have any friends yet."}
                </Card> 
            ):(<Spinner />)}
            </Col>
            </Row>
        </Container>
    )
}
export default Friends;