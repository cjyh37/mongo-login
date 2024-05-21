var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Data = require('../models/data');
var Answer = require('../models/answer');
const path = require("path");
const multer = require("multer");
//const uuid = require("uuid").v4;
const { v4: uuid} = require("uuid");
const csv = require('csvtojson');  


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
	    //console.log("dest"+file)
        cb(null, './uploads/data/uploads');
    },
    filename: (req, file,cb) => {
	    //console.log("filename" + file)
        const ext = path.extname(file.originalname);
        const id = uuid();
        const filePath = `images/${id}${ext}`;
	    console.log("filepath:" + filePath)
        //File.create({filePath})
        //.then(() => {
            cb(null, filePath);
        //}, (err)=> {
        // console.log("catch errrr:" + err)
	//})
    }
});

const upload = multer({ storage: storage });
const static_path = path.join(__dirname, "./public" );
const static_path2 = path.join(__dirname, "./uploads" );

router.get('/', function (req, res, next) {
	if (req.session) {
		if ( req.session.username != null ) {
			// login user
			return res.render('loghome.ejs', {"name":req.session.username,"email":req.session.userId});
		}
	}
	return res.render('index.ejs');
});


router.post('/register', function(req, res, next) {
	console.log(req.body);
	var personInfo = req.body;


	if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({email:personInfo.email},function(err,data){
				if(!data){
					var c;
					User.findOne({},function(err,data){

						if (data) {
							console.log("if");
							c = data.unique_id + 1;
						}else{
							c=1;
						}

						var newPerson = new User({
							unique_id:c,
							email:personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save(function(err, Person){
							if(err)
								console.log(err);
							else
								console.log('Success');
						});

					}).sort({_id: -1}).limit(1);
					res.send({"Success":"You are regestered,You can login now."});
				}else{
					res.send({"Success":"Email is already used."});
				}

			});
		}else{
			res.send({"Success":"password is not matched"});
		}
	}
});

router.get('/login', function (req, res, next) {
	return res.render('login.ejs');
});

router.get('/register', function (req, res, next) {
	return res.render('register.ejs');
});

router.post('/login', function (req, res, next) {
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		if(data){
			
			if(data.password==req.body.password){
				//console.log("Done Login");
				req.session.userId = data.unique_id;
				req.session.username = data.username;
				//console.log(req.session.userId);
				res.send({"Success":"Success!"});
			        //res.render('loghome.ejs', {"name":data.username,"email":data.email});
				
			}else{
				res.send({"Success":"Wrong password!"});
			}
		}else{
			res.send({"Success":"This Email Is not regestered!"});
		}
	});
});

router.get('/profile', function (req, res, next) {
	console.log("profile");
	User.findOne({unique_id:req.session.userId},function(err,data){
		console.log("data");
		console.log(data);
		if(!data){
			res.redirect('/');
		}else{
			//console.log("found");
			return res.render('profile.ejs', {"name":data.username,"email":data.email});
		}
	});
});

router.get('/logout', function (req, res, next) {
	console.log("logout")
	if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
    	if (err) {
    		return next(err);
    	} else {
    		return res.redirect('/');
    	}
    });
}
});

router.get('/forgetpass', function (req, res, next) {
	res.render("forget.ejs");
});

router.post('/forgetpass', function (req, res, next) {
	//console.log('req.body');
	//console.log(req.body);
	User.findOne({email:req.body.email},function(err,data){
		console.log(data);
		if(!data){
			res.send({"Success":"This Email Is not regestered!"});
		}else{
			// res.send({"Success":"Success!"});
			if (req.body.password==req.body.passwordConf) {
			data.password=req.body.password;
			data.passwordConf=req.body.passwordConf;

			data.save(function(err, Person){
				if(err)
					console.log(err);
				else
					console.log('Success');
					res.send({"Success":"Password changed!"});
			});
		}else{
			res.send({"Success":"Password does not matched! Both Password should be same."});
		}
		}
	});
	
});

module.exports = router;
