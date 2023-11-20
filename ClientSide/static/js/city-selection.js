//https://www.weatherapi.com/my/fields.aspx

let TargetCity="Melbourne"
let API_Address=`http://api.weatherapi.com/v1/forecast.json?key=3c38f31dc60e4f979ad114837231511&q=${TargetCity}&days=7&aqi=no&alerts=no`

//startUp function
fetch('/city-selection', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json', // Set the content type to JSON
  },
  body: JSON.stringify({ data: API_Address }), // Convert the string to JSON format
})
//Recieve data from Weather API via flask application
  .then(response => response.json())
  .then(data => {
    console.log('Response from Flask:', data)
    Change_current_info(data)
    Update_Hourly_Forecast(data)
    Update_Daily_Forecast(data)
  })
  .catch(error => {
    console.error('Error:', error);
  })

function performSearch(event) {
  if(event.key=="Enter"){
    TargetCity=document.getElementById("search-input").value.replace(/ /g, '%20');
    API_Address=`http://api.weatherapi.com/v1/forecast.json?key=3c38f31dc60e4f979ad114837231511&q=${TargetCity}&days=7&aqi=no&alerts=no`
    document.getElementById("search-input").value=''


    //Send API_Address to Flask
    fetch('/city-selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set the content type to JSON
        },
        body: JSON.stringify({ data: API_Address }), // Convert the string to JSON format
      })
      //Recieve data from Weather API via flask application
        .then(response => response.json())
        .then(data => {
          console.log('Response from Flask:', data)
          Change_current_info(data)
          Update_Hourly_Forecast(data)
          Update_Daily_Forecast(data)
        })
        .catch(error => {
          console.error('Error:', error);
        })
    }
  }

  document.addEventListener("keydown", performSearch);

function GetImage(forecast){
  Image=""
  
  if (forecast["totalprecip_mm"]>0)
  {
    Image+='rainy-'
  }
  else{
    if(forecast["condition"]["text"]=='Partly cloudy')
    {
      Image+='cloudy-'
    }
  }

  if(forecast["is_day"]==0)
  {
    Image+='night'
  }
  else{
    Image+='day'
  }

  Image+='.png'
  return Image
}

function Change_current_info(data){
  //Get elements
  CityName=document.getElementById("City_Name")
  RainChance=document.getElementById("rain_chance")
  Temp=document.getElementById("CurrentTemp")
  Icon=document.getElementById("CurrentIcon")
  //Assign values
  CityName.innerHTML=data.location.name
  RainChance.innerHTML=data["forecast"]["forecastday"]["0"]["day"]["daily_chance_of_rain"]+"% Chance of Rain"
  Temp.innerHTML=data["current"]["temp_c"]+"°C"
  
  Icon.src=window.location.href+'/static/imgs/'+ GetImage(data["forecast"]["forecastday"]["0"]["day"])

  //Update Background colour
  localtime=convertTo12HourFormat(data['location']['localtime'].split(" ").pop())
  console.log(localtime)
  document.body.style.backgroundColor=nightSkyColour[getTimeInterval(localtime).split(' ')[0]]
}

function convertTo12HourFormat(time24hr) {
  // Parse the input time string
  var timeArray = time24hr.split(':');
  var hours = parseInt(timeArray[0], 10);
  var minutes = parseInt(timeArray[1], 10);

  // Determine AM/PM
  var period = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  hours = hours % 12 || 12;

  // Add leading zero to minutes if needed
  minutes = minutes < 10 ? '0' + minutes : minutes;

  // Form the 12-hour time string
  var time12hr = hours + ':' + minutes + ' ' + period;

  return time12hr;
}



function Update_Hourly_Forecast(data){
  today=data["forecast"]["forecastday"]["0"]["hour"]
  //Get elements
  hourlyForecasts=document.getElementsByClassName("Hourly_Forecast")

  j=0

  for(i=0;i<hourlyForecasts.length;i++){

    hourlyForecasts[i].childNodes[1].innerHTML=convertTo12HourFormat(today[j.toString()]["time"].split(" ").pop()+"00")
    hourlyForecasts[i].childNodes[5].innerHTML=today[j.toString()]["precip_mm"]+today[(j+1).toString()]["precip_mm"]+" mm"
    hourlyForecasts[i].childNodes[7].innerHTML=Math.round((today[j.toString()]["temp_c"]+today[(j+1).toString()]["temp_c"]/2))+"°C"

    hourlyForecasts[i].childNodes[3].src=window.location.href+'/static/imgs/'+ GetImage(today[j+1])
    

    j+=2
  }
}

function getDayOfWeek(dateString) {
  var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Create a new Date object from the input string
  var date = new Date(dateString);

  // Use getDay() to get the day of the week as a number
  var dayOfWeekNumber = date.getDay();

  // Use the number to get the corresponding day of the week from the array
  var dayOfWeek = daysOfWeek[dayOfWeekNumber];

  return dayOfWeek;
}

function Update_Daily_Forecast(data){
  week=data["forecast"]["forecastday"]

  dailyForecasts=document.getElementsByClassName("daily_forecast")

  for(i=0;i<7;i++){
    dailyForecasts[i].childNodes[1].innerHTML=getDayOfWeek(week[i+1]["date"])
    dailyForecasts[i].childNodes[3].innerHTML=Math.round(week[i+1]["day"]["mintemp_c"])+"°C /"+Math.round(week[i+1]["day"]["avgtemp_c"])+"°C /"+Math.round(week[i+1]["day"]["maxtemp_c"])+"°C"
    dailyForecasts[i].childNodes[5].innerHTML=week[i+1]["day"]["totalprecip_mm"]+' mm'
    dailyForecasts[i].childNodes[7].src=window.location.href+'/static/imgs/'+ GetImage(week[i+1]["day"])
  }
}

nightSkyColour={'12AM':'#0B1326','2AM':'#1D243D','4AM':'#2A2F59','6AM':'#5F536F','8AM':'#4E5A85','10AM':'#565B8A','12PM':'#4D507D','2PM':'#975E70','4PM':'#48394E','6PM':'#101932','8PM':'#0B1324','10PM':'#0B1326'}

function getTimeInterval(time12hr) {
  // Convert the 12-hour time to a 24-hour time format
  var date = new Date("2000-01-01 " + time12hr);
  var hours24hr = date.getHours();

  // Define time intervals and their corresponding labels
  var timeIntervals = [
      { start: 0, end: 2, label: "12AM - 2AM" },
      { start: 2, end: 4, label: "2AM - 4AM" },
      { start: 4, end: 6, label: "4AM - 6AM" },
      { start: 6, end: 8, label: "6AM - 8AM" },
      { start: 8, end: 10, label: "8AM - 10AM" },
      { start: 10, end: 12, label: "10AM - 12PM" },
      { start: 12, end: 14, label: "12PM - 2PM" },
      { start: 14, end: 16, label: "2PM - 4PM" },
      { start: 16, end: 18, label: "4PM - 6PM" },
      { start: 18, end: 20, label: "6PM - 8PM" },
      { start: 20, end: 22, label: "8PM - 10PM" },
      { start: 22, end: 24, label: "10PM - 12AM" }
  ];

  // Find the matching time interval
  for (var i = 0; i < timeIntervals.length; i++) {
      if (hours24hr >= timeIntervals[i].start && hours24hr < timeIntervals[i].end) {
          return timeIntervals[i].label;
      }
  }

  // If the input is not within any defined interval
  return "Invalid time";
}

