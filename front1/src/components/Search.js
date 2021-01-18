import React, { Component } from 'react'
import logo from '../assets/Logo.png'
import campana from '../assets/campana.png'
import styled from 'styled-components'
import Filter from '../assets/Filter.png'
import lupa from '../assets/lupa.png'




export class Search extends Component {
    
    render() {
        return (
           <>
            <OuterWrapper>
                <Wrapper>
                    <StyledDiv>
                        <img src={logo} alt ="logo Coolmena"/> 
                    </StyledDiv>
                    <>
                        <StyledButton><img src={campana} alt="settings"/></StyledButton>
                    </>
                </Wrapper>
                <SearchWrapper>
                    <StyledSearch>
                        <img src={lupa} alt="Búsqueda"/>
                        <input placeholder="Search"></input>
                
                    </StyledSearch>
                <button onClick={this.props.filterHandler}><img src={Filter}  alt="filtros de búsqueda"/></button>
                </SearchWrapper>

                
            </OuterWrapper>
            
            </>
        )
    }
}
const OuterWrapper = styled.div`
margin-top: 15px;
`;

const StyledDiv = styled.div`

display: flex;
justify-content: center;
width: 300px;
`;

const Wrapper = styled.div`
display: flex;
margin: 5px


`;
const StyledButton = styled.button`
border: none;
all: unset;
background: #FFFFFF;
margin-left:17px;
img {
    height: 24px;
    width: 24px;
}
`;

const SearchWrapper = styled.div`
    display: flex;

    margin-top: 5px;
    justify-content: space-around;
    button{
        outline: none;
        background: #FFFFFF;
        
        all: unset;
        


    }
    img {
        border: none;
        background: #FFFFFF;
    }

`;
const StyledSearch = styled.div`
height: 38px;
width: 280px;
margin-left 10px;

background: #FFFFFF;
border-radius: 10px;
border: 2px solid #FFBF00;
*:focus {outline:none;}


input{
    border: none;
}
`;




export default Search
