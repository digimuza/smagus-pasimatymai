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
	lastPlayed?: string;
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
	currentQuestion: Question | null;
	currentSpicyCard: any | null;
	dismissSpicyCard: () => void;
	enabledSpicyCardTypes: string[];
	isCategoryActive: (categoryName: string) => boolean;
	isContentLimited: boolean;
	questionStates: QuestionState[];
	questions: Question[];
	resetProgress: () => void;
	sections: Section[];
	setAudience: (slug: string) => void;
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
