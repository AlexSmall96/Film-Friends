import React, { useEffect, useState } from 'react';
import {  Carousel, Row, Col } from 'react-bootstrap'
import FilmPreview from '../../components/FilmPreview';
import { FilmPreviewProvider } from '../../contexts/FilmPreviewContext';
import useWindowDimensions from '../../hooks/useWindowDimensions';

// Displays a collection of film images as a carousel, used as home page background
const FilmPosterCarousel = ({films}) => {
    // Hooks
    const { largeScreen } = useWindowDimensions()
    const [activeIndex, setActiveIndex] = useState(0)
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
    // The code to update activeIndex was taken from the below article
    // https://upmostly.com/tutorials/settimeout-in-react-components-using-hooks
    useEffect(() => {
        const timer = setTimeout(() => {
        	if (films.length >= 18){
				const newIndex = (activeIndex + 1) % 3
				setActiveIndex(newIndex);
			}
        }, 8000);
        return () => clearTimeout(timer);
      }, [activeIndex]);


    // Return 3 carousel items, each with 24 or 18 film posters depending on screen size
    return (
        <Carousel data-bs-theme="dark" activeIndex={activeIndex} nextIcon={null} prevIcon={null} indicators={false} fade>
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