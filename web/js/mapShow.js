var grower = new Array();
var growerStnData = [];
function MyCntrl($scope, $compile) {
	var STATION_NAME_URL = "http://fdacswx.fawn.ifas.ufl.edu/index.php/read/station/format/json";
	var GROWER_OBZ_URL ='http://fdacswx.fawn.ifas.ufl.edu/index.php/read/latestobz/format/json';
	//var GROWER_OBZ_URL = 'http://localhost:150/fdacs-data-collection/index.php/read/latestobz/format/json';
	var FAWN_STATION_URL = "http://fawn.ifas.ufl.edu/station/station.php?id=";
	var FAWN_OBZ_URL = 'http://fawn.ifas.ufl.edu/controller.php/latestmapjson/';
	var MADIS_OBZ_URL = 'http://fawn.ifas.ufl.edu/controller.php/nearbyNonFawn/all/';
	var USER_OBZ_URL = 'http://testfawngrowerprojectmobile.appspot.com/controller/user_observed_obzs';
	var fawnStnData = [];
	var madisStnData = [];
	var userStnData = [];
	var currentStationID;
	var graphchart;
	var seriesDataOption= [];
	var wetBulbTemper = [];
	var dryBulbTemper = [];
	var rainfall = [];
	var newTitle;
	var seriesName=[];
	var id = "weather data";
	var stationNameToId = [];
	var idToGrowerName = [];
	var remoteSensorList=[];
	var soilMoistureList=[];
	var stationName = [];
	var stationInstalledTime = [];
	var soil_moisture_field_list = [];
	var selectorButtonDict = {"4h" : 0, "12h" : 1, "24h" : 2, "3d" : 3, "7d" : 4}

	$scope.parameters=[ {
		id : "dry",
		label : "Dry Bulb Temperature"
	}, {
		id : "wet",
		label : "Wet Bulb Temperature"
	}, {
		id : "rain",
		label : "Rainfall"
	}];
	$scope.parameter = $scope.parameters[0];
	$.getJSON(STATION_NAME_URL, function(data) {
		if (!data) {
			alert("Current has no station");
		}
		else {
			var stnObj = data;
			for (var i = 0; i < stnObj.length; i++) {
				stationNameToId[stnObj[i].station_name] = stnObj[i].id;
				if(stnObj[i].hasRemote){
					remoteSensorList[stnObj[i].id]=stnObj[i].field_name;
				}
				if(stnObj[i].hasSoilMoisture){
					soilMoistureList[stnObj[i].id] = stnObj[i].field_name;
				}
				idToGrowerName[stnObj[i].id] = stnObj[i].grower_name;
				stationNameToId[stnObj[i].station_name] = stnObj[i].id;
				stationInstalledTime[stnObj[i].id] = stnObj[i].installed_date;
				var key = stnObj[i].grower_name;
				if (grower.hasOwnProperty(key)) {
					grower[key][grower[key].length] = stnObj[i].station_name;
				}
				else {
					var stationName = [];
					stationName[0] = stnObj[i].station_name;
					grower[key] = stationName;
				}
			}
			var keys = Object.keys(grower);
			keys.sort(function(a, b) {
				return (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0));
			});


			var growerName = $.cookie("name");
			var stationList = grower[growerName];

			$scope.stationOption = [];
			for (var i = 0; i < stationList.length; i++) {
				$scope.stationOption[i] = {
					"id" : stationNameToId[stationList[i]],
					"label" : stationList[i]
				};
			}
			$scope.station = $scope.stationOption[0];
			$scope.$apply();
			$scope.stationChange();
			displayWeatherInformation();
			//$('#station').children('option:first').remove();
			$.cookie("stationId",stationNameToId[stationList[0]],{ expires:7 });
			//$.cookie("staionLabel",stationList[0],{ expires:7 });
		}
	});

	$scope.stationChange = function() {
		$scope.parameter = $scope.parameters[0];
		displayWeatherInformation();
		fetchData();
	}
	$scope.parameterChange = function() {
		fetchData();
	}
	$scope.fieldCapacityChange = function(){
		//console.log(graphchart.series);
		//$scope.field_capacity = parseFloat($scope.field_capacity);
		if($scope.field_capacity && !isNaN($scope.field_capacity) && $scope.field_capacity >= 0 && $scope.field_capacity <= 100)
			fetchData();
		else
			$scope.field_capacity = null;
	}
	$scope.refillLineChange = function(){
		if($scope.refill_line && !isNaN($scope.refill_line) && $scope.refill_line>= 0 && $scope.refill_line <= 100)
			fetchData();
		else
			$scope.refill_line = null;

	}
	$scope.coldp = function(){
		var grower = $.cookie("name");
	/*	if (typeof($scope.station) == 'undefined') {
			station = $.cookie("staionLabel");
		}
		else {
			station = $scope.station.label;
		}  */
		coldp(grower, $scope.station.label);
	}
	$scope.freeze_alert = function(){
	/*	var station;
		if (typeof($scope.station) == 'undefined') {
			station = $.cookie("staionLabel");
		}
		else {
			station = $scope.station.label;
		}
		var stId;
		if (typeof($scope.station) == 'undefined') {
			stId = $.cookie("staionId");
		}
		else {
			stId = $scope.station.id;
		}  */
		freeze_alert($scope.station.label, $scope.station.id);
	}

	var fetchData = function() {

		var stId;
		if (typeof($scope.station) == 'undefined') {
			stId = $.cookie("stationId");
		}
		else {
			stId = $scope.station.id;
		}
		var url = 'http://fdacswx.fawn.ifas.ufl.edu/index.php/read/sevendaytimestamp/station_id/'
			+ stId + '/format/json/';
		$.getJSON(url, function(data) {
			if (data != null) {
				$("#noDataError").empty();
				var stnData = data;
				parseData(stnData);
			}
			else {
				$("#noDataError").html("<label> Current No Data<label>").css("color", "red");
				var stnData = [];
				parseData(stnData);
			}
			while(graphchart.series.length > 0) {
				graphchart.series[0].remove(true);
			}
			for (var i = 0; i < seriesDataOption.length; i++) {
				addSeries(newTitle, seriesName[i], seriesDataOption[i]);
			}
		});
	}
	var addSeries = function(newTitle, name,seriesData) {
		graphchart.setTitle({
			text : newTitle
		});
		var stnSeries = {
			name : name,
			data : seriesData,
			tooltip : {

				valueDecimals : 2
			},
			marker : {
				enabled : true,
				radius : 1
			}
		}

		graphchart.addSeries(stnSeries);
	}

	function remoteParams(dataType,stnData){

		var key_word;
		if(dataType == "rdry")
			key_word = "dry";
		else if(dataType == "rwet")
			key_word = "wet";
		var field_str=remoteSensorList[$scope.station.id];
		var field_list=field_str.split(",");
		newTitle = 'Graphic Weather Data (Temperature F)';
		seriesName = [];
		if(remoteSensorList.hasOwnProperty($scope.station.id)){
			for(var j=0;j<field_list.length;j++){
				if(field_list[j].indexOf(key_word) != -1){

					var series=[];
					var s = field_list[j];
					seriesName[seriesName.length] = initialUpperCase(s.split("_").join(" "));
					for ( var i = 0; i < stnData.length; i++) {
						// parse JSON style:{"obz_temp":"82","local_time":"2013-08-07
						// 17:00:00 EDT"} to highcart style: [1375902000000,82]
						var point = [];
						point[0] = stnData[i].date_time;// time stamp:
						// 1375902000000

						if (stnData[i][s] ===null) {
							point[1] = null;
						} else {
							point[1] = parseInt(stnData[i][s]);
						}
						series[i] = point;
					}
					seriesDataOption[seriesName.length - 1]=series;
				}
			}
		}
		//console.log(seriesName);

	}

	var isEmpty = function(obj){
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop))
				return false;
		}

		return true;
	}

	var parseData = function(stnData) {
		var dataType = $scope.parameter.id;

		if (isEmpty(graphchart.lbl) == false){

			graphchart.lbl.destroy();
		}

		if (dataType == "wet") {
			seriesDataOption=[];
			seriesName=[];
			newTitle = 'Graphic Weather Data (Temperature F)';
			seriesName[0] = "Wet Bulb Temperature";
			wetBulbTemper = [];
			for ( var i = 0; i < stnData.length; i++) {
				// parse JSON style:{"obz_temp":"82","local_time":"2013-08-07
				// 17:00:00 EDT"} to highcart style: [1375902000000,82]
				var temperPoint = [];
				temperPoint[0] = stnData[i].date_time;// time stamp:
				// 1375902000000
				if (stnData[i].wet_bulb_temp == null) {
					temperPoint[1] = null;
				} else {
					temperPoint[1] = parseInt(stnData[i].wet_bulb_temp);
				}
				wetBulbTemper[i] = temperPoint;
			}
			seriesDataOption[0] = wetBulbTemper;
		} else if (dataType == "dry") {
			seriesDataOption=[];
			seriesName=[];
			newTitle = 'Graphic Weather Data (Temperature F)';
			seriesName[0] = "Dry Bulb Temperature"
			dryBulbTemper = [];
			for ( var i = 0; i < stnData.length; i++) {

				// parse JSON style:{"obz_temp":"82","local_time":"2013-08-07
				// 17:00:00 EDT"} to highcart style: [1375902000000,82]
				var temperPoint = [];
				temperPoint[0] = stnData[i].date_time;
				if (stnData[i].dry_bulb_air_temp == null) {
					temperPoint[1] = null;
				} else {
					temperPoint[1] = parseInt(stnData[i].dry_bulb_air_temp);
				}
				dryBulbTemper[i] = temperPoint;
			}
			seriesDataOption[0] = dryBulbTemper;

		} else if(dataType == "rain"){
			newTitle = 'Graphic Weather Data (Rainfall inch)';
			seriesDataOption=[];
			seriesName=[];
			seriesName[0] = "Rainfall"
			rainfall = [];
			var total_rainfall = 0.0;
			// numbers: 16,48,96,288,672
			$scope.total_rainfall_array = [0.0,0.0,0.0,0.0,0.0];
			var rainfall_in_label;
			for (i = stnData.length - 1,j = 0,k = 0, l = 0, m = 0, n = 0; i >= 0; i--,j++,k++,l++,m++,n++) {
				// parse JSON style:{"obz_temp":"82","local_time":"2013-08-07
				// 17:00:00 EDT"} to highcart style: [1375902000000,82]
				var rainfallPoint = [];
				rainfallPoint[0] = stnData[i].date_time;
				if (stnData[i].rainfall == null) {
					rainfallPoint[1] = null;

				} else {
					value = parseFloat(stnData[i].rainfall);
					rainfallPoint[1] = value;
					total_rainfall += value;
					if(j < 16) $scope.total_rainfall_array[0] += value;
					if(k < 48) $scope.total_rainfall_array[1] += value;
					if(l < 96) $scope.total_rainfall_array[2] += value;
					if(m < 288) $scope.total_rainfall_array[3] += value;
					if(n < 672) $scope.total_rainfall_array[4] += value;

				}
				rainfall[i] = rainfallPoint;

			}
			seriesDataOption[0] = rainfall;
			if (typeof(graphchart.rangeSelector.selected) !== 'undefined' && graphchart.rangeSelector.selected !== null){
				//console.log(graphchart.rangeSelector.selected);
				rainfall_in_label = $scope.total_rainfall_array[graphchart.rangeSelector.selected].toFixed(2);
			}else{
				rainfall_in_label = total_rainfall.toFixed(2);
			}
			graphchart.lbl = graphchart.renderer.label("Total Rainfall: " + rainfall_in_label + " in",550,70).attr({
				padding: 5,
				r: 5,
				fill: 'rgba(0, 0, 0, 0.75)'
			}).css({
				color: 'white',
				fontSize: '14px'
			}).add();

		}else if(dataType == "soilmoisture" || dataType == "soilmoisturecitrus" || dataType == "soilmoisturepeaches"){

			newTitle = 'Graphic Weather Data(Soil Moisture percentage)';
			seriesDataOption = [];
			seriesName = [];
			var soil_moisture_field_list = [];
			var soil_field_str=soilMoistureList[$scope.station.id];
			var field_list = soil_field_str.split(',');
			if(dataType == "soilmoisture"){
				for(var i = 0; i < field_list.length; i++){
					if(field_list[i].indexOf("soil_moisture") != -1){
						soil_moisture_field_list.push(field_list[i]);
					}
				}
			}else if(dataType == "soilmoisturecitrus"){
				for(var i = 0; i < field_list.length; i++){
					if(field_list[i].indexOf("_citrus") != -1){
						soil_moisture_field_list.push(field_list[i]);
					}
				}

			}else{

				for(var i = 0; i < field_list.length; i++){
					if(field_list[i].indexOf("_peaches") != -1){
						soil_moisture_field_list.push(field_list[i]);
					}
				}

			}
			for(var j = 0; j < soil_moisture_field_list.length; j++){
				var series=[];
				var s = soil_moisture_field_list[j];
				seriesName[seriesName.length] = initialUpperCase(s.split("_").join(" "));

				for ( var i = 0; i < stnData.length; i++) {
					// parse JSON style:{"obz_temp":"82","local_time":"2013-08-07
					// 17:00:00 EDT"} to highcart style: [1375902000000,82]
					var point = [];
					point[0] = stnData[i].date_time;// time stamp:
					// 1375902000000

					if (stnData[i][s] ===null || isNaN(stnData[i][s])) {
						point[1] = null;
					} else {
						point[1] = parseFloat(stnData[i][s]);
						//console.log(point[1]);
					}

					series[i] = point;
				}
				seriesDataOption[seriesName.length - 1]=series;
			}
			if($scope.field_capacity && $scope.field_capacity <= 100){
				var field_capacity = []
				seriesName[seriesName.length] = "Field Capacity";
				for(var i = 0; i < stnData.length; i++){
					var point = [];
					point[0] = stnData[i].date_time;
					point[1] = parseInt($scope.field_capacity);
					field_capacity[i] = point;
				}
				seriesDataOption[seriesName.length - 1] = field_capacity;
			}
			if($scope.refill_line && $scope.refill_line <= 100){
				var refill_line = []
				seriesName[seriesName.length] = "Refill Line";
				for(var i = 0; i < stnData.length; i++){
					var point = [];
					point[0] = stnData[i].date_time;
					point[1] = parseInt($scope.refill_line);
					refill_line[i] = point;
				}
				seriesDataOption[seriesName.length - 1] = refill_line;
			}


		}else if(dataType == "tensiometer"){

			newTitle = 'Graphic Weather Data (Tensiometer kPa)';
			seriesDataOption=[];
			seriesName=[];
			seriesName[0] = "Tensiometer";
			tensiometer = [];
			for ( var i = 0; i < stnData.length; i++) {
				// parse JSON style:{"obz_temp":"82","local_time":"2013-08-07
				// 17:00:00 EDT"} to highcart style: [1375902000000,82]
				var tensiometerPoint = [];
				tensiometerPoint[0] = stnData[i].date_time;
				//console.log(stnData[i].tensiometer);
				if (stnData[i].tensiometer == null || isNaN(stnData[i].tensiometer)) {
					tensiometerPoint[1] = null;
				} else {
					tensiometerPoint[1] = parseFloat(stnData[i].tensiometer);
				}
				tensiometer[i] = tensiometerPoint;
			}
			seriesDataOption[0] = tensiometer;

		}else{

			remoteParams(dataType,stnData);
		}
	}
	function createStnObjs(stations, tag) {
		var time1 = new Date().getTime();
		var stnObjs = [];
		for ( var i = 0; i < stations.length; i++) {
			// we get rid of 2/3 madis stations
			// since the ie is slow
			/*
			 * if(tag == 2 && i%3 == 0){ continue; }
			 */

			stnObjs[stnObjs.length] = Station.createStnObj(stations[i], tag);
		}
		var time2 = new Date().getTime();
		// console.log("create: "+(time2-time1));
		return stnObjs;
	}

	var displayWeatherInformation = function() {

		var id = $scope.station.id;
		var growerStn = growerStnData;
		for ( var i = 0; i < growerStn.length; i++) {
			if (growerStn[i].stnID == id) {
				$scope.currentStation = growerStn[i];
				break;
			}
		}

		for ( var name in $scope.currentStation) {
			if ($scope.currentStation[name] === null
				|| $scope.currentStation[name] == '9999') {
				$scope.currentStation[name] = 'NA';
			}
		}
		var id = $scope.station.id;
		$.getJSON(GROWER_OBZ_URL,function(data) {
			var growerStn = data;
			for ( var i = 0; i < growerStn.length; i++) {
				if (growerStn[i].station_id == id) {
					$scope.currentStation = growerStn[i];
					break;
				}
			}
			for ( var name in $scope.currentStation) {
				if ($scope.currentStation[name] === null
					|| $scope.currentStation[name] == '9999') {
					$scope.currentStation[name] = 'NA';
				}
			}
			$scope.parameters=$scope.parameters.slice(0,3);
			$scope.$apply(function() {
				var infoStr = '<div id="fresh" ng-bind="fresh" style="width: 250px; word-break: normal;"></div><ul class="info">'
					+ '<li>Station Name: <span ng-bind="stnName"></span></li>'
					+ '<li>Station ID: <span ng-bind="stnID"></span></li>'
					+ '<li>Lat: <span ng-bind="stnLat"></span></li>'
					+ '<li>Lng: <span ng-bind="stnLng"></span></li>'
					+ '<li>Wind Direction: <span ng-bind="windDirection"></span> &deg</li>'
					+ '<li>Temperature: <span ng-bind="temperature"></span> &degF</li>'
					+ '<li>Cumm Rain*: <span ng-bind="totalRain"></span> in</li>'
					+ '<li>Wind Speed: <span ng-bind="windSpeed"></span> MPH</li>'
					+ '<li>Rainfall: <span ng-bind="rain"></span> in</li>'
					+ '<li>Wet Bulb Temp: <span ng-bind="wetBulbTemp"></span> &degF</li>'
					+ '<li>Humidity: <span ng-bind="humidity"></span> %</li>'

				if ($scope.currentStation.hasRemote) {
					//$scope.parameters[$scope.parameters.length]={
					//id : "rdry",
					//label : "Remote Dry Bulb Temperature"
					//};

					var fieldStr = $scope.currentStation.remote_field_name;
					var fieldList = fieldStr
						.split(",");
					for ( var i = 0; i < fieldList.length; i++) {
						if(fieldList[i] == 'dry_bulb_air_temp_rem1'){

							$scope.parameters[$scope.parameters.length]={
								id : "rdry",
								label : "Remote Dry Bulb Temperature"
							};
						}else if(fieldList[i] == 'wet_bulb_air_temp_rem1'){

							$scope.parameters[$scope.parameters.length]={
								id : "rwet",
								label : "Remote Wet Bulb Temperature"
							};

						}
						var infoStr = infoStr
							+ '<li>'
							+ initialUpperCase(fieldList[i].split("_").join(" "))
							+ ': <span ng-bind="'
							+ fieldList[i]
							+ '"></span> &degF</li>';
					}


				}
				if($scope.currentStation.hasSoilMoisture){
					var fieldStr = $scope.currentStation.soil_moisture_field_name;
					var fieldList = fieldStr.split(',');
					for (var i = 0; i < fieldList.length; i++){
						var infoStr = infoStr
							+ '<li>'
							+ initialUpperCase(fieldList[i].split('_').join(" "))
							+ ': <span ng-bind="'
							+ fieldList[i]
							+ '"></span>';

						if(fieldList[i] == "tensiometer")
							infoStr = infoStr + ' kPa</li>';
						else
							infoStr = infoStr + ' %</li>';
					}
					if(fieldStr.indexOf("soil_moisture_4_inches_citrus") != -1){

						$scope.parameters[$scope.parameters.length] = {
							id : "soilmoisturecitrus",
							label : "Soil Moisture Citrus"
						}
						$scope.parameters[$scope.parameters.length] = {
							id : "soilmoisturepeaches",
							label : "Soil Moisture Peaches"
						}

					}else{
						$scope.parameters[$scope.parameters.length] = {
							id : "soilmoisture",
							label : "Soil Moisture"
						}
					}
					if(fieldStr.indexOf("tensiometer") != -1){
						$scope.parameters[$scope.parameters.length] = {
							id : "tensiometer",
							label :"Tensiometer"
						}
					}
				}
				var infoStr = infoStr
					+ '<li>Date Time: <span ng-bind="dateTime"></span></li></ul><span ng-bind="legend"></span>';
				var $div = $(infoStr);
				$('#weatherInfo').empty();
				$compile($div)($scope).appendTo(
					$('#weatherInfo'));
				if ($scope.currentStation.fresh) {
					$scope.fresh = 'Current (updated every 15 min)';
					$("#fresh").css('color',
						'black');
				} else {
					$scope.fresh = 'This station has not been updated since '
						+ $scope.currentStation.date_time;
					$("#fresh").css('color', 'red');
				}
				$scope.stnID = $scope.currentStation.station_id;
				$scope.stnName = $scope.currentStation.station_name;
				$scope.stnLat = $scope.currentStation.latitude;
				$scope.stnLng = $scope.currentStation.longitude;
				$scope.windDirection = $scope.currentStation.wind_direction;
				$scope.humidity = $scope.currentStation.humidity
				$scope.wetBulbTemp = $scope.currentStation.wet_bulb_temp;
				$scope.rain = $scope.currentStation.rainfall;
				$scope.totalRain = Math
						.round(Number($scope.currentStation.total_rain_inche_since_installed) * 100) / 100
				$scope.temperature = $scope.currentStation.dry_bulb_air_temp;
				$scope.windSpeed = $scope.currentStation.wind_speed;
				if ($scope.currentStation.hasRemote) {
					var fieldStr = $scope.currentStation.remote_field_name;
					var fieldList = fieldStr
						.split(",");
					for ( var i = 0; i < fieldList.length; i++) {
						var s = fieldList[i];
						$scope[s] = $scope.currentStation[s];
					}
				}
				if($scope.currentStation.hasSoilMoisture){

					var fieldStr = $scope.currentStation.soil_moisture_field_name;
					var fieldList = fieldStr.split(",");
					for (var i = 0; i < fieldList.length; i++){
						var s = fieldList[i];
						$scope[s] = $scope.currentStation[s];
					}

				}
				$scope.dateTime = $scope.currentStation.date_time;
				var installedTime = stationInstalledTime[$scope.stnID];

				if (installedTime >= '2015-01-01') {
					$scope.legend = "*Since weather station installation"
				} else {
					$scope.legend = "*Since January 1 of this current year";
				}


			});

		});

	}
	$scope.intialChart = function() {
		Highcharts.setOptions({ // This is for all plots, change Date axis to
			// local timezone
			global : {
				useUTC : false
			}
		});
		// Create the chart
		graphchart = new Highcharts.StockChart({
			chart : {
				renderTo : 'container',
				defaultSeriesType : 'spline'

			},
			plotOptions : {
				spline : {
					gapSize : 0

				},
				series:{

					connectNulls: true
				}
			},
			rangeSelector : {
				buttons : [ {
					type : 'minute',
					count : 240,
					text : '4h'
				}, {
					type : 'day',
					count : 0.5,
					text : '12h'
				}, {
					type : 'day',
					count : 1,
					text : '24h'
				}, {
					type : 'day',
					count : 3,
					text : '3d'
				}, {
					type : 'day',
					count : 7,
					text : '7d'
				} ],

			},

			title : {
				text : 'Graphic Weather Data'
			},
			xAxis : {
				type : 'datetime',
				events: {
					// Click range selector
					setExtremes: function(e){

						if($scope.parameter.id == "rain"
							&& typeof(e.rangeSelectorButton)!== 'undefined'){

							if (isEmpty(graphchart.lbl) == false){
								//console.log(graphchart.lbl);
								graphchart.lbl.destroy();
							}
							var index = selectorButtonDict[e.rangeSelectorButton.text];
							graphchart.lbl = graphchart.renderer.label("Total Rainfall: " + $scope.total_rainfall_array[index].toFixed(2) + " in",550,70).attr({
								padding: 5,
								r: 5,
								fill: 'rgba(0, 0, 0, 0.75)',
							}).css({
								color: 'white',
								fontSize: '14px'
							}).add();
						}
					}

				}
			}

		});

	}
	$scope.intialChart();
	fetchData();
	//displayWeatherInformation();

}
function initialUpperCase(str){
	var reg = /\b(\w)|\s(\w)/g;
	str = str.toLowerCase();
	return str.replace(reg,function(word){return word.toUpperCase()});
}
function coldp(grower, station){

	console.log(grower);
	console.log(station);
	var COLD_PROTECTION_URL = 'http://fawn.ifas.ufl.edu/tools/coldp/cold_protection_2015.php';
	$.cookie('grower', grower,{expires : 7, path : "/"});
	$.cookie('station', station, {expires : 7, path : "/"});
	$.cookie('source', 'fdacs', {expires : 7, path : "/"});
	window.open(COLD_PROTECTION_URL);
}
function freeze_alert(station_name, station_id){

	var FREEZE_ALERT_URL = 'http://test.fawn.ifas.ufl.edu/tools/fdacs_freeze_alert/start.php';
	$.cookie('station_name', station_name, {expires: 7, path: "/"});
	$.cookie('station_id', station_id, {expires: 7, path: "/"});
	window.open(FREEZE_ALERT_URL);
}