import React, { useEffect } from 'react';
import useFetch from '@ahmetelgun/usefetch';
import { FullPageLoading } from '../../Globals/Animations'
import { Redirect } from "react-router-dom";
import { setCookie, getCookie } from '../../Globals/utils';
import styled from 'styled-components';
import { styles } from '../../Globals/Variables';

function Logout(props) {
    const token = getCookie("token");
    const [data, loading, error, callFetch] = useFetch();
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
    }
    useEffect(() => {
        setCookie("token", "");
        callFetch("/api/logout", options);
    }, [])

    if (error) {
        return "error"
    }
    if (data) {
        return <Redirect to="/" />
    }
    return (
        <FullPageLoading />
    )
}


export default Logout;