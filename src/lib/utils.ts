import { useEffect } from "react";
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

/**
 * Sanitize an HTML string to mitigate XSS (Cross-Site Scripting) vectors while maintaining allowed rich-text tags.
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return "";
  
  let sanitized = html;
  
  // 1. Remove script tags and all their inner contents completely
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // 2. Remove potentially harmful external content elements: iframe, object, embed, meta, link, applet
  sanitized = sanitized.replace(/<(iframe|object|embed|meta|link|applet)\b[^<]*(?:(?!\/?>)<[^<]*)*\/?>/gi, "");
  
  // 3. Strip out inline JavaScript handlers (onclick, onload, onerror, etc.)
  // Handles quoted values (e.g. onclick="val" or onclick='val')
  sanitized = sanitized.replace(/\son\w+\s*=\s*(["'])(?:(?!\1).)*\1/gi, "");
  // Handles unquoted values (e.g. onclick=val)
  sanitized = sanitized.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");
  
  // 4. Prevent javascript: pseudo-protocols within links or sources
  sanitized = sanitized.replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, " $1=\"#\"");
  sanitized = sanitized.replace(/\s+(href|src)\s*=\s*javascript:[^\s>]+/gi, " $1=\"#\"");
  
  return sanitized;
}

/**
 * Custom React hook to dynamically update document title and OpenGraph/Twitter meta tags for SEO & Social Sharing.
 */
export function useDocumentMetadata({
  title,
  description,
  image,
  url,
  type = 'website'
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}) {
  useEffect(() => {
    if (!title) return;

    // Save previous document title
    const prevTitle = document.title;
    
    // Set dynamic document title with professional branding
    document.title = `${title} | S M Hasinur Rahman`;

    // Helper to update or create meta elements in document head
    const updateMeta = (property: string, content: string | undefined, isProperty = true) => {
      if (content === undefined) return;
      const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', property);
        } else {
          element.setAttribute('name', property);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Strip HTML tags for clean plain-text descriptions
    const cleanDesc = description
      ? description.replace(/<[^>]*>/g, '').trim().slice(0, 160)
      : "Professional portfolio of S M Hasinur Rahman - CSE at UIU, Full-Stack Developer & Strategic Designer.";

    // Update standard HTML description
    updateMeta('description', cleanDesc, false);

    // Update OpenGraph tags
    updateMeta('og:title', title);
    updateMeta('og:description', cleanDesc);
    updateMeta('og:type', type);
    updateMeta('og:url', url || window.location.href);
    if (image) {
      updateMeta('og:image', image);
    }

    // Update Twitter Cards tags
    updateMeta('twitter:card', 'summary_large_image', false);
    updateMeta('twitter:title', title, false);
    updateMeta('twitter:description', cleanDesc, false);
    if (image) {
      updateMeta('twitter:image', image, false);
    }

    // Cleanup and revert to default portfolio meta tags on component unmount
    return () => {
      document.title = prevTitle;
      const defaultDesc = "Official portfolio of S M Hasinur Rahman. Full-Stack Developer, Graphic Designer, and CSE at UIU.";
      const defaultImage = "https://jtcepxgoqbyfwljezndt.supabase.co/storage/v1/object/public/portfolio_assets/hasinur_profile_pic_design_in_ps.png";

      updateMeta('description', defaultDesc, false);
      updateMeta('og:title', 'S M Hasinur Rahman');
      updateMeta('og:description', defaultDesc);
      updateMeta('og:type', 'website');
      updateMeta('og:url', window.location.origin);
      updateMeta('og:image', defaultImage);

      updateMeta('twitter:card', 'summary_large_image', false);
      updateMeta('twitter:title', 'S M Hasinur Rahman', false);
      updateMeta('twitter:description', defaultDesc, false);
      updateMeta('twitter:image', defaultImage, false);
    };
  }, [title, description, image, url, type]);
}



