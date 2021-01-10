import React, { Component } from 'react'
import TextInputBox from './TextInputBox'
import BtnSiguiente from './BtnSiguiente'



export class FormApicDetails extends Component {
    toggle = event => {
        
        this.props.userTypeToggler();
    }
    
    render() {
        
        const {values, handleChange} = this.props;
        
        return (
            <>
               <div className='BoxButtonApic'>
                 <button onClick={this.toggle}> <img src="./Button_Consumidor.png" alt ="Consumidor" /></button>
                 <button onClick={this.toggle}> <img src="./Button_Apicultor.png" alt ="Apicultor" /></button>
                </div>
                <div>
                    
                </div>
                <TextInputBox type="email" placeholder='Email' onChange={handleChange('email')}/>
                <TextInputBox type="text" placeholder='Nombre' onChange={handleChange('name')}/>
                <TextInputBox type="text" placeholder='Apellidos' onChange={handleChange('familyName')}/>
                <TextInputBox type="password" placeholder='Contraseña' onChange={handleChange('password')}/>
                <TextInputBox type="text" placeholder='Codigo de asentamiento' onChange={handleChange('name')}/>
                <button> <img src='../public/btnSiguiente.png' alt="Siguiente"></img></button>
            </>
        )
    }
}

export default FormApicDetails
