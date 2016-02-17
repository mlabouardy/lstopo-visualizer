var webdriver = require('selenium-webdriver'),
    config = require('../config/config'),
    assert = require('assert'),
    mocha = require('mocha'),
	  proxy = require('selenium-webdriver/proxy');

var driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.firefox())
    .usingServer(config.SELENIUM_HOST)
    .build();

driver.get(config.APP_URL);
driver.getTitle().then(function(title){
  describe('App title', function(){
    it('Title must be equal', function(){
      assert.equal(title,'ltopo');
    });
  });
});
