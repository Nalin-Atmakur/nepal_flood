/**
 * Real footage of the 26 August flood, curated by hand (web/docs/18-flood-videos.md). This file is the source of
 * truth: adding a clip is a reviewed change, because AI-generated and recycled clips are circulating (Lead
 * Stories, AAP, Nepal Fact Check, BOOM, VERA Files — see the doc's checklist) and a wrong clip on this site would
 * travel. Every entry was verified through YouTube's oEmbed (title + channel) on the `checked` date; captions say
 * what the uploader's title says, nothing more.
 *
 * Rendering (components/blocks/FloodVideos.tsx, directly under the simulation — owner, 30 Aug 13:40: "underneath the
 * flood simulation, just 2/3"): a thumbnail facade — the YouTube iframe loads only when tapped.
 */
export type VideoKind = "cctv" | "eyewitness" | "aerial" | "news";

export type FloodVideo = {
  /** YouTube video id (11 chars) */
  id: string;
  kind: VideoKind;
  /** our caption, in the three site languages */
  caption: { en: string; ne: string; hi: string; zh: string };
  /** uploader's channel, as credited on YouTube */
  credit: string;
  creditUrl: string;
  /** the uploader's title, verbatim (what we verified) */
  title: string;
  /** gazetteer id when the clip is clearly of one place */
  placeId: string | null;
  /** spoken/on-screen language of the clip */
  lang: "en" | "ne" | "hi";
  /** vertical (Shorts) clip */
  short?: boolean;
  /** shown under the simulation (three at most); the rest are kept for the place pages */
  featured?: boolean;
  /** when the title/channel were verified via oEmbed (ISO date) */
  checked: string;
};

