
angular.module('myApp')
  .factory('jsonObj',function(localStorageService){
        var json = {};

		json.setXmlFile = function(file){
			console.log("Factory setting xml file : " + file.toString());
		};
		
        json.setJson = function(obj){
            json = obj;
			localStorageService.set("json", json);
        };

        json.getJson = function(){
			json = localStorageService.get("json").topology.object.object;
			
			if ( typeof json == "undefined" )
				json = {};
			
            return json;
        };

        return json;
});
