import React from "react";
import SideList from './SideList';
import Production from './Production';
import OrganizationDetail from './OrganizationDetail';
import styled from 'styled-components';
import { styles } from '../../Globals/Variables';

const Side = styled(SideList)`

`;

const Container = styled.div`
  display: flex;
  ${Side}{
    @media(max-width: ${styles.mobile_width}){
      display: none;
    }
  }
  height: calc(100vh - ${styles.header_height}px);
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height:  100%;
`;






function Index(props) {
  return (
    <Container>
      <Side />

      <RightPanel>
        <OrganizationDetail />
        <Production />
      </RightPanel>
    </Container>
  )
}

export default Index;