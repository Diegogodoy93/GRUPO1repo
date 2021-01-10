import React, { Component } from 'react'
import styled from 'styled-components'
import fbLogo from '../assets/Facebook.png'
import ggLogo from '../assets/Google.png'

export class FbGgLogin extends Component {
   //Este componente estará conectado con el registro de google/facebook 
    
   render() {
        return (
            <StyledDiv>
                <img src={fbLogo} onClick={this.props.googleHandler} alt="Registro con Facebook"/>
                <img src={ggLogo} alt="Registro con Google"/>
                
            </StyledDiv>
        )
    }
}


const StyledDiv = styled.div`
width: 271px;
height: 66px;
display: flex;


justify-content: center;
img{
    height: 24px;
    width: 24px;
    margin: 5px;
}

`;



export default FbGgLogin
