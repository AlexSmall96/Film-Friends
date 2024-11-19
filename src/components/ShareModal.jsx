import React, {useState, useEffect} from 'react';
import { Button, Dropdown, DropdownButton, Modal, Form, Image } from 'react-bootstrap';
import User from './User';
import { axiosReq } from '../api/axiosDefaults';
import { useCurrentUser } from '../contexts/CurrentUserContext';

const ShareModal = ({user}) => {
    const { currentUser } = useCurrentUser()
    const [films, setFilms] = useState([])
    const [sort, setSort] = useState('Last Updated')
    const [message, setMessage] = useState("Hey! Check out this awesome film I've just watched. I think you'll love it! ")
    const [selectedFilm, setSelectedFilm] = useState(null)
    
    useEffect(() => {
        const fetchFilms = async () => {
            try {
                const response = await axiosReq.get(`/films/${currentUser.user._id}/?sort=${sort}`, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
                const filteredFilms = response.data.films.filter(film => film.public)
                setFilms(filteredFilms)
                if (!selectedFilm) {
                    setSelectedFilm(filteredFilms[0])
                }
                // setCurrentFilmIds({imdb: filteredFilms[0].imdbID, database: null})
            } catch (err) {
                console.log(err)
            }
        }
        fetchFilms()
    }, [currentUser, sort])

    const handleFilmChange = (id) => {
        setSelectedFilm(films.filter(film => film._id === id)[0])
    }
    
    const handleMessageChange = (event) => {
        setMessage(event.target.value)
    }

    const handleSend = async () => {
        try {
            const response = await axiosReq.post('/reccomendations', {
                film: selectedFilm._id,
                sender: currentUser.user._id,
                reciever: user._id,
                message
            }, {headers: {'Authorization': `Bearer ${currentUser.token}`}})
        } catch (err) {
            console.log(err)
        }
    }

    const [show, setShow] = useState(false);
    return (
        <>
            <Button style={{marginRight: '5px'}} variant="outline-secondary" onClick={() => setShow(true)}>
            <i className="fa-solid fa-clapperboard"></i> Share
            </Button>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header>
                    Sending to: <User data={user} searchResult={true}/>
                </Modal.Header>
                <Modal.Body>
                    Film Selected:
                    <Image src={selectedFilm?.Poster} width={50}/>
                    <DropdownButton variant='outline-secondary' title={sort}>
                        <Dropdown.Item onClick={() => setSort('Last Updated')}>Last Updated</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSort('A-Z')}>A-Z</Dropdown.Item>
                    </DropdownButton>
                    
                        <div style={{height: '200px', overflowY: 'scroll'}}>
                        {films.map(
                            film => 
                            <p onClick={() => handleFilmChange(film._id)}>
                                {film.Title}
                            </p>
                        )}
                        </div>

                    

                </Modal.Body>
                <Modal.Footer>
                    <Form>
                        <Form.Label>Message</Form.Label>
                        <Form.Control value={message} onChange={handleMessageChange}>

                        </Form.Control>
                    </Form>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSend}>
                    Send
                </Button>
                </Modal.Footer>
            </Modal>       
        </> 

    )
}

export default ShareModal