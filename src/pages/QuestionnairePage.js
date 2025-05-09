import React from 'react';
import Questionnaire from '../components/Questionnaire/Questionnaire';

const QuestionnairePage = ({currentLanguage}) => {
  return (
    <>
      <Questionnaire currentLanguage={currentLanguage} />
    </>
  );
};

export default QuestionnairePage;
