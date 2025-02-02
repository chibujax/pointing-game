import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../../ui/Button';

interface AdminControlsProps {
  onReveal: () => void;
  onRestart: () => void;
  onEnd: () => void;
  onTitleChange: (title: string) => void;
  currentTitle?: string;
  votingInProgress: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
`;

const TitleInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

export const AdminControls = React.memo(({
  onReveal,
  onRestart,
  onEnd,
  onTitleChange,
  currentTitle = '',
  votingInProgress
}: AdminControlsProps) => {
  const [title, setTitle] = useState(currentTitle);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && title.trim()) {
      onTitleChange(title.trim());
    }
  };

  return (
    <Container>
      <TitleInput
        value={title}
        onChange={handleTitleChange}
        onKeyDown={handleTitleSubmit}
        placeholder="Enter vote title..."
      />

      <ButtonGroup>
        <Button
          variant="primary"
          onClick={onReveal}
          disabled={!votingInProgress}
        >
          Reveal Votes
        </Button>

        <Button
          variant="secondary"
          onClick={onRestart}
        >
          New Vote
        </Button>

        <Button
          variant="danger"
          onClick={onEnd}
        >
          End Session
        </Button>
      </ButtonGroup>
    </Container>
  );
});

AdminControls.displayName = 'AdminControls';