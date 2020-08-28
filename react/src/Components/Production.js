import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { styles } from './Variables';
import Plot from 'react-plotly.js';
import useFetch from '@ahmetelgun/usefetch';
import { Loading } from './Animations';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  overflow-y: hidden;

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
const getList = (statistics, daily = true, name = "") => {
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
        hourlyList[element.tarih][name] = element.toplam
      } else {
        hourlyList[element.tarih] = {}
        hourlyList[element.tarih][name] = element.toplam
      }
    })
  }
}
const getUrgentList = (list, daily = true, name = "") => {
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
          hourlyList[fault.date][name + "urgent"] = fault.faultCausedPowerLoss
          hourlyList[fault.date][name + "reason"] = element.reason
        } else {
          hourlyList[fault.date] = {}
          hourlyList[fault.date][name + "urgent"] = fault.faultCausedPowerLoss
          hourlyList[fault.date][name + "reason"] = element.reason
        }
      })
    })
  }
}

const Production = (props) => {
  const [data, loading, error, callFetch] = useFetch();
  useEffect(() => {
    if (props.stations.length > 0) {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(props.stations),
      }
      callFetch("/api/post", options)
    }
  }, [props.stations])
  let content;
  if (loading) {
    content = <Loading />
  }
  if (error) {
    content = "error";
  }
  if (data) {

    //////////  PLOT  //////////
    let plotData = [];
    data.data.forEach(item => {
      Object.keys(item).forEach(type => {
        if (type === "urgent") {
          var temp = getUrgentList(item[type].urgentMarketMessageList, true)
          temp = {
            ...temp,
            type: 'scatter',
            mode: 'markers',
            name: item.name + " " + type
          }
          plotData.push(temp);
        }
        else if (type === "eak" || type === "kgup") {
          var temp = getList(item[type].statistics, true, type)
          temp = {
            ...temp,
            type: 'scatter',
            mode: 'lines+markers',
            name: item.name + " " + type
          }
          plotData.push(temp);
        }
      })
    })

    content = <Plot
      data={plotData}
      layout={{
        autosize: true,
        title: false
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />
    //////////  END PLOT  //////////

    //////////  SHEET  //////////
    const types = [
      { "kgup": "KGUP" },
      { "eak": "EAK" },
      { "urgent": "Arıza", "reason": "Ariza Nedeni" }
    ]
    data.data.forEach((item, index) => {
      Object.keys(item).forEach(type => {
        if (type === "urgent") {
          getUrgentList(item[type].urgentMarketMessageList, false, index);
        } else if (type === "kgup") {
          getList(item[type].dppList, false, index + " " + type);
        } else if (type === "eak") {
          getList(item[type].aicList, false, index + " " + type);
        }
      })
    })

    const formatDate = (date) => {
      const d = date.split("T")
      const hour = d[1].split(":")[0]
      const minute = d[1].split(":")[1]
      return d[0] + " " + hour + ":" + minute
    }

    let sheetList = Object.keys(hourlyList).map(item => {
      return { ...hourlyList[item], date: formatDate(item) }
    })

    let header = [{ headerName: "Tarih", field: "date", resizable: true }]
    props.stations.forEach((station, index) => {

      station.types.forEach(item => {
        if (item == 2) {
          header.push({ headerName: station.name + " " + Object.values(types[item])[0], field: index + " " + Object.keys(types[item])[0], resizable: true })
          header.push({ headerName: station.name + " " + Object.values(types[item])[1], field: index + " " + Object.keys(types[item])[1], resizable: true })
        } else {
          header.push({ headerName: station.name + " " + Object.values(types[item])[0], field: index + " " + Object.keys(types[item])[0], resizable: true })
        }

      })
    })


    console.log(sheetList)
    content = <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
      <AgGridReact
        columnDefs={header}
        rowData={sheetList}
      ></AgGridReact></div>
    console.log(header);


    //////////  END SHEET  //////////


  }
  return (
    <Container>
      {content}
    </Container>
  )

}

export default Production;