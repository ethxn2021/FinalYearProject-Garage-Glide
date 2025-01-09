export function getDateFromTimeString(timeStr: string) {
    const currentDate = new Date();
  
    const timeComponents = timeStr.split(":");
    let hours = parseInt(timeComponents[0]);
    const minutes = parseInt(timeComponents[1].split(" ")[0]);
    const meridiem = timeComponents[1].split(" ")[1];
  
    if (meridiem === "PM") {
      hours += 12;
    }
  
    // Set the time on the current date object
    currentDate.setHours(hours, minutes, 0, 0);
  
    return currentDate;
  }
  
  export function getTimeStringFromDate(date: Date) {
    let hours = date.getHours().toString();
    let mins = date.getMinutes().toString();
  
    if (date.getHours() < 10) hours = `0${hours}`;
    if (date.getMinutes() < 10) mins = `0${mins}`;
  
    return `${hours}:${mins}:00`;
  }
  