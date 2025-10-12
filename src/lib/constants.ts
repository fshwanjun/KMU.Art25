// 워드프레스 REST 엔드포인트의 기본 주소를 환경변수 또는 배포용 도메인에서 결정합니다.
export const WP_BASE_URL =
  process.env.WP_BASE_URL || "https://kookminfinearts.com/kmufa-25";

export const FG_WORK = {
  title: "fg-work",
  key: "group_68e7a0d0458bd",
  fields: {
    title: "title",
    name: "name",
    name_en: "name_en",
    artgallery: "artgallery",
    contact: {
      _key: "contact",
      fields: {
        insta: "insta",
        mail: "mail",
        oneword: "oneword",
      },
    },
  },
};

export const FG_ABOUT = {
  title: "fg-about",
  key: "group_68eb4028473d1",
  fields: {
    title: "title",
    date: "date",
    info: "info",
    poster: "poster",
  },
};

export const FG_BEHIND = {
  title: "fg-behind",
  key: "group_68ebc0624b1a8",
  fields: {
    behindgallery: "behindgallery",
  },
};

export const FG_ARCHIVE = {
  title: "fg-archive",
  key: "group_68ebcb41f176d",
  fields: {
    archiverepeater: "archiverepeater",
    gallerytype: "gallerytype",
    repeatergallery: "repeatergallery",
  },
};
