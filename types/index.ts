export interface Question {
	id: number;
	question: string;
}

export interface Section {
	name: string;
	questions: Question[];
	range: string;
	type: "safe" | "intimate";
}

export interface QuestionData {
	hasMore: boolean;
	sections: Section[];
	title: string;
	total_questions: number;
}

export type QuestionStatus = "new" | "skipped" | "answered" | "superliked";

export interface QuestionState {
	answeredAt?: string;
	id: number;
	status: QuestionStatus;
}

export interface AppState {
	activeCategories: string[];
	audience?: string | null;
	currentQuestionId: number | null;
	inviteToken?: string | null;
	lastPlayed?: string;
	pairedSessionId?: string | null;
	questionStates: QuestionState[];
	spicyCardsEnabled?: boolean;
	spicyCardsRarity?: string;
	spicyCardTypes?: string[];
}

export interface QuestionContextType {
	activeCategories: string[];
	answerQuestion: () => void;
	audience: string | null;
	availableQuestionsCount: number;
	clearPairedSession: () => void;
	currentQuestion: Question | null;
	currentSpicyCard: import("./spicyCards").SpicyCard | null;
	dismissSpicyCard: () => void;
	enabledSpicyCardTypes: string[];
	inviteToken: string | null;
	isCategoryActive: (categoryName: string) => boolean;
	isContentLimited: boolean;
	pairedSessionId: string | null;
	questionStates: QuestionState[];
	questions: Question[];
	resetProgress: () => void;
	sections: Section[];
	setAudience: (slug: string) => void;
	setPairedSession: (sessionId: string, token: string) => void;
	setShowPaywall: (show: boolean) => void;
	showPaywall: boolean;
	skipQuestion: () => void;
	spicyCardsEnabled: boolean;
	spicyCardsRarity: string;
	superlikedQuestions: Question[];
	superlikeQuestion: () => void;
	toggleCategory: (categoryName: string) => void;
	toggleSpicyCards: (enabled: boolean) => void;
	toggleSpicyCardType: (type: string) => void;
	updateQuestionState: (questionId: number, status: QuestionStatus) => void;
	updateSpicyCardsRarity: (rarity: string) => void;
}
