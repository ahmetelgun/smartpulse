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
  width: 100%;
  overflow-y: scroll;

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

const Table = styled.table`

  th, td{
    padding: 15px;
  }
`;

const getPlotList = (statistics) => {
  let data = []
  statistics.forEach((element, index) => {
    data.push({ x: element.tarih.split("T")[0], y: element.toplamSum });
  });
  data.sort((a, b) => (a.x > b.x) ? 1 : -1)
  let x = []
  let y = []
  data.forEach(item => {
    x.push(item.x)
    y.push(item.y)
  })
  return { x: x, y: y }
}


const Production = (props) => {
  let urls
  if (props.station) {
    urls = [
      `/api/production/kgup?etso=${props.station.etso}&eic=${props.station.eic}&start=${props.station.start}&end=${props.station.end}`,
      `/api/production/eak?etso=${props.station.etso}&eic=${props.station.eic}&start=${props.station.start}&end=${props.station.end}`,
      `/api/urgent?regionid=1&uevcbid=${props.station.id}&start=${props.station.start}&end=${props.station.end}`,
    ]
  }
  const [data, loading, error, callFetch] = useFetch()
  const [station, setStation] = useState(null);
  const [graph, setGraph] = useState(true);
  useEffect(() => {
    if (props.station) {
      callFetch(urls[props.station.type])
        .then(() => setStation(props.station))
    }
  }, [props.station])
  let content;
  if (loading) {
    content = <Loading />
  }
  else if (error) {
    content = <div>error</div>
  }
  else if (data && station == props.station) {
    if (station.type == 0 || station.type == 1) {
      const types = [
        { name: 'KGUP', value: 'kgup' },
        { name: 'EAK', value: 'eak' },
        { name: 'Arıza ve Bakım Bilgisi', value: 'urgent' }
      ]
      const plotData = getPlotList(data.body.statistics)
      let l;
      if (station.type == 0) {
        l = data.body.dppList
      } else {
        l = data.body.aicList
      }
      const table = l.map((item, index) => {
        return <tr><td>{item.tarih}</td><td>{item.toplam}</td></tr>
      })
      content = (
        <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", justifyContent: "center" }}>
          <button onClick={() => { setGraph(!graph) }} style={{ position: "absolute", top: "0", bottom: "0", right: "0", left: "0", zIndex: "1", height: "40px", width: "60px" }}>{graph ? "Grafik" : "Liste"}</button>
          {!graph && <Table>
            <tr>
              <th>Tarih</th>
              <th>{types[station.type].name}</th>
            </tr>
            {table}</Table>}
          {graph && <Plot
            data={[
              {
                x: plotData.x,
                y: plotData.y,
                type: 'scatter',
                mode: 'lines+markers',
                marker: { color: 'red' },
              }
            ]}
            layout={{ title: 'A Fancy Plot', autosize: true }}
            useResizeHandler="true"
            style={{ width: "100%", height: "100%" }}
          />}
        </div>
      )
    }
    else {
      if (data.body.urgentMarketMessageList.length > 0) {
        data.body.urgentMarketMessageList.sort((a, b) => (a.caseStartDate > b.caseStartDate) ? 1 : -1)
        const table = data.body.urgentMarketMessageList.map((item, index) => (
          <tr>
            <td>{item.caseStartDate}</td><td>{item.caseEndDate}</td><td>{item.reason}</td>
          </tr>
        )
        )

        content = <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", justifyContent: "center" }}>
          <Table>
            <tr style={{ position: "sticky", borderBottom: "1px solid black" }}><td>Arıza başlangıç</td><td>Arıza bitiş</td><td>Arıza nedeni</td></tr>
            {table}</Table>
        </div>
      }
      else {

        content = <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", justifyContent: "center" }}>
          Belirtilen tarihler arasında arıza kaydı bulunamadı
    </div>
      }
    }
  }

  return (
    <Container>{content}</Container>
  );
}

export default Production;