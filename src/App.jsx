import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NavBar from './components/NavBar';
import Results from './pages/home/Results.jsx';
import Profile from './pages/profile/Profile';
import FilmsPage from './pages/films/FilmsPage';
import Friends from './pages/friends/Friends';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import { BrowserRouter as Router } from 'react-router-dom/cjs/react-router-dom.min';
import {CurrentUserProvider} from './contexts/CurrentUserContext'
import { RecoveryDataProvider } from './contexts/RecoveryDataContext.jsx';
import { CurrentFilmProvider } from './contexts/CurrentFilmContext.jsx';
import { FriendActionProvider } from './contexts/FriendActionContext.jsx';
import { SaveFilmProvider } from './contexts/SaveFilmContext.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import SendOTP from './pages/auth/SendOTP.jsx';
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.App}>
      	<CurrentUserProvider>
	    	<RecoveryDataProvider>
        		<CurrentFilmProvider>
					<FriendActionProvider>
						<SaveFilmProvider>
							<Router>
								<NavBar />
								<Switch>
									<Route exact path='/' render={() => <Results />} />
									<Route exact path='/films/:id' render={() => <FilmsPage />} />
									<Route exact path='/friends/' render={() => <Friends />} />
									<Route exact path='/reccomendations' render={() => <Results reccomendationsPage/>} />
									<Route exact path='/profile/info' render={() => <Profile activeKey='first' />} />
									<Route exact path='/profile/accountSecurity' render={() => <Profile activeKey='second' />} />
									<Route exact path='/profile/deleteAccount' render={() => <Profile activeKey='third' />} />
									<Route exact path='/resetPassword/sendOTP/' render={() => <SendOTP resetPassword />} />
									<Route exact path='/changeEmail/sendOTP' render={() => <SendOTP changeEmail />} />
									<Route exact path='/resetPassword/' render={() => <ResetPassword />} />
									<Route exact path='/signup' render={() => <Signup />} />
									<Route exact path='/login' render={() => <Login />} />
								</Switch>
							</Router>
						</SaveFilmProvider>
					</FriendActionProvider>
        		</CurrentFilmProvider>
		    </RecoveryDataProvider>
      	</CurrentUserProvider>
    </div>
  );   
}

export default App;
