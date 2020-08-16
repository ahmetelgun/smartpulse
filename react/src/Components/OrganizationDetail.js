import React, { useEffect, useState } from 'react';
import {
  useParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { styles } from './Variables';
import Production from './Production';
import useFetch from '../UseFetch';
import { Loading } from './Animations';
const Container = styled.div`
  
  height: 300px;
  padding: 15px;
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: rgba(240,240,240, .6);

    
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

const Select = styled.div`
  margin-top: 20px;
`;


const OrganizationDetail = (props) => {
  const [data, loading, error, callFetch] = useFetch();
  const [selectedCompany, setSelectedCompany] = useState();
  const [selectedStation, setSelectStation] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  useEffect(() => {
    if (props.selectedCompany) {
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
  else if (data) {

    let stations;
    if (data.body.injectionUnitNames.length == 0) {
      stations = <Select>"tesis yok"</Select>;
    }
    else if (props.selectedCompany == selectedCompany) {
      if (!selectedStation) {
        setSelectStation(data.body.injectionUnitNames[0].eic);
      }
      stations = data.body.injectionUnitNames.map((item, index) => (
        <option value={item.eic}>{item.name}</option>
      ));
      const station = {
        etso: selectedCompany.organizationETSOCode,
        eic: selectedStation,
        start: startDate,
        end: endDate
      }
      content = (
        <div>
          <h3 style={{ color: "rgba(0,170,0,.5)" }}>{selectedCompany.organizationName}</h3>
          <Select>
            <select onChange={(e) => setSelectStation(e.target.value)} value={selectedStation}>
              {stations}
            </select>
          </Select>
          <div style={{ display: "flex", marginTop: "20px" }}>
            <div>
              baslangic <br /> bitis
            </div>
            <div style={{ marginLeft: "10px" }}>
              <input type="date" onChange={(e) => setStartDate(e.target.value)} />
              <br />
              <input type="date" onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <button onClick={() => props.setStation(station)} style={{ marginLeft: "30px", backgroundColor: "rgba(0,170,0,.5)", paddingLeft: "20px", paddingRight: "20px", borderRadius: "4px" }} disabled={!(selectedStation && startDate && endDate)}>Ara</button>
          </div>
        </div>
      )
    }
  }
  else {

  }
  return (
    <Container>
      {content}
    </Container>
  )
};

export default OrganizationDetail;