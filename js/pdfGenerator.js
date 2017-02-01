function pdfGenerator(schedule) {
    // Create a document and pipes to a blob
    var doc = new PDFDocument();
    var stream = doc.pipe(blobStream());

    var i;
    var j;
    for (i = 0; i < schedule.length; i++) { // Iterates over all teams
      doc.fontSize(24);
      doc.text('Team '+(i+1).toString(), {
          align:'center',
          underline:true
      });
      doc.moveDown(2);
      doc.fontSize(14);
      for (j = 0; j < schedule[i].length; j++) {

        doc.moveDown(0.5);
        var startMinutes = schedule[i][j].startTime.getMinutes();
        var endMinutes = schedule[i][j].endTime.getMinutes();
        doc.text(schedule[i][j].startTime.getHours()+':'+(startMinutes.toString().length == 1 ? '0'+startMinutes : startMinutes)+'-'+schedule[i][j].endTime.getHours()+':'+(endMinutes.toString().length == 1 ? '0'+endMinutes : endMinutes), {
            align: 'center',
            underline:true
        })
        doc.moveDown(0.5);
        doc.text(schedule[i][j].spot.toString(), {
            align:'center'
        })

      }
      if (i < schedule.length-1)
        doc.addPage();
      }
    }

    // Display the document when it is done generating
    doc.end();
    stream.on('finish', function() {
        location.href = stream.toBlobURL('application/pdf');
    });
}
