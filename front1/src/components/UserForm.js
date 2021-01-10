import React, { Component } from 'react'
import FormUserDetails from "./FormUserDetails"
import FormApicDetails from './FormApicDetails'

export class UserForm extends Component { 

    state = {
        apicultor: 0,
        name:"",
        familyName :"", 
        email:"",
        password:"",
        codigoAsentamiento:"",
        tipoOrganizacion:""
    }

    handleChange = input => event => {
        this.setState({[input]: event.target.value})
    }
    
    //Toggle between user/apic form
    userTypeToggler = () => {
        const {apicultor} = this.state;
        if(apicultor === 0){
            
            this.setState({
            
                apicultor: 1
                
            });
        } else {
            this.setState({
                apicultor: 0
                
            });
        }
        
        


    }
    render() {
        
        const {apicultor, name, familyName, email, password, codigoAsentamiento, tipoOrganizacion} = this.state;
        const values = {apicultor, name, familyName, email, password, codigoAsentamiento, tipoOrganizacion}
        
        // eslint-disable-next-line default-case
        switch(apicultor){
            
            case 0:
              return (
                <FormUserDetails 
                handleChange={this.handleChange}
                apicultor={this.apicultor}
                value={values}
                userTypeToggler={this.userTypeToggler}/>
                
            )
            

            case 1:
                return (
                    
                    <FormApicDetails 
                    handleChange={this.handleChange}
                    apicultor={this.apicultor}
                    value={values}
                    userTypeToggler={this.userTypeToggler}/>
                )   
        }
        
        
        
    }
}

export default UserForm
