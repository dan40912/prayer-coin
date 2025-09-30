export const REPORT_REASONS = [
  { value: "spam_promotion", label: "廣告或垃圾訊息 (Spam)" },
  { value: "hate_speech_harassment", label: "仇恨言論或人身攻擊" },
  { value: "sexual_explicit", label: "色情、裸露或露骨內容" },
  { value: "violence_threat", label: "暴力或威脅內容" },
  { value: "false_info", label: "不實資訊或誤導性內容" },
  { value: "privacy_violation", label: "侵犯隱私" },
  { value: "other", label: "其他（請於備註說明）" },
];

export const REPORT_REASON_SET = new Set(REPORT_REASONS.map((item) => item.value));
