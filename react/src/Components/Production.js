import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { styles } from './Variables';
import Plot from 'react-plotly.js';
import useFetch from '../UseFetch';
import { Loading } from './Animations';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const Container = styled.div`
  height: 100%;
  display: flex;
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

let hourlyList = {}
const getPlotList = (statistics, daily = true, name = "") => {
  if (daily) {
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
  else {

    statistics.forEach(element => {
      if (hourlyList[element.tarih]) {
        hourlyList[element.tarih][name] = { value: element.toplam }
      } else {
        hourlyList[element.tarih] = {}
        hourlyList[element.tarih][name] = { value: element.toplam }
      }
    })
  }
}
const getUrgentList = (list, daily = true) => {
  let data = []
  if (daily) {
    list.forEach((element, index) => {
      let temp = 0
      element.faultDetails.forEach((fault, faultIndex) => {
        temp = temp + fault.faultCausedPowerLoss
      })
      data.push({ x: element.caseStartDate.split("T")[0], y: temp })
    })
    data.sort((a, b) => (a.x > b.x) ? 1 : -1)
    let x = []
    let y = []
    data.forEach(item => {
      x.push(item.x)
      y.push(item.y)
    })
    return { x: x, y: y }
  } else {
    list.forEach((element, index) => {
      element.faultDetails.forEach((fault, faultIndex) => {
        if (hourlyList[fault.date]) {
          hourlyList[fault.date]["urgent"] = { value: fault.faultCausedPowerLoss, reason: element.reason }
        } else {
          hourlyList[fault.date] = {}
          hourlyList[fault.date]["urgent"] = { value: fault.faultCausedPowerLoss, reason: element.reason }
        }
      })
    })
  }
}

const Production = (props) => {
  let urls;
  if (props.station) {
    urls = [
      `/api/production/kgup?etso=${props.station.etso}&eic=${props.station.eic}&start=${props.station.start}&end=${props.station.end}`,
      `/api/production/eak?etso=${props.station.etso}&eic=${props.station.eic}&start=${props.station.start}&end=${props.station.end}`,
      `/api/urgent?regionid=1&uevcbid=${props.station.id}&start=${props.station.start}&end=${props.station.end}`,
    ]
  }

  const [kgupData, kgupLoading, kgupError, kgupCallFetch] = useFetch()
  const [eakData, eakLoading, eakError, eakCallFetch] = useFetch()
  const [urgentData, urgentLoading, urgentError, urgentCallFetch] = useFetch()

  const [station, setStation] = useState(null);
  const [types, setTypes] = useState([]);
  const [toggle, setToggle] = useState(false);
  useEffect(() => {
    if (props.station) {
      setTypes([])
      let t = []
      if (props.station.types.includes(0)) {
        kgupCallFetch(urls[0]).then(() => { t.push(0); setTypes(t.sort()); })
      }
      if (props.station.types.includes(1)) {
        eakCallFetch(urls[1]).then(() => { t.push(1); setTypes(t.sort()); })
      }
      if (props.station.types.includes(2)) {
        urgentCallFetch(urls[2]).then(() => { t.push(2); setTypes(t.sort()); })
      }
    }
  }, [props.station])


  if (props.station && types.length == props.station.types.length && props.station != station) {
    setStation(props.station);
  }
  let content;
  if (kgupLoading || eakLoading || urgentLoading) {
    content = <Loading />
  }
  else if (kgupError || eakError || urgentError) {
    content = <div>error</div>
  }
  else if (props.station != null && station == props.station) {


    //////////  GRAPHIC  //////////
    let plotData = {};
    if (station.types.includes(0)) {
      plotData["kgup"] = getPlotList(kgupData.body.statistics, true)
      getPlotList(kgupData.body.dppList, false, "kgup")
    }
    if (station.types.includes(1)) {
      plotData["eak"] = getPlotList(eakData.body.statistics, true)
      getPlotList(eakData.body.aicList, false, "eak")
    }
    if (station.types.includes(2)) {
      plotData["urgent"] = getUrgentList(urgentData.body.urgentMarketMessageList, true)
      getUrgentList(urgentData.body.urgentMarketMessageList, false)
    }
    let plotDataList = []
    Object.keys(plotData).forEach((key, index) => {
      plotDataList.push({ x: plotData[key].x, y: plotData[key].y, type: 'scatter', mode: (key == 'urgent' ? 'markers' : 'lines+markers'), name: key })
    });
    const plot = <Plot
      data={plotDataList}
      layout={{
        autosize: true
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />
    //////////  GRAPHIC END  //////////


    //////////  LIST  //////////
    const typeDefinitions = {
      0: [{ headerName: "KGUP", field: "kgup", editable: true, width: 100, resizable: true }],
      1: [{ headerName: "EAK", field: "eak", editable: true, width: 100, resizable: true }],
      2: [
        { headerName: "Ariza ve Bakim", field: "urgent", editable: true, width: 100, resizable: true },
        { headerName: "Ariza ve Bakim Nedeni", field: "urgentReason", width: 200, resizable: true }
      ]
    }

    var columnDefs = [
      { headerName: "Tarih", field: "date", resizable: true },
    ]
    types.forEach(type => {
      typeDefinitions[type].forEach(f => {
        columnDefs.push(f)
      })
    })

    let listData = [];
    Object.keys(hourlyList).forEach(item => {
      let temp = {}
      Object.keys(hourlyList[item]).forEach(i => {
        temp["date"] = item.split("T")[0] + " " + item.split("T")[1].split(":")[0] + ":" + item.split("T")[1].split(":")[1];
        if (i == "urgent") {
          temp["urgent"] = hourlyList[item][i].value
          temp["urgentReason"] = hourlyList[item][i].reason
        } else {
          temp[i] = hourlyList[item][i].value
        }
      })
      listData.push(temp)
    })
    listData.push({ date: "Toplam", kgup: '=ctx.sum("kgup")', eak: '=ctx.sum("eak")', urgent: '=ctx.sum("urgent")' })

    let gridOptions = {
      enableCellExpressions: true,
      context: {

      }
    }
    gridOptions.context.sum = (field) => {
      let s = 0;
      listData.forEach(item => {
        if (!isNaN(item[field])) {
          s += parseFloat(item[field])
        }
      })
      return s;
    }
    let list = (
      <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={listData}
          gridOptions={gridOptions}
        >
        </AgGridReact>
      </div>
    )

    //////////  LIST END  //////////

    content = <div style={{ width: "100%", height: "100%", position: 'relative' }}>
      <button style={{ position: "absolute", top: "0", width: "150px", height: "50px", borderRadius: "5px", zIndex: 1, right: "0", backgroundColor: styles.green }} onClick={() => setToggle(!toggle)}>{toggle ? "Liste" : "Grafik"}</button>
      {toggle ? plot : list}
    </div>
  }

  return (
    <Container>
      {content}
    </Container>
  );
}

export default Production;