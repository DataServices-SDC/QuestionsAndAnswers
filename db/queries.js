var promise = require('bluebird');

var options = {
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://localhost:3000/sdc';
var db = pgp(connectionString);

module.exports = {

  getAllQuestions: (id) => {
    return db.query(`
    SELECT
      questions.id AS question_id,
      questions.question_body,
      questions.date_written AS question_date,
      questions.asker_name,
      questions.helpful AS question_helpfulness,
      questions.reported,
      (
          SELECT json_agg(nested_answers)
          FROM (
            SELECT
              answers.id,
              answers.body AS body,
              answers.date_written AS date,
              answers.answerer_name,
              answers.helpful AS helpfulness,
              (
                  SELECT json_agg(nested_answers_photos)
                  FROM (
                      SELECT
                      answers_photos.*
                      FROM answers_photos
                      WHERE answers_photos.answer_id = answers.id
                  ) AS nested_answers_photos
              ) AS Photos
            FROM answers
            WHERE answers.question_id = questions.id
        ) As nested_answers
      ) As Answers
    FROM questions
    WHERE questions.product_id = ${id}
  `)
  },

  getAllAnswers: (id) => {
    return db.query(`
      SELECT
        answers.id AS answer_id,
        answers.body AS body,
        answers.date_written AS date,
        answers.answerer_name,
        answers.helpful AS helpfulness,
        answers.reported,
        (
            SELECT json_agg(nested_answers_photos)
            FROM (
                SELECT
                answers_photos.id,
                answers_photos.url
                FROM answers_photos
                WHERE answers_photos.answer_id = answers.id
            ) AS nested_answers_photos
        ) AS Photos
      FROM answers
      WHERE answers.question_id = ${id}
    `)
  },

  addQuestion: (data, id) => {
    var date = Date.now();
    var reported = 0
    var helpful = 0
    return db.query(`INSERT INTO questions(product_id, question_body, date_written, asker_name, asker_email, reported, helpful) VALUES (${id}, '${data.body}', '${date}', '${data.name}', '${data.email}', ${reported}, ${helpful})`)
  },

  addAnswer: (data, id) => {
    var date = Date.now();
    var reported = 0
    var helpful = 0
    return db.query(`INSERT INTO answers(question_id, body, date_written, answerer_name, answerer_email, reported, helpful) VALUES (${id}, '${data.body}', '${date}', '${data.name}', '${data.email}', ${reported}, ${helpful})`)
  },

  getLastIndex: () => {
    return db.query(
      `SELECT MAX(id) FROM answers`
    )
  },

  addPhotos: (data, id) => {
    console.log(data, id)
    return db.query(
      `INSERT INTO answers_photos(answer_id, url) VALUES (${id}, '${data.url}')`
    )
  },

  markQuestionHelpful: (id) => {
    return db.query(`
      UPDATE questions
      SET helpful = helpful + 1
      WHERE id = ${id};
    `)
  },

  markAnswerHelpful: (id) => {
    return db.query(`
      UPDATE answers
      SET helpful = helpful + 1
      WHERE id = ${id};
    `)
  },

  reportQuestion: (id) => {
    return db.query(`
      UPDATE questions
      SET reported = reported + 1
      WHERE id = ${id};
    `)
  },

  reportAnswer: (id) => {
    return db.query(`
      UPDATE answers
      SET reported = reported + 1
      WHERE id = ${id};
    `)
  }
};