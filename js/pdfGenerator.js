PDFDocument = require 'pdfkit'
doc = new PDFDocument

function pdfGenerator(numberOfTeams, numberOfLocations, combinations) {
  this.numberOfTeams = numberOfTeams;
  this.numberOfLocations = numberOfLocations;
  this.combinations = combinations;
  var combinationsLength = 10; //TODO

  function buildTeamSchedule(teamNumber) {
    var index ;
    for (index = 0; index < combinationsLength; index++) {

    }
  }
}

var test = new pdfGenerator(5,6);
console.log(test.numberOfTeams);
