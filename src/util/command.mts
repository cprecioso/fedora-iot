export const $ = (...args: Parameters<typeof String.raw>) =>
  String.raw(...args).split(" ");
