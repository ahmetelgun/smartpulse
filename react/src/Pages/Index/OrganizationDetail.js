import React, { useEffect, useContext } from 'react';
import styled from 'styled-components';
import { styles } from '../../Globals/Variables';
import useFetch from '@ahmetelgun/usefetch'
import { Loading } from '../../Globals/Animations';
import Select from 'react-select'
import { useHistory } from 'react-router-dom';
import MyContext from '../../MyContext';
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

  const { isLogin, selectedStations, setSelectedStations, selectedCompanies, startDate, setStartDate, endDate, setEndDate, selectedType, setSelectedType, centralsUpdate, selectedProductions, setSelectedProductions, productionUpdate, toggleProductionUpdate, setWatchList } = useContext(MyContext);
  var history = useHistory();
  useEffect(() => {

    if (selectedCompanies.length > 0) {
      setSelectedProductions([])
      callFetch(`/api/getcentrals?etso=${selectedCompanies.join()}`)
    }
    // eslint-disable-next-line
  }, [centralsUpdate])

  let content;

  if (loading) {
    content = <Loading />
  }
  else if (error) {
    content = "error"
  }

  else if (data && selectedCompanies) {
    let main;
    if (data.data.length > 0) {
      const types = [
        { name: 'KGUP', value: 'kgup' },
        { name: 'EAK', value: 'eak' },
        { name: 'Arıza ve Bakım Bilgisi', value: 'urgent' }
      ]

      const handleTypeChange = (e) => {
        let values = []
        if (e) {
          e.forEach(element => {
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
        if (!isLogin) {
          history.push("/signin");
        } else {
          setWatchList(centrals);
        }
      }
      let options = data.data.map(organization => {
        return {
          label: organization.name,
          options: organization.centrals.map(central => (
            { value: central.id, label: central.name, eic: central.eic, etso: organization.etso }
          ))
        }
      });
      const CentralSelect = <Select isMulti options={options} onChange={e => setSelectedStations(e)} value={selectedStations} />

      const TypeSelect = <Select isMulti options={types.map((type, index) => ({ label: type.name, value: index }))} onChange={handleTypeChange} value={selectedType.map(type => ({ label: types[type].name, value: type }))} />

      let centrals;

      if (selectedStations.length > 0) {
        centrals = {
          start: startDate,
          end: endDate,
          types: selectedType,
          organizations: data.data.filter(organization => {
            if (selectedStations.filter(central => central.etso == organization.etso).length > 0) {
              return true;
            }
          })
            .map(organization => {
              return {
                name: organization.name,
                etso: organization.etso,
                centrals: selectedStations
                  .filter(central => central.etso == organization.etso)
                  .map(central => ({
                    id: central.value,
                    name: central.label,
                    eic: central.eic
                  }))
              }
            })
        }
      }
      main = (
        <Main>

          {CentralSelect}
          {TypeSelect}
          <DateBox>
            <div>
              <span>Başlangıç tarihi</span>
              <span>Bitiş tarihi</span>
            </div>
            <div>
              <input type="date" onChange={e => setStartDate(e.target.value)} value={startDate} />
              <input type="date" onChange={e => setEndDate(e.target.value)} value={endDate} />
            </div>
            <Button
              disabled={!(startDate && endDate && selectedProductions != null && selectedType.length > 0)}
              onClick={() => { setSelectedProductions(centrals); toggleProductionUpdate(!productionUpdate) }}
            >Ara</Button>
            <Button
              style={{ marginLeft: "auto" }}
              disabled={!(startDate && endDate && selectedProductions != null && selectedType.length > 0)}
              onClick={handleSaveClick}
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
