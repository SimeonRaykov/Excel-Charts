
function sortClientsByIDThenByDate(ob1, ob2) {
    if (ob1.id > ob2.id) {
        return 1
    } else if (ob1.id < ob2.id) {
        return -1
    } else if (ob1.start > ob2.start) {
        return 1
    }
    return -1;
};