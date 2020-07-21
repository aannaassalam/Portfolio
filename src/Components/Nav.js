import React from 'react';
import './CSS/Nav.css'
import { Link } from 'react-router-dom';

export default class Nav extends React.Component{
    render(){
        return(
            <div className="nav-container">
                <div className="container">
                    <h1 className="header">Anas Alam</h1>
                    <nav>
                        <ul className='nav-ul'>
                            <li>
                                <Link to='/'>Home</Link> 
                            </li>
                            <li>
                                <Link to='/projects'>Projects</Link>
                            </li>
                            <li>
                                <Link id="cont" onClick={this.onClick}>Contact</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        );
    }

    onClick = () =>{
        var a = document.getElementById("cont");
        a.classList.add("activated");
        var contactBox = document.getElementsByClassName("contact-box");
        contactBox[0].style.display = "block";
    }
}