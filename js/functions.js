function getSurveys() {
  fetch('/api/surveys')
    .then(response => response.json())
    .then(data => {
      const surveyList = document.getElementById('survey-list');
      surveyList.innerHTML = ''; // Clear previous content

      data.forEach(survey => {
        const surveyItem = document.createElement('li');
        surveyItem.classList.add('survey-item');

        const questionHeading = document.createElement('h2');
        questionHeading.classList.add('question-heading');
        questionHeading.innerText = survey.question;

        const optionsList = document.createElement('ul');
        optionsList.classList.add('options-list');

        JSON.parse(survey.options).forEach(option => {
          const optionItem = document.createElement('li');
          optionItem.classList.add('option-item');

          const radioBtn = document.createElement('input');
          radioBtn.type = 'radio';
          radioBtn.name = 'survey_' + survey.id;
          radioBtn.value = option;
          radioBtn.classList.add('option-radio');

          const label = document.createElement('label');
          label.innerText = option;

          optionItem.appendChild(radioBtn);
          optionItem.appendChild(label);

          optionsList.appendChild(optionItem);
        });

        const submitBtn = document.createElement('button');
        submitBtn.innerText = 'Submit Answer';
        submitBtn.classList.add('submit-btn');
        submitBtn.addEventListener('click', () => {
          const selectedOption = optionsList.querySelector('input[type="radio"]:checked');
          if (selectedOption) {
            const answer = selectedOption.value;
            saveSurveyAnswer(survey.id, answer, surveyItem);
          } else {
            const existingErrorText = surveyItem.querySelector('.error-text');
            if (!existingErrorText) {
              const errorText = document.createElement('p');
              errorText.innerText = 'You have not selected an answer.';
              errorText.classList.add('error-text');
              surveyItem.appendChild(errorText);
            }
          }
        });

        surveyItem.appendChild(questionHeading);
        surveyItem.appendChild(optionsList);
        surveyItem.appendChild(submitBtn);
        surveyList.appendChild(surveyItem);
      });
    })
    .catch(error => {
      console.error('Error fetching surveys:', error);
    });
}

function saveSurveyAnswer(surveyId, answer, surveyItem) {
  const data = {
    surveyId: surveyId,
    answer: answer
  };

  fetch('/api/save-answer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        console.log('Answer successfully saved.');
        // You can perform some action after the answer is saved, such as refreshing the page or displaying a success message.

        // Hide the question after submitting the answer
        surveyItem.style.display = 'none';
      } else {
        console.error('Error saving answer.');
        const existingErrorText = surveyItem.querySelector('.error-text');
        if (!existingErrorText) {
          const errorText = document.createElement('p');
          errorText.innerText = 'Error saving answer.';
          errorText.classList.add('error-text');
          surveyItem.appendChild(errorText);
        }
      }
    })
    .catch(error => {
      console.error('Error saving answer:', error);
      const existingErrorText = surveyItem.querySelector('.error-text');
      if (!existingErrorText) {
        const errorText = document.createElement('p');
        errorText.innerText = 'Error saving answer.';
        errorText.classList.add('error-text');
        surveyItem.appendChild(errorText);
      }
    });
}

// Call the getSurveys function when the page is loaded
document.addEventListener('DOMContentLoaded', getSurveys);
