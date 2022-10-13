export const random = (min = 0, max = 1000000) => {
   return min + Math.floor((Math.random() * (max-min)))
}