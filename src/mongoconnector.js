//header files
const mongoose = require("mongoose");
const express = require("express");
const CryptoJS = require('crypto-js');
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer')
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.text({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
const cors = require('cors');
app.use(cors());
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploads)
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now)
    }
});
const upload = multer({ storage: storage });
const cryptkey = '1234567890123456'
const emailAddress = 'cs203freddierivenoreply@gmail.com'

var emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailAddress,
    pass: 'rnqs lorj xjln pskn'
  }
});

//connect to the database
mongoose.connect('mongodb+srv://Freddie-RIve:LGmw1XzE4hhnzgg7@project-management.h6h4c36.mongodb.net/?retryWrites=true&w=majority')
    .then(() => 
      console.log("Connection Succeeded"))
    .catch((err) => {
      console.log("Connection Error: " + err)
    });

//deprecated, left in case we need further testing
const test = mongoose.createConnection('mongodb+srv://Freddie-RIve:LGmw1XzE4hhnzgg7@project-management.h6h4c36.mongodb.net/test?retryWrites=true&w=majority');

const prod = mongoose.createConnection('mongodb+srv://Freddie-RIve:LGmw1XzE4hhnzgg7@project-management.h6h4c36.mongodb.net/prod?retryWrites=true&w=majority');
const backup = mongoose.createConnection('mongodb+srv://Freddie-RIve:LGmw1XzE4hhnzgg7@project-management.h6h4c36.mongodb.net/backup?retryWrites=true&w=majority');

const Account = prod.model('Account', require('./models/account.js'), 'Account');
const Log = prod.model('Log', require('./models/log.js'), 'Log');
const Task = prod.model('Task', require('./models/task.js'), 'Task');   
const Project = prod.model('Project', require('./models/project.js'), 'Project');

const LogBackup = backup.model('Log', require('./models/log.js'), 'Log');
const TaskBackup = backup.model('Task', require('./models/task.js'), 'Task');

var userPlaceholder = new Account();
var user = new Account();
var perm = 0;
var twofaCode = "0";
// replace with an actual project system, if you have the time
var project = "655a0ace246914f44324c6e4";

//gets an account based on its ID
app.get('/account', async (req, res) => {
  if (req.query.u && req.query.u != "{}") {
    var account = await findAccount(req.query.u, req.query.h);
    if (account != null) {
      account.password = null;
      perm = await checkPerm(account._id);
      console.log(`Perm: ${perm}`)

      if (perm) {
        userPlaceholder = account;
        
        let timestamp = new Date();

        twofaCode = `${randCode()} ${randCode()} ${randCode()}`

        var mailOptions = {
          from: emailAddress,
          to: account.email,
          subject: 'Verification Code',
          html: `Hi ${CryptoJS.AES.decrypt(userPlaceholder.username, cryptkey).toString(CryptoJS.enc.Utf8)},

          We have received a login attempt at ${timestamp.getHours()}:${timestamp.getMinutes()}
          
          If this was you, please enter the code <h1> ${twofaCode} </h1> into the application to confirm your login.
          
          If not, we recommend you reset your password ASAP
          
          Please do not reply to this email`
        };
        
        emailTransporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

        res.send("1");
      } else {
        user = account;
            
        //logging action
        postLog(null, 'Logged In');
        
        res.send(user);
      }
    } else {
      perm = 0;
      console.log('aa');
      res.send("0");
    }
  } else if (req.query.id && req.query.id != "{}") {
    var account = await findAccountWithID(req.query.id);
    if (account) {
        res.send(account);
    } else {
      res.send('Error: Could not find account with ID');
    }
  } else {
    res.send("0");
  }
});

app.get('/logout', async (req, res) => {
  user = new Account();
  perm = 0;
  res.send("0");
});

app.get('/twofa', async (req, res) => {
  if (req.query.c.replace(/\s/g, '') == twofaCode.replace(/\s/g, '')) {
    user = userPlaceholder;
    perm = 1;
    res.send(user);
  } else {
    res.send("0")
  }
});
  
app.get('/task', async (req, res) => {
  if (req.query.id && req.query.id != "{}") {
    var task = await findTask(req.query.id);
    if (task) {
        console.log(task);
        res.send(task);
    } else {
      res.send("0");
    }
  }
  else {
    var task = await findTask();
    res.send("0");
  }
});

