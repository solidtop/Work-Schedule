import { Job } from "./job.js";

const form = document.querySelector('form');
form.addEventListener('submit', e => {
    e.preventDefault();
    
    createJob();
    
    form.reset();
});


function createJob() {
    const nameOfJob = document.querySelector('#input-name-of-job').value;
    const Salary = {
        hourlyRate: document.querySelector('#input-hourly-rate').value,
    }

    let jobArray = JSON.parse(localStorage.getItem('jobs'));
    if (!jobArray) {
        jobArray = [];
    }

    const job = new Job(nameOfJob, Salary);
    jobArray.push(job);

    localStorage.setItem('jobs', JSON.stringify(jobArray));
    
    window.open('./schedule.html', '_self');

}
