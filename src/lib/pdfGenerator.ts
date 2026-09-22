import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFComment {
  name: string;
  text: string;
  created_at: string;
}

export interface PDFExportData {
  title: string;
  category?: string;
  date?: string;
  author?: string;
  contentHtml?: string;
  imageUrl?: string;
  gallery?: string[];
  likes?: number;
  comments?: PDFComment[];
}

/**
 * Converts image URL to Base64 data URL to ensure 100% reliable full-resolution image rendering without CORS or cropping.
 */
async function urlToBase64(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  // Method 1: Fetch as Blob and convert via FileReader
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    // Continue to canvas fallback
  }

  // Method 2: HTML5 Canvas drawing fallback
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 1200;
        canvas.height = img.naturalHeight || img.height || 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.95));
        } else {
          resolve(url);
        }
      } catch (e) {
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

export async function downloadPDF(
  elementId: string, 
  title: string, 
  exportData?: PDFExportData
): Promise<boolean> {
  const safeFilename = (title || 'document').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 50) || 'document';

  try {
    // 1. Gather all image URLs (gallery or primary imageUrl)
    const imageUrls: string[] = [];
    if (exportData?.gallery && exportData.gallery.length > 0) {
      imageUrls.push(...exportData.gallery);
    } else if (exportData?.imageUrl) {
      imageUrls.push(exportData.imageUrl);
    }

    // Convert images to Base64 in parallel
    const imagesBase64 = (
      await Promise.all(imageUrls.map(url => urlToBase64(url)))
    ).filter((res): res is string => Boolean(res));

    const authorAvatarUrl = "https://jtcepxgoqbyfwljezndt.supabase.co/storage/v1/object/public/portfolio_assets/hasinur_profile_pic_design_in_ps.png";
    const authorAvatarBase64 = await urlToBase64(authorAvatarUrl);

    // 2. Create offscreen container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '780px';
    container.style.backgroundColor = '#030712';
    container.style.color = '#f8fafc';
    container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    container.style.padding = '0px';

    const categoryTag = exportData?.category || 'Publication';
    const publishedDate = exportData?.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const authorName = exportData?.author || 'S M Hasinur Rahman';
    const likesCount = exportData?.likes || 0;
    const commentsList = exportData?.comments || [];

    // Sanitize and style content HTML images so inline photos in body also display fully
    let sanitizedContent = exportData?.contentHtml || '<p>No content details provided.</p>';
    sanitizedContent = sanitizedContent.replace(/<img /g, '<img style="max-width:100%; height:auto; border-radius:12px; margin:16px 0; display:block;" ');

    // Construct DOM blocks with class `pdf-block`
    container.innerHTML = `
      <div style="background: #030712; padding: 24px;">
        
        <!-- BLOCK 1: Header Banner -->
        <div class="pdf-block" style="border-radius: 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border: 1px solid rgba(255,255,255,0.1); padding: 28px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background-color: #3b82f6;"></div>
              <span style="font-size: 11px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; color: #60a5fa;">PORTFOLIO PUBLICATION</span>
            </div>
            <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">${publishedDate}</span>
          </div>

          <div style="display: inline-block; padding: 4px 12px; background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 9999px; color: #818cf8; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 14px;">
            ${categoryTag}
          </div>
          <h1 style="font-size: 28px; font-weight: 900; line-height: 1.25; color: #ffffff; margin: 0 0 14px 0; letter-spacing: -0.02em;">
            ${exportData?.title || title}
          </h1>
          <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; display: flex; gap: 14px;">
            <span>By ${authorName}</span>
            <span>•</span>
            <span>${likesCount} Likes</span>
            <span>•</span>
            <span>${commentsList.length} Comments</span>
          </div>
        </div>

        <!-- BLOCK 2+: Full Resolution Uncropped Gallery Pictures -->
        ${imagesBase64.map((imgSrc, idx) => `
          <div class="pdf-block" style="margin-bottom: 20px; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background-color: #0b0f19; padding: 12px; text-align: center;">
            <img src="${imgSrc}" style="width: 100%; height: auto; max-width: 100%; display: block; border-radius: 12px; object-fit: contain;" />
            ${imagesBase64.length > 1 ? `<div style="font-size: 10px; font-weight: 700; color: #64748b; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.1em;">IMAGE ${idx + 1} OF ${imagesBase64.length}</div>` : ''}
          </div>
        `).join('')}

        <!-- BLOCK 3: Content Section -->
        <div class="pdf-block" style="background: #0b0f19; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 28px; margin-bottom: 20px; font-size: 14px; line-height: 1.8; color: #cbd5e1; font-weight: 400;">
          ${sanitizedContent}
        </div>

        <!-- BLOCK 4: Author Profile Card -->
        <div class="pdf-block" style="background: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
          ${authorAvatarBase64 ? `
            <img src="${authorAvatarBase64}" style="width: 54px; height: 54px; border-radius: 50%; border: 2px solid #3b82f6; object-fit: cover;" />
          ` : ''}
          <div>
            <h4 style="margin: 0; font-size: 15px; font-weight: 800; color: #ffffff;">${authorName}</h4>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">CSE Undergraduate at UIU & Creative Designer. Merging engineering logic with creative vision.</p>
          </div>
        </div>

        <!-- BLOCK 5: Comments Header -->
        <div class="pdf-block" style="margin-bottom: 14px; padding-top: 8px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: -0.01em;">
            Reader Dialogue & Comments (${commentsList.length})
          </h3>
        </div>

        <!-- BLOCK 6+: Individual Comment Cards -->
        ${commentsList.length === 0 ? `
          <div class="pdf-block" style="padding: 20px; text-align: center; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 20px;">
            No comments posted yet for this publication.
          </div>
        ` : commentsList.map(c => `
          <div class="pdf-block" style="background: #0f172a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; font-weight: 900; font-size: 12px; display: flex; align-items: center; justify-content: center; text-transform: uppercase;">
                  ${(c.name || 'U').charAt(0)}
                </div>
                <span style="font-size: 13px; font-weight: 800; color: #ffffff;">${c.name || 'Anonymous'}</span>
              </div>
              <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                ${c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}
              </span>
            </div>
            <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5; padding-left: 38px;">
              ${c.text || ''}
            </p>
          </div>
        `).join('')}

      </div>
    `;

    document.body.appendChild(container);

    // Wait for all images inside container to load completely before capturing canvas
    const imgElements = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgElements.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(true);
            else {
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
            }
          })
      )
    );

    // Get all render blocks
    const blocks = Array.from(container.querySelectorAll<HTMLElement>('.pdf-block'));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 12; // 12mm margins
    const maxUsableWidth = pageWidth - margin * 2;

    let currentY = margin;

    const applyPageBackground = (pdfDoc: jsPDF) => {
      pdfDoc.setFillColor(3, 7, 18); // #030712 dark background
      pdfDoc.rect(0, 0, pageWidth, pageHeight, 'F');
    };

    applyPageBackground(pdf);

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];

      const canvas = await html2canvas(block, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#030712'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const blockHeightMM = (canvas.height * maxUsableWidth) / canvas.width;

      // If a single image/block is taller than an entire page height, scale it to fit within a page height
      let finalWidth = maxUsableWidth;
      let finalHeight = blockHeightMM;
      if (finalHeight > pageHeight - margin * 2) {
        finalHeight = pageHeight - margin * 2;
        finalWidth = (canvas.width * finalHeight) / canvas.height;
      }

      // Check if block exceeds remaining page space (prevent awkward slicing across elements)
      if (currentY + finalHeight > pageHeight - margin && currentY > margin + 5) {
        pdf.addPage();
        applyPageBackground(pdf);
        currentY = margin;
      }

      const xOffset = margin + (maxUsableWidth - finalWidth) / 2;
      pdf.addImage(imgData, 'JPEG', xOffset, currentY, finalWidth, finalHeight);
      currentY += finalHeight + 4; // 4mm spacing between blocks
    }

    // Add page numbers footer
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.text(
        `S M Hasinur Rahman Portfolio  |  Page ${p} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    // Clean up temp container
    document.body.removeChild(container);

    pdf.save(`${safeFilename}.pdf`);
    return true;

  } catch (err) {
    console.error('PDF generation error:', err);
    window.print();
    return false;
  }
}
