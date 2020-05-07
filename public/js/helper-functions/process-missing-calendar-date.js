function processCalendarDataForMissingDate() {
    let dataArr = [];
    let currHourReading = [];
    let currReadingDate = new Date(findGetParameter('date'));
    for (let i = 0; i < 24; i += 1) {
        currHourReading = [];
        currHourReading = {
            groupId: i,
            id: i,
            title: 'Няма стойност',
            start: Number(currReadingDate),
            end: Number(currReadingDate) + 3599999,
            backgroundColor: colors.red,
            textColor: 'white'
        }
        incrementHoursOne(currReadingDate);
        dataArr.push(currHourReading);
    }
    return dataArr;
}