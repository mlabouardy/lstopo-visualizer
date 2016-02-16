angular.module('myApp', ['ngRoute','cb.x2js', 'LocalStorageModule'])
  .config(function($routeProvider) {
    $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/visualizer', {
      templateUrl: 'views/visualizer.html',
      controller: 'VisualizerCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
  });
