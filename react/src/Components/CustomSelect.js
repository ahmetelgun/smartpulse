import React, { useState } from 'react';
import styled from 'styled-components';

const selectHeight = 40;

const SelectItemBox = styled.button`
  background-color: rgb(200,200,200);
  padding-left: 10px;
  padding-right: 10px;
  height: ${selectHeight}px;
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  
  :hover{
  background-color: rgb(170,170,170);
  }
`;

const SelectHeaderBox = styled.button`
  background-color: rgb(200,200,200);
  padding-left: 10px;
  padding-right: 10px;
  height: ${selectHeight}px;
  display: flex;
  align-items: center;
  
  width: 100%;
  text-align: left;
  :hover{
  background-color: rgb(170,170,170);
  }
`;

const Container = styled.div`
max-width: 200px;
  position: relative;
`;

const PlaceHolder = styled.span`
  color: rgba(0,0,0, .5);
`;

const SelectItem = (props) => {
  return (
    <SelectItemBox onClick={props.onClick}>{props.item.name}</SelectItemBox>
  )
}

const SelectHeader = (props) => {
  return (
    <>
      <SelectHeaderBox onClick={props.onClick}>{props.item ? props.item.name : <PlaceHolder>Santral Seçiniz</PlaceHolder>}</SelectHeaderBox>
    </>
  )
}

const CustomSelect = (props) => {
  const [active, setActive] = useState(false);

  const selectItems = props.items.map((item, index) => {
    if (index != props.selected) {
      return <SelectItem key={index} item={item} index={index} onClick={() => { props.setSelected(index); setActive(!active) }} />
    }
  })
  const selectHeader = <SelectHeader item={props.items[props.selected]} onClick={() => setActive(!active)} />
  return (
    <Container style={{ ...props.style }}>
      {selectHeader}
      <div style={{ position: "absolute", width: "100%" }}>
        {active && selectItems}
      </div>
    </Container>
  )
}

export default CustomSelect;