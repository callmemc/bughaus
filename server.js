import express from 'express';
const app = express();
const server = require('http').createServer(app);

app.set('port', (process.env.PORT || 3001));

// TODO: Move into another file
app.post('/api/game', function (req, res) {
	console.log('TODO: create game');
  res.send();
});

const port = app.get('port');
server.listen(port, () => {
 	console.log('Example app listening on port ' + port);
});