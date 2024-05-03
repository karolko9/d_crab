import React, { useState, useEffect } from 'react';
import { v5_backend } from '../../../declarations/v5_backend';
import { Link } from 'react-router-dom';
import { getPrincipalText } from '../utils/auth';

function Mine() {
  const [votePolls, setVotePolls] = useState([]);

  useEffect(() => {
    async function fetchVotePolls() {
      try {
        const principal1 = await getPrincipalText();
        const polls = await v5_backend.get_vote_polls_names_and_ids_by_author(principal1);
        setVotePolls(polls);

      } catch (error) {
        console.error('Error fetching vote polls:', error);
      }
    }

    fetchVotePolls();
  }, []);

  return (
    <div>
      <div>
        <h2>My Vote Polls</h2>
        <ul>
          {votePolls.map((poll) => (
            <li key={poll[0]}> 
              <Link to={`/poll/${poll[0]}`}>{poll[1]}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Mine;
