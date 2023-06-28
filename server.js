const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const connection = require('./db');

app.use(express.json());

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));

// Konfiguracija sesije
app.use(session({
  secret: 'tajna-sesije',
  resave: false,
  saveUninitialized: true
}));

app.use(express.urlencoded({ extended: false }));

// Postavljanje EJS kao šablona pregleda
app.set('view engine', 'ejs');

// Postavljanje putanje do 'views' foldera
app.set('views', path.join(__dirname, 'views'));



app.get('/', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik prijavljen, redirektuj na glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/index.html');
  } else {
    // Ako korisnik nije prijavljen, redirektuj na stranicu za prijavu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/registration.html');
  }
});

app.get('/registration.html', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik već prijavljen, redirektuj na glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/index.html');
  } else {
    // Ako korisnik nije prijavljen, prikaži stranicu za registraciju
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.sendFile(path.join(__dirname, 'registration.html'));
  }
});

app.get('/login.html', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik već prijavljen, redirektuj na glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/index.html');
  } else {
    // Ako korisnik nije prijavljen, prikaži stranicu za registraciju
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.sendFile(path.join(__dirname, 'login.html'));
  }
});

app.get('/index.html', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik prijavljen, prikaži glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.sendFile(path.join(__dirname, 'index.html'));
    
    
  } else {
    // Ako korisnik nije prijavljen, redirektuj na stranicu za prijavu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/registration.html');
  }
});

// Ostale rute i logika


app.post('/register', (req, res) => {
  const { username, password, confirm_password } = req.body;

  // Array za čuvanje svih grešaka
  const errors = [];

  // Check if the username is already taken
  const checkUsernameQuery = 'SELECT * FROM users WHERE username = ?';
  connection.query(checkUsernameQuery, [username], (error, results) => {
    if (error) {
      console.error('Error verifying username', error);
      errors.push('User registration error');
    } else {
      if (results.length > 0) {
        // Username already taken
        errors.push('Username already exists');
      }
    }

    // Validate password length
    if (password.length < 8) {
      errors.push('The password must contain at least 8 characters');
    }

    if (password !== confirm_password) {
      errors.push('Passwords do not match');
    }

    // Ako ima grešaka, prikazi ih na stranici
    if (errors.length > 0) {
      res.render('register', { errors });
    } else {
      // Hash the password and insert the user into the database
      const saltRounds = 10;
      bcrypt.genSalt(saltRounds, function(err, salt) {
        if (err) {
          console.error('Error', err);
          res.status(500).send('User registration error');
        } else {
          bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
              console.error('Password encryption error', err);
              res.status(500).send('User registration error');
            } else {
              const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
              const values = [username, hash];
              connection.query(insertUserQuery, values, (error, results) => {
                if (error) {
                  console.error('User registration error', error);
                  res.status(500).send('User registration error');
                } else {
                  // Set session values after successful registration
                  req.session.loggedIn = true;
                  req.session.username = username;
                  res.redirect('/index.html');
                }
              });
            }
          });
        }
      });
    }
  });
});



app.post('/logout', (req, res) => {
  // Destroy the session to logout the user
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out user', err);
      res.status(500).send('Error logging out user');
    } else {
      // Redirect to the registration page after logout
      res.redirect('/registration.html');
    }
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Retrieve the user from the database based on the provided username
  const query = 'SELECT * FROM users WHERE username = ?';
  connection.query(query, [username], (error, results) => {
    if (error) {
      console.error('User login error', error);
      const errorMessage = 'User login error';
      res.render('login', { error: errorMessage });
    } else {
      if (results.length === 0) {
        // User not found
        const errorMessage = 'Invalid username or password';
        res.render('login', { error: errorMessage });
      } else {
        const user = results[0];
        // Compare the provided password with the hashed password from the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            console.error('Error comparing passwords', err);
            const errorMessage = 'User login error';
            res.render('login', { error: errorMessage });
          } else {
            if (isMatch) {
              // Passwords match, set session values and redirect to the main page
              req.session.loggedIn = true;
              req.session.username = username;
              res.redirect('/index.html');
            } else {
              // Passwords do not match
              const errorMessage = 'Invalid username or password';
              res.render('login', { error: errorMessage });
            }
          }
        });
      }
    }
  });
});


