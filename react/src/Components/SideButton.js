import React from 'react'
import styled from 'styled-components';
import { styles } from './Variables'

const Button = styled.div`
    color: ${styles.green};   
    padding: 20px 15px;
    transition: 170ms;    
    display: flex;
    width: 100%;
    align-items: center;
    :hover{
      cursor: pointer;
      background-color: rgb(200,200,200);
    }
    span{
      color: white;
      margin-right: 10px;
      min-width: 35px;
      height: 35px;
      border-radius: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${styles.green};
    }
    div{
      min-height: 35px;
      
    }
    button{
      margin-left: auto;
      
    }
  `;

const SelectBox = styled.button`
  border: none;
  border-radius: 25px;
  min-width: 25px;
  min-height: 25px;
`;

const SideButton = ({ children, ...props }) => {
  return (
    <Button {...props}>
      <span>{children.charAt(0)}</span>
      <div>{children}</div>
      <SelectBox style={{ backgroundColor: props.selected ? "black" : "white" }} />
    </Button>
  )
}

export default SideButton;