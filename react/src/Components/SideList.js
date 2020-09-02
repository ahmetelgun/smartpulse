import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { styles } from './Variables';
import { Loading } from "./Animations";
import SideButton from './SideButton';
import useFetch from '@ahmetelgun/usefetch';
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

const SearchInput = styled.input`
  height: 40px;
  border: 1px solid black;
  padding: 5px;
  box-sizing: border-box;
`;

const SearchButton = styled.button`
  height: 40px;
  margin-left: auto;
  padding: 5px;
  background-color: ${styles.green};
`;

const SearchContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: space-between;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const SideList = (props) => {
  const [data, loading, error] = useFetch("/api/main");
  const [companyList, setCompanyList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const turkıshChars = {
    "Ü": "U",
    "İ": "I",
    "Ğ": "G",
    "Ö": "O",
    "Ç": "C",
    "Ş": "S"
  }

  let content;
  if (loading) {
    content = <Loading />
  }
  if (error) {
    content = "error";
  }
  if (data) {
    const filter = searchInput.toUpperCase();
    content = (data.data.map((item, index) => {
      if (item.organizationName.toUpperCase().indexOf(filter) > -1) {
        return <SideButton
          setCompanyList={setCompanyList}
          selected={companyList.includes(item.organizationETSOCode) ? true : false}
          key={index}
          onClick={
            () => companyList.includes(item.organizationETSOCode) ? setCompanyList(companyList.filter(e => e != item.organizationETSOCode)) : setCompanyList([...companyList, item.organizationETSOCode])}
        >
          {item.organizationName}
        </SideButton>
      }
      return null
    }));
  }
  return (
    <Container>
      <SearchContainer >
        <SearchInput type="text" onChange={e => setSearchInput(e.target.value)} value={searchInput} placeholder="Ara" />
        <SearchButton onClick={() => props.setSelectedCompanies(companyList)}>Karsilastir</SearchButton>
      </SearchContainer>
      {content}
    </Container>
  );
};

export default SideList;
