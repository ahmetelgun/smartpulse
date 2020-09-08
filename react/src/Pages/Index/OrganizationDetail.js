import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { styles } from '../../Globals/Variables';
import useFetch from '@ahmetelgun/usefetch'
import { Loading } from '../../Globals/Animations';
import Select from 'react-select'
import { useHistory } from 'react-router-dom';

const Container = styled.div`
  height: 300px;
  padding: 15px;
  position: relative;
  /* display: flex; */
  flex-direction: column;
  background-color: rgba(240,240,240, .6);
  align-items: center;
  justify-content: center;

  ::before{
    content: "";
    background-image: url("./wind.png");
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0.3;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 100px ;
  }
`;

const Button = styled.button`
  padding: 5px 10px;
  background-color: ${styles.green};
  width: 125px;
  border-radius: 3px;
  transition: .4s;
  :disabled{
    background-color: #ccc;
  }
`;


const DateBox = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  input{
    background-color: transparent;
  }
  label{
    display: block;
  }
  label+label{
    margin-top: 10px;
  }
  div{
    display: flex;
    flex-direction: column;
  }
  div + div{
    margin-left: 10px;
    margin-top: 0;
  }
  & ${Button}{
    margin-left: 10px;
  }

`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  position: relative;
`

const OrganizationDetail = (props) => {
  const [data, loading, error, callFetch] = useFetch();
  const [selectedCompanies, setSelectedCompanies] = useState();
  const [selectedStations, setSelectedStations] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedType, setSelectedType] = useState([]);
  var history = useHistory();
  useEffect(() => {

    if (props.selectedCompanies.length > 0) {
      setSelectedStations([])
      callFetch(`/api/organization?etso=${props.selectedCompanies.join()}`)
        .then(() => {
          setSelectedCompanies(props.selectedCompanies);
        })
    }
  }, [props.selectedCompanies])

  let content;

  if (loading) {
    content = <Loading />
  }
  else if (error) {
    content = "error"
  }

  else if (data && selectedCompanies === props.selectedCompanies) {
    let main;
    if (data.data.length > 0) {
      const types = [
        { name: 'KGUP', value: 'kgup' },
        { name: 'EAK', value: 'eak' },
        { name: 'Arıza ve Bakım Bilgisi', value: 'urgent' }
      ]

      const handleTypeChange = (types) => {
        let values = []
        if (types) {
          types.forEach(element => {
            values.push(element.value)
          });
          values.sort()
          setSelectedType(values);
        }
        else {
          setSelectedType([]);
        }
      }
      function handleSaveClick() {
        if (!props.isLogin) {
          history.push("/login")
        } else {

        }
      }
      let options = data.data.map(organization => {
        return {
          label: organization.name,
          options: organization.stations.map(station => (
            { value: station.id, label: station.name, eic: station.eic, etso: organization.etso }
          ))
        }
      });
      const StationSelect = <Select isMulti options={options} onChange={e => setSelectedStations(e)} />

      const TypeSelect = <Select isMulti options={types.map((type, index) => ({ label: type.name, value: index }))} onChange={handleTypeChange} />

      let stations;
      if (selectedStations) {
        stations = selectedStations.map(station => {
          return {
            name: station.label,
            id: station.value,
            eic: station.eic,
            etso: station.etso,
            start: startDate,
            end: endDate,
            types: selectedType
          }
        })

      }
      main = (
        <Main>

          {StationSelect}
          {TypeSelect}
          <DateBox>
            <div>
              <span>Başlangıç tarihi</span>
              <span>Bitiş tarihi</span>
            </div>
            <div>
              <input type="date" onChange={e => setStartDate(e.target.value)} />
              <input type="date" onChange={e => setEndDate(e.target.value)} />
            </div>
            <Button
              disabled={!(startDate && endDate && selectedStations != null && selectedType.length > 0)}
              onClick={() => props.setStation(stations)}
            >Ara</Button>
            <Button
              style={{ marginLeft: "auto" }}
              disabled={!(startDate && endDate && selectedStations != null && selectedType.length > 0)}
              onClick={() => props.setWatchList(stations)}
            >Kaydet</Button>
          </DateBox>
        </Main>
      )
    }
    else {
      main = <div>yok</div>
    }
    content = (
      <div style={{ width: "100%" }}>
        {main}
      </div>
    )

  }


  return (
    <Container>
      {content}
    </Container>

  )
};

export default OrganizationDetail;
