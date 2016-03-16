var webdriver = require('selenium-webdriver'),
    config = require('../../config/config'),
    assert = require('assert'),
    fs=require('fs'),
    mocha = require('mocha'),
    until = webdriver.until,
    By = webdriver.By,
	  proxy = require('selenium-webdriver/proxy');


var driver = new webdriver.Builder()
                  .forBrowser('firefox')
                  .build();

fs.readdir(config.XML_DIR,function(err,files){
  files.forEach(function(file){
    var path=config.XML_DIR+"/"+file;
    console.time(file);
    driver.get(config.APP_URL);
    driver.findElement(By.xpath("//input[@type='file']")).sendKeys(path);
    driver.findElement(By.id('visualize')).click().then(function(){
      console.timeEnd(file);
    });
  });
});
