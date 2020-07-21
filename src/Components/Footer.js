import React from 'react';
import './CSS/Footer.css'

export default class Footer extends React.Component{
    render(){
        return(
            <div className="footer">
                <p className="copyright">
                    Portfolio 2020 &copy; Copyrights reserved.
                </p>
                <div className="icons">
                    <a href="https://www.instagram.com/aannaassalam/"><i className="fa fa-instagram fa-2x"></i></a>
                    <a href="https://www.facebook.com/anasalam027/"><i className="fa fa-facebook-square fa-2x"></i></a>
                    <a href="https://twitter.com/aannaassalam/"><i className="fa fa-twitter-square fa-2x"></i></a>
                    <a href="https://www.linkedin.com/in/anas-alam-0207331b2/"><i className="fab fa-linkedin fa-2x"></i></a>
                </div>
            </div>
        )
    }
}