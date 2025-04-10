import React from 'react';
import {Button, Row, Col, Image, OverlayTrigger, Tooltip, ProgressBar, Badge, Stack} from 'react-bootstrap'
import styles from '../../styles/Films.module.css'
import appStyles from '../../App.module.css'
import { useCurrentFilm } from '../../contexts/CurrentFilmContext';
import { useFriendAction } from '../../contexts/FriendActionContext';
import { useParams } from 'react-router-dom/cjs/react-router-dom.min';
import { CircularProgressbar } from 'react-circular-progressbar';
import useWindowDimensions from '../../hooks/useWindowDimensions';
import 'react-circular-progressbar/dist/styles.css';

const PublicProfile = ({profile, filmStats, showStats, similarity, directorCounts, genreCounts}) => {
    const { isOwner } = useCurrentFilm()
    const { width } = useWindowDimensions()
    const renderTooltip = (name, value, bool) => (
        <Tooltip id="button-tooltip">
            {bool?
                `Your films directed by ${name} have an average rating of ${value}`
            :
                `Your ${name} films have an average rating of ${value}`}
        </Tooltip>
    )

    return (
        <Row className={`${width >= 576? `${appStyles.greyBorder} ${appStyles.greyBackground}` : ''} ${appStyles.bigVerticalMargin}`}>
            <Col md={3} sm={1} xs={2}>
                {isOwner? 
                    <a href='/profile'><h4 className={`${appStyles.smallFont} ${appStyles.headingFont}`}>{profile.username}</h4></a>
                :
                    <h4 className={`${appStyles.smallFont} ${appStyles.headingFont}`}>{profile.username}</h4>
                }
                <Image src={profile.image} width={width >= 768? 100: 50 } height={width >= 768? 100: 50 } roundedCircle />
            </Col>
            {showStats?
                <>
                    <Col md={3} sm={3} xs={3}>
                        <h4 className={`${appStyles.smallFont} ${appStyles.headingFont}`}>{isOwner? 'Watched' : 'Similarity'}</h4>
                        {isOwner?
                            <div className={styles.progressBarParent}>
                                <CircularProgressbar value={100 * filmStats.watchedCount / filmStats.savedCount} text={`${filmStats.watchedCount} / ${filmStats.savedCount}`} />
                            </div>
                        :
                            <div className={styles.progressBarParent}>
                                <CircularProgressbar value={100 * similarity} text={`${100 * similarity}%`} />
                            </div>}
                    </Col>
                    <Col md={3} sm={4} xs={12}>
                        <h4 className={`${appStyles.smallFont} ${appStyles.headingFont}`}>{width >= 576 ? 'Favourite Genres':''}</h4>
                            {width >= 576?
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
                        }
                    </Col>
                    <Col md={3} sm={4} xs={12}>
                    <h4 className={`${appStyles.smallFont} ${appStyles.headingFont}`}>{width >= 576 ? 'Favourite Directors':''}</h4>
                        {width >= 576 ? 
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
                        }
                    </Col>            
                </>
            :''
            } 
        </Row>
    )
}

export default PublicProfile