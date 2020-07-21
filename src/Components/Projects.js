import React from 'react';
import Nav from './Nav';
import Footer from './Footer'
import Contact from './Contact';
import './CSS/Projects.css'

export default class Projects extends React.Component{
    render(){
        return(
            <>
                <Nav/>
                <div className="hamid-site">
                    <h3>My first website as a demonstration to my friend.</h3>
                    <iframe src="https://aannaassalam.github.io/websites/hamid/" title="My first Project" frameborder="0"></iframe>
                </div>
                <div className="insta-site">
                    <h3>My first attempt to clone another website (first target instagram..).</h3>
                    <iframe src="https://aannaassalam.github.io/websites/insta/" title="Instagram Clone" frameborder="0"></iframe>
                </div>
                <Footer/>
                <Contact/>
            </>
        );
    }
}