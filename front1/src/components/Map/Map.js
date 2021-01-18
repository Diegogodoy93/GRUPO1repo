import React, { Component } from 'react'
import Nav from '../Nav'
import Search from '../Search'
import styled from 'styled-components'
import MapComponent from './MapComponent'

export class Map extends Component {
    
    state = {
        search: "",
        filter: false,
        tipoDeMiel: "",
        distancia:"",
        rating:""
    }
    
    filterHandler = () => {
        if(this.state.filter === false){
            this.setState({filter: true})
        } else {this.setState({filter: false})}
       
    }
    
    render() {
        return (
            <>
                <Search filterHandler={this.filterHandler}/>

                    <MapDiv>
                        <MapComponent/>
                    </MapDiv>
                
                <Nav/>

                
            </>
        )
    }
}

const MapDiv = styled.div`
height: 450px`;


export default Map
