
angular.module('myApp')
  .factory('jsonObj',function(){
        var json = {};

        json.setJson = function(obj){
            json = obj;
        };

        json.getJson = function(){
            return json;
        };

        return json;
});
