
import React, { useState, useEffect } from "react";
import Header from './Components/Header'
import SideList from './Components/SideList'
import Production from './Components/Production';
import OrganizationDetail from './Components/OrganizationDetail';
import styled from 'styled-components';
import { styles } from './Components/Variables';
import SideButton from './Components/SideButton';
import CustomSlect from './Components/CustomSelect';
import { Signup, Signin, Logout } from './Components/Auth';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation,
  useHistory,
  browserHistory
} from "react-router-dom";
import useFetch from "@ahmetelgun/usefetch";
import { getCookie, setCookie } from "./Components/utils";
const Index = styled.div`
display: flex;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height:  calc(100vh - ${styles.header_height});
`;

const App = () => {
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [stations, setStations] = useState([]);
  const [data, loading, error, callFetch] = useFetch();
  const [isLogin, setIsLogin] = useState(false);
  let history = useLocation();
  let token = getCookie("token")
  useEffect(() => {
    token = getCookie("token")
    if (token) {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token })
      }
      callFetch("/api/signin", options);

    }
  }, [history])
  if (token && data && data.data.message == "success" && isLogin == false) {
    setIsLogin(true);
  }
  else if (token && data && data.data.message != "success") {
    setCookie(token, "");
    if (isLogin) {
      setIsLogin(false);
    }
  } else if (!token && isLogin) {
    setIsLogin(false);
  }
  return (
    <>
      <Header isLogin={isLogin} />
      <Switch>
        <Route path="/signup">
          <Signup />
        </Route>
        <Route path="/signin">
          <Signin isLogin={isLogin} />
        </Route>
        <Route path="/logout">
          <Logout setIsLogin={setIsLogin} />
        </Route>
        <Route path="/">
          <Index style={{ display: "flex" }}>
            <SideList setSelectedCompanies={setSelectedCompanies} />
            <RightPanel>
              <OrganizationDetail selectedCompanies={selectedCompanies} setStation={setStations} />
              <Production stations={stations} />
            </RightPanel>
          </Index>
        </Route>
      </Switch>
    </>
  )
};

export default App;
