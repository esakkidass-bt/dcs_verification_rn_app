export async function compareDatetimeString(
  syncedDatetime: string,
  apiDatetime: string,
) {
  // console.log(syncedDatetime, apiDatetime, )
  if (!syncedDatetime) {
    return 1;
  }
  const syncedDate = new Date(syncedDatetime);
  const apiDate = new Date(apiDatetime);
  if (syncedDate < apiDate) {
    return 1;
  } else if (syncedDate > apiDate) {
    return -1;
  } else {
    return 0; // dates are equal
  }
}

// export async function compareSyncedDate(syncedDatetime:string){
//   const download = true
// const comparedDateResult = await compareDatetimeString()
// }

export async function getCurrentDateTime(): Promise<string> {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const day = currentDate.getDate().toString().padStart(2, '0');

  const hours = currentDate.getHours().toString().padStart(2, '0');
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  const seconds = currentDate.getSeconds().toString().padStart(2, '0');

  const milliseconds = currentDate
    .getMilliseconds()
    .toString()
    .padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

export function calculateMonthDifference(date1: string, date2: string): number {
  const [year1, month1] = date1.split('/').map(Number);
  const [year2, month2] = date2.split('/').map(Number);

  const dateObject1 = new Date(year1, month1 - 1);
  const dateObject2 = new Date(year2, month2 - 1);

  const monthDifference =
    (dateObject2.getFullYear() - dateObject1.getFullYear()) * 12 +
    dateObject2.getMonth() -
    dateObject1.getMonth();

  return monthDifference;
}
