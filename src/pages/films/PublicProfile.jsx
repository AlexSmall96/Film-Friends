import React, { useEffect, useState} from 'react';
import { Row, Col, OverlayTrigger, Tooltip, ProgressBar, Badge, Stack} from 'react-bootstrap'
import styles from '../../styles/PublicProfile.module.css'
import appStyles from '../../App.module.css'
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import { CircularProgressbar } from 'react-circular-progressbar';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import 'react-circular-progressbar/dist/styles.css';
import Avatar from '../../components/Avatar';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

/*
Displays a users stats: films watched, favourite directors and favourite genres.
Acts as a public profile when a user views another users watchlist
Also displays similarity score based on films two users have in common.
*/
const PublicProfile = ({profile, filmStats, showStats, similarity, directorCounts, genreCounts}) => {
    // Hooks, Contexts and variables
    const { isOwner } = useCurrentFilm()
    const { width } = useWindowDimensions()
    const [avatarHeight, setAvatarHeight] = useState(100)
    const similarityMessage = `Based on films that you and ${profile.username} have in common, your ratings are ${100*similarity || 0}% similar.`
    // Tooltip for genre and director counts
    const renderTooltip = (name, value, bool) => (
        <Tooltip id="button-tooltip">
            {bool?
                `Your films directed by ${name} have an average rating of ${value}`
            :
                `Your ${name} films have an average rating of ${value}`}
        </Tooltip>
    )

    // Change user image height based on screen width
    useEffect(() => {
        if (width <= 767){
            setAvatarHeight(50)
        }
        else if (width <= 991){
            setAvatarHeight(90)
        }
        else {
            setAvatarHeight(100)
        }
    }, [width])

    const history = useHistory()

    return (
        <Row className={`${width >= 576? `${appStyles.greyBorder} ${appStyles.greyBackground}` : ''} ${appStyles.bigVerticalMargin}`}>
            {/* PROFILE PICTURE AND USERNAME */}
            <Col md={3} sm={1} xs={2}>
                {isOwner? 
                    <a href={''}><h4 onClick={() => history.push('/profile')} className={`${appStyles.smallFont} ${appStyles.headingFont}`}>{profile.username}</h4></a>
                :
                    <h4 className={`${appStyles.smallFont} ${appStyles.headingFont}`}>{profile.username}</h4>
                }
                <Avatar height={avatarHeight} src={profile.image} />
            </Col>
            {showStats?
                <>
                    <Col md={3} sm={{span:3, offset:0}} xs={{span:3, offset: 1}}>
                        <h4 className={`${appStyles.smallFont} ${appStyles.headingFont}`}>{isOwner? 'Watched' : 'Similarity'}</h4>
                        {isOwner?
                            /* WATCHED COUNT / SIMILARITY SCORE */
                            <div className={styles.progressBarParent}>
                                <CircularProgressbar value={100 * filmStats.watchedCount / filmStats.savedCount} text={`${filmStats.watchedCount} / ${filmStats.savedCount}`} />
                            </div>
                        :
                        <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 400 }}
                            overlay={<Tooltip id="button-tooltip-2">{similarityMessage}</Tooltip>}
                        >
                            <div className={styles.progressBarParent}>
                                <CircularProgressbar value={100 * similarity} text={`${100 * similarity}%`} />
                            </div>
                        </OverlayTrigger>}
                    </Col>
                    {/* FAVOURITE GENRES */}
                    <Col md={3} sm={4} xs={12}>
                        <h4 className={`${appStyles.smallFont} ${appStyles.headingFont}`}>{width >= 576 ? 'Favourite Genres':''}</h4>
                            {genreCounts.length?
                                width >= 576?
                                    genreCounts.map(([genre, count], index) => (
                                        <OverlayTrigger
                                            placement="top"
                                            delay={{ show: 250, hide: 400 }}
                                            overlay={renderTooltip(genre, count, false)}
                                            key={index}
                                        >
                                            <ProgressBar variant={index === 0? 'success': index === 1? 'info': 'warning'} now={100 * count / 5} label={genre} key={index} />
                                        </OverlayTrigger>
                                    ))
                                :
                                    <Stack direction="horizontal" gap={1}>
                                        {genreCounts.map(([genre, count], index) => (
                                            <Badge pill bg="primary" key={index}>{genre}</Badge>
                                        ))}
                                    </Stack>
                            :
                                width >= 576? <Avatar src='https://res.cloudinary.com/dojzptdbc/image/upload/v1744639090/question_ydkaop.png' height={avatarHeight} alt='question mark' />:''}
                    </Col>
                    {/* FAVOURITE DIRECTORS */}
                    <Col md={3} sm={4} xs={12}>
                        <h4 className={`${appStyles.smallFont} ${appStyles.headingFont}`}>{width >= 576 ? 'Favourite Directors':''}</h4>
                            {directorCounts.length?
                                width >= 576 ? 
                                    directorCounts.map(([director, count], index) => (
                                        <OverlayTrigger
                                            placement="left"
                                            delay={{ show: 250, hide: 400 }}
                                            overlay={renderTooltip(director, count, true)}
                                            key={index}
                                        >
                                            <ProgressBar variant={index === 0? 'success': index === 1? 'info': 'warning'} now={100 * count / 5} label={director} key={index} />
                                        </OverlayTrigger>
                                    ))
                                :
                                <Stack direction="horizontal" gap={1} className={appStyles.verticalMargin}>
                                    {directorCounts.map(([director, count], index) => (
                                        <Badge pill bg="secondary" key={index}>{director}</Badge>
                                    ))}
                                </Stack>
                            :
                                width >= 576?<Avatar src='https://res.cloudinary.com/dojzptdbc/image/upload/v1744639090/question_ydkaop.png' height={avatarHeight} alt='question mark' />:''}
                    </Col>            
                </>
            :''
            } 
        </Row>
    )
}

export default PublicProfile