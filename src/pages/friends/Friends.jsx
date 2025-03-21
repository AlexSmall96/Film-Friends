import React, { useEffect, useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Button, Container, Dropdown, DropdownButton, Row, Col, Form, Spinner, Offcanvas} from 'react-bootstrap';
import User from '../../components/User';
import FriendRequestButtons from './FriendRequestButtons'
import sortBy from 'array-sort-by'
import { FriendDataProvider } from '../../contexts/FriendDataContext';
import { useFriendAction } from '../../contexts/FriendActionContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import styles from '../../styles/Friends.module.css'
import { useRedirect } from '../../hooks/useRedirect';

const Friends = () => {
    useRedirect()
    // Hooks
    const {height} = useWindowDimensions()
    // Contexts
    const { currentUser } = useCurrentUser()
    const { updatedFriends, getStatus } = useFriendAction()
    // Initialize state variables
    const [requests, setRequests] = useState([])
    const [acceptedRequests, setAcceptedRequests] = useState(false)
    const [pendingRequests, setPendingRequests] = useState(false)
    const [requestIds, setRequestIds] = useState([])
    const [showOffCanvas, setShowOffCanvas] = useState(false);
    const [searchResults, setSearchResults] = useState([])
    const [filter, setFilter] = useState('All')
    const [sort, setSort] = useState('A-Z')
    const [hasLoaded, setHasLoaded] = useState({
        page: false, search: true, requests: false
    })
    const [search, setSearch] = useState({
        users: '', requests: ''
    })
    
    // Callback function to sort requests based on sort variable
    const sortRequest = (req, sort) => {
        return sort === 'A-Z' ? req.isSender? req.reciever.username: req.sender.username: req.updatedAt
    }

    useEffect(() => {
        // Gets all the users that match the criteria provided by search
        const fetchUsers = async () => {
            try {
                const response = await axiosReq.get(`/users/?username=${search.users}`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
                setSearchResults(search.users === '' ? [] : response.data)
                setHasLoaded({...hasLoaded, search: true})
            } catch (err) {
                // console.log(err)
            }
        }
        if (search.users !== ''){
            setHasLoaded({...hasLoaded, search: false})
        }
        fetchUsers()
    }, [search.users, currentUser?.user._id, currentUser?.token])

    useEffect(() => {
        // Gets all the current users sent or recieved friend requests
        // Creates a request ids array to be used to determine text in search results
        const fetchRequests = async () => {
            try {
                const searchedResponse = await axiosReq.get(`/requests/?username=${search.requests}`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
                const filteredResponse = searchedResponse.data.filter(request => filter === 'Friends'? request.accepted : filter === 'Pending Requests' ? !request.accepted : true)
                const sortedResponse = sortBy(filteredResponse, (req) => sortRequest(req, sort))
                setRequests(sortedResponse) 
                setHasLoaded({...hasLoaded, page: true, requests: true})
            } catch (err) {
                // console.log(err)
            }
        }
        fetchRequests()
    }, [search.requests, filter, sort, currentUser?.user._id, currentUser?.token, updatedFriends])
    
    useEffect(() => {
        const updateRequestData = async () => {
            try {
                const response = await axiosReq.get(`/requests/`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
                setPendingRequests(response.data.filter(request => !request.accepted).length > 0)
                setAcceptedRequests(response.data.filter(request => request.accepted).length > 0)
                setRequestIds(  
                    response.data.map(request => request.reciever._id).concat(response.data.map(request => request.sender._id))
                )
                setHasLoaded({...hasLoaded, page: true, requests: true})
            } catch (err){
                // console.log(err)
            }
        }
        updateRequestData()
    }, [updatedFriends])


    // Handle change for all users search bar
    const handleChange = (event) => {
        setSearch({
            ...search, [event.target.name]: event.target.value
        })
    }

    const handleShowOffCanvas = (filterName) => {
        setShowOffCanvas(true)
        setFilter(filterName)
    }

    return (
        <Container style={{marginTop: '10px'}}>
            {hasLoaded.page ?
                <>
                    {acceptedRequests?
                        <Button variant="link" onClick={() => handleShowOffCanvas('Friends')}>
                            My Friends
                        </Button>
                    :''}
                    {pendingRequests?
                        <Button variant="link" onClick={() => handleShowOffCanvas('Pending Requests')}>
                            Pending Requests
                        </Button>
                    :''}
                    <Form>
                        <Form.Control onChange={handleChange} value={search.users} name='users' type='text' placeholder='Search for users'></Form.Control>
                    </Form>
                    {hasLoaded.search ? 
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
                                                    status={getStatus(result._id, requestIds, requests)} 
                                                    searchResult={true} 
                                                />                                           
                                            </Col>
                                        </Row>
                                    </FriendDataProvider>
                            )
                        :''
                    :<Spinner />
                    }
                    <Offcanvas autoFocus={false} show={showOffCanvas} onHide={() => setShowOffCanvas(false)}>
                        <Offcanvas.Header closeButton>
                            <h4>                    
                        {acceptedRequests?
                            <Button variant="link" disabled={filter === 'Friends'} onClick={() => setFilter('Friends')}>
                                My Friends
                            </Button>
                        :''} 
                        {pendingRequests?
                            <>/
                                <Button variant="link" disabled={filter === 'Pending Requests'} onClick={() => setFilter('Pending Requests')}>
                                    Pending Requests
                                </Button>                           
                            </>
                        :''}</h4>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Container>
                                <input onChange={handleChange} type='search' placeholder={`Search your ${filter === 'Pending Requests' ? 'Friend Requests': 'Friends'}`} value={search.requests} name='requests' className={styles.searchBar} />                            
                            </Container>
                            <DropdownButton 
                                variant='outline-secondary' 
                                title={<><i className="fa-solid fa-sort"></i> {sort}</>}
                            >
                                <Dropdown.Item onClick={() => setSort('A-Z')}>A-Z</Dropdown.Item>
                                <Dropdown.Item onClick={() => setSort('Last Updated')}>Last Updated</Dropdown.Item>
                            </DropdownButton>
                            {hasLoaded.requests ? 
                                requests.length? 
                                    requests.map(request =>
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
                                :'No users matching current criteria.'
                            :<Spinner />}
                        </Offcanvas.Body>
                    </Offcanvas>            
                </>
            :<Spinner />}
        </Container>
    )
}
export default Friends;