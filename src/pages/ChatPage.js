import React from 'react';
import Chat from '../components/Chat/Chat';

const ChatPage = ({currentLanguage}) => {
  return (
    <>
      <Chat currentLanguage={currentLanguage}/>
    </>
  );
};

export default ChatPage;
