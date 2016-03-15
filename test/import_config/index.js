var webdriver = require('selenium-webdriver'),
    config = require('../../config/config'),
    assert = require('assert'),
    mocha = require('mocha'),
    until = webdriver.until,
    By = webdriver.By,
    firefox = require('selenium-webdriver/firefox'),
	  proxy = require('selenium-webdriver/proxy');


var profile = new firefox.Profile();
profile.setPreference("browser.download.folderList",2);
profile.setPreference("browser.download.dir", config.DOWNLOAD_DIR);
profile.setPreference("browser.helperApps.neverAsk.saveToDisk","*/*");

var options = new firefox.Options().setProfile(profile);

var driver = new webdriver.Builder()
                  .forBrowser('firefox')
                  .setFirefoxOptions(options)
                  .build();

driver.get(config.APP_URL);
driver.findElement(By.xpath("//input[@type='file']")).sendKeys(config.XML_DIR+"/jolly.xml");
driver.findElement(By.id('visualize')).click();

driver.findElement(By.id('export')).click();

// Dummy code to prevent browser from closing until downloading is completed
driver.wait(until.titleIs('LSTopo'), 5000, "Download is completed !");
