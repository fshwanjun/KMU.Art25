'use client';

import { useLightbox } from '@/app/components/LightboxProvider';
import { useMemo } from 'react';

type ImageItem = {
  url: string;
  alt: string | null;
  caption: string | null;
};

function processCaption(caption: string | null): string | null {
  if (!caption) return null;
  
  // Remove <p> and </p> tags only
  let processed = caption.replace(/<p(\s+[^>]*)?>/gi, '').replace(/<\/p>/gi, '');
  
  // Remove <br> and <br/> tags
  processed = processed.replace(/<br\s*\/?>/gi, '');
  
  // HTML 엔티티 디코딩
  processed = processed
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // <poing-poing!> 또는 <제목> 같은 텍스트를 HTML 엔티티로 인코딩하여 브라우저가 태그로 파싱하지 않도록 함
  // 단, 실제 HTML 태그가 아닌 경우만 (예: <p>, <br> 등은 제외)
  // 한글과 다른 문자도 포함하도록 수정
  processed = processed.replace(/<([^>]+)>/g, (match, content) => {
    // 실제 HTML 태그인지 확인
    // 태그 이름만 추출 (속성 제외)
    const tagNameMatch = content.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
    if (tagNameMatch) {
      const tagName = tagNameMatch[1].toLowerCase();
      const validHtmlTags = ['strong', 'em', 'b', 'i', 'u', 'span', 'div', 'a', 'p', 'br'];
      
      // 유효한 HTML 태그인 경우
      if (validHtmlTags.includes(tagName)) {
        // <a> 태그의 경우, href가 없거나 잘못된 속성이 있으면 제목으로 처리
        if (tagName === 'a') {
          // href 속성이 있는지 확인 (비어있지 않은 href)
          const hrefMatch = content.match(/href\s*=\s*["']([^"']*)["']/i);
          const hasValidHref = hrefMatch && hrefMatch[1].trim().length > 0;
          
          if (!hasValidHref) {
            // href가 없거나 비어있으면 제목으로 처리 (예: <a tender="" record="">)
            // 속성 이름들을 공백으로 연결하여 제목으로 사용
            const attributeNames = content.match(/([a-zA-Z][a-zA-Z0-9-]*)\s*=/g);
            if (attributeNames && attributeNames.length > 0) {
              const title = attributeNames
                .map((attr: string) => attr.replace(/\s*=$/, ''))
                .filter((name: string) => name.toLowerCase() !== 'a')
                .join(' ');
              return `&lt;${title}&gt;`;
            }
            // 속성이 없으면 전체를 제목으로
            return `&lt;${content}&gt;`;
          }
          
          // href가 있더라도 잘못된 속성이 있으면 제목으로 처리
          const validAnchorAttributes = ['href', 'target', 'rel', 'class', 'id', 'title', 'download'];
          const attributes = content.match(/([a-zA-Z][a-zA-Z0-9-]*)\s*=/g);
          if (attributes) {
            const hasInvalidAttribute = attributes.some((attr: string) => {
              const attrName = attr.replace(/\s*=$/, '').toLowerCase();
              return !validAnchorAttributes.includes(attrName);
            });
            if (hasInvalidAttribute) {
              // 잘못된 속성이 있으면 제목으로 처리
              return `&lt;${content}&gt;`;
            }
          }
        }
        return match; // 유효한 HTML 태그는 그대로 유지
      }
    }
    // 유효하지 않은 태그(한글 제목, 공백 포함 제목 등)는 HTML 엔티티로 인코딩
    return `&lt;${content}&gt;`;
  });
  
  return processed.trim() || null;
}

export default function WorkImagesClient({ images }: { images: ImageItem[] }) {
  const { openLightbox } = useLightbox();
  
  // useMemo를 사용하여 서버와 클라이언트에서 동일한 결과를 보장
  const processedImages = useMemo(() => {
    return images.map((m) => ({
      ...m,
      processedCaption: processCaption(m.caption),
    }));
  }, [images]);
  
  return (
    <>
      {processedImages.map((m, index) => {
        return (
          <div key={index} className="relative w-full flex flex-col items-center justify-center gap-2">
            <img
              src={m.url}
              alt={m.alt ?? 'work'}
              className="w-auto h-auto max-h-[80vh] object-contain cursor-zoom-in"
              draggable={false}
              onClick={() => openLightbox({ src: m.url, alt: m.alt, caption: m.processedCaption })}
            />
            {m.processedCaption && (
              <span 
                className="text-center text-[14px] font-normal text-gray-500"
                dangerouslySetInnerHTML={{ __html: m.processedCaption }}
              />
            )}
          </div>
        );
      })}
    </>
  );
}