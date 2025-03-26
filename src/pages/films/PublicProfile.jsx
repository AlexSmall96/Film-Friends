import React from 'react';
import {Button, Row, Col, Image, OverlayTrigger, Tooltip} from 'react-bootstrap'
import styles from '../../styles/Films.module.css'
import appStyles from '../../App.module.css'
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import { FriendDataProvider } from '../../contexts/FriendDataContext';
import { useFriendAction } from '../../contexts/FriendActionContext';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import FriendRequestButtons from '../friends/FriendRequestButtons';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const PublicProfile = ({profile, filmStats, requestIds, requests, showStats, similarity, directorCounts, genreCounts}) => {
    const { isOwner } = useCurrentFilm()
    const { id } = useParams()
    const { getStatus } = useFriendAction()

    const renderTooltip = (name, value, bool) => (
        <Tooltip id="button-tooltip">
            {bool?
                `Your films directed by ${name} have an average rating of ${value}`
            :
                `Your ${name} films have an average rating of ${value}`}
        </Tooltip>
    )

    return (
        <Row className={styles.filmStats}>
            <Col md={3}>
                <Image src={profile.image} width={100} height={100} roundedCircle />
                <h4 className={appStyles.smallFont}>{profile.username}</h4>
                {isOwner?
                    <Button href='/profile' variant='link'>Go to your Profile</Button>    
                :   <FriendDataProvider requestId={null} user={{...profile, _id: id}}>
                        <FriendRequestButtons status={getStatus(id, requestIds, requests)} searchResult={true} />
                    </FriendDataProvider>
                    
                }
            </Col>
            {showStats?
                <>
                    <Col md={3}>
                    <h4 className={appStyles.smallFont}>Films Watched</h4>
                    <div className={styles.progressBarParent}>
                        <CircularProgressbar value={100 * filmStats.watchedCount / filmStats.savedCount} text={filmStats.watchedCount} />
                    </div>
                    <p>{!isOwner? similarity : ''}</p>
                    </Col>
                    <Col md={3}>
                        <h4 className={appStyles.smallFont}>Favourite Directors</h4>
                        {directorCounts.map(([director, count], index) => (
                            <OverlayTrigger
                                placement="top"
                                delay={{ show: 250, hide: 400 }}
                                overlay={renderTooltip(director, count, true )}
                                key={index}
                            >
                                <p className={`${appStyles.grey} ${appStyles.smallFont}`}>
                                {director}
                                </p>
                            </OverlayTrigger>
                        ))}
                    </Col>
                    <Col md={3}>
                    <h4 className={appStyles.smallFont}>Favourite Genres</h4>
                        {genreCounts.map(([genre, count], index) => (
                        <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 400 }}
                            overlay={renderTooltip(genre, count, false)}
                            key={index}
                        >
                            <p className={`${appStyles.grey} ${appStyles.smallFont}`}>
                                {genre}
                            </p>
                        </OverlayTrigger>
                        ))}
                    </Col>            
                </>
            :
                <>
                    {isOwner? 
                        <Col md={3}>
                            You don't have any films saved yet.<Button href={`/`} variant='link'>Click here to browse films</Button> 
                        </Col>
                    : 
                        `${profile.username} doesn't have any films saved yet`}
                </>
            } 
        </Row>
    )
}

export default PublicProfile