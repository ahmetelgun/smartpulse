import React from 'react'
import styled from 'styled-components'
import { ReactComponent as ClearSVG } from './cross.svg';
import { styles } from './Variables';
const Container = styled.div`
  position: relative;
  background-color: blue;
  width: 200px;
  button{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
    width: 20px;
    height: 20px;
    background-color: transparent;
    svg{
      position: absolute;
      right: 0;
      left: 0;
      bottom: 0;
      top: 0;
      width: inherit;
      height: inherit;
    }
  }
`;

const SearchInput = styled.input`
  width: 100%;
  height: 40px;
  border-bottom: 1px solid ${styles.gray};
  padding: 5px;
  box-sizing: border-box;
  color: ${styles.gray};
`;

function SearchBar(props) {
  return (
    <Container>
      <SearchInput type="text" onChange={e => props.setSearchInput(e.target.value)} value={props.searchInput} placeholder="Ara" />
      <button onClick={() => props.setSearchInput("")}><ClearSVG fill={styles.gray} /></button>
    </Container>
  )
}

export default SearchBar;