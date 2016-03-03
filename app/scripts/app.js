angular.module('myApp', ['ngRoute','cb.x2js', 'LocalStorageModule', 'isteven-multi-select','colorpicker.module'])
  .config(function($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/visualizer', {
      templateUrl: 'views/visualizer.html',
      controller: 'VisualizerCtrl'
    }).when('/vis', {
            templateUrl: 'views/vis.html',
            controller: 'VisCtrl'
        })
    .otherwise({
      redirectTo: '/'
    });
  });
