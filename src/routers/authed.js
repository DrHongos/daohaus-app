import React from "react";
import { Switch, Route } from "react-router-dom";

import { UserContextProvider } from "../contexts/UserContext";
import AuthedHub from "../pagesAuthed/AuthedHub";
import AuthedDao from "../pagesAuthed/AuthedDao";
import { DaoProvider } from "../contexts/DaoContext";
import { MetaDataProvider } from "../contexts/MetaDataContext";
import { TokenProvider } from "../contexts/TokenContext";

const Authed = () => {
  return (
    <UserContextProvider>
      <Switch>
        <Route exact path="/">
          <AuthedHub />
        </Route>
        <Route exact path="/hub">
          <AuthedHub />
        </Route>
        <Route path="/dao/:daochain/:daoid">
          <DaoProvider>
            <AuthedDao />
          </DaoProvider>
        </Route>
      </Switch>
    </UserContextProvider>
  );
};

export default Authed;
