// Prikaz rezultata anketa na klijentskoj strani
function displaySurveyResults(results) {
  const surveyResultsDiv = document.getElementById('surveyResults');
  surveyResultsDiv.innerHTML = '';

  results.forEach(survey => {
    const surveyDiv = document.createElement('div');
    const surveyQuestion = document.createElement('h2');
    surveyQuestion.textContent = survey.question;
    surveyDiv.appendChild(surveyQuestion);

    const totalAnswers = survey.totalAnswers; // Ukupan broj odgovora

    survey.options.forEach(option => {
      const optionResult = document.createElement('p');
      const answerCount = survey.answerCount[option] || 0; // Broj odgovora za trenutnu opciju

      const percentage = totalAnswers > 0 ? ((answerCount / totalAnswers) * 100).toFixed(2) : 0; // Izračun postotka
      optionResult.textContent = `${option} (${answerCount} odgovora, ${percentage}%)`;
      surveyDiv.appendChild(optionResult);
    });

    surveyResultsDiv.appendChild(surveyDiv);
  });
}

// Dohvat rezultata anketa s servera
fetch('/api/expired-surveys')
  .then(response => response.json())
  .then(data => {
    // Izračunaj ukupan broj odgovora za svaku anketu
    data.forEach(survey => {
      let totalAnswers = 0;
      Object.values(survey.answerCount).forEach(answerCount => {
        totalAnswers += answerCount;
      });
      survey.totalAnswers = totalAnswers;
    });

    displaySurveyResults(data);
  })
  .catch(error => console.error('Error:', error));
