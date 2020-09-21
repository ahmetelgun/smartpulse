import React, { useEffect, useContext } from "react";
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
import MyContext from './MyContext';
import { styles } from "./Globals/Variables";

const Container = styled.div`
  filter: ${props => props.watchList ? "blur(3px)" : "blur(0px)"};
  position: relative;
`;



const App = () => {
  const [data, , , callFetch] = useFetch();

  const { isLogin, setIsLogin, watchList } = useContext(MyContext);
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
      <Container watchList={watchList}>
        <Header />
        <Switch>
          <Route path="/signup">
            <Signup />
          </Route>

          <Route path="/signin">
            <Signin />
          </Route>

          <Route path="/logout">
            <Logout />
          </Route>

          <Route path="/">
            <Index />
          </Route>
        </Switch>
      </Container>
      {watchList && <WatchList />}
    </div>

  )
};

export default App;
