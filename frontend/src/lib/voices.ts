/**
 * Curated set of Microsoft Edge neural voices exposed in the UI, generated
 * from the live `edge-tts` catalogue so every id is a valid ShortName.
 *
 * The backend validates against the full live catalogue, so adding a voice
 * here is enough - no backend change needed. List all 300+ options with:
 *   python -m edge_tts --list-voices
 */

export type Voice = {
  /** edge-tts ShortName, e.g. "en-US-AndrewNeural". */
  id: string;
  /** Display name. */
  name: string;
  /** Language + region, e.g. "English (US)". */
  lang: string;
  gender: "Male" | "Female";
  /** Optional flavour text (personality tags from the catalogue). */
  note?: string;
};

export type VoiceGroup = { label: string; voices: Voice[] };

export const VOICE_GROUPS: VoiceGroup[] = [
  {
    label: "Multilingual (auto-detects language)",
    voices: [
      { id: "en-US-AndrewMultilingualNeural", name: "Andrew (Multilingual)", lang: "English (US)", gender: "Male", note: "Warm, Confident" },
      { id: "en-US-EmmaMultilingualNeural", name: "Emma (Multilingual)", lang: "English (US)", gender: "Female", note: "Cheerful, Clear" },
      { id: "en-US-AvaMultilingualNeural", name: "Ava (Multilingual)", lang: "English (US)", gender: "Female", note: "Expressive, Caring" },
      { id: "en-US-BrianMultilingualNeural", name: "Brian (Multilingual)", lang: "English (US)", gender: "Male", note: "Approachable, Casual" },
      { id: "en-AU-WilliamMultilingualNeural", name: "William (Multilingual)", lang: "English (AU)", gender: "Male" },
      { id: "fr-FR-VivienneMultilingualNeural", name: "Vivienne (Multilingual)", lang: "French (FR)", gender: "Female" },
      { id: "fr-FR-RemyMultilingualNeural", name: "Remy (Multilingual)", lang: "French (FR)", gender: "Male" },
      { id: "de-DE-SeraphinaMultilingualNeural", name: "Seraphina (Multilingual)", lang: "German (DE)", gender: "Female" },
      { id: "de-DE-FlorianMultilingualNeural", name: "Florian (Multilingual)", lang: "German (DE)", gender: "Male" },
      { id: "it-IT-GiuseppeMultilingualNeural", name: "Giuseppe (Multilingual)", lang: "Italian (IT)", gender: "Male" },
      { id: "pt-BR-ThalitaMultilingualNeural", name: "Thalita (Multilingual)", lang: "Portuguese (BR)", gender: "Female" },
      { id: "ko-KR-HyunsuMultilingualNeural", name: "Hyunsu (Multilingual)", lang: "Korean (KR)", gender: "Male" },
    ],
  },
  {
    label: "English · United States",
    voices: [
      { id: "en-US-AndrewNeural", name: "Andrew", lang: "English (US)", gender: "Male", note: "Warm, Confident" },
      { id: "en-US-EmmaNeural", name: "Emma", lang: "English (US)", gender: "Female", note: "Cheerful, Clear" },
      { id: "en-US-AvaNeural", name: "Ava", lang: "English (US)", gender: "Female", note: "Expressive, Caring" },
      { id: "en-US-BrianNeural", name: "Brian", lang: "English (US)", gender: "Male", note: "Approachable, Casual" },
      { id: "en-US-AriaNeural", name: "Aria", lang: "English (US)", gender: "Female", note: "Confident" },
      { id: "en-US-JennyNeural", name: "Jenny", lang: "English (US)", gender: "Female", note: "Considerate, Comfort" },
      { id: "en-US-GuyNeural", name: "Guy", lang: "English (US)", gender: "Male", note: "Passion" },
      { id: "en-US-ChristopherNeural", name: "Christopher", lang: "English (US)", gender: "Male", note: "Reliable, Authority" },
      { id: "en-US-EricNeural", name: "Eric", lang: "English (US)", gender: "Male", note: "Rational" },
      { id: "en-US-MichelleNeural", name: "Michelle", lang: "English (US)", gender: "Female", note: "Pleasant" },
      { id: "en-US-RogerNeural", name: "Roger", lang: "English (US)", gender: "Male", note: "Lively" },
      { id: "en-US-SteffanNeural", name: "Steffan", lang: "English (US)", gender: "Male", note: "Rational" },
      { id: "en-US-AnaNeural", name: "Ana", lang: "English (US)", gender: "Female", note: "Cute" },
    ],
  },
  {
    label: "English · United Kingdom",
    voices: [
      { id: "en-GB-RyanNeural", name: "Ryan", lang: "English (GB)", gender: "Male" },
      { id: "en-GB-SoniaNeural", name: "Sonia", lang: "English (GB)", gender: "Female" },
      { id: "en-GB-ThomasNeural", name: "Thomas", lang: "English (GB)", gender: "Male" },
      { id: "en-GB-LibbyNeural", name: "Libby", lang: "English (GB)", gender: "Female" },
      { id: "en-GB-MaisieNeural", name: "Maisie", lang: "English (GB)", gender: "Female" },
    ],
  },
  {
    label: "English · Australia & New Zealand",
    voices: [
      { id: "en-AU-NatashaNeural", name: "Natasha", lang: "English (AU)", gender: "Female" },
      { id: "en-NZ-MitchellNeural", name: "Mitchell", lang: "English (NZ)", gender: "Male" },
      { id: "en-NZ-MollyNeural", name: "Molly", lang: "English (NZ)", gender: "Female" },
    ],
  },
  {
    label: "English · Canada & Ireland",
    voices: [
      { id: "en-CA-LiamNeural", name: "Liam", lang: "English (CA)", gender: "Male" },
      { id: "en-CA-ClaraNeural", name: "Clara", lang: "English (CA)", gender: "Female" },
      { id: "en-IE-ConnorNeural", name: "Connor", lang: "English (IE)", gender: "Male" },
      { id: "en-IE-EmilyNeural", name: "Emily", lang: "English (IE)", gender: "Female" },
    ],
  },
  {
    label: "English · India",
    voices: [
      { id: "en-IN-PrabhatNeural", name: "Prabhat", lang: "English (IN)", gender: "Male" },
      { id: "en-IN-NeerjaNeural", name: "Neerja", lang: "English (IN)", gender: "Female" },
      { id: "en-IN-NeerjaExpressiveNeural", name: "Neerja Expressive", lang: "English (IN)", gender: "Female" },
    ],
  },
  {
    label: "English · Africa & Asia",
    voices: [
      { id: "en-ZA-LukeNeural", name: "Luke", lang: "English (ZA)", gender: "Male" },
      { id: "en-ZA-LeahNeural", name: "Leah", lang: "English (ZA)", gender: "Female" },
      { id: "en-NG-AbeoNeural", name: "Abeo", lang: "English (NG)", gender: "Male" },
      { id: "en-NG-EzinneNeural", name: "Ezinne", lang: "English (NG)", gender: "Female" },
      { id: "en-KE-ChilembaNeural", name: "Chilemba", lang: "English (KE)", gender: "Male" },
      { id: "en-KE-AsiliaNeural", name: "Asilia", lang: "English (KE)", gender: "Female" },
      { id: "en-TZ-ElimuNeural", name: "Elimu", lang: "English (TZ)", gender: "Male" },
      { id: "en-TZ-ImaniNeural", name: "Imani", lang: "English (TZ)", gender: "Female" },
      { id: "en-SG-WayneNeural", name: "Wayne", lang: "English (SG)", gender: "Male" },
      { id: "en-SG-LunaNeural", name: "Luna", lang: "English (SG)", gender: "Female" },
      { id: "en-PH-JamesNeural", name: "James", lang: "English (PH)", gender: "Male" },
      { id: "en-PH-RosaNeural", name: "Rosa", lang: "English (PH)", gender: "Female" },
      { id: "en-HK-SamNeural", name: "Sam", lang: "English (HK)", gender: "Male" },
      { id: "en-HK-YanNeural", name: "Yan", lang: "English (HK)", gender: "Female" },
    ],
  },
  {
    label: "Urdu",
    voices: [
      { id: "ur-PK-AsadNeural", name: "Asad", lang: "Urdu (PK)", gender: "Male" },
      { id: "ur-PK-UzmaNeural", name: "Uzma", lang: "Urdu (PK)", gender: "Female" },
      { id: "ur-IN-SalmanNeural", name: "Salman", lang: "Urdu (IN)", gender: "Male" },
      { id: "ur-IN-GulNeural", name: "Gul", lang: "Urdu (IN)", gender: "Female" },
    ],
  },
  {
    label: "Hindi",
    voices: [
      { id: "hi-IN-MadhurNeural", name: "Madhur", lang: "Hindi (IN)", gender: "Male" },
      { id: "hi-IN-SwaraNeural", name: "Swara", lang: "Hindi (IN)", gender: "Female" },
    ],
  },
  {
    label: "South Asian languages",
    voices: [
      { id: "bn-BD-PradeepNeural", name: "Pradeep", lang: "Bengali (BD)", gender: "Male" },
      { id: "bn-BD-NabanitaNeural", name: "Nabanita", lang: "Bengali (BD)", gender: "Female" },
      { id: "bn-IN-BashkarNeural", name: "Bashkar", lang: "Bengali (IN)", gender: "Male" },
      { id: "bn-IN-TanishaaNeural", name: "Tanishaa", lang: "Bengali (IN)", gender: "Female" },
      { id: "ta-IN-ValluvarNeural", name: "Valluvar", lang: "Tamil (IN)", gender: "Male" },
      { id: "ta-IN-PallaviNeural", name: "Pallavi", lang: "Tamil (IN)", gender: "Female" },
      { id: "te-IN-MohanNeural", name: "Mohan", lang: "Telugu (IN)", gender: "Male" },
      { id: "te-IN-ShrutiNeural", name: "Shruti", lang: "Telugu (IN)", gender: "Female" },
      { id: "mr-IN-ManoharNeural", name: "Manohar", lang: "Marathi (IN)", gender: "Male" },
      { id: "mr-IN-AarohiNeural", name: "Aarohi", lang: "Marathi (IN)", gender: "Female" },
      { id: "gu-IN-NiranjanNeural", name: "Niranjan", lang: "Gujarati (IN)", gender: "Male" },
      { id: "gu-IN-DhwaniNeural", name: "Dhwani", lang: "Gujarati (IN)", gender: "Female" },
      { id: "kn-IN-GaganNeural", name: "Gagan", lang: "Kannada (IN)", gender: "Male" },
      { id: "kn-IN-SapnaNeural", name: "Sapna", lang: "Kannada (IN)", gender: "Female" },
      { id: "ml-IN-MidhunNeural", name: "Midhun", lang: "Malayalam (IN)", gender: "Male" },
      { id: "ml-IN-SobhanaNeural", name: "Sobhana", lang: "Malayalam (IN)", gender: "Female" },
      { id: "ne-NP-SagarNeural", name: "Sagar", lang: "Nepali (NP)", gender: "Male" },
      { id: "ne-NP-HemkalaNeural", name: "Hemkala", lang: "Nepali (NP)", gender: "Female" },
      { id: "si-LK-SameeraNeural", name: "Sameera", lang: "Sinhala (LK)", gender: "Male" },
      { id: "si-LK-ThiliniNeural", name: "Thilini", lang: "Sinhala (LK)", gender: "Female" },
    ],
  },
  {
    label: "Arabic & Persian",
    voices: [
      { id: "ar-SA-HamedNeural", name: "Hamed", lang: "Arabic (SA)", gender: "Male" },
      { id: "ar-SA-ZariyahNeural", name: "Zariyah", lang: "Arabic (SA)", gender: "Female" },
      { id: "ar-EG-ShakirNeural", name: "Shakir", lang: "Arabic (EG)", gender: "Male" },
      { id: "ar-EG-SalmaNeural", name: "Salma", lang: "Arabic (EG)", gender: "Female" },
      { id: "ar-AE-HamdanNeural", name: "Hamdan", lang: "Arabic (AE)", gender: "Male" },
      { id: "ar-AE-FatimaNeural", name: "Fatima", lang: "Arabic (AE)", gender: "Female" },
      { id: "fa-IR-FaridNeural", name: "Farid", lang: "Persian (IR)", gender: "Male" },
      { id: "fa-IR-DilaraNeural", name: "Dilara", lang: "Persian (IR)", gender: "Female" },
    ],
  },
  {
    label: "Turkish",
    voices: [
      { id: "tr-TR-AhmetNeural", name: "Ahmet", lang: "Turkish (TR)", gender: "Male" },
      { id: "tr-TR-EmelNeural", name: "Emel", lang: "Turkish (TR)", gender: "Female" },
    ],
  },
  {
    label: "Spanish",
    voices: [
      { id: "es-ES-AlvaroNeural", name: "Alvaro", lang: "Spanish (ES)", gender: "Male" },
      { id: "es-ES-ElviraNeural", name: "Elvira", lang: "Spanish (ES)", gender: "Female" },
      { id: "es-ES-XimenaNeural", name: "Ximena", lang: "Spanish (ES)", gender: "Female" },
      { id: "es-MX-JorgeNeural", name: "Jorge", lang: "Spanish (MX)", gender: "Male" },
      { id: "es-MX-DaliaNeural", name: "Dalia", lang: "Spanish (MX)", gender: "Female" },
      { id: "es-US-AlonsoNeural", name: "Alonso", lang: "Spanish (US)", gender: "Male" },
      { id: "es-US-PalomaNeural", name: "Paloma", lang: "Spanish (US)", gender: "Female" },
    ],
  },
  {
    label: "French",
    voices: [
      { id: "fr-FR-HenriNeural", name: "Henri", lang: "French (FR)", gender: "Male" },
      { id: "fr-FR-DeniseNeural", name: "Denise", lang: "French (FR)", gender: "Female" },
      { id: "fr-FR-EloiseNeural", name: "Eloise", lang: "French (FR)", gender: "Female" },
      { id: "fr-CA-AntoineNeural", name: "Antoine", lang: "French (CA)", gender: "Male" },
      { id: "fr-CA-SylvieNeural", name: "Sylvie", lang: "French (CA)", gender: "Female" },
    ],
  },
  {
    label: "German",
    voices: [
      { id: "de-DE-ConradNeural", name: "Conrad", lang: "German (DE)", gender: "Male" },
      { id: "de-DE-KatjaNeural", name: "Katja", lang: "German (DE)", gender: "Female" },
      { id: "de-DE-KillianNeural", name: "Killian", lang: "German (DE)", gender: "Male" },
      { id: "de-DE-AmalaNeural", name: "Amala", lang: "German (DE)", gender: "Female" },
    ],
  },
  {
    label: "Italian",
    voices: [
      { id: "it-IT-DiegoNeural", name: "Diego", lang: "Italian (IT)", gender: "Male" },
      { id: "it-IT-ElsaNeural", name: "Elsa", lang: "Italian (IT)", gender: "Female" },
      { id: "it-IT-IsabellaNeural", name: "Isabella", lang: "Italian (IT)", gender: "Female" },
    ],
  },
  {
    label: "Portuguese",
    voices: [
      { id: "pt-BR-AntonioNeural", name: "Antonio", lang: "Portuguese (BR)", gender: "Male" },
      { id: "pt-BR-FranciscaNeural", name: "Francisca", lang: "Portuguese (BR)", gender: "Female" },
      { id: "pt-PT-DuarteNeural", name: "Duarte", lang: "Portuguese (PT)", gender: "Male" },
      { id: "pt-PT-RaquelNeural", name: "Raquel", lang: "Portuguese (PT)", gender: "Female" },
    ],
  },
  {
    label: "Dutch, Swedish & Polish",
    voices: [
      { id: "nl-NL-MaartenNeural", name: "Maarten", lang: "Dutch (NL)", gender: "Male" },
      { id: "nl-NL-ColetteNeural", name: "Colette", lang: "Dutch (NL)", gender: "Female" },
      { id: "sv-SE-MattiasNeural", name: "Mattias", lang: "Swedish (SE)", gender: "Male" },
      { id: "sv-SE-SofieNeural", name: "Sofie", lang: "Swedish (SE)", gender: "Female" },
      { id: "pl-PL-MarekNeural", name: "Marek", lang: "Polish (PL)", gender: "Male" },
      { id: "pl-PL-ZofiaNeural", name: "Zofia", lang: "Polish (PL)", gender: "Female" },
    ],
  },
  {
    label: "Russian, Ukrainian & Greek",
    voices: [
      { id: "ru-RU-DmitryNeural", name: "Dmitry", lang: "Russian (RU)", gender: "Male" },
      { id: "ru-RU-SvetlanaNeural", name: "Svetlana", lang: "Russian (RU)", gender: "Female" },
      { id: "uk-UA-OstapNeural", name: "Ostap", lang: "Ukrainian (UA)", gender: "Male" },
      { id: "uk-UA-PolinaNeural", name: "Polina", lang: "Ukrainian (UA)", gender: "Female" },
      { id: "el-GR-NestorasNeural", name: "Nestoras", lang: "Greek (GR)", gender: "Male" },
      { id: "el-GR-AthinaNeural", name: "Athina", lang: "Greek (GR)", gender: "Female" },
    ],
  },
  {
    label: "Japanese & Korean",
    voices: [
      { id: "ja-JP-KeitaNeural", name: "Keita", lang: "Japanese (JP)", gender: "Male" },
      { id: "ja-JP-NanamiNeural", name: "Nanami", lang: "Japanese (JP)", gender: "Female" },
      { id: "ko-KR-InJoonNeural", name: "In Joon", lang: "Korean (KR)", gender: "Male" },
      { id: "ko-KR-SunHiNeural", name: "Sun Hi", lang: "Korean (KR)", gender: "Female" },
    ],
  },
  {
    label: "Chinese",
    voices: [
      { id: "zh-CN-YunxiNeural", name: "Yunxi", lang: "Chinese (CN)", gender: "Male", note: "Lively, Sunshine" },
      { id: "zh-CN-XiaoxiaoNeural", name: "Xiaoxiao", lang: "Chinese (CN)", gender: "Female", note: "Warm" },
      { id: "zh-CN-YunyangNeural", name: "Yunyang", lang: "Chinese (CN)", gender: "Male", note: "Professional, Reliable" },
      { id: "zh-CN-XiaoyiNeural", name: "Xiaoyi", lang: "Chinese (CN)", gender: "Female", note: "Lively" },
      { id: "zh-TW-YunJheNeural", name: "Yun Jhe", lang: "Chinese (TW)", gender: "Male" },
      { id: "zh-TW-HsiaoChenNeural", name: "Hsiao Chen", lang: "Chinese (TW)", gender: "Female" },
      { id: "zh-HK-WanLungNeural", name: "Wan Lung", lang: "Chinese (HK)", gender: "Male" },
      { id: "zh-HK-HiuGaaiNeural", name: "Hiu Gaai", lang: "Chinese (HK)", gender: "Female" },
    ],
  },
  {
    label: "Southeast Asian languages",
    voices: [
      { id: "id-ID-ArdiNeural", name: "Ardi", lang: "Indonesian (ID)", gender: "Male" },
      { id: "id-ID-GadisNeural", name: "Gadis", lang: "Indonesian (ID)", gender: "Female" },
      { id: "ms-MY-OsmanNeural", name: "Osman", lang: "Malay (MY)", gender: "Male" },
      { id: "ms-MY-YasminNeural", name: "Yasmin", lang: "Malay (MY)", gender: "Female" },
      { id: "th-TH-NiwatNeural", name: "Niwat", lang: "Thai (TH)", gender: "Male" },
      { id: "th-TH-PremwadeeNeural", name: "Premwadee", lang: "Thai (TH)", gender: "Female" },
      { id: "vi-VN-NamMinhNeural", name: "Nam Minh", lang: "Vietnamese (VN)", gender: "Male" },
      { id: "vi-VN-HoaiMyNeural", name: "Hoai My", lang: "Vietnamese (VN)", gender: "Female" },
      { id: "fil-PH-AngeloNeural", name: "Angelo", lang: "Filipino (PH)", gender: "Male" },
      { id: "fil-PH-BlessicaNeural", name: "Blessica", lang: "Filipino (PH)", gender: "Female" },
    ],
  },
  {
    label: "Other",
    voices: [
      { id: "sw-KE-RafikiNeural", name: "Rafiki", lang: "Swahili (KE)", gender: "Male" },
      { id: "sw-KE-ZuriNeural", name: "Zuri", lang: "Swahili (KE)", gender: "Female" },
      { id: "af-ZA-WillemNeural", name: "Willem", lang: "Afrikaans (ZA)", gender: "Male" },
      { id: "af-ZA-AdriNeural", name: "Adri", lang: "Afrikaans (ZA)", gender: "Female" },
      { id: "he-IL-AvriNeural", name: "Avri", lang: "Hebrew (IL)", gender: "Male" },
      { id: "he-IL-HilaNeural", name: "Hila", lang: "Hebrew (IL)", gender: "Female" },
    ],
  },
];

export const VOICES: Voice[] = VOICE_GROUPS.flatMap((g) => g.voices);

export const DEFAULT_VOICE = "en-US-AndrewNeural";

/**
 * Hard cap on input length. Roughly 950 characters of English is one minute
 * of speech, so 40,000 characters is about 40 minutes of audio. Keep in sync
 * with TTS_MAX_CHARS in backend/main.py.
 */
export const MAX_CHARS = 40_000;

/** Characters per minute of speech, used for the duration estimate. */
export const CHARS_PER_MINUTE = 950;

/** Output bitrate of edge-tts MP3 (24 kHz, 48 kbps mono) in bytes/second. */
export const MP3_BYTES_PER_SECOND = 6_000;

const VOICE_IDS = new Set(VOICES.map((v) => v.id));

export function isVoiceId(value: unknown): value is string {
  return typeof value === "string" && VOICE_IDS.has(value);
}

export function voiceById(id: string): Voice {
  return VOICES.find((v) => v.id === id) ?? VOICES[0];
}
