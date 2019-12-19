const localStrategy = require('passport-local').Strategy;

const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');
const DATABASE = 'exceldata';
