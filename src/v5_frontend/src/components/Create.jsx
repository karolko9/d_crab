import React, { useState } from 'react';
import { v5_backend } from '../../../declarations/v5_backend';
import { getPrincipalText } from '../utils/auth';

function Create() {
  const [pollName, setPollName] = useState('');
  // const [isPublic, setIsPublic] = useState(false);

  const handleCreatePoll = async () => {
    try {
      const principal = await getPrincipalText(); // Pobierz principal asynchronicznie
      await v5_backend.create_vote_poll(principal, pollName, false);
      console.log('Vote poll created successfully');
      alert('Vote poll created successfully');
    } catch (error) {
      console.error('Error creating vote poll:', error);
      alert(error);
    }
  };

  return (
    <div>
      <p>Create a new vote poll here.</p>
      <label>
        Poll Name:
        <input
          type="text"
          value={pollName}
          onChange={(e) => setPollName(e.target.value)}
        />
      </label>
      {/* <label>
        Public:
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
      </label> */}
      <button onClick={handleCreatePoll}>Create Poll</button>
    </div>
  );
}

export default Create;
