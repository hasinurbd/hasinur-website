import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export function cleanFilenameToCaption(filename: string): string {
  if (!filename) return "";
  
  // Remove file extension (e.g. .png, .jpg, .svg)
  let name = filename.replace(/\.[^/.]+$/, "");
  
  // Decode percent-encoded characters (like %20)
  try {
    name = decodeURIComponent(name);
  } catch (e) {}

  // Split camelCase words by adding a space: "myAwesomeProject" -> "my Awesome Project"
  name = name.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Replace underscores, hyphens, pluses, dots with spaces
  name = name.replace(/[-_+. ]+/g, ' ');

  // Trim extra spaces
  name = name.trim();

  // Highlight capitalize words
  return name
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

