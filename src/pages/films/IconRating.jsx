import React from 'react';
import {Image, OverlayTrigger, Tooltip, } from 'react-bootstrap'
import appStyles from '../../App.module.css'
const IconRating = ({index, value}) => {

    const data = [
        {src: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1728577496/43153_imdb_icon_vvpjnz.png', name: 'IMDB'},
        {src: 'https://res.cloudinary.com/dojzptdbc/image/upload/v1728577835/Rotten_Tomatoes_tqvchw.svg', name : 'Rotten Tomaties'},
        {src:'https://res.cloudinary.com/dojzptdbc/image/upload/v1728577923/Metacritic_uduhqj.svg', name: 'Metacrtic'}
    ]

    const renderTooltip = (name, value) => (
        <Tooltip id="button-tooltip">
            {`${name} gave this film a rating of ${value}`}
        </Tooltip>
    );

    return (
        <>
        <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip((data[index]).name, value )}
        >
            <Image width={25} src={data[index].src} />
        </OverlayTrigger>
        <span className={appStyles.smallFont}>{` ${value} `} </span>       
        </>
    )
}

export default IconRating