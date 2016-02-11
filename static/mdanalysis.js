var typeChart = dc.pieChart('#type-chart');
var countChart = dc.pieChart('#count-chart');

var timeChart = dc.lineChart('#time-chart');

//var mainLineChart = dc.pieChart('#main-line-chart');
//var lineChart = dc.pieChart('#line-chart');
//var typeChart = dc.pieChart('#type-chart');
//
//var incidentTable = dc.dataTable('.dc-data-table');
//var volumeChart = dc.barChart('#monthly-volume-chart');

d3.csv("/data/all_types_daily.csv", function(error, dat) {

  dat.forEach(function (d) {
      // Convert start date to date object
      d.date = new Date(d.date);
      d.month = d3.time.month(d.date);
      d.mean = parseFloat(d.mean);
      d.count = parseFloat(d.count);
      d.max = parseFloat(d.max);
      d.min = parseFloat(d.min);
  });

  // Define dimensions
  var f = crossfilter(dat),
      all = f.groupAll(),
      category = f.dimension(dc.pluck('type')),
      day = f.dimension(dc.pluck('date')),
      count = f.dimension(dc.pluck('count')),
      mean = f.dimension(dc.pluck('mean'));

  //
  // Utilities for average reduction
  //
  function reduceAddAvg(attr) {
    return function(p,v) {
      ++p.count
      p.sum += v[attr];
      p.avg = p.sum/p.count;
      return p;
    };
  }
  function reduceRemoveAvg(attr) {
    return function(p,v) {
      --p.count
      p.sum -= v[attr];
      p.avg = p.sum/p.count;
      return p;
    };
  }
  function reduceInitAvg() {
    return {count:0, sum:0, avg:0};
  }
  function roundNumber(number, digits) {
    var multiple = Math.pow(10, digits);
    var rndedNum = Math.round(number * multiple) / multiple;
    return rndedNum;
  }

  //
  // Define groups
  //
  var countByType = category.group().reduceSum(dc.pluck('count'));

  //var ratingByType = type.group().reduceSum(dc.pluck('mean'));
  var ratingByType = category.group().reduce(
          reduceAddAvg('mean'), 
          reduceRemoveAvg('mean'), 
          reduceInitAvg);

  var ratingByDay = day.group().reduce(
          reduceAddAvg('mean'), 
          reduceRemoveAvg('mean'), 
          reduceInitAvg);

  //
  // Define the charts
  //

  // Pie Chart
  typeChart
      .height(220)
      .width(220)
      .radius(100)
      .dimension(category)
      .group(ratingByType)
      .valueAccessor(function(p) { return p.value.avg; })
      .label(function (p) { return p.key +" (" + roundNumber(p.value.avg,2)+"/5)" ; })

  countChart
      .height(220)
      .width(220)
      .radius(100)
      .dimension(count)
      .label(function (p) { return p.key +" " + roundNumber(p.value,2) ; })
      .group(countByType)

  timeChart
      .height(220)
      .width(620)
      .dimension(day)
      .group(ratingByDay)
      .x(d3.time.scale().domain([new Date(2011, 0, 1), new Date(2015, 11, 31)]))
      .valueAccessor(function (p) { return p.value.avg; })

  dc.renderAll();

  return

  //shift = f.dimension(dc.pluck('shift')),
  //year = f.dimension(function(d) {return (new Date(d.start)).getFullYear()}),
  //mainLine = f.dimension(dc.pluck('main_line')),
  //line = f.dimension(dc.pluck('line')),
  //incidentType = f.dimension(dc.pluck('type')),
  //startDate = f.dimension(dc.pluck('start')),
  //startMonth = f.dimension(dc.pluck('month'));



  //var minStartDate = startDate.bottom(1)[0].start;
  //var maxStartDate = startDate.top(1)[0].start;

  //
  // Define groups
  //
  var ratingByType = type.group().reduceSum();

  var psdByShift = shift.group().reduce(
    function(p,v) { 
       if (isNaN(v.psd)) {return p}
       else {return p + parseFloat(v.psd)}
    },
    function(p,v) { 
       if (isNaN(v.psd)) {return p}
       else {return p - parseFloat(v.psd)}
    },
    function(p,v) { return 0 }
  );

  var psdByStartDate = startDate.group().reduceSum(function(d) {
    if (isNaN(d.psd)) { return 0 }
    else {return d.psd}
  });

  var psdByStartMonth = startMonth.group().reduceSum(function(d) {
    if (isNaN(d.psd)) { return 0 }
    else {return d.psd}
  });

  var psdByMainLine = mainLine.group().reduceSum(function(d) {
    if (isNaN(d.psd)) { return 0 }
    else {return d.psd}
  });

  var psdByLine = line.group().reduceSum(function(d) {
    if (isNaN(d.psd)) { return 0 }
    else {return d.psd}
  });

  var psdByIncidentType = incidentType.group().reduceSum(function(d) {
    if (isNaN(d.psd)) { return 0 }
    else {return d.psd}
  });

  //
  // Define the charts
  //

  // Pie Chart
  shiftChart
      .height(220)
      .width(220)
      .radius(100)
      .dimension(shift)
      .group(psdByShift);

  // Main Line Chart
  mainLineChart
      .height(220)
      .width(220)
      .radius(100)
      .dimension(mainLine)
      .group(psdByMainLine);

  // Line Chart
  lineChart
      .height(220)
      .width(220)
      .radius(100)
      .dimension(line)
      .group(psdByLine);

  // Type Chart
  typeChart
      .height(220)
      .width(220)
      .radius(100)
      .dimension(incidentType)
      .group(psdByIncidentType);

  // Table
  incidentTable 
      .dimension(startDate)
      .sortBy(function (d) {
            return d.start;
      })
      .group(function (d) {
                  var format = d3.format('02d');
                  return d.start.getFullYear() + '/' + format((d.start.getMonth() + 1));
              })
      .columns(['start', 'type','psd', 'shift'])

   // Volumne
   volumeChart.width(900)
        .height(70)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(startMonth)
        .xUnits(d3.time.months)
        .elasticY(true)
        .centerBar(true)
        .group(psdByStartMonth )
        //.x(d3.time.scale().domain([new Date(2009, 0, 1), new Date(2015, 8, 31)]))
        .x(d3.time.scale().domain([minStartDate, maxStartDate]))

  dc.renderAll();
});

