import React from 'react';

function Explore() {
  return (
    <div>
      <h2>Explore Page</h2>
      <p>Explore some content here.</p>
    </div>
  );
}

export default Explore;

// import React, { useEffect, useState } from "react";
// import { v5_backend } from 'declarations/v5_backend';

// function Explore() {
//   const [votePolls, setVotePolls] = useState([]);

//   useEffect(() => {
//     const fetchVotePolls = async () => {
//       try {
//         const allVotePolls = await v5_backend.get_all_vote_polls();
//         setVotePolls(allVotePolls);
//       } catch (error) {
//         console.error("Error fetching vote polls:", error);
//       }
//     };

//     fetchVotePolls();
//   }, []);

//   return (
//     <div>
//       <h2>Explore Vote Polls</h2>
//       <ul>
//         {votePolls.map((poll, index) => (
//           <li key={index}>
//             <p>Poll Name: {poll.poll_name}</p>
//             <p>Author: {poll.author_principal}</p>
//             {/* Dodaj więcej informacji o vote poll, jeśli jest to potrzebne */}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default Explore;
