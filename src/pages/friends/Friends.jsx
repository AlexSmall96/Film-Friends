import React, { useEffect, useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Button, Card, Container, Dropdown, DropdownButton, Row, Col, Form, Spinner, Offcanvas} from 'react-bootstrap';
import User from '../../components/User';
import FriendRequestButtons from './FriendRequestButtons'
import sortBy from 'array-sort-by'
import { FriendDataProvider } from '../../contexts/FriendDataContext';
import { useFriendAction } from '../../contexts/FriendActionContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import styles from '../../styles/Friends.module.css'

const Friends = () => {
    // Hooks
    const {height} = useWindowDimensions()
    // Contexts
    const { currentUser } = useCurrentUser()
    const { updated } = useFriendAction()
    // Initialize state variables
    const [requests, setRequests] = useState([])
    const [allRequests, setAllRequests] = useState([])
    const [requestIds, setRequestIds] = useState([])
    const [search, setSearch] = useState('')
    const [friendsSearch, setFriendsSearch] = useState('')
    const [title, setTitle] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [filter, setFilter] = useState('All')
    const [sort, setSort] = useState('A-Z')
    const [hasLoadedFriends, setHasLoadedFriends] = useState(false)
    const [hasLoadedSearch, setHasLoadedSearch] = useState(true)
    const [showOffCanvas, setShowOffCanvas] = useState(false);

    // Callback function to sort requests based on sort variable
    const sortRequest = (req, sort) => {
        return sort === 'A-Z' ? req.isSender? req.reciever.username: req.sender.username: req.updatedAt
    }

    useEffect(() => {
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
        fetchUsers()
    }, [search, currentUser.user._id, currentUser.token, updated])

    useEffect(() => {
        // Gets all the current users sent or recieved friend requests
        // Creates a request ids array to be used to determine text in search results
        const fetchRequests = async () => {
            try {
                const response = await axiosReq.get(`/requests/?username=${friendsSearch}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                const filteredResponse = response.data.filter(request => filter === 'Friends'? request.accepted : filter === 'Pending Requests'? !request.accepted : true)
                const sortedResponse = sortBy(filteredResponse, (req) => sortRequest(req, sort))
                setAllRequests(response.data)
                setRequests(sortedResponse)  
                setRequestIds(
                    response.data.map(request => request.reciever._id).concat(response.data.map(request => request.sender._id))
                )
                setHasLoadedFriends(true)
            } catch (err) {
                console.log(err)
            }
        }
        fetchRequests()
    }, [friendsSearch, filter, sort, currentUser.user._id, currentUser.token, updated ])

    // useEffect(() => {
    //     setHasUpdated(false)
    // }, [filter, sort])

    // Handle change for all users search bar
    const handleChange = (event) => {
        setHasLoadedSearch(false)
        setSearch(event.target.value)
    }

    // Handle change for friends search bar
    const handleChangeFriendsSearch = (event) => {
        setHasLoadedFriends(false)
        setFriendsSearch(event.target.value)
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
            <Button variant="link" onClick={() => {
                setHasLoadedFriends(false)
                setShowOffCanvas(true)
                setFilter('Friends')
            }}>
                My Friends
            </Button>
            <Button variant="link" onClick={() => {
                setHasLoadedFriends(false)
                setShowOffCanvas(true)
                setFilter('Pending Requests')
            }}>
                Pending Requests
            </Button>
            <Form>
                <Form.Control onChange={handleChange} value={search} type='text' placeholder='Search for users'></Form.Control>
            </Form>
            {hasLoadedSearch ? 
                searchResults.length && search !== '' ? 
                    searchResults.map(
                    result =>
                        <FriendDataProvider key={result._id} requestId={null} user={result}> 
                            <Row>
                                <Col md={6}>
                                    <User searchResult={true} />
                                </Col>
                                <Col md={6}>
                                    <FriendRequestButtons 
                                        status={getStatus(result._id)} 
                                        searchResult={true} 
                                    />                                           
                                </Col>
                            </Row>
                        </FriendDataProvider>
                ):(''):(<Spinner />)}
                

                <Offcanvas autoFocus={false} show={showOffCanvas} onHide={() => setShowOffCanvas(false)}>
                    <Offcanvas.Header closeButton>

                    <h4>{filter}</h4>

                    </Offcanvas.Header>
                    <Offcanvas.Body>
                    <Container>
                        
                        
                            <input type='search' placeholder='Search for your friends' value={friendsSearch} className={styles.searchBar} onChange={handleChangeFriendsSearch}/>                            
                        
                        </Container>
                    <div style={{overflowY: 'scroll', overflowX: 'hidden'}}>
                    {/* PENDING AND ACCEPTED FRIEND REQUESTS */}
                    {hasLoadedFriends?(
                        <Card>
                            {allRequests.length?
                                <>  
                                    {/* REQUEST LIST */}
                                    {hasLoadedFriends?
                                        requests.length?   
                                            requests.map(
                                                request =>
                                                    <FriendDataProvider key={request._id} requestId={request._id} user={request.isSender? request.reciever : request.sender}>
                                                        <Row>
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
                        </div>
                    </Offcanvas.Body>
                </Offcanvas>
        </Container>
    )
}
export default Friends;