app.get('/usertasks', async (req, res) => {
  var tasks = await findUserTasks();
  let rtrn = [];
  for (task of tasks) {
    rtrn.push(task.id);
  }
  res.send(rtrn);
});

app.post('/task', async (req, res) => {
  let body = req.body;
  var newTask = new Task({
    _id: new mongoose.Types.ObjectId,
    name: body.name,
    description: body.description,
    state: body.state,
    startDate: body.startDate,
    endDate: body.endDate,
    users: [user]
  })

  //logging action
  postLog(newTask._id, 'Created');

  newTask.save();
  res.send('1');
})

app.patch('/task', async (req, res) => {
  let rtrn = await Task.findOneAndUpdate({"_id": req.body._id}, req.body);
  postLog(req.body._id, 'Updated');
  res.send(rtrn);
})

app.post('/account', async (req, res) => {
  console.log()
  var accTest = await checkAccount(req.body.c);
  if (accTest) {
    console.log("Name Taken");
    res.send('0');
  } else {
      var newAccount = new Account({
        _id: new mongoose.Types.ObjectId,
        username: req.body.n,
        password: req.body.h,
        email: req.body.e,
        usernameHash: req.body.c
      });

      //logging action
      postLog(null, 'Register');

      newAccount.save();
      res.send('1');
    }
});

app.get('/project', async (req, res) => {
  if (req.query.id && req.query.id != "{}") {
    var project = await findProject(req.query.id);
    if (project) {
      res.send(project);
    } else {
      res.send("0");
    }
  }
  else {
    var task = await findTask();
    res.send("0");
  }
});

app.get('/useraccount', async (req, res) => {
  if (user._id != null && user._id != undefined) {
    res.send("1");
  } else {
    res.send("0");
  }
});

//gets an account based on its ID
app.get('/user', async (req, res) => {
  res.send(user);
});

app.get('/uP', async (req, res) => {
  console.log(user._id);
  if (user._id != undefined) {
    console.log(perm);
    res.send(perm.toString());
  } else {
    res.send("0");
  }
});

app.get('/projectlogs',  async (req, res) => {
  var logs = await findProjectLogs();
  if (logs) {
    res.send(logs);
  } else {
    res.send("0");
  }
});

app.get('/projectusers', async (req, res) => {
  var users = await findProjectUsers();
  if (users) {
    for (let i = 0; i < users.length; i++) {
      let userPerm = await checkPerm (users[i]._id)
      users[i].perm = userPerm;
    }
    console.log(users);
    res.send(users);
  } else {
    res.send("0");
  }
});

app.post('/log', async (req, res) => {
  let body = JSON.parse(req.body);

  var newLog = new Log({
    _id: new mongoose.Types.ObjectId,
    user:  user._id,
    task: body.task,
    action: body.action
  });

  newLog.save();
  res.send(1);
});

app.get('/backup', async(req, res) => {
  if (true) {
    if (req.query.order == "Save") {
      let tasks = await Task.find();
      let logs = await Log.find();

      await TaskBackup.deleteMany({});
      await LogBackup.deleteMany({});

      for (let task of tasks) {
        let backupTask = new TaskBackup({
          _id: new mongoose.Types.ObjectId,
          name: task.name,
          description: task.description,
          startDate: task.startDate,
          endDate: task.endDate,
          state: task.state,
          users: task.users
        });

        backupTask.save();
      }

      for (let log of logs) {
        let backupLog = new LogBackup({
          _id: new mongoose.Types.ObjectId,
          user: log.user,
          task: log.task,
          action: log.action,
          createdAt: log.createdAt,
          updatedAt: log.updatedAt
        });

        backupLog.save();
      }
      res.send("1");
    } else if (req.query.order == "Load") {
      console.log('aa');
      let backupTasks = await TaskBackup.find();
      let backupLogs = await LogBackup.find();

      await Task.deleteMany({});
      await Log.deleteMany({});

      for (let backupTask of backupTasks) {
        let task = new Task({
          _id: new mongoose.Types.ObjectId,
          name: backupTask.name,
          description: backupTask.description,
          startDate: backupTask.startDate,
          endDate: backupTask.endDate,
          state: backupTask.state,
          users: backupTask.users
        });

        task.save();
      }

      for (let backupLog of backupLogs) {
        let log = new Log({
          _id: new mongoose.Types.ObjectId,
          user: backupLog.user,
          task: backupLog.task,
          action: backupLog.action,
          createdAt: backupLog.createdAt,
          updatedAt: backupLog.updatedAt
        });

        log.save();
      }

      res.send("1");
    }
  } else {
    res.send("0");
  }
})

app.listen(6069, () => {
  console.log("listening on port 6069");
});

function findAccount(uName, pHash) {
  return Account.findOne({usernameHash: uName, password: pHash})
  .exec()
  .then((accountResult) => {
    return (accountResult);
  })
  .catch((err) => {
    console.log('a');
    return ("Error: " + err);
  })
}

function findAccountWithID(id) {
  return Account.findOne({ "_id": id })
  .exec()
  .then((accountResult) => {
    return (accountResult);
  })
  .catch((err) => {
    return ("Error: " + err);
  })
}

function checkAccount(uName) {
  return Account.findOne({ usernameHash: uName })
  .exec()
  .then((accountResult) => {
    if (accountResult._id != null) {
      return true;
    } else {
      return false;
    }
  })
  .catch((err) => {
    return ("Error: " + err);
  })
}

function findAccountNoUname() { 
  return Account.findOne()
  .exec()
  .then((accountResult) => {
    return jsonToString(accountResult);
  })
  .catch((err) => {
    return ("Error: " + err);
  })
}

function findTask(id) { 
  //queries databse for task
  return Task.findOne(qObj(id))
  .exec()
  .then((taskResult) => {
    //if a task is returned, send  task to application
    if (taskResult != null) {
      return taskResult;
    } else {
      //otherwise, send a 0 to show that nothing was returned
      return "0";
    }
  })
  .catch((err) => {
    //if connection failed, return error message
    return ("Error: " + err);
  })
}

function findUserTasks() {
  return Task.find(qObj(0))
  .exec()
  .then((taskResult) => {
    return taskResult;
  })
  .catch((err) => {
    return ("Error: " + err);
  })
}

function findLog(id) {
  //queries database for log
  return Log.findOne(id)
  .exec()
  .then((logResult) => {
    //if a log is returned, send log to application
    if (logResult != null) {
      return logResult;
    } else {
      //otherwise, send a 0 to show that nothing was returned
      return "0";
    }
  })
  .catch((err) => {
    //if connection failed, return error message
    return ("Error: " + err);
  })
}

function findProjectLogs() {
  //queries database for logs
  return Log.find()
  .exec()
  .then((logResult) => {
    //if a logs are returned, send logs to application
    if (logResult != null) {
      return logResult;
    } else {
      //otherwise, send a 0 to show that nothing was returned
      return "0";
    }
  })
  .catch((err) => {
    //if connection failed, return error message
    return ("Error: " + err);
  })
}

function findProjectUsers() {
  let rtrn = [];
  return Account.find()
  .exec()
  .then((accountResult) => {
    if (accountResult != null) {
      for (let account of accountResult) {
        rtrn.push({
          _id: account._id,
          username: account.username,
        })
      }
      return rtrn;
    }
  })
  .catch((err) => {
    //if connection failed, return error message
    return ("Error: " + err);
  })
}

function postLog(task, action) {
  var newLog = new Log({
    _id: new mongoose.Types.ObjectId,
    user:  user._id,
    task: task,
    action: action
  });
  newLog.save();
}

function qObj (id) {
  let rtrn = {};
  if (id != 0) {
    rtrn["_id"] = id;
  }
  if (!perm) {
    rtrn["users"] = user._id;
  }
  return rtrn;
}

function checkPerm (id) {
  console.log({"_id": project, "admin": id});
  return Project.findOne({"_id": project, "admin": id})
  .exec()
  .then((projectResult) => {
    if (projectResult._id != null) {
      return 1;
    }
    return 0;
  })
  .catch((err) => {
    return 0;
  })
}

function randCode () {
  return (Math.round(Math.random()*1000)-1).toString().padStart(3, '0')
}