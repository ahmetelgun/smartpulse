import React, { useState, useContext } from 'react';
import useFetch from '@ahmetelgun/usefetch';
import styled from 'styled-components';
import { FullPageLoading } from '../../Globals/Animations'
import { useHistory } from "react-router-dom";
import { setCookie } from '../../Globals/utils';
import { AuthTextInput, AuthSubmit } from '../../Globals/Buttons.js'
import { styles } from '../../Globals/Variables';
import MyContext from '../../MyContext';
const Container = styled.form`
    display: flex;
    margin-left: auto;
    margin-right: auto;
    flex-direction: column;
    align-items: center;
    width: 400px;
    text-align:center;
    margin-top: 10px;
    input + input{
        margin-top: 10px;
    }
    div{
        margin-bottom: 10px;
    }
`;

function Signin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loginError, setLoginError] = useState(null);
    const [data, loading, error, callFetch] = useFetch();
    const { isLogin } = useContext(MyContext);
    let history = useHistory();

    function handleSubmit(e) {
        e.preventDefault()
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        }
        setLoginError(null);
        callFetch("/api/signin", options)
    }
    if (isLogin) {
        history.push("/");
    }
    if (loading) {
        return <FullPageLoading />
    }
    if (error) {
        return <div>error</div>
    }
    if (data) {
        if (data.data.message === "success") {
            setCookie("token", data.data.token)
            history.push("/");
        } else if (loginError == null) {
            setLoginError("Email veya parola yanlis")
        }
    }

    return (
        <Container onSubmit={handleSubmit}>
            <div>{loginError}</div>
            <AuthTextInput type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} value={email} />
            <AuthTextInput type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} value={password} />
            <AuthSubmit type="submit" value="Giris yap" />
        </Container>
    )
}

export default Signin;