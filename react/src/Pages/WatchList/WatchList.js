import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import useFetch from '@ahmetelgun/usefetch';
import SearchBar from '../../Globals/SearchBar';
import SearchButton from '../../Globals/SearchButton';
import MyContext from '../../MyContext';

const Container = styled.div`
    display: ${props => props.show ? "block" : "none"};
    position: absolute;
    width: 800px;
    height: 400px;
    max-height: 400px;
    background-color: white;
    border: 1px black solid;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    left: 0;
    margin-left: auto;
    margin-right: auto;
`;

const CloseButton = styled.button`
    position: absolute;
    right: 0;
    background-color: transparent;
    padding: 20px;
    :hover{
        background-color: transparent;
    }
`;

const WatchBox = styled.label`
    box-sizing: border-box;
    width: auto;
    position: relative;
    cursor: pointer;
    margin: 10px;
    input{
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        visibility: hidden;
        pointer-events: none;
    }
    span{
        width: 100%;
        box-sizing: border-box;
        padding: 7px 14px;
        border: 2px solid #EEE;
        display: inline-block;
        color: #009BA2;
        border-radius: 3px;
        text-transform: uppercase;
    }
    input:checked + span {
        border-color: #009BA2;
}
`;
const List = styled.div`
    margin: 30px 10px;
    width: auto;
    display: flex;
    flex-direction: column;
`;
const NameInput = styled.div`
    display: flex;
    justify-content: flex-start;
`;


function WatchList() {
    const [data, loading, error, callFetch] = useFetch();
    const [wdata, wloading, werror, wcallFetch] = useFetch();
    const [selected, setSelected] = useState(null);
    const [name, setName] = useState(null);
    const { setSelectedStations, setSelectedType, toggleCentralsUpdate, centralsUpdate, watchList, setSelectedProductions, setEndDate, setStartDate, setWatchList, setSelectedCompanies } = useContext(MyContext);
    useEffect(() => {
        if (watchList) {
            callFetch("/api/getwatchlist");
        }
    }, [watchList])
    function handleGet() {
        wcallFetch(`/api/getwatchlist?name=${selected}`)
    }
    if (watchList === true) {
        if (wdata && wdata.status == 200) {
            const js = JSON.parse(wdata.data.json)
            setSelectedCompanies(js.map(item => item.etso))
            setSelectedStations(js.map(item => ({
                value: item.id, label: item.name, eic: item.eic, etso: item.etso
            })))
            setEndDate(js[0].end)
            setStartDate(js[0].start)
            setSelectedType(js[0].types)
            toggleCentralsUpdate(!centralsUpdate)
            console.log(js);
            setSelectedProductions(JSON.parse(wdata.data.json));
            setWatchList(false);
        }
    }
    let q = 0;
    if (data && data.status == 200) {
        if (data.data.length > 0) {
            q = data.data.map((item, index) => (
                <WatchBox>
                    <input type="radio" checked={selected == item} onChange={() => setSelected(item)} />
                    <span>{item}</span>
                </WatchBox>
            ))
        }
    }
    let nameInput;
    let getButton;
    function handleSave(name) {
        var payload = {
            name: name,
            json: JSON.stringify(watchList)
        }
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
        wcallFetch("/api/savewatchlist", options);
        setWatchList(false)
    }
    if (watchList) {
        if (watchList !== true) {
            nameInput = (
                <NameInput>
                    <SearchBar setSearchInput={setName} searchInput={name} />
                    <SearchButton onClick={() => handleSave(name)}>Kaydet</SearchButton>
                    <SearchButton onClick={() => handleSave(selected)}>Üzerine kaydet</SearchButton>
                </NameInput>
            )
        }
        else {
            getButton = <SearchButton style={{ position: "fixed", right: "0", bottom: "0" }} onClick={handleGet}>Getir</SearchButton >;
        }
    }


    return (
        <Container show={watchList} >

            <CloseButton onClick={() => setWatchList(false)}>X</CloseButton>

            <List>
                {nameInput}
                {q}
            </List>
            {getButton}
        </Container>

    );
}

export default WatchList;