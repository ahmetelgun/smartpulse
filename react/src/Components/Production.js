import React, { useEffect, useState } from 'react';
import {
  useParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { styles } from './Variables';
import Plot from 'react-plotly.js';
import useFetch from '../UseFetch';
import { Loading } from './Animations';
import ReactDataSheet from 'react-datasheet';
import 'react-datasheet/lib/react-datasheet.css';
import _ from 'lodash';
import * as mathjs from 'mathjs';
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
const getUrgentDailyList = (list) => {
  let data = []
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
}

let allDatas = {}
const getSheetList = (d, s) => {
  d.forEach(item => {
    if (allDatas[item.tarih]) {
      if (allDatas[item.tarih].length < s) {
        allDatas[item.tarih].push(item.toplam)
      }
    } else {
      allDatas[item.tarih] = []
      allDatas[item.tarih].push(item.toplam)
    }
  })
}

const getUrgentSheetList = (d, s) => {
  d.forEach(item => {
    item.faultDetails.forEach(fault => {
      if (allDatas[fault.date]) {
        if (allDatas[fault.date].length < s) {
          allDatas[fault.date].push(fault.faultCausedPowerLoss)
          allDatas[fault.date].push(item.reason)
        }
      } else {
        allDatas[fault.date] = []
        allDatas[fault.date].push(fault.faultCausedPowerLoss)
        allDatas[fault.date].push(item.reason)
      }
    })
  })
}
let listData = {}
const getListData = (l, s) => {
  const q = "ABCDEF"
  Object.keys(l).forEach((item, index) => {
    listData[`A${index + 1}`] = { value: item.split("T")[1].split(":")[0] + ":" + item.split("T")[1].split(":")[1], key: `A${index + 1}`, expr: "", className: "" };
    l[item].forEach((v, i) => {
      listData[`${q[i + 1]}${index + 1}`] = { value: v, key: `${q[i + 1]}${index + 1}`, expr: "", className: "" };
    })
    //if (temp.length < (s + 3)) {
    //  temp.push({ value: "", key: `${q[temp.length - 1]}${index + 1}`, expr: '' })
    //}
    //listData.push(temp);
  })
  return listData
}

const q = " ABCDEF"

const generateGrid = (grid, l, s) => {
  return _.range(l + 2).map((row, i) =>
    _.range(s + 3).map((col, j) => {
      if (i == 0 && j == 0) {
        return { readOnly: true, value: '' }
      }
      if (row === 0) {
        return { readOnly: true, value: q[j] }
      }
      if (j === 0) {
        return { readOnly: true, value: row }
      }
      if (grid[q[j] + row]) {
        return grid[q[j] + row]
      } else {
        return { value: "", key: `${q[j]}${row}`, expr: "" }
      }
    })
  )
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
  const [kgupData, kgupLoading, kgupError, kgupCallFetch] = useFetch()
  const [eakData, eakLoading, eakError, eakCallFetch] = useFetch()
  const [urgentData, urgentLoading, urgentError, urgentCallFetch] = useFetch()
  const [station, setStation] = useState(null);
  const [types, setTypes] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [listDatas, setListDatas] = useState(null);
  useEffect(() => {
    listData = {}
    allDatas = {}
    if (props.station) {
      setListDatas(null)
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
  else if (props.station == null) {
    content = "";
  }
  else if (station == props.station) {
    let plotData = {};
    const s = station.types.length

    if (station.types.includes(0)) {
      plotData["kgup"] = getPlotList(kgupData.body.statistics)
      getSheetList(kgupData.body.dppList, 1)
    }
    if (station.types.includes(1)) {
      plotData["eak"] = getPlotList(eakData.body.statistics)
      getSheetList(eakData.body.aicList, 2)
    }
    if (station.types.includes(2)) {
      plotData["urgent"] = getUrgentDailyList(urgentData.body.urgentMarketMessageList)
      getUrgentSheetList(urgentData.body.urgentMarketMessageList, 3)
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
    let list;
    getListData(allDatas, types.length)





    function validateExp(trailKeys, expr) {
      let valid = true;
      const matches = expr.match(/[A-Z][1-9]+/g) || [];
      matches.map(match => {
        if (trailKeys.indexOf(match) > -1) {
          valid = false
        } else {
          valid = validateExp([...trailKeys, match], listDatas[match].expr)
        }
      })
      return valid
    }

    function computeExpr(key, expr, scope) {
      let value = null;
      if (expr.charAt(0) !== '=') {
        return { className: '', value: expr, expr: expr };
      } else {
        try {
          value = mathjs.evaluate(expr.substring(1), scope)
        } catch (e) {
          value = null
        }

        if (value !== null && validateExp([key], expr)) {
          return { className: 'equation', value, expr }
        } else {
          return { className: 'error', value: 'error', expr: '' }
        }
      }
    }

    function cellUpdate(state, changeCell, expr) {
      const scope = _.mapValues(state, (val) => isNaN(val.value) ? 0 : parseFloat(val.value))
      const updatedCell = _.assign({}, changeCell, computeExpr(changeCell.key, expr, scope))
      state[changeCell.key] = updatedCell

      _.each(state, (cell, key) => {
        if (cell.expr.charAt(0) === '=' && cell.expr.indexOf(changeCell.key) > -1 && key !== changeCell.key) {
          state = cellUpdate(state, cell, cell.expr)
        }
      })
      return state
    }

    function onCellsChanged(changes) {
      let state = _.assign({}, listDatas)
      changes.forEach(({ cell, value }) => {
        cellUpdate(state, cell, value)
      })
      setListDatas(state);
    }

    if (listDatas == null) {
      setListDatas(listData);

    } else {
      const q = generateGrid(listDatas, Object.keys(allDatas).length, types.length)
      console.log(q)
      list = <ReactDataSheet
        data={q}
        valueRenderer={cell => cell.value}
        dataRenderer={(cell) => cell.expr}
        onCellsChanged={onCellsChanged}
      />
    }



    console.log(listData)
    content = <div style={{ width: "100%", height: "100%" }}>
      <button onClick={() => setToggle(!toggle)}>{toggle ? "Grafik" : "Liste"}</button>
      {toggle ? list : plot}
    </div>
  }

  return (
    <Container>
      {content}
    </Container>
  );
}

export default Production;