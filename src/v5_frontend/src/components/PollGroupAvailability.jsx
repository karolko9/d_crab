import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { v5_backend } from '../../../declarations/v5_backend';
// import { VotePoll } from '../../../declarations/v5_backend.did';


// import { VoteRecord } from "../../declarations/dvote_backend/dvote_backend.did";
// import { AuthContext } from "./components/AuthProvider";
// const Explore = () => {
//   const [votes, setVotes] = useState<VoteRecord[]>();
//   const { backendActor } = useContext(AuthContext);
//   useEffect(() => {
//     if(!backendActor) return;
//     (async () => {
//       const votes = await backendActor.getPublicVote();

//     })();
//   }, [backendActor]);


function PollGroupAvailability() {
  const { pollId } = useParams();
  const [selectedVoter, setSelectedVoter] = useState(null);

  const [pollName, setPollName] = useState('');
  const [authorPrincipal, setAuthorPrincipal] = useState('');
  const [voters, setVoters] = useState([]);
  const [votes, setVotes] = useState(Array.from({ length: 24 }, () => Array.from({ length: 7 }, () => [''])));

  useEffect(() => {
    async function fetchData() {
      try {
        const poll1 = await v5_backend.get_vote_poll_by_id(pollId);

        setPollName(poll1.poll_name);
        setAuthorPrincipal(poll1.author_principal);
        setVoters(poll1.voters);
        setVotes(poll1.votes);

      } catch (error) {
        console.error('Error fetching poll data:', error);
      }
    };
    fetchData();
  }, []); 


  const renderTable = () => {
    const getColor = (count) => {
      const maxCount = 10; // Maksymalna liczba, dla której będzie stosowany najciemniejszy kolor
      const minCount = 0; // Minimalna liczba, dla której będzie stosowany najjaśniejszy kolor
      const hue = 30; // Odcień koloru (w stopniach, 0-360)
      
      // Interpolacja liniowa między kolorami na podstawie liczby głosów
      const ratio = Math.min(1, Math.max((count - minCount) / (maxCount - minCount), 0));
      const color = `hsl(${hue}, 100%, ${100 - ratio * 50}%)`; // 50% - jasność bazowa
  
      return color;
    };

    return (
      <table>
        <thead>
          <tr>
            <th></th>
            {[...Array(7).keys()].map(dayIndex => (
              <th key={dayIndex}>Day {dayIndex + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(24).keys()].map(hourIndex => (
            <tr key={hourIndex}>
            <td>{hourIndex}:00</td>
            {[...Array(7).keys()].map((dayIndex) => {
              const count = votes[dayIndex]?.[hourIndex]?.length ?? "err";
              const isSelected = votes[dayIndex]?.[hourIndex]?.includes(selectedVoter);
              return (
                <td
                  key={`${hourIndex}-${dayIndex}`}
                  style={{ 
                    backgroundColor: getColor(count),
                    border: isSelected ? "2px solid black" : "none", 
                  }}
                >
                  {count}
                </td>
              );
            })}
          </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderVotersList = () => {
    return (
      <div>
        <h3>Voters:</h3>
        <ul>
          {voters.map(voter => (
          <li key={voter}>
          <button onClick={() => {
            if (selectedVoter === voter) {
              setSelectedVoter(null); 
            } else {
              setSelectedVoter(voter); 
            }
          }}>
            {voter}
          </button>
        </li>
          ))}
        </ul>
      </div>
    );
  };
  
  return (
    <div>
      <h2>Poll Group Availability</h2>
      <p>Poll ID: {pollId}</p>
      <p>Poll name: {pollName}</p>
      <p>Poll author: {authorPrincipal}</p>

      {renderTable()}
      {renderVotersList()}
    </div>
  );
}

export default PollGroupAvailability;



