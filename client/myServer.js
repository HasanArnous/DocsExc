var express = require('express');
var app = express();
var url = require('url');
var fs = require('fs');
var cors = require('cors');
var path = require('path')


const appJS = path.join(__dirname, 'src', 'App.js');

const dotenv = require("dotenv")
dotenv.config();

const port = process.env.SERVER_PORT;
const upload_dir = process.env.UPLOAD_DIR;



app.use(cors());

var originalJSON;

app.get(('/'), (req,res)=>{
    try{
        res.end("t(-_-t)")
    }
    catch(error){
        console.log(error);
    }
})

app.get(('/dateTime'), (req, res) =>{
    try {
        console.log("Enter to Date Time post");
        const { url, headers, method } = req;
        var d = new Date();
        var uploadTime = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            res.writeHead(200, {
                'Content-Type': 'application/json'
              });
            res.write(JSON.stringify(uploadTime));
            res.end();
        });
        req.on('error', (err)=>{
            console.error(err.stack);
        });
    }
    catch(err){
        console.log(err);
    }
})

app.post('/upload', (req, res) => {
    try {
        var q = url.parse(req.url, url).query;
        var filename = req.headers.filename;
        console.log("1.this is the fileName", filename);
        let body = [];

        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            console.log("2");
            originalJSON = JSON.parse(body);
            var d = new Date();
            var uploadTime = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
            originalJSON.uploadedAt = uploadTime;
            body = JSON.stringify(originalJSON);
            var fs = require('fs');
            if(!fs.existsSync('./'+upload_dir)){
                fs.mkdirSync('./'+upload_dir);
            }
            var to = "./"+upload_dir+"/" + originalJSON.to;
            let dirExist = false;

            if (fs.existsSync("./"+upload_dir+"/" + originalJSON.to)) {
                console.log('5.1. Directory exists!');
                dirExist = true;
            } else {
                console.log("5.2: enter to else");
                fs.mkdirSync("./"+upload_dir+"/" + originalJSON.to)
                console.log("Directory Created Successfully!");
                dirExist = true;
            }
            if (dirExist) {
                console.log("6. This is the file Path:", to + "/" + filename);
                fs.writeFile(to + "/" + filename, body, function (err) {
                    if (err) { throw err };
                    console.log('7. Saved!');
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end();
                });
            }
        });
        req.on('error', (err)=>{
            console.error(err.stack);
        });
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/file', (req, res)=>{
    try{
        console.log("Enter to the body of /file.....");
        const {url, headers, method } = req;
        let body = [];
        req.on('data', (chunck)=>{
            body.push(chunck);
        }).on('end', ()=>{
            console.log("finished reading the body...");
            body = Buffer.concat(body).toString();
            body = JSON.parse(body);
            const account = body.account;
            const fileName = body.fileName+".json";
            console.log("account:  ", account);
            console.log("fileName:  ", fileName);
            if(fs.existsSync("./"+upload_dir+"/"+account)){
                console.log(" Account directory Exist");
                if(fs.existsSync("./"+upload_dir+"/"+account+"/"+fileName)){
                    console.log("File is exists");
                    const file = fs.readFileSync("./"+upload_dir+"/"+account+"/"+fileName)
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.write(file);
                    res.end();
                }
                else{
                    res.writeHead(404, { 'Content-Type': 'text/html' }); 
                    res.end("File Not Found");
                }
            }
            else{
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end("File Not Found");
            }
        })
    }
    catch(error){
        console.log(error);
    }
})

app.post('/newAccount', (req, res)=>{
    try{
        const{headers, url, method} = req;
        let body = [];
        req.on('data', chunk =>{
            body.push(chunk);
        }).on('end',()=>{
            body = Buffer.concat(body).toString();
            body = JSON.parse(body);
            const account = body.account;
            if(!fs.existsSync('./'+upload_dir)){
                fs.mkdirSync('./'+upload_dir);
            }
            if (!fs.existsSync('./'+upload_dir+'/' + account)) {
                fs.mkdirSync('./'+upload_dir+'/' + account);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write("Directory Created Successfully for the account: '" + account + "'  !");
                console.log("Directory Created Successfully for the account: '" + account + "' just before end the respond !");
                res.end();
            }
        })
    }
    catch(error){
        console.log(error);
    }
});
app.listen(port, () => {
    console.log("server running at port ", port);
});