export class Shift {
    constructor(job, fromDate, toDate, breakHours) {
        this.job = job;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.breakHours = breakHours;
    

        this.totalHours = this.getTotalHours();
        this.totalMinutes = this.getTotalMinutes();
        this.totalTime = this.totalHours + 'h ' + this.totalMinutes + 'm';

        this.net = this.getNetIncome();
        this.gross = this.getGrossIncome();
    }

    getTotalHours() {
        const timeDifference = this.toDate.getTime() - this.fromDate.getTime();
        let sec = timeDifference / 1000;
        return Math.floor(sec / 60 / 60);
    }
    getTotalMinutes() {
        const timeDifference = this.toDate.getTime() - this.fromDate.getTime();
        let sec = timeDifference / 1000;
        sec -= this.totalHours * 60 * 60;
        return Math.floor(sec / 60);
    }
    
    getNetIncome() {
        const salary = this.job.salary;
        let net =  salary.hourlyRate * this.totalHours;
        net += (salary.hourlyRate / 2) * this.totalMinutes; 
        return net;
    }
    getGrossIncome() {
        const salary = this.job.salary;
        let gross =  salary.hourlyRate * this.totalHours;
        gross += (salary.hourlyRate / 2) * this.totalMinutes; 
        gross *= 0.33;
        return gross;
    }
}