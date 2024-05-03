import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPrincipalText } from '../utils/auth';
import { v5_backend } from '../../../declarations/v5_backend';

function PollYourAvailability() {
  const [availability, setAvailability] = useState(Array(24).fill().map(() => Array(7).fill(false)));
  const [isLoading, setIsLoading] = useState(false);
  const { pollId } = useParams();

  const handleCellClick = (hourIndex, dayIndex) => {
    const updatedAvailability = [...availability]; 
    updatedAvailability[hourIndex][dayIndex] = !updatedAvailability[hourIndex][dayIndex]; 
    setAvailability(updatedAvailability);
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      console.log(availability);
      const principal = await getPrincipalText();
  
      const trueCellCoordinates = [];
      for (let i = 0; i < availability.length; i++) {
        for (let j = 0; j < availability[i].length; j++) {
          if (availability[i][j]) {
            trueCellCoordinates.push([i, j]);
          }
        }
      }
      await v5_backend.add_vote(principal, pollId, trueCellCoordinates);
      
      console.log('Vote added successfully');
      alert('Vote added successfully');

    } catch (error) {
      console.error('Error adding vote:', error);
      alert(error);
    }

    setIsLoading(false);
  };
  



  return (
    <div>
      <h2>Your Availability</h2>
      <form onSubmit={handleSubmit}>
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
                {[...Array(7).keys()].map(dayIndex => (
                  <td
                    key={`${hourIndex}-${dayIndex}`}
                    onClick={() => handleCellClick(hourIndex, dayIndex)}
                    style={{ 
                      cursor: 'pointer', 
                      backgroundColor: availability[hourIndex][dayIndex] ? 'green' : 'white',
                      border: '1px solid black' 
                    }}
                  ></td> 
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default PollYourAvailability;
