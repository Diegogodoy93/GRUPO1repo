import React, { Component } from 'react'
import styled from 'styled-components'
import imgConsum from '../assets/Button_Consumidor.png'
import imgConsumSel from '../assets/Button_ConsumidorSel.png'
import imgApic from '../assets/Button_Apicultor.png'
import imgApicSel from '../assets/Button_ApicultorSel.png'

export class ButtonToggler extends Component {
    
    toggle = () => {
        
        this.props.userTypeToggler();
    }
    
    render() {
        
        const {selected} = this.props;

        // eslint-disable-next-line default-case
        switch(selected) {
            
            case "apicultor":
                return (
            
                    <StyledDiv>
                        <img src={imgConsum} onClick={this.toggle} alt ="Consumidor" />
                        <img src={imgApicSel} onClick={this.toggle} alt ="Apicultor" />
                    </StyledDiv>
                ) 
            
            case "consumidor":
                return (
            
                    <StyledDiv>
                         <img onClick={this.toggle} src={imgConsumSel}  alt ="Consumidor" />
                         <img src={imgApic} onClick={this.toggle} alt ="Apicultor" />
                   </StyledDiv>
                ) 
        }
        
    }
}

const StyledDiv = styled.div`

width: 100vw;
height: 130px;
display: flex;


img{
   
    
    height: 114px;
    
    &:hover{
        transform: translateY(-3px)
    }
}


`;






export default ButtonToggler
