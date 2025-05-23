import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import PageHeader from "./components/PageHeader/PageHeader";
import Auth from "./pages/Auth/Auth"
import Profile from "./pages/Profile/Profile"
import Main from "./pages/Main/Main"
import CreateNotice from "./pages/CreateNotice/CreateNotice"
import PageWrapper from "./components/PageWrapper/PageWrapper";
import EaseOutWrapper from "./components/EaseOutWrapper/EaseOutWrapper";

function App() {
  return (
    <PageWrapper>
      <Router>
        <EaseOutWrapper
          show={true}
          duration={800}
          style={{
            width: "100%"
          }}
        >
          <PageHeader />
        </EaseOutWrapper>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-notice" element={<CreateNotice />} />
          <Route path="/" element={<Main />} />
        </Routes>
      </Router>
    </PageWrapper>
  );
}

export default App;