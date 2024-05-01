import React, { useEffect, useState } from 'react';
import { getPrincipalText, isAuthenticated } from '../utils/auth';

function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState('');

  useEffect(() => {
    const checkPrincipal = async () => {
      setPrincipal(await getPrincipalText());
    };
    checkPrincipal();
  }, [setPrincipal]);
  
  useEffect(() => {
    const checkAuthentication = async () => {
      setAuthenticated(await isAuthenticated());
    };
    checkAuthentication();
  }, [setAuthenticated]);
  


  return (
    <div>
      <h2>Home Page</h2>
      <div>
        <div>authenticated={authenticated.toString()}</div>
        <div>principal={principal}</div>
      </div>
    </div>
  );
}

export default Home;

