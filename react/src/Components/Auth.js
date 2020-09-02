import React, { useState } from 'react';
import useFetch from '@ahmetelgun/usefetch';
import styled from 'styled-components';
import { styles } from './Variables';
import { Loading } from './Animations'
import { useHistory, Redirect } from "react-router-dom";
import { setCookie, getCookie } from './utils';
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

    input{
        height: 40px;
        padding: 10px;
        text-align: center;
        background-color: ${styles.green};
        border-radius: 40px;

    }
    input[type=submit]{
            width: 100px;
            :active{
                background-color: blue;
            }
            :hover{
                cursor: pointer;
            }
        }
`;

function Signup() {
    const [name, setName] = useState(null);
    const [surname, setSurname] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [passwordConfirm, setPasswordConfirm] = useState(null);
    const [data, loading, error, callFetch] = useFetch();
    const [passwordError, setPasswordError] = useState(null);
    const history = useHistory();
    function handleSubmit(e) {
        e.preventDefault();
        if (password != passwordConfirm) {
            setPasswordError("Parola eşleşmedi.")
            return
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name, surname: surname, password: password, email: email })
        }
        setPasswordError(null)
        callFetch("/api/signup", options)

    }
    if (loading) {
        return <Loading />
    }
    if (error) {
        return <div>error</div>
    }
    if (data && passwordError == null) {
        if (data.data.message == "email is exist") {
            setPasswordError("Email adresi zaten kullanımda");
        }
        else if (data.data.message == "email is invalid") {
            setPasswordError("Geçersiz email")
        }
        else if (data.data.message == "name is invalid") {
            setPasswordError("İsim iki karakterden kısa olamaz")
        }
        else if (data.data.message == "surname is invalid") {
            setPasswordError("Soyisim iki karakterden kısa olamaz")
        }
        else if (data.data.message == "password is invalid") {
            setPasswordError("Parola 8 karakterden kısa olamaz")
        }
        else if (data.data.message == "success") {
            history.push("/");
        }
    }
    return (
        <Container onSubmit={handleSubmit}>
            <div>{passwordError}</div>
            <input type="text" placeholder="Name" onChange={e => setName(e.target.value)} value={name} required />
            <input type="text" placeholder="Surname" onChange={e => setSurname(e.target.value)} value={surname} required />
            <input type="text" placeholder="Email" onChange={e => setEmail(e.target.value)} value={email} required />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} value={password} required />
            <input type="password" placeholder="Password Confirm" onChange={e => setPasswordConfirm(e.target.value)} value={passwordConfirm} required />
            <input type="submit" value="Kayit ol" />
        </Container>
    )
}

function Signin(props) {
    const [email, setEmail] = useState(null)
    const [password, setPassword] = useState(null)
    const [loginError, setLoginError] = useState(null);
    const [data, loading, error, callFetch] = useFetch();
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
    if (props.isLogin) {
        history.push("/");
    }
    if (loading) {
        return <Loading />
    }
    if (error) {
        return <div>error</div>
    }
    if (data) {
        if (data.data.message == "success") {
            setCookie("token", data.data.token)
            history.push("/");
        } else if (loginError == null) {
            setLoginError("Email veya parola yanlis")
        }
    }

    return (
        <Container onSubmit={handleSubmit}>
            <div>{loginError}</div>
            <input type="text" placeholder="Email" onChange={e => setEmail(e.target.value)} value={email} />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} value={password} />
            <input type="submit" value="Giris yap" />
        </Container>
    )
}

function Logout(props) {
    const token = getCookie("token");
    const history = useHistory();
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    }
    const [data, loading, error] = useFetch("/api/logout", options);
    setCookie("token", "");

    if (data) {
        console.log("sdfsad");
        history.push("/");
    }
    return <Loading />
}


export { Signup, Signin, Logout };