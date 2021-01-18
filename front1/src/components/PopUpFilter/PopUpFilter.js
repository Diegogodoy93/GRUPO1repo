import React, { Component } from 'react'
import monofloral from '../../assets/ChipMonofloral.png'
import deBosque from '../../assets/ChipDeBosque.png'
import milflores from '../../assets/ChipMilflores.png'
import perfilMorado from '../../assets/perfilMorado.png'
import flecha from '../../assets/flechaNegra.png'
import './PopUpFilter.css'
import styled from 'styled-components'
import distancia from '../../assets/Distancia.png'
import rating from '../../assets/Rating.png'

export class PopUpFilter extends Component {
    render() {
        return (
          <div>
              <StyledDiv1><button className= 'noStyleBtn' onClick={this.props.filterHandler}> <img src={flecha} alt='Filtros'/></button><h3>Filtros</h3></StyledDiv1>
              <StyledDiv2><img src={perfilMorado} alt=''/></StyledDiv2>
              <StyledDiv3><button  className='noStyleBtn'><img src={milflores} alt='Milflores'/></button>  <button className='noStyleBtn'><img src={monofloral} alt='Monofloral' /></button>  <button className='noStyleBtn'> <img src={deBosque} alt='De bosque'/></button> </StyledDiv3>
              <StyledDiv4><img src= {distancia} alt='Distancia'/></StyledDiv4>
              <StyledDiv5><input type="range"/></StyledDiv5>
              <StyledDiv6><img src={rating} alt= 'Rating'/></StyledDiv6>
          </div>
        )
    }
}
const StyledDiv1 = styled.div`
display: flex;
`;
const StyledDiv2 = styled.div`
display: flex;


`;

const StyledDiv3 = styled.div`
display: flex;
`;
const StyledDiv4 = styled.div`
display: flex;
`;
const StyledDiv5 = styled.div`
`;
const StyledDiv6 = styled.div`

`;

export default PopUpFilter
