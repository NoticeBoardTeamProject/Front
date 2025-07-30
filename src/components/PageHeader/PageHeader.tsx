import { FC, /*useEffect, useState*/ } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./PageHeader.css";

import { Navbar, Nav, Button } from "react-bootstrap";

import Logo from "../../assets/icons/Logo.svg?react";
import UserIcon from "../../assets/icons/UserIcon.svg?react";

/*
function parseJwt(token: string) {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(payload)));
  } catch {
    return null;
  }
}
  */

const PageHeader: FC = () => {
  const navigate = useNavigate();

  /*
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    function updateUserState() {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = parseJwt(token);
        setRole(payload?.role ?? null);
      } else {
        setRole(null);
      }
    }

    updateUserState();

    window.addEventListener("loggedIn", updateUserState);
    window.addEventListener("loggedOut", () => {
      setRole(null);
    });

    return () => {
      window.removeEventListener("loggedIn", updateUserState);
      window.removeEventListener("loggedOut", () => {
        setRole(null);
      });
    };
  }, []);
  */

  return (
    <Navbar
      style={{
        width: "100%"
      }}
    >
      <Nav
        className="me-auto"
        style={{
          display: "flex",
          alignItems: "center"
        }}
      >
        <Logo width={120} height={80} />

        <div>
          <Nav.Link
            as={Link}
            to={"/"}
            style={{ 
              padding: "0px 22px",
              color: "white"
            }}
          >
            NOTICES
          </Nav.Link>
        </div>
      </Nav>
      <Nav style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        <Button
          onClick={() => navigate('/profile')}
          style={{
            width: '41px',
            height: '41px',
            padding: 0,
            borderRadius: '4px',
            backgroundColor: "#D9A441",
            border: "none",
            boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.3)',
          }}
          aria-label="Go to profile"
        >
          <UserIcon width={22} height={22} />
        </Button>
      </Nav>
    </Navbar>
  );
};

export default PageHeader;
