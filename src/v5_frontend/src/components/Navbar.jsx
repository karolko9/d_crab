import React from 'react';
import { Outlet, Link } from "react-router-dom";
import { logout } from '../utils/auth';



const Navbar = () => {
  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/explore">Explore</Link>
          </li>
          <li>
            <Link to="/create">Create</Link>
          </li>
          <li>
            <Link to="/mine">Mine</Link>
          </li>
          <li>
            <Link to="/logout">Logout</Link>
          </li>
          <li>
            <button onClick={logout}>
              Log out
            </button>
          </li>


        </ul>
      </nav>

      <Outlet />
    </>
  )
};

export default Navbar;