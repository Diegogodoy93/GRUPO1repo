import React, { Component } from 'react';
import styled from 'styled-components';
import email from '../assets/email.png';
import password from '../assets/password.png';
import asentamiento from '../assets/inputAsentamiento.png';






export class TextInputBox extends Component {
    
    state = {
        img: this.props.img
        
    }
    
    render() {
        const {img} = this.props;

        // eslint-disable-next-line default-case
        switch(img) {

            case 'none':
                return (

                <>
                     <StyledDiv>
                    
                         <StyledInput type= {this.props.type} placeholder={this.props.placeholder} name={this.props.name} onChange={this.props.callbackHandler}/>

                    </StyledDiv>              
                 </>
            )  

            case "email":
                return (
                    <>
                        <StyledDiv>
                    
                            <img src={email} alt="Email"/>
                            <StyledInput type= {this.props.type} placeholder={this.props.placeholder} name={this.props.name} onChange={this.props.callbackHandler} />

                        </StyledDiv>              
                    </>
                )

                case "password":
                    return (
                        <>
                            <StyledDiv>
                        
                                <img src={password} alt="Password"/>
                                <StyledInput type= {this.props.type} placeholder={this.props.placeholder} name={this.props.name} onChange={this.props.callbackHandler} />
    
                            </StyledDiv>              
                        </>
                    )

                case "codigoAsentamiento":
                    return (
                        <>
                            <StyledDiv>
                        
                                <img src={asentamiento} alt="Codigo de asentamiento"/>
                                <StyledInput type= {this.props.type} placeholder={this.props.placeholder} name={this.props.name} onChange={this.props.callbackHandler} />
    
                            </StyledDiv>              
                        </>
                    )

        }       
    }
}


const StyledDiv = styled.div`
    width: 271px;
    height: 54px;
    border: 1px solid #401F3E;
    box-sizing: border-box;
    box-shadow: 0px 4px 18px rgba(133, 133, 133, 0.25), inset 1px -5px 7px rgba(142, 134, 134, 0.25);
    display: flex;
    text-align: center;
    padding: 1em;
    border-radius: 5px; 
    transition: all 0.2s ease-in;
    background: #FFFFFF; 
    margin: 3px;
    
    &:hover{
        transform: translateY(-3px)
    }

    img {
       height: 22px;
       margin-right: 4px;
    }

`;


const StyledInput = styled.input`
    outline: none;
    border: none;

`;



export default TextInputBox
