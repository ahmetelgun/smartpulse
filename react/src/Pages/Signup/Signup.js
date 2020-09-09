import React, { useState } from 'react';
import useFetch from '@ahmetelgun/usefetch';
import styled from 'styled-components';
import { FullPageLoading } from '../../Globals/Animations'
import { useHistory } from "react-router-dom";
import { AuthTextInput, AuthSubmit } from '../../Globals/Buttons.js'
import { styles } from '../../Globals/Variables';

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



function Signup() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [data, loading, error, callFetch] = useFetch();
    const [passwordError, setPasswordError] = useState(null);
    const history = useHistory();
    function handleSubmit(e) {
        e.preventDefault();
        if (password !== passwordConfirm) {
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
        return <FullPageLoading />
    }
    if (error) {
        return <div>error</div>
    }
    if (data && passwordError === null) {
        if (data.data.message === "email is exist") {
            setPasswordError("Email adresi zaten kullanımda");
        }
        else if (data.data.message === "email is invalid") {
            setPasswordError("Geçersiz email")
        }
        else if (data.data.message === "name is invalid") {
            setPasswordError("İsim iki karakterden kısa olamaz")
        }
        else if (data.data.message === "surname is invalid") {
            setPasswordError("Soyisim iki karakterden kısa olamaz")
        }
        else if (data.data.message === "password is invalid") {
            setPasswordError("Parola 8 karakterden kısa olamaz")
        }
        else if (data.data.message === "success") {
            history.push("/");
        }
    }
    return (
        <Container onSubmit={handleSubmit}>
            <div>{passwordError}</div>
            <AuthTextInput type="text" placeholder="Name" onChange={e => setName(e.target.value)} value={name} required />
            <AuthTextInput type="text" placeholder="Surname" onChange={e => setSurname(e.target.value)} value={surname} required />
            <AuthTextInput type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} value={email} required />
            <AuthTextInput type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} value={password} required />
            <AuthTextInput type="password" placeholder="Password Confirm" onChange={e => setPasswordConfirm(e.target.value)} value={passwordConfirm} required />
            <AuthSubmit type="submit" value="Kayit ol" />
        </Container>
    )
}



export default Signup;