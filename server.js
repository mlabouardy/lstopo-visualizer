var express=require('express'),
    logger=require('morgan'),
    path=require('path'),
    app=express();


app.use(logger('dev'));

app.use(express.static(path.join(__dirname,'app')));

app.listen(3000,function(){
  console.log('Server listening ...');
})
