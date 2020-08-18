import React, { useEffect, useState } from 'react';
import {
  useParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { styles } from './Variables';
import { Loading } from "./Animations";
import SideButton from './SideButton';
import useFetch from '../UseFetch';
const Container = styled.div`
    height: calc(100vh - ${styles.header_height});    
    width: 500px;
    box-sizing: border-box; 
    padding: 0px 10px 10px;
    overflow-x: hidden;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    align-items: center;
  `;

const SideList = (props) => {
  const [data, loading, error] = useFetch("/api/main");
  let content;
  if (loading) {
    content = <Loading />
  }
  if (error) {
    content = "error";
  }
  if (data) {
    content = (data.body.organizations.map((item, index) => (
      <SideButton key={index} onClick={() => {
        props.setSelectedCompany(item);
      }}>
        {item.organizationName}
      </SideButton>
    )));
  }
  return (
    <Container>
      {content}
    </Container>
  );
};

export default SideList;