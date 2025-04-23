import React, { useEffect, useRef, useState } from 'react';
import { Badge, Row, Container, Stack } from 'react-bootstrap';
import styles from '../../styles/FilmBadges.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions';

// Used in home page to show titles of most recently updated films
const FilmBadges = ({ films, search, setSearch, setSubmitted }) => {
    const containerRef = useRef(null);
    const [visibleFilms, setVisibleFilms] = useState(films);
    const { width } = useWindowDimensions()
    
    // Checks wether or not a badge is fully visible when window resizes
    useEffect(() => {
        const checkVisibility = () => {
            if (containerRef.current) {
                const badges = containerRef.current.querySelectorAll('.hidden-badge');
                const visibleFilmsList = [];
                for (const [index, badge] of badges.entries()){
                    const badgeRect = badge.getBoundingClientRect();
                    if (badgeRect.right >= width) {
                        
                    } else {
                        visibleFilmsList.push(films[index]);
                    }
                }
                setVisibleFilms(visibleFilmsList);
            }
        };
        checkVisibility();
    }, [films, width]);

    // When badge is clicked, set search query to display results on home page
    const handleClick = (event) => {
        setSearch(event.target.innerHTML)
        setSubmitted(current => !current)
    }


    return (
        <Container ref={containerRef} className={styles.badgeContainer}>
            <Row>
                {/* BADGES TO DISPLAY VISIBIBLE FILMS */}
                <Stack direction="horizontal" gap={2}>
                    {visibleFilms.map((film, index) => (
                        <Badge key={index} bg="secondary" className={`${styles.badge} ${film === search? styles.selected: ''}`} onClick={handleClick}>{film}</Badge>
                    ))}
                </Stack>
            </Row>
            <Row>
                {/* HIDDEN BADGES TO DETECT SIZE */}
                <Stack direction="horizontal" gap={2} className={styles.hidden}>
                    {films.map((film, index) => (
                        <Badge key={index} bg="outline-secondary" className={`hidden-badge ${styles.hidden}`}>{film}</Badge>
                    ))}
                </Stack>
            </Row>
        </Container>
    );
};

export default FilmBadges;
