import React, { useEffect, useState } from 'react';
import {
  useParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { styles } from './Variables';


const Header = () => {
  const Header = styled.div`
    height: ${styles.header_height};
    background-color: gray;
  `;
  return <Header></Header>
}

export default Header;