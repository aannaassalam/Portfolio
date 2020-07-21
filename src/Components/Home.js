import React from 'react';
import Nav from './Nav';
import './CSS/Home.css';
import './CSS/Contact.css';
import Anas from '../img/Anas.jpg';
import Contact from './Contact'
import Footer from './Footer';

export default class Home extends React.Component{

    render(){
        return(
            <div className="home-container">
                <Nav/>
                <div className="main">
                    <div className="img-cont">
                        <img src={Anas} alt="anas.jpg"></img>
                    </div>
                    <p>Hi folks,</p>
                    <p>Welcome to my page. You are looking at my portfolio.
                    Talking about myself, am a student studying at Techno India University.
                    My Qualifications are basically 10+2 (10<sup>th</sup> pass and 12<sup>th</sup> pass)
                        and I am also mastering web-development, basically I am not studying this as my main goal,
                        this is just a side skill. My actual goal is to become a Data-Scientist. There were alot of hardships that I had to go through.
                        My one and only MOTO is</p>
                    <strong>LEARN... GROW... EVOLVE...</strong>
                    <p>If you are here to Know more about me and my skills, talents then go right up there and smash that Projects link to get redirected to 
                        my projects. And if you are interested in contacting me then go and smash that Contact link to get my contact info.
                    </p>
                </div>
                <Footer/>
                <Contact/>
            </div>
        );
    }
}