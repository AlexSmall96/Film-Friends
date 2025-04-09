import React, { useEffect, useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Button, ButtonGroup, Container, Dropdown, DropdownButton, Row, Col, Spinner, Image} from 'react-bootstrap';
import FriendRequestButtons from './FriendRequestButtons'
import sortBy from 'array-sort-by'
import { FriendDataProvider } from '../../contexts/FriendDataContext';
import { useFriendAction } from '../../contexts/FriendActionContext';
import appStyles from '../../App.module.css'
import styles from '../../styles/Friends.module.css'
import { useRedirect } from '../../hooks/useRedirect';
import ResultsPagination from '../../components/ResultsPagination';

const Friends = () => {
    useRedirect()
    // Hooks
    // Contexts
    const { currentUser } = useCurrentUser()
    const { updatedFriends, setUpdatedFriends } = useFriendAction()
    // Initialize state variables
    const [requests, setRequests] = useState([])
    const [requestIds, setRequestIds] = useState({accepted: [], pending: []})
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState([])
    const [filter, setFilter] = useState('All')
    const [sort, setSort] = useState('A-Z')
    const [currentPage, setCurrentPage] = useState(1)
    const [finalPage, setFinalPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const [hasLoaded, setHasLoaded] = useState({
        page: false, search: true, requests: false
    })
    const [search, setSearch] = useState('')
    
    // Callback function to sort requests based on sort variable
    const sortRequest = (req, sort) => {
        return sort === 'A-Z' ? req.isSender? req.reciever.username: req.sender.username: req.updatedAt
    }

    const checkRequest = (req) => {
        if (filter === 'All'){
            return true
        }
        return filter === 'Friends' ? req.accepted : !req.accepted
    }

    useEffect(() => {
        // Gets all the users that match the criteria provided by search
        const fetchUsers = async () => {
            try {
                const response = await axiosReq.get(`/users/?username=${search}`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
                setResults(search === '' ? [] : response.data)
                setShowResults(true)
                setHasLoaded({...hasLoaded, search: true})
            } catch (err) {
                // console.log(err)
            }
        }
        if (search !== ''){
            setHasLoaded({...hasLoaded, search: false})
        }
        fetchUsers()
    }, [search, currentUser?.user._id, currentUser?.token])

    useEffect(() => {
        // Gets all the current users sent or recieved friend requests
        // Creates a request ids array to be used to determine text in search results
        const fetchRequests = async () => {
            try {
                const response = await axiosReq.get(`/requests/`, {headers: {'Authorization': `Bearer ${currentUser?.token}`}})
                const filteredResponse = response.data.filter(request => checkRequest(request))
                const sortedResponse = sortBy(filteredResponse, (req) => sortRequest(req, sort))
                setRequests(sortedResponse.slice(9 * (currentPage - 1), 9 * currentPage))
                const acceptedRequests = response.data.filter(request => request.accepted)
                const pendingRequests = response.data.filter(request => !request.accepted )
                setRequestIds({
                    accepted: acceptedRequests.map(request => request.isSender? request.reciever._id : request.sender._id),
                    pending: pendingRequests.map(request => request.isSender? request.reciever._id : request.sender._id),
                })
                setTotalResults(sortedResponse.length)
                setFinalPage(Math.ceil(0.1 * sortedResponse.length))
                setHasLoaded({...hasLoaded, page: true, requests: true})
            } catch (err) {
                // console.log(err)
            }
        }
        fetchRequests()
    }, [filter, sort, currentUser?.user._id, currentUser?.token, updatedFriends, currentPage])

    // Sends a friend request to reciever
    const sendRequest = async (reciever) => {
        try {
            await axiosReq.post('/requests', {reciever}, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdatedFriends(!updatedFriends)
        } catch (err) {
            console.log(err)
        }
    }

    // Handle change for all users search bar
    const handleChange = (event) => {
        setSearch(event.target.value)
    }

    const handleClick = (event) => {
        const classList = event.target.classList
        if (!classList.contains('result')){
            setShowResults(false)
        }
    }

    document.addEventListener('mouseup', handleClick)

    return (
            <Container className={appStyles.bigVerticalMargin}>
                <form>
                    <Row>
                        <Col xs={10} sm={10} md={11} className={`${appStyles.noPadding}`}>
                        {/* SEARCH BAR  */}
                            <input 
                                type='search' 
                                placeholder='Search for users' 
                                className={styles.searchBar}
                                value={search}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={10} sm={10} md={11} className={`${appStyles.noPadding} ${styles.results} ${!showResults? styles.noBorder:' '} ${appStyles.list}`}>
                            {results.length && showResults? 
                                results.map(result =>
                                    <Row key={result._id} className={appStyles.smallFont}>
                                        <Col md={2} xs={2} className='result'>
                                            <Image src={result.image} width={40} className='result' roundedCircle />
                                        </Col>
                                        <Col md={3} xs={3} className='result'>
                                            <a href={`/films/${result._id}`} className='result'>{result.username}</a>
                                        </Col>
                                        <Col md={7} xs={7} className='result'>
                                            {requestIds.accepted.includes(result._id)? 
                                                <><i className="fa-solid fa-user-group"></i> Friends</>
                                            :
                                                requestIds.pending.includes(result._id)?
                                                <><i className="fa-solid fa-envelope-circle-check"></i> Friend request pending</>
                                                :
                                            <Button onClick={() => sendRequest(result._id)} variant='outline-secondary' size='sm' className={`${appStyles.roundButton} result`}>Send Friend Request</Button>}
                                        </Col>
                                    </Row>
                                )
                            :''}
                        </Col>
                    </Row>
                </form>
                <ButtonGroup className={appStyles.bigVerticalMargin}>
                    <DropdownButton as={ButtonGroup} variant='outline-secondary' title={<><i className="fa-solid fa-filter"></i> {filter}</>}>
                        <Dropdown.Item onClick={() => setFilter('All')}>All</Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilter('Friends')}>Friends</Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilter('Pending Requests')}>Pending Requests</Dropdown.Item>
                    </DropdownButton> 
                    <DropdownButton as={ButtonGroup} variant='outline-secondary' title={<><i className="fa-solid fa-sort"></i> {sort}</>}>
                        <Dropdown.Item onClick={() => setSort('A-Z')}>A-Z</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSort('Last Updated')}>Last Updated</Dropdown.Item>
                    </DropdownButton>
                </ButtonGroup>
                {/* PAGINATION MESSAGE */}
                <p>
                    {currentPage !== finalPage ? (
                        `Friends: Showing results ${10 * (currentPage - 1) + 1} to ${10 * (currentPage - 1) + 10} of ${totalResults}`
                    ):(
                        `Friends: Showing results ${10 * (currentPage - 1) + 1} to ${totalResults} of ${totalResults}`
                    )}
                </p>
                {/* PAGINATION BUTTONS */}
                {finalPage > 1 ? 
                    <ResultsPagination currentPage={currentPage} finalPage={finalPage} setCurrentPage={setCurrentPage}/>                       
                : '' }
                <Row className={`${appStyles.verticalMargin} ${appStyles.list} ${styles.friendsList}`}>
                    {requests.length? 
                        requests.map(request =>
                            <Col xl={2} lg={2} md={3} sm={4} xs={6} key={request._id} className={`${appStyles.smallFont} ${styles.userCardWrapper}`}>
                                <div className={styles.userCard}>
                                    <div className={styles.userImageWrapper}>
                                        <Image src={request.isSender? request.reciever.image : request.sender.image} fluid rounded  />
                                    </div>
                                    <br />
                                    <a href={`/films/${request.isSender? request.reciever._id: request.sender._id}`} className={appStyles.smallFont}>{request.isSender? request.reciever.username : request.sender.username}</a>
                                    <FriendDataProvider request={request}>
                                        <FriendRequestButtons />
                                    </FriendDataProvider>
                                </div>
                            </Col>
                        )
                    :''}
                </Row>
            </Container>
    )
}
export default Friends;