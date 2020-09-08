import React from 'react';
import { styles } from './Variables';
import styled from 'styled-components';

const AuthTextInputStyle = styled.input`
        height: 40px;
        padding: 10px;
        text-align: center;
        background-color: ${styles.green};
        border-radius: 40px;
    `;
function AuthTextInput(props) {

    return (
        <AuthTextInputStyle {...props} />
    )
}


const AuthSubmitStyle = styled.input`
height: 40px;
    padding: 10px;
    text-align: center;
    background-color: ${styles.green};
    border-radius: 40px;
    width: 100px;
        :active{
            background-color: blue;
        }
        :hover{
            cursor: pointer;
        }
`;
function AuthSubmit(props) {

    return (
        <AuthSubmitStyle {...props} />
    )
}
export { AuthTextInput, AuthSubmit }