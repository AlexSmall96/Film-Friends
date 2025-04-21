import { useEffect, useRef, useState } from 'react';
import { Badge, Row, Container, Stack } from 'react-bootstrap';
import styles from '../../styles/FilmBadges.module.css'
import useWindowDimensions from '../../hooks/useWindowDimensions';

const FilmBadges = ({ films }) => {
    const containerRef = useRef(null);
    const [visibleFilms, setVisibleFilms] = useState(films);
    const { width } = useWindowDimensions()
    
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


    return (
        <Container ref={containerRef} className={styles.badgeContainer}>
            <Row>
                <Stack direction="horizontal" gap={2}>
                    {visibleFilms.map((film, index) => (
                        <Badge key={index} bg="secondary" className={styles.badge}>{film}</Badge>
                    ))}
                </Stack>
            </Row>
            <Row>
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
