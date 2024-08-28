import React from 'react';

const Home = () => {
    return (
        <>
            <h1 data-testid='header-home'>Home Page</h1>
            <form >
                <label>Search for a film</label>
                <input data-testid='film-search' type='search'></input>
            </form>
        </>

    )
}
export default Home;