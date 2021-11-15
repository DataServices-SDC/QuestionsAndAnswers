const express = require('express');
const app = express();


app.get('/test', (req, res) => {
    res.send('you made it');
})


const port = 3000;
app.listen(port, () => {
  console.log(`You are on port: ${port}`)
})