const express = require('express');
const moment = require('moment-timezone');
const token = require('../config.js')
const db = require('../db/queries.js')
const app = express();

console.log(token.loader);

app.use(express.json());

// app.get('/loaderio-e1eba073e86e4680ca87ce6129815043', (req, res) => {
//   res.send('loaderio-e1eba073e86e4680ca87ce6129815043');
// })

app.get('/loaderio-b7d749c95ce60b3bb4baf56fecb62e66', (req, res) => {
  res.send('loaderio-b7d749c95ce60b3bb4baf56fecb62e66');
})

app.get(`/qa/:product_id/questions`, (req, res) => {
  db.getAllQuestions(req.params.product_id)
    .then((response) => {
      const data = [];
      response.map((question) => {
        const newAnswers = {}
        question.question_date = moment(Number(question.question_date)).utc().format()
        if (question.reported === 0) {
          question.reported = false;
          data.push(question)
        }
        if (question.answers) {
          question.answers.forEach(answer => {
            if (answer.photos === null) {
              answer.photos = [];
            }
            answer.date = moment(Number(answer.date)).utc().format()
            newAnswers[answer.id] = answer
          })
        }
        question.answers = newAnswers
      })
      res.send({
        "product_id": req.params.product_id,
        "results": data
      });
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
})

app.get('/qa/questions/:question_id/answers', (req, res) => {
  db.getAllAnswers(req.params.question_id)
    .then((response) => {
      const data = [];
      response.map((answer) => {
        answer.date = moment(Number(answer.date)).utc().format()
        if (answer.photos === null) {
          answer.photos = [];
        }
        if (answer.reported === 0) {
          delete answer.reported;
          data.push(answer);
        }
      })
      res.send({
        "question": req.params.question_id,
        "page": 0,
        "count": 5,
        "results": data
      });
      })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
})


app.post('/qa/:product_id/questions', (req, res) => {
  db.addQuestion(req.body, req.params.product_id)
    .then((response) => {
      console.log('You have added a question')
      res.sendStatus(201);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
})

app.post('/qa/questions/:question_id/answers', (req, res) => {
  db.addAnswer(req.body, req.params.question_id)
    .then((response) => {
      console.log('You have added a answer')
      return response
    })
    .then((response) => {
      db.getLastIndex()
        .then((response) => {
          return response
        })
        .then((response) => {
          db.addPhotos(req.body, response[0].max)
            .then((response) => {
              console.log('You have added photos')
              res.sendStatus(201);
            })
            .catch((error) => {
              console.log(error);
              res.sendStatus(500)
            })
        })
        .catch((error) => {
          console.log(error);
          res.sendStatus(500);
        })
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
})

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  db.markQuestionHelpful(req.params.question_id)
    .then((response) => {
      console.log('You have marked the question as helpful');
      res.sendStatus(204);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
})

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  db.markAnswerHelpful(req.params.answer_id)
    .then((response) => {
      console.log('You have marked the answer as helpful');
      res.sendStatus(204);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
})

app.put('/qa/questions/:question_id/report', (req, res) => {
  db.reportQuestion(req.params.question_id)
    .then((response) => {
      console.log('You have reported a question');
      res.sendStatus(204);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
})

app.put('/qa/answers/:answer_id/report', (req, res) => {
  db.reportAnswer(req.params.answer_id)
    .then((response) => {
      console.log('You have reported an answer');
      res.sendStatus(204);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(500);
    })
})


const port = 3001;
app.listen(port, () => {
  console.log(`You are on port: ${port}`)
})