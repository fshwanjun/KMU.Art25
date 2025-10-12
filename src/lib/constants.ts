// 워드프레스 REST 엔드포인트의 기본 주소를 환경변수 또는 배포용 도메인에서 결정합니다.
export const WP_BASE_URL =
  process.env.WP_BASE_URL || "https://kookminfinearts.com/kmufa-25";

export const FG_WORK = {
  title: "fg-work",
  key: "group_68e7a0d0458bd",
  fields: {
    title: "title",
    name: "name",
  },
};

export const FG_ABOUT = {
  title: "fg-about",
  key: "group_68eb4028473d1",
  fields: {
    host: "host",
    info: "info",
  },
};
