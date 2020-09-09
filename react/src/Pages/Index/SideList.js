import React, { useState } from 'react';
import styled from 'styled-components';
import { styles } from '../../Globals/Variables';
import { Loading } from "../../Globals/Animations";
import SideButton from './SideButton';
import useFetch from '@ahmetelgun/usefetch';
import SearchBar from '../../Globals/SearchBar';
import SearchButton from '../../Globals/SearchButton';
const Container = styled.div`
  display: flex;
  height: 100%;
`;

const List = styled.div`
    height: 100%;
    min-width: 350px;
    max-width: 600px;
    width: ${props => props.width}px;
    box-sizing: border-box;
    padding: 0px 10px 10px;
    overflow-x: hidden;
    overflow-y: scroll;
    display: ${props => props.isShow ? "flex" : "none"};
    flex-direction: column;
    align-items: center;
  `;




const SearchContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: space-between;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const ResizableEdge = styled.div`
  height: 100%;
  width: 10px;
  background-color: ${styles.gray};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column; 
  position: relative;
  cursor: col-resize;
`;
const Arrow = styled.div`
  width: 100%;
  height: 40px;
  cursor: pointer;
  position: relative;
  i{
    position: absolute;
    border: solid white;
    border-width: 0 3px 3px 0;
    padding: 3px;
    left: 50%;
    transform:translateY(-50%)  ${props => props.isShow ? "translateX(-25%) rotate(135deg)" : "translateX(-75%) rotate(-45deg)"} ;
    top: 50%;

  }


`;

const SideList = (props) => {
  const [data, loading, error] = useFetch("/api/getorganizations");
  const [companyList, setCompanyList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [width, setWidth] = useState(350);
  const [isShow, setIsShow] = useState(true);

  let content;
  if (loading) {
    content = <Loading />
  }
  if (error) {
    content = "error";
  }
  if (data) {
    const filter = searchInput.toUpperCase();
    let selecteds = []
    let notSelecteds = []
    data.data.forEach((item, index) => {
      if (item.organizationName.toUpperCase().indexOf(filter) > -1) {
        if (companyList.includes(item.organizationETSOCode)) {
          selecteds.push(
            <SideButton
              setCompanyList={setCompanyList}
              selected={true}
              key={index}
              onClick={
                () => companyList.includes(item.organizationETSOCode) ? setCompanyList(companyList.filter(e => e !== item.organizationETSOCode)) : setCompanyList([...companyList, item.organizationETSOCode])}
            >
              {item.organizationName}
            </SideButton>
          );
        } else {
          notSelecteds.push(
            <SideButton
              setCompanyList={setCompanyList}
              selected={false}
              key={index}
              onClick={
                () => companyList.includes(item.organizationETSOCode) ? setCompanyList(companyList.filter(e => e !== item.organizationETSOCode)) : setCompanyList([...companyList, item.organizationETSOCode])}
            >
              {item.organizationName}
            </SideButton>
          );
        }
      }
    })
    content = [...selecteds, ...notSelecteds]
  }

  function startResize() {
    document.getElementsByTagName("body")[0].style.userSelect = "none";
    document.onmousemove = (q) => { if (q.clientX < 200 && isShow) { setIsShow(false); } setWidth(q.clientX); }
    document.onmouseup = () => { document.onmousemove = null; document.onmouseup = null }

  }

  function stopResize() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.getElementsByTagName("body")[0].style.userSelect = "auto";


  }

  return (
    <Container>
      <List width={width} isShow={isShow} >
        <SearchContainer >
          <SearchBar setSearchInput={setSearchInput} searchInput={searchInput} />
          <SearchButton style={{ marginLeft: "auto" }} onClick={() => props.setSelectedCompanies(companyList)}>Karşılaştır</SearchButton>
        </SearchContainer>
        {content}
      </List>
      <ResizableEdge onMouseDown={startResize} onMouseUp={stopResize} >
        <Arrow onClick={() => setIsShow(!isShow)} isShow={isShow}>
          <i />
        </Arrow>
      </ResizableEdge>
    </Container>
  );
};

export default SideList;
