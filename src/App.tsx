import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PageHeader from "./components/PageHeader/PageHeader";
import Auth from "./pages/Auth/Auth"
import Profile from "./pages/Profile/Profile"
import Main from "./pages/Main/Main"
import CreateNotice from "./pages/CreateNotice/CreateNotice"
import PageWrapper from "./components/PageWrapper/PageWrapper";
import EaseOutWrapper from "./components/EaseOutWrapper/EaseOutWrapper";
import PostDetails from "./pages/PostDetails/PostDetails";
import Verify from "./pages/Verify/Verify";
import AdminPanel from "./pages/AdminPanel/AdminPanel";

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
          <Route path="/post/:postId" element={<PostDetails />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/" element={<Main />} />
        </Routes>
      </Router>
    </PageWrapper>
  );
}

export default App;