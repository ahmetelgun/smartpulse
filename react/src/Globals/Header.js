import React, { useContext } from 'react';
import styled from 'styled-components';
import { styles } from './Variables';
import { Link, useHistory } from 'react-router-dom';
import { ReactComponent as Logo } from './smartpulse-logo-12.svg'
import MyContext from '../MyContext';
const HeaderContainer = styled.div`
  height: ${styles.header_height}px;
  max-width: ${styles.header_width}px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  align-items: center;
  padding-right: 15px;
  padding-left: 15px;
  box-sizing: border-box;

 
  a{
    padding: 10px 15px;
  }
`;

const HeaderMenu = styled.div`
  margin-left: auto;

  a{
    font-weight: 600;
    color: ${styles.gray};
    transition: ${styles.textHoverTransition};
    :hover{
      color: ${styles.green};
    }
  }
`;

const Header = () => {
  const { isLogin, setWatchList } = useContext(MyContext)
  const history = useHistory();
  function handleWatchList(e) {
    e.preventDefault();
    if (!isLogin) {
      history.push("/signin")
    }
    else {
      setWatchList(true);
    }
  }
  const CompanyLogo = styled(Logo)`
    width: 200px;
    @media(max-width: ${styles.mobile_width}px){
      width: 100px;
    }
  `;
  return (
    <HeaderContainer>
      <Link to="/"><CompanyLogo /></Link>
      <HeaderMenu>
        {
          isLogin ?
            <><Link to="#" onClick={handleWatchList}>Takip Listesi</Link><Link to="/logout">Çıkış</Link></> :
            <><Link to="/signin">Giriş</Link><Link to="/signup">Kaydol</Link></>
        }
      </HeaderMenu>
    </HeaderContainer>
  )
}




export default Header;