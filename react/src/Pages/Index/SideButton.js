import React from 'react'
import styled from 'styled-components';
import { styles } from '../../Globals/Variables'
import { ReactComponent as Check } from './checkmark.svg';

const SelectBox = styled.div`
  min-width: 35px;
  min-height: 35px;
  width: 35px;
  height: 35px;
  border-radius: 35px;
  background-color: transparent;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  svg{
    width: 25px;
    height: 25px;
  }
`;

const Logo = styled.span`
  min-width: 35px;
  min-height: 35px;
  background-color: ${styles.soft_gray};
  border-radius: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Text = styled.div`
  
  margin-left: 10px;
`;

const Button = styled.div`
  padding:10px;
  display: flex;
  align-items: center;
  width: 100%;
  transition: .3s;
  font-weight: 500;
  color: ${styles.gray};
  :hover{
    background-color: #bbbbbb;
  }
`;



const SideButton = ({ children, ...props }) => {
  return (
    <Button {...props}>
      <Logo>{children.charAt(0)}</Logo>
      <Text>{children}</Text>
      <SelectBox>
        {props.selected ? <Check fill={styles.gray} /> : null}
      </SelectBox>
    </Button>
  )
}

export default SideButton;