import React, { useEffect } from 'react';
import { logout } from '../utils/auth';

function Logout() {
  useEffect(() => {

    logout();
  })
  
  
  return (
    <div>
      <h2>Logout Page</h2>
      <button onClick={logout}>Log out</button>
    </div>
  );
}

export default Logout;

