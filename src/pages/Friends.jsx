import React, { useEffect, useState } from 'react';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';
import { Card, Container, Dropdown, DropdownButton, Row, Col, Form, Spinner } from 'react-bootstrap';
import User from '../components/User';
import FriendRequestButtons from '../components/FriendRequestButtons'
import sortBy from 'array-sort-by'
import { FriendDataProvider } from '../contexts/FriendDataContext';
import { useFriendAction } from '../contexts/FriendActionContext';

const Friends = () => {
    // Contexts
    const { currentUser } = useCurrentUser()
    const { updated } = useFriendAction()
    // Initialize state variables
    const [requests, setRequests] = useState([])
    const [allRequests, setAllRequests] = useState([])
    const [requestIds, setRequestIds] = useState([])
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [filter, setFilter] = useState('All')
    const [sort, setSort] = useState('A-Z')
    const [hasLoadedFriends, setHasLoadedFriends] = useState(false)
    const [hasLoadedSearch, setHasLoadedSearch] = useState(true)
    const [hasUpdated, setHasUpdated] = useState(true)

    // Callback function to sort requests based on sort variable
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
                    {/* SEARCH BAR TO FIND USERS */}
                    <Row>
                        <Form>
                            <Form.Control onChange={handleChange} type='text' placeholder='Find your friends'></Form.Control>
                        </Form>
                    </Row>
                    {/* SEARCH RESULTS */}
                    <Card>
                        {hasLoadedSearch ? 
                            searchResults.length && search !== '' ? searchResults.map(
                                result =>
                                    <FriendDataProvider key={result._id} requestId={null} user={result}> 
                                        <div>
                                            <User searchResult={true} />
                                            <FriendRequestButtons 
                                                status={getStatus(result._id)} 
                                                searchResult={true} 
                                            />
                                        </div>
                                    </FriendDataProvider>
                            ):(''):(<Spinner />)}
                    </Card>
                </Col>
                <Col md={6}>
                    {/* PENDING AND ACCEPTED FRIEND REQUESTS */}
                    {hasLoadedFriends?(
                        <Card>
                            {allRequests.length?
                                <>  
                                    {/* DROPDOWN FILTERS */}
                                    <DropdownButton style={{marginTop: '5px'}} variant='outline-secondary' id="dropdown-basic-button" title={filter}>
                                        <Dropdown.Item onClick={() => setFilter('All')}>All</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setFilter('Friends')}>Friends</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setFilter('Pending Requests')}>Pending Requests</Dropdown.Item>
                                    </DropdownButton>
                                    <DropdownButton style={{marginTop: '5px'}} variant='outline-secondary' id="dropdown-basic-button" title={sort}>
                                        <Dropdown.Item onClick={() => setSort('A-Z')}>A-Z</Dropdown.Item>
                                        <Dropdown.Item onClick={() => setSort('Last Updated')}>Last Updated</Dropdown.Item>
                                    </DropdownButton>
                                    {/* REQUEST LIST */}
                                    {hasUpdated?
                                        requests.length?   
                                            requests.map(
                                                request =>
                                                    <FriendDataProvider key={request._id} requestId={request._id} user={request.isSender? request.reciever : request.sender}>
                                                        <Row >
                                                            <Col>
                                                                <User searchResult={false}/>
                                                            </Col>
                                                            <Col>
                                                                <FriendRequestButtons 
                                                                    status={{accepted: request.accepted, sent: request.isSender, recieved: !request.isSender}} 
                                                                    searchResult={false}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </FriendDataProvider>
                                            )
                                        : 
                                            'No requests matching current criteria'
                                    : 
                                        <Spinner />}
                                </> 
                            :
                                "You don't have any friends yet."}
                        </Card> 
                    ):(<Spinner />)}
                </Col>
            </Row>
        </Container>
    )
}
export default Friends;