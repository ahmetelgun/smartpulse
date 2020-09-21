import React, { useEffect } from 'react';
import useFetch from '@ahmetelgun/usefetch';
import { FullPageLoading } from '../../Globals/Animations'
import { Redirect } from "react-router-dom";
import { setCookie, getCookie } from '../../Globals/utils';


function Logout() {
    const token = getCookie("token");
    const [data, , error, callFetch] = useFetch();
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
        // eslint-disable-next-line
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