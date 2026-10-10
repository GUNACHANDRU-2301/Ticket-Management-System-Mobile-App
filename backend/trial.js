const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Trial server ok'));
app.listen(5001, () => console.log('Trial server on 5001'));
