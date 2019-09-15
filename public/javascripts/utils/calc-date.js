const calcDate = (postDate) => {
  const nowDate = Date.now();
  const parsedDate = Date.parse(postDate);
  const gapByMinute = Math.floor((nowDate - parsedDate)/(1000*60));

  if (gapByMinute < 10) {
    return `방금`;
  }

  if (gapByMinute < 60) {
    return `${gapByMinute}분`
  }

  const gapByHours = Math.floor(gapByMinute / 60);

  if (gapByHours < 24) {
    return `${gapByHours}시간`
  }

  const gapByDay = Math.floor(gapByHours / 24);

  if (gapByDay < 7) {
    return `${gapByDay}일`
  }

  const gapByWeek = Math.floor(gapByDay / 7);

  if (gapByWeek < 4) {
    return `${gapByWeek}주` 
  }
}

export default calcDate;