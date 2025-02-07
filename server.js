const jwt = require('jsonwebtoken');
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

// Your solution should be written here

const secret = 'mysecret'; //secret key should NOT be stored in code
var users = [
    { id: 1, username: "Artur", password: "12345" },
    { id: 2, username: "hello", password: "world" }
];

var scores = [
    {
        "level": "string",                  //*The level for which the high score is posted
        "userHandle": "string",             //*The user's handle associated with the high score
        "score": 0,                         //*The high score achieved by the user
        "timestamp": "2019-08-24T14:15:22Z" //*The timestamp when the high score was posted
    }
];

function httpBasicAuth(req, res, next) {//brakuje error 400
    username = req.body.userHandle;
    password = req.body.password;
	if(!username || !password || typeof username !== "string" || typeof password !== "string")
	{
		res.status(400).send('Invalid request body');
		return;
	}
    const user = users.find(u => u.username === username && u.password === password);
    if(user)
    {
        next();
        return;
    }
    else
    {
        res.status(401).send("Unauthorized, incorrect username or password");
        return;
    }
}


function jwt_auth(req, res, next) {//brakuje error 400
	const authField = req.get('Authorization');
	if(!authField)
	{
		console.log("No Authorization header");
		res.status(401).send('Unauthorized, JWT token is missing or invalid');
		return;
	}
	// console.log("AuthField: " + authField);
	if(authField.split(' ')[0] == "Bearer")
	{
		const token = authField.split(' ')[1];
		// console.log("Token: " + token);
		jwt.verify(token, secret, (err, decoded) => {
			if(err)
			{
				res.status(401).send('Unauthorized, JWT token is missing or invalid');
				return;
			}
			// console.log("Decoded: " + decoded);
			next();
			return;
		});
	}
	else
	{
		console.log("No Bearer");
		res.status(401).send('Unauthorized, JWT token is missing or invalid');
		return;
	}
}

app.post('/signup', (req, res) => {
    // const { username, password } = req.body;
    // res.send('Username: ' + username + ' Password: ' + password);
    username = req.body.userHandle;
    password = req.body.password;
	if(!username || !password)
	{
		res.status(400).send('Invalid request body');
		return;
	}

    if(username.length >= 6 && password.length >= 6 && username && password )
    {
        console.log('User created');
        users.push({ id: users.length + 1, username: username, password: password });
        res.status(201).send('User registered successfully');
        // console.log("Users: " + users);
    }
    else
    {
        res.status(400).send('Invalid request body'); //Username and password must be at least 6 characters long
    }
    // console.log('Username: ' + username.length + ' Password: ' + password.length);
    // res.send('Signup page');
  })

app.post('/login', httpBasicAuth, (req, res) => {
    // res.send('Login page');
    console.log('Login page');
	if (Object.keys(req.body).length !== 2) {
		res.status(400).send("Bad Request");
		return;
	  }
    username = req.body.userHandle;
    const token = jwt.sign({"username":username}, secret);
    res.json({
        jsonWebToken: token
    })
});

app.post('/high-scores', jwt_auth, (req, res) => {
    // console.log('High scores POST');
	// console.log("Body: " + req.body);
	level = req.body.level;
	userHandle = req.body.userHandle;
	score = req.body.score;
	timestamp = req.body.timestamp;
	if(!level || !userHandle || !score || !timestamp)
	{
		res.status(400).send('Invalid request body');
		return;
	}
    else
    {
        scores.push({ level: level, userHandle: userHandle, score: score, timestamp: timestamp});
        res.status(201).send('High score posted successfully');
        // console.log("Scores: " + scores);
    }
})

app.get('/high-scores', (req, res) => {
	const level = req.query.level;
	const score = scores.filter(s => s.level === level);
	let page = req.query.page;
	if(!page)
	{
		page = 1;
	}
	page_score = score.slice((page-1)*20, page*20);
	// page_score = score;
	// console.log("Score page nr: "+ page + " "+page_score);
	page_score.sort((a, b) => b.score - a.score);
	res.status(200).json(page_score);
})

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
