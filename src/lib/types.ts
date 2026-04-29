export interface Topic { id: string; name: string; desc: string; }
export interface TopicProgress { unlocked: boolean; mastered: boolean; level: number; correct: number; total: number; streak: number; bestStreak: number; }
export type SubjectProgress = Record<string, TopicProgress>;
export type GradeBand = "K-1" | "2-3" | "4-5";
export interface Parent { id: string; email: string; name: string; }
export interface Child { id: string; parent_id: string; name: string; pin: string; avatar: string; grade_band: GradeBand; learning_style: string; notes: string; interests: string; }
export interface ProgressRow { child_id: string; subject: string; topic_id: string; unlocked: boolean; mastered: boolean; level: number; correct: number; total: number; streak: number; best_streak: number; }
export interface SubjectConfig { label: string; icon: string; color: string; colorLight: string; colorMid: string; topics: Record<GradeBand, Topic[]>; }
export interface GeneratedQuestion { question: string; visual_hint: string; options: string[]; correct: number; explanation: string; encouragement: string; scene_illustration?: string; image_query?: string; audio_hint?: string; }
export interface QuestionRequest { profileName: string; gradeBand: GradeBand; learningStyle: string; notes: string; interests: string; subject: string; topicName: string; topicDesc: string; level: number; streak: number; totalAnswered: number; recentQuestions?: string[]; difficultyBoost?: number; }
