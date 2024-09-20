import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import animationData from "@/assets/lottie-json";
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const colors = [
  "bg-[#FF5A00] text-[#FFFFFF] border-[2px] border-[#FF3D00]", // Vibrant orange background with white text and a slightly darker border
  "bg-[#FF0099] text-[#FFFFFF] border-[2px] border-[#D10082]", // Bright pink background with white text and a deep pink border
  "bg-[#00FFD1] text-[#FFFFFF] border-[2px] border-[#00CBA1]", // Teal background with white text and a darker teal border
  "bg-[#00A5FF] text-[#FFFFFF] border-[2px] border-[#007ACC]", // Bright blue background with white text and a deep blue border
];


export const getColor = (color)=> {
  if (color >= 0 && color < colors.length){
    return colors[color];
  }
  return colors[0];
}

export const animationDefaultOptions  = {
  loop:true,
  autoloop: true,
  animationData,
}
