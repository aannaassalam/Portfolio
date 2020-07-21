import React from 'react';
import './CSS/Contact.css';

export default class Contact extends React.Component{
    render(){
        return(
            <div className="contact-box">
                <i className="fa fa-times fa-1x cross" onClick={this.handleClick}></i>
                <p className="contact">
                    E-mail: anasalam027@gmail.com<br/>
                    Phone Number: +91 70448 04030<br/><hr/>
                </p>
                <p>   
                    Social Media Handles:
                </p>
                <div className="social">
                    <a href="https://www.instagram.com/aannaassalam/"><i className="fa fa-instagram fa-2x"></i></a>
                    <a href="https://www.facebook.com/anasalam027/"><i className="fa fa-facebook-square fa-2x"></i></a>
                    <a href="https://twitter.com/aannaassalam/"><i className="fa fa-twitter-square fa-2x"></i></a>
                    <a href="https://www.linkedin.com/in/anas-alam-0207331b2/"><i className="fab fa-linkedin fa-2x"></i></a>
                </div>
            </div>
        );
    }

    handleClick = () =>{
        var a = document.getElementsByClassName("contact-box");
        a[0].style.display="none";
    }    
}
