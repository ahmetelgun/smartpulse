import React, { useEffect, useState, useContext } from 'react';
import styled from 'styled-components';
import Plot from 'react-plotly.js';
import useFetch from '@ahmetelgun/usefetch';
import { Loading } from '../../Globals/Animations';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import MyContext from '../../MyContext';
import { styles } from '../../Globals/Variables';
import XLSX from 'xlsx';
import { HeaderRowComp, GridApi } from 'ag-grid-community';
import { useHistory } from 'react-router-dom';

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 100%;
  overflow-y: hidden;
  flex-direction: column;

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
          hourlyList[fault.date][`${name} urgent`] = fault.faultCausedPowerLoss
          hourlyList[fault.date][`${name} reason`] = element.reason
        } else {
          hourlyList[fault.date] = {}
          hourlyList[fault.date][`${name} urgent`] = fault.faultCausedPowerLoss
          hourlyList[fault.date][`${name} reason`] = element.reason
        }
      })
    })
  }
}

const Tab = styled.div`
  height: 20px;
  display: flex;
  margin-right: auto;
  button{
  width: 70px;
  border-radius: 3px;
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    :hover{
    background-color: #bbbbbb;
  }
  }
`;


const Production = () => {
  let [data, loading, error, callFetch] = useFetch();
  const [isGraphicShow, setIsGraphicShow] = useState(false);
  const [gridApi, setGridApi] = useState();
  let { selectedProductions, productionUpdate, isLogin } = useContext(MyContext);
  const [gridName, setGridName] = useState("");
  const [selectedGrid, setSelectedGrid] = useState()
  const [file, setFile] = useState()
  const [gridList, setGridList] = useState([]);
  const [rows, setRows] = useState()
  const history = useHistory();
  useEffect(() => {
    if (selectedProductions.organizations && selectedProductions.organizations.length > 0) {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedProductions),
      }
      callFetch("/api/getproductiondata", options)

    }
    // eslint-disable-next-line
  }, [productionUpdate])
  let content;
  if (loading) {
    content = <Loading />
  }
  if (error) {
    content = "error";
  }
  if (data) {
    //////////  PLOT  //////////

    var lines = []
    data.data.forEach(organization => {
      organization.centralProductions.forEach(central => {
        Object.keys(central.types).forEach(type => {
          if (type != "urgent") {
            let line = { x: [], y: [], type: 'scatter', mode: 'lines+markers', name: `${central.name} ${type}` }
            central.types[type].daily.forEach(day => {
              line.x.push(day.date);
              line.y.push(day.sum)
            })
            lines.push(line);
          } else {
            let line = { x: [], y: [], type: 'scatter', mode: 'markers', name: `${central.name} ${type}` }
            central.types[type].forEach(urgent => {
              line.x.push(`${urgent.urgentStartDate.split("T")[0]}T00:00:00.000+0300`)
              let s = 0;
              urgent.hourly.forEach(h => {
                s = s + h.powerLoss;
              })
              line.y.push(s);
            });
            lines.push(line);

          }
        })
      })
    })
    const plot = <Plot
      data={lines}
      layout={{
        // autosize: true,
        title: false
      }}
      useResizeHandler={true}
      style={{ width: "100%", height: "100%" }}
    />
    //////////  PLOT END  //////////


    //////////  SHEET  //////////
    let headers = [{ headerName: "Tarih", field: "date", resizable: true, sortable: true }]
    data.data.forEach(organization => {
      organization.centralProductions.forEach(central => {
        headers.push({
          headerName: central.name, resizable: true, sortable: true, children: Object.keys(central.types).map(type => {
            if (type == "urgent") {
              return { headerName: "Kayıp", field: `${central.id} ${type}`, resizable: true, sortable: true, editable: true }
            }
            return { headerName: type.toUpperCase(), field: `${central.id} ${type}`, resizable: true, sortable: true, editable: true }
          })
        })
      })
    })

    let rowDatas = [];
    data.data.forEach(organization => {
      organization.centralProductions.forEach(central => {
        Object.keys(central.types).forEach(type => {
          if (type != "urgent") {
            central.types[type].hourly.forEach(hour => {
              var temp = rowDatas.filter(row => hour.date.slice(0, 16).replace("T", " ") == row.date);
              if (temp.length > 0) {
                rowDatas[rowDatas.indexOf(temp[0])][`${central.id} ${type}`] = hour.sum
              }
              else {
                rowDatas.push({ date: `${hour.date.slice(0, 16).replace("T", " ")}`, [`${central.id} ${type}`]: hour.sum })
              }
            })
          } else {
            central.types[type].forEach(urgent => {
              urgent.hourly.forEach(hour => {
                var temp = rowDatas.filter(row => hour.date.slice(0, 16).replace("T", " ") == row.date);
                if (temp.length > 0) {
                  rowDatas[rowDatas.indexOf(temp[0])][`${central.id} ${type}`] = hour.powerLoss
                }
                else {
                  rowDatas.push({ date: hour.date.slice(0, 16).replace("T", " "), [`${central.id} ${type}`]: hour.powerLoss })
                }
              })
            })
          }
        })
      })
    })
    if (rows == null || JSON.stringify(rows) != JSON.stringify(rowDatas)) {
      setRows(rowDatas)
    }

    const sheet = <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
      <AgGridReact
        columnDefs={headers}
        rowData={rows}
        onGridReady={e => { setGridApi(e.api); if (isLogin) { getGridList(); } }}
      ></AgGridReact></div>
    //////////  SHEET END  //////////


    function handleExport(e) {
      var str = gridApi.getDataAsCsv().replaceAll('"', "").replaceAll('\r', "")
      var rows = str.split("\n");
      let rowData = []
      rows.forEach(row => {
        rowData.push(row.split(","))
      })

      let types = Object.keys(data.data[0].centralProductions[0].types);
      let headers = [null]
      let merges = []
      data.data.forEach(organization => {
        organization.centralProductions.forEach(central => {
          var s = { r: 0, c: headers.length }
          types.forEach((type, index) => {
            if (index == 0) {
              headers.push(central.name)
            } else {
              headers.push(null)
            }
          })
          var e = { r: 0, c: headers.length - 1 }
          merges.push({ s, e })
        })
      })
      rowData.unshift(headers)
      var wb = XLSX.utils.book_new();
      var ws = XLSX.utils.aoa_to_sheet(rowData);
      ws["!merges"] = merges;
      wb.SheetNames.push("Test Sheet");
      wb.Sheets["Test Sheet"] = ws;
      XLSX.writeFile(wb, "sheetjs.xlsx");
    }

    function handleSave() {
      if (!isLogin) {
        history.push("/signin");
        return
      }
      fetch("/api/savesheet", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({ name: gridName, header: JSON.stringify(headers), rows: JSON.stringify(rows) })
      }).then(r => r.json()).then(j => {
        if (j.message && j.message == "success") {
          alert("Basariyla kaydedildi");
          getGridList()
        }
      })
    }



    function handleImport() {
      var fields = []
      headers.forEach((header, index) => {
        if (index == 0) {
          fields.push(header.field)
        } else {
          header.children.forEach(c => {
            fields.push(c.field)
          })
        }
      })
      let temp = []
      var reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = function (e) {
        var data = new Uint8Array(reader.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var sheet = workbook.Sheets[workbook.SheetNames[0]];
        const str = XLSX.utils.sheet_to_csv(sheet);
        const rows = str.split('\n')
        rows.splice(0, 2)
        rows.forEach(row => {
          var t = {}
          row.split(",").forEach((f, index) => {
            t[fields[index]] = f;
          })
          temp.push(t)

        })
        setRows(temp)
      }
    }

    function getGridList() {
      fetch("/api/getsheetlist").then(r => r.json()).then(j => {
        setGridList(j.map((g, index) => {
          if (index == 0) {
            setSelectedGrid(g.name)
          }
          return <option value={g.name} >{g.name}</option>
        }));
      })
    }

    function getGrid() {
      fetch(`/api/getsheet?name=${selectedGrid}`).then(r => r.json()).then(j => {
        gridApi.setColumnDefs(JSON.parse(j.header));
        gridApi.setRowData(JSON.parse(j.rows))
      })
    }

    content = (
      <>
        <Tab>
          <button style={{ backgroundColor: isGraphicShow ? "white" : "#bbbbbb" }} onClick={() => setIsGraphicShow(false)}>Liste</button>
          <button style={{ backgroundColor: isGraphicShow ? "#bbbbbb" : "white" }} onClick={() => setIsGraphicShow(true)}>Grafik</button>
          {!isGraphicShow &&
            <>
              <input type="file" onChange={e => setFile(e.target.files[0])} />
              <button onClick={handleImport}>Yukle</button>
              <button onClick={handleExport}>Indir</button>

              {gridList.length > 0 &&

                <>
                  <select onChange={e => setSelectedGrid(e.target.value)}>
                    {gridList}
                  </select>
                  <button onClick={getGrid}>Getir</button>
                </>
              }

              <div style={{ marginLeft: "auto", display: "flex" }}>
                <input type="text" placeholder="Grid ismi" value={gridName} onChange={e => setGridName(e.target.value)} />
                <button disabled={gridName == ""} onClick={handleSave}>Kaydet</button>
              </div>
            </>
          }

        </Tab>
        {isGraphicShow ? plot : sheet}
      </>
    )

  }
  return (
    <Container>
      {content}
    </Container>
  )

}

export default Production;