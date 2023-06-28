# Survey App

This is a simple web application for creating surveys. It allows users to ask questions and define options for answers. Users can view existing surveys and vote for their preferred answers.

## Technologies

The application is built using the following technologies:

- Node.js for the server-side application
- Express.js for routing and handling requests
- MySQL database for storing users and surveys
- bcrypt library for password encryption
- HTML, CSS, and JavaScript for building the user interface

## Installation

1. Clone this repository to your computer.
2. Run the `npm install` command in the main directory to install all the necessary dependencies.
3. Create a MySQL database with the required tables. Set the database information in the `config.js` file.
4. Start the application using the `npm start` command.
5. Open your browser and access the application at `http://localhost:3000`.

## How to Use

1. Registration:
   - Access `http://localhost:3000/register` and fill out the registration form.
   - After successful registration, you will be redirected to the login page.

2. Login:
   - Access `http://localhost:3000/login` and enter your username and password.
   - After successful login, you will be redirected to the main page.

3. Creating a Survey:
   - On the main page, you can see the existing surveys.
   - Click the "Create Survey" button to open the form for creating a new survey.
   - Enter the question and the options for answers.
   - Click the "Create" button to save the survey.

4. Voting on a Survey:
   - On the main page, you can see all the available surveys.
   - Click on a survey's name to view its details.
   - Select your preferred answer and click the "Vote" button.
   - After voting, the results will be automatically updated.

## Contributions

Feel free to contribute to this project. If you find any issues, you can open an issue or submit a pull request with your solution.
