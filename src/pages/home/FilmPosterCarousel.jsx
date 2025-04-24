import React from 'react';
import {  Carousel, Row, Col } from 'react-bootstrap'
import FilmPreview from '../../components/FilmPreview';
import { FilmPreviewProvider } from '../../contexts/FilmPreviewContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';

// Displays a collection of film images as a carousel, used as home page background
const FilmPosterCarousel = ({films}) => {
    // Hooks
    const { largeScreen } = useWindowDimensions()
    
    // Column structure used to display film poster
    const FilmCol = (film) => {
        return (
            <Col key={film.imdbID} lg={2} md={4} xs={4}>
                <FilmPreviewProvider 
                    film={film} 
                    mobile
                    filmsPage
                    faded
                    carousel
                >
                    <FilmPreview />
                </FilmPreviewProvider>
            </Col>
        )
    }
    // Return 3 carousel items, each with 24 or 18 film posters depending on screen size
    return (
        <Carousel data-bs-theme="dark" nextIcon={null} prevIcon={null} indicators={false} fade>
            <Carousel.Item>
                <Row>
                    {largeScreen? 
                        films.slice(0, 24).map((film) => FilmCol(film))
                    :
                        films.slice(0, 18).map((film) => FilmCol(film))
                    }
                </Row>
            </Carousel.Item>
            <Carousel.Item>
                <Row>
                    {largeScreen? 
                            films.slice(24, 48).map((film) => FilmCol(film))
                        :
                            films.slice(18, 36).map((film) => FilmCol(film))
                        }
                </Row>
            </Carousel.Item>
            <Carousel.Item>
                <Row>
                    {largeScreen? 
                            films.slice(48, 72).map((film) => FilmCol(film))
                        :
                            films.slice(36, 54).map((film) => FilmCol(film))
                        }
                </Row>
            </Carousel.Item>
            </Carousel>
    )
}

export default FilmPosterCarousel