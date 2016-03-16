var webdriver = require('selenium-webdriver'),
    config = require('../../config/config'),
    assert = require('assert'),
    mocha = require('mocha'),
    until = webdriver.until,
    By = webdriver.By,
	  proxy = require('selenium-webdriver/proxy');

var driver = new webdriver.Builder()
                  .forBrowser('firefox')
                  .build();

driver.get(config.APP_URL);
driver.findElement(By.xpath("//input[@type='file']")).sendKeys(config.XML_DIR+"/jolly.xml");
driver.findElement(By.id('visualize')).click();

driver.findElement(By.xpath("//input[@type='file']")).sendKeys(config.CONFIG_DIR+"/config.json");
driver.findElement(By.id('import')).click();

// Dummy code to prevent browser from closing until downloading is completed
driver.wait(until.titleIs('LSTopo'), 5000, "Download is completed !");