export const FLOOD_VIDEOS: FloodVideo[] = [
  {
    id: "KH94sIuFWuE",
    featured: true,
    kind: "cctv",
    caption: {
      en: "CCTV at the border: the wave arrives from the Tibet side",
      ne: "सीमामा सीसीटीभी: तिब्बततर्फबाट बाढी आइपुग्दै",
      hi: "सीमा पर सीसीटीवी: तिब्बत की ओर से बाढ़ आती हुई",
      zh: "边境监控画面：洪水从西藏一侧涌来",
    },
    credit: "NepalWatch",
    creditUrl: "https://www.youtube.com/@nepalwatch2022",
    title: "चीनतर्फबाट आएको बाढीको CCTV फुटेज | Rasuwa Flood | NepalWatch |",
    placeId: "rasuwagadhi",
    lang: "ne",
    checked: "2026-08-30",
  },
  {
    id: "0bkCtUstxK8",
    featured: true,
    kind: "eyewitness",
    caption: {
      en: "The last three minutes before the water reached Trishuli Bazar",
      ne: "त्रिशूली बजारमा पानी आइपुग्नुअघिका अन्तिम तीन मिनेट",
      hi: "त्रिशूली बाज़ार तक पानी पहुँचने से पहले के आख़िरी तीन मिनट",
      zh: "洪水抵达特里舒里集市前的最后三分钟",
    },
    credit: "NDTV",
    creditUrl: "https://www.youtube.com/@NDTV",
    title: "Nepal Floods | On Camera, Last 3 Minutes Before Water Swallowed Nepal's Trishuli Town",
    placeId: "trishuli_bazar",
    lang: "en",
    checked: "2026-08-30",
  },
  {
    id: "k5OUDfPfDSo",
    kind: "eyewitness",
    caption: {
      en: "Timure and Syabrubesi as the flood hits",
      ne: "बाढी आउँदा टिमुरे र स्याफ्रुबेसी",
      hi: "बाढ़ आते समय टिमुरे और स्याफ्रुबेसी",
      zh: "洪水袭来时的蒂穆雷与夏布卢贝西",
    },
    credit: "Touch The Himalaya Treks & Expedition",
    creditUrl: "https://www.youtube.com/@tthimalaya",
    title: "Major Flood Hits Rasuwa Nepal | Timure & Syabrubesi Flood | August 26, 2026",
    placeId: "timure",
    lang: "ne",
    short: true,
    checked: "2026-08-30",
  },
  {
    id: "oewbgPqndPw",
    featured: true,
    kind: "eyewitness",
    caption: {
      en: "A bridge goes as the flood passes",
      ne: "बाढीले पुल बगाउँदै",
      hi: "बाढ़ में पुल बहता हुआ",
      zh: "洪水冲垮一座桥",
    },
    credit: "CNA",
    creditUrl: "https://www.youtube.com/@channelnewsasia",
    title: "Footage captures bridge being washed away in Nepal flood",
    placeId: null,
    lang: "en",
    short: true,
    checked: "2026-08-30",
  },
  {
    id: "HR7WeYBmIZQ",
    kind: "aerial",
    caption: {
      en: "The Rasuwa valley from the air after the wave",
      ne: "बाढीपछि रसुवा उपत्यकाको हवाई दृश्य",
      hi: "लहर के बाद रसुवा घाटी का हवाई दृश्य",
      zh: "洪峰过后，空中俯瞰拉苏瓦河谷",
    },
    credit: "NewsX World",
    creditUrl: "https://www.youtube.com/@newsxworldlive",
    title: "Massive Floods Swallow Nepal's Rasuwa Valley In Dramatic Aerial Footage | NewsX World",
    placeId: null,
    lang: "en",
    short: true,
    checked: "2026-08-30",
  },
  {
    id: "SlyeTSk-pwk",
    kind: "eyewitness",
    caption: {
      en: "Houses swept away in Rasuwa, filmed as it happened",
      ne: "रसुवामा हेर्दाहेर्दै घरहरू बगे",
      hi: "रसुवा में देखते-देखते घर बह गए",
      zh: "拉苏瓦：房屋在众目睽睽下被冲走",
    },
    credit: "Shilapatra",
    creditUrl: "https://www.youtube.com/@shilapatramedia",
    title: "रसुवामा एक्कासि भीषण बाढी, हेर्दाहेर्दै बगायो घरहरु | Shilapatra",
    placeId: null,
    lang: "ne",
    checked: "2026-08-30",
  },
  {
    id: "AEIC1ujp3CU",
    kind: "news",
    caption: {
      en: "News18 report: the flood from Tibet hits Rasuwa",
      ne: "न्युज १८ रिपोर्ट: तिब्बतबाट आएको बाढीले रसुवामा क्षति",
      hi: "न्यूज़18 रिपोर्ट: तिब्बत से आई बाढ़ ने रसुवा को मारा",
      zh: "News18 报道：来自西藏的洪水冲击拉苏瓦",
    },
    credit: "CNN-News18",
    creditUrl: "https://www.youtube.com/@cnnnews18",
    title: "Nepal Flash Floods | Devastating River Flood From Tibet Hits Rasuwa | Widespread Destruction | N18G",
    placeId: null,
    lang: "en",
    checked: "2026-08-30",
  },
  {
    id: "QbKWdCRPRP4",
    kind: "news",
    caption: {
      en: "Straits Times: villages and roads washed away in Rasuwa",
      ne: "स्ट्रेट्स टाइम्स: रसुवामा गाउँ र सडक बगे",
      hi: "स्ट्रेट्स टाइम्स: रसुवा में गाँव और सड़कें बह गईं",
      zh: "海峡时报：拉苏瓦的村庄与道路被冲毁",
    },
    credit: "The Straits Times",
    creditUrl: "https://www.youtube.com/@straitstimesonline",
    title: "Flash flood in mountainous region of Rasuwa, Nepal, washes away villages and infrastructure, kills 9",
    placeId: null,
    lang: "en",
    checked: "2026-08-30",
  },
  {
    id: "BiAGpvb_JYo",
    kind: "news",
    caption: {
      en: "Kantipur TV: where the damage is and what rescue is under way",
      ne: "कान्तिपुर टिभी: कहाँ कति क्षति, उद्धार के हुँदैछ",
      hi: "कान्तिपुर टीवी: कहाँ कितना नुकसान, बचाव कहाँ तक",
      zh: "坎迪普尔电视台：哪里受损、救援进展如何",
    },
    credit: "Kantipur TV HD",
    creditUrl: "https://www.youtube.com/@KantipurTVHD",
    title: "रसुवा विपत्ति : कहाँ कति क्षति, उद्धारको पहल के हुन्दैछ ? सरकारले के गर्दैछ ?",
    placeId: null,
    lang: "ne",
    checked: "2026-08-30",
  },
];

export const FEATURED_VIDEOS: FloodVideo[] = FLOOD_VIDEOS.filter((v) => v.featured).slice(0, 3);

export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** Poster image (YouTube's own thumbnail; no API key). */
export function videoThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
/** Privacy-enhanced embed, autoplaying because the visitor just tapped the poster. */
export function videoEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
}
export function videoWatch(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}
