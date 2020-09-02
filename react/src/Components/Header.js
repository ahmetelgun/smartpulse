import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { styles } from './Variables';
import { Link } from 'react-router-dom';


const Header = (props) => {
  const HeaderContainer = styled.div`
    height: ${styles.header_height};
    background-color: gray;
    display: flex;
    align-items: center;
    padding: 20px;
    a{
      padding: 10px;
    }
  `;
  return (
    <HeaderContainer>
      <Link to="/">Home</Link>
      {props.isLogin ? <Link to="/logout">Logout</Link> : <><Link to="/signin">Signin</Link><Link to="/signup">Signup</Link></>}


    </HeaderContainer>
  )
}




export default Header;