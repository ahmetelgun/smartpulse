import React, { useEffect, useState } from 'react';
import {
  useParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { styles } from './Variables';
import Plot from 'react-plotly.js';
import useFetch from '../UseFetch';
import { Loading } from './Animations';

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center; 
  justify-content: center;
  position: relative;


  ::before{
    content: "";
    background-image: url("./statistics.png");
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


const getPlot = (data, name) => {
  const groups = data.reduce((groups, hour) => {
    const date = hour.tarih.split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(hour);
    return groups;
  }, {});

  const groupArrays = Object.keys(groups).map((date) => {
    return {
      date,
      hour: groups[date]
    };
  });
  let dates = []
  let kgups = []
  groupArrays.forEach((item, index) => {
    let t = 0;
    item.hour.forEach(element => {
      t = t + element.toplam
    });
    dates.push(item.date)
    kgups.push(t)
  })


  return (
    <Plot
      data={[
        {
          x: dates,
          y: kgups,
          type: 'scatter',
          mode: 'lines+markers',
          marker: { color: 'red' },
        },
      ]}
      layout={{ width: 800, height: 300, title: name }}
    />
  )
}


const Production = (props) => {
  const [kgup, kgupLoading, kgupError, kgupCallFetch] = useFetch();
  const [eak, eakLoading, eakError, eakCallFetch] = useFetch();
  const [station, setStation] = useState(null)
  const [tab, setTab] = useState(1);
  useEffect(() => {
    if (props.station) {
      const query = new URLSearchParams(props.station).toString()
      kgupCallFetch(`/api/production?${query}`)
      eakCallFetch(`/api/production2?${query}`)
      if (kgup && eak) {
        setStation(props.setStation);
      }
    }
  }, [props.station]);
  let content;

  if (eakLoading || kgupLoading) {
    content = <Loading />
  }


  if (kgup && eak) {
    const kgupPlot = getPlot(kgup.body.dppList, "KGUP")
    const eakPlot = getPlot(eak.body.aicList, "EAK")
    const tabs = (
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <button onClick={() => setTab(1)} style={{ height: "35px", borderRadius: "3px", backgroundColor: "green", width: "60px" }}>KGUP</button>
        <button onClick={() => setTab(2)} style={{ height: "35px", borderRadius: "3px", marginLeft: "20px", backgroundColor: "green", width: "60px" }}>EAK</button>
        <br />
      </div>
    )

    content = (
      <>
        {tabs} <br />
        {tab == 1 ? kgupPlot : eakPlot}
      </>
    )
  }

  return (
    <Container>
      {content}
    </Container>
  )
};

export default Production;