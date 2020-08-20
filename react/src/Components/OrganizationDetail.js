import React, { useEffect, useState } from 'react';
import {
  useParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { styles } from './Variables';
import Production from './Production';
import useFetch from '../UseFetch';
import { Loading } from './Animations';
import CustomSelect from './CustomSelect';
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
  div + div{
    margin-top: 20px;
  }
  div + button{
    margin-top: 20px;
  }
`

const OrganizationDetail = (props) => {
  const [data, loading, error, callFetch] = useFetch();
  const [selectedCompany, setSelectedCompany] = useState();
  const [selectedStation, setSelectedStation] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedType, setSelectedType] = useState([]);
  useEffect(() => {
    if (props.selectedCompany) {
      setSelectedStation(null)
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
    if (data.body.injectionUnitNames.length > 0) {
      const types = [
        { name: 'KGUP', value: 'kgup' },
        { name: 'EAK', value: 'eak' },
        { name: 'Arıza ve Bakım Bilgisi', value: 'urgent' }
      ]
      let station;
      if (selectedStation) {
        station = {
          etso: selectedCompany.organizationETSOCode,
          eic: data.body.injectionUnitNames[selectedStation].eic,
          id: data.body.injectionUnitNames[selectedStation].id,
          start: startDate,
          end: endDate,
          types: selectedType
        }
      }
      const handleChange = (index) => {
        if (selectedType.includes(index)) {
          setSelectedType(selectedType.filter(i => i != index));
        } else {
          setSelectedType([...selectedType, index].sort());
        }
      }
      const StationSelect = <CustomSelect items={data.body.injectionUnitNames} style={{ maxWidth: "500px", zIndex: 1 }} setSelected={setSelectedStation} selected={selectedStation} />
      const TypeSelect = types.map((item, index) => <label>{item.name}: <input type="checkbox" value={item.value} onChange={() => handleChange(index)} checked={selectedType.includes(index)} /> </label>)
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
          <Button /* disabled={!(startDate && endDate && selectedStation != null && selectedType != null)}*/ onClick={() => props.setStation(station)}>Ara</Button>
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