app.get('/create-survey', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik prijavljen, prikaži glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.sendFile('create-survey.html', { root: __dirname });
  } else {
    // Ako korisnik nije prijavljen, redirektuj na stranicu za prijavu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/registration.html');
  }
});

app.post('/save-survey', (req, res) => {
  const { question, options } = req.body;

  const errors = [];

  if (!question || !options) {
    errors.push('Question and options cannot be empty.');
  }

  const optionsArray = options.split(',').map(option => option.trim());

  if (optionsArray.length < 2) {
    errors.push('You must enter at least two options.');
  }

  const hasEmptyOption = optionsArray.some(option => !option);
  if (hasEmptyOption) {
    errors.push('All options must contain characters.');
  }

  // Check if the survey already exists
  const checkSurveyExistsQuery = 'SELECT COUNT(*) AS count FROM surveys WHERE question = ? AND options = ?';
  const checkSurveyExistsValues = [question, JSON.stringify(optionsArray)];

  connection.query(checkSurveyExistsQuery, checkSurveyExistsValues, (err, result) => {
    if (err) {
      console.error('Error checking survey existence:', err);
      res.sendStatus(500);
    } else {
      const surveyExists = result[0].count > 0;

      if (surveyExists) {
        errors.push('A survey with the same question and options already exists.');
      }

      // Check if the offered options within the same survey match
      const hasDuplicateOptions = optionsArray.some((option, index) => optionsArray.indexOf(option) !== index);
      if (hasDuplicateOptions) {
        errors.push('The offered options within the same survey match.');
      }

      // If there are errors, render them on the page
      if (errors.length > 0) {
        res.render('survey', { errors });
      } else {
        // Add the new survey to the database
        const insertQuery = `INSERT INTO surveys (question, options) VALUES (?, ?)`;
        const values = [question, JSON.stringify(optionsArray)];

        connection.query(insertQuery, values, (err, insertResult) => {
          if (err) {
            console.error('Error saving survey:', err);
            res.sendStatus(500);
          } else {
            res.redirect('/index.html');
          }
        });
      }
    }
  });
});



// Definicija API endpointa za dohvaćanje anketa
app.get('/api/surveys', (req, res) => {
  const username = req.session.username; // Pretpostavljamo da imate korisničko ime u sesiji

  // Dohvaćanje anketa koje korisnik još nije odgovorio i koje nisu prošle 24 sata
  const getSurveysQuery = `
    SELECT s.id, s.question, s.options, s.timestamp
    FROM surveys s
    LEFT JOIN survey_answers sa ON s.id = sa.survey_id AND sa.username = ?
    WHERE sa.id IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM survey_answers sa2
        WHERE sa2.survey_id = s.id
          AND sa2.username = ?
      )
  `;
  const getSurveysValues = [username, username];

  connection.query(getSurveysQuery, getSurveysValues, (err, surveysResult) => {
    if (err) {
      console.error('Error fetching surveys:', err);
      res.sendStatus(500);
    } else {
      res.json(surveysResult);
    }
  });
});


app.get('/api/surveys/:surveyId', (req, res) => {
  const { surveyId } = req.params;
  const username = req.session.username; // Pretpostavljamo da imate korisničko ime u sesiji

  // Provjera je li korisnik već odgovorio na anketu
  const checkAnswerQuery = `SELECT id FROM survey_answers WHERE survey_id = ? AND username = ?`;
  const checkAnswerValues = [surveyId, username];

  connection.query(checkAnswerQuery, checkAnswerValues, (err, result) => {
    if (err) {
      console.error('Error checking survey answer:', err);
      res.sendStatus(500);
    } else {
      if (result.length > 0) {
        // Korisnik je već odgovorio na anketu, ne prikazuj pitanje
        res.sendStatus(204);
      } else {
        // Dohvaćanje pitanja ankete i slanje korisniku
        const getSurveyQuery = `SELECT id, question, options FROM surveys WHERE id = ?`;
        const getSurveyValues = [surveyId];

        connection.query(getSurveyQuery, getSurveyValues, (err, surveyResult) => {
          if (err) {
            console.error('Error fetching survey:', err);
            res.sendStatus(500);
          } else {
            if (surveyResult.length > 0) {
              const survey = surveyResult[0];
              res.json(survey);
            } else {
              res.sendStatus(404);
            }
          }
        });
      }
    }
  });
});

app.post('/api/save-answer', (req, res) => {
  const { surveyId, answer } = req.body;
  const username = req.session.username; // Pretpostavljamo da imate korisničko ime u sesiji

  if (!surveyId || !answer || !username) {
    return res.status(400).send('ID ankete, odgovor i korisničko ime su obavezni.');
  }

  // Provjera je li korisnik već odgovorio na anketu
  const checkAnswerQuery = `SELECT id FROM survey_answers WHERE survey_id = ? AND username = ?`;
  const checkAnswerValues = [surveyId, username];

  connection.query(checkAnswerQuery, checkAnswerValues, (err, result) => {
    if (err) {
      console.error('Error checking survey answer:', err);
      res.sendStatus(500);
    } else {
      if (result.length > 0) {
        // Korisnik je već odgovorio na anketu, ne sprema se ponovno
        res.sendStatus(200);
      } else {
        // Spremanje odgovora ankete
        const insertQuery = `INSERT INTO survey_answers (survey_id, username, answer) VALUES (?, ?, ?)`;
        const insertValues = [surveyId, username, answer];

        connection.query(insertQuery, insertValues, (err, saveResult) => {
          if (err) {
            console.error('Error saving survey answer:', err);
            res.sendStatus(500);
          } else {
            res.sendStatus(200);
          }
        });
      }
    }
  });
});

// Dohvat rezultata anketa
app.get('/api/expired-surveys', (req, res) => {
  const sql = `
    SELECT s.id, s.question, s.options, COUNT(CASE WHEN sa.answer IN (s.options) THEN 1 END) AS answer_count
    FROM surveys AS s
    LEFT JOIN survey_answers AS sa ON s.id = sa.survey_id
    GROUP BY s.id, s.options
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }

    // Konvertujemo string vrijednost za options u JSON objekat
    results.forEach(survey => {
      survey.options = JSON.parse(survey.options);
      survey.answerCount = {}; // Dodajemo objekt za pohranjivanje broja ponavljanja odgovora
    });

    // Dohvat podataka iz tablice survey_answers
    const surveyIds = results.map(survey => survey.id);
    const surveyIdsString = surveyIds.join(',');

    const answerCountSql = `
      SELECT survey_id, answer, COUNT(*) AS count
      FROM survey_answers
      WHERE survey_id IN (${surveyIdsString})
      GROUP BY survey_id, answer
    `;

    connection.query(answerCountSql, (err, answerCounts) => {
      if (err) {
        console.error('Error executing query: ', err);
        res.status(500).json({ error: 'Error executing query' });
        return;
      }

      // Inicijalizacija broja ponavljanja odgovora na 0 za sve opcije svake ankete
      results.forEach(survey => {
        survey.options.forEach(option => {
          survey.answerCount[option] = 0;
        });
      });

      // Povezivanje broja ponavljanja odgovora s rezultatima anketa
      answerCounts.forEach(answerCount => {
        const surveyId = answerCount.survey_id;
        const answer = answerCount.answer;
        const count = answerCount.count;

        const survey = results.find(survey => survey.id === surveyId);
        if (survey && survey.answerCount.hasOwnProperty(answer)) {
          survey.answerCount[answer] = count;
        }
      });

      // Vraćanje rezultata anketa kao JSON odgovor
      res.json(results);
    });
  });
});


app.get('/expired-surveys', (req, res) => {
    
  if (req.session.loggedIn) {
    // Ako je korisnik prijavljen, prikaži glavnu stranicu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.sendFile('expired-surveys.html', { root: __dirname });
  } else {
    // Ako korisnik nije prijavljen, redirektuj na stranicu za prijavu
    res.setHeader('Cache-Control', 'no-cache, no-store'); // Dodaj zaglavlje za sprječavanje keširanja stranica
    res.redirect('/registration.html');
  }
});


const port = 3000;
app.listen(port, () => {
  console.log(`The server is running on the port ${port}`);
});
