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
 * Converts image URL to Base64 data URL to ensure 100% reliable image rendering in canvas/PDF without CORS blocking.
 */
async function urlToBase64(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 800;
        canvas.height = img.naturalHeight || img.height || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          resolve(null);
        }
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
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
    // 1. Convert Cover Image and Author Avatar to Base64
    let coverBase64: string | null = null;
    if (exportData?.imageUrl) {
      coverBase64 = await urlToBase64(exportData.imageUrl);
    }

    const authorAvatarUrl = "https://jtcepxgoqbyfwljezndt.supabase.co/storage/v1/object/public/portfolio_assets/hasinur_profile_pic_design_in_ps.png";
    const authorAvatarBase64 = await urlToBase64(authorAvatarUrl);

    // 2. Create offscreen modern container for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.backgroundColor = '#030712'; // Ultra dark slate
    container.style.color = '#f8fafc';
    container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    container.style.padding = '40px';
    container.style.boxSizing = 'border-box';

    // HTML Content construction
    const categoryTag = exportData?.category || 'Tech & Design Publication';
    const publishedDate = exportData?.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const authorName = exportData?.author || 'S M Hasinur Rahman';
    const likesCount = exportData?.likes || 0;
    const commentsList = exportData?.comments || [];

    // Construct DOM structure
    container.innerHTML = `
      <div style="border-radius: 24px; background: linear-gradient(135deg, #0b0f19 0%, #111827 100%); border: 1px solid rgba(255,255,255,0.1); padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        
        <!-- Header Brand Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 28px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: #3b82f6;"></div>
            <span style="font-size: 11px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; color: #60a5fa;">PORTFOLIO PUBLICATION</span>
          </div>
          <span style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">${publishedDate}</span>
        </div>

        <!-- Meta Category & Title -->
        <div style="margin-bottom: 24px;">
          <div style="display: inline-block; padding: 6px 14px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px; color: #818cf8; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px;">
            ${categoryTag}
          </div>
          <h1 style="font-size: 32px; font-weight: 900; line-height: 1.15; color: #ffffff; margin: 0 0 16px 0; letter-spacing: -0.02em;">
            ${exportData?.title || title}
          </h1>
          <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; display: flex; gap: 16px;">
            <span>By ${authorName}</span>
            <span>•</span>
            <span>${likesCount} Likes</span>
            <span>•</span>
            <span>${commentsList.length} Comments</span>
          </div>
        </div>

        <!-- Hero Picture (If available) -->
        ${coverBase64 ? `
          <div style="margin-bottom: 32px; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background-color: #1e293b; max-height: 400px;">
            <img src="${coverBase64}" style="width: 100%; height: auto; display: block; object-fit: cover;" />
          </div>
        ` : ''}

        <!-- Main Content -->
        <div style="font-size: 15px; line-height: 1.75; color: #cbd5e1; margin-bottom: 40px; font-weight: 400;">
          ${exportData?.contentHtml || '<p>No content details provided.</p>'}
        </div>

        <!-- Author Card -->
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 20px; display: flex; align-items: center; gap: 16px; margin-bottom: 40px;">
          ${authorAvatarBase64 ? `
            <img src="${authorAvatarBase64}" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid #3b82f6; object-fit: cover;" />
          ` : ''}
          <div>
            <h4 style="margin: 0; font-size: 16px; font-weight: 800; color: #ffffff;">${authorName}</h4>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">CSE Undergraduate at UIU & Creative Designer. Merging engineering logic with creative vision.</p>
          </div>
        </div>

        <!-- Comments & Feedback Section -->
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 28px;">
          <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 20px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: -0.01em;">
              Reader Dialogue & Comments (${commentsList.length})
            </h3>
          </div>

          ${commentsList.length === 0 ? `
            <div style="padding: 24px; text-align: center; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
              No comments posted yet for this publication.
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 16px;">
              ${commentsList.map(c => `
                <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div style="width: 32px; height: 32px; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #4f46e5); color: #ffffff; font-weight: 900; font-size: 14px; display: flex; align-items: center; justify-content: center; text-transform: uppercase;">
                        ${(c.name || 'U').charAt(0)}
                      </div>
                      <span style="font-size: 14px; font-weight: 800; color: #ffffff;">${c.name || 'Anonymous'}</span>
                    </div>
                    <span style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">
                      ${c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.5; padding-left: 42px;">
                    ${c.text || ''}
                  </p>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Footer Notice -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center; color: #64748b; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
          S M HASINUR RAHMAN PORTFOLIO — OFFICIAL DIGITAL DOCUMENT
        </div>

      </div>
    `;

    document.body.appendChild(container);

    // 3. Render container to Canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#030712'
    });

    // Remove temp container
    document.body.removeChild(container);

    // 4. Build Multi-page PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${safeFilename}.pdf`);
    return true;

  } catch (err) {
    console.error('Modern PDF generation failed:', err);
    window.print();
    return false;
  }
}
