import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import Header from './Components/Header'
import SideList from './Components/SideList'
import Production from './Components/Production';
import OrganizationDetail from './Components/OrganizationDetail';
import styled from 'styled-components';
import { styles } from './Components/Variables';
import SideButton from './Components/SideButton'

const Container = styled.div`
display: flex;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height:  calc(100vh - ${styles.header_height});
`;

const App = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [station, setStation] = useState(null);


  return (
    <div>
      <Header />
      <Container style={{ display: "flex" }}>
        <SideList setSelectedCompany={setSelectedCompany} />
        <RightPanel>
          <OrganizationDetail selectedCompany={selectedCompany} setStation={setStation} />
          <Production station={station} />
        </RightPanel>
      </Container>
    </div>
  )
};

export default App;
