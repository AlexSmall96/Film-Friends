import React, { useState, useRef } from 'react';
import { Overlay } from 'react-bootstrap';
import appStyles from '../App.module.css'

const EllipsisMenu = ({handleDelete, handlePublicChange, publicFilm, handleShare}) => {
    
    const [show, setShow] = useState(false);
    const target = useRef(null)


    return (
        <div style={{float: 'right'}}>
            <i onClick={() => setShow(!show)} ref={target} className={`fa-xl fa-solid fa-ellipsis-vertical`}></i>
            <Overlay 
                target={target.current} 
                show={show} 
                placement="left" 
                rootClose='false'
                onHide={() => {setShow(false)}} 
            >
            {({placement: _placement, arrowProps: _arrowProps, show: _show, popper: _popper, hasDoneInitialMeasure: _hasDoneInitialMeasure, ...props}) => 
                (<div 
                    {...props}
                    style={{
                    position: 'absolute',
                    backgroundColor: 'lightgrey',
                    padding: '2px 10px',
                    color: 'black',
                    borderRadius: 3,
                    ...props.style,
                    }}
                >
                    <p onClick={handleShare} className={appStyles.hover}><i className="fa-solid fa-share"></i> Share</p>
                    <p className={appStyles.hover} onClick={handleDelete}><i className="fa-regular fa-trash-can"></i> Remove from Watchlist</p>
                    <p className={appStyles.hover} onClick={handlePublicChange}><i className="fa-solid fa-pen"></i> {publicFilm? 'Make Private': 'Make Public'}</p>
                </div>)
            }
            </Overlay>
        </div>
    )
}

export default EllipsisMenu