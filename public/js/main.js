$(document).ready(function() {

	var deadline = 'March 22 2017 00:00:00 GMT-04:00';
	initializeClock('clockdiv', deadline);

});

function getTimeRemaining(endtime) {
    var t = Date.parse(endtime) - Date.parse(new Date());
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };
}

function initializeClock(id, endtime) {
    var clock = document.getElementById(id);
    var daysSpan = clock.querySelector('.days');
    var hoursSpan = clock.querySelector('.hours');
    var minutesSpan = clock.querySelector('.minutes');
    var secondsSpan = clock.querySelector('.seconds');

    function updateClock() {
        var t = getTimeRemaining(endtime);

        daysSpan.innerHTML = t.days;
        hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
        minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
        secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

        if (t.total <= 0) {
            window.location = 'http://treasurehunt.cshub.ca/finish';
        }
    }

    updateClock();
    var timeinterval = setInterval(updateClock, 1000);
}

function CheckDate(){
    var today = new Date();
    if (today.getHours() <= 12 || today.getHours > 17){
        window.location = 'http://treasurehunt.cshub.ca/closed';
    }

}
//var deadline = new Date(Date.parse(new Date()) + 15 * 24 * 60 * 60 * 1000);
// EST: GMT-04:00 (Daylight Saving) | EST: GMT-04:00 (Default)
// var deadline = 'May 20 2016 18:00:00 GMT-04:00';
// initializeClock('clockdiv', deadline);