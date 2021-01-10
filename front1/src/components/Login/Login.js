import React, { Component } from 'react'
import styled from 'styled-components'
import backgroundHoney from '../../assets/fondoMiel.png'
import welcomeLogo from '../../assets/welcome.png'
import TextInputBox from '../TextInputBox'
import FbGgLogin from '../FbGgLogin'
import Siguiente from '../../assets/btnSiguiente.png'

export class Login extends Component {

    state = {
        email:"",
        password:""
    }

    changeHandler =(e) => {
        this.setState({[e.target.name]: e.target.value})
    }
    submitHandler = (e) => {
        e.preventDefault()
        
        
        
        fetch("http://localhost:5678/login", {
            method: "POST",
            headers: {"Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json'
            },  body: JSON.stringify(this.state) 
        
        }).then(res => res.text()).then((data) => {console.log(data)})

    }   
    render() {
        const {email, password} = this.state;
        return (
            <Container>
                <StyledDiv>
                    <StyledLogo>
                        <img src= {welcomeLogo} alt="Coolmena logo"/>
                    </StyledLogo>
                    <StyledForm onSubmit={this.submitHandler}>
                        <TextInputBox img ="email" type="email" placeholder="Email" value={email} callbackHandler={this.changeHandler} name="email"/>
                        <TextInputBox img ="password" type="password" placeholder="Contraseña" value={password} callbackHandler={this.changeHandler} name="password"/>
                        <FbGgLogin/>
                        <button type="submit"><img src={Siguiente} alt="Siguiente"/></button>
                    </StyledForm>
                </StyledDiv>
            </Container>
        )
    }
}
//tienes que cambiar el bottom a margin 100px
const Container = styled.div`
top:0;
bottom:0; 
right:0;
left:0;
position:absolute;

`;


const StyledDiv = styled.div`
background-image: url(${backgroundHoney});
background-position: center;
background-size: cover;
background-repeat: no-repeat;
width: 100%;
height: 85%;
display: flex;
justify-content: space-around;
flex-direction: column;


 


`;

const StyledLogo = styled.div`
display: flex;
justify-content: center;
margin: 0;

`;

const StyledForm = styled.form`
display: flex;
flex-direction: column;
align-items: center;




`;
export default Login
