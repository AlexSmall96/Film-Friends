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

function App() {
  return (
    <Router>
      <NavBar  />
        <Switch>
          <Route exact path='/' render={() => <Home />} />
          <Route exact path='/films' render={() => <Films />} />
          <Route exact path='/friends' render={() => <Friends />} />
          <Route exact path='/reccomendations' render={() => <Reccomendations />} />
          <Route exact path='/profile' render={() => <Profile />} />
          <Route exact path='/signup' render={() => <Signup />} />
          <Route exact path='/login' render={() => <Login />} />
        </Switch>
    </Router>
  );
}

export default App;
