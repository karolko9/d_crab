import React, { useEffect } from 'react';
import { logout } from '../utils/auth';
import { useNavigate } from "react-router-dom";


function Logout() {

  useEffect(() => {
    // const navigate = useNavigate();
    // navigate("/");
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

// import { useNavigate } from "react-router-dom"

// function Post() {
//     let navigate = useNavigate()

//     return (
//         <div>
//             <button onClick={() => navigate("./")}>Go Back One</button>
//             <button onClick={() => navigate("../")}>Go Back Two</button>
//         </div>
//     )
// }