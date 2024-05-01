import React, { useEffect, useCallback, useState } from "react";
import { v5_backend } from 'declarations/v5_backend';
import { isAuthenticated, getPrincipalText, login, logout, getIdentity, getIdentityText} from "./utils/auth";

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Explore from './components/Explore';
import Create from './components/Create';
import Logout from './components/Logout';
import Mine from './components/Mine';


function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState('');

  useEffect(async () => {
    const principal = await getPrincipalText();
    setPrincipal(principal);
  }, [setPrincipal]);


  
  useEffect(() => {
    const checkAuthentication = async () => {
      setAuthenticated(await isAuthenticated());
    };
    checkAuthentication();
  }, [setAuthenticated]);
  

  
  return (
    <main>

      {authenticated ? (
          <div>      
            {/* <div>
              <div>authenticated={authenticated.toString()}</div>
              <div>principal={principal}</div>
              <button onClick={logout}>Log out</button>
            </div> */}
            <div>
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<Navbar />}>
                          <Route index element={<Home />} />
                          <Route path="create" element={<Create />} />
                          <Route path="explore" element={<Explore />} />
                          <Route path="mine" element={<Mine />} />
                          <Route path="logout" element={<Logout />} />
                           {/* logout button */}
                        </Route>
                      </Routes>
                    </BrowserRouter>
            </div>
          </div>
      ) : (
        <div>      
          <div>not authenticated</div>
          <button onClick={login}>Log in</button>
        </div>
      )}

    </main>
  );
}

export default App;

