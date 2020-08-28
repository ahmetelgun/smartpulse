import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { styles } from './Variables';
import Production from './Production';
import useFetch from '@ahmetelgun/usefetch'
import { Loading } from './Animations';
import CustomSelect from './CustomSelect';
import Select from 'react-select'
const Container = styled.div`
  height: 300px;
  padding: 15px;
  position: relative;
  display: flex;
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

const Title = styled.h3`
  color: ${styles.green};
`;

const DateBox = styled.div`
margin-top: 20px;
  display: flex;
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
  
  div + button{
    margin-top: 20px;
  }
`

const OrganizationDetail = (props) => {
  const [data, loading, error, callFetch] = useFetch();
  const [selectedCompany, setSelectedCompany] = useState();
  const [selectedStations, setSelectedStations] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedType, setSelectedType] = useState([]);
  useEffect(() => {
    if (props.selectedCompany) {
      setSelectedStations([])
      callFetch(`/api/organization?etso=${props.selectedCompany.organizationETSOCode}`)
        .then(() => {
          setSelectedCompany(props.selectedCompany);
        })
    }
  }, [props.selectedCompany])

  let content;

  if (loading) {
    content = <Loading />
  }
  else if (error) {
    content = "error"
  }

  else if (data && selectedCompany == props.selectedCompany) {
    const title = <Title>{selectedCompany.organizationName}</Title>
    let main;
    if (data.data.length > 0) {
      const types = [
        { name: 'KGUP', value: 'kgup' },
        { name: 'EAK', value: 'eak' },
        { name: 'Arıza ve Bakım Bilgisi', value: 'urgent' }
      ]

      const handleChange = (index) => {
        if (selectedType.includes(index)) {
          setSelectedType(selectedType.filter(i => i != index));
        } else {
          setSelectedType([...selectedType, index].sort());
        }
      }


      const options = data.data.map(item => ({ value: item.id, label: item.name, eic: item.eic }))
      const StationSelect = <Select isMulti options={options} onChange={e => setSelectedStations(e)} />
      const TypeSelect = types.map((item, index) => <label key={index}>{item.name}: <input type="checkbox" value={item.value} onChange={() => handleChange(index)} checked={selectedType.includes(index)} /> </label>)
      let stations;
      if (selectedStations) {
        stations = selectedStations.map(station => {
          return {
            name: station.label,
            id: station.value,
            eic: station.eic,
            etso: selectedCompany.organizationETSOCode,
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
          </DateBox>
          <Button
            disabled={!(startDate && endDate && selectedStations != null && selectedType.length > 0)}
            onClick={() => props.setStation(stations)}
          >Ara</Button>
        </Main>
      )
    }
    else {
      main = <div>yok</div>
    }
    content = (
      <div style={{ width: "100%" }}>
        {title}
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
