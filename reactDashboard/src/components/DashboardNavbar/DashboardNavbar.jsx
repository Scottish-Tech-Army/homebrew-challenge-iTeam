import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./DashboardNavbar.css";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { URL_OVERVIEW, URL_REGIONAL } from "../../pages/PageConsts";
import { NavLink, Link } from "react-router-dom";

const DashboardNavbar = ({ toggleDarkmode, setToggleDarkmode }) => {
  function navLink(pageUrl, title, exact = true) {
    return (
      <NavLink
        className="nav-link"
        to={pageUrl}
        exact={exact}
        activeClassName="selected"
      >
        {title}
      </NavLink>
    );
  }

  const darkmodeButtonValue = () => {
    if (toggleDarkmode === true) {
      return "Turn Off";
    } else if (toggleDarkmode === false) {
      return "Turn On";
    }
  };

  return (
    <Navbar className="dashboard-navbar" expand="sm">
      <Link to={URL_OVERVIEW}>
        <img
          id="logo"
          src="/Square avatar trimmed.svg"
          alt="Scottish Tech Army Logo"
        />
      </Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav" className="heading-container">
        <Navbar.Brand className="heading">
          <h1>Scottish COVID-19 Statistics</h1>
        </Navbar.Brand>
        <input
          type="button"
          value={darkmodeButtonValue()}
          className="toggleDarkmodeButton"
          onClick={() => setToggleDarkmode((value) => !value)}
        ></input>
        <Nav className="navbar-links">
          {navLink(URL_OVERVIEW, "Summary Dashboard")}
          {navLink(URL_REGIONAL, "Regional Insights", false)}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default DashboardNavbar;
