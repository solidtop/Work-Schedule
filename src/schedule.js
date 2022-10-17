import { Shift } from "./shift.js";
import {currencyFormat, timeFormat, timeFormat2, dateFormat} from "./index.js";

const MAX_SHIFTS_PER_DAY = 2;

const months = ['January', 'Febuary', 'March', 'April', 'May', 'June' ,'July', 'August', 'September', 'October', 'November', 'December'];
const today = new Date();
let selectedYear = today.getFullYear();
let selectedMonth = today.getMonth();

let shifts = new Array(31); //Create a 2d array to store shifts in (shifts[days][shifts])
for (let i = 0; i < 31; i++) {
    shifts[i] = [];
}
let jobs = [];

let test1 = 0;
let test2 = 1;

let selectedButton = null;
let selectedIndex1 = null;
let selectedIndex2 = null;

getJobs();
loadShifts();


document.querySelector('#button-add-shift').addEventListener('click', () => {
    openPopup();
});

document.querySelector('#button-create-job').addEventListener('click', () => {
    window.open('./job-create.html', '_self');
});


//#region Handle Popup windows events
document.querySelector('.popup-container').addEventListener('click', e => {
    if (e.target.id == 'button-close-popup') {
        closePopup();
    }
});

document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();

    const job = JSON.parse(document.querySelector('#job-select').value);
    const date = document.querySelector('#input-date').value;
    const fromTime= document.querySelector('#input-time-from').value;
    const toTime = document.querySelector('#input-time-to').value;
    const breakTime = document.querySelector('#input-break').value;

    const from = new Date(date + ' ' + fromTime);
    const to = new Date(date + ' ' + toTime);
    addShift(job, from, to, breakTime);
    
    closePopup();
})

//#endregion

//#region Handle switching months
document.querySelector('#button-month-previous').addEventListener('click', () => {
    if (selectedMonth > 0) {
        selectedMonth --;
    } else {
        selectedMonth = 11;
    }
    loadShifts();
    hideInfo();
});
document.querySelector('#button-month-next').addEventListener('click', () => {
    if (selectedMonth < 11) {
        selectedMonth ++;
    } else {
        selectedMonth = 0;
    }
    loadShifts();
    hideInfo();
});
//#endregion


//#region Handle Schedule buttons Events
document.querySelector('.shift-list').addEventListener('click', e => {
    if (e.target.name === 'button-shift') {
        const li = e.target.parentNode; //Get <li> item from clicked button
        const button = e.target;

        const index1 =  getIndexFromList(document.querySelectorAll('.active'), li); //Get array index of the li
        const index2 =  getIndexFromList(li.querySelectorAll('button'), button); //Get array index of item
        if (index1 !== -1) {
            if (!!selectedButton) {
                selectedButton.classList.remove('selected');  
            } 

            if (selectedButton !== button) {
                let shift = shifts[index1][index2];
                selectedIndex1 = index1;
                selectedIndex2 = index2; 
                selectedButton = button;
                selectedButton.classList.add('selected');
                showInfo(shift);
            } else {
                hideInfo();
            }
        }
    } else { //Click on empty schdule slots to open up New Shift menu
        const li = e.target; 
        const date = getIndexFromList(document.querySelectorAll('.active'), li);
        if (date !== -1 && jobs !== null)
            openPopup(new Date(selectedYear, selectedMonth, date + 1));  
    }
})
//#endregion

document.querySelector('.sidepanel.left').addEventListener('click', e => {
    if (e.target.id == 'button-close-panel') {
        hideInfo();
    } else if (e.target.id == 'button-delete') {
        deleteShift();
    }
}) 

function addShift(job, from, to, breakTime) {
    const shift = new Shift(job, from, to, breakTime);
    const day = from.getDate() - 1;
    
    if (shifts[day].length >= MAX_SHIFTS_PER_DAY) {
        return;
    }
    shifts[day].push(shift); //TODO: Fix adding to wrong month (visually)
    addShiftToDisplay(day, shift);
    updateTotals();
    saveShifts();
}
function deleteShift() {
    if (!selectedButton) return;

    selectedButton.remove();
    shifts[selectedIndex1].splice(selectedIndex2, 1);
    updateTotals();
    saveShifts();

    hideInfo();
}

function addShiftToDisplay(day, shift) {
    const li = document.querySelector('#item' + day);

    const button = document.createElement('button');
    button.name = 'button-shift';
    button.innerHTML = `<span>
        ${shift.job.nameOfJob} </span> </br>
        ${timeFormat.format(shift.fromDate)} - 
        ${timeFormat.format(shift.toDate)} </br>
        Total: ${shift.totalTime}
    `;
    li.appendChild(button);
}

function addSlotsToDisplay() {
    const daysInPreviousMonth = new Date(selectedYear, selectedMonth, 0).getDate(); 
    const daysInMonth = new Date(selectedYear, selectedMonth+1, 0).getDate(); 
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDay(); 
    
    let dayNumber = 1;
    let previosNumber = daysInPreviousMonth - firstDayOfMonth + 1;
    let nextNumber = 1;

    const ul = document.querySelector('.shift-list');
    for (let i = 0; i < 42; i++) { 
        const li = document.createElement('li');
        const label = document.createElement('label');
        
        if (i < firstDayOfMonth) {
            label.innerHTML = i + previosNumber; 
            li.classList.add('inactive');
        } else if (dayNumber <= daysInMonth) {
            li.id = 'item' + (dayNumber - 1);  
            label.innerHTML = dayNumber;
            dayNumber ++;
            li.classList.add('active');
        } else {
            label.innerHTML = nextNumber;    
            li.classList.add('inactive');
            nextNumber ++;
        }
        li.appendChild(label);
        ul.appendChild(li);
    }
}
function updateWeekNumbers() {
    const firstDayOfYear = new Date(selectedYear, 1, 1);
    let days, weekNumber;
    for (let i = 0; i < 6; i++) {
        days = Math.floor(new Date(selectedYear, selectedMonth+1, i * 7) - firstDayOfYear) / (24 * 60 * 60 * 1000);   
        weekNumber = Math.ceil(days / 7);
        if (weekNumber >= 53) weekNumber = 0;
        document.querySelector('#week' + (i+1)).innerHTML = weekNumber;
    }
}

function showInfo(shift) {
    const sidepanel = document.querySelector('.sidepanel'); 
    sidepanel.classList.remove('hide');

    //#region Apply Shift and Job info to display
    const job = shift.job;
    const salary = job.salary;
    document.querySelector('#job-name').innerHTML = job.nameOfJob;
    document.querySelector('#date').innerHTML = timeFormat2.format(shift.fromDate);
    document.querySelector('#time').innerHTML = timeFormat.format(shift.fromDate) + ' - ' + timeFormat.format(shift.toDate);
    document.querySelector('#break').innerHTML = 'Break: ' + shift.breakHours;
    
    document.querySelector('#net').innerHTML = 'Net: ' + currencyFormat.format(shift.net);
    document.querySelector('#gross').innerHTML = 'Gross: ' + currencyFormat.format(shift.gross);

    document.querySelector('#hourly-rate').innerHTML = 'Hourly Rate: ' + currencyFormat.format(salary.hourlyRate);
    
    //#endregion
}
function hideInfo() {
    const sidepanel = document.querySelector('.sidepanel');
    sidepanel.classList.add('hide');

    if (!!selectedButton) { 
        selectedButton.classList.remove('selected');  
    }
    selectedButton = null;
}
function openPopup(date = new Date(selectedYear, selectedMonth, 1)) {
    const popup = document.querySelector('.popup-container');
    popup.classList.remove('closed');

    document.querySelector('#input-date').value = dateFormat.format(date);

    document.querySelector('#button-add-shift').disabled = true;
}
function closePopup() {
    const popup = document.querySelector('.popup-container');
    popup.classList.add('closed');

    document.querySelector('#button-add-shift').disabled = false;
}


function reloadDisplay() {
    clearDisplay();

    addSlotsToDisplay();
    updateWeekNumbers();
    updateTotals();

    if (shifts) {
        for(let i = 0; i < 31; i++) {
            shifts[i].forEach(shift => {
                addShiftToDisplay(i, shift);
            });
        }
    }
    
    const dateDisplay = document.querySelector('#date-display');
    dateDisplay.innerHTML = months[selectedMonth] + ' ' + selectedYear;

    //Update current day slot
    if (selectedMonth === today.getMonth() && selectedYear === today.getFullYear()) {
        const item = document.querySelector('#item' + (today.getDate()-1));
        item.classList.add('current-day');
    }


}

function clearDisplay() {
    const li = document.querySelectorAll('.shift-list li');
    li.forEach(item => {
        item.remove();
    });
}

function saveShifts() {
    localStorage.setItem(selectedYear + ' ' + months[selectedMonth], JSON.stringify(shifts));
}
function loadShifts() {
    const jsonData = localStorage.getItem(selectedYear + ' ' + months[selectedMonth]);

    if (!jsonData) {
        shifts = new Array(31);
        for (let i = 0; i < 31; i++) {
            shifts[i] = [];
        }
        reloadDisplay();
        return;  
    }

    shifts = JSON.parse(jsonData);

    //Convert Date objects 
    for (let i = 0; i < 31; i++) {
        shifts[i].forEach(shift => {
            shift.fromDate = new Date(shift.fromDate);
            shift.toDate = new Date(shift.toDate);
        });
    }

    reloadDisplay();
}

function updateTotals() {
    
    let totalHours = 0;
    let totalMinutes = 0;
    let totalNet = 0;
    let totalGross = 0;

    shifts.forEach(day => {
        day.forEach(shift => {
            totalHours += shift.totalHours;
            totalMinutes += shift.totalMinutes;
            totalNet += shift.net;
            totalGross += shift.gross;
        });
    });
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes %= 60;
    const totalTime = totalHours + 'h ' + totalMinutes + 'm';

    document.querySelector('#total-net').innerHTML = 'Total Net: ' + currencyFormat.format(totalNet);
    document.querySelector('#total-gross').innerHTML = 'Total Gross: ' + currencyFormat.format(totalGross);

    document.querySelector('#total-time').innerHTML = 'Total Time: ' + totalTime;

}

function getJobs() {
    jobs = JSON.parse(localStorage.getItem('jobs'));
    if (!jobs) {
        document.querySelector('#button-add-shift').disabled = true;
        return;
    }
    if (document.querySelector('#button-add-shift').disabled) {
        document.querySelector('#button-add-shift').disabled = false;
    }

    const ul = document.querySelector('.job-list');
    
    jobs.forEach(job => {
        const li = document.createElement('li');
        li.innerHTML = job.nameOfJob;
        ul.appendChild(li);

        const opt = document.createElement('option');
        opt.value = JSON.stringify(job);
        opt.innerText = job.nameOfJob;
        document.querySelector('#job-select').appendChild(opt);

    });        
}

function getIndexFromList(list, item) {
    const nodeList = Array.from(list); 
    return nodeList.indexOf(item);
}


