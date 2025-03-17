import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/home/Home.jsx';
import Profile from './pages/profile/Profile';
import FilmsPage from './pages/films/FilmsPage';
import Friends from './pages/friends/Friends';
import Reccomendations from './pages/reccomendations/Reccomendations';
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
import ProfileDelete from './pages/profile/ProfileDelete'
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
									<Route exact path='/' render={() => <Home />} />
									<Route exact path='/films/:id' render={() => <FilmsPage />} />
									<Route exact path='/friends/' render={() => <Friends />} />
									<Route exact path='/reccomendations' render={() => <Reccomendations />} />
									<Route exact path='/profile/:id' render={() => <Profile  />} />
									<Route exact path='/resetPassword/sendOTP/' render={() => <SendOTP resetPassword />} />
									<Route exact path='/changeEmail/sendOTP' render={() => <SendOTP changeEmail />} />
									<Route exact path='/resetPassword/' render={() => <ResetPassword />} />
									<Route exact path='/profile/delete/:id' render={() => <ProfileDelete />} />
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
