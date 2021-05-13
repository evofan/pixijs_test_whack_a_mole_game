/**
 * Repeat processing at intervals
 * @param count
 * @param ms
 * @param func
 */
export const intervalFunc = (count: number, ms: number, func: Function) => {
  const intervalId: any = setInterval(() => {
    func();
    count--;
    if (count <= 0) {
      clearInterval(intervalId);
      console.log("count end");
    } else {
      console.log("count: ", count);
    }
  }, ms);
};
