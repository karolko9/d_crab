import React, { useEffect, useCallback, useState } from "react";
import { v5_backend } from 'declarations/v5_backend';
import { isAuthenticated, getPrincipalText, login, logout} from "./utils/auth";


function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [greeting, setGreeting] = useState('');
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
  
  

  function handleSubmit(event) {
    event.preventDefault();
    const name = event.target.elements.name.value;
    v5_backend.greet(name).then((greeting) => {
      setGreeting(greeting);
    });
    return false;
  }

  return (
    <main>
      {authenticated ? (
        <div>          
          <div>
            <div>authenticated={authenticated.toString()}</div>

            <div>principal={principal}</div>
            <button onClick={logout}>Log out</button>
          
          </div>
          <div>
            <form action="#" onSubmit={handleSubmit}>
              <label htmlFor="name">Enter your name: &nbsp;</label>
              <input id="name" alt="Name" type="text" />
              <button type="submit">Click Me!</button>
            </form>
            <section id="greeting">{greeting}</section>
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
