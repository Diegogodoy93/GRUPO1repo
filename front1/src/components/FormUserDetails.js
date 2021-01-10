import React, { Component } from 'react'
import TextInputBox from './TextInputBox'
import imgApicultor from '../images/Button_Apicultor.png'
import imgConsumidor from '../images/Button_ConsumidorSel.png'
import imgBtnSiguiente from '../images/btnSiguiente.png'
import './FormUserDetails.css'


export class FormUserDetails extends Component {
    toggle = event => {
        
        this.props.userTypeToggler();
    }
    
    render() {
        
        const {values, handleChange} = this.props;
        return (
            <>

                <div className='BoxButtonApic'>
                    <button><img src={imgApicultor} alt="Apicultor" className='sqrButton'/></button>
                    <button><img src={imgConsumidor} alt="Consumidor" className='sqrButton'/></button>
                </div>
                
              
                <form className='form'>
                    <TextInputBox type="email" placeholder='Email' onChange={handleChange('email')}/>
                    <TextInputBox type="text" placeholder='Nombre' onChange={handleChange('name')}/>
                    <TextInputBox type="text" placeholder='Apellidos' onChange={handleChange('familyName')}/>
                    <TextInputBox type="password" placeholder='Contraseña' onChange={handleChange('password')}/>
                    <button type= 'submit'><img src={imgBtnSiguiente} alt='Siguiente'/></button>

                </form>
                
            </>                           
        )
    }
}

export default FormUserDetails
