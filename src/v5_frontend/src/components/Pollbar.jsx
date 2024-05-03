import React from 'react';
import { Link, Outlet } from 'react-router-dom';

function Pollbar() {
  return (
    <div>
      <h2>Poll Options</h2>
      <nav>
        <ul>
          <li>
            <Link to="">Group Availability</Link>
          </li>
          <li>
            <Link to="vote">Your Availability</Link>
          </li>
        </ul>
      </nav>
      <Outlet />

    </div>
  );
}

export default Pollbar;
