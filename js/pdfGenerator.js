function pdfGenerator(schedule) {

    /// create a document and pipe to a blob
    var doc = new PDFDocument();
    var stream = doc.pipe(blobStream());

    //schedule[team][data] where data.startTime, data.endTime, data.spot

    // var data = {startTime:8,endTime:9,spot:1};
    // var data1 = {startTime:10,endTime:11,spot:2};
    // var data2 = {startTime:11,endTime:12,spot:3};
    //
    // var schedule = [
    //   [data,data1,data2]
    // ];

    console.log(schedule[0][0].startTime);

    var i;
    var j;
    for (i = 0; i < schedule.length; i++) { //iterate over all teams
      doc.fontSize(24);
      doc.text('Team '+(i+1).toString(), {
          align:'center',
          underline:true
      });
      doc.moveDown(2);
      doc.fontSize(16);
      for (j = 0; j < schedule[i].length; j++) {

        doc.text(schedule[i][j].startTime.toString()+'-'+schedule[i][j].endTime.toString()+' at location '+schedule[i][j].spot.toString(), {
            align: 'center'
        })
        doc.moveDown(0.5);
      }
        doc.addPage();
    }

    // end and display the document in the iframe to the right
    doc.end();
    stream.on('finish', function() {
        location.href = stream.toBlobURL('application/pdf');
    });
}
