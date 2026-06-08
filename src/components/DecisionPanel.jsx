import React, { useState } from 'react';

const DecisionPanel = ({ applicationId, onDecision }) => {
  const [notes, setNotes] = useState('');
  const maxChars = 500;

  const handleNotesChange = (e) => {
    if (e.target.value.length <= maxChars) {
      setNotes(e.target.value);
    }
  };

  const handleDecision = (decision) => {
    if (onDecision) {
      onDecision({
        applicationId,
        decision,
        notes,
      });
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        padding: '24px',
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ color: '#1B2A4A' }}>Decision Panel</h2>

      <textarea
        value={notes}
        onChange={handleNotesChange}
        placeholder="Enter analyst notes..."
        rows={5}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          resize: 'vertical',
          marginTop: '10px',
        }}
      />
       
      <div
        style={{
          textAlign: 'right',
          marginTop: '6px',
          color: '#666',
          fontSize: '12px',
        }}
      >
        {notes.length}/{maxChars}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
        }}
      >
        <button
          onClick={() => handleDecision('APPROVE')}
          style={{
            background: '#28a745',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          APPROVE
        </button>

        <button
          onClick={() => handleDecision('REVIEW')}
          style={{
            background: '#ffc107',
            color: '#000',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          REVIEW
        </button>

        <button
          onClick={() => handleDecision('REJECT')}
          style={{
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          REJECT
        </button>
      </div>
    </div>
  );
};

export default DecisionPanel;