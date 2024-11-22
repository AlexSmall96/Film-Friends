import React, { useEffect, useState } from 'react';
import { axiosReq } from '../../api/axiosDefaults';
import { useCurrentUser } from '../../contexts/CurrentUserContext';
import { Container, Image, Row, Col, Button, Tooltip, OverlayTrigger, DropdownButton, Dropdown, Spinner} from 'react-bootstrap';
import Film from '../../components/Film'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import styles from '../../styles/Films.module.css'
import sortBy from 'array-sort-by'
import DeleteModal from '../../components/DeleteModal'

const Reccomendations = () => {
    const {currentUser} = useCurrentUser()
    const history = useHistory()
    const [reccomendations, setReccomendations] = useState([])
    const [filter, setFilter] = useState('All')
    const [usernames, setUsernames] = useState([])
    const [sort, setSort] = useState('Last Sent')
    const [hasLoaded, setHasLoaded] = useState(false)
    const [updated, setUpdated] = useState(false)

    useEffect(() => {
        const fetchReccomendations = async () => {
            const response = await axiosReq.get(`/reccomendations/`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            const allReccomendations = response.data.fullReccomendations.filter(rec => !rec.isSender)
            const filteredReccomendations = allReccomendations.filter(rec => filter === 'All' ? true : rec.sender.username === filter)
            const sortedReccomendations = sort === 'Film Title' ? sortBy(filteredReccomendations, (rec) => rec.film.Title) : filteredReccomendations
            setReccomendations(sortedReccomendations)
            const allUsernames = allReccomendations.map(rec => rec.sender.username)
            setUsernames([...new Set(allUsernames)])
            setHasLoaded(true)
        }
        fetchReccomendations()
    }, [filter, sort, currentUser.token, updated])

    const renderTooltip = (username, message) => (
        <Tooltip id="button-tooltip">
          {`${username}: ${message}`}
        </Tooltip>
    )
    const deleteReccomendation = async (id) => {
        try {
            await axiosReq.delete(`/reccomendations/${id}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
            setUpdated(!updated)
        } catch (err) {
            console.log(err)
        }
    }


    const ratingValues = [1, 2, 3, 4, 5]
    return (
        <Container>
            {hasLoaded? (
                <>
                From:
            <DropdownButton variant='outline-secondary' title={filter}>
                <Dropdown.Item onClick={() => setFilter('All')}>All</Dropdown.Item>
                {usernames.map(username => 
                    <Dropdown.Item key={username} onClick={() => setFilter(username)}>{username}</Dropdown.Item>
                )}
            </DropdownButton>
            Sort by: 
            <DropdownButton variant='outline-secondary' title={sort}>
                <Dropdown.Item onClick={() => setSort('Film Title')}>Film Title</Dropdown.Item>
                <Dropdown.Item onClick={() => setSort('Last Sent')}>Last Sent</Dropdown.Item>
            </DropdownButton>
            <div style={{maxHeight: '600px', overflowY:'scroll', overflowX: 'hidden'}}>
                {reccomendations.map(rec =>
                <Row key={rec._id} style={{borderWidth: '0.1px', borderColor: 'lightgrey', borderStyle: 'solid'}}>
                    <Col md={1}>
                        <OverlayTrigger
                            placement="bottom"
                            delay={{ show: 250, hide: 400 }}
                            overlay={renderTooltip(rec.sender.username, rec.message)}
                        >
                            <Image onClick={() => history.push(`/profile/${rec.sender._id}`)} src={rec.sender.image} width={50}/>
                        </OverlayTrigger>
                    </Col>
                    <Col md={5}>
                        <Film key={rec.film.imdbID} filmData={rec.film} fullView={false} filmsPage={false} reccomendatonsPage={true} />
                    </Col>
                    <Col md={4}>
                        {rec.film.public ? (
                            <>
                                {`${rec.sender.username}'s rating: `}
                                {ratingValues.map(
                                            value => <span key={value} className={`fa fa-star ${rec.film.userRating >= value ? styles.checked : ''}`}></span>
                                )}  
                                <p>
                                    <Button 
                                        onClick={() => history.push(`/films/${rec.film.owner}/${rec.film.imdbID}/${rec.film._id}`)} 
                                        variant='link'>{`${rec.sender.username}'s watchlist`}
                                    </Button>
                                </p>
                            </>
                        ):(`${rec.sender.username} has made this film private.`)}

                    </Col>
                    <Col md={2}>
                        <p>
                            <DeleteModal handleDelete={() => deleteReccomendation(rec._id)} message={`Are you sure you want to remove ${rec.film.Title} from your reccomendations?`} />
                        </p>
                    </Col>
                </Row>
                )}
            </div>
            </>
            ):(
                <Spinner />
            )}
            
          
          
        </Container>
        
    )
}
export default Reccomendations;