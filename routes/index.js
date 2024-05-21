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

router.get('/data', function (req, res, next) {
	if (req.session) {
		if ( req.session.username != null ) {
			Data.find({}, (error, datas) => {
       	     	   	      //console.log("datas:" + datas);
       	     	   	      //console.log("datas:" + datas[0]);
       	     	   	      //console.log("datas:" + typeof datas);
			      //console.log("datas:" + JSON.stringify(datas)); 
			   return res.render('data.ejs', {username: req.session.username, "datas":datas});
			});
		}
	}
	else {
	     res.render("login.ejs");
	}
});

router.get('/data/:did', function (req, res, next) {
	if (req.session) {
		if ( req.session.username != null ) {
			Data.find({data_id:req.params.did}, (error, datas) => {
       	     	   	      console.log("data:" + datas);
			  Answer.find({ex_id:datas[0].ex_id}, (error, dataa) => {
       	     	   	      console.log("datas:" + dataa);
       	     	   	      //console.log("datas:" + datas[0]);
       	     	   	      //console.log("datas:" + typeof datas);
			      //console.log("datas:" + JSON.stringify(datas)); 
			   return res.render('data_did.ejs', {username: req.session.username, datas: datas, dataa:dataa});
			  });
			});
		}
	}
	else {
	     res.render("login.ejs");
	}
});


router.get('/data/add_data', (req, res )=>{
	let ct = (new Date(req.body.time)).getTime()
	console.log("add_data" + ct)
	if ( isNaN(ct) || ct == null || ct == undefined )
		ct = (new Date()).getTime()
	let mydata = []
	for ( let i=0 ; i<50 ; i++ ) mydata[i] = Math.round(Math.random(1));
	let data = new Data({
		data_id: ct,
		ex_id: 121212,
		//board_data: "1,0,1,0,1,0,1,1,0,0,1,1,0,1,1,0",
		board_data: mydata.toString(),
		points: 2*Math.round(Math.random()*50),
		comments: "Good~"
	});
//	let data = new Answer({
//		answer_id: ct,
//		ex_id: 121212,
//		//board_data: "1,0,1,0,1,0,1,1,0,0,1,1,0,1,1,0",
//		answer_data: mydata.toString(),
//		points: 2,
//		comments: "Good~"
//	});
	//console.log("add_data" + data);

	data.save(function(err, sdata){
		if ( err ) console.log('data save error : ' + err);
        });
        res.redirect('/data');
        res.end();
});

router.post('/data/add_data/:did', (req, res )=>{
	let ct = (new Date(req.body.time)).getTime()
	//console.log(ct)
	if ( isNaN(ct) || ct == null || ct == undefined )
		ct = (new Date()).getTime()
  const data = new Data({
    time : ct,
    data_id : req.body.board_data,
    ex_id : req.body.ex_data,
    board_data : req.body.board_data
  });
  db.collection(req.params.did).insertOne(data , ()=>{
    //console.log('저장완료' + req.body.time +":"+ req.body.temp);
  });
  res.redirect("/data/" + req.params.did);
  res.end();
});

router.post('/data/add_data_fromfile/:did',upload.single('csv'),(req, res )=>{
   let did = req.params.did
   //convert csvfile to jsonArray     
   csv({noheader:true,headers:['time','temp']}).fromFile(req.file.path).then((jsonObj)=>{  
      //console.log("req.file.path:" + req.file.path);  
      //console.log("req.file.path:" + JSON.stringify(req.file));  
      for(var x=0;x<jsonObj.length;x++){  
	 //console.log(jsonObj[x].time + ":" + jsonObj[x].temp)
	 jsonObj[x].time = parseInt(jsonObj[x].time)  
	 jsonObj[x].temp = parseFloat(jsonObj[x].temp)  
      } 

      db.collection(did).insertMany(jsonObj, (err, data)=>{
	if(err){  
		console.log(err);  
		res.write("Error in DB save");  
		return;
	}else{  
		//console.log("data:" + JSON.stringify(data)); 
       		db.collection(did).find().toArray( (err, data)=>{
       	         //console.log(did + ":" + data);
			//console.log("data:" + JSON.stringify(data)); 
   	    	}); 
	}  
      });

   });  
  res.redirect("/data/" + req.params.did);
  //res.end();
});  


module.exports = router;
