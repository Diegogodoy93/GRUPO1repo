import React, { Component } from 'react'
import HoverImage from "react-hover-image";
import styled from 'styled-components'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
  } from "react-router-dom";

import home from '../assets/homeNav.png'
import homeSel from '../assets/homeNavSel.png'
import market from '../assets/marketNav.png'
import marketSel from '../assets/marketNavSel.png' 
import blog from '../assets/blogNav.png'
import blogSel from '../assets/blogNavSel.png'
import perfil from '../assets/perfilNav.png'
import perfilSel from '../assets/perfilNavSel.png'




export class Nav extends Component {
    state = {
        selected: false
        

    }
   

    render() {
        return (
            <Router>
                <StyledNav>
                    <div className= "Home">
                        <Link to="/" >
                            <HoverImage className="homeIcon" src={home} hoverSrc={homeSel}  alt={"Home"} />
                        </Link > 
                    </div>
                    <div className ="Market">
                        <Link to="/market">
                            <HoverImage className="marketIcon" src={market} hoverSrc={marketSel}  alt={"Market"} />
                        </Link >
                    </div>
                    <div className ="Blog">
                        <Link  to="/blog">
                            <HoverImage className="blogIcon" src={blog} hoverSrc={blogSel}  alt={"Blog"} />
                        </Link >
                    </div>
                    <div className ="Profile">
                        <Link  to="/profile">
                            <HoverImage className="profileIcon" src={perfil} hoverSrc={perfilSel}  alt={"Perfil"} />
                        </Link >
                    </div>
                    <Switch>
                        <Route exact path="/">
                        </Route>
                        <Route path="/market" >
                        </Route>
                        <Route path="/blog">
                        </Route>
                        <Route path ="/profile">
                        </Route>
                    </Switch>
                </StyledNav>
            </Router>
        )
    }
}


const StyledNav = styled.nav`
height: 56px;
width: 361px;
display: flex;
justify-content: space-between;
div{
    margin: 15px;   
}


`;

export default Nav

