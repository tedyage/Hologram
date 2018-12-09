'use strict'
var greet = require("./server");  //引入hello模块

var name = 'World';

//greet(name);  //Hello,World!
greet.greet(name);

greet.server();
