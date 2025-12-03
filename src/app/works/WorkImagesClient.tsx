'use client';

import { useLightbox } from '@/app/components/LightboxProvider';

type ImageItem = {
  url: string;
  alt: string | null;
  caption: string | null;
};

export default function WorkImagesClient({ images }: { images: ImageItem[] }) {
  const { openLightbox } = useLightbox();
  return (
    <>
      {images.map((m, index) => {
        let caption = m.caption;
        if (caption) {
          console.log('Before:', caption);
          
          // Remove <p> and </p> tags only
          caption = caption.replace(/<p(\s+[^>]*)?>/gi, '').replace(/<\/p>/gi, '');
          console.log('After removing <p> tags:', caption);
          
          // Remove <br> and <br/> tags
          caption = caption.replace(/<br\s*\/?>/gi, '');
          
          // HTML 엔티티 디코딩
          caption = caption
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
          
          // <poing-poing!> 같은 텍스트를 HTML 엔티티로 인코딩하여 브라우저가 태그로 파싱하지 않도록 함
          // 단, 실제 HTML 태그가 아닌 경우만 (예: <p>, <br> 등은 제외)
          caption = caption.replace(/<([a-zA-Z][a-zA-Z0-9\-!]*[!]?)>/g, (match, tagName) => {
            // 실제 HTML 태그가 아닌 경우만 인코딩
            const validHtmlTags = ['strong', 'em', 'b', 'i', 'u', 'span', 'div', 'a'];
            if (validHtmlTags.includes(tagName.toLowerCase())) {
              return match; // 유효한 HTML 태그는 그대로 유지
            }
            // 유효하지 않은 태그는 HTML 엔티티로 인코딩
            return `&lt;${tagName}&gt;`;
          });
          
          // 닫는 태그도 처리
          caption = caption.replace(/<\/([a-zA-Z][a-zA-Z0-9\-!]*[!]?)>/g, (match, tagName) => {
            const validHtmlTags = ['strong', 'em', 'b', 'i', 'u', 'span', 'div', 'a'];
            if (validHtmlTags.includes(tagName.toLowerCase())) {
              return match;
            }
            return `&lt;/${tagName}&gt;`;
          });
          
          console.log('After encoding invalid tags:', caption);
        }
        return (
        <div key={index} className="relative w-full flex flex-col items-center justify-center gap-2">
          <img
            src={m.url}
            alt={m.alt ?? 'work'}
            className="w-auto h-auto max-h-[80vh] object-contain cursor-zoom-in"
            draggable={false}
              onClick={() => openLightbox({ src: m.url, alt: m.alt, caption: caption })}
          />
          {caption && (
            <span 
              className="text-center text-[14px] font-normal text-gray-500"
              dangerouslySetInnerHTML={{ __html: caption }}
            />
          )}
          </div>
        );
      })}
    </>
  );
}