import React, { useState, useEffect } from "react";
import Signin from './Pages/Signin/Signin';
import Signup from './Pages/Signup/Signup';
import {
  Switch,
  Route,
  useLocation,
} from "react-router-dom";
import useFetch from "@ahmetelgun/usefetch";
import Header from './Globals/Header';
import Index from './Pages/Index/Index';
import { getCookie, setCookie } from "./Globals/utils";
import Logout from './Pages/Logout/Logout';
import WatchList from './Pages/WatchList/WatchList';
import styled from "styled-components";
const Container = styled.div`
  filter: ${props => props.watchListShow ? "blur(3px)" : "blur(0px)"};
  position: relative;
`;
const App = () => {
  // eslint-disable-next-line
  const [data, loading, error, callFetch] = useFetch();
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [stations, setStations] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const [watchListShow, setWatchListShow] = useState(false);
  let history = useLocation();
  let token = getCookie("token");
  useEffect(() => {
    // eslint-disable-next-line
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

  if (token && data && data.data.message === "success" && isLogin === false) {
    setIsLogin(true);
  } else if (token && data && data.data.message !== "success") {
    setCookie(token, "");
    if (isLogin) {
      setIsLogin(false);
    }
  } else if (!token && isLogin) {
    setIsLogin(false);
  }
  return (
    <div style={{ position: "relative" }}>
      <Container watchListShow={watchListShow}>
        <Header isLogin={isLogin} setWatchListShow={setWatchListShow} />
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
            <Index setWatchListShow={setWatchListShow} setSelectedCompanies={setSelectedCompanies} selectedCompanies={selectedCompanies} setStations={setStations} stations={stations} />
          </Route>
        </Switch>
      </Container>
      {watchListShow && <WatchList show={watchListShow} setShow={setWatchListShow} setStations={setStations} />}
    </div>
  )
};

export default App;
