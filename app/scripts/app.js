angular.module('myApp', ['ngRoute','cb.x2js', 'LocalStorageModule', 'isteven-multi-select','colorpicker.module'])
  .config(function($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/visualizer', {
      templateUrl: 'views/visualizer2.html',
      controller: 'VisualizerCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
  });
