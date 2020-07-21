import React from 'react';
import './Components/CSS/App.css'
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import Home from './Components/Home'
import Projects from './Components/Projects'

export default class App extends React.Component{
  render() {
    return(
      <BrowserRouter>
        <Switch>
          <Route exact path='/' component={Home}></Route>
          <Route exact path='/projects' component={Projects}></Route>
        </Switch>
      </BrowserRouter>
    );
  }
}