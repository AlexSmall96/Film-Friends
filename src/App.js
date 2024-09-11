import { Route, Switch } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Films from './pages/Films';
import Friends from './pages/Friends';
import Reccomendations from './pages/Reccomendations';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { BrowserRouter as Router } from 'react-router-dom/cjs/react-router-dom.min';
import { useState } from 'react';

function App({currentUser}) {
  const [user, setUser] = useState(
    currentUser? (currentUser):(null)
  )
  return (
    <Router>
      <NavBar currentUser={user} />
        <Switch>
          <Route exact path='/' render={() => <Home currentUser={user} />} />
          <Route exact path='/myfilms' render={() => <Films currentUser={user} />} />
          <Route exact path='/friends' render={() => <Friends />} />
          <Route exact path='/reccomendations' render={() => <Reccomendations />} />
          <Route exact path='/profile/:id' render={() => <Profile currentUser={user} />} />
          <Route exact path='/signup' render={() => <Signup />} />
          <Route exact path='/login' render={() => <Login setCurrentUser={setUser} />} />
        </Switch>
    </Router>
  );
}

export default App;
