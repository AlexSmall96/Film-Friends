import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Profile from './pages/profile/Profile';
import ProfileEdit from './pages/profile/ProfileEdit';
import Films from './pages/films/Films';
import Friends from './pages/Friends';
import Reccomendations from './pages/reccomendations/Reccomendations';
import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import { BrowserRouter as Router } from 'react-router-dom/cjs/react-router-dom.min';
import {CurrentUserProvider} from './contexts/CurrentUserContext'
import { RecoveryEmailProvider } from './contexts/RecoveryEmailContext.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import SendOTP from './pages/auth/SendOTP.jsx';
import ProfileDelete from './pages/profile/ProfileDelete'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.App}>
      <CurrentUserProvider>
	  <RecoveryEmailProvider>
        <Router>
          <NavBar />
            <Switch>
              <Route exact path='/' render={() => <Home />} />
              <Route exact path='/films/:id' render={() => <Films />} />
              <Route exact path='/films/:id/:imdbID/:database' render={() => <Films />} />
              <Route exact path='/friends/' render={() => <Friends />} />
              <Route exact path='/reccomendations' render={() => <Reccomendations />} />
              <Route exact path='/profile/:id' render={() => <Profile  />} />
              <Route exact path='/profile/edit/:id' render={() => <ProfileEdit  />} />
            	<Route exact path='/sendOTP/' render={() => <SendOTP />} />
            	<Route exact path='/resetPassword/' render={() => <ResetPassword />} />
              <Route exact path='/profile/delete/:id' render={() => <ProfileDelete />} />
              <Route exact path='/signup' render={() => <Signup />} />
              <Route exact path='/login' render={() => <Login />} />
            </Switch>
        </Router>
		</RecoveryEmailProvider>
      </CurrentUserProvider>
    </div>
  );   
}

export default App;
