import React, { Component } from 'react'
import {Fetch} from '../../Hooks/Fetch'  //=> Utilizando esto me da el error de CORS "can't use wildcard when allow origin etc". Hay que adaptar el Fetch de Rafa.
import styled from 'styled-components'
import HoverImage from "react-hover-image";
import backgroundHoney from '../../assets/fondoMiel.png'
import welcomeLogo from '../../assets/welcome.png'
import TextInputBox from '../TextInputBox'
import FbGgLogin from '../FbGgLogin'
import Siguiente from '../../assets/btnSiguiente.png'
import imgConsum from '../../assets/Button_Consumidor.png'
import imgConsumSel from '../../assets/Button_ConsumidorSel.png'
import imgApic from '../../assets/Button_Apicultor.png'
import imgApicSel from '../../assets/Button_ApicultorSel.png'
import rectangle from '../../assets/rectangle.png'
import passwordImg from '../../assets/password.png';

export class Register extends Component {
    

    //Falta conectar los botones de google/facebook y comprobar el login de apic 
    state = {
        email:"",
        password:"",
        name:"",
        familyName:"",
        apic:"",
        codigoAsentamiento:"",
        tipoOrganizacion:""
    }

    googleHandler = () => {
        fetch("http://localhost:5678/google-redirect").then((data) => data.text()).then((data) => console.log(data))

        console.log("clicked!")
    }

    selectHandler = (e) => {
        
        const selected = e.target.value
        
        this.setState({tipoOrganizacion: selected})
        
        
        
        
    }
    changeHandler =(e) => {
        this.setState({[e.target.name]: e.target.value})
        console.log(this.state)
        
    }
    apicToggle = () => {
        this.setState({apic: 1})         
    }

    consumerToggle = () => {
        this.setState({apic: ""}) 
    }
    submitHandler = (e) => {
        e.preventDefault()
        
        console.log(this.state)
        
        fetch("http://localhost:5678/register", {
            method: "POST",
            headers: {"Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json'
            },  body: JSON.stringify(this.state) 
        
        }).then(res => res.text()).then((data) => {console.log(data)})

    }


    
    render() {
        const {email, password, name, familyName, codigoAsentamiento} = this.state;
        
        
        if(!this.state.apic) {
            
            return (
    
                <StyledWrapper>
                    <StyledH5>Registro</StyledH5>
                    <StyledDiv>
                        <button><HoverImage className="apicultor" src={imgApic} hoverSrc={imgApicSel}  alt={"Apicultor"} onClick={this.apicToggle}/></button>
                        <button><HoverImage className="condumidor" src={imgConsum} hoverSrc={imgConsumSel}  alt={"Consumidor"} onClick={this.consumerToggle}/></button>
                    </StyledDiv>
                    
                    <StyledForm onSubmit={this.submitHandler}>
    
                        <div> <img src={rectangle} alt="division"/> </div>
                        <FbGgLogin googleOAuth={this.googleHandler}/>
                        <TextInputBox img ="email" type="email" placeholder="Email" value={email} callbackHandler={this.changeHandler} name="email"/>
                        <TextInputBox img ="password" type="password" placeholder="Contraseña" value={password} callbackHandler={this.changeHandler} name="password"/>
                        <TextInputBox img ="none" type="text" placeholder="Name" value={name} callbackHandler={this.changeHandler} name="name"/>
                        <TextInputBox img ="none" type="text" placeholder="familyName" value={familyName} callbackHandler={this.changeHandler} name="familyName"/>
                        <button type="submit"><img src={Siguiente} alt="Siguiente"/></button>
                    
                    </StyledForm>
                </StyledWrapper>
    
            )

                //tienes que intentar meter la imagen dentro del select/ cambiar su css
        } else if( this.state.apic === 1) {

            return (
    
                <StyledWrapper>
                    <StyledH5>Registro</StyledH5>
                    <StyledDiv>
                        <button><HoverImage className="apicultor" src={imgApic} hoverSrc={imgApicSel}  alt={"Apicultor"} onClick={this.apicToggle}/></button>
                        <button><HoverImage className="condumidor" src={imgConsum} hoverSrc={imgConsumSel}  alt={"Consumidor"} onClick={this.consumerToggle}/></button>
                    </StyledDiv>
                    
                    <StyledForm onSubmit={this.submitHandler}>
    
                        <div> <img src={rectangle} alt="division"/> </div>
                        <FbGgLogin/>
                        <TextInputBox img ="email" type="email" placeholder="Email" value={email} callbackHandler={this.changeHandler} name="email"/>
                        <TextInputBox img ="password" type="password" placeholder="Contraseña" value={password} callbackHandler={this.changeHandler} name="password"/>
                        <TextInputBox img ="none" type="text" placeholder="Name" value={name} callbackHandler={this.changeHandler} name="name"/>
                        <TextInputBox img ="none" type="text" placeholder="familyName" value={familyName} callbackHandler={this.changeHandler} name="familyName"/>
                        <TextInputBox img ="codigoAsentamiento" type="text" placeholder="Código de asentamiento" value={codigoAsentamiento} callbackHandler={this.changeHandler} name="codigoAsentamiento"/>
                        <StyledSelect  value={this.state.tipoOrganizacion} onChange={this.selectHandler}>
                            {/* <img src={passwordImg} alt="Tipo de organización"/> */}
                            <option value="" selected>"Tipo de organización"</option> 
                            <option value="autonomo">Autónomo</option>
                            <option value="cooperativa">Cooperativa</option>
                            <option value="otros">Otros</option>
                        </StyledSelect>
                        <button type="submit"><img src={Siguiente} alt="Siguiente"/></button>
                    
                    </StyledForm>
                </StyledWrapper>   
            )
        }       
    }
}


const StyledSelect = styled.select`
width: 271px;
height: 54px;
border: none;
display: flex;
text-align: center;
padding: 1em;
border-radius: 5px; 
transition: all 0.2s ease-in;
background: #FFFFFF; 
margin: 3px;

img {
   height: 22px;
   margin-right: 4px;
}
`;

const StyledWrapper = styled.div`
height: 80vh;
width: 100vw;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;


`;

const StyledDiv = styled.div`
display: flex;
height: 100px;
width: 260px;
 
button {
    border: none;
    background: #FFFFFF;
    
}
*:focus {outline:none}

img {
    width: 111px;
    height: 114px;
}

`;

const StyledForm = styled.form`
display: flex;
flex-direction: column;
width: 264px;
justify-content: space-between;

button {
    height: 35px;
    border: none;
    background: #FFFFFF;


}
button:focus & {
    outline: none;
}
*:focus {outline:none}
`;

const StyledH5 = styled.h5`

font-family: 'Nunito';
font-style: normal;
font-weight: bold;
font-size: 20px;
line-height: 28px;
color: #401F3E;
`;

export default Register
