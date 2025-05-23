import { FC, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./PageHeader.css";

import { Navbar, Nav } from "react-bootstrap";

import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faRightToBracket,
  faBullhorn,
  faCirclePlus,
  faStore
} from "@fortawesome/free-solid-svg-icons";

interface CustomNavLinkProps {
  icon: FontAwesomeIconProps["icon"];
  secondIcon?: FontAwesomeIconProps["icon"];
  text: string;
  link: string;
}

const CustomNavLink: React.FC<CustomNavLinkProps> = ({ icon, text, link, secondIcon }) => {
  const location = useLocation();

  return (
    <Nav>
      <Nav.Link
        as={Link}
        to={link}
        className={`custom-nav-link ${location.pathname === link ? "selected" : ""}`}
        style={{ padding: "0px 22px" }}
      >

        <FontAwesomeIcon
          style={{
            position: "relative",
            top: secondIcon ? "-2px" : 0
          }}
          icon={icon}
        /> {secondIcon && (
          <div style={{ position: "absolute" }}>
            <FontAwesomeIcon
              style={{
                position: "relative",
                fontSize: "70%",
                border: "rgb(23, 25, 27) 1.8px solid",
                borderRadius: "100%",
                top: "-17px",
                left: "-7px",
                backgroundColor: "rgb(23, 25, 27)"
              }}
              icon={secondIcon}
            />
          </div>
        )} {text}
      </Nav.Link>
    </Nav>
  );
};

const PageHeader: FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const handleLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    const handleLogout = () => {
      setIsLoggedIn(false);
    };

    window.addEventListener("loggedIn", handleLogin);
    window.addEventListener("loggedOut", handleLogout);

    return () => {
      window.removeEventListener("loggedIn", handleLogin);
      window.addEventListener("loggedOut", handleLogout);

    };
  }, []);

  return (
    <Navbar
      style={{
        width: "100%",
        borderBottom: "rgb(43, 48, 52) solid 1px",
        color: "white"
      }}
    >
      <Nav className="me-auto" style={{ display: "flex", flexDirection: "row" }}>
        <CustomNavLink link={"/"} icon={faStore} text={"Notices"} />
        {!isLoggedIn && <CustomNavLink link={"/login"} icon={faRightToBracket} text={"Login"} />}
        {isLoggedIn && <CustomNavLink link={"/create-notice"} secondIcon={faCirclePlus} icon={faBullhorn} text={"Create notice"} />}
      </Nav>
      <Nav style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
        {isLoggedIn && <CustomNavLink link={"/profile"} icon={faUser} text={"Profile"} />}
      </Nav>
    </Navbar>
  );
};

export default PageHeader